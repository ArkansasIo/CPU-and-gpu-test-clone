import { SpuRegister, CycleTrace, DmaCommand } from '../types/cell';

export interface EmulatorState {
  pc: number;
  cycleCount: number;
  status: 'running' | 'halted' | 'stopped' | 'ready';
  evenInstruction: string | null;
  oddInstruction: string | null;
  activeRegisters: SpuRegister[];
  traces: CycleTrace[];
  dmaQueue: DmaCommand[];
  outboundMailbox: number;
  inboundMailbox: number;
  tagStatus: number;
  localStore: Uint8Array; // 256KB
}

// Convert 32-bit float to/from uint32 bits
const floatView = new Float32Array(1);
const uintView = new Uint32Array(floatView.buffer);

function floatToBits(f: number): number {
  floatView[0] = f;
  return uintView[0];
}

function bitsToFloat(u: number): number {
  uintView[0] = u;
  return floatView[0];
}

export class SpuEmulator {
  private pc: number = 0;
  private cycleCount: number = 0;
  private status: 'running' | 'halted' | 'stopped' | 'ready' = 'ready';
  private registers: [number, number, number, number][] = [];
  private localStore: Uint8Array = new Uint8Array(256 * 1024);
  private traces: CycleTrace[] = [];
  private dmaQueue: DmaCommand[] = [];
  private outboundMailbox: number = 0;
  private inboundMailbox: number = 0;
  private tagStatus: number = 0;
  private tagMask: number = 0;

  // Parsed program lines
  private programLines: { pc: number; text: string; clean: string; lineNo: number }[] = [];

  constructor() {
    this.reset();
  }

  public reset() {
    this.pc = 0;
    this.cycleCount = 0;
    this.status = 'ready';
    this.registers = [];
    for (let i = 0; i < 128; i++) {
      this.registers.push([0, 0, 0, 0]);
    }
    // Set standard stack pointer $r1 to top of local store
    this.registers[1][3] = (256 * 1024) - 0x100;
    this.localStore.fill(0);
    this.traces = [];
    this.dmaQueue = [];
    this.outboundMailbox = 0;
    this.inboundMailbox = 0;
    this.tagStatus = 0;
    this.tagMask = 0;
  }

  public loadProgram(assemblyText: string) {
    this.reset();
    this.programLines = [];
    const lines = assemblyText.split('\n');
    let currentPc = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Skip empty or purely comment lines
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('.') || trimmed.endsWith(':')) {
        continue;
      }

