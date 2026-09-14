import React, { useState, useEffect } from 'react';
import { Network, Send, Zap, Activity, Info, Shield, Radio } from 'lucide-react';

interface EibNode {
  id: string;
  name: string;
  type: 'ppe' | 'spe' | 'mic' | 'flexio';
  description: string;
  angle: number; // in degrees
}

const NODES: EibNode[] = [
  { id: 'ppe', name: 'PPE (PowerPC 64-bit)', type: 'ppe', description: 'Primary Control Plane & OS Supervisor (SMT2)', angle: 270 },
  { id: 'spe0', name: 'SPE 0', type: 'spe', description: 'Game SIMD Worker Core 0 (256KB Local Store)', angle: 300 },
  { id: 'spe1', name: 'SPE 1', type: 'spe', description: 'Game SIMD Worker Core 1 (Physics/Cloth)', angle: 330 },
  { id: 'spe2', name: 'SPE 2', type: 'spe', description: 'Game SIMD Worker Core 2 (Audio DSP/Synthesizer)', angle: 0 },
  { id: 'mic', name: 'MIC (XDR DRAM)', type: 'mic', description: 'Memory Interface Controller: 25.6 GB/s Rambus XDR', angle: 30 },
  { id: 'spe3', name: 'SPE 3', type: 'spe', description: 'Game SIMD Worker Core 3 (Animation/Skinning)', angle: 60 },
  { id: 'spe4', name: 'SPE 4', type: 'spe', description: 'Game SIMD Worker Core 4 (Post-processing/Culling)', angle: 90 },
  { id: 'flexio', name: 'FlexIO (RSX GPU)', type: 'flexio', description: '35 GB/s Outbound / 20 GB/s Inbound GPU Bus', angle: 120 },
  { id: 'spe5', name: 'SPE 5', type: 'spe', description: 'Game SIMD Worker Core 5 (Particle Simulation)', angle: 150 },
  { id: 'spe6', name: 'SPE 6 (OS)', type: 'spe', description: 'Reserved OS & System Security Subsystem', angle: 180 },
  { id: 'spe7_dis', name: 'SPE 7 (Disabled)', type: 'spe', description: 'Yield Redundancy (Disabled on PS3 Retail)', angle: 210 },
  { id: 'io_sb', name: 'Southbridge I/O', type: 'flexio', description: 'USB, Blu-Ray, Gigabit Ethernet, SATA', angle: 240 }
];

interface Packet {
  id: number;
  srcIdx: number;
  destIdx: number;
  ring: number; // 0,1: CW; 2,3: CCW
  currentAngle: number;
  targetAngle: number;
  color: string;
  sizeBytes: number;
}

