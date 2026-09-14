import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  RotateCcw, 
  Activity, 
  Network, 
  Zap, 
  Cpu, 
  HardDrive, 
  ArrowRight, 
  Layers, 
  Clock, 
  Database, 
  Flame, 
  Radio, 
  CheckCircle2, 
  Sliders,
  Maximize2,
  Minimize2,
  X
} from 'lucide-react';

export type BusArchitecture = 'eib' | 'intel_ring' | 'amd_if' | 'pcie5';

export interface InstructionStep {
  id: string;
  lineIndex?: number;
  assembly: string;
  opcode: string;
  operands: string;
  busType: BusArchitecture;
  sourceNode: string;
  destNode: string;
  sourceLabel: string;
  destLabel: string;
  ringOrChannel: string;
  ringIndex?: number; // 0, 1 = CW; 2, 3 = CCW
  direction?: 'cw' | 'ccw' | 'direct' | 'bidirectional';
  hops: number;
  transferBytes: number;
  transferType: 'Quadword (16B)' | 'Cache Line (128B)' | 'DMA Burst (16KB)' | 'DMA Chunk (4KB)' | 'Register Direct';
  latencyCycles: number;
  pipelineUnit: 'Even Pipe (FXU/FPU)' | 'Odd Pipe (Permute/LS)' | 'MFC DMA Controller' | 'Ring Stop Agent' | 'Fabric Crossbar';
  description: string;
  hardwareDetail: string;
  registersAffected?: { name: string; value: string }[];
}

