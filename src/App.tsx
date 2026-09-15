import React, { useState } from 'react';
import JSZip from 'jszip';
import { ALL_CONSOLE_SOURCE_FILES } from './data/all_console_source_files';
import { SourceFile } from './types/cell';
import { Header } from './components/Header';
import { SourceFileTree } from './components/SourceFileTree';
import { CodeViewer } from './components/CodeViewer';
import { SpuSimulatorView } from './components/SpuSimulatorView';
import { EibRingVisualizer } from './components/EibRingVisualizer';
import { IsaReferenceView } from './components/IsaReferenceView';
import { CellSpecsView } from './components/CellSpecsView';
import { ConsoleArchitectureExplorer } from './components/ConsoleArchitectureExplorer';
import { CenturyArchitectureExplorer } from './components/CenturyArchitectureExplorer';
import { SettingsModal } from './components/SettingsModal';
import { AppSettings, DEFAULT_SETTINGS } from './types/settings';
import { soundEngine } from './utils/audioFeedback';

export default function App() {
  const [files, setFiles] = useState<SourceFile[]>(ALL_CONSOLE_SOURCE_FILES);
  const [activeFileId, setActiveFileId] = useState<string>('multi-platform-benchmark-cpp');
  const [activeTab, setActiveTab] = useState<'sources' | 'simulator' | 'eib' | 'isa' | 'specs' | 'consoles' | 'century'>('century');
  const [simulatorAssembly, setSimulatorAssembly] = useState<string | undefined>(undefined);
  const [isZipping, setIsZipping] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Settings State with LocalStorage Persistence
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('cell_century_app_settings');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // Ignore
    }
    return DEFAULT_SETTINGS;
  });

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('cell_century_app_settings', JSON.stringify(newSettings));
    } catch {
      // Ignore
    }
  };

  const handleResetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem('cell_century_app_settings');
    } catch {
      // Ignore
    }
  };

  const handleTabChange = (tab: 'sources' | 'simulator' | 'eib' | 'isa' | 'specs' | 'consoles' | 'century') => {
    if (settings.audioEnabled) {
      soundEngine.playClick(settings.audioVolume);
    }
    setActiveTab(tab);
  };

  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  const handleUpdateFileContent = (fileId: string, newContent: string) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, content: newContent } : f));
  };

  const handleAddNewFile = (newFile: SourceFile) => {
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
  };

  const handleOpenInSimulator = (code: string) => {
    setSimulatorAssembly(code);
    setActiveTab('simulator');
  };

  const handleSelectSourceFileFromExplorer = (fileId: string) => {
    const found = files.find(f => f.id === fileId || f.name.includes(fileId));
    if (found) {
      setActiveFileId(found.id);
    }
    setActiveTab('sources');
  };

  const handleDownloadAllZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      // Create directories and populate files
      for (const file of files) {
        zip.file(file.path, file.content);
      }

      // Add a comprehensive README.md to the zip
      const readmeContent = `# Video Game Console & Hardware Architecture Simulation Suite
Sony Computer Entertainment • Microsoft Corporation • Nintendo • IBM • NVIDIA • AMD

## Systems Included & C/C++ Subsystem Sources:

### 1. Sony PlayStation 3 (Cell Broadband Engine + RSX)
- include/cell/types.h & spu_intrinsics.h: 128-bit SIMD Quadword Vector Types
- src/spe/spu_core.h / .cpp: SPU 128-bit SIMD RISC core emulator
- src/spe/mfc_dma.h / .cpp: Memory Flow Controller DMA queue & mailbox
- src/ppe/ppe_core.h / .cpp: Power Processing Element (PPE) 64-bit PowerPC (SMT2)
- src/bus/cell_eib.h / .cpp: Element Interconnect Bus 4-Ring Data Highway (204.8 GB/s)
- src/rsx/rsx_core.cpp: NVIDIA RSX Reality Synthesizer GPU (550 MHz)
- src/memory/memory_subsystem.cpp: 256 MB Rambus XDR DRAM (25.6 GB/s)
- src/io/southbridge.cpp: Southbridge I/O, BD-ROM, SATA HDD, Syscon

### 2. Microsoft Xbox 360 (Xenon + Xenos)
- consoles/xbox360/include/xenon_cpu.h & .cpp: IBM Xenon 3.2 GHz Triple-Core PowerPC (6 SMT threads)
- consoles/xbox360/include/xenos_gpu.h & .cpp: ATI Xenos Unified Shaders + 10MB eDRAM Daughter Die
- consoles/xbox360/include/xenos_memory.h: 512 MB GDDR3 Unified Memory (22.4 GB/s) & Southbridge

### 3. Sony PlayStation 4 (AMD Jaguar + GCN)
- consoles/ps4/include/jaguar_cpu.h & .cpp: AMD Jaguar 8-Core x86-64 CPU Subsystem
- consoles/ps4/include/gcn_gpu.h & .cpp: AMD Radeon GCN 1.1 GPU (18 CUs, 8 ACEs, 1.84 TFLOPS)
- consoles/ps4/include/ps4_memory.h: 8 GB Unified GDDR5 (176 GB/s)

### 4. Sony PlayStation 5 (AMD Zen 2 + RDNA 2 + Tempest)
- consoles/ps5/include/zen2_cpu.h & .cpp: AMD Zen 2 8-Core/16-Thread 3.5 GHz (AVX2)
- consoles/ps5/include/rdna2_gpu.h & .cpp: AMD RDNA 2 10.28 TFLOPS with 36 Hardware Ray Accelerators
- consoles/ps5/include/tempest_audio.h: Tempest 3D Audio Engine DSP (HRTF spatial sound)
- consoles/ps5/include/nvme_ssd_controller.h: Custom 12-Channel PCIe 4.0 NVMe SSD (5.5 GB/s raw / Kraken)

### 5. Microsoft Xbox One (AMD Jaguar + eSRAM)
- consoles/xboxone/include/durango_cpu.h & .cpp: AMD Jaguar 8-Core 1.75 GHz
- consoles/xboxone/include/esram_subsystem.h & .cpp: 32 MB On-Die eSRAM (204 GB/s) + 8 GB DDR3

### 6. Nintendo Switch (NVIDIA Tegra X1)
- consoles/switch/include/tegra_x1.h & .cpp: Quad ARM Cortex-A57 + 256-Core Maxwell GPU (Docked & Handheld)

### 7. Sony PlayStation 2 (Emotion Engine + Graphics Synthesizer)
- consoles/ps2/include/emotion_engine.h & .cpp: 128-bit MIPS R5900 + Vector Units VU0/VU1 + GS eDRAM (48 GB/s)

### 8. Operating Systems & Real-Time Kernel Subsystems
- consoles/ps3/os/cellos_lv2_kernel.h & .cpp: Sony PS3 CellOS (LV1 Hypervisor & LV2 GameOS POSIX Microkernel, sys_spu_thread dispatch)
- consoles/xbox360/os/xbox360_kernel.h & .cpp: Microsoft Xbox 360 System Software (Windows NT 5.2 Single-Address Space Kernel, KeCreateThread, XAM Guide mini-OS)
- consoles/ps4/os/orbis_os_kernel.h & .cpp: Sony PS4 Orbis OS (FreeBSD 9.0-RELEASE UNIX Kernel, sceKernelAllocateDirectMemory hUMA Onion/Garlic paging)
- consoles/xboxone/os/xboxone_tri_os.h & .cpp: Microsoft Xbox One Tri-OS (Hyper-V Host Hypervisor + ERA Game OS VM + Shared Windows 10 OS VM)
- consoles/ps5/os/prosperity_os_kernel.h & .cpp: Sony PS5 Prosperity OS (FreeBSD 11/12 Kernel with DirectStorage DMA & Kraken decompression driver)
- consoles/switch/os/horizon_microkernel.h & .cpp: Nintendo Switch Horizon OS (Mesosphere ARM64 Capability-Based Microkernel, sm IPC, nvdrv GPU bridge)
- consoles/ps2/os/ps2_ee_iop_os.h & .cpp: Sony PS2 Dual-Core OS (EE MIPS R5900 Real-Time Kernel + IOP MIPS R3000 Modular OS, SIF DMA bridge)

### 9. Master Benchmark & Diagnostic Test Harness
- consoles/src/multi_platform_benchmark.cpp: Multi-platform execution benchmark testing all subsystems
`;
      zip.file('README.md', readmeContent);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'console_hardware_and_os_simulation_suite.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate ZIP archive', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onDownloadAllZip={handleDownloadAllZip}
        isZipping={isZipping}
        totalFiles={files.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
        showTelemetryOverlay={settings.showTelemetryOverlay}
      />

      {/* Main Workspace View */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'century' && (
          <CenturyArchitectureExplorer
            onSelectSourceFile={(file) => {
              setActiveFileId(file.id);
              setActiveTab('sources');
            }}
            files={files}
          />
        )}

        {activeTab === 'consoles' && (
          <ConsoleArchitectureExplorer
            onSelectSourceFile={handleSelectSourceFileFromExplorer}
            files={files}
          />
        )}

        {activeTab === 'sources' && (
          <div className="flex-1 flex w-full">
            <SourceFileTree
              files={files}
              activeFileId={activeFile.id}
              onSelectFile={(f) => setActiveFileId(f.id)}
              onAddNewFile={handleAddNewFile}
            />
            <CodeViewer
              file={activeFile}
              onUpdateFileContent={handleUpdateFileContent}
              onOpenInSimulator={handleOpenInSimulator}
            />
          </div>
        )}

        {activeTab === 'simulator' && (
          <SpuSimulatorView initialCode={simulatorAssembly} />
        )}

        {activeTab === 'eib' && (
          <EibRingVisualizer />
        )}

        {activeTab === 'isa' && (
          <IsaReferenceView />
        )}

        {activeTab === 'specs' && (
          <CellSpecsView />
        )}
      </main>

      {/* Options & Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetSettings={handleResetSettings}
      />
    </div>
  );
}
