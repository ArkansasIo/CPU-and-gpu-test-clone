import React from 'react';
import { Layers, Cpu, Database, Network, ShieldCheck, Zap, Server, HardDrive } from 'lucide-react';

export const CellSpecsView: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-105px)] bg-slate-950 overflow-y-auto p-6 space-y-6">
      {/* Title Hero */}
      <div className="border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-indigo-950/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
            STI Cell Broadband Engine Architecture (CBEA)
          </span>
          <span className="text-xs font-mono text-slate-400">Manufactured by Sony, Toshiba, & IBM</span>
        </div>
        <h2 className="text-xl font-bold text-white font-sans tracking-tight">
          PlayStation 3 Cell B.E. Hardware & Architectural Dossier
        </h2>
        <p className="text-xs text-slate-300 font-sans mt-2 max-w-3xl leading-relaxed">
          The Cell Broadband Engine represents one of the most innovative and ambitious microarchitectures in computing history.
          Departing from traditional monolithic cache-coherent multi-core designs, Cell combined a general-purpose 64-bit PowerPC
          controller with high-throughput 128-bit SIMD co-processors equipped with software-managed scratchpad Local Stores.
        </p>
      </div>

      {/* Hardware Specs Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400">
            <Cpu className="w-5 h-5" />
            <h3 className="font-sans font-bold text-xs uppercase text-slate-200">Core Frequency</h3>
          </div>
          <p className="text-2xl font-bold text-white font-mono">3.20 GHz</p>
          <p className="text-[11px] text-slate-400">
            Manufactured on 90nm (Launch 2006) down to 45nm SOI CMOS (Slim 2009). 234M transistors.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-400">
            <Layers className="w-5 h-5" />
            <h3 className="font-sans font-bold text-xs uppercase text-slate-200">Core Topology</h3>
          </div>
          <p className="text-2xl font-bold text-white font-mono">1 PPE + 8 SPEs</p>
          <p className="text-[11px] text-slate-400">
            PS3: 6 Game SPEs + 1 OS SPE + 1 Disabled for fab yield. PPE features 2-way SMT.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400">
            <Network className="w-5 h-5" />
            <h3 className="font-sans font-bold text-xs uppercase text-slate-200">EIB Ring Bus</h3>
          </div>
          <p className="text-2xl font-bold text-white font-mono">204.8 GB/s</p>
          <p className="text-[11px] text-slate-400">
            4 unidirectional 16-byte rings clocked at 1.6 GHz connecting PPE, SPEs, MIC, and FlexIO.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <Database className="w-5 h-5" />
            <h3 className="font-sans font-bold text-xs uppercase text-slate-200">Main Memory</h3>
          </div>
          <p className="text-2xl font-bold text-white font-mono">25.6 GB/s</p>
          <p className="text-[11px] text-slate-400">
            256 MB Rambus XDR DRAM on 64-bit bus clocked at 3.2 GHz (3.2 Gbps Octal Data Rate).
          </p>
        </div>
      </div>

      {/* Detailed Architectural Comparison Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PPE Module */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <Server className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-sans font-bold text-sm text-white">Power Processing Element (PPE)</h3>
              <span className="text-[11px] font-mono text-slate-400">64-bit PowerPC Architecture v2.02</span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed font-sans">
            <p>
              The PPE is the primary controller of the Cell B.E. It runs the operating system (PlayStation GameOS / Cell OS Lv2)
              and orchestrates workload scheduling for the worker SPEs.
            </p>
            <ul className="space-y-1.5 font-mono text-[11px] text-slate-400 pl-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                <span><strong>SMT2:</strong> 2-thread simultaneous multithreading in hardware</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                <span><strong>Registers:</strong> 32 x 64-bit GPRs, 32 x 64-bit FPRs, 32 x 128-bit VMX/AltiVec</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                <span><strong>Caches:</strong> 32 KB L1 Instruction + 32 KB L1 Data, 512 KB unified L2 cache</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                <span><strong>Execution:</strong> In-order dual-issue 23-stage pipeline</span>
              </li>
            </ul>
          </div>
        </div>

        {/* SPE Module */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <Zap className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-sans font-bold text-sm text-white">Synergistic Processing Elements (SPE)</h3>
              <span className="text-[11px] font-mono text-slate-400">SPU 128-bit SIMD RISC + MFC DMA Engine</span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed font-sans">
            <p>
              Each SPE is an independent SIMD powerhouse. Crucially, SPU cores do <em>not</em> feature hardware caches;
              instead, they operate directly inside a private, high-speed 256 KB SRAM Local Store with explicit DMA transfers.
            </p>
            <ul className="space-y-1.5 font-mono text-[11px] text-slate-400 pl-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span><strong>Unified Register File:</strong> 128 x 128-bit registers (quadwords)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span><strong>Local Store:</strong> 256 KB single-cycle SRAM for instructions and data</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span><strong>Dual-Issue:</strong> Even Pipe (FP/FX1/LS) + Odd Pipe (BR/SHUF/MFC Channel)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span><strong>MFC Engine:</strong> Up to 16 outstanding DMA transfers per SPE</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* RSX Reality Synthesizer & Southbridge Subsystems */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RSX GPU */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <Layers className="w-5 h-5 text-pink-400" />
            <div>
              <h3 className="font-sans font-bold text-sm text-white">NVIDIA RSX Reality Synthesizer (GPU)</h3>
              <span className="text-[11px] font-mono text-slate-400">550 MHz G70/NV47 Architecture + 256 MB GDDR3</span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed font-sans">
            <p>
              Custom GPU co-developed with NVIDIA. Connected to Cell via high-speed Rambus FlexIO interface (20 GB/s read, 15 GB/s write),
              allowing the Cell SPU cores to directly feed vertex streams and procedural geometry directly to the GPU.
            </p>
            <ul className="space-y-1.5 font-mono text-[11px] text-slate-400 pl-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                <span><strong>VRAM:</strong> 256 MB GDDR3 clocked at 650 MHz (22.4 GB/s bandwidth)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                <span><strong>Pipelines:</strong> 8 Parallel Vertex Shaders + 24 Parallel Pixel Shaders + 8 ROPs</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                <span><strong>Command FIFO:</strong> Ring buffer in XDR DRAM with method dispatch</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                <span><strong>Texture Units:</strong> 16 Texturing Units with ARGB8888, DXT1/3/5, and FP16/32 support</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Southbridge Companion Chip */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <Server className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-sans font-bold text-sm text-white">Southbridge Companion Chip & I/O</h3>
              <span className="text-[11px] font-mono text-slate-400">SATA, 2x BD-ROM, GbE, USB 2.0, & Syscon</span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed font-sans">
            <p>
              The Southbridge connects to the Cell processor via FlexIO downstream links, handling legacy and real-world system interfaces.
              It interfaces with the Syscon microcontroller for thermal monitoring and power sequencing.
            </p>
            <ul className="space-y-1.5 font-mono text-[11px] text-slate-400 pl-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span><strong>Blu-ray Drive:</strong> 2x CLV BD-ROM (9 MB/s transfer rate, 25GB/50GB dual-layer)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span><strong>Internal Storage:</strong> 2.5" SATA-150 HDD (20GB / 60GB / 80GB Launch)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span><strong>Networking:</strong> Marvell Alaska 1000BASE-T Gigabit Ethernet</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span><strong>Syscon & Thermal:</strong> Dynamic fan speed PWM curves based on Cell/RSX die sensors</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* The Double-Buffering Programming Model */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="font-sans font-bold text-sm text-white flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-emerald-400" />
          <span>The Cell Programming Model: DMA Double-Buffering (Ping-Pong)</span>
        </h3>
        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          Because the SPE has no hardware cache, cache misses never stall the execution pipeline. Instead, game developers
          divided the 256 KB Local Store into double buffers (<code className="text-cyan-300 font-mono">Buffer A</code> and <code className="text-cyan-300 font-mono">Buffer B</code>).
          While the SPU's 128-bit vector arithmetic units compute on Buffer A, the autonomous Memory Flow Controller (MFC) asynchronously
          fetches the next chunk of geometry or audio data from main memory into Buffer B via the 204.8 GB/s EIB bus.
        </p>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-400">
          <div className="text-cyan-300 font-bold mb-1">Double-Buffering Flow:</div>
          <div>Cycle T:   [Compute on Buffer A] &lt;---- Overlapped with ----&gt; [DMA Fetch Buffer B via EIB]</div>
          <div>Cycle T+1: [DMA Writeback Buffer A] &lt;---- Overlapped with ----&gt; [Compute on Buffer B]</div>
        </div>
      </div>
    </div>
  );
};
