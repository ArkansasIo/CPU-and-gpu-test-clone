import React, { useState, useEffect, useMemo } from 'react';
import { SpuEmulator, EmulatorState } from '../simulator/spu_emulator';
import { NumberFormat } from '../types/cell';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  StepForward, 
  Cpu, 
  Database, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  Flame, 
  Sliders,
  Sparkles
} from 'lucide-react';

const PRESET_PROGRAMS: { name: string; description: string; code: string }[] = [
  {
    name: '4x4 Matrix Vector Multiply',
    description: 'Even/Odd dual-issue pipeline test multiplying 4-element vector by 4x4 transform matrix',
    code: `/* Initializing Matrix Rows in $r4-$r7 and Vector in $r3 */
rotqby  $r9, $r3, 0        # Odd Pipe: Splat X component
fm      $r8, $r4, $r9      # Even Pipe: $r8 = Row0 * X
rotqby  $r10, $r3, 4       # Odd Pipe: Splat Y component
fma     $r8, $r5, $r10, $r8 # Even Pipe: $r8 += Row1 * Y
rotqby  $r11, $r3, 8       # Odd Pipe: Splat Z component
fma     $r8, $r6, $r11, $r8 # Even Pipe: $r8 += Row2 * Z
rotqby  $r12, $r3, 12      # Odd Pipe: Splat W component
fma     $r3, $r7, $r12, $r8 # Even Pipe: $r3 = Result vector
stop    0x2000             # Halt execution and signal PPE host`
  },
  {
    name: 'Vector Floating Point Arithmetic',
    description: 'Tests 4-lane single precision vector add, multiply, and fused multiply-add',
    code: `/* Vector Math demonstration on SPU 128-bit registers */
fa      $r3, $r1, $r2      # $r3 = $r1 + $r2 (4 single-precision floats)
fm      $r4, $r3, $r2      # $r4 = $r3 * $r2
fma     $r5, $r4, $r1, $r3 # $r5 = ($r4 * $r1) + $r3 (Fused Multiply-Add)
fs      $r6, $r5, $r2      # $r6 = $r5 - $r2
stop    0x0001             # Halt`
  },
  {
    name: 'MFC DMA Channel & Mailbox Sync',
    description: 'Simulates channel communication, tag mask setup, and outbound mailbox notification to PPE',
    code: `/* Channel writes to Memory Flow Controller */
wrch    22, $r3            # Set MFC_WrTagMask to tag in $r3
wrch    28, $r4            # Write 0xC0FFEE to SPU Outbound Mailbox (SPU_WrOutMbox)
rdch    $r5, 24            # Read MFC_RdTagStat into $r5
stop    0x0002`
  }
];

interface SpuSimulatorViewProps {
  initialCode?: string;
}