// Predefined multi-instruction architectural trace routines
export const PRESET_ROUTINES: { id: string; title: string; bus: BusArchitecture; description: string; steps: InstructionStep[] }[] = [
  {
    id: 'cell_dma_double_buffer',
    title: 'PS3 Cell SPU DMA Ping-Pong Streaming (EIB + MFC)',
    bus: 'eib',
    description: 'Classic PS3 Cell Broadband Engine asynchronous DMA double-buffering fetching from Rambus XDR to SPE0 Local Store and pushing back to RSX via FlexIO.',
    steps: [
      {
        id: 'step-1',
        assembly: 'wrch $MFC_LSA, $r3',
        opcode: 'wrch',
        operands: '$MFC_LSA, $r3',
        busType: 'eib',
        sourceNode: 'spe0_core',
        destNode: 'spe0_mfc',
        sourceLabel: 'SPE 0 SPU Core',
        destLabel: 'SPE 0 MFC (Local)',
        ringOrChannel: 'Internal MFC Channel 16',
        direction: 'direct',
        hops: 0,
        transferBytes: 4,
        transferType: 'Register Direct',
        latencyCycles: 6,
        pipelineUnit: 'Odd Pipe (Permute/LS)',
        description: 'Writes the 18-bit Local Store Address (LSA = 0x04000, 16-byte aligned) into Channel 16.',
        hardwareDetail: 'SPU channel write instruction latches target buffer address in Local Store into the MFC DMA parameter register.',
        registersAffected: [{ name: 'MFC_LSA', value: '0x00004000' }, { name: '$r3', value: '0x00004000' }]
      },
      {
        id: 'step-2',
        assembly: 'wrch $MFC_EAL, $r4',
        opcode: 'wrch',
        operands: '$MFC_EAL, $r4',
        busType: 'eib',
        sourceNode: 'spe0_core',
        destNode: 'spe0_mfc',
        sourceLabel: 'SPE 0 SPU Core',
        destLabel: 'SPE 0 MFC (Local)',
        ringOrChannel: 'Internal MFC Channel 18',
        direction: 'direct',
        hops: 0,
        transferBytes: 4,
        transferType: 'Register Direct',
        latencyCycles: 6,
        pipelineUnit: 'Odd Pipe (Permute/LS)',
        description: 'Writes 32-bit Effective Address Low (EAL = 0x10000000) pointing to main XDR DRAM.',
        hardwareDetail: 'Prepares the 64-bit Effective Address for translation by the PPE MMU / SPE TLB before issuing EIB bus commands.',
        registersAffected: [{ name: 'MFC_EAL', value: '0x10000000' }, { name: '$r4', value: '0x10000000' }]
      },
      {
        id: 'step-3',
        assembly: 'wrch $MFC_Size, $r5',
        opcode: 'wrch',
        operands: '$MFC_Size, $r5',
        busType: 'eib',
        sourceNode: 'spe0_core',
        destNode: 'spe0_mfc',
        sourceLabel: 'SPE 0 SPU Core',
        destLabel: 'SPE 0 MFC (Local)',
        ringOrChannel: 'Internal MFC Channel 19',
        direction: 'direct',
        hops: 0,
        transferBytes: 4,
        transferType: 'Register Direct',
        latencyCycles: 6,
        pipelineUnit: 'Odd Pipe (Permute/LS)',
        description: 'Sets DMA transfer size to 16,384 bytes (16 KB transfer chunk).',
        hardwareDetail: 'Maximum single DMA transfer size on Cell B.E. is 16 KB. Sized for optimal EIB bandwidth utilization.',
        registersAffected: [{ name: 'MFC_Size', value: '16384 bytes' }, { name: '$r5', value: '0x00004000' }]
      },
      {
        id: 'step-4',
        assembly: 'wrch $MFC_CMD, $r7   # MFC_GET_CMD',
        opcode: 'wrch',
        operands: '$MFC_CMD, $r7',
        busType: 'eib',
        sourceNode: 'mic',
        destNode: 'spe0',
        sourceLabel: 'MIC (XDR DRAM)',
        destLabel: 'SPE 0 (Local Store)',
        ringOrChannel: 'Ring 0 (Clockwise)',
        ringIndex: 0,
        direction: 'cw',
        hops: 2,
        transferBytes: 16384,
        transferType: 'DMA Burst (16KB)',
        latencyCycles: 18,
        pipelineUnit: 'MFC DMA Controller',
        description: 'Initiates MFC_GET command: 16 KB payload bursts from Rambus XDR DRAM across EIB Ring 0 to SPE 0.',
        hardwareDetail: 'Memory Interface Controller (MIC) transmits 128 consecutive 128-byte packets along EIB Ring 0 at 3.2 GHz without stalling the SPU execution unit.',
        registersAffected: [{ name: 'MFC_CMD', value: '0x0040 (GET)' }, { name: 'EIB_R0_Active', value: '1' }]
      },
      {
        id: 'step-5',
        assembly: 'lqd $r8, 0($r3)      # Load Quadword from Local Store',
        opcode: 'lqd',
        operands: '$r8, 0($r3)',
        busType: 'eib',
        sourceNode: 'spe0_ls',
        destNode: 'spe0_rf',
        sourceLabel: 'SPE 0 Local Store',
        destLabel: 'SPE 0 Register File',
        ringOrChannel: 'Local Store 128-bit Bus',
        direction: 'direct',
        hops: 0,
        transferBytes: 16,
        transferType: 'Quadword (16B)',
        latencyCycles: 6,
        pipelineUnit: 'Odd Pipe (Permute/LS)',
        description: 'Loads 128-bit SIMD vector from Local Store SRAM into general register $r8.',
        hardwareDetail: 'Single-cycle Local Store access with 6-cycle latency into 128x128-bit unified SPU register file.',
        registersAffected: [{ name: '$r8', value: '[1.50, 2.75, 4.12, 0.95]' }]
      },
      {
        id: 'step-6',
        assembly: 'fma $r8, $r9, $r10, $r8 # 4-way SIMD FMA',
        opcode: 'fma',
        operands: '$r8, $r9, $r10, $r8',
        busType: 'eib',
        sourceNode: 'spe0_core',
        destNode: 'spe0_core',
        sourceLabel: 'SPE 0 Even ALU',
        destLabel: 'SPE 0 Accumulator',
        ringOrChannel: 'Core Internal Data Path',
        direction: 'direct',
        hops: 0,
        transferBytes: 16,
        transferType: 'Register Direct',
        latencyCycles: 6,
        pipelineUnit: 'Even Pipe (FXU/FPU)',
        description: 'Performs 4 single-precision floating-point fused multiply-adds in parallel ($r8 = $r9 * $r10 + $r8).',
        hardwareDetail: 'Fully pipelined 128-bit vector arithmetic ALU executing at 3.2 GHz; peak throughput 25.6 GFLOPS per SPE.',
        registersAffected: [{ name: '$r8', value: '[5.25, 8.10, 11.45, 3.80]' }]
      },
      {
        id: 'step-7',
        assembly: 'stqd $r8, 0($r3)     # Store Quadword to Output Buffer',
        opcode: 'stqd',
        operands: '$r8, 0($r3)',
        busType: 'eib',
        sourceNode: 'spe0_rf',
        destNode: 'spe0_ls',
        sourceLabel: 'SPE 0 Register File',
        destLabel: 'SPE 0 Local Store',
        ringOrChannel: 'Local Store 128-bit Bus',
        direction: 'direct',
        hops: 0,
        transferBytes: 16,
        transferType: 'Quadword (16B)',
        latencyCycles: 6,
        pipelineUnit: 'Odd Pipe (Permute/LS)',
        description: 'Writes 128-bit processed vector back to Local Store ping-pong output buffer.',
        hardwareDetail: 'Stores aligned 16-byte result into SPE 0 Local Store without dirtying CPU cache lines.',
        registersAffected: [{ name: 'LS[0x04000]', value: '[5.25, 8.10, 11.45, 3.80]' }]
      },
      {
        id: 'step-8',
        assembly: 'wrch $MFC_CMD, $r12  # MFC_PUT_CMD to RSX via FlexIO',
        opcode: 'wrch',
        operands: '$MFC_CMD, $r12',
        busType: 'eib',
        sourceNode: 'spe0',
        destNode: 'flexio',
        sourceLabel: 'SPE 0 (Local Store)',
        destLabel: 'FlexIO (RSX GPU VRAM)',
        ringOrChannel: 'Ring 2 (Counter-Clockwise)',
        ringIndex: 2,
        direction: 'ccw',
        hops: 3,
        transferBytes: 16384,
        transferType: 'DMA Burst (16KB)',
        latencyCycles: 22,
        pipelineUnit: 'MFC DMA Controller',
        description: 'Issues MFC_PUT command: 16 KB transformed vertices stream across EIB Ring 2 to FlexIO and directly into RSX VRAM.',
        hardwareDetail: 'Traverses EIB Ring 2 CCW from SPE 0 past Southbridge and SPE 6 into FlexIO interface at 35 GB/s outbound bandwidth.',
        registersAffected: [{ name: 'FlexIO_Outbound', value: '16 KB Burst' }, { name: 'RSX_VRAM_Base', value: '0xC0000000' }]
      }
    ]
  },
  {
    id: 'spu_matrix_transform',
    title: 'PS3 SPU Dual-Issue 4x4 SIMD Matrix Transform (vector_matrix_mul.spu.s)',
    bus: 'eib',
    description: 'Dual-issue pipeline execution of vector-matrix multiplication showing interleaved Even (FMUL/FMA) and Odd (ROTQBY) register transfers.',
    steps: [
      {
        id: 'mat-1',
        assembly: 'rotqby $r9, $r3, 0      # Odd Pipe: Splat V.x',
        opcode: 'rotqby',
        operands: '$r9, $r3, 0',
        busType: 'eib',
        sourceNode: 'spe0_rf',
        destNode: 'spe0_rf',
        sourceLabel: 'SPE 0 Register File',
        destLabel: 'Odd Pipe Permute Unit',
        ringOrChannel: 'Odd Pipe Operand Bus',
        direction: 'direct',
        hops: 0,
        transferBytes: 16,
        transferType: 'Register Direct',
        latencyCycles: 4,
        pipelineUnit: 'Odd Pipe (Permute/LS)',
        description: 'Rotates quadword $r3 by 0 bytes and splats component X [x, x, x, x] into register $r9.',
        hardwareDetail: 'Permute byte-rotation unit broadcasts 32-bit floating point X component across all four 32-bit SIMD vector slots.',
        registersAffected: [{ name: '$r9', value: '[3.14, 3.14, 3.14, 3.14]' }]
      },
      {
        id: 'mat-2',
        assembly: 'fm $r8, $r4, $r9         # Even Pipe: Row0 * V.x',
        opcode: 'fm',
        operands: '$r8, $r4, $r9',
        busType: 'eib',
        sourceNode: 'spe0_rf',
        destNode: 'spe0_rf',
        sourceLabel: 'SPE 0 Register File',
        destLabel: 'Even Pipe Floating ALU',
        ringOrChannel: 'Even Pipe Operand Bus',
        direction: 'direct',
        hops: 0,
        transferBytes: 16,
        transferType: 'Register Direct',
        latencyCycles: 6,
        pipelineUnit: 'Even Pipe (FXU/FPU)',
        description: 'Multiplies Matrix Row 0 ($r4) by splatted V.x ($r9) and stores result in accumulator $r8.',
        hardwareDetail: 'Dual-issued simultaneously with rotqby in cycle 0. SPU dual-issue rule: 1 Even + 1 Odd instruction per cycle.',
        registersAffected: [{ name: '$r8', value: '[3.14, 0.00, 0.00, 0.00]' }]
      },
      {
        id: 'mat-3',
        assembly: 'rotqby $r10, $r3, 4     # Odd Pipe: Splat V.y',
        opcode: 'rotqby',
        operands: '$r10, $r3, 4',
        busType: 'eib',
        sourceNode: 'spe0_rf',
        destNode: 'spe0_rf',
        sourceLabel: 'SPE 0 Register File',
        destLabel: 'Odd Pipe Permute Unit',
        ringOrChannel: 'Odd Pipe Operand Bus',
        direction: 'direct',
        hops: 0,
        transferBytes: 16,
        transferType: 'Register Direct',
        latencyCycles: 4,
        pipelineUnit: 'Odd Pipe (Permute/LS)',
        description: 'Rotates quadword $r3 by 4 bytes to splat component Y [y, y, y, y] into temporary register $r10.',
        hardwareDetail: 'Extracts word 1 (bytes 4-7) and duplicates across SIMD vector lanes.',
        registersAffected: [{ name: '$r10', value: '[2.00, 2.00, 2.00, 2.00]' }]
      },
      {
        id: 'mat-4',
        assembly: 'fma $r8, $r5, $r10, $r8  # Even Pipe: Accum += Row1 * V.y',
        opcode: 'fma',
        operands: '$r8, $r5, $r10, $r8',
        busType: 'eib',
        sourceNode: 'spe0_rf',
        destNode: 'spe0_rf',
        sourceLabel: 'SPE 0 Register File',
        destLabel: 'Even Pipe FPU',
        ringOrChannel: 'Even Pipe Operand Bus',
        direction: 'direct',
        hops: 0,
        transferBytes: 16,
        transferType: 'Register Direct',
        latencyCycles: 6,
        pipelineUnit: 'Even Pipe (FXU/FPU)',
        description: 'Fused Multiply-Add: Multiplies Matrix Row 1 by V.y and accumulates into $r8 with single rounding step.',
        hardwareDetail: 'Executes without intermediate truncation or rounding error, preserving full IEEE-754 precision.',
        registersAffected: [{ name: '$r8', value: '[3.14, 2.00, 0.00, 0.00]' }]
      },
      {
        id: 'mat-5',
        assembly: 'bi $lr                   # Branch indirect to link register',
        opcode: 'bi',
        operands: '$lr',
        busType: 'eib',
        sourceNode: 'spe0_core',
        destNode: 'spe0_core',
        sourceLabel: 'Link Register ($lr)',
        destLabel: 'Instruction Fetch Unit',
        ringOrChannel: 'Internal Branch Target Bus',
        direction: 'direct',
        hops: 0,
        transferBytes: 4,
        transferType: 'Register Direct',
        latencyCycles: 4,
        pipelineUnit: 'Odd Pipe (Permute/LS)',
        description: 'Returns control back to calling C function or PPE supervisor routine.',
        hardwareDetail: 'Branch instruction predicted with Hardware Branch Target Buffer (HBR) to prevent pipeline stall.',
        registersAffected: [{ name: 'PC', value: '0x00000180' }]
      }
    ]
  },
  {
    id: 'intel_raptor_lake_ring',
    title: 'Intel Core i9-14900KS Ring Bus Cache Line Allocation & LLC Stop',
    bus: 'intel_ring',
    description: 'Raptor Cove P-Core executing AVX2 256-bit SIMD load triggering a 64-byte cache line transfer across the Intel Coherent Ring Bus from LLC Slice 5.',
    steps: [
      {
        id: 'intel-1',
        assembly: 'vmovups (%rsi), %ymm0   # 256-bit Unaligned Memory Load',
        opcode: 'vmovups',
        operands: '(%rsi), %ymm0',
        busType: 'intel_ring',
        sourceNode: 'pcore0_l1',
        destNode: 'pcore0_l2',
        sourceLabel: 'P-Core 0 L1 Data Cache',
        destLabel: 'P-Core 0 L2 Cache (2MB)',
        ringOrChannel: 'Core Internal Cache Bus',
        direction: 'direct',
        hops: 0,
        transferBytes: 32,
        transferType: 'Cache Line (128B)',
        latencyCycles: 5,
        pipelineUnit: 'Ring Stop Agent',
        description: 'P-Core 0 checks 48 KB L1 Data Cache for 0x7FFF0000 (L1 Miss, queries 2 MB private L2 cache).',
        hardwareDetail: '48 KB 12-way L1D cache line tag mismatch triggers L2 lookup at 6.2 GHz core clock.',
        registersAffected: [{ name: 'L1D_Miss', value: '1' }, { name: 'L2_Request', value: '0x7FFF0000' }]
      },
      {
        id: 'intel-2',
        assembly: 'ring_bus_req $LLC_SLICE5 # Ring Bus Stop Arbitration',
        opcode: 'ring_req',
        operands: 'Ring Stop 0 -> Ring Stop 5',
        busType: 'intel_ring',
        sourceNode: 'pcore0_stop',
        destNode: 'llc_slice5',
        sourceLabel: 'Ring Stop 0 (P-Core 0)',
        destLabel: 'Ring Stop 5 (LLC Slice 5)',
        ringOrChannel: 'Intel Ring Bus (Clockwise Ring)',
        direction: 'cw',
        hops: 3,
        transferBytes: 64,
        transferType: 'Cache Line (128B)',
        latencyCycles: 14,
        pipelineUnit: 'Ring Stop Agent',
        description: 'Ring Stop 0 injects 64-byte coherent read request onto the 32-byte dual-ring bus headed for LLC Slice 5.',
        hardwareDetail: 'Bi-directional ring bus transfers 32 bytes per cycle in each direction; LLC hash function mapped address to Slice 5.',
        registersAffected: [{ name: 'Ring_Packet_ID', value: '0x08A' }, { name: 'LLC_Slice', value: '5' }]
      },
      {
        id: 'intel-3',
        assembly: 'vfmadd213ps %ymm1, %ymm2, %ymm0 # 8-way FP32 FMA',
        opcode: 'vfmadd213ps',
        operands: '%ymm1, %ymm2, %ymm0',
        busType: 'intel_ring',
        sourceNode: 'pcore0_fpu',
        destNode: 'pcore0_fpu',
        sourceLabel: 'P-Core 0 FPU Port 0/1',
        destLabel: 'YMM Register File',
        ringOrChannel: 'Execution Port 0 Bus',
        direction: 'direct',
        hops: 0,
        transferBytes: 32,
        transferType: 'Register Direct',
        latencyCycles: 4,
        pipelineUnit: 'Even Pipe (FXU/FPU)',
        description: 'Executes 8 parallel single-precision FMA operations on loaded vector data in YMM0.',
        hardwareDetail: 'Dual 256-bit FMA units on Execution Ports 0 and 1 deliver 16 single-precision FLOPs per cycle.',
        registersAffected: [{ name: '%ymm0', value: '[12.4, 15.6, 18.2, 21.0, 9.5, 4.2, 1.1, 7.8]' }]
      }
    ]
  },
  {
    id: 'amd_infinity_fabric_x3d',
    title: 'AMD Ryzen 7950X3D Stacked 3D V-Cache Hit (Infinity Fabric GMI3)',
    bus: 'amd_if',
    description: 'CCD0 Zen 4 core loads high-resolution game simulation data directly from 96 MB stacked 3D V-Cache with zero off-die Infinity Fabric latency.',
    steps: [
      {
        id: 'amd-1',
        assembly: 'vmovaps (%rdx), %ymm4   # AVX-512 Dual-Pumped Load',
        opcode: 'vmovaps',
        operands: '(%rdx), %ymm4',
        busType: 'amd_if',
        sourceNode: 'ccd0_core0',
        destNode: 'ccd0_3dvcache',
        sourceLabel: 'CCD0 Core 0 L2 Cache',
        destLabel: 'Stacked 64MB 3D V-Cache',
        ringOrChannel: 'Direct TSV Silicon Interconnect',
        direction: 'direct',
        hops: 0,
        transferBytes: 64,
        transferType: 'Cache Line (128B)',
        latencyCycles: 10,
        pipelineUnit: 'Fabric Crossbar',
        description: 'Core 0 L2 cache miss queries stacked 3D V-Cache via Through-Silicon Vias (TSVs) at 2.5 TB/s direct die bandwidth.',
        hardwareDetail: 'Zero inter-die latency: TSVs bond 64 MB SRAM die directly atop CCD0 with 256-bit crossbar.',
        registersAffected: [{ name: '3DV_Cache_Hit', value: '1' }, { name: 'DRAM_Traffic_Prevented', value: 'True' }]
      },
      {
        id: 'amd-2',
        assembly: 'gmi3_sync $CIOD_MEMCTRL # Non-blocking Memory Coherence Probe',
        opcode: 'gmi3_sync',
        operands: 'CCD0 -> cIOD',
        busType: 'amd_if',
        sourceNode: 'ccd0',
        destNode: 'ciod',
        sourceLabel: 'CCD0 (Compute Die)',
        destLabel: 'cIOD (I/O & DDR5 Die)',
        ringOrChannel: 'GMI3 Interconnect Link',
        direction: 'direct',
        hops: 1,
        transferBytes: 16,
        transferType: 'Quadword (16B)',
        latencyCycles: 15,
        pipelineUnit: 'Fabric Crossbar',
        description: 'Sends snoop probe across GMI3 link to I/O Die verifying DDR5 cache coherency tag.',
        hardwareDetail: 'Global Memory Interconnect Gen 3 (GMI3) operating at 32 GT/s links compute die to central memory controller.',
        registersAffected: [{ name: 'Coherence_State', value: 'Shared (S)' }]
      }
    ]
  },
  {
    id: 'pcie5_directstorage_dma',
    title: 'PCIe 5.0 DirectStorage NVMe to GPU VRAM DMA Bypass',
    bus: 'pcie5',
    description: 'High-speed 14.5 GB/s DirectStorage DMA transfer bypassing host CPU and system DRAM directly into NVIDIA RTX 4090 GDDR6X.',
    steps: [
      {
        id: 'pcie-1',
        assembly: 'nvme_sq_submit $SQ0, $CMD_READ # DirectStorage Async Queue',
        opcode: 'nvme_submit',
        operands: 'SQ0, LBA 0x00040000',
        busType: 'pcie5',
        sourceNode: 'cpu_root',
        destNode: 'nvme_ssd',
        sourceLabel: 'CPU PCIe 5.0 Controller',
        destLabel: 'PCIe 5.0 x4 NVMe SSD',
        ringOrChannel: 'PCIe Gen 5 Root Complex',
        direction: 'direct',
        hops: 1,
        transferBytes: 64,
        transferType: 'Register Direct',
        latencyCycles: 8,
        pipelineUnit: 'Ring Stop Agent',
        description: 'Host queues DirectStorage NVMe 2.0 read command pointing destination address to GPU VRAM (0x20000000).',
        hardwareDetail: '32 GT/s signaling per lane with 128b/130b encoding delivers command directly to SSD controller ring buffer.',
        registersAffected: [{ name: 'NVMe_SQ_Tail', value: '1' }]
      },
      {
        id: 'pcie-2',
        assembly: 'pcie_dma_stream # Peer-to-Peer GPU Direct DMA Bypass',
        opcode: 'dma_stream',
        operands: 'NVMe SSD -> RTX 4090 VRAM',
        busType: 'pcie5',
        sourceNode: 'nvme_ssd',
        destNode: 'rtx4090_vram',
        sourceLabel: 'PCIe 5.0 x4 NVMe SSD',
        destLabel: 'RTX 4090 GDDR6X VRAM',
        ringOrChannel: 'PCIe 5.0 x16 Switch Interconnect',
        direction: 'direct',
        hops: 2,
        transferBytes: 16384,
        transferType: 'DMA Burst (16KB)',
        latencyCycles: 28,
        pipelineUnit: 'Fabric Crossbar',
        description: 'NVMe SSD streams 14.5 GB/s texture chunks directly across PCIe 5.0 bus into GPU GDDR6X PAM4 memory with 0% CPU load.',
        hardwareDetail: 'GPUDirect Storage (GDS) bypasses system DRAM entirely, reducing end-to-end asset load latency by 85%.',
        registersAffected: [{ name: 'VRAM_Bytes_Loaded', value: '+16384 bytes' }, { name: 'CPU_Overhead', value: '0%' }]
      }
    ]
  }
];

