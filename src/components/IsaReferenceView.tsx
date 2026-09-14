import React, { useState } from 'react';
import { CELL_SPU_INSTRUCTIONS } from '../data/cell_instructions';
import { CellInstructionDef } from '../types/cell';
import { Search, BookOpen, Filter, Cpu, Zap } from 'lucide-react';

export const IsaReferenceView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [pipeFilter, setPipeFilter] = useState<'All' | 'Even' | 'Odd'>('All');
  const [unitFilter, setUnitFilter] = useState<string>('All');

  const filteredInstructions = CELL_SPU_INSTRUCTIONS.filter(inst => {
    const matchesSearch = 
      inst.mnemonic.toLowerCase().includes(search.toLowerCase()) ||
      inst.fullName.toLowerCase().includes(search.toLowerCase()) ||
      inst.description.toLowerCase().includes(search.toLowerCase()) ||
      inst.syntax.toLowerCase().includes(search.toLowerCase());

    const matchesPipe = pipeFilter === 'All' || inst.pipe === pipeFilter;
    const matchesUnit = unitFilter === 'All' || inst.unit === unitFilter;

    return matchesSearch && matchesPipe && matchesUnit;
  });

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-105px)] bg-slate-950 overflow-y-auto p-4 space-y-4">
      {/* Header and Controls */}
      <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-sans flex items-center gap-2">
              <span>Cell SPU Instruction Set Architecture (ISA) Reference</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                128-bit SIMD RISC
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Complete dual-issue opcode table, execution latencies, and operand mappings
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            id="isa-search-input"
            type="text"
            placeholder="Search instructions (e.g. fma, lqd)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 font-mono text-xs">
        {/* Pipe Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-[11px] uppercase">Execution Pipe:</span>
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
            {(['All', 'Even', 'Odd'] as const).map(pipe => (
              <button
                key={pipe}
                onClick={() => setPipeFilter(pipe)}
                className={`px-2.5 py-1 rounded text-xs transition-all ${
                  pipeFilter === pipe
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {pipe} {pipe !== 'All' ? 'Pipe' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Unit Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-[11px] uppercase">Execution Unit:</span>
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 overflow-x-auto">
            {['All', 'FP', 'FX1', 'LS', 'SHUF', 'BR', 'CTRL'].map(unit => (
              <button
                key={unit}
                onClick={() => setUnitFilter(unit)}
                className={`px-2 py-1 rounded text-xs transition-all ${
                  unitFilter === unit
                    ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Instruction Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredInstructions.map(inst => {
          const isEven = inst.pipe === 'Even';
          return (
            <div
              key={inst.mnemonic}
              className="bg-slate-900/50 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 space-y-2.5 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-cyan-400">
                      {inst.mnemonic}
                    </span>
                    <span className="text-xs text-slate-300 font-medium font-sans">
                      {inst.fullName}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${
                    isEven 
                      ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800/50' 
                      : 'bg-amber-950/60 text-amber-300 border-amber-800/50'
                  }`}>
                    {inst.pipe} Pipe
                  </span>
                </div>

                <div className="pt-2 font-mono text-xs text-emerald-300 bg-slate-950/80 px-2 py-1 rounded border border-slate-800/60 mt-1">
                  <code>{inst.syntax}</code>
                </div>

                <p className="text-xs text-slate-400 font-sans mt-2 leading-relaxed">
                  {inst.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <div className="flex items-center gap-2">
                  <span>Unit: <strong className="text-slate-300">{inst.unit}</strong></span>
                  <span>•</span>
                  <span>Latency: <strong className="text-amber-400">{inst.latency} cycles</strong></span>
                </div>
                {inst.opcodeBin && (
                  <span className="text-[10px] text-slate-600 bg-slate-950 px-1.5 py-0.5 rounded">
                    0b{inst.opcodeBin}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredInstructions.length === 0 && (
        <div className="text-center py-16 text-slate-500 font-mono text-xs">
          No SPU instructions matched your search and filter criteria.
        </div>
      )}
    </div>
  );
};
