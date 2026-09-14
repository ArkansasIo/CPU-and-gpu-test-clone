import React, { useState, useEffect, useRef } from 'react';
import { SourceFile } from '../types/cell';
import { 
  Copy, 
  Check, 
  Download, 
  Edit3, 
  Eye, 
  Play, 
  Terminal, 
  Info, 
  FileCode,
  Save,
  Activity,
  Network,
  Zap
} from 'lucide-react';
import { InstructionBusVisualizer } from './InstructionBusVisualizer';

interface CodeViewerProps {
  file: SourceFile;
  onUpdateFileContent: (fileId: string, newContent: string) => void;
  onOpenInSimulator: (assemblyCode: string) => void;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  file,
  onUpdateFileContent,
  onOpenInSimulator
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableCode, setEditableCode] = useState(file.content);
  const [showBusVisualizer, setShowBusVisualizer] = useState(
    file.language === 'assembly' || file.id.includes('matrix_mul') || file.id.includes('dma')
  );
  const [activeInstructionLine, setActiveInstructionLine] = useState<number | undefined>(undefined);
  const codeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditableCode(file.content);
    setIsEditing(false);
    // Auto-open visualizer for assembly or DMA kernel files
    if (file.language === 'assembly' || file.id.includes('matrix_mul') || file.id.includes('dma')) {
      setShowBusVisualizer(true);
    }
  }, [file.id, file.content, file.language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editableCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleSave = () => {
    onUpdateFileContent(file.id, editableCode);
    setIsEditing(false);
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([editableCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Check if a line is an executable assembly instruction or bus operation
  const isLineInstructionOrBusOp = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('#')) {
      return false;
    }
    const match = trimmed.match(/^([a-z]{1,8})\s+/i);
    if (match) {
      const op = match[1].toLowerCase();
      return ['lqd', 'stqd', 'rotqby', 'rotqbyi', 'fm', 'fma', 'fms', 'a', 'ai', 'fa', 'wrch', 'rdch', 'bi', 'bisl', 'brz', 'brnz', 'hbr', 'nop', 'mov', 'vmovups', 'vfmadd213ps', 'vmovaps'].includes(op);
    }
    return trimmed.includes('spu_mfcdma32') || trimmed.includes('mfc_get') || trimmed.includes('mfc_put');
  };

  // Syntax highlighting for C/C++/Assembly/Verilog
  const renderHighlightedLine = (line: string, index: number) => {
    const isActive = activeInstructionLine === index;
    const isInst = isLineInstructionOrBusOp(line);

    // Check for comment
    let comment = '';
    let code = line;

    if (line.includes('//')) {
      const idx = line.indexOf('//');
      code = line.substring(0, idx);
      comment = line.substring(idx);
    } else if (line.includes('/*') || line.startsWith('*') || line.endsWith('*/')) {
      comment = line;
      code = '';
    } else if (line.includes('#')) {
      const idx = line.indexOf('#');
      code = line.substring(0, idx);
      comment = line.substring(idx);
    }

    // Token replacement on code portion
    const highlightedCode = code
      // Keywords
      .replace(/\b(class|struct|union|typedef|enum|static|inline|const|volatile|extern|public|private|protected|virtual|override|namespace|template|typename|void|bool|int|char|float|double|uint32_t|uint64_t|uint16_t|uint8_t|int32_t|int64_t|size_t|qword_t|cell_ea_t|cell_lsa_t|spu_status_t|module|input|output|wire|reg|generate|genvar|always|case|default|endcase|begin|end|endmodule|posedge|negedge)\b/g, '<span class="text-indigo-400 font-semibold">$1</span>')
      // Flow control
      .replace(/\b(if|else|for|while|do|switch|case|break|continue|return|goto)\b/g, '<span class="text-purple-400 font-semibold">$1</span>')
      // SPU Registers ($r0 - $r127, $lr, $sp)
      .replace(/(\$r\d+|\$lr|\$sp)/g, '<span class="text-amber-300 font-medium">$1</span>')
      // SPU Opcodes in assembly
      .replace(/\b(fa|fs|fm|fma|fms|dfa|dfm|a|ai|sf|rotqby|rotqbyi|shlqby|shufb|lqd|stqd|lqa|stqa|wrch|rdch|rchcnt|brz|brnz|bi|bisl|stop|hbr|nop)\b/gi, '<span class="text-cyan-400 font-semibold">$1</span>')
      // Strings
      .replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '<span class="text-emerald-300">$1</span>')
      // Preprocessor
      .replace(/(#include|#define|#ifndef|#endif|#ifdef|#pragma)/g, '<span class="text-rose-400">$1</span>')
      // Hex & Numbers
      .replace(/\b(0x[0-9a-fA-F]+|\d+)\b/g, '<span class="text-amber-400">$1</span>');

    return (
      <div 
        key={index} 
        id={`code-line-${index}`}
        onClick={() => {
          if (isInst || !isEditing) {
            setActiveInstructionLine(index);
            if (!showBusVisualizer) setShowBusVisualizer(true);
          }
        }}
        className={`table-row cursor-pointer transition-colors ${
          isActive 
            ? 'bg-cyan-950/70 border-l-4 border-cyan-400 shadow-inner' 
            : 'hover:bg-slate-900/60'
        }`}
      >
        <span className={`table-cell select-none pr-3 text-right font-mono text-[11px] w-12 py-0.5 border-r border-slate-800/60 ${
          isActive ? 'text-cyan-300 font-bold bg-cyan-900/30' : 'text-slate-600'
        }`}>
          {index + 1}
        </span>

        {/* Bus Indicator Gutter */}
        <span className="table-cell select-none px-2 text-center w-8 py-0.5">
          {isActive ? (
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          ) : isInst ? (
            <span 
              className="text-[9px] font-mono font-bold text-cyan-500/70 hover:text-cyan-300 hover:bg-cyan-500/20 px-1 py-0.2 rounded"
              title="Click to simulate this instruction across CPU bus"
            >
              BUS
            </span>
          ) : null}
        </span>

        <span className={`table-cell whitespace-pre font-mono text-xs py-0.5 pl-2 ${
          isActive ? 'text-cyan-100 font-medium' : 'text-slate-300'
        }`}>
          <span dangerouslySetInnerHTML={{ __html: highlightedCode }} />
          {comment && <span className="text-slate-500 italic">{comment}</span>}
        </span>
      </div>
    );
  };

  const lines = editableCode.split('\n');
  const isAssemblyOrSample = file.language === 'assembly' || file.id === 'matrix_mul_s' || file.id === 'dma_double_buffer_c';

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-105px)] bg-slate-950 overflow-hidden">
      {/* File Header Toolbar */}
      <div className="border-b border-slate-800 bg-slate-900/60 px-4 py-2.5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-xs font-semibold text-white">{file.path}</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
            {lines.length} lines • {(new TextEncoder().encode(editableCode).length / 1024).toFixed(1)} KB
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Instruction-Level Bus Visualizer Toggle */}
          <button
            id="btn-toggle-bus-visualizer"
            onClick={() => setShowBusVisualizer(!showBusVisualizer)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
              showBusVisualizer
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 ring-1 ring-cyan-400'
                : 'bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 border border-cyan-500/30'
            }`}
            title="Toggle instruction-level execution visualizer across Element Interconnect Bus & CPU fabrics"
          >
            <Activity className={`w-3.5 h-3.5 ${showBusVisualizer ? 'animate-pulse' : ''}`} />
            <span>{showBusVisualizer ? 'Hide Bus Visualizer' : 'Instruction Bus Visualizer'}</span>
          </button>

          {isAssemblyOrSample && (
            <button
              id="btn-run-in-simulator"
              onClick={() => onOpenInSimulator(editableCode)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-medium transition-all"
              title="Load this code into the interactive SPU SIMD simulator"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Simulate in SPU Core</span>
            </button>
          )}

          {isEditing ? (
            <button
              id="btn-save-code"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-medium transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          ) : (
            <button
              id="btn-edit-code"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Code</span>
            </button>
          )}

          <button
            id="btn-copy-code"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-all"
            title="Copy file content to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            id="btn-download-single-file"
            onClick={handleDownloadSingle}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-all"
            title="Download this file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* File Description Banner */}
      <div className="px-4 py-2 bg-slate-900/30 border-b border-slate-800/40 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          <span>{file.description}</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
          <span className="hidden sm:inline">Tip: Click any code line to inspect bus flow</span>
        </div>
      </div>

      {/* Embedded Instruction-Level Bus Execution Visualizer */}
      {showBusVisualizer && (
        <InstructionBusVisualizer
          currentFileContent={editableCode}
          currentFileName={file.name}
          activeLineIndex={activeInstructionLine}
          onSelectInstructionLine={(lineIdx) => {
            setActiveInstructionLine(lineIdx);
            // Scroll line into view
            const el = document.getElementById(`code-line-${lineIdx}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }}
          onClose={() => setShowBusVisualizer(false)}
        />
      )}

      {/* Code Editor or Read-Only Viewer */}
      <div ref={codeContainerRef} className="flex-1 overflow-auto p-4 font-mono text-xs">
        {isEditing ? (
          <textarea
            id="code-editor-textarea"
            value={editableCode}
            onChange={(e) => setEditableCode(e.target.value)}
            spellCheck={false}
            className="w-full h-full bg-slate-950 text-slate-200 font-mono text-xs p-2 border border-cyan-500/40 rounded focus:outline-none focus:border-cyan-400 leading-relaxed resize-none"
          />
        ) : (
          <div className="table w-full">
            {lines.map((line, idx) => renderHighlightedLine(line, idx))}
          </div>
        )}
      </div>
    </div>
  );
};