// Architectural Node definitions for SVG rendering
const EIB_NODES = [
  { id: 'ppe', name: 'PPE', fullName: 'PowerPC Processing Element', angle: 270, x: 200, y: 35, type: 'cpu' },
  { id: 'spe0', name: 'SPE 0', fullName: 'Synergistic Processor 0', angle: 300, x: 295, y: 65, type: 'spe' },
  { id: 'spe1', name: 'SPE 1', fullName: 'Synergistic Processor 1', angle: 330, x: 355, y: 130, type: 'spe' },
  { id: 'spe2', name: 'SPE 2', fullName: 'Synergistic Processor 2', angle: 0, x: 375, y: 200, type: 'spe' },
  { id: 'mic', name: 'MIC', fullName: 'Memory Interface (XDR DRAM)', angle: 30, x: 355, y: 270, type: 'mem' },
  { id: 'spe3', name: 'SPE 3', fullName: 'Synergistic Processor 3', angle: 60, x: 295, y: 335, type: 'spe' },
  { id: 'spe4', name: 'SPE 4', fullName: 'Synergistic Processor 4', angle: 90, x: 200, y: 365, type: 'spe' },
  { id: 'flexio', name: 'FlexIO', fullName: 'FlexIO Interface (RSX GPU)', angle: 120, x: 105, y: 335, type: 'gpu' },
  { id: 'spe5', name: 'SPE 5', fullName: 'Synergistic Processor 5', angle: 150, x: 45, y: 270, type: 'spe' },
  { id: 'spe6', name: 'SPE 6', fullName: 'Synergistic Processor 6 (OS)', angle: 180, x: 25, y: 200, type: 'spe' },
  { id: 'spe7', name: 'SPE 7', fullName: 'SPE 7 (Redundant / Disabled)', angle: 210, x: 45, y: 130, type: 'spe' },
  { id: 'sb_io', name: 'SB I/O', fullName: 'Southbridge I/O Controller', angle: 240, x: 105, y: 65, type: 'io' }
];

