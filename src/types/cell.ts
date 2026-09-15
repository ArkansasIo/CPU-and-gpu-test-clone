/**
 * PlayStation 3 Cell Broadband Engine Architecture Types & Definitions
 */

export interface SourceFile {
  id: string;
  name: string;
  path: string;
  category: 'spe' | 'ppe' | 'bus' | 'mmu' | 'rsx' | 'memory' | 'io' | 'samples' | 'hdl' | 'build' | 'ps3' | 'ps4' | 'ps5' | 'xbox360' | 'xboxone' | 'switch' | 'ps2' | 'pc' | 'os' | 'cpu' | 'gpu' | 'components' | 'future';
  platform?: 'ps3' | 'ps4' | 'ps5' | 'xbox360' | 'xboxone' | 'switch' | 'ps2' | 'pc' | 'shared' | 'future';
  language: 'cpp' | 'c' | 'assembly' | 'verilog' | 'header' | 'cmake' | 'makefile';
  description: string;
  content: string;
  sizeBytes?: number;
  readOnly?: boolean;
}

export type NumberFormat = 'hex' | 'float' | 'int32' | 'uint16' | 'uint8';

export interface SpuRegister {
  id: number;
  name: string;
  // 128-bit stored as 4 x 32-bit unsigned integers
  values: [number, number, number, number];
}

export interface PipelineSlot {
  instruction: string;
  pipe: 'even' | 'odd' | 'stall';
  unit: string;
  latency: number;
}

export interface CycleTrace {
  cycle: number;
  pc: number;
  evenPipe?: string;
  oddPipe?: string;
  comment?: string;
}

export interface DmaCommand {
  tag: number;
  lsa: number;      // Local Store Address (18-bit, 0x00000 - 0x3FFFF)
  ea: number;       // Effective Address in Main Memory
  size: number;     // Transfer size (1-16384 bytes, 16-byte aligned)
  type: 'GET' | 'PUT' | 'GETL' | 'PUTL' | 'BARRIER';
  status: 'queued' | 'in_flight' | 'completed';
}

export interface EibPacket {
  id: string;
  fromNode: string;
  toNode: string;
  ring: 0 | 1 | 2 | 3;
  progress: number; // 0 to 1
  bytes: number;
  tag: number;
}

export interface CellInstructionDef {
  mnemonic: string;
  fullName: string;
  pipe: 'Even' | 'Odd' | 'Both';
  unit: 'FX1' | 'FX2' | 'FP' | 'LS' | 'BR' | 'SHUF' | 'CTRL';
  latency: number;
  syntax: string;
  description: string;
  opcodeBin?: string;
}
