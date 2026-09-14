import React, { useState } from 'react';
import { 
  Cpu, 
  Layers, 
  HardDrive, 
  Zap, 
  ArrowRight, 
  Code2, 
  Activity, 
  Database, 
  Volume2, 
  Gauge, 
  ShieldCheck,
  Flame,
  Scale,
  Terminal
} from 'lucide-react';
import { SourceFile } from '../types/cell';

interface ConsoleInfo {
  id: 'ps3' | 'xbox360' | 'ps4' | 'xboxone' | 'ps5' | 'switch' | 'ps2' | 'pc-intel-nvidia' | 'pc-amd-all' | 'apple-m3-max';
  name: string;
  systemType?: 'console' | 'pc' | 'workstation';
  generation: string;
  maker: string;
  releaseYear: number;
  badgeColor: string;
  borderColor: string;
  cpuName: string;
  cpuArch: string;
  cpuCores: string;
  cpuClock: string;
  cpuSimd: string;
  cpuCache: string;
  gpuName: string;
  gpuArch: string;
  gpuClock: string;
  gpuCompute: string;
  gpuShaders: string;
  gpuFeatures: string[];
  ramSize: string;
  ramType: string;
  ramBandwidth: string;
  storageType: string;
  osName: string;
  osKernelType: string;
  osFirmwareVersion: string;
  osShellUi: string;
  osSecurityModel: string;
  osMemoryPartition: string;
  osKeyFeatures: string[];
  osSourceFiles: string[];
  sourceFileIds: string[];
  highlights: string[];
}

