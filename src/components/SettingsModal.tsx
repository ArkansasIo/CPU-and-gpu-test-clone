import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Cpu, 
  Network, 
  Palette, 
  Volume2, 
  VolumeX, 
  Code2, 
  Sparkles, 
  RotateCcw, 
  Download, 
  Check, 
  Sliders, 
  Flame, 
  ShieldCheck, 
  Activity,
  Layers
} from 'lucide-react';
import { AppSettings, DEFAULT_SETTINGS } from '../types/settings';
import { soundEngine } from '../utils/audioFeedback';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onResetSettings: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSettings
}) => {
  const [activeTab, setActiveTab] = useState<'simulation' | 'bus' | 'visuals' | 'editor' | 'audio' | 'presets' | 'data'>('simulation');
  const [copiedNotification, setCopiedNotification] = useState(false);

  if (!isOpen) return null;

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    if (settings.audioEnabled) {
      soundEngine.playClick(settings.audioVolume);
    }
    onUpdateSettings({ ...settings, [key]: value });
  };

  const handleExportConfig = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "cell_century_simulator_settings.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const applyEraPreset = (era: AppSettings['centuryActiveEra']) => {
    if (settings.audioEnabled) {
      soundEngine.playQuantumPing(settings.audioVolume);
    }
    switch (era) {
      case '2026_current':
        onUpdateSettings({
          ...settings,
          clockMultiplier: 1,
          busArchitecture: 'intel_ring',
          outOfOrderWindowSize: 256,
          cacheCoherency: 'moesi',
          centuryActiveEra: era
        });
        break;
      case '2035_angstrom':
        onUpdateSettings({
          ...settings,
          clockMultiplier: 2,
          busArchitecture: 'photonic_mesh',
          outOfOrderWindowSize: 512,
          cacheCoherency: 'directory_based',
          thermalThrottlingSim: true,
          centuryActiveEra: era
        });
        break;
      case '2050_photonic':
        onUpdateSettings({
          ...settings,
          clockMultiplier: 4,
          busArchitecture: 'photonic_mesh',
          cycleAccurateMode: false,
          highContrastGlow: true,
          centuryActiveEra: era
        });
        break;
      case '2075_biosilicon':
        onUpdateSettings({
          ...settings,
          clockMultiplier: 2,
          busArchitecture: 'quantum_qeib',
          outOfOrderWindowSize: 512,
          cacheCoherency: 'quantum_entangled',
          centuryActiveEra: era
        });
        break;
      case '2126_computronium':
        onUpdateSettings({
          ...settings,
          clockMultiplier: 10,
          busArchitecture: 'quantum_qeib',
          cacheCoherency: 'quantum_entangled',
          thermalThrottlingSim: false,
          highContrastGlow: true,
          centuryActiveEra: era
        });
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Options & Simulator Settings
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Hardware Microarchitecture, Interconnect Bus, Audio, HUD & 100-Year Century Parameters
              </p>
            </div>
          </div>
          <button
            id="btn-close-settings-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with Sidebar Tabs */}
        <div className="flex-1 flex overflow-hidden">
          {/* Tabs Sidebar */}
          <div className="w-52 border-r border-slate-800 bg-slate-950/50 p-2.5 space-y-1 font-mono text-xs">
            {[
              { id: 'simulation', label: 'Simulation & CPU', icon: Cpu },
              { id: 'bus', label: 'Interconnect & Bus', icon: Network },
              { id: 'visuals', label: 'Visuals & HUD', icon: Palette },
              { id: 'editor', label: 'Code Viewer', icon: Code2 },
              { id: 'audio', label: 'Audio Synthesizer', icon: Volume2 },
              { id: 'presets', label: '100Y Era Presets', icon: Sparkles },
              { id: 'data', label: 'Data & Export', icon: Layers }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`settings-tab-${tab.id}`}
                  onClick={() => {
                    if (settings.audioEnabled) soundEngine.playClick(settings.audioVolume);
                    setActiveTab(tab.id as typeof activeTab);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {/* 1. SIMULATION TAB */}
            {activeTab === 'simulation' && (
              <div className="space-y-5">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-white">Processor & Execution Engine</h3>
                  <p className="text-xs text-slate-400 font-mono">Control instruction clocking, pipeline slotting, and branch prediction</p>
                </div>

                {/* Clock Multiplier */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-xs font-semibold text-white">Clock Frequency Multiplier</div>
                    <div className="text-[11px] text-slate-400 font-mono">Scales simulated cycles per real-time frame</div>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    {[0.25, 0.5, 1, 2, 4, 10].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => update('clockMultiplier', rate)}
                        className={`px-2.5 py-1 rounded transition-colors ${
                          settings.clockMultiplier === rate
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dual-Issue Strictness */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-xs font-semibold text-white">Strict Dual-Issue Pipeline Slotting</div>
                    <div className="text-[11px] text-slate-400 font-mono">Enforces hardware SPU rules (1 Even pipe + 1 Odd pipe per cycle)</div>
                  </div>
                  <button
                    onClick={() => update('strictDualIssue', !settings.strictDualIssue)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                      settings.strictDualIssue ? 'bg-cyan-600 justify-end' : 'bg-slate-800 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                {/* Speculative Execution */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-xs font-semibold text-white">Branch Target Buffer (HBR) & Speculative Execution</div>
                    <div className="text-[11px] text-slate-400 font-mono">Simulate hardware hint branch prediction and pipeline flushing on miss</div>
                  </div>
                  <button
                    onClick={() => update('speculativeExecution', !settings.speculativeExecution)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                      settings.speculativeExecution ? 'bg-cyan-600 justify-end' : 'bg-slate-800 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                {/* Out of Order Window */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-xs font-semibold text-white">Reorder Buffer (ROB) Micro-op Window</div>
                    <div className="text-[11px] text-slate-400 font-mono">Simulated OoO instruction dispatch tracking</div>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    {[32, 64, 128, 256, 512].map((win) => (
                      <button
                        key={win}
                        onClick={() => update('outOfOrderWindowSize', win)}
                        className={`px-2 py-1 rounded transition-colors ${
                          settings.outOfOrderWindowSize === win
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {win}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thermal Throttling */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>Simulate Thermal Throttling (TjMax 95°C)</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">Dynamically downclock sustained compute loops under heavy load</div>
                  </div>
                  <button
                    onClick={() => update('thermalThrottlingSim', !settings.thermalThrottlingSim)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                      settings.thermalThrottlingSim ? 'bg-amber-600 justify-end' : 'bg-slate-800 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>
              </div>
            )}

            {/* 2. INTERCONNECT & BUS TAB */}
            {activeTab === 'bus' && (
              <div className="space-y-5">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-white">System Interconnect & Fabrics</h3>
                  <p className="text-xs text-slate-400 font-mono">Select target bus architecture, arbitration rules, and cache coherency</p>
                </div>

                {/* Active Bus Architecture */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white">Active Interconnect Architecture:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-xs">
                    {[
                      { id: 'eib', label: 'PS3 4-Ring EIB', desc: '4 x 128-bit @ 3.2 GHz (204.8 GB/s)' },
                      { id: 'intel_ring', label: 'Intel Ring Bus', desc: '32-Byte Coherent Data Ring' },
                      { id: 'amd_if', label: 'AMD Infinity Fabric', desc: 'GMI3 On-Package Links' },
                      { id: 'pcie5', label: 'PCIe 5.0 DirectStorage', desc: '32 GT/s 128 Gbps P2P' },
                      { id: 'photonic_mesh', label: '2050 Photonic Waveguide', desc: '1.2 PB/s Light Speed' },
                      { id: 'quantum_qeib', label: '2085 Quantum Q-EIB', desc: '0.00 ns Bell Teleportation' }
                    ].map((bus) => (
                      <button
                        key={bus.id}
                        onClick={() => update('busArchitecture', bus.id as AppSettings['busArchitecture'])}
                        className={`p-2.5 rounded-lg text-left border transition-all ${
                          settings.busArchitecture === bus.id
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 shadow-sm font-semibold'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900 hover:text-slate-200'
                        }`}
                      >
                        <div className="text-xs text-white truncate">{bus.label}</div>
                        <div className="text-[10px] text-slate-500 truncate">{bus.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bus Arbitration */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-xs font-semibold text-white">Bus Arbitration Algorithm</div>
                    <div className="text-[11px] text-slate-400 font-mono">Packet scheduling policy across rings & ports</div>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    {[
                      { id: 'round_robin', label: 'Round-Robin' },
                      { id: 'priority_weighted', label: 'Priority' },
                      { id: 'least_latency', label: 'Least-Latency' }
                    ].map((arb) => (
                      <button
                        key={arb.id}
                        onClick={() => update('busArbitration', arb.id as AppSettings['busArbitration'])}
                        className={`px-2.5 py-1 rounded transition-colors ${
                          settings.busArbitration === arb.id
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {arb.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cache Coherency */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-xs font-semibold text-white">Cache Coherency Protocol</div>
                    <div className="text-[11px] text-slate-400 font-mono">Multi-core snoop & state broadcast mechanism</div>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    {['mesi', 'moesi', 'directory_based', 'quantum_entangled'].map((proto) => (
                      <button
                        key={proto}
                        onClick={() => update('cacheCoherency', proto as AppSettings['cacheCoherency'])}
                        className={`px-2 py-1 rounded uppercase text-[11px] transition-colors ${
                          settings.cacheCoherency === proto
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {proto.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. VISUALS & HUD TAB */}
            {activeTab === 'visuals' && (
              <div className="space-y-5">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-white">Visuals, Glow & Telemetry HUD</h3>
                  <p className="text-xs text-slate-400 font-mono">Configure render fidelity, glow filters, and top telemetry bar</p>
                </div>

                {/* High Contrast Glow */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-xs font-semibold text-white">High-Contrast Particle & Ring Glow Effects</div>
                    <div className="text-[11px] text-slate-400 font-mono">Intensifies bus packet trajectories and animated pulse nodes</div>
                  </div>
                  <button
                    onClick={() => update('highContrastGlow', !settings.highContrastGlow)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                      settings.highContrastGlow ? 'bg-cyan-600 justify-end' : 'bg-slate-800 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                {/* Telemetry HUD Strip */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-xs font-semibold text-white">Persistent Telemetry HUD Header Strip</div>
                    <div className="text-[11px] text-slate-400 font-mono">Displays live clock, active SPEs, DRAM bandwidth, and bus load</div>
                  </div>
                  <button
                    onClick={() => update('showTelemetryOverlay', !settings.showTelemetryOverlay)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                      settings.showTelemetryOverlay ? 'bg-cyan-600 justify-end' : 'bg-slate-800 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                {/* Animation Speed */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-xs font-semibold text-white">Bus Visualizer Animation Speed</div>
                    <div className="text-[11px] text-slate-400 font-mono">Pacing of packet rotation across concentric rings</div>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    {[0.5, 1, 2].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => update('visualizerSpeed', spd)}
                        className={`px-3 py-1 rounded transition-colors ${
                          settings.visualizerSpeed === spd
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Syntax Theme */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-xs font-semibold text-white">Code Theme Palette</div>
                    <div className="text-[11px] text-slate-400 font-mono">Color accents for assembly and C/C++ tokens</div>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    {[
                      { id: 'cyan', label: 'Cyber Cyan' },
                      { id: 'matrix', label: 'Matrix Green' },
                      { id: 'obsidian', label: 'Obsidian' },
                      { id: 'synthwave', label: 'Synthwave' }
                    ].map((thm) => (
                      <button
                        key={thm.id}
                        onClick={() => update('syntaxTheme', thm.id as AppSettings['syntaxTheme'])}
                        className={`px-2.5 py-1 rounded transition-colors ${
                          settings.syntaxTheme === thm.id
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {thm.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 4. CODE VIEWER & EDITOR TAB */}
            {activeTab === 'editor' && (
              <div className="space-y-5">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-white">Code Viewer & Source Inspector</h3>
                  <p className="text-xs text-slate-400 font-mono">Typography, wrapping, line gutter, and bus badges</p>
                </div>

                {/* Font Size */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-xs font-semibold text-white">Editor Font Size</div>
                    <div className="text-[11px] text-slate-400 font-mono">Monospace code display scale</div>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    {[11, 12, 13, 14, 16].map((sz) => (
                      <button
                        key={sz}
                        onClick={() => update('fontSize', sz)}
                        className={`px-2.5 py-1 rounded transition-colors ${
                          settings.fontSize === sz
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {sz}px
                      </button>
                    ))}
                  </div>
                </div>

                {/* Word Wrap */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-xs font-semibold text-white">Soft Word Wrapping</div>
                    <div className="text-[11px] text-slate-400 font-mono">Wrap long comments and register macros</div>
                  </div>
                  <button
                    onClick={() => update('wordWrap', !settings.wordWrap)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                      settings.wordWrap ? 'bg-cyan-600 justify-end' : 'bg-slate-800 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                {/* Line Numbers */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-xs font-semibold text-white">Show Line Numbers</div>
                    <div className="text-[11px] text-slate-400 font-mono">Display 1-indexed gutter on left</div>
                  </div>
                  <button
                    onClick={() => update('showLineNumbers', !settings.showLineNumbers)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                      settings.showLineNumbers ? 'bg-cyan-600 justify-end' : 'bg-slate-800 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                {/* Bus Gutter Badges */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-xs font-semibold text-white">Show "BUS" Gutter Action Badges</div>
                    <div className="text-[11px] text-slate-400 font-mono">Highlights executable assembly and DMA instructions for interactive bus simulation</div>
                  </div>
                  <button
                    onClick={() => update('showBusGutterBadges', !settings.showBusGutterBadges)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                      settings.showBusGutterBadges ? 'bg-cyan-600 justify-end' : 'bg-slate-800 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>
              </div>
            )}

            {/* 5. AUDIO TAB */}
            {activeTab === 'audio' && (
              <div className="space-y-5">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-white">Procedural Audio Synthesizer</h3>
                  <p className="text-xs text-slate-400 font-mono">Web Audio API procedural sound feedback on DMA transfers & instruction steps</p>
                </div>

                {/* Enable Audio */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    {settings.audioEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                    <div>
                      <div className="text-xs font-semibold text-white">Procedural Hardware Telemetry Audio</div>
                      <div className="text-[11px] text-slate-400 font-mono">Generates subtle sine/triangle pings on instruction step & bus bursts</div>
                    </div>
                  </div>
                  <button
                    onClick={() => update('audioEnabled', !settings.audioEnabled)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                      settings.audioEnabled ? 'bg-cyan-600 justify-end' : 'bg-slate-800 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                {/* Volume Slider */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white font-semibold">Master Audio Volume:</span>
                    <span className="text-cyan-400 font-bold">{Math.round(settings.audioVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1.0"
                    step="0.05"
                    value={settings.audioVolume}
                    onChange={(e) => update('audioVolume', parseFloat(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => soundEngine.playQuantumPing(settings.audioVolume)}
                      className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300 border border-slate-700"
                    >
                      Test Quantum Ping Tone
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 6. PRESETS TAB */}
            {activeTab === 'presets' && (
              <div className="space-y-5">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-white">100-Year Era One-Click System Presets</h3>
                  <p className="text-xs text-slate-400 font-mono">Instantly configure all bus, pipeline, clock, and coherency settings for a specific generation</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                  {[
                    {
                      id: '2026_current',
                      name: '2026 Current State-of-Art',
                      desc: 'Intel i9 Raptor Lake + RTX 4090 + PCIe 5.0 DirectStorage (256 ROB window, MOESI)',
                      era: '2026_current' as const
                    },
                    {
                      id: '2035_angstrom',
                      name: '2035 1nm CFET 3D Heterogeneous',
                      desc: 'Backside Power Delivery + Co-Packaged Optical CPO Waveguide 12.8 Tbps',
                      era: '2035_angstrom' as const
                    },
                    {
                      id: '2050_photonic',
                      name: '2050 All-Optical Light-Speed TPU',
                      desc: 'Mach-Zehnder Interferometer 1.05M TFLOPS @ speed of light in silicon',
                      era: '2050_photonic' as const
                    },
                    {
                      id: '2075_biosilicon',
                      name: '2075 Neuromorphic Bio-Silicon',
                      desc: '100 Billion True Neurons + Quantum Entangled Bus (18.5W metabolic floor)',
                      era: '2075_biosilicon' as const
                    },
                    {
                      id: '2126_computronium',
                      name: '2126 Reversible Computronium',
                      desc: 'Landauer Bound 0.000W Dissipation + Reversible Billiard-Ball Fredkin Lattice',
                      era: '2126_computronium' as const
                    }
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => applyEraPreset(preset.era)}
                      className={`p-3.5 rounded-xl text-left border transition-all ${
                        settings.centuryActiveEra === preset.era
                          ? 'bg-cyan-500/15 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500/40'
                          : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-xs">{preset.name}</span>
                        {settings.centuryActiveEra === preset.era && (
                          <Check className="w-4 h-4 text-cyan-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{preset.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 7. DATA & EXPORT TAB */}
            {activeTab === 'data' && (
              <div className="space-y-5">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-white">Diagnostics, Configuration & State Management</h3>
                  <p className="text-xs text-slate-400 font-mono">Backup settings, export benchmark logs, or reset simulator</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-white font-mono flex items-center gap-2">
                      <Download className="w-4 h-4 text-cyan-400" />
                      Export Simulator Configuration
                    </h4>
                    <p className="text-xs text-slate-400">
                      Download current hardware architecture parameters, bus arbitration rules, and UI preferences as a JSON file.
                    </p>
                    <button
                      onClick={handleExportConfig}
                      className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold transition-colors"
                    >
                      Export Settings (.json)
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-white font-mono flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-rose-400" />
                      Restore Factory Defaults
                    </h4>
                    <p className="text-xs text-slate-400">
                      Revert all simulator microarchitecture, bus timings, clock multipliers, and viewer parameters back to baseline.
                    </p>
                    <button
                      onClick={() => {
                        onResetSettings();
                        onClose();
                      }}
                      className="w-full py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-500/40 font-mono text-xs font-semibold transition-colors"
                    >
                      Reset to Default Settings
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between font-mono text-xs text-slate-400">
          <div>
            Active Era: <span className="text-cyan-400 font-semibold uppercase">{settings.centuryActiveEra.replace('_', ' ')}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors shadow-sm"
          >
            Apply & Done
          </button>
        </div>
      </div>
    </div>
  );
};
