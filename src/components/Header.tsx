import React from 'react';
import { 
  Cpu, 
  Code2, 
  PlayCircle, 
  Network, 
  BookOpen, 
  Layers, 
  Download, 
  Sparkles,
  Activity,
  Gamepad2
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'sources' | 'simulator' | 'eib' | 'isa' | 'specs' | 'consoles';
  setActiveTab: (tab: 'sources' | 'simulator' | 'eib' | 'isa' | 'specs' | 'consoles') => void;
  onDownloadAllZip: () => void;
  isZipping: boolean;
  totalFiles: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onDownloadAllZip,
  isZipping,
  totalFiles
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-40">
      {/* Top Telemetry Strip */}
      <div className="border-b border-slate-800/60 px-4 py-1.5 flex items-center justify-between text-xs font-mono text-slate-400 bg-slate-900/40">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-300 font-semibold">CELL B.E. ARCHITECTURE</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-slate-400">
            <span className="text-slate-500">CLOCK:</span>
            <span className="text-cyan-400 font-medium">3.20 GHz</span>
          </div>
          <div className="hidden md:flex items-center gap-1 text-slate-400">
            <span className="text-slate-500">PPE:</span>
            <span className="text-slate-300">64-bit PowerPC (SMT2)</span>
          </div>
          <div className="hidden md:flex items-center gap-1 text-slate-400">
            <span className="text-slate-500">SPEs:</span>
            <span className="text-amber-400 font-medium">7 Active</span>
            <span className="text-slate-500 text-[11px]">(6 Game + 1 OS)</span>
          </div>
          <div className="hidden lg:flex items-center gap-1 text-slate-400">
            <span className="text-slate-500">XDR DRAM:</span>
            <span className="text-emerald-400">256 MB (25.6 GB/s)</span>
          </div>
          <div className="hidden xl:flex items-center gap-1 text-slate-400">
            <span className="text-slate-500">RSX GPU:</span>
            <span className="text-pink-400 font-medium">550 MHz (256 MB GDDR3)</span>
          </div>
          <div className="hidden 2xl:flex items-center gap-1 text-slate-400">
            <span className="text-slate-500">EIB RING:</span>
            <span className="text-indigo-400 font-medium">204.8 GB/s</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-400">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300">{totalFiles} Source Files</span>
          </div>
          <button
            id="download-zip-btn"
            onClick={onDownloadAllZip}
            disabled={isZipping}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 transition-all font-mono text-xs disabled:opacity-50"
            title="Download complete Cell B.E. source tree as ZIP"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isZipping ? 'Generating ZIP...' : 'Export Source Tree (.zip)'}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="px-4 py-3 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-cyan-950/50 border border-cyan-400/30">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white font-sans">
                PS3 Cell B.E. CPU Source Suite
              </h1>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                STI Cell Broadband Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              CBEA Emulator Cores, SPU 128-bit SIMD Pipelines, MFC DMA, & EIB Bus Source
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
          <button
            id="nav-tab-sources"
            onClick={() => setActiveTab('sources')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'sources'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Source Files</span>
          </button>

          <button
            id="nav-tab-simulator"
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'simulator'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <PlayCircle className="w-4 h-4" />
            <span>SPU Live Simulator</span>
          </button>

          <button
            id="nav-tab-eib"
            onClick={() => setActiveTab('eib')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'eib'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>EIB 4-Ring Bus</span>
          </button>

          <button
            id="nav-tab-isa"
            onClick={() => setActiveTab('isa')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'isa'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>SPU ISA Reference</span>
          </button>

          <button
            id="nav-tab-specs"
            onClick={() => setActiveTab('specs')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'specs'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Architecture Specs</span>
          </button>

          <button
            id="nav-tab-consoles"
            onClick={() => setActiveTab('consoles')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'consoles'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Consoles & Hardware</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