export const SpuSimulatorView: React.FC<SpuSimulatorViewProps> = ({ initialCode }) => {
  const [emulator] = useState(() => new SpuEmulator());
  const [assemblyCode, setAssemblyCode] = useState(initialCode || PRESET_PROGRAMS[0].code);
  const [simState, setSimState] = useState<EmulatorState>(() => emulator.getState());
  const [numFormat, setNumFormat] = useState<NumberFormat>('float');
  const [lsOffset, setLsOffset] = useState<number>(0);
  const [autoRun, setAutoRun] = useState<boolean>(false);

  // Initialize registers with sensible test data for demo
  const resetWithTestData = (codeToLoad: string) => {
    emulator.loadProgram(codeToLoad);
    // Set $r3 (input vector) = [1.0, 2.0, 3.0, 1.0]
    emulator.setRegisterFloat(3, [1.0, 2.0, 3.0, 1.0]);
    // Set $r4 (Matrix row 0) = [1.0, 0.0, 0.0, 0.0]
    emulator.setRegisterFloat(4, [1.0, 0.0, 0.0, 0.0]);
    // Set $r5 (Matrix row 1) = [0.0, 1.0, 0.0, 0.0]
    emulator.setRegisterFloat(5, [0.0, 1.0, 0.0, 0.0]);
    // Set $r6 (Matrix row 2) = [0.0, 0.0, 1.0, 0.0]
    emulator.setRegisterFloat(6, [0.0, 0.0, 1.0, 0.0]);
    // Set $r7 (Matrix row 3) = [10.0, 20.0, 30.0, 1.0]
    emulator.setRegisterFloat(7, [10.0, 20.0, 30.0, 1.0]);

    // Set $r1, $r2 for general math
    emulator.setRegisterFloat(1, [2.5, 4.0, 1.25, 10.0]);
    emulator.setRegisterFloat(2, [0.5, 2.0, 4.0, 0.1]);

    // Outbound mailbox test value
    emulator.setRegisterHex(4, [0, 0, 0, 0xC0FFEE01]);

    setSimState(emulator.getState());
  };

  useEffect(() => {
    if (initialCode) {
      setAssemblyCode(initialCode);
      resetWithTestData(initialCode);
    } else {
      resetWithTestData(assemblyCode);
    }
  }, [initialCode]);

  const handlePresetSelect = (code: string) => {
    setAssemblyCode(code);
    resetWithTestData(code);
  };

  const handleStep = () => {
    emulator.step();
    setSimState(emulator.getState());
  };

  const handleReset = () => {
    setAutoRun(false);
    resetWithTestData(assemblyCode);
  };

  useEffect(() => {
    let timer: any = null;
    if (autoRun && simState.status === 'running') {
      timer = setInterval(() => {
        const keepGoing = emulator.step();
        setSimState(emulator.getState());
        if (!keepGoing) setAutoRun(false);
      }, 200);
    }
    return () => clearInterval(timer);
  }, [autoRun, simState.status]);

  // Convert raw 32-bit uints into display strings
  const formatValue = (vals: [number, number, number, number], format: NumberFormat) => {
    if (format === 'hex') {
      return vals.map(v => '0x' + (v >>> 0).toString(16).padStart(8, '0').toUpperCase()).join(' ');
    }
    if (format === 'float') {
      const fView = new Float32Array(1);
      const uView = new Uint32Array(fView.buffer);
      return vals.map(v => {
        uView[0] = v;
        const f = fView[0];
        return isNaN(f) ? 'NaN' : f.toFixed(2);
      }).join(', ');
    }
    if (format === 'int32') {
      return vals.map(v => (v | 0).toString()).join(', ');
    }
    return vals.map(v => (v >>> 0).toString()).join(', ');
  };

  // Compute dual issue statistics
  const dualIssueCount = simState.traces.filter(t => t.evenPipe && t.oddPipe).length;
  const totalInstructionsIssued = simState.traces.reduce((acc, t) => acc + (t.evenPipe ? 1 : 0) + (t.oddPipe ? 1 : 0), 0);
  const ipc = simState.cycleCount > 0 ? (totalInstructionsIssued / simState.cycleCount).toFixed(2) : '0.00';

  // Read Local Store 16-byte lines for viewer
  const localStoreRows = useMemo(() => {
    const rows = [];
    const view = new DataView(simState.localStore.buffer);
    for (let i = 0; i < 8; i++) {
      const addr = (lsOffset + i * 16) & 0x3FFF0;
      const words: string[] = [];
      let ascii = '';
      for (let w = 0; w < 4; w++) {
        const u = view.getUint32(addr + w * 4, false);
        words.push(u.toString(16).padStart(8, '0').toUpperCase());
      }
      for (let b = 0; b < 16; b++) {
        const byteVal = simState.localStore[addr + b];
        ascii += (byteVal >= 32 && byteVal <= 126) ? String.fromCharCode(byteVal) : '.';
      }
      rows.push({ addr, hex: words.join(' '), ascii });
    }
    return rows;
  }, [simState.localStore, lsOffset]);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-105px)] bg-slate-950 overflow-y-auto">
      {/* Top Simulator Control Bar */}
      <div className="border-b border-slate-800 bg-slate-900/70 px-4 py-3 flex items-center justify-between flex-wrap gap-4 sticky top-0 z-20 backdrop-blur">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono font-bold text-white uppercase">SPU Core #0 (128-bit SIMD)</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500">PC:</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
              0x{simState.pc.toString(16).padStart(5, '0').toUpperCase()}
            </span>

            <span className="text-slate-500 ml-2">CYCLES:</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
              {simState.cycleCount}
            </span>

            <span className="text-slate-500 ml-2">STATUS:</span>
            <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold uppercase ${
              simState.status === 'running' 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                : simState.status === 'stopped' 
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {simState.status}
            </span>
          </div>
        </div>

        {/* Execution Controls */}
        <div className="flex items-center gap-2">
          <button
            id="sim-btn-step"
            onClick={handleStep}
            disabled={simState.status === 'stopped'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-semibold transition-all disabled:opacity-40"
            title="Execute 1 clock cycle (up to 2 dual-issued instructions)"
          >
            <StepForward className="w-3.5 h-3.5" />
            <span>Step Cycle</span>
          </button>

          <button
            id="sim-btn-run"
            onClick={() => {
              if (simState.status === 'ready') setSimState(prev => ({ ...prev, status: 'running' }));
              setAutoRun(!autoRun);
            }}
            disabled={simState.status === 'stopped'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all ${
              autoRun
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {autoRun ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{autoRun ? 'Pause' : 'Continuous Run'}</span>
          </button>

          <button
            id="sim-btn-reset"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-mono transition-all"
            title="Reset registers and local store"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Code Editor & Registers */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
        {/* Left Column: Assembly Code & Pipeline Monitor (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Preset Selector */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 space-y-2">
            <label className="text-xs font-mono text-slate-400 flex items-center justify-between">
              <span>LOAD ARCHITECTURAL MICROCODE BENCHMARK</span>
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {PRESET_PROGRAMS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetSelect(preset.code)}
                  className="w-full text-left p-2 rounded bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800/80 transition-all group"
                >
                  <div className="text-xs font-semibold text-cyan-300 font-sans group-hover:text-cyan-200">
                    {preset.name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono truncate">
                    {preset.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* SPU Assembly Code Editor */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-lg flex flex-col flex-1 min-h-[220px]">
            <div className="border-b border-slate-800 px-3 py-2 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>ASSEMBLY SOURCE (128-BIT QUADWORD SIMD)</span>
              <button
                onClick={() => resetWithTestData(assemblyCode)}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                Reload into SPU
              </button>
            </div>
            <textarea
              id="sim-assembly-input"
              value={assemblyCode}
              onChange={(e) => setAssemblyCode(e.target.value)}
              spellCheck={false}
              className="flex-1 w-full bg-transparent text-slate-200 font-mono text-xs p-3 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Dual-Issue Pipeline Performance Badge */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 grid grid-cols-3 gap-2 text-center font-mono text-xs">
            <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block uppercase">Dual-Issue Cycles</span>
              <span className="text-sm font-bold text-cyan-400">{dualIssueCount}</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block uppercase">Instr / Cycle (IPC)</span>
              <span className="text-sm font-bold text-emerald-400">{ipc}</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block uppercase">Peak Bandwidth</span>
              <span className="text-sm font-bold text-amber-400">25.6 GB/s</span>
            </div>
          </div>
        </div>

        {/* Right Column: 128-bit Register File & Memory Flow (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Registers Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg flex flex-col">
            <div className="border-b border-slate-800 px-3 py-2 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-white">SPU 128-BIT UNIFIED REGISTER FILE</span>
                <span className="text-slate-500">($r0 - $r31 shown)</span>
              </div>

              {/* Format Switcher */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800">
                {(['float', 'hex', 'int32'] as NumberFormat[]).map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => setNumFormat(fmt)}
                    className={`px-2 py-0.5 rounded text-[11px] uppercase transition-all ${
                      numFormat === fmt
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Register Rows */}
            <div className="max-h-[300px] overflow-y-auto p-2 divide-y divide-slate-800/60 font-mono text-xs">
              {simState.activeRegisters.slice(0, 16).map(reg => {
                const isNonZero = reg.values.some(v => v !== 0);
                return (
                  <div
                    key={reg.id}
                    className={`py-1.5 px-2 flex items-center justify-between gap-2 hover:bg-slate-800/40 rounded transition-colors ${
                      isNonZero ? 'bg-cyan-950/10' : ''
                    }`}
                  >
                    <div className="w-20 font-bold text-cyan-400 flex items-center gap-1">
                      <span>{reg.name}</span>
                    </div>

                    <div className="flex-1 font-mono text-right text-slate-300 truncate">
                      {numFormat === 'float' && (
                        <span className="text-emerald-300">[{formatValue(reg.values, 'float')}]</span>
                      )}
                      {numFormat === 'hex' && (
                        <span className="text-amber-300 text-[11px]">{formatValue(reg.values, 'hex')}</span>
                      )}
                      {numFormat === 'int32' && (
                        <span className="text-sky-300">[{formatValue(reg.values, 'int32')}]</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Local Store (256 KB) & MFC Channels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 256KB Local Store Hex Dump */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg flex flex-col">
              <div className="border-b border-slate-800 px-3 py-2 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span>LOCAL STORE (256 KB)</span>
                </div>
                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    onClick={() => setLsOffset(Math.max(0, lsOffset - 128))}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    ◄ Prev
                  </button>
                  <button
                    onClick={() => setLsOffset(Math.min(0x3FF00, lsOffset + 128))}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    Next ►
                  </button>
                </div>
              </div>

              <div className="p-2 font-mono text-[11px] space-y-1 overflow-x-auto">
                {localStoreRows.map(row => (
                  <div key={row.addr} className="flex items-center gap-2 text-slate-400">
                    <span className="text-slate-600 font-semibold">0x{row.addr.toString(16).padStart(5, '0')}:</span>
                    <span className="text-slate-300">{row.hex}</span>
                    <span className="text-slate-500 pl-2">|{row.ascii}|</span>
                  </div>
                ))}
              </div>
            </div>

            {/* MFC Channels & Mailbox Monitor */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 flex flex-col justify-between font-mono text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  MFC DMA & MAILBOX REGISTERS
                </span>
                <span className="text-[10px] text-slate-500">HW CHANNELS</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-1.5 rounded bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400">Ch 28: SPU Out Mailbox</span>
                  <span className="text-amber-400 font-bold">
                    0x{simState.outboundMailbox.toString(16).padStart(8, '0').toUpperCase()}
                  </span>
                </div>

                <div className="flex justify-between items-center p-1.5 rounded bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400">Ch 24: MFC Tag Status</span>
                  <span className="text-cyan-400 font-bold">
                    0x{simState.tagStatus.toString(16).padStart(8, '0').toUpperCase()}
                  </span>
                </div>

                <div className="flex justify-between items-center p-1.5 rounded bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400">Active DMA Queue</span>
                  <span className="text-emerald-400 font-bold">
                    {simState.dmaQueue.length} Pending Commands
                  </span>
                </div>
              </div>

              <button
                id="sim-btn-trigger-dma"
                onClick={() => emulator.triggerDMA(0, 0x0000, 0x10000, 128, 'GET')}
                className="w-full py-1.5 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold text-xs transition-all"
              >
                Simulate DMA Host-to-SPU Transfer
              </button>
            </div>
          </div>

          {/* Cycle Trace History */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
            <div className="text-xs font-mono text-slate-400 mb-2 font-semibold">
              EXECUTION CYCLE TRACE (DUAL-ISSUE HISTORY)
            </div>
            <div className="max-h-28 overflow-y-auto space-y-1 font-mono text-xs">
              {simState.traces.length === 0 ? (
                <div className="text-slate-600 text-xs py-2 text-center">No cycles executed yet. Click "Step Cycle" to begin.</div>
              ) : (
                simState.traces.map((trace, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px] p-1 rounded hover:bg-slate-800/30">
                    <span className="text-slate-500">Cycle #{trace.cycle} [PC: 0x{trace.pc.toString(16)}]</span>
                    <div className="flex items-center gap-2">
                      {trace.evenPipe && <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50">Even: {trace.evenPipe}</span>}
                      {trace.oddPipe && <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/50">Odd: {trace.oddPipe}</span>}
                      <span className="text-slate-500 text-[10px]">{trace.comment}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