const CONSOLE_DATA: ConsoleInfo[] = [
  {
    id: 'ps3',
    name: 'PlayStation 3',
    generation: '7th Generation',
    maker: 'Sony / Toshiba / IBM / NVIDIA',
    releaseYear: 2006,
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    borderColor: 'border-indigo-500/40',
    cpuName: 'Cell Broadband Engine (CBEA)',
    cpuArch: 'PowerPC 64-bit + 8x SIMD RISC SPE Cores',
    cpuCores: '1 PPE (2 SMT threads) + 8 SPEs (6 Game + 1 OS + 1 Redundant)',
    cpuClock: '3.20 GHz',
    cpuSimd: '128-bit SIMD Quadword (128 registers per SPE)',
    cpuCache: 'PPE: 32KB L1 + 512KB L2; SPE: 256KB Local Store each (2MB total)',
    gpuName: 'NVIDIA RSX Reality Synthesizer',
    gpuArch: 'Custom G70 / NV47',
    gpuClock: '550 MHz',
    gpuCompute: '400 GFLOPS Peak',
    gpuShaders: '8 Vertex Pipelines + 24 Pixel Pipelines',
    gpuFeatures: ['Direct SPU Vertex Pipeline Streaming', 'FP16 HDR Render Targets', '256 MB GDDR3 Dedicated VRAM'],
    ramSize: '256 MB XDR DRAM + 256 MB GDDR3 VRAM',
    ramType: 'Rambus Octal Data Rate XDR + GDDR3',
    ramBandwidth: 'XDR: 25.6 GB/s | GDDR3: 22.4 GB/s | EIB: 204.8 GB/s',
    storageType: '2x BD-ROM (9 MB/s) + 2.5" SATA-150 HDD',
    osName: 'CellOS (GameOS)',
    osKernelType: 'LV1 Hypervisor + LV2 POSIX Microkernel',
    osFirmwareVersion: 'Firmware 4.88 / 4.90',
    osShellUi: 'Cross Media Bar (XMB) / VSH (Virtual Shell)',
    osSecurityModel: 'Isolated SPU 7 Root of Trust + Hardware Metldr/Bootldr',
    osMemoryPartition: 'Game: 212 MB XDR / OS: 44 MB XDR reserved for VSH',
    osKeyFeatures: [
      'sys_spu_thread: Preemptive hardware SPU thread group scheduler',
      'LV1 Hypervisor managing LPAR memory isolation in PPE root mode',
      'SELF / PUP cryptographic decryption and integrity verification',
      'Virtual File System routing dev_flash, dev_hdd0, dev_bdvd'
    ],
    osSourceFiles: ['ps3-cellos-kernel-h', 'ps3-cellos-kernel-cpp'],
    sourceFileIds: ['spu_core_cpp', 'rsx_core_cpp', 'memory_subsystem_cpp', 'cell_eib_cpp', 'ps3-cellos-kernel-h', 'ps3-cellos-kernel-cpp'],
    highlights: [
      'Revolutionary heterogeneous multicore: 1 PPE general processor orchestrating 8 specialized SIMD DSP engines.',
      'Element Interconnect Bus (EIB): 4 concentric 16-byte data rings routing packets at 204.8 GB/s peak.',
      'Manual DMA memory flow control: SPU engines explicitly fetch operands into 256 KB Local Store.'
    ]
  },
  {
    id: 'xbox360',
    name: 'Xbox 360',
    generation: '7th Generation',
    maker: 'Microsoft / IBM / ATI',
    releaseYear: 2005,
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    borderColor: 'border-emerald-500/40',
    cpuName: 'IBM "Xenon"',
    cpuArch: 'PowerPC 64-bit Symmetric Multiprocessing (SMP)',
    cpuCores: '3 Symmetric Cores (2 SMT threads each = 6 Hardware Threads)',
    cpuClock: '3.20 GHz',
    cpuSimd: '128-bit VMX128 (128 registers per hardware thread)',
    cpuCache: '32KB L1I + 32KB L1D per core; 1 MB Shared L2 Cache',
    gpuName: 'ATI "Xenos" (C1 / R500)',
    gpuArch: 'First Historical Unified Shader Architecture',
    gpuClock: '500 MHz',
    gpuCompute: '240 GFLOPS Peak',
    gpuShaders: '48 Unified ALUs in 3 SIMD Arrays (Dynamic Vertex/Pixel balance)',
    gpuFeatures: [
      '10 MB NEC Embedded DRAM (eDRAM) Daughter Die on 256 GB/s bus',
      'Free 4x Multisample Anti-Aliasing (MSAA) with on-die resolve',
      'Hardware Displacement Mapping / Tessellation unit'
    ],
    ramSize: '512 MB GDDR3 Unified (UMA)',
    ramType: 'GDDR3 @ 700 MHz',
    ramBandwidth: '22.4 GB/s System UMA + 256.0 GB/s eDRAM on-die',
    storageType: '12x DVD-ROM (16.5 MB/s) + Removable SATA HDD',
    osName: 'Xbox 360 System Software',
    osKernelType: 'Monolithic Windows NT 5.2 Single-Address Space Kernel',
    osFirmwareVersion: 'Dashboard 2.0.17559',
    osShellUi: 'Blades UI (2005) -> NXE (2008) -> Metro Dashboard (2011)',
    osSecurityModel: '1BL (First-Stage Bootloader) in CPU ROM + Fuses + XEX Signatures',
    osMemoryPartition: 'Game: 480 MB UMA / OS: 32 MB reserved for XAM Guide mini-OS',
    osKeyFeatures: [
      'XAM (Xbox Auxiliary Messages): Background Guide, Party Chat, Achievements',
      'KeCreateThread: Native Xenon symmetric hardware thread dispatcher',
      'XEX2 executable loader with hardware AES-128 cryptographic validation',
      'DirectX 9.0c Extended with unified memory sharing'
    ],
    osSourceFiles: ['xbox360-os-kernel-h', 'xbox360-os-kernel-cpp'],
    sourceFileIds: ['xbox360-xenon-h', 'xbox360-xenon-cpp', 'xbox360-xenos-h', 'xbox360-xenos-cpp', 'xbox360-os-kernel-h', 'xbox360-os-kernel-cpp'],
    highlights: [
      'Pioneered Unified Shader architecture, allowing the 48 ALUs to dynamically shift between vertex and pixel execution.',
      '10 MB daughter die eDRAM enabled high-framerate 720p gaming with hardware 4x MSAA without taxing main memory.',
      'Three symmetric 3.2 GHz PowerPC cores with 128 VMX registers per thread.'
    ]
  },
  {
    id: 'ps4',
    name: 'PlayStation 4',
    generation: '8th Generation',
    maker: 'Sony / AMD',
    releaseYear: 2013,
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    borderColor: 'border-blue-500/40',
    cpuName: 'AMD "Jaguar"',
    cpuArch: 'x86-64 Out-of-Order (OoO)',
    cpuCores: '8 Cores (2 Clusters of 4 Cores, 6 Game + 2 Orbis OS)',
    cpuClock: '1.60 GHz (2.13 GHz on PS4 Pro)',
    cpuSimd: '128-bit AVX, SSE4.2, AES-NI',
    cpuCache: '32KB L1 per core; 2x 2MB (4MB total) Shared L2',
    gpuName: 'AMD Radeon GCN (Graphics Core Next 1.1)',
    gpuArch: 'GCN 1.1 with Heterogeneous System Architecture (HSA)',
    gpuClock: '800 MHz (911 MHz on PS4 Pro)',
    gpuCompute: '1.84 TFLOPS (4.20 TFLOPS on PS4 Pro)',
    gpuShaders: '18 Compute Units (1,152 Stream Processors) + 32 ROPs',
    gpuFeatures: [
      '8 Asynchronous Compute Engines (ACEs) for concurrent compute/render',
      'Volatile memory bypass for low-latency GPU-to-CPU synchronization',
      'Unified 8 GB GDDR5 Memory (hUMA)'
    ],
    ramSize: '8 GB GDDR5 Unified (hUMA)',
    ramType: 'GDDR5 @ 5.5 GHz effective (256-bit bus)',
    ramBandwidth: '176.0 GB/s (218 GB/s on PS4 Pro)',
    storageType: '6x CAV Blu-ray (27 MB/s) + 500GB-1TB 2.5" SATA HDD',
    osName: 'Orbis OS',
    osKernelType: 'FreeBSD 9.0-RELEASE Derived UNIX Kernel with POSIX APIs',
    osFirmwareVersion: 'System Software 11.00',
    osShellUi: 'PlayStation Dynamic Menu (PDM) with LiveArea tiles',
    osSecurityModel: 'SAMU (Secure Asset Management Unit) + Flat-shading Hardware Sandbox',
    osMemoryPartition: 'Game: 5 GB - 5.5 GB GDDR5 / OS: 2.5 GB - 3.0 GB GDDR5',
    osKeyFeatures: [
      'sceKernelAllocateDirectMemory: hUMA coherent Onion & Garlic memory paging',
      'PlayGo background streaming engine (play while downloading)',
      'Gnm / Gnmx low-level hardware-direct graphics command submission',
      'Fast Suspend/Resume mode retaining game state in low-power GDDR5'
    ],
    osSourceFiles: ['ps4-orbis-kernel-h', 'ps4-orbis-kernel-cpp'],
    sourceFileIds: ['ps4-jaguar-h', 'ps4-jaguar-cpp', 'ps4-gcn-h', 'ps4-gcn-cpp', 'ps4-orbis-kernel-h', 'ps4-orbis-kernel-cpp'],
    highlights: [
      '8 GB ultra-fast unified GDDR5 memory eliminated traditional console RAM bottlenecks with 176 GB/s bandwidth.',
      '8 Asynchronous Compute Engines (ACEs) allowed developers to offload lighting, audio, and physics onto the GPU.',
      'hUMA heterogeneous memory architecture shared identical address space across CPU and GPU.'
    ]
  },
  {
    id: 'xboxone',
    name: 'Xbox One',
    generation: '8th Generation',
    maker: 'Microsoft / AMD',
    releaseYear: 2013,
    badgeColor: 'bg-green-500/20 text-green-300 border-green-500/40',
    borderColor: 'border-green-500/40',
    cpuName: 'AMD "Jaguar" Custom',
    cpuArch: 'x86-64 Out-of-Order (OoO)',
    cpuCores: '8 Cores @ 1.75 GHz (7 Game Cores + 1 Hyper-V Host Core)',
    cpuClock: '1.75 GHz',
    cpuSimd: '128-bit AVX, SSE4.2',
    cpuCache: '32KB L1 per core; 2x 2MB (4MB total) Shared L2',
    gpuName: 'AMD Radeon GCN Custom',
    gpuArch: 'GCN 1.1 Architecture',
    gpuClock: '853 MHz',
    gpuCompute: '1.31 TFLOPS (6.0 TFLOPS on Xbox One X)',
    gpuShaders: '12 Compute Units (768 Stream Processors)',
    gpuFeatures: [
      '32 MB Embedded SRAM (eSRAM) on-die providing 204 GB/s peak',
      '4 Data Move Engines (DMEs) for rapid memory DMA transfers',
      'Hardware JPEG & LZ decompression engines'
    ],
    ramSize: '8 GB DDR3 + 32 MB On-Die eSRAM',
    ramType: 'DDR3 @ 2133 MHz (256-bit) + 32MB eSRAM',
    ramBandwidth: 'DDR3: 68.3 GB/s | eSRAM: 204.0 GB/s Bidirectional',
    storageType: 'Blu-ray Drive + 500GB SATA HDD',
    osName: 'Xbox One OS (Tri-OS Architecture)',
    osKernelType: 'Hyper-V Host Hypervisor + ERA Game OS VM + Shared Windows 10 OS VM',
    osFirmwareVersion: 'Xbox OS 10.0.19041',
    osShellUi: 'Windows 10 Dashboard & Universal Windows Platform (UWP)',
    osSecurityModel: 'Hyper-V SLAT Hardware Virtualization Partitioning',
    osMemoryPartition: 'Game: 5 GB DDR3 + 32 MB eSRAM / OS: 3 GB DDR3 reserved for apps',
    osKeyFeatures: [
      'Tri-OS architecture: Host Hyper-V seamlessly routes GPU/memory across 2 VMs',
      'Exclusive Resource Allocation (ERA) gives games 100% bare-metal performance',
      'Snap Mode: Run live TV, Skype, or Twitch side-by-side with running game',
      'DirectX 11.2 / 12 Monolithic Direct Submissions'
    ],
    osSourceFiles: ['xboxone-tri-os-h', 'xboxone-tri-os-cpp'],
    sourceFileIds: ['xboxone-cpu-h', 'xboxone-cpu-cpp', 'xboxone-esram-h', 'xboxone-esram-cpp', 'xboxone-tri-os-h', 'xboxone-tri-os-cpp'],
    highlights: [
      '32 MB ultra-fast on-die eSRAM provided 204 GB/s peak bandwidth to compensate for DDR3 memory bus.',
      'Dual-OS Hypervisor architecture partition runs Era Game OS alongside Shared Windows System App OS.',
      '4 Data Move Engines offloaded memory transfers and decompressions from the CPU.'
    ]
  },
  {
    id: 'ps5',
    name: 'PlayStation 5',
    generation: '9th Generation',
    maker: 'Sony / AMD',
    releaseYear: 2020,
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    borderColor: 'border-cyan-500/40',
    cpuName: 'AMD "Zen 2"',
    cpuArch: 'x86-64 Zen 2 with Hardware SMT',
    cpuCores: '8 Cores / 16 Threads with AMD SmartShift Dynamic Frequency',
    cpuClock: 'Variable up to 3.50 GHz',
    cpuSimd: '256-bit AVX2 (Dual 256-bit FMA pipelines per core)',
    cpuCache: '32KB L1 + 512KB L2 per core; 8 MB Shared L3 CCX',
    gpuName: 'Custom AMD RDNA 2',
    gpuArch: 'RDNA 2 with Hardware Ray Tracing',
    gpuClock: 'Variable up to 2.23 GHz',
    gpuCompute: '10.28 TFLOPS FP32',
    gpuShaders: '36 Dual Compute Units (2,304 Stream Processors)',
    gpuFeatures: [
      '36 Hardware Ray Accelerators (Dedicated BVH Box/Triangle traversal)',
      'Primitive Shaders & Mesh Shaders geometric pipeline',
      'Tempest 3D Audio Engine (Repurposed AMD CU DSP for 3D Audio HRTF)'
    ],
    ramSize: '16 GB GDDR6 Unified',
    ramType: 'GDDR6 @ 14 Gbps (256-bit bus)',
    ramBandwidth: '448.0 GB/s Peak Unified Bandwidth',
    storageType: 'Custom 12-Channel PCIe 4.0 NVMe SSD (5.5 GB/s raw, 8-9 GB/s compressed)',
    osName: 'Prosperity OS',
    osKernelType: 'FreeBSD 11/12 Custom UNIX Microkernel with Hardware I/O Offload',
    osFirmwareVersion: 'System Software 8.00 / 9.00',
    osShellUi: 'PlayStation 5 Control Center & Universal Activity Cards',
    osSecurityModel: 'Hardware Root-of-Trust Crypto Engine + Secure DMA Channels',
    osMemoryPartition: 'Game: 12.5 GB GDDR6 / OS: 3.5 GB GDDR6 reserved for Control Center',
    osKeyFeatures: [
      'DirectStorage DMA: NVMe SSD directly feeds GDDR6 VRAM without CPU overhead',
      'Hardware Kraken Decompression kernel driver (8.9 GB/s throughput)',
      'Universal Activity Cards: Deep-link into specific game levels in 2 seconds',
      'Tempest 3D Audio HRTF server daemon processing hundreds of sound sources'
    ],
    osSourceFiles: ['ps5-prosperity-kernel-h', 'ps5-prosperity-kernel-cpp'],
    sourceFileIds: ['ps5-zen2-h', 'ps5-zen2-cpp', 'ps5-rdna2-h', 'ps5-rdna2-cpp', 'ps5-tempest-h', 'ps5-ssd-h', 'ps5-prosperity-kernel-h', 'ps5-prosperity-kernel-cpp'],
    highlights: [
      'Custom 12-Channel PCIe 4.0 Flash Controller achieves 5.5 GB/s raw (>8-9 GB/s compressed with hardware Kraken).',
      'Hardware Ray Tracing with 36 Ray Accelerators operating alongside 10.28 TFLOPS RDNA 2 graphics core.',
      'Tempest 3D Audio Engine provides over 100 GFLOPS of dedicated DSP power for HRTF 3D spatial sound.'
    ]
  },
  {
    id: 'switch',
    name: 'Nintendo Switch',
    generation: '8th / Hybrid',
    maker: 'Nintendo / NVIDIA',
    releaseYear: 2017,
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
    borderColor: 'border-red-500/40',
    cpuName: 'NVIDIA Tegra X1 (T210) / Cortex-A57',
    cpuArch: 'ARMv8-A 64-bit RISC',
    cpuCores: '4x ARM Cortex-A57 @ 1.020 GHz',
    cpuClock: '1.020 GHz',
    cpuSimd: '128-bit ARM NEON SIMD',
    cpuCache: '48KB L1I + 32KB L1D; 2 MB Shared L2',
    gpuName: 'NVIDIA Maxwell GM20B',
    gpuArch: 'Maxwell 2nd Gen with FP16 support',
    gpuClock: '768 MHz (Docked) / 384 MHz (Handheld)',
    gpuCompute: '393 GFLOPS FP32 (Docked) / 786 GFLOPS FP16',
    gpuShaders: '256 Maxwell CUDA Cores (1 Streaming Multiprocessor)',
    gpuFeatures: ['FP16 Half-Precision 2x throughput', 'Tile-based rasterization', 'Dynamic battery-saving clocks'],
    ramSize: '4 GB LPDDR4 Unified',
    ramType: 'LPDDR4 @ 1600 MHz Docked / 1331 MHz Handheld',
    ramBandwidth: '25.6 GB/s (Docked) / 21.3 GB/s (Handheld)',
    storageType: '32-64 GB eMMC 5.1 + Game Card (MicroSDXC expansion)',
    osName: 'Horizon OS',
    osKernelType: 'Mesosphere ARM64 Capability-Based Microkernel',
    osFirmwareVersion: 'System Version 17.0.0',
    osShellUi: 'Home Menu & Qlaunch fast launcher',
    osSecurityModel: 'Package1 / Package2 Cryptographic TrustChain + TSEC coprocessor',
    osMemoryPartition: 'Game: 3.25 GB LPDDR4 / OS: 0.75 GB LPDDR4 reserved for sysmodules',
    osKeyFeatures: [
      'sm: Service Manager routing IPC messages between isolated Sysmodules',
      'nvdrv: Low-latency driver bridge to NVIDIA Tegra NVN graphics API',
      'hid: Controller subsystem handling Joy-Con rail pairing & HD Rumble',
      'Dynamic power management seamlessly transitioning between Docked & Handheld'
    ],
    osSourceFiles: ['switch-horizon-microkernel-h', 'switch-horizon-microkernel-cpp'],
    sourceFileIds: ['switch-tegra-h', 'switch-tegra-cpp', 'switch-horizon-microkernel-h', 'switch-horizon-microkernel-cpp'],
    highlights: [
      'Revolutionary hybrid console operating seamlessly between a 768 MHz docked TV profile and power-efficient handheld mode.',
      '256-core NVIDIA Maxwell GPU supporting modern desktop graphical APIs (Vulkan, NVN, OpenGL 4.5).',
      'Low power ARMv8-A 64-bit architecture with NEON SIMD vector processing.'
    ]
  },
  {
    id: 'ps2',
    name: 'PlayStation 2',
    generation: '6th Generation',
    maker: 'Sony Computer Entertainment',
    releaseYear: 2000,
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    borderColor: 'border-amber-500/40',
    cpuName: 'Emotion Engine (EE)',
    cpuArch: '128-bit MIPS R5900 with Vector Coprocessors',
    cpuCores: '1 Core @ 294.912 MHz + Vector Units VU0 and VU1',
    cpuClock: '294.912 MHz',
    cpuSimd: '128-bit SIMD GPRs (32 registers) + Vector Units',
    cpuCache: '16KB L1I + 8KB L1D + 16KB Scratchpad RAM (SPR)',
    gpuName: 'Graphics Synthesizer (GS)',
    gpuArch: 'Dedicated High-Speed Rasterizer with Embedded DRAM',
    gpuClock: '147.456 MHz',
    gpuCompute: '6.2 GFLOPS (EE + VUs)',
    gpuShaders: '16 Parallel Pixel Pipelines with 2,560-bit Internal Bus',
    gpuFeatures: ['4 MB on-die Embedded DRAM', 'Massive 48.0 GB/s internal fillrate', '2.4 Gpixels/sec fillrate'],
    ramSize: '32 MB Direct RDRAM (System) + 4 MB eDRAM (GS)',
    ramType: 'Rambus Direct RDRAM @ 800 MHz (Dual-Channel)',
    ramBandwidth: 'System: 3.2 GB/s | GS eDRAM: 48.0 GB/s internal',
    storageType: '4x DVD-ROM (5.28 MB/s) / 24x CD-ROM + 8MB MagicGate Memory Card',
    osName: 'PlayStation 2 Dual Kernel System',
    osKernelType: 'Dual Real-Time Microkernel (EE Kernel MIPS R5900 + IOP Kernel MIPS R3000)',
    osFirmwareVersion: 'ROM BIOS 1.00 - 2.30',
    osShellUi: 'OSDSYS (3D Crystal Floating Browser & System Configuration)',
    osSecurityModel: 'MagicGate Hardware Crypto for Memory Cards & Disc Wobble check',
    osMemoryPartition: 'EE: 32 MB RDRAM (Game logic) / IOP: 2 MB dedicated I/O RAM',
    osKeyFeatures: [
      'Subsystem Interface (SIF): High-speed bidirectional DMA RPC bridging EE and IOP',
      'IOP modular driver system loading dynamic relocatable .IRX modules',
      'OSDSYS graphical 3D browser rendered in real-time by Graphics Synthesizer',
      'Raw direct hardware register access with zero OS overhead during gameplay'
    ],
    osSourceFiles: ['ps2-ee-iop-kernel-h', 'ps2-ee-iop-kernel-cpp'],
    sourceFileIds: ['ps2-ee-h', 'ps2-ee-cpp', 'ps2-ee-iop-kernel-h', 'ps2-ee-iop-kernel-cpp'],
    highlights: [
      'The best-selling game console in history with over 155 million units sold.',
      'Graphics Synthesizer with 4 MB on-die eDRAM and a staggering 2,560-bit internal bus delivering 48 GB/s fillrate in the year 2000.',
      'Vector Unit 1 (VU1) functioned as an autonomous microcode-driven 3D geometry transformation engine.'
    ]
  },
  {
    id: 'pc-intel-nvidia',
    name: 'Intel i9-14900KS + RTX 4090',
    systemType: 'pc',
    generation: 'Modern Flagship PC',
    maker: 'Intel / NVIDIA / Micron / ASUS',
    releaseYear: 2024,
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    borderColor: 'border-blue-500/40',
    cpuName: 'Intel Core i9-14900KS (Raptor Lake Refresh)',
    cpuArch: 'x86-64 Hybrid Architecture (Raptor Cove + Gracemont)',
    cpuCores: '24 Cores / 32 Threads (8 P-Cores + 16 E-Cores)',
    cpuClock: '6.20 GHz TVB Peak (P-Core) / 4.50 GHz (E-Core)',
    cpuSimd: 'AVX2 / FMA3 / Intel DL Boost (VNNI)',
    cpuCache: '36 MB L3 Intel Smart Cache + 32 MB L2 (68 MB Total)',
    gpuName: 'NVIDIA GeForce RTX 4090 (AD102 Ada Lovelace)',
    gpuArch: 'Ada Lovelace 3rd Gen RT / 4th Gen Tensor (TSMC 4N)',
    gpuClock: '2,235 MHz Base / 2,520+ MHz Boost',
    gpuCompute: '82.58 TFLOPS FP32 (1,321 Tensor TFLOPS with FP8)',
    gpuShaders: '16,384 CUDA Cores (128 SMs) + 512 Tensor Cores + 128 RT Cores',
    gpuFeatures: [
      '4th Gen Tensor FP8 Transformer Engine',
      'Shader Execution Reordering (SER)',
      'DLSS 3 Optical Flow Frame Generation',
      '72 MB L2 High-Capacity Cache'
    ],
    ramSize: '64 GB Dual-Channel DDR5-6400 (4x 32-bit subchannels)',
    ramType: 'DDR5 SDRAM @ 6400 MT/s with On-Die ECC (ODECC)',
    ramBandwidth: 'System: 102.4 GB/s | VRAM: 1,008 GB/s (Micron PAM4 384-bit)',
    storageType: 'PCIe 5.0 x4 M.2 NVMe SSD (14.5 GB/s DirectStorage)',
    osName: 'Windows 11 Pro / Linux 6.8+ HFI',
    osKernelType: 'Windows NT 10.0 Hybrid / Linux Preempt-RT Kernel',
    osFirmwareVersion: 'Windows 11 23H2 / 24H2',
    osShellUi: 'Windows Shell / DirectX 12 Ultimate & Vulkan 1.3',
    osSecurityModel: 'TPM 2.0 + VBS (Virtualization-Based Security) + Secure Boot',
    osMemoryPartition: 'System: 64 GB DDR5 / VRAM: 24 GB GDDR6X dedicated',
    osKeyFeatures: [
      'Intel Thread Director hardware scheduling with OS EHFI',
      'DirectStorage 1.2 with GPU decompression & bypass',
      'DirectX 12 Ultimate: Mesh Shaders, DXR 1.1, Sampler Feedback',
      'Resizable BAR (Base Address Register) full VRAM mapping'
    ],
    osSourceFiles: ['intel-raptor-lake-h', 'intel-raptor-lake-cpp', 'nvidia-rtx4090-ada-h', 'nvidia-rtx4090-ada-cpp'],
    sourceFileIds: [
      'intel-raptor-lake-h',
      'intel-raptor-lake-cpp',
      'nvidia-rtx4090-ada-h',
      'nvidia-rtx4090-ada-cpp',
      'ddr5-memory-controller-h',
      'ddr5-memory-controller-cpp',
      'pcie5-nvme-controller-h',
      'pcie5-nvme-controller-cpp',
      'motherboard-vrm-chipset-h',
      'motherboard-vrm-chipset-cpp'
    ],
    highlights: [
      'World-record consumer clock speed: 8 Raptor Cove Performance Cores hitting 6.20 GHz out-of-the-box.',
      'AD102 flagship die packs 16,384 CUDA cores and dedicated Optical Flow Accelerator for real-time neural frame generation.',
      'PCIe 5.0 x16 graphics + PCIe 5.0 x4 NVMe SSD with DirectStorage bypassing CPU host latency.'
    ]
  },
  {
    id: 'pc-amd-all',
    name: 'AMD Ryzen 7950X3D + RX 7900 XTX',
    systemType: 'pc',
    generation: 'Modern Chiplet PC',
    maker: 'AMD / TSMC / ASRock / Sapphire',
    releaseYear: 2023,
    badgeColor: 'bg-red-600/20 text-red-400 border-red-500/40',
    borderColor: 'border-red-500/40',
    cpuName: 'AMD Ryzen 9 7950X3D (Zen 4 + 3D V-Cache)',
    cpuArch: 'x86-64 Zen 4 Multi-Die Chiplet (2x CCD + 1x cIOD)',
    cpuCores: '16 Cores / 32 Threads (CCD0 3D V-Cache + CCD1 Frequency)',
    cpuClock: '4.20 GHz Base / 5.70 GHz Boost (CCD1)',
    cpuSimd: 'AVX-512 Dual-Pumped 256-bit SIMD',
    cpuCache: '128 MB L3 Cache (96MB on CCD0 + 32MB on CCD1) + 16MB L2',
    gpuName: 'AMD Radeon RX 7900 XTX (Navi 31 Chiplet)',
    gpuArch: 'RDNA 3 Chiplet (1x GCD 5nm + 6x MCDs 6nm)',
    gpuClock: '2,300 MHz Game / 2,500 MHz Boost',
    gpuCompute: '61.4 TFLOPS FP32 (122.8 TFLOPS Dual-Issue Peak)',
    gpuShaders: '96 CUs / 6,144 Stream Processors (Dual-Issue) + 96 Ray Accelerators',
    gpuFeatures: [
      "World's First Chiplet Gaming GPU (GCD + 6 MCDs)",
      '96 MB 2nd Gen Infinity Cache (3.5 TB/s effective)',
      'DisplayPort 2.1 UHBR13.5 (54 Gbps)',
      'Dual-Issue SIMD Units'
    ],
    ramSize: '64 GB Dual-Channel DDR5-6000 EXPO',
    ramType: 'DDR5 SDRAM @ 6000 MT/s (CL30 Low-Latency)',
    ramBandwidth: 'System: 96.0 GB/s | VRAM GDDR6: 960 GB/s (384-bit bus)',
    storageType: 'PCIe 5.0 x4 M.2 NVMe SSD (12.4 GB/s)',
    osName: 'Windows 11 / Linux Mesa & ROCm',
    osKernelType: 'Linux 6.8+ / Windows NT AMD Chiplet Driver Kernel',
    osFirmwareVersion: 'AGESA ComboAM5PI 1.1.0.0',
    osShellUi: 'AMD Software: Adrenalin Edition & Wayland / GNOME',
    osSecurityModel: 'AMD Secure Processor (Platform Security Processor - PSP)',
    osMemoryPartition: 'System: 64 GB DDR5 / VRAM: 24 GB GDDR6 dedicated',
    osKeyFeatures: [
      'AMD 3D V-Cache Optimizer Driver dynamically parking non-cache cores for gaming',
      'Smart Access Memory (SAM) / PCIe Resizable BAR support',
      'AMD SmartAccess Storage (DirectStorage GPU decompression)',
      'ROCm 6.0 Open-Source Compute & HIP Matrix Acceleration'
    ],
    osSourceFiles: ['amd-zen4-x3d-h', 'amd-zen4-x3d-cpp', 'amd-rx7900xtx-rdna3-h', 'amd-rx7900xtx-rdna3-cpp'],
    sourceFileIds: [
      'amd-zen4-x3d-h',
      'amd-zen4-x3d-cpp',
      'amd-rx7900xtx-rdna3-h',
      'amd-rx7900xtx-rdna3-cpp',
      'ddr5-memory-controller-h',
      'ddr5-memory-controller-cpp',
      'pcie5-nvme-controller-h',
      'pcie5-nvme-controller-cpp',
      'motherboard-vrm-chipset-h',
      'motherboard-vrm-chipset-cpp'
    ],
    highlights: [
      'Stacked 3D V-Cache technology delivers 128 MB total L3 cache, eliminating DRAM access latency in gaming and physics.',
      'World-first multi-chiplet GPU: 5nm Graphics Compute Die with six 6nm Memory Cache Dies connected via 5.3 TB/s link.',
      'AVX-512 execution with full instruction support paired with Dual-Issue wave32 GPU compute.'
    ]
  },
  {
    id: 'apple-m3-max',
    name: 'Apple M3 Max Workstation SoC',
    systemType: 'workstation',
    generation: 'Modern ARMv9 Workstation SoC',
    maker: 'Apple Inc. / TSMC',
    releaseYear: 2023,
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    borderColor: 'border-emerald-500/40',
    cpuName: 'Apple M3 Max (TSMC 3nm Monolithic)',
    cpuArch: 'ARMv9-A 64-bit Heterogeneous',
    cpuCores: '16 Cores (12 Performance Cores + 4 Efficiency Cores)',
    cpuClock: '4.05 GHz Boost (P-Core) / 2.75 GHz (E-Core)',
    cpuSimd: '128-bit NEON + SME (Scalable Matrix Extension)',
    cpuCache: '192KB L1I per P-core + 48 MB Shared System Level Cache',
    gpuName: 'Apple M3 Max 40-Core GPU',
    gpuArch: 'Apple Dynamic Caching Architecture with Hardware RT & Mesh Shading',
    gpuClock: '1,380 MHz',
    gpuCompute: '14.13 TFLOPS FP32',
    gpuShaders: '40 GPU Cores (5,120 ALUs)',
    gpuFeatures: [
      'Dynamic Caching (Hardware real-time GPU local memory allocation)',
      'Hardware-Accelerated Ray Tracing & Mesh Shaders',
      'Hardware ProRes RAW & AV1 Dual Decode/Encode Engines'
    ],
    ramSize: '128 GB Unified Memory (UMA)',
    ramType: 'LPDDR5-6400 Unified (512-bit bus)',
    ramBandwidth: '400.0 GB/s Shared Zero-Copy Bandwidth',
    storageType: 'Integrated Apple NVMe Fabric Controller (7.4 GB/s)',
    osName: 'macOS Sonoma / Sequoia',
    osKernelType: 'XNU Hybrid Kernel (Mach microkernel + BSD layer)',
    osFirmwareVersion: 'macOS 14.4 / 15.0 Darwin 23.x',
    osShellUi: 'Aqua GUI / Metal 3 Graphics Framework',
    osSecurityModel: 'Secure Enclave Processor (SEP) + Hardware T2 Crypto Root-of-Trust',
    osMemoryPartition: '128 GB Unified: Dynamically apportioned between CPU, GPU, & ANE',
    osKeyFeatures: [
      'Metal 3 Unified Memory zero-copy texture & buffer sharing',
      'Apple Neural Engine CoreML runtime (18 TOPS AI acceleration)',
      'Grand Central Dispatch (GCD) hardware thread group routing',
      'Hardware ProRes RAW acceleration processing 8K streams in real time'
    ],
    osSourceFiles: ['apple-m3-max-h', 'apple-m3-max-cpp'],
    sourceFileIds: [
      'apple-m3-max-h',
      'apple-m3-max-cpp'
    ],
    highlights: [
      'TSMC 3nm manufacturing packing 92 billion transistors onto a single monolithic workstation die.',
      '512-bit Unified Memory Architecture delivers 400 GB/s bandwidth accessible with zero latency across CPU and 40 GPU cores.',
      'Dynamic Caching completely redesigns GPU local memory management to maximize execution efficiency.'
    ]
  }
];

