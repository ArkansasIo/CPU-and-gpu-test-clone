import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Cpu, 
  Zap, 
  Activity, 
  Layers, 
  ShieldCheck, 
  Maximize2, 
  Play, 
  RotateCcw, 
  Flame, 
  Eye, 
  Binary, 
  Atom, 
  Dna, 
  Globe2, 
  ArrowRight, 
  CheckCircle2, 
  Sliders, 
  Waves
} from 'lucide-react';
import { SourceFile } from '../types/cell';
import { soundEngine } from '../utils/audioFeedback';

interface CenturyArchitectureExplorerProps {
  onSelectSourceFile: (file: SourceFile) => void;
  files: SourceFile[];
}

export const CenturyArchitectureExplorer: React.FC<CenturyArchitectureExplorerProps> = ({
  onSelectSourceFile,
  files
}) => {
  const [selectedEra, setSelectedEra] = useState<'2035' | '2050' | '2055' | '2075' | '2126'>('2035');

  // Interactive controls for 2035 CFET
  const [vcoreVoltage, setVcoreVoltage] = useState(0.55);
  const [coolingPumpActive, setCoolingPumpActive] = useState(true);
  const [opticalChannels, setOpticalChannels] = useState(64);
  const [cfetTemp, setCfetTemp] = useState(38.4);

  // Interactive controls for 2050 Photonic TPU
  const [laserPhase, setLaserPhase] = useState(180);
  const [photonicRunning, setPhotonicRunning] = useState(false);
  const [photonicOpsCount, setPhotonicOpsCount] = useState(1.05);

  // Interactive controls for 2055 Majorana QPU
  const [braidCount, setBraidCount] = useState(128);
  const [quantumParity, setQuantumParity] = useState<'Even' | 'Odd' | 'Superposition'>('Superposition');
  const [isBraiding, setIsBraiding] = useState(false);

  // Interactive controls for 2075 Neuromorphic Bio-Silicon
  const [spikeFrequencyHz, setSpikeFrequencyHz] = useState(40);
  const [astrocyteWave, setAstrocyteWave] = useState(0.85);
  const [synapticFiredCount, setSynapticFiredCount] = useState(420);

  // Interactive controls for 2126 Computronium
  const [entropyRate, setEntropyRate] = useState(0.000);
  const [spacetimeMetricWarp, setSpacetimeMetricWarp] = useState(1.0);
  const [computroniumOpsScale, setComputroniumOpsScale] = useState(42); // 10^42

  // Live Multi-Era Benchmark Runner
  const [benchmarkRunning, setBenchmarkRunning] = useState(false);
  const [benchmarkProgress, setBenchmarkProgress] = useState(0);
  const [benchmarkResults, setBenchmarkResults] = useState<{
    cellTime: string;
    pcTime: string;
    cfetTime: string;
    photonicTime: string;
    bioTime: string;
    computroniumTime: string;
  } | null>(null);

  const futureComputerScienceTracks = [
    {
      title: 'Hardware & Materials',
      items: ['CFET and 3D silicon', 'Photonic logic', 'Quantum processors', 'Neuromorphic hardware', 'Bio-silicon systems', 'Non-von Neumann architectures']
    },
    {
      title: 'Programming Languages',
      items: ['Low-level systems languages', 'Safe and verified languages', 'Quantum and probabilistic languages', 'AI-native languages', 'Unified programming language (UPL)', 'Domain-specific languages', 'Human-centered programming abstractions']
    },
    {
      title: 'Algorithms & Computation',
      items: ['Optimization and search', 'Graph and probabilistic algorithms', 'Quantum algorithms', 'Neural-symbolic learning', 'Self-improving compilers', 'Distributed intelligence routines']
    },
    {
      title: 'Calculus, Math & Theory',
      items: ['Differential equations', 'Probability and statistics', 'Graph theory', 'Information theory', 'Category theory', 'Complexity and computability']
    },
    {
      title: 'Formal Methods & Verification',
      items: ['Model checking', 'Theorem proving', 'Type systems', 'SAT/SMT solving', 'Formal security proofs', 'Verified AI and robotics control']
    },
    {
      title: 'Systems & Networking',
      items: ['Operating systems', 'Distributed systems', 'Cloud and edge compute', 'Secure protocols', 'Global computer fabrics', 'Autonomous infrastructure']
    },
    {
      title: 'AI, Cognitive & Human Systems',
      items: ['Machine learning', 'Reasoning agents', 'Human-AI co-creation', 'Adaptive interfaces', 'Cognitive architectures', 'Ethical and governance systems']
    },
    {
      title: 'Security, Privacy & Trust',
      items: ['Cryptography', 'Zero-trust design', 'Homomorphic encryption', 'Cybersecurity', 'Identity systems', 'Trustworthy autonomous systems']
    }
  ];

  // Auto thermal update for 2035
  useEffect(() => {
    const base = 30 + (vcoreVoltage - 0.4) * 35;
    const cooled = coolingPumpActive ? base * 0.8 : base * 1.5;
    setCfetTemp(parseFloat(cooled.toFixed(1)));
  }, [vcoreVoltage, coolingPumpActive]);

  // Run Benchmark across all centuries
  const handleRunCenturyBenchmark = () => {
    soundEngine.playBusBurst(0.35);
    setBenchmarkRunning(true);
    setBenchmarkProgress(0);
    setBenchmarkResults(null);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setBenchmarkProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setBenchmarkRunning(false);
        soundEngine.playQuantumPing(0.4);
        setBenchmarkResults({
          cellTime: '1,420.00 ms (204.8 GFLOPS)',
          pcTime: '18.40 ms (82.6 TFLOPS)',
          cfetTime: '1.20 ms (850.0 TFLOPS)',
          photonicTime: '0.00088 ms (1,048,576 TFLOPS)',
          bioTime: '0.00004 ms (Synthetic 100B Synaptic)',
          computroniumTime: '0.000000000001 ms (10^42 ops/sec Reversible)'
        });
      }
    }, 250);
  };

  const handleOpenSourceCode = (fileName: string) => {
    soundEngine.playClick(0.3);
    const target = files.find(f => f.name.includes(fileName));
    if (target) {
      onSelectSourceFile(target);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-xl bg-gradient-to-r from-cyan-950/60 via-indigo-950/40 to-slate-900/80 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
              Centenary Technology Roadmap
            </span>
            <span className="text-xs text-slate-400 font-mono">2026 — 2126 (100 Years)</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Author & Developed by Stephen Deline Jr.
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            Next-Generation Silicon, Photonic, Quantum & Computronium Architectures
          </h2>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            From 1nm CFET 3D stacked transistors and all-optical light-speed tensor accelerators to topological Majorana anyons, 100-billion neuron bio-silicon, and thermodynamic reversible computronium.
          </p>
        </div>

        <div className="flex items-center gap-2.5 z-10">
          <button
            id="btn-run-century-benchmark"
            onClick={handleRunCenturyBenchmark}
            disabled={benchmarkRunning}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono text-xs font-semibold shadow-lg shadow-cyan-950/50 transition-all border border-cyan-400/30 disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${benchmarkRunning ? 'animate-spin' : ''}`} />
            <span>{benchmarkRunning ? `Simulating ${benchmarkProgress}%...` : 'Run 100-Year Hardware Benchmark'}</span>
          </button>
        </div>
      </div>

      <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300 font-mono font-bold">
              Next 10,000 Years of Computer Science
            </div>
            <h3 className="mt-2 text-xl font-bold text-white">
              Computing, programming, mathematics, theory, and the full future of machines
            </h3>
          </div>
          <div className="px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-[10px] font-mono uppercase tracking-[0.2em]">
            10k Year Horizon
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {futureComputerScienceTracks.map((track) => (
            <div key={track.title} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
              <div className="mb-2 text-sm font-semibold text-cyan-300">{track.title}</div>
              <ul className="space-y-1.5 text-[11px] text-slate-300 leading-relaxed">
                {track.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-950 to-cyan-950/30 p-4">
          <div className="text-[10px] uppercase tracking-[0.22em] text-indigo-300 font-mono font-bold mb-2">
            Core vision
          </div>
          <p className="text-sm text-slate-200 leading-relaxed">
            Over the next 10,000 years, computer science will combine hardware, software, mathematics, logic, language design, and physics into a unified field of programmable reality. The discipline will expand from silicon and networks into quantum computing, biological intelligence, formal proof, autonomous systems, and the design of trustworthy intelligence that can reason, verify, and evolve under human values.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-mono text-slate-300">
            {['Computer architecture', 'Programming languages', 'Algorithms', 'Calculus', 'Formal methods', 'Theory of computation', 'Distributed systems', 'Cybersecurity', 'AI ethics', 'Autonomous design'].map((tag) => (
              <span key={tag} className="rounded-full border border-slate-700 bg-slate-900/80 px-2 py-1">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4">
          <div className="rounded-lg border border-cyan-500/30 bg-slate-950/80 p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300 font-mono font-bold mb-3">
              Unified Programming Language (UPL)
            </div>
            <pre className="overflow-x-auto rounded-md border border-slate-800 bg-slate-900 p-3 text-[11px] leading-relaxed text-cyan-100 font-mono">
{`resource budget energy=1nJ latency=50ps memory=4GB {
  task matrix_compute = PhotonicMatrixMultiply(inputs, weights)
  proof invariant safety: output_is_deterministic && no_overflow
  compile target = Quantum + Classical + Neuromorphic
  verify contract = "trustworthy_autonomous_reasoning"
  return result
}`}
            </pre>
          </div>

          <div className="rounded-lg border border-violet-500/30 bg-gradient-to-br from-violet-950/40 to-slate-950 p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-violet-300 font-mono font-bold mb-3">
              Language goals
            </div>
            <ul className="space-y-2 text-sm text-slate-200">
              <li>• One syntax across hardware, software, AI, and proof.</li>
              <li>• Native contracts for safety, resources, and trust.</li>
              <li>• Compiles to CPU, GPU, photonic, quantum, and bio-silicon targets.</li>
              <li>• Supports reasoning, learning, verification, and execution together.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Era Navigation Timeline */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          {
            id: '2035',
            year: 'Year 2035 (10-Yr)',
            title: '1nm CFET 3D Angstrom',
            icon: Cpu,
            accent: 'cyan',
            badge: 'Sub-1nm GAAFET'
          },
          {
            id: '2050',
            year: 'Year 2050 (25-Yr)',
            title: 'All-Photonic TPU (Light)',
            icon: Waves,
            accent: 'emerald',
            badge: 'Speed of Light'
          },
          {
            id: '2055',
            year: 'Year 2055 (30-Yr)',
            title: 'Topological Majorana QPU',
            icon: Atom,
            accent: 'purple',
            badge: '10,240 Anyon Qubits'
          },
          {
            id: '2075',
            year: 'Year 2075 (50-Yr)',
            title: 'Neuromorphic Bio-Silicon',
            icon: Dna,
            accent: 'pink',
            badge: '100B Brain-Scale'
          },
          {
            id: '2126',
            year: 'Year 2126 (100-Yr)',
            title: 'Reversible Computronium',
            icon: Globe2,
            accent: 'amber',
            badge: 'Landauer Bound (0W)'
          }
        ].map(era => {
          const Icon = era.icon;
          const isActive = selectedEra === era.id;
          return (
            <button
              key={era.id}
              id={`era-tab-${era.id}`}
              onClick={() => {
                soundEngine.playClick(0.25);
                setSelectedEra(era.id as typeof selectedEra);
              }}
              className={`p-3.5 rounded-xl text-left border transition-all relative overflow-hidden ${
                isActive
                  ? 'bg-slate-900/90 border-cyan-500 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/50'
                  : 'bg-slate-900/40 hover:bg-slate-900/70 border-slate-800/80 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  {era.year}
                </span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                  isActive ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400'
                }`}>
                  {era.badge}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-md flex items-center justify-center ${
                  isActive ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="font-semibold text-xs text-white truncate">
                  {era.title}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Architecture Interactive Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Architectural Schematic & Simulation Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Era 2035: CFET 3D GAAFET */}
          {selectedEra === '2035' && (
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-sans">
                      2035: 1nm Monolithic 3D Complementary-FET (CFET) Processor
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Stacked NMOS-over-PMOS RibbonFET + Backside Power (BSPDN) + 12.8 Tbps CPO Waveguide
                    </p>
                  </div>
                </div>
                <button
                  id="btn-inspect-2035-src"
                  onClick={() => handleOpenSourceCode('century_cpu_cfet_angstrom')}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono text-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Source (.cpp)</span>
                </button>
              </div>

              {/* Silicon Visualizer */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 space-y-3 font-mono text-xs">
                <div className="text-slate-400 flex items-center justify-between">
                  <span>CFET Physical Layer Vertical Topology:</span>
                  <span className="text-cyan-400 font-bold">Die Temp: {cfetTemp}°C</span>
                </div>
                
                <div className="space-y-1.5">
                  <div className="p-2.5 rounded bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between">
                    <span className="text-cyan-300 font-semibold">Tier 2: NMOS 4-Ribbon Nanosheets (8.40 GHz Clock)</span>
                    <span className="text-slate-400 text-[11px]">32 P-Cores / 450 Billion Transistors</span>
                  </div>
                  <div className="p-1 rounded bg-slate-800/60 text-center text-[10px] text-slate-400 border border-slate-700/50">
                    Dielectric Isolation Barrier & Nano-TSV Vertical Pitch (42nm)
                  </div>
                  <div className="p-2.5 rounded bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
                    <span className="text-indigo-300 font-semibold">Tier 1: PMOS 4-Ribbon Nanosheets (4.20 GHz Efficiency)</span>
                    <span className="text-slate-400 text-[11px]">64 E-Cores / 256MB SOT-MRAM L3</span>
                  </div>
                  <div className="p-2.5 rounded bg-amber-950/30 border border-amber-500/30 flex items-center justify-between">
                    <span className="text-amber-300 font-semibold">Backside Power Delivery Network (BSPDN / Buried Rails)</span>
                    <span className="text-amber-400 text-[11px]">Vcore: {vcoreVoltage}V (-92% IR Drop)</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                    <span className="text-emerald-300 font-semibold">Synthetic Diamond Substrate + Microfluidic Gallium Loop</span>
                    <span className="text-emerald-400 text-[11px]">{coolingPumpActive ? 'Micro-Pump ACTIVE (0.94 efficiency)' : 'PUMP IDLE'}</span>
                  </div>
                </div>
              </div>

              {/* Interactive Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-mono flex items-center justify-between">
                    <span>Vcore Rail:</span>
                    <span className="text-cyan-400 font-bold">{vcoreVoltage} V</span>
                  </label>
                  <input
                    type="range"
                    min="0.45"
                    max="0.85"
                    step="0.05"
                    value={vcoreVoltage}
                    onChange={(e) => setVcoreVoltage(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-mono flex items-center justify-between">
                    <span>Optical DWDM:</span>
                    <span className="text-cyan-400 font-bold">{opticalChannels} Channels</span>
                  </label>
                  <input
                    type="range"
                    min="16"
                    max="128"
                    step="16"
                    value={opticalChannels}
                    onChange={(e) => setOpticalChannels(parseInt(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <button
                    onClick={() => {
                      soundEngine.playClick(0.3);
                      setCoolingPumpActive(!coolingPumpActive);
                    }}
                    className={`px-3 py-2 rounded-lg font-mono text-xs font-semibold border transition-all ${
                      coolingPumpActive
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {coolingPumpActive ? 'Liquid GaIn Cooling: ON' : 'Liquid GaIn Cooling: OFF'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Era 2050: All-Photonic TPU */}
          {selectedEra === '2050' && (
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Waves className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-sans">
                      2050: All-Optical Silicon Photonic Tensor Accelerator (OPU / TPU)
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Speed of Light Matrix Multiply (1550nm Laser) • 1,048,576 TFLOPS • 88.4 Picoseconds
                    </p>
                  </div>
                </div>
                <button
                  id="btn-inspect-2050-src"
                  onClick={() => handleOpenSourceCode('century_gpu_photonic_tpu')}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Source (.cpp)</span>
                </button>
              </div>

              {/* Mach-Zehnder Interferometer Simulation Canvas */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>4096 x 4096 Mach-Zehnder Interferometer (MZI) Mesh Beam:</span>
                  <span className="text-emerald-400 font-bold">Carrier: 193.4 THz (1550 nm)</span>
                </div>

                <div className="relative h-28 bg-slate-900/90 rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center">
                  <div className={`absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-cyan-500/20 to-emerald-500/10 ${photonicRunning ? 'animate-pulse' : ''}`} />
                  
                  {/* Waveguide Beam Lines */}
                  <div className="w-full flex items-center justify-between px-6 z-10">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-emerald-400">Quantum Dot Lasers</span>
                      <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping my-1" />
                      <span className="text-[9px] text-slate-500">Emission</span>
                    </div>

                    <div className="flex-1 px-4 flex items-center justify-center">
                      <div className="w-full h-1 bg-gradient-to-r from-emerald-400 via-cyan-300 to-emerald-400 rounded-full shadow-lg shadow-emerald-400/50" />
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-cyan-400">MZI Mesh Shift</span>
                      <span className="text-xs font-bold text-white my-1">{laserPhase}° Phase</span>
                      <span className="text-[9px] text-slate-500">Unitary Weight Matrix</span>
                    </div>

                    <div className="flex-1 px-4 flex items-center justify-center">
                      <div className="w-full h-1 bg-gradient-to-r from-cyan-300 via-emerald-400 to-cyan-300 rounded-full shadow-lg shadow-cyan-400/50" />
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-purple-400">Photodetector Array</span>
                      <span className="w-3 h-3 rounded-full bg-purple-400 my-1" />
                      <span className="text-[9px] text-slate-500">Output Result</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Propagation Delay: <strong className="text-emerald-400">88.4 picoseconds</strong></span>
                  <span>Energy per MAC: <strong className="text-cyan-400">1.2 femtojoules</strong> (No wire capacitance)</span>
                </div>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-mono flex items-center justify-between">
                    <span>Electro-Optic Phase Shifter Angle:</span>
                    <span className="text-emerald-400 font-bold">{laserPhase}°</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="15"
                    value={laserPhase}
                    onChange={(e) => setLaserPhase(parseInt(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      soundEngine.playBusBurst(0.3);
                      setPhotonicRunning(true);
                      setPhotonicOpsCount(prev => parseFloat((prev + 0.52).toFixed(2)));
                      setTimeout(() => setPhotonicRunning(false), 600);
                    }}
                    className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-semibold shadow-lg shadow-emerald-950/50 transition-all border border-emerald-400/30 flex items-center justify-center gap-2"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Stream 4096x4096 Photonic Tensor GEMM</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Era 2055: Topological Majorana QPU */}
          {selectedEra === '2055' && (
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                    <Atom className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-sans">
                      2055: Fault-Tolerant Topological Quantum Processor (Majorana Anyons)
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Non-Abelian Anyon Braiding Logic • 10,240 Logical Qubits • 10^-12 Error Rate
                    </p>
                  </div>
                </div>
                <button
                  id="btn-inspect-2055-src"
                  onClick={() => handleOpenSourceCode('century_quantum_majorana_qpu')}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono text-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Source (.h)</span>
                </button>
              </div>

              {/* Anyon Braiding Grid */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Topological Nanowire Superconductor Grid:</span>
                  <span className="text-purple-400 font-bold">Parity State: {quantumParity}</span>
                </div>

                <div className="h-32 bg-slate-900/90 rounded-lg border border-slate-800 p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Nanowire Array: 65,536 Superconducting Wires</span>
                    <span className="text-purple-300">Coherence: 72.0 Hours @ 1.5 K</span>
                  </div>

                  <div className="flex items-center justify-around">
                    {['γ₁', 'γ₂', 'γ₃', 'γ₄', 'γ₅', 'γ₆'].map((node, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isBraiding ? 'bg-purple-500 text-white animate-bounce' : 'bg-purple-950/60 text-purple-300 border border-purple-500/40'
                        }`}>
                          {node}
                        </div>
                        <span className="text-[9px] text-slate-500 mt-1">Majorana {i}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-[10px] text-slate-400 text-center">
                    Braid operations form non-abelian unitary gates protected by topology against environmental noise.
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    soundEngine.playQuantumPing(0.35);
                    setIsBraiding(true);
                    setBraidCount(prev => prev + 64);
                    setQuantumParity(prev => prev === 'Superposition' ? 'Even' : prev === 'Even' ? 'Odd' : 'Superposition');
                    setTimeout(() => setIsBraiding(false), 500);
                  }}
                  className="flex-1 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-semibold shadow-lg shadow-purple-950/50 transition-all border border-purple-400/30 flex items-center justify-center gap-2"
                >
                  <Atom className="w-3.5 h-3.5" />
                  <span>Execute Topological Anyon Braid Operation</span>
                </button>
                <div className="font-mono text-xs text-slate-400">
                  Total Braids: <strong className="text-purple-300">{braidCount}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Era 2075: Neuromorphic Bio-Silicon */}
          {selectedEra === '2075' && (
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
                    <Dna className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-sans">
                      2075: Whole-Brain Synthetic Neuromorphic Bio-Silicon Processor
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      100 Billion True Spike-Timing Neurons • 100 Trillion STDP Synapses • 18.5 Watts Total Draw
                    </p>
                  </div>
                </div>
                <button
                  id="btn-inspect-2075-src"
                  onClick={() => handleOpenSourceCode('century_neuromorphic_biosilicon')}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 font-mono text-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Source (.h)</span>
                </button>
              </div>

              {/* Synaptic Mesh Visualizer */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>In-Memory Memristive Synaptic Crossbar:</span>
                  <span className="text-pink-400 font-bold">18.5 Watts Active</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="p-2.5 rounded bg-pink-950/30 border border-pink-500/30 text-center">
                    <div className="text-xs font-bold text-pink-300">100 Billion</div>
                    <div className="text-[10px] text-slate-500">Plastic Neurons</div>
                  </div>
                  <div className="p-2.5 rounded bg-purple-950/30 border border-purple-500/30 text-center">
                    <div className="text-xs font-bold text-purple-300">100 Trillion</div>
                    <div className="text-[10px] text-slate-500">Memristor Synapses</div>
                  </div>
                  <div className="p-2.5 rounded bg-indigo-950/30 border border-indigo-500/30 text-center">
                    <div className="text-xs font-bold text-indigo-300">10 fJ / Event</div>
                    <div className="text-[10px] text-slate-500">Energy Per Spike</div>
                  </div>
                  <div className="p-2.5 rounded bg-cyan-950/30 border border-cyan-500/30 text-center">
                    <div className="text-xs font-bold text-cyan-300">Continuous</div>
                    <div className="text-[10px] text-slate-500">STDP Plasticity</div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Astrocytic Glial Wave: <strong className="text-pink-300">{astrocyteWave} Ca2+ Modulation</strong></span>
                  <span>Spike Rate: <strong className="text-cyan-300">{spikeFrequencyHz} Hz Gamma Rhythm</strong></span>
                </div>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-mono flex items-center justify-between">
                    <span>Cortical Firing Rate (Gamma Band):</span>
                    <span className="text-pink-400 font-bold">{spikeFrequencyHz} Hz</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="120"
                    value={spikeFrequencyHz}
                    onChange={(e) => setSpikeFrequencyHz(parseInt(e.target.value))}
                    className="w-full accent-pink-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      soundEngine.playClick(0.3);
                      setSynapticFiredCount(prev => prev + 100);
                      setAstrocyteWave(prev => parseFloat((prev >= 1.0 ? 0.4 : prev + 0.15).toFixed(2)));
                    }}
                    className="w-full py-2.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-mono text-xs font-semibold shadow-lg shadow-pink-950/50 transition-all border border-pink-400/30 flex items-center justify-center gap-2"
                  >
                    <Dna className="w-3.5 h-3.5" />
                    <span>Trigger Astrocytic Calcium Neuro-Pulse</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Era 2126: Reversible Computronium */}
          {selectedEra === '2126' && (
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Globe2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-sans">
                      2126: Reversible Thermodynamic Computronium Substrate & Spacetime Metric Logic
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      10^42 Ops/Sec (Bremermann Bound) • Landauer Limit: 0.000W Dissipation • Reversible Fredkin Gates
                    </p>
                  </div>
                </div>
                <button
                  id="btn-inspect-2126-src"
                  onClick={() => handleOpenSourceCode('century_computronium_substrate')}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Source (.cpp)</span>
                </button>
              </div>

              {/* Computronium Physical Reality View */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Thermodynamic State:</span>
                  <span className="text-emerald-400 font-bold">dS/dt = {entropyRate.toFixed(6)} J/K (Zero Entropy)</span>
                </div>

                <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-500/30 space-y-2">
                  <div className="text-amber-300 font-semibold text-xs">
                    Sub-nuclear Femtotechnological Lattice Dynamics:
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    By implementing completely reversible Fredkin/Toffoli logic gates where no information bits are destroyed or overwritten, computation operates with zero thermodynamic entropy generation, achieving the fundamental Landauer thermodynamic floor.
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-300 pt-2 border-t border-amber-500/20">
                    <span>Spacetime Metric Tensor Delay: <strong className="text-amber-400">0.000000 ps</strong></span>
                    <span>Mass Conversion Efficiency: <strong className="text-emerald-400">100.00% Reversible</strong></span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-mono flex items-center justify-between">
                    <span>Spacetime Metric Warp Factor:</span>
                    <span className="text-amber-400 font-bold">{spacetimeMetricWarp.toFixed(2)} c</span>
                  </label>
                  <input
                    type="range"
                    min="1.0"
                    max="10.0"
                    step="0.5"
                    value={spacetimeMetricWarp}
                    onChange={(e) => setSpacetimeMetricWarp(parseFloat(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      soundEngine.playQuantumPing(0.4);
                      setEntropyRate(0.000000);
                      setComputroniumOpsScale(prev => prev + 1);
                    }}
                    className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-semibold shadow-lg shadow-amber-950/50 transition-all border border-amber-400/30 flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verify Reversible Zero-Entropy Logic</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Unified Century Hardware Benchmark Output */}
          {benchmarkResults && (
            <div className="p-5 rounded-xl bg-slate-900/90 border border-cyan-500/40 shadow-xl space-y-3 font-mono text-xs animate-fadeIn">
              <div className="flex items-center justify-between text-cyan-300 font-bold border-b border-slate-800 pb-2">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  100-Year Hardware Benchmark Execution Summary:
                </span>
                <span className="text-slate-400 text-[11px]">Workload: 10^12 Complex Matrix Tensors</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">2006 PS3 Cell B.E.:</span>
                  <span className="text-slate-300 font-semibold">{benchmarkResults.cellTime}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">2026 Modern PC (i9/4090):</span>
                  <span className="text-cyan-400 font-semibold">{benchmarkResults.pcTime}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">2035 1nm CFET 3D:</span>
                  <span className="text-indigo-400 font-semibold">{benchmarkResults.cfetTime}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">2050 Photonic TPU (Light):</span>
                  <span className="text-emerald-400 font-semibold">{benchmarkResults.photonicTime}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">2075 Bio-Silicon (100B):</span>
                  <span className="text-pink-400 font-semibold">{benchmarkResults.bioTime}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">2126 Computronium:</span>
                  <span className="text-amber-400 font-semibold">{benchmarkResults.computroniumTime}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: 100-Year Comparative Specifications Table */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="border-b border-slate-800/80 pb-2.5">
            <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              100-Year Architectural Matrix
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Evolutionary scaling across physical limits
            </p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
              <div className="text-slate-500 text-[10px] uppercase">Logic Element Density</div>
              <div className="text-white font-bold text-sm">
                {selectedEra === '2035' && '450 Billion Transistors (1nm CFET)'}
                {selectedEra === '2050' && '16.7 Million MZI Optical Switches'}
                {selectedEra === '2055' && '10,240 Fault-Tolerant Anyon Qubits'}
                {selectedEra === '2075' && '100 Billion Neurons / 100T Synapses'}
                {selectedEra === '2126' && '1.0 x 10^42 Ops/Kg (Bremermann Limit)'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
              <div className="text-slate-500 text-[10px] uppercase">Interconnect Fabric & Bus</div>
              <div className="text-cyan-400 font-bold text-sm">
                {selectedEra === '2035' && '12.8 Tbps DWDM Co-Packaged Optics'}
                {selectedEra === '2050' && '1.20 Petabytes/sec Optical Waveguide'}
                {selectedEra === '2055' && 'Cryo-CMOS 256-bit Entangled Bus'}
                {selectedEra === '2075' && 'In-Memory Continuous Synaptic Matrix'}
                {selectedEra === '2126' && 'Spacetime Curvature Metric Tensor'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
              <div className="text-slate-500 text-[10px] uppercase">Energy Per Operation</div>
              <div className="text-emerald-400 font-bold text-sm">
                {selectedEra === '2035' && '0.25 pJ / Gate (Backside Power)'}
                {selectedEra === '2050' && '1.2 fJ / MAC (No Capacitive Drag)'}
                {selectedEra === '2055' && 'Topological Zero Dissipation @ 1.5K'}
                {selectedEra === '2075' && '10 fJ / Synaptic Spike Event'}
                {selectedEra === '2126' && 'EXACTLY 0.000 J (Reversible Landauer)'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
              <div className="text-slate-500 text-[10px] uppercase">Peak Theoretical Compute</div>
              <div className="text-amber-400 font-bold text-sm">
                {selectedEra === '2035' && '850 TFLOPS (8.40 GHz P-Cores)'}
                {selectedEra === '2050' && '1,048,576 TFLOPS (Light Speed)'}
                {selectedEra === '2055' && '2^10240 Hilbert State Spaces'}
                {selectedEra === '2075' && 'Human Whole-Brain Real-Time'}
                {selectedEra === '2126' && 'Hypercomputation / Metric Tensor'}
              </div>
            </div>

            {/* Quick Century File Jump */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="text-slate-400 text-[11px] mb-2 font-sans font-semibold">
                Associated Source Files:
              </div>
              <div className="space-y-1.5">
                {[
                  { name: 'century_cpu_cfet_angstrom.h', era: '2035' },
                  { name: 'century_gpu_photonic_tpu.h', era: '2050' },
                  { name: 'century_quantum_majorana_qpu.h', era: '2055' },
                  { name: 'century_neuromorphic_biosilicon.h', era: '2075' },
                  { name: 'century_computronium_substrate.h', era: '2126' },
                  { name: 'century_quantum_entangled_bus.h', era: '2085' }
                ].map((file, i) => (
                  <button
                    key={i}
                    onClick={() => handleOpenSourceCode(file.name)}
                    className="w-full text-left px-2.5 py-1.5 rounded bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-slate-300 hover:text-cyan-300 text-[11px] flex items-center justify-between group transition-colors"
                  >
                    <span className="truncate">{file.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{file.era}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