export const EibRingVisualizer: React.FC = () => {
  const [srcNodeIdx, setSrcNodeIdx] = useState<number>(0);
  const [destNodeIdx, setDestNodeIdx] = useState<number>(4); // MIC by default
  const [activePackets, setActivePackets] = useState<Packet[]>([]);
  const [transferCount, setTransferCount] = useState<number>(0);
  const [isSimulatingTraffic, setIsSimulatingTraffic] = useState<boolean>(true);
  const [instantBandwidth, setInstantBandwidth] = useState<number>(142.5);

  // Periodic automated packet generation to illustrate ring bus behavior
  useEffect(() => {
    let interval: any = null;
    if (isSimulatingTraffic) {
      interval = setInterval(() => {
        // Randomly pick a source and destination
        const s = Math.floor(Math.random() * 8);
        const d = (s + 1 + Math.floor(Math.random() * 5)) % NODES.length;
        injectPacket(s, d);
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isSimulatingTraffic]);

  // Animation frame loop
  useEffect(() => {
    const frame = requestAnimationFrame(updatePackets);
    return () => cancelAnimationFrame(frame);
  });

  const updatePackets = () => {
    setActivePackets(prev => {
      const updated: Packet[] = [];
      for (const p of prev) {
        let diff = (p.targetAngle - p.currentAngle + 360) % 360;
        if (p.ring >= 2) {
          // CCW
          diff = (p.currentAngle - p.targetAngle + 360) % 360;
        }

        if (diff < 4) {
          // Arrived!
          setTransferCount(c => c + 1);
          setInstantBandwidth(Math.min(204.8, 80 + Math.random() * 110));
          continue;
        }

        const step = p.ring < 2 ? 3.5 : -3.5;
        let newAngle = (p.currentAngle + step + 360) % 360;
        updated.push({ ...p, currentAngle: newAngle });
      }
      return updated;
    });
  };

  const injectPacket = (src: number, dest: number) => {
    const srcNode = NODES[src];
    const destNode = NODES[dest];
    const hopsCW = (destNode.angle - srcNode.angle + 360) % 360;
    const hopsCCW = (srcNode.angle - destNode.angle + 360) % 360;

    const ring = (hopsCW <= hopsCCW) ? (Math.random() > 0.5 ? 0 : 1) : (Math.random() > 0.5 ? 2 : 3);
    const colors = ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b'];

    const newPkt: Packet = {
      id: Date.now() + Math.random(),
      srcIdx: src,
      destIdx: dest,
      ring,
      currentAngle: srcNode.angle,
      targetAngle: destNode.angle,
      color: colors[ring],
      sizeBytes: 16
    };

    setActivePackets(prev => [...prev.slice(-15), newPkt]);
  };

  const handleManualInject = () => {
    injectPacket(srcNodeIdx, destNodeIdx);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-105px)] bg-slate-950 overflow-y-auto p-4 space-y-4">
      {/* Top Banner */}
      <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center">
            <Network className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-sans flex items-center gap-2">
              <span>Element Interconnect Bus (EIB) Architecture</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                204.8 GB/s Peak Bandwidth
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              4 Concurrent 16-byte Data Rings running at half CPU frequency (~1.6 GHz)
            </p>
          </div>
        </div>

        {/* Live Bandwidth Meters */}
        <div className="flex items-center gap-4 font-mono text-xs">
          <div className="p-2 rounded bg-slate-950 border border-slate-800 text-center min-w-28">
            <span className="text-[10px] text-slate-500 block uppercase">Real-time Bus Bandwidth</span>
            <span className="text-sm font-bold text-cyan-400">{instantBandwidth.toFixed(1)} GB/s</span>
          </div>
          <div className="p-2 rounded bg-slate-950 border border-slate-800 text-center min-w-28">
            <span className="text-[10px] text-slate-500 block uppercase">Total Ring Transfers</span>
            <span className="text-sm font-bold text-emerald-400">{transferCount} Packets</span>
          </div>
          <button
            id="btn-toggle-traffic"
            onClick={() => setIsSimulatingTraffic(!isSimulatingTraffic)}
            className={`px-3 py-2 rounded text-xs font-semibold border transition-all ${
              isSimulatingTraffic
                ? 'bg-amber-600/20 text-amber-300 border-amber-500/40 hover:bg-amber-600/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isSimulatingTraffic ? 'Pause Traffic Sim' : 'Resume Traffic Sim'}
          </button>
        </div>
      </div>

      {/* Main Bus Ring Layout & Interactive Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Interactive SVG Diagram (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center min-h-[460px] relative overflow-hidden">
          <svg className="w-full max-w-lg aspect-square" viewBox="0 0 500 500">
            {/* Center Background Plate */}
            <circle cx="250" cy="250" r="185" fill="#020617" stroke="#1e293b" strokeWidth="2" />

            {/* 4 EIB Rings */}
            {/* Ring 0: Outer CW */}
            <circle cx="250" cy="250" r="150" fill="none" stroke="#0891b2" strokeWidth="2" strokeDasharray="6 4" opacity="0.5" />
            {/* Ring 1: Inner CW */}
            <circle cx="250" cy="250" r="132" fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="6 4" opacity="0.5" />
            {/* Ring 2: Outer CCW */}
            <circle cx="250" cy="250" r="114" fill="none" stroke="#059669" strokeWidth="2" strokeDasharray="6 4" opacity="0.5" />
            {/* Ring 3: Inner CCW */}
            <circle cx="250" cy="250" r="96" fill="none" stroke="#d97706" strokeWidth="2" strokeDasharray="6 4" opacity="0.5" />

            {/* Ring Labels in Center */}
            <g className="font-mono text-[9px] text-center" textAnchor="middle">
              <text x="250" y="235" fill="#38bdf8" fontWeight="bold">EIB 4-RING HIGHWAY</text>
              <text x="250" y="252" fill="#94a3b8">128B / cycle @ 1.6GHz</text>
              <text x="250" y="268" fill="#64748b">Ring 0,1: CW | Ring 2,3: CCW</text>
            </g>

            {/* Render Nodes along perimeter */}
            {NODES.map((node, i) => {
              const rad = (node.angle * Math.PI) / 180;
              const x = 250 + 195 * Math.cos(rad);
              const y = 250 + 195 * Math.sin(rad);

              const isPPE = node.type === 'ppe';
              const isMIC = node.type === 'mic';
              const isFlex = node.type === 'flexio';
              const isDisabled = node.id === 'spe7_dis';

              const fillColor = isPPE 
                ? '#6366f1' 
                : isMIC 
                ? '#10b981' 
                : isFlex 
                ? '#f59e0b' 
                : isDisabled 
                ? '#334155' 
                : '#06b6d4';

              return (
                <g key={node.id} className="cursor-pointer group">
                  {/* Connection stub line to rings */}
                  <line 
                    x1={250 + 150 * Math.cos(rad)} 
                    y1={250 + 150 * Math.sin(rad)} 
                    x2={x} 
                    y2={y} 
                    stroke="#334155" 
                    strokeWidth="2" 
                  />

                  {/* Node Circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isPPE ? 20 : isMIC ? 18 : 15}
                    fill="#0f172a"
                    stroke={fillColor}
                    strokeWidth={isDisabled ? 1 : 2}
                  />

                  {/* Node Icon/Label */}
                  <text
                    x={x}
                    y={y + 3}
                    textAnchor="middle"
                    fill={isDisabled ? '#64748b' : '#f8fafc'}
                    fontSize={isPPE ? '9' : '8'}
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {isPPE ? 'PPE' : isMIC ? 'MIC' : isFlex ? 'RSX' : `SPU${i}`}
                  </text>
                </g>
              );
            })}

            {/* Render In-Flight DMA Packets */}
            {activePackets.map(p => {
              const rad = (p.currentAngle * Math.PI) / 180;
              const ringRadius = 150 - (p.ring * 18);
              const px = 250 + ringRadius * Math.cos(rad);
              const py = 250 + ringRadius * Math.sin(rad);

              return (
                <g key={p.id}>
                  <circle cx={px} cy={py} r="5" fill={p.color} className="animate-ping opacity-75" />
                  <circle cx={px} cy={py} r="4" fill={p.color} stroke="#ffffff" strokeWidth="1" />
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="flex items-center gap-4 text-[11px] font-mono mt-2 flex-wrap justify-center text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              <span>PPE (PowerPC)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
              <span>Active SPEs (SPU 0-6)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>MIC (Rambus XDR)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>FlexIO (RSX GPU)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Packet Dispatcher & Specs (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Manual DMA Injection Panel */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-white font-semibold">
              <Send className="w-4 h-4 text-cyan-400" />
              <span>DISPATCH EIB DMA PACKET</span>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Source Node</label>
              <select
                id="eib-src-select"
                value={srcNodeIdx}
                onChange={(e) => setSrcNodeIdx(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
              >
                {NODES.map((n, idx) => (
                  <option key={n.id} value={idx} disabled={n.id === 'spe7_dis'}>
                    {n.name} ({n.type.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Destination Node</label>
              <select
                id="eib-dest-select"
                value={destNodeIdx}
                onChange={(e) => setDestNodeIdx(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
              >
                {NODES.map((n, idx) => (
                  <option key={n.id} value={idx} disabled={n.id === 'spe7_dis'}>
                    {n.name} ({n.type.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <button
              id="btn-inject-packet"
              onClick={handleManualInject}
              className="w-full py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Inject 16B Granule on Ring</span>
            </button>
          </div>

          {/* EIB Ring Specifications Dossier */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-white font-semibold">
              <Info className="w-4 h-4 text-indigo-400" />
              <span>EIB SPECIFICATION SPEC SHEET</span>
            </div>

            <ul className="space-y-2 text-slate-300 text-[11px]">
              <li className="flex justify-between border-b border-slate-800/40 pb-1">
                <span className="text-slate-500">Bus Topology:</span>
                <span className="text-cyan-300">4 Circular Unidirectional Rings</span>
              </li>
              <li className="flex justify-between border-b border-slate-800/40 pb-1">
                <span className="text-slate-500">Clock Frequency:</span>
                <span className="text-cyan-300">1.6 GHz (Half CPU Core)</span>
              </li>
              <li className="flex justify-between border-b border-slate-800/40 pb-1">
                <span className="text-slate-500">Channel Width:</span>
                <span className="text-cyan-300">16 Bytes (128 bits) / Ring</span>
              </li>
              <li className="flex justify-between border-b border-slate-800/40 pb-1">
                <span className="text-slate-500">Peak Simultaneous:</span>
                <span className="text-emerald-400 font-bold">204.8 GB/s</span>
              </li>
              <li className="flex justify-between border-b border-slate-800/40 pb-1">
                <span className="text-slate-500">Hop Latency:</span>
                <span className="text-slate-300">1 Cycle per station hop</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-500">Arbitration:</span>
                <span className="text-slate-300">Distributed Token Arbiter</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