interface ConsoleArchitectureExplorerProps {
  onSelectSourceFile: (fileId: string) => void;
  files: SourceFile[];
}

export const ConsoleArchitectureExplorer: React.FC<ConsoleArchitectureExplorerProps> = ({
  onSelectSourceFile,
  files
}) => {
  const [selectedConsoleId, setSelectedConsoleId] = useState<ConsoleInfo['id']>('ps5');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'console' | 'pc'>('all');
  const [compareIdA, setCompareIdA] = useState<ConsoleInfo['id']>('ps3');
  const [compareIdB, setCompareIdB] = useState<ConsoleInfo['id']>('xbox360');
  const [showComparison, setShowComparison] = useState(false);

  const filteredSystems = CONSOLE_DATA.filter(c => {
    if (categoryFilter === 'console') return !c.systemType || c.systemType === 'console';
    if (categoryFilter === 'pc') return c.systemType === 'pc' || c.systemType === 'workstation';
    return true;
  });

  const activeConsole = CONSOLE_DATA.find(c => c.id === selectedConsoleId) || CONSOLE_DATA[0];
  const consoleA = CONSOLE_DATA.find(c => c.id === compareIdA) || CONSOLE_DATA[0];
  const consoleB = CONSOLE_DATA.find(c => c.id === compareIdB) || CONSOLE_DATA[1];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 space-y-8 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Hardware Architecture Lab
            </span>
            <span className="text-xs text-slate-500 font-mono">PlayStation • Xbox • Nintendo • PC CPUs • Discrete GPUs • Components</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Console, PC & Computer Architecture Explorer
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl mt-1">
            Explore and inspect microarchitectures, CPU/GPU silicon, memory hierarchies, bus topologies, and C/C++ simulator source codes
            powering game consoles (PS2/PS3/PS4/PS5, Xbox 360/One, Switch) and modern PC/workstations (Intel i9, AMD Ryzen/RDNA3, Apple M3 Max, NVIDIA RTX 4090, DDR5, PCIe 5.0).
          </p>
        </div>

        <button
          id="toggle-comparison-btn"
          onClick={() => setShowComparison(!showComparison)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-mono text-xs transition-all border ${
            showComparison
              ? 'bg-cyan-500 text-slate-950 font-semibold border-cyan-400 shadow-md shadow-cyan-950/50'
              : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border-slate-700'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>{showComparison ? 'Back to System Deep Dive' : 'Side-by-Side Comparator'}</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 font-mono text-xs">
        <span className="text-slate-500 mr-1">Filter Platforms:</span>
        <button
          id="filter-all-btn"
          onClick={() => setCategoryFilter('all')}
          className={`px-3 py-1 rounded-md border transition-all ${
            categoryFilter === 'all'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-semibold'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          All Systems ({CONSOLE_DATA.length})
        </button>
        <button
          id="filter-console-btn"
          onClick={() => setCategoryFilter('console')}
          className={`px-3 py-1 rounded-md border transition-all ${
            categoryFilter === 'console'
              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 font-semibold'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          Game Consoles (7)
        </button>
        <button
          id="filter-pc-btn"
          onClick={() => setCategoryFilter('pc')}
          className={`px-3 py-1 rounded-md border transition-all ${
            categoryFilter === 'pc'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-semibold'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          PC & Workstation Silicon (3)
        </button>
      </div>

      {/* Console & PC Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-10 gap-2.5">
        {filteredSystems.map((c) => {
          const isSelected = c.id === selectedConsoleId && !showComparison;
          return (
            <button
              key={c.id}
              id={`select-console-${c.id}`}
              onClick={() => {
                setSelectedConsoleId(c.id);
                setShowComparison(false);
              }}
              className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden group ${
                isSelected
                  ? `bg-slate-900 ${c.borderColor} shadow-lg ring-1 ring-cyan-500/40`
                  : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[9px] font-mono uppercase px-1 py-0.5 rounded border ${c.badgeColor}`}>
                  {c.releaseYear}
                </span>
                <span className="text-[9px] font-mono text-slate-500">{c.systemType === 'pc' || c.systemType === 'workstation' ? 'PC' : c.generation.split(' ')[0]}</span>
              </div>
              <h3 className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors truncate">
                {c.name}
              </h3>
              <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                {c.cpuName.split('(')[0]}
              </p>
            </button>
          );
        })}
      </div>

      {/* Mode 1: Side-by-Side Comparison Tool */}
      {showComparison ? (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <Scale className="w-6 h-6 text-cyan-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Side-by-Side Hardware Spec Matrix</h3>
                  <p className="text-xs text-slate-400 font-mono">Select any two systems to compare silicon architecture</p>
                </div>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs">
                <select
                  id="compare-select-a"
                  value={compareIdA}
                  onChange={(e) => setCompareIdA(e.target.value as ConsoleInfo['id'])}
                  className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-cyan-300 focus:outline-none focus:border-cyan-500"
                >
                  {CONSOLE_DATA.map(c => <option key={c.id} value={c.id}>{c.name} ({c.releaseYear})</option>)}
                </select>
                <span className="text-slate-500 font-bold">VS</span>
                <select
                  id="compare-select-b"
                  value={compareIdB}
                  onChange={(e) => setCompareIdB(e.target.value as ConsoleInfo['id'])}
                  className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-pink-300 focus:outline-none focus:border-pink-500"
                >
                  {CONSOLE_DATA.map(c => <option key={c.id} value={c.id}>{c.name} ({c.releaseYear})</option>)}
                </select>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-slate-400">
                    <th className="py-2 px-3 w-1/4">Hardware Subsystem</th>
                    <th className="py-2 px-3 w-3/8 text-cyan-400">{consoleA.name}</th>
                    <th className="py-2 px-3 w-3/8 text-pink-400">{consoleB.name}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-400">Maker & Era</td>
                    <td className="py-2.5 px-3">{consoleA.maker} ({consoleA.releaseYear})</td>
                    <td className="py-2.5 px-3">{consoleB.maker} ({consoleB.releaseYear})</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-400">CPU Architecture</td>
                    <td className="py-2.5 px-3"><strong className="text-white">{consoleA.cpuName}</strong> ({consoleA.cpuArch})</td>
                    <td className="py-2.5 px-3"><strong className="text-white">{consoleB.cpuName}</strong> ({consoleB.cpuArch})</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-400">CPU Cores & Threads</td>
                    <td className="py-2.5 px-3">{consoleA.cpuCores}</td>
                    <td className="py-2.5 px-3">{consoleB.cpuCores}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-400">CPU Clock Speed</td>
                    <td className="py-2.5 px-3 text-cyan-300 font-bold">{consoleA.cpuClock}</td>
                    <td className="py-2.5 px-3 text-pink-300 font-bold">{consoleB.cpuClock}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-400">SIMD Vector Width</td>
                    <td className="py-2.5 px-3">{consoleA.cpuSimd}</td>
                    <td className="py-2.5 px-3">{consoleB.cpuSimd}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-400">GPU Silicon & Arch</td>
                    <td className="py-2.5 px-3"><strong className="text-white">{consoleA.gpuName}</strong> ({consoleA.gpuArch})</td>
                    <td className="py-2.5 px-3"><strong className="text-white">{consoleB.gpuName}</strong> ({consoleB.gpuArch})</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-400">GPU Peak Compute</td>
                    <td className="py-2.5 px-3 text-cyan-300 font-bold">{consoleA.gpuCompute}</td>
                    <td className="py-2.5 px-3 text-pink-300 font-bold">{consoleB.gpuCompute}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-400">Shader Pipelines</td>
                    <td className="py-2.5 px-3">{consoleA.gpuShaders}</td>
                    <td className="py-2.5 px-3">{consoleB.gpuShaders}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-400">System RAM & VRAM</td>
                    <td className="py-2.5 px-3">{consoleA.ramSize}</td>
                    <td className="py-2.5 px-3">{consoleB.ramSize}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-400">Memory Bandwidth</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">{consoleA.ramBandwidth}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">{consoleB.ramBandwidth}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-400">Storage Subsystem</td>
                    <td className="py-2.5 px-3">{consoleA.storageType}</td>
                    <td className="py-2.5 px-3">{consoleB.storageType}</td>
                  </tr>
                  <tr className="bg-slate-900/40">
                    <td className="py-2.5 px-3 font-semibold text-cyan-400">Operating System</td>
                    <td className="py-2.5 px-3 text-white font-bold">{consoleA.osName} ({consoleA.osFirmwareVersion})</td>
                    <td className="py-2.5 px-3 text-white font-bold">{consoleB.osName} ({consoleB.osFirmwareVersion})</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-400">Kernel Architecture</td>
                    <td className="py-2.5 px-3">{consoleA.osKernelType}</td>
                    <td className="py-2.5 px-3">{consoleB.osKernelType}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-400">System Shell & UI</td>
                    <td className="py-2.5 px-3">{consoleA.osShellUi}</td>
                    <td className="py-2.5 px-3">{consoleB.osShellUi}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-400">Memory Partitioning</td>
                    <td className="py-2.5 px-3 text-slate-300">{consoleA.osMemoryPartition}</td>
                    <td className="py-2.5 px-3 text-slate-300">{consoleB.osMemoryPartition}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Mode 2: Detailed Architectural Deep Dive */
        <div className="space-y-6">
          {/* Main Hero Card */}
          <div className={`bg-gradient-to-br from-slate-900/90 to-slate-950 border ${activeConsole.borderColor} rounded-2xl p-6 relative overflow-hidden shadow-2xl`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-mono uppercase px-2 py-0.5 rounded border ${activeConsole.badgeColor}`}>
                    {activeConsole.maker} • {activeConsole.releaseYear}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{activeConsole.generation}</span>
                </div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">
                  {activeConsole.name}
                </h2>
                <p className="text-sm font-mono text-slate-300 mt-1">
                  {activeConsole.cpuName} + {activeConsole.gpuName}
                </p>
              </div>

              {/* Quick source file launcher */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">C/C++ Source Files:</span>
                {activeConsole.sourceFileIds.map(fid => {
                  const target = files.find(f => f.id === fid || f.name.includes(fid));
                  return (
                    <button
                      key={fid}
                      id={`open-src-${fid}`}
                      onClick={() => onSelectSourceFile(fid)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-700/50 font-mono text-xs transition-colors"
                      title="Open source file in editor"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>{target ? target.name : fid}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Microarchitectural Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {activeConsole.highlights.map((h, i) => (
                <div key={i} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed font-sans flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono text-[10px] font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Subsystems Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CPU Subsystem */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-sans font-bold text-sm text-white">Central Processing Unit (CPU)</h3>
                  <span className="text-[11px] font-mono text-slate-400">{activeConsole.cpuName}</span>
                </div>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Architecture & ISA</span>
                  <span className="text-slate-200">{activeConsole.cpuArch}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Cores & Threads</span>
                  <span className="text-cyan-300 font-semibold">{activeConsole.cpuCores}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Clock Rate</span>
                  <span className="text-emerald-400 font-bold text-sm">{activeConsole.cpuClock}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">SIMD Vector Extensions</span>
                  <span className="text-slate-300">{activeConsole.cpuSimd}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Cache Hierarchy</span>
                  <span className="text-slate-400 text-[11px]">{activeConsole.cpuCache}</span>
                </div>
              </div>
            </div>

            {/* GPU Subsystem */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                <Layers className="w-5 h-5 text-pink-400" />
                <div>
                  <h3 className="font-sans font-bold text-sm text-white">Graphics Processing Unit (GPU)</h3>
                  <span className="text-[11px] font-mono text-slate-400">{activeConsole.gpuName}</span>
                </div>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">GPU Architecture</span>
                  <span className="text-slate-200">{activeConsole.gpuArch}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Core Frequency</span>
                  <span className="text-pink-300 font-bold">{activeConsole.gpuClock}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Compute Throughput</span>
                  <span className="text-amber-400 font-bold text-sm">{activeConsole.gpuCompute}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Shader Units</span>
                  <span className="text-slate-300">{activeConsole.gpuShaders}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Architectural Features</span>
                  <ul className="mt-1 space-y-1 text-[11px] text-slate-400">
                    {activeConsole.gpuFeatures.map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Memory & Storage Subsystem */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                <Database className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-sans font-bold text-sm text-white">Memory & Storage</h3>
                  <span className="text-[11px] font-mono text-slate-400">Bandwidth & Low Latency</span>
                </div>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Capacity & Technology</span>
                  <span className="text-emerald-300 font-semibold">{activeConsole.ramSize}</span>
                  <span className="text-slate-400 block text-[11px]">{activeConsole.ramType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Memory Bandwidth</span>
                  <span className="text-cyan-400 font-bold text-sm">{activeConsole.ramBandwidth}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Mass Storage Subsystem</span>
                  <span className="text-slate-300">{activeConsole.storageType}</span>
                </div>
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 leading-relaxed font-sans">
                    All components are modeled with C/C++ cycle simulations in the <strong>Source Files</strong> tab.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Operating System & Kernel Architecture Deep Dive */}
          <div className="bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-slate-950 border border-indigo-500/30 rounded-xl p-5 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-sans font-bold text-base text-white">
                      {activeConsole.osName}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                      {activeConsole.osFirmwareVersion}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">
                    {activeConsole.osKernelType} • Shell: {activeConsole.osShellUi}
                  </p>
                </div>
              </div>

              {/* OS Source Code Launcher */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">Kernel Source Files:</span>
                {activeConsole.osSourceFiles.map(fid => {
                  const target = files.find(f => f.id === fid || f.name.includes(fid));
                  return (
                    <button
                      key={fid}
                      id={`open-os-src-${fid}`}
                      onClick={() => onSelectSourceFile(fid)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded bg-indigo-950/70 hover:bg-indigo-900/90 text-indigo-200 border border-indigo-500/50 font-mono text-xs transition-colors shadow-sm"
                      title="Open OS/Kernel source file"
                    >
                      <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{target ? target.name : fid}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* OS Specs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 space-y-1.5">
                <span className="text-slate-500 block text-[10px] uppercase">Memory Partitioning</span>
                <span className="text-white font-semibold block">{activeConsole.osMemoryPartition}</span>
                <span className="text-[11px] text-slate-400">Strict hardware ring 0 isolation between title & background OS</span>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 space-y-1.5">
                <span className="text-slate-500 block text-[10px] uppercase">Security Architecture</span>
                <span className="text-emerald-300 font-semibold block">{activeConsole.osSecurityModel}</span>
                <span className="text-[11px] text-slate-400">Cryptographic trust chain and hardware-isolated execution context</span>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 space-y-1.5">
                <span className="text-slate-500 block text-[10px] uppercase">Userland Environment</span>
                <span className="text-cyan-300 font-semibold block">{activeConsole.osShellUi}</span>
                <span className="text-[11px] text-slate-400">Hardware-accelerated dashboard & background system services</span>
              </div>
            </div>

            {/* Key Kernel Services & Capabilities */}
            <div>
              <span className="text-slate-400 text-xs font-mono uppercase tracking-wider block mb-2">
                Core Kernel Syscalls & Subsystem Features:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-xs">
                {activeConsole.osKeyFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-slate-950/40 border border-slate-800/60 rounded px-3 py-2 text-slate-300">
                    <span className="text-indigo-400 font-bold mt-0.5">•</span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hardware Components & Computer Parts Gallery */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Computer Components, Processors & Subsystem Silicon Gallery
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Inspect standalone CPU, GPU, Memory Controller, PCIe 5.0 Bus, and Motherboard VRM source models
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 w-fit">
            4 Component Categories • 16 Dedicated Silicon Engines
          </span>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. CPUs */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" /> Microprocessors (CPUs)
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  x86 / ARM / PPC / MIPS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Hybrid big.LITTLE architectures, stacked 3D V-Cache, unified ARMv9 dies, and heterogeneous DSP vector pipelines.
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="bg-slate-900/80 border border-slate-800 rounded p-2 text-slate-300">
                  <div className="font-semibold text-white">Intel Core i9-14900KS</div>
                  <div className="text-[11px] text-slate-400">24C/32T • 6.2 GHz TVB • P/E Hybrid</div>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded p-2 text-slate-300">
                  <div className="font-semibold text-white">AMD Ryzen 9 7950X3D</div>
                  <div className="text-[11px] text-slate-400">16C/32T • 128MB 3D V-Cache • AVX-512</div>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded p-2 text-slate-300">
                  <div className="font-semibold text-white">Apple M3 Max SoC</div>
                  <div className="text-[11px] text-slate-400">16C ARMv9 • 128GB UMA @ 400 GB/s</div>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800/60 flex flex-wrap gap-1.5">
              <button
                onClick={() => onSelectSourceFile('intel-raptor-lake-cpp')}
                className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 hover:bg-cyan-500/20 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition-all flex items-center gap-1"
              >
                <Code2 className="w-3 h-3" /> i9-14900KS.cpp
              </button>
              <button
                onClick={() => onSelectSourceFile('amd-zen4-x3d-cpp')}
                className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 hover:bg-red-500/20 text-red-300 border border-slate-700 hover:border-red-500/40 transition-all flex items-center gap-1"
              >
                <Code2 className="w-3 h-3" /> 7950X3D.cpp
              </button>
              <button
                onClick={() => onSelectSourceFile('apple-m3-max-cpp')}
                className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 hover:bg-emerald-500/20 text-emerald-300 border border-slate-700 hover:border-emerald-500/40 transition-all flex items-center gap-1"
              >
                <Code2 className="w-3 h-3" /> M3Max.cpp
              </button>
            </div>
          </div>

          {/* 2. GPUs */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" /> Graphics Processors (GPUs)
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-300 border border-pink-500/20">
                  Ada / RDNA3 / NV47
                </span>
              </div>
              <p className="text-xs text-slate-400">
                16K CUDA cores, multi-die chiplet graphics, Shader Execution Reordering, and optical flow frame generators.
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="bg-slate-900/80 border border-slate-800 rounded p-2 text-slate-300">
                  <div className="font-semibold text-white">NVIDIA GeForce RTX 4090</div>
                  <div className="text-[11px] text-slate-400">16,384 CUDA • SER • 4th Gen Tensor</div>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded p-2 text-slate-300">
                  <div className="font-semibold text-white">AMD Radeon RX 7900 XTX</div>
                  <div className="text-[11px] text-slate-400">Navi 31 Chiplet • 96 CUs • Dual-Issue</div>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded p-2 text-slate-300">
                  <div className="font-semibold text-white">Sony PS5 RDNA 2 GPU</div>
                  <div className="text-[11px] text-slate-400">36 CUs @ 2.23 GHz • 10.28 TFLOPS</div>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800/60 flex flex-wrap gap-1.5">
              <button
                onClick={() => onSelectSourceFile('nvidia-rtx4090-ada-cpp')}
                className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 hover:bg-pink-500/20 text-pink-300 border border-slate-700 hover:border-pink-500/40 transition-all flex items-center gap-1"
              >
                <Code2 className="w-3 h-3" /> rtx4090_ada.cpp
              </button>
              <button
                onClick={() => onSelectSourceFile('amd-rx7900xtx-rdna3-cpp')}
                className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 hover:bg-red-500/20 text-red-300 border border-slate-700 hover:border-red-500/40 transition-all flex items-center gap-1"
              >
                <Code2 className="w-3 h-3" /> rx7900xtx.cpp
              </button>
            </div>
          </div>

          {/* 3. Memory Subsystems */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" /> Memory & DRAM Controllers
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  DDR5 / GDDR6X / XDR
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dual 32-bit subchannels, on-die ODECC, PAM4 multi-level signaling, and embedded ultra-wide DRAM buffers.
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="bg-slate-900/80 border border-slate-800 rounded p-2 text-slate-300">
                  <div className="font-semibold text-white">DDR5-6400 Controller</div>
                  <div className="text-[11px] text-slate-400">4 Subchannels • ODECC • 102.4 GB/s</div>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded p-2 text-slate-300">
                  <div className="font-semibold text-white">Micron GDDR6X PAM4</div>
                  <div className="text-[11px] text-slate-400">384-bit bus @ 1,008 GB/s Bandwidth</div>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded p-2 text-slate-300">
                  <div className="font-semibold text-white">Rambus XDR DRAM & eDRAM</div>
                  <div className="text-[11px] text-slate-400">Octal Data Rate & 256 GB/s eDRAM</div>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800/60 flex flex-wrap gap-1.5">
              <button
                onClick={() => onSelectSourceFile('ddr5-memory-controller-cpp')}
                className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 hover:bg-amber-500/20 text-amber-300 border border-slate-700 hover:border-amber-500/40 transition-all flex items-center gap-1"
              >
                <Code2 className="w-3 h-3" /> ddr5_controller.cpp
              </button>
            </div>
          </div>

          {/* 4. Motherboard & Bus Controllers */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5" /> PCIe 5.0, VRM & Chipsets
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  32 GT/s • DirectStorage
                </span>
              </div>
              <p className="text-xs text-slate-400">
                PCIe Gen 5 Root Complex, NVMe 2.0 direct GPU DMA, 24-phase 105A DrMOS VRMs, and DMI 4.0 interconnects.
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="bg-slate-900/80 border border-slate-800 rounded p-2 text-slate-300">
                  <div className="font-semibold text-white">PCIe 5.0 NVMe Host</div>
                  <div className="text-[11px] text-slate-400">32 GT/s • DirectStorage 14.5 GB/s</div>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded p-2 text-slate-300">
                  <div className="font-semibold text-white">24+1+2 Digital VRM</div>
                  <div className="text-[11px] text-slate-400">105A Smart Power Stages • LLC 6</div>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded p-2 text-slate-300">
                  <div className="font-semibold text-white">Z790 / X670E Chipset</div>
                  <div className="text-[11px] text-slate-400">DMI 4.0 x8 • USB4 / TB4 40 Gbps</div>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800/60 flex flex-wrap gap-1.5">
              <button
                onClick={() => onSelectSourceFile('pcie5-nvme-controller-cpp')}
                className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 hover:bg-emerald-500/20 text-emerald-300 border border-slate-700 hover:border-emerald-500/40 transition-all flex items-center gap-1"
              >
                <Code2 className="w-3 h-3" /> pcie5_nvme.cpp
              </button>
              <button
                onClick={() => onSelectSourceFile('motherboard-vrm-chipset-cpp')}
                className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 hover:bg-emerald-500/20 text-emerald-300 border border-slate-700 hover:border-emerald-500/40 transition-all flex items-center gap-1"
              >
                <Code2 className="w-3 h-3" /> motherboard_vrm.cpp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