interface InstructionBusVisualizerProps {
  currentFileContent?: string;
  currentFileName?: string;
  activeLineIndex?: number;
  onSelectInstructionLine?: (lineIndex: number) => void;
  onClose?: () => void;
}

export const InstructionBusVisualizer: React.FC<InstructionBusVisualizerProps> = ({
  currentFileContent,
  currentFileName,
  activeLineIndex,
  onSelectInstructionLine,
  onClose
}) => {
  const [selectedRoutineIndex, setSelectedRoutineIndex] = useState<number>(0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeBus, setActiveBus] = useState<BusArchitecture>('eib');
  const [parsedFileSteps, setParsedFileSteps] = useState<InstructionStep[]>([]);
  const [isUsingFileInstructions, setIsUsingFileInstructions] = useState<boolean>(false);
  const [packetProgress, setPacketProgress] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const activeRoutine = PRESET_ROUTINES[selectedRoutineIndex];
  const activeSteps = isUsingFileInstructions && parsedFileSteps.length > 0 
    ? parsedFileSteps 
    : activeRoutine.steps;

  const currentStep: InstructionStep = activeSteps[currentStepIndex] || activeSteps[0] || activeRoutine.steps[0];

  // Try to parse assembly instructions and DMA commands from the current file if possible
  useEffect(() => {
    if (!currentFileContent) return;

    const lines = currentFileContent.split('\n');
    const detectedSteps: InstructionStep[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

      // Check for SPU instructions
      const spuMatch = trimmed.match(/^([a-z]{1,8})\s+([^#;]+)/i);
      if (spuMatch) {
        const op = spuMatch[1].toLowerCase();
        const operands = spuMatch[2].trim();

        // Check if recognizable SPU assembly opcode
        if (['lqd', 'stqd', 'rotqby', 'rotqbyi', 'fm', 'fma', 'fms', 'a', 'ai', 'fa', 'wrch', 'rdch', 'bi', 'bisl', 'brz', 'brnz', 'hbr', 'nop'].includes(op)) {
          let srcNode = 'spe0_core';
          let destNode = 'spe0_core';
          let transferBytes = 16;
          let transferType: InstructionStep['transferType'] = 'Register Direct';
          let bus: BusArchitecture = 'eib';
          let unit: InstructionStep['pipelineUnit'] = 'Even Pipe (FXU/FPU)';
          let desc = `Instruction ${op.toUpperCase()} executing on SPU core`;

          if (op === 'lqd') {
            srcNode = 'spe0_ls';
            destNode = 'spe0_rf';
            transferBytes = 16;
            transferType = 'Quadword (16B)';
            unit = 'Odd Pipe (Permute/LS)';
            desc = `Loads 16-byte quadword from Local Store into target register (${operands})`;
          } else if (op === 'stqd') {
            srcNode = 'spe0_rf';
            destNode = 'spe0_ls';
            transferBytes = 16;
            transferType = 'Quadword (16B)';
            unit = 'Odd Pipe (Permute/LS)';
            desc = `Stores 16-byte quadword from register to Local Store (${operands})`;
          } else if (op === 'wrch') {
            srcNode = 'spe0_core';
            destNode = 'spe0_mfc';
            transferBytes = 4;
            unit = 'Odd Pipe (Permute/LS)';
            if (operands.includes('MFC_CMD') || operands.includes('21')) {
              srcNode = 'mic';
              destNode = 'spe0';
              transferBytes = 16384;
              transferType = 'DMA Burst (16KB)';
              desc = `Issues DMA transfer across EIB ring channels (${operands})`;
            } else {
              desc = `Configures MFC channel register (${operands})`;
            }
          } else if (op === 'rotqby' || op === 'rotqbyi') {
            unit = 'Odd Pipe (Permute/LS)';
            desc = `Vector byte rotation / element splatting (${operands})`;
          }

          detectedSteps.push({
            id: `file-inst-${idx}`,
            lineIndex: idx,
            assembly: trimmed,
            opcode: op,
            operands: operands,
            busType: bus,
            sourceNode: srcNode,
            destNode: destNode,
            sourceLabel: 'Source Node',
            destLabel: 'Destination Node',
            ringOrChannel: 'EIB Ring / Local Bus',
            hops: 1,
            transferBytes,
            transferType,
            latencyCycles: 6,
            pipelineUnit: unit,
            description: desc,
            hardwareDetail: `Parsed from line ${idx + 1} of ${currentFileName || 'active source file'}`
          });
        }
      }

      // Check for C DMA calls e.g. spu_mfcdma32 or mfc_get
      if (trimmed.includes('spu_mfcdma32') || trimmed.includes('mfc_get') || trimmed.includes('mfc_put')) {
        const isPut = trimmed.includes('put') || trimmed.includes('PUT');
        detectedSteps.push({
          id: `file-dma-${idx}`,
          lineIndex: idx,
          assembly: trimmed,
          opcode: isPut ? 'mfc_put' : 'mfc_get',
          operands: 'LSA, EA, Size, Tag, CMD',
          busType: 'eib',
          sourceNode: isPut ? 'spe0' : 'mic',
          destNode: isPut ? 'flexio' : 'spe0',
          sourceLabel: isPut ? 'SPE 0 Local Store' : 'MIC (XDR DRAM)',
          destLabel: isPut ? 'FlexIO (RSX GPU)' : 'SPE 0 Local Store',
          ringOrChannel: isPut ? 'Ring 2 (CCW)' : 'Ring 0 (CW)',
          ringIndex: isPut ? 2 : 0,
          direction: isPut ? 'ccw' : 'cw',
          hops: 2,
          transferBytes: 16384,
          transferType: 'DMA Burst (16KB)',
          latencyCycles: 18,
          pipelineUnit: 'MFC DMA Controller',
          description: isPut 
            ? 'Asynchronous DMA PUT: streams buffer across EIB to GPU VRAM' 
            : 'Asynchronous DMA GET: fetches 16 KB chunk from main XDR memory across EIB',
          hardwareDetail: `DMA API invocation detected on line ${idx + 1}`
        });
      }
    });

    if (detectedSteps.length > 0) {
      setParsedFileSteps(detectedSteps);
      // If the file is specifically assembly or DMA, default to using file instructions
      if (currentFileName?.endsWith('.s') || currentFileName?.includes('matrix_mul') || currentFileName?.includes('dma')) {
        setIsUsingFileInstructions(true);
      }
    }
  }, [currentFileContent, currentFileName]);

  // Synchronize with external activeLineIndex if provided
  useEffect(() => {
    if (activeLineIndex !== undefined && isUsingFileInstructions && parsedFileSteps.length > 0) {
      const matchingStepIdx = parsedFileSteps.findIndex(s => s.lineIndex === activeLineIndex);
      if (matchingStepIdx >= 0) {
        setCurrentStepIndex(matchingStepIdx);
      }
    }
  }, [activeLineIndex, isUsingFileInstructions, parsedFileSteps]);

  // Animation packet loop
  useEffect(() => {
    let animFrame: number;
    let startTime: number | null = null;
    const duration = 1200 / playbackSpeed;

    const animatePacket = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const prog = (elapsed % duration) / duration;
      setPacketProgress(prog);

      if (isPlaying && elapsed >= duration) {
        startTime = timestamp;
        setCurrentStepIndex(prev => {
          const next = (prev + 1) % activeSteps.length;
          if (onSelectInstructionLine && activeSteps[next]?.lineIndex !== undefined) {
            onSelectInstructionLine(activeSteps[next].lineIndex!);
          }
          return next;
        });
      }

      animFrame = requestAnimationFrame(animatePacket);
    };

    animFrame = requestAnimationFrame(animatePacket);
    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying, playbackSpeed, activeSteps.length, onSelectInstructionLine]);

  // Step handlers
  const handleStepForward = () => {
    const next = (currentStepIndex + 1) % activeSteps.length;
    setCurrentStepIndex(next);
    if (onSelectInstructionLine && activeSteps[next]?.lineIndex !== undefined) {
      onSelectInstructionLine(activeSteps[next].lineIndex!);
    }
  };

  const handleStepBack = () => {
    const prev = (currentStepIndex - 1 + activeSteps.length) % activeSteps.length;
    setCurrentStepIndex(prev);
    if (onSelectInstructionLine && activeSteps[prev]?.lineIndex !== undefined) {
      onSelectInstructionLine(activeSteps[prev].lineIndex!);
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
    if (onSelectInstructionLine && activeSteps[0]?.lineIndex !== undefined) {
      onSelectInstructionLine(activeSteps[0].lineIndex!);
    }
  };

  const handleRoutineSelect = (idx: number) => {
    setSelectedRoutineIndex(idx);
    setIsUsingFileInstructions(false);
    setCurrentStepIndex(0);
    setActiveBus(PRESET_ROUTINES[idx].bus);
  };

  // Render SVG Bus Topology according to active bus type
  const renderBusDiagram = () => {
    if (currentStep.busType === 'eib' || activeBus === 'eib') {
      // PlayStation 3 Element Interconnect Bus (EIB) - 4 Concentric Rings + 12 Nodes
      const center = 200;
      const ringRadii = [140, 120, 100, 80];

      // Find node positions
      const srcNode = EIB_NODES.find(n => n.id === currentStep.sourceNode || currentStep.sourceNode.startsWith(n.id)) || EIB_NODES[1];
      const destNode = EIB_NODES.find(n => n.id === currentStep.destNode || currentStep.destNode.startsWith(n.id)) || EIB_NODES[4];

      // Calculate packet position along active ring
      const activeRadius = currentStep.ringIndex !== undefined ? ringRadii[currentStep.ringIndex] : ringRadii[0];
      const startAngle = (srcNode.angle * Math.PI) / 180;
      const endAngle = (destNode.angle * Math.PI) / 180;
      
      let diff = endAngle - startAngle;
      if (currentStep.direction === 'ccw') {
        if (diff > 0) diff -= 2 * Math.PI;
      } else {
        if (diff < 0) diff += 2 * Math.PI;
      }
      
      const currentPacketAngle = startAngle + diff * packetProgress;
      const packetX = center + activeRadius * Math.cos(currentPacketAngle);
      const packetY = center + activeRadius * Math.sin(currentPacketAngle);

      return (
        <div className="relative w-full aspect-square max-w-[420px] mx-auto bg-slate-950/80 rounded-xl border border-slate-800/80 p-2 overflow-hidden shadow-inner">
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <defs>
              <radialGradient id="eib-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
              </radialGradient>
              <filter id="packet-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background Core Glow */}
            <circle cx="200" cy="200" r="150" fill="url(#eib-glow)" />

            {/* Central EIB Hub Badge */}
            <circle cx="200" cy="200" r="50" className="fill-slate-900 stroke-cyan-500/40" strokeWidth="1.5" />
            <text x="200" y="195" textAnchor="middle" className="fill-cyan-400 font-mono font-bold text-[11px]">
              CELL EIB
            </text>
            <text x="200" y="208" textAnchor="middle" className="fill-slate-400 font-mono text-[8px]">
              307.2 GB/s
            </text>
            <text x="200" y="219" textAnchor="middle" className="fill-emerald-400 font-mono text-[7px]">
              4x 128-bit RINGS
            </text>

            {/* 4 Concentric EIB Data Rings */}
            {ringRadii.map((radius, rIdx) => {
              const isCW = rIdx < 2;
              const isActiveRing = currentStep.ringIndex === rIdx || (currentStep.ringIndex === undefined && rIdx === 0);
              return (
                <g key={`ring-${rIdx}`}>
                  <circle
                    cx="200"
                    cy="200"
                    r={radius}
                    fill="none"
                    className={`transition-all duration-300 ${
                      isActiveRing 
                        ? (isCW ? 'stroke-cyan-400' : 'stroke-purple-400') 
                        : 'stroke-slate-800'
                    }`}
                    strokeWidth={isActiveRing ? 2.5 : 1}
                    strokeDasharray={isCW ? '6 4' : '4 6'}
                    style={{
                      animation: `spin ${isCW ? '16s' : '12s'} linear infinite ${isCW ? 'normal' : 'reverse'}`,
                      transformOrigin: '200px 200px'
                    }}
                  />
                  {/* Small Ring Label */}
                  <text
                    x={200}
                    y={200 - radius + 8}
                    textAnchor="middle"
                    className={`font-mono text-[7px] select-none ${
                      isActiveRing ? 'fill-cyan-300 font-bold' : 'fill-slate-600'
                    }`}
                  >
                    R{rIdx} ({isCW ? 'CW' : 'CCW'})
                  </text>
                </g>
              );
            })}

            {/* Active Data Packet Travelling Along the Ring */}
            <g filter="url(#packet-glow)">
              <circle
                cx={packetX}
                cy={packetY}
                r={6}
                className={currentStep.direction === 'ccw' ? 'fill-purple-400' : 'fill-cyan-400'}
              />
              <circle
                cx={packetX}
                cy={packetY}
                r={10}
                fill="none"
                className={currentStep.direction === 'ccw' ? 'stroke-purple-400/60' : 'stroke-cyan-400/60'}
                strokeWidth="1.5"
              />
            </g>

            {/* Radial Bus Stop Connectors to 12 Nodes */}
            {EIB_NODES.map((node) => {
              const rad = (node.angle * Math.PI) / 180;
              const innerX = center + 80 * Math.cos(rad);
              const innerY = center + 80 * Math.sin(rad);
              const outerX = center + 140 * Math.cos(rad);
              const outerY = center + 140 * Math.sin(rad);
              const isSource = node.id === currentStep.sourceNode || currentStep.sourceNode.startsWith(node.id);
              const isDest = node.id === currentStep.destNode || currentStep.destNode.startsWith(node.id);

              return (
                <line
                  key={`spoke-${node.id}`}
                  x1={innerX}
                  y1={innerY}
                  x2={outerX}
                  y2={outerY}
                  className={isSource || isDest ? 'stroke-cyan-400' : 'stroke-slate-800'}
                  strokeWidth={isSource || isDest ? 2 : 1}
                />
              );
            })}

            {/* 12 Hardware Element Nodes */}
            {EIB_NODES.map((node) => {
              const isSource = node.id === currentStep.sourceNode || currentStep.sourceNode.startsWith(node.id);
              const isDest = node.id === currentStep.destNode || currentStep.destNode.startsWith(node.id);

              let nodeFill = 'fill-slate-900';
              let nodeStroke = 'stroke-slate-700';
              let textColor = 'fill-slate-300';

              if (isSource) {
                nodeFill = 'fill-emerald-950';
                nodeStroke = 'stroke-emerald-400';
                textColor = 'fill-emerald-300';
              } else if (isDest) {
                nodeFill = 'fill-cyan-950';
                nodeStroke = 'stroke-cyan-400';
                textColor = 'fill-cyan-300';
              } else if (node.type === 'ppe') {
                nodeStroke = 'stroke-indigo-500/40';
              } else if (node.type === 'mem') {
                nodeStroke = 'stroke-amber-500/40';
              } else if (node.type === 'gpu') {
                nodeStroke = 'stroke-pink-500/40';
              }

              return (
                <g key={`node-${node.id}`} className="cursor-pointer transition-all">
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={18}
                    className={`${nodeFill} ${nodeStroke} transition-colors`}
                    strokeWidth={isSource || isDest ? 2.5 : 1.5}
                  />
                  {/* Status Indicator Dot */}
                  <circle
                    cx={node.x + 12}
                    cy={node.y - 12}
                    r={3}
                    className={
                      isSource 
                        ? 'fill-emerald-400' 
                        : isDest 
                        ? 'fill-cyan-400' 
                        : 'fill-slate-600'
                    }
                  />
                  <text
                    x={node.x}
                    y={node.y + 4}
                    textAnchor="middle"
                    className={`font-mono text-[9px] font-bold ${textColor} select-none`}
                  >
                    {node.name}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Real-time Bus Status Banner */}
          <div className="absolute bottom-2 left-2 right-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded px-2.5 py-1.5 flex items-center justify-between text-[10px] font-mono text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white font-semibold">Active:</span>
              <span className="text-cyan-300">{currentStep.sourceLabel}</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <span className="text-emerald-300">{currentStep.destLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">{currentStep.ringOrChannel}</span>
              <span className="text-amber-400 font-bold">{currentStep.transferType}</span>
            </div>
          </div>
        </div>
      );
    }

    if (currentStep.busType === 'intel_ring') {
      // Intel Raptor Lake Dual-Ring Bus with P-Cores, E-Cores, and LLC Slices
      return (
        <div className="relative w-full aspect-video max-w-[440px] mx-auto bg-slate-950/80 rounded-xl border border-slate-800/80 p-3 overflow-hidden shadow-inner flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="text-[11px] font-mono font-bold text-cyan-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-400" /> Intel Raptor Lake Coherent Ring Bus (32B/cycle)
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              68 MB Total Cache
            </span>
          </div>

          {/* Ring Stops Layout */}
          <div className="grid grid-cols-5 gap-2 my-2">
            {[
              { id: 'p0', name: 'P-Core 0', sub: '6.2 GHz', type: 'p' },
              { id: 'p1', name: 'P-Core 1', sub: 'L1/L2', type: 'p' },
              { id: 'llc0', name: 'LLC Slice 0', sub: '3 MB L3', type: 'l' },
              { id: 'llc1', name: 'LLC Slice 1', sub: '3 MB L3', type: 'l' },
              { id: 'sys', name: 'Sys Agent', sub: 'DDR5 IMC', type: 's' }
            ].map((stop) => {
              const isSrc = stop.id === 'p0';
              const isDst = stop.id === 'llc1' || stop.id === 'sys';
              return (
                <div
                  key={stop.id}
                  className={`p-1.5 rounded-lg border text-center transition-all ${
                    isSrc 
                      ? 'bg-emerald-950/60 border-emerald-500/60 ring-1 ring-emerald-500/40 text-emerald-300' 
                      : isDst 
                      ? 'bg-cyan-950/60 border-cyan-500/60 ring-1 ring-cyan-500/40 text-cyan-300' 
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="text-[10px] font-mono font-bold text-white truncate">{stop.name}</div>
                  <div className="text-[8px] font-mono text-slate-400">{stop.sub}</div>
                </div>
              );
            })}
          </div>

          {/* Bi-directional Ring Tracks */}
          <div className="relative h-6 bg-slate-900/80 rounded-full border border-slate-700/60 flex items-center justify-between px-3 overflow-hidden">
            <div className="absolute inset-x-0 h-0.5 bg-blue-500/40 top-2" />
            <div className="absolute inset-x-0 h-0.5 bg-cyan-500/40 bottom-2" />
            
            {/* Animated Ring Stop Packet */}
            <div 
              className="absolute w-4 h-4 rounded-full bg-cyan-400 shadow-lg shadow-cyan-500/50 transform -translate-y-1/2 top-1/2"
              style={{ left: `${packetProgress * 85 + 5}%` }}
            />
            <span className="text-[9px] font-mono text-cyan-400 z-10">Ring CW &gt;&gt;&gt;</span>
            <span className="text-[9px] font-mono text-blue-400 z-10">&lt;&lt;&lt; Ring CCW</span>
          </div>

          <div className="text-[10px] font-mono text-slate-400 bg-slate-900/60 rounded p-1.5 border border-slate-800 flex justify-between">
            <span>Transfer: <strong className="text-white">64-byte Cache Line</strong></span>
            <span>Latency: <strong className="text-amber-400">14 cycles (~2.2 ns)</strong></span>
          </div>
        </div>
      );
    }

    if (currentStep.busType === 'amd_if') {
      // AMD Zen 4 3D V-Cache & Infinity Fabric
      return (
        <div className="relative w-full aspect-video max-w-[440px] mx-auto bg-slate-950/80 rounded-xl border border-slate-800/80 p-3 overflow-hidden shadow-inner flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="text-[11px] font-mono font-bold text-red-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-red-500" /> AMD Infinity Fabric & 3D V-Cache (128 MB L3)
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
              GMI3 32 GT/s
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 my-2">
            <div className="bg-red-950/30 border border-red-500/40 rounded-lg p-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-white">CCD 0 (3D V-Cache)</span>
                <span className="text-[8px] font-mono px-1 rounded bg-red-500/30 text-red-200">96 MB L3</span>
              </div>
              <p className="text-[9px] text-slate-300">
                8 Zen 4 Cores with vertically stacked 64 MB SRAM connected via direct TSVs.
              </p>
              <div className="text-[8px] font-mono text-emerald-400 bg-emerald-950/40 rounded px-1.5 py-0.5 border border-emerald-500/30">
                ACTIVE HIT: 2.5 TB/s direct TSV bandwidth
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-white">cIOD (I/O Die)</span>
                <span className="text-[8px] font-mono px-1 rounded bg-slate-800 text-slate-400">TSMC 6nm</span>
              </div>
              <p className="text-[9px] text-slate-400">
                Dual-Channel DDR5-6000 IMC & PCIe 5.0 Root Complex.
              </p>
              <div className="text-[8px] font-mono text-slate-400 bg-slate-950 rounded px-1.5 py-0.5 border border-slate-800">
                Snoop probe synced via GMI3 link
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-400 bg-slate-900/60 rounded p-1.5 border border-slate-800 flex justify-between">
            <span>Cache Status: <strong className="text-emerald-400">Zero DRAM Stalls</strong></span>
            <span>Link Latency: <strong className="text-amber-400">10-15 cycles</strong></span>
          </div>
        </div>
      );
    }

    // Default: PCIe 5.0 DirectStorage
    return (
      <div className="relative w-full aspect-video max-w-[440px] mx-auto bg-slate-950/80 rounded-xl border border-slate-800/80 p-3 overflow-hidden shadow-inner flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" /> PCIe 5.0 DirectStorage DMA Bypass (32 GT/s)
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            14.5 GB/s Direct
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 my-2">
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded p-2 text-center">
            <div className="text-[10px] font-mono font-bold text-white">PCIe 5.0 NVMe SSD</div>
            <div className="text-[8px] font-mono text-slate-400">Source: LBA 0x00040000</div>
          </div>
          <ArrowRight className="w-4 h-4 text-emerald-400 animate-pulse" />
          <div className="flex-1 bg-emerald-950/40 border border-emerald-500/40 rounded p-2 text-center">
            <div className="text-[10px] font-mono font-bold text-emerald-300">RTX 4090 GDDR6X</div>
            <div className="text-[8px] font-mono text-slate-400">Dest: VRAM 0x20000000</div>
          </div>
        </div>

        <div className="text-[10px] font-mono text-slate-400 bg-slate-900/60 rounded p-1.5 border border-slate-800 flex justify-between">
          <span>CPU Overhead: <strong className="text-emerald-400">0% (Hardware DMA)</strong></span>
          <span>Throughput: <strong className="text-cyan-400">14.5 GB/s</strong></span>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-slate-950 border-b border-slate-800 flex flex-col transition-all duration-300 ${
      isExpanded ? 'h-[520px]' : 'h-auto max-h-[460px]'
    } overflow-hidden shadow-2xl`}>
      {/* Visualizer Top Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white tracking-tight">
                Instruction-Level Execution & CPU Bus Visualizer
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {currentStep.busType.toUpperCase()} BUS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Cycle-accurate trace of assembly commands moving data across the Element Interconnect Bus & modern CPU fabrics
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Preset Routines Dropdown */}
          <select
            value={isUsingFileInstructions ? 'from_file' : selectedRoutineIndex}
            onChange={(e) => {
              if (e.target.value === 'from_file') {
                setIsUsingFileInstructions(true);
                setCurrentStepIndex(0);
              } else {
                handleRoutineSelect(Number(e.target.value));
              }
            }}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono rounded px-2.5 py-1 focus:outline-none focus:border-cyan-500"
          >
            {parsedFileSteps.length > 0 && (
              <option value="from_file">
                📄 Current File Instructions ({parsedFileSteps.length} commands)
              </option>
            )}
            {PRESET_ROUTINES.map((routine, idx) => (
              <option key={routine.id} value={idx}>
                ⚡ {routine.title}
              </option>
            ))}
          </select>

          {/* Expand / Minimize */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Close Panel Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors"
              title="Close Instruction Visualizer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Split: Left (Bus Diagram) / Right (Instruction Inspection & Controls) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 overflow-y-auto">
        {/* Left Column: Bus Diagram & Active Packet (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-center items-center">
          {renderBusDiagram()}
        </div>

        {/* Right Column: Instruction Telemetry, Registers, & Step Controls (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
          {/* Active Instruction Header Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                  Step {currentStepIndex + 1} of {activeSteps.length}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Unit: <strong className="text-white">{currentStep.pipelineUnit}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Latency: {currentStep.latencyCycles} Cycles</span>
              </div>
            </div>

            {/* Assembly Instruction Line Box */}
            <div className="bg-slate-950 border border-cyan-500/40 rounded-lg p-2.5 flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-500 select-none">asm:</span>
                <span className="text-sm font-mono font-bold text-cyan-300">
                  {currentStep.assembly}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {currentStep.transferType}
              </span>
            </div>

            {/* Description & Micro-Architectural Behavior */}
            <div className="space-y-1">
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {currentStep.description}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                {currentStep.hardwareDetail}
              </p>
            </div>

            {/* Hardware Bus Routing Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-800 text-[11px] font-mono">
              <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
                <div className="text-slate-500 text-[9px]">SOURCE</div>
                <div className="text-emerald-300 font-semibold truncate">{currentStep.sourceLabel}</div>
              </div>
              <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
                <div className="text-slate-500 text-[9px]">DESTINATION</div>
                <div className="text-cyan-300 font-semibold truncate">{currentStep.destLabel}</div>
              </div>
              <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
                <div className="text-slate-500 text-[9px]">BUS CHANNEL</div>
                <div className="text-amber-300 font-semibold truncate">{currentStep.ringOrChannel}</div>
              </div>
              <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
                <div className="text-slate-500 text-[9px]">TRANSFER SIZE</div>
                <div className="text-purple-300 font-semibold truncate">{currentStep.transferBytes} bytes</div>
              </div>
            </div>

            {/* Register File Updates if available */}
            {currentStep.registersAffected && currentStep.registersAffected.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-[10px] font-mono text-slate-500">Registers Updated:</span>
                {currentStep.registersAffected.map((reg, rIdx) => (
                  <span
                    key={`reg-${rIdx}`}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-200 border border-slate-800 flex items-center gap-1"
                  >
                    <span className="text-cyan-400 font-semibold">{reg.name}</span> = <span className="text-amber-300">{reg.value}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Stepping & Playback Controls Toolbar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                id="btn-step-back"
                onClick={handleStepBack}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                title="Step Back (<)"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                id="btn-toggle-play"
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  isPlaying 
                    ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
              </button>

              <button
                id="btn-step-forward"
                onClick={handleStepForward}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                title="Step Forward (>)"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                id="btn-reset-routine"
                onClick={handleReset}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                title="Reset Routine"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Instruction Scrub Slider */}
            <div className="flex-1 max-w-[200px] flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={Math.max(0, activeSteps.length - 1)}
                value={currentStepIndex}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCurrentStepIndex(val);
                  if (onSelectInstructionLine && activeSteps[val]?.lineIndex !== undefined) {
                    onSelectInstructionLine(activeSteps[val].lineIndex!);
                  }
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-[10px] font-mono text-slate-400 select-none">
                {currentStepIndex + 1}/{activeSteps.length}
              </span>
            </div>

            {/* Speed Toggle */}
            <div className="flex items-center gap-1 text-[10px] font-mono">
              <span className="text-slate-500">Speed:</span>
              {[0.5, 1, 2].map((s) => (
                <button
                  key={`speed-${s}`}
                  onClick={() => setPlaybackSpeed(s)}
                  className={`px-1.5 py-0.5 rounded border transition-all ${
                    playbackSpeed === s
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
