import React, { useState } from 'react';
import { SourceFile } from '../types/cell';
import { 
  Folder, 
  FolderOpen, 
  FileCode, 
  Search, 
  Plus, 
  FilePlus, 
  FileText, 
  Download,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface SourceFileTreeProps {
  files: SourceFile[];
  activeFileId: string;
  onSelectFile: (file: SourceFile) => void;
  onAddNewFile: (newFile: SourceFile) => void;
}

export const SourceFileTree: React.FC<SourceFileTreeProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onAddNewFile
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFilePath, setNewFilePath] = useState('src/spe/');
  const [newFileLang, setNewFileLang] = useState<'cpp' | 'c' | 'assembly' | 'header' | 'verilog'>('cpp');

  // Directory collapse states (all folders open by default)
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

  const toggleFolder = (dir: string) => {
    setOpenFolders(prev => ({ ...prev, [dir]: prev[dir] === false ? true : false }));
  };

  const filteredFiles = files.filter(f => {
    const matchesSearch = 
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPlatform = selectedPlatform === 'all' || 
      (selectedPlatform === 'ps3' && (!f.platform || f.platform === 'ps3')) ||
      f.platform === selectedPlatform ||
      f.category === selectedPlatform;

    const matchesCategory = selectedCategory === 'all' || 
      (selectedCategory === 'os' ? f.path.includes('/os/') : f.category === selectedCategory);

    return matchesSearch && matchesPlatform && matchesCategory;
  });

  // Group files by parent directory
  const groups: Record<string, SourceFile[]> = {};
  filteredFiles.forEach(file => {
    const parts = file.path.split('/');
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : 'root';
    if (!groups[dir]) groups[dir] = [];
    groups[dir].push(file);
  });

  const getLanguageColor = (lang: string) => {
    switch (lang) {
      case 'cpp': return 'text-sky-400 bg-sky-950/40 border-sky-800/40';
      case 'c': return 'text-blue-400 bg-blue-950/40 border-blue-800/40';
      case 'header': return 'text-indigo-400 bg-indigo-950/40 border-indigo-800/40';
      case 'assembly': return 'text-amber-400 bg-amber-950/40 border-amber-800/40';
      case 'verilog': return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40';
      default: return 'text-slate-400 bg-slate-800/40 border-slate-700/40';
    }
  };

  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName) return;
    const fullPath = newFilePath.endsWith('/') ? `${newFilePath}${newFileName}` : `${newFilePath}/${newFileName}`;
    const newFile: SourceFile = {
      id: `custom_${Date.now()}`,
      name: newFileName,
      path: fullPath,
      category: newFilePath.includes('spe') ? 'spe' : newFilePath.includes('ppe') ? 'ppe' : 'samples',
      language: newFileLang,
      description: `Custom user-authored PS3 Cell source component: ${newFileName}`,
      content: `/**\n * @file ${newFileName}\n * PS3 Cell Broadband Engine Architecture module\n */\n\n#include "cell/types.h"\n\n// Add your implementation here\n`
    };
    onAddNewFile(newFile);
    setShowNewModal(false);
    setNewFileName('');
  };

  return (
    <aside className="w-80 flex-shrink-0 border-r border-slate-800 bg-slate-950 flex flex-col h-[calc(100vh-105px)]">
      {/* Search and Filter */}
      <div className="p-3 border-b border-slate-800/80 space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            id="source-tree-search"
            type="text"
            placeholder="Search console CPU, GPU, & memory source files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 font-mono"
          />
        </div>

        {/* Platform Selector Filter */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-mono no-scrollbar">
          {[
            { id: 'all', label: 'All Systems' },
            { id: 'future', label: '100Y Future' },
            { id: 'pc', label: 'PC Silicon' },
            { id: 'ps5', label: 'PS5' },
            { id: 'ps4', label: 'PS4' },
            { id: 'ps3', label: 'PS3' },
            { id: 'xbox360', label: 'X360' },
            { id: 'xboxone', label: 'XOne' },
            { id: 'switch', label: 'Switch' },
            { id: 'ps2', label: 'PS2' }
          ].map((plat) => (
            <button
              key={plat.id}
              onClick={() => {
                setSelectedPlatform(plat.id);
                setSelectedCategory('all');
              }}
              className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors ${
                selectedPlatform === plat.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {plat.label}
            </button>
          ))}
        </div>

        {/* Quick Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-mono no-scrollbar">
          {['all', 'future', 'cpu', 'gpu', 'components', 'os', 'spe', 'ppe', 'rsx', 'ps5', 'ps4', 'xbox360', 'xboxone', 'switch', 'ps2', 'memory', 'samples'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'text-slate-500 hover:text-slate-300 bg-slate-900/40'
              }`}
            >
              {cat === 'all' ? 'All Types' : cat === 'future' ? '100Y Future' : cat === 'os' ? 'OS / Kernels' : cat === 'cpu' ? 'CPUs' : cat === 'gpu' ? 'GPUs' : cat === 'components' ? 'Parts' : cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Directory File Tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3 font-mono text-xs">
        {Object.keys(groups).map((dir) => {
          const isOpen = openFolders[dir] !== false;
          return (
            <div key={dir} className="space-y-1">
              <button
                onClick={() => toggleFolder(dir)}
                className="w-full flex items-center gap-1.5 px-1.5 py-1 text-slate-400 hover:text-slate-200 text-left rounded hover:bg-slate-900/60 text-[11px] font-semibold tracking-wider uppercase"
              >
                {isOpen ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
                {isOpen ? <FolderOpen className="w-3.5 h-3.5 text-cyan-400/80" /> : <Folder className="w-3.5 h-3.5 text-slate-500" />}
                <span className="truncate">{dir}</span>
                <span className="ml-auto text-[10px] text-slate-600 font-normal">({groups[dir].length})</span>
              </button>

              {isOpen && (
                <div className="pl-3.5 space-y-0.5 border-l border-slate-800/60 ml-2">
                  {groups[dir].map((file) => {
                    const isActive = file.id === activeFileId;
                    return (
                      <button
                        key={file.id}
                        id={`file-tree-item-${file.id}`}
                        onClick={() => onSelectFile(file)}
                        className={`w-full group flex items-center justify-between px-2 py-1.5 rounded transition-all text-left ${
                          isActive
                            ? 'bg-cyan-500/15 text-cyan-300 font-medium border border-cyan-500/30'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileCode className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                          <span className="truncate text-xs">{file.name}</span>
                        </div>
                        <span className={`text-[9px] uppercase px-1 py-0.2 rounded border font-mono ${getLanguageColor(file.language)}`}>
                          {file.language}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {filteredFiles.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-xs">
            No source files match search query
          </div>
        )}
      </div>

      {/* Footer / Add File Button */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/30">
        <button
          id="btn-create-source-file"
          onClick={() => setShowNewModal(true)}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-all"
        >
          <FilePlus className="w-3.5 h-3.5 text-cyan-400" />
          <span>New Cell Source File</span>
        </button>
      </div>

      {/* New File Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                Create New Cell B.E. Source File
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFile} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target Directory</label>
                <select
                  value={newFilePath}
                  onChange={(e) => setNewFilePath(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                >
                  <option value="src/spe/">src/spe/ (SPU & MFC Cores)</option>
                  <option value="src/ppe/">src/ppe/ (PowerPC PPE Core)</option>
                  <option value="src/bus/">src/bus/ (EIB Bus)</option>
                  <option value="include/cell/">include/cell/ (Headers)</option>
                  <option value="samples/">samples/ (Assembly/C Kernels)</option>
                  <option value="hdl/">hdl/ (Verilog RTL)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">File Name</label>
                <input
                  type="text"
                  placeholder="e.g. spu_fft_radix4.cpp or custom_kernel.spu.s"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Language</label>
                <select
                  value={newFileLang}
                  onChange={(e) => setNewFileLang(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                >
                  <option value="cpp">C++ (.cpp)</option>
                  <option value="c">C (.c)</option>
                  <option value="assembly">SPU / PowerPC Assembly (.s)</option>
                  <option value="header">C/C++ Header (.h)</option>
                  <option value="verilog">Verilog RTL (.v)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs"
                >
                  Create File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};