      // Strip trailing comment
      const codeOnly = trimmed.split('#')[0].split('//')[0].trim();
      if (codeOnly) {
        this.programLines.push({
          pc: currentPc,
          text: line,
          clean: codeOnly,
          lineNo: i + 1
        });
        currentPc += 4;
      }
    }

    if (this.programLines.length > 0) {
      this.status = 'ready';
    }
  }

  public getPipe(mnemonic: string): 'even' | 'odd' {
    const oddMnemonic = ['rotqby', 'rotqbyi', 'shlqby', 'shufb', 'wrch', 'rdch', 'rchcnt', 'bi', 'bisl', 'brnz', 'brz', 'biz', 'binz', 'stop', 'hbr'];
    return oddMnemonic.includes(mnemonic.toLowerCase()) ? 'odd' : 'even';
  }

  private parseReg(token: string): number {
    if (!token) return 0;
    const clean = token.replace(/[\$,\s\(\)]/g, '').toLowerCase();
    if (clean.startsWith('r')) {
      const num = parseInt(clean.substring(1), 10);
      return isNaN(num) ? 0 : Math.min(127, Math.max(0, num));
    }
    if (clean === 'lr') return 0;
    if (clean === 'sp') return 1;
    const direct = parseInt(clean, 10);
    return isNaN(direct) ? 0 : direct & 0x7F;
  }

  public step(): boolean {
    if (this.status === 'halted' || this.status === 'stopped' || this.programLines.length === 0) {
      return false;
    }

    // Find instruction at current PC
    const currentIndex = this.programLines.findIndex(p => p.pc === this.pc);
    if (currentIndex < 0 || currentIndex >= this.programLines.length) {
      this.status = 'stopped';
      return false;
    }

    this.status = 'running';
    const instr0 = this.programLines[currentIndex];
    const pipe0 = this.getPipe(instr0.clean.split(/\s+/)[0]);

    let evenInstr: string | null = null;
    let oddInstr: string | null = null;
    let advancedInstructions = 1;

    // Check if next instruction can dual-issue (Even + Odd pair)
    const nextIndex = currentIndex + 1;
    if (nextIndex < this.programLines.length) {
      const instr1 = this.programLines[nextIndex];
      const pipe1 = this.getPipe(instr1.clean.split(/\s+/)[0]);

      if (pipe0 === 'even' && pipe1 === 'odd') {
        // Dual-issue!
        evenInstr = instr0.clean;
        oddInstr = instr1.clean;
        this.executeInstruction(instr0.clean);
        this.executeInstruction(instr1.clean);
        advancedInstructions = 2;
      } else {
        if (pipe0 === 'even') evenInstr = instr0.clean;
        else oddInstr = instr0.clean;
        this.executeInstruction(instr0.clean);
      }
    } else {
      if (pipe0 === 'even') evenInstr = instr0.clean;
      else oddInstr = instr0.clean;
      this.executeInstruction(instr0.clean);
    }

    this.cycleCount++;
    this.traces.unshift({
      cycle: this.cycleCount,
      pc: this.pc,
      evenPipe: evenInstr || undefined,
      oddPipe: oddInstr || undefined,
      comment: advancedInstructions === 2 ? 'Dual-Issue (2 instructions/cycle)' : 'Single Issue'
    });

    if (this.traces.length > 50) {
      this.traces.pop();
    }

    // Advance PC
    this.pc += advancedInstructions * 4;

    if (this.pc >= this.programLines[this.programLines.length - 1].pc + 4) {
      this.status = 'stopped';
    }

    return this.status === 'running';
  }

  private executeInstruction(cleanInstr: string) {
    const parts = cleanInstr.split(/[\s,]+/);
    const op = parts[0].toLowerCase();
    const rt = this.parseReg(parts[1]);
    const ra = this.parseReg(parts[2]);
    const rb = this.parseReg(parts[3]);
    const rc = this.parseReg(parts[4]);

    switch (op) {
      case 'stop': {
        this.status = 'stopped';
        break;
      }
      case 'nop': {
        break;
      }
      case 'fa': { // Floating Add (4 floats)
        const a = this.registers[ra];
        const b = this.registers[rb];
        for (let i = 0; i < 4; i++) {
          const fa = bitsToFloat(a[i]);
          const fb = bitsToFloat(b[i]);
          this.registers[rt][i] = floatToBits(fa + fb);
        }
        break;
      }
      case 'fs': { // Floating Subtract
        const a = this.registers[ra];
        const b = this.registers[rb];
        for (let i = 0; i < 4; i++) {
          const fa = bitsToFloat(a[i]);
          const fb = bitsToFloat(b[i]);
          this.registers[rt][i] = floatToBits(fa - fb);
        }
        break;
      }
      case 'fm': { // Floating Multiply
        const a = this.registers[ra];
        const b = this.registers[rb];
        for (let i = 0; i < 4; i++) {
          const fa = bitsToFloat(a[i]);
          const fb = bitsToFloat(b[i]);
          this.registers[rt][i] = floatToBits(fa * fb);
        }
        break;
      }
      case 'fma': { // Fused Multiply-Add: (ra * rb) + rc
        const a = this.registers[ra];
        const b = this.registers[rb];
        const c = this.registers[rc];
        for (let i = 0; i < 4; i++) {
          const fa = bitsToFloat(a[i]);
          const fb = bitsToFloat(b[i]);
          const fc = bitsToFloat(c[i]);
          this.registers[rt][i] = floatToBits(fa * fb + fc);
        }
        break;
      }
      case 'a': { // Integer Add
        const a = this.registers[ra];
        const b = this.registers[rb];
        for (let i = 0; i < 4; i++) {
          this.registers[rt][i] = (a[i] + b[i]) >>> 0;
        }
        break;
      }
      case 'ai': { // Add Immediate
        const a = this.registers[ra];
        const imm = parseInt(parts[3] || '0', 10) || 0;
        for (let i = 0; i < 4; i++) {
          this.registers[rt][i] = (a[i] + imm) >>> 0;
        }
        break;
      }
      case 'rotqby': { // Rotate Quadword by Bytes
        const a = this.registers[ra];
        const count = (parseInt(parts[3] || '0', 10) || 0) & 0x1F;
        // Simple 4-byte / float rotate
        const wordsToShift = Math.floor(count / 4) % 4;
        const newVals: [number, number, number, number] = [0, 0, 0, 0];
        for (let i = 0; i < 4; i++) {
          newVals[i] = a[(i + wordsToShift) % 4];
        }
        this.registers[rt] = newVals;
        break;
      }
      case 'lqd': { // Load Quadword
        const lsa = (this.registers[ra][3] + (parseInt(parts[3] || '0', 10) * 16)) & 0x3FFF0;
        const view = new DataView(this.localStore.buffer);
        for (let i = 0; i < 4; i++) {
          this.registers[rt][i] = view.getUint32(lsa + i * 4, false);
        }
        break;
      }
      case 'stqd': { // Store Quadword
        const lsa = (this.registers[ra][3] + (parseInt(parts[3] || '0', 10) * 16)) & 0x3FFF0;
        const view = new DataView(this.localStore.buffer);
        for (let i = 0; i < 4; i++) {
          view.setUint32(lsa + i * 4, this.registers[rt][i], false);
        }
        break;
      }
      case 'wrch': { // Write Channel
        const ch = parseInt(parts[1] || '0', 10);
        const val = this.registers[rt][3];
        if (ch === 28) this.outboundMailbox = val;
        if (ch === 22) this.tagMask = val;
        break;
      }
      case 'rdch': { // Read Channel
        const ch = parseInt(parts[2] || '0', 10);
        let val = 0;
        if (ch === 29) val = this.inboundMailbox;
        if (ch === 24) val = this.tagStatus & this.tagMask;
        this.registers[rt] = [0, 0, 0, val];
        break;
      }
      case 'bi': { // Branch indirect (e.g. $lr)
        this.status = 'stopped';
        break;
      }
    }
  }

  public setRegisterFloat(regIdx: number, val: [number, number, number, number]) {
    for (let i = 0; i < 4; i++) {
      this.registers[regIdx & 127][i] = floatToBits(val[i]);
    }
  }

  public setRegisterHex(regIdx: number, val: [number, number, number, number]) {
    for (let i = 0; i < 4; i++) {
      this.registers[regIdx & 127][i] = val[i] >>> 0;
    }
  }

  public getState(): EmulatorState {
    const activeRegisters: SpuRegister[] = [];
    // Show registers that are non-zero or common ABI registers ($r0 - $r15)
    for (let i = 0; i < 32; i++) {
      activeRegisters.push({
        id: i,
        name: i === 0 ? '$lr ($r0)' : i === 1 ? '$sp ($r1)' : `$r${i}`,
        values: [...this.registers[i]]
      });
    }

    return {
      pc: this.pc,
      cycleCount: this.cycleCount,
      status: this.status,
      evenInstruction: null,
      oddInstruction: null,
      activeRegisters,
      traces: [...this.traces],
      dmaQueue: [...this.dmaQueue],
      outboundMailbox: this.outboundMailbox,
      inboundMailbox: this.inboundMailbox,
      tagStatus: this.tagStatus,
      localStore: this.localStore
    };
  }

  public triggerDMA(tag: number, lsa: number, ea: number, size: number, type: 'GET' | 'PUT') {
    const cmd: DmaCommand = {
      tag,
      lsa: lsa & 0x3FFF0,
      ea,
      size,
      type,
      status: 'completed'
    };
    this.dmaQueue.push(cmd);
    this.tagStatus |= (1 << (tag & 31));

    // If GET, simulate populating local store with test data pattern
    if (type === 'GET') {
      for (let offset = 0; offset < size && (lsa + offset) < 256 * 1024; offset += 4) {
        const view = new DataView(this.localStore.buffer);
        view.setFloat32(lsa + offset, (offset / 4) * 0.5 + 1.0, false);
      }
    }
  }
}
