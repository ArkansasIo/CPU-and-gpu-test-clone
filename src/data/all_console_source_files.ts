import { SourceFile } from '../types/cell';
import { PS3_SOURCE_FILES } from './ps3_source_files';
import { XBOX360_SOURCE_FILES } from './xbox360_source_files';
import { PS4_SOURCE_FILES } from './ps4_source_files';
import { PS5_SOURCE_FILES } from './ps5_source_files';
import { XBOXONE_SOURCE_FILES } from './xboxone_source_files';
import { SWITCH_PS2_SOURCE_FILES } from './switch_ps2_source_files';
import { CONSOLE_OS_SOURCE_FILES } from './console_os_source_files';
import { PC_CPU_SOURCE_FILES } from './pc_cpu_source_files';
import { PC_GPU_SOURCE_FILES } from './pc_gpu_source_files';
import { PC_COMPONENTS_SOURCE_FILES } from './pc_components_source_files';
import { FUTURE_100Y_SILICON_SOURCE_FILES } from './future_100y_silicon_source_files';

// Master Multi-Platform Hardware Simulation Harness & Benchmark
const MASTER_BENCHMARK_SOURCE: SourceFile = {
  id: 'multi-platform-benchmark-cpp',
  name: 'multi_platform_benchmark.cpp',
  path: 'consoles/src/multi_platform_benchmark.cpp',
  category: 'build',
  platform: 'shared',
  language: 'cpp',
  description: 'Master Multi-Platform Simulation & Benchmark Harness (PS3, PS4, PS5, Xbox 360, Xbox One, Switch, PS2)',
  content: `/**
 * ============================================================================
 * Video Game Console & Processor Architecture Benchmark & Simulation Suite
 * Author: Stephen Deline Jr.
 * Developed by: Stephen Deline Jr.
 * Multi-Platform Hardware Comparison & Diagnostic Execution Harness
 * ============================================================================
 * 
 * Target Architectures Executed:
 *  1. Sony PlayStation 3  : Cell B.E. 3.2 GHz (1 PPE + 8 SPEs) + RSX GPU (NV47) + XDR DRAM
 *  2. Microsoft Xbox 360  : IBM Xenon 3.2 GHz (3 Cores / 6 SMT) + ATI Xenos 500 MHz (10MB eDRAM)
 *  3. Sony PlayStation 4  : AMD Jaguar 8-Core 1.6 GHz + GCN GPU (18 CUs, 1.84 TFLOPS) + 8GB GDDR5
 *  4. Microsoft Xbox One  : AMD Jaguar 8-Core 1.75 GHz + GCN GPU (12 CUs) + 32MB eSRAM (204 GB/s)
 *  5. Sony PlayStation 5  : AMD Zen 2 8C/16T 3.5 GHz + RDNA 2 (10.28 TFLOPS) + Tempest 3D Audio + NVMe
 *  6. Nintendo Switch     : NVIDIA Tegra X1 Quad ARM Cortex-A57 + 256-Core Maxwell GPU
 *  7. Sony PlayStation 2  : Emotion Engine 128-bit MIPS R5900 @ 294.9 MHz + VU0/VU1 + Graphics Synthesizer
 */

#include <iostream>
#include <iomanip>
#include <chrono>
#include <vector>
#include <string>

// Include Subsystem Headers
#include "cell/types.h"
#include "xenon_cpu.h"
#include "xenos_gpu.h"
#include "xenos_memory.h"
#include "jaguar_cpu.h"
#include "gcn_gpu.h"
#include "ps4_memory.h"
#include "zen2_cpu.h"
#include "rdna2_gpu.h"
#include "tempest_audio.h"
#include "nvme_ssd_controller.h"
#include "durango_cpu.h"
#include "esram_subsystem.h"
#include "tegra_x1.h"
#include "emotion_engine.h"

int main(int argc, char* argv[]) {
    std::cout << "===============================================================\\n";
    std::cout << "  MASTER GAME CONSOLE & PROCESSOR ARCHITECTURE BENCHMARK SUITE  \\n";
    std::cout << "===============================================================\\n\\n";

    // ------------------------------------------------------------------------
    // 1. Sony PlayStation 3: Cell Broadband Engine & RSX GPU
    // ------------------------------------------------------------------------
    std::cout << "[PHASE 1] Initializing PlayStation 3 Cell B.E. + RSX Architecture...\\n";
    std::cout << "  -> PPE: 64-bit PowerPC @ 3.2 GHz with 2-way SMT\\n";
    std::cout << "  -> SPE: 8 Synergistic Processing Units (128-bit SIMD, 256 KB Local Store each)\\n";
    std::cout << "  -> EIB: 4-Ring Data Highway @ 204.8 GB/s Peak Bus Throughput\\n";
    std::cout << "  -> RSX: 550 MHz NVIDIA G70 with 256 MB GDDR3 + 256 MB Rambus XDR DRAM\\n\\n";

    // ------------------------------------------------------------------------
    // 2. Microsoft Xbox 360: IBM Xenon & ATI Xenos
    // ------------------------------------------------------------------------
    std::cout << "[PHASE 2] Initializing Microsoft Xbox 360 Xenon + Xenos Architecture...\\n";
    xbox360::XenonProcessor xenon;
    xbox360::XenosGpu xenos;
    xbox360::Xbox360MemorySystem xbox360_ram;
    xbox360::Xbox360Southbridge xbox360_sb;
    
    xbox360_sb.Init();
    xenon.RunCycles(10000);
    xenos.BeginFrame();
    
    // Draw sample triangle in 10 MB daughter die eDRAM
    std::vector<xbox360::XenosVertex> x360_verts = {
        {0.0f, 0.5f, 0.5f, 1.0f, 0, 0, 1, 0.5f, 0.0f, {1, 0, 0, 1}},
        {-0.5f, -0.5f, 0.5f, 1.0f, 0, 0, 1, 0.0f, 1.0f, {0, 1, 0, 1}},
        {0.5f, -0.5f, 0.5f, 1.0f, 0, 0, 1, 1.0f, 1.0f, {0, 0, 1, 1}}
    };
    xenos.DrawIndexedPrimitives(x360_verts, {0, 1, 2});
    xenos.EndFrame();
    xenon.PrintTelemetry();
    xenos.PrintTelemetry();
    std::cout << "\\n";

    // ------------------------------------------------------------------------
    // 3. Sony PlayStation 4: AMD Jaguar 8-Core & GCN Radeon
    // ------------------------------------------------------------------------
    std::cout << "[PHASE 3] Initializing Sony PlayStation 4 Architecture...\\n";
    ps4::JaguarSubsystem ps4_cpu;
    ps4::GcnGpu ps4_gpu;
    ps4::Ps4MemorySystem ps4_mem;

    ps4_cpu.RunCycles(5000);
    ps4_gpu.DispatchDrawCommand(3000, 1);
    ps4_gpu.DispatchAsyncCompute(0, "ComputePhysicsSimulationCS");
    ps4_gpu.PresentFrame();
    ps4_cpu.PrintTelemetry();
    ps4_gpu.PrintTelemetry();
    std::cout << "\\n";

    // ------------------------------------------------------------------------
    // 4. Microsoft Xbox One: AMD Jaguar 8-Core & 32MB eSRAM Subsystem
    // ------------------------------------------------------------------------
    std::cout << "[PHASE 4] Initializing Microsoft Xbox One Architecture...\\n";
    xboxone::XboxOneCpu xone_cpu;
    xboxone::EsramSubsystem xone_esram;
    
    xone_cpu.Step();
    xone_esram.AllocateRenderTarget(1920, 1080, 32); // Allocate 1080p G-Buffer in 32 MB eSRAM
    xone_cpu.PrintTelemetry();
    xone_esram.PrintTelemetry();
    std::cout << "\\n";

    // ------------------------------------------------------------------------
    // 5. Sony PlayStation 5: AMD Zen 2, RDNA 2, Tempest 3D Audio, & NVMe
    // ------------------------------------------------------------------------
    std::cout << "[PHASE 5] Initializing Sony PlayStation 5 Architecture...\\n";
    ps5::Zen2Subsystem ps5_cpu;
    ps5::Rdna2Gpu ps5_gpu;
    ps5::TempestAudioEngine ps5_audio;
    ps5::Ps5SsdController ps5_ssd;

    ps5_cpu.StepAll(10000);
    
    // Hardware accelerated Ray Tracing query
    float ray_origin[3] = {0.0f, 1.5f, -5.0f};
    float ray_dir[3] = {0.0f, 0.0f, 1.0f};
    ps5_gpu.DispatchRayQuery(ray_origin, ray_dir);
    ps5_gpu.DrawMeshletPrimitives(64);
    ps5_gpu.Present();

    // Tempest 3D spatial audio
    ps5_audio.RegisterVoice(1, 2.0f, 1.0f, 3.0f, 0.9f);
    ps5_audio.ProcessFrame(nullptr, nullptr, 512);

    // NVMe 5.5 GB/s Direct-to-VRAM streaming
    ps5_ssd.StreamAssetDirectToVram({0x100000, 0x20000000, 16 * 1024 * 1024, true});

    ps5_cpu.PrintTelemetry();
    ps5_gpu.PrintTelemetry();
    ps5_audio.PrintTelemetry();
    ps5_ssd.PrintTelemetry();
    std::cout << "\\n";

    // ------------------------------------------------------------------------
    // 6. Nintendo Switch: NVIDIA Tegra X1 SoC
    // ------------------------------------------------------------------------
    std::cout << "[PHASE 6] Initializing Nintendo Switch Tegra X1 Architecture...\\n";
    switch_hw::TegraX1SoC switch_soc;
    switch_soc.SetMode(switch_hw::SwitchPowerMode::DOCKED);
    switch_soc.Step();
    switch_soc.PrintTelemetry();
    std::cout << "\\n";

    // ------------------------------------------------------------------------
    // 7. Sony PlayStation 2: 128-bit Emotion Engine & Graphics Synthesizer
    // ------------------------------------------------------------------------
    std::cout << "[PHASE 7] Initializing Sony PlayStation 2 Architecture...\\n";
    ps2::EmotionEngine ps2_ee;
    ps2_ee.Step();
    ps2_ee.PrintTelemetry();
    std::cout << "\\n";

    // ------------------------------------------------------------------------
    // 8. High-Performance Modern PC CPUs: Intel Raptor Lake & AMD Zen 4 & Apple M3
    // ------------------------------------------------------------------------
    std::cout << "[PHASE 8] Initializing Modern PC & Workstation CPUs...\\n";
    intel_cpu::IntelRaptorLake14900KS intel_cpu;
    intel_cpu.BootProcessor();
    intel_cpu.ScheduleWorkload("DirectX 12 Ultimate Engine Dispatch", true, true);
    intel_cpu.PrintTelemetry();

    amd_cpu::AmdRyzen7950X3D amd_cpu;
    amd_cpu.BootProcessor();
    amd_cpu.DispatchWorkload("High-Framerate 144Hz Physics Engine", true);
    amd_cpu.PrintTelemetry();

    apple_silicon::AppleM3MaxSoc apple_soc;
    apple_soc.BootSoc();
    apple_soc.AllocateUnifiedBuffer(16 * 1024 * 1024, "RayTracingBVH");
    apple_soc.RunNeuralEngineInference("CoreML Vision Transformer", 512);
    apple_soc.PrintTelemetry();
    std::cout << "\\n";

    // ------------------------------------------------------------------------
    // 9. Flagship Discrete GPUs: NVIDIA Ada Lovelace RTX 4090 & AMD RDNA 3 RX 7900 XTX
    // ------------------------------------------------------------------------
    std::cout << "[PHASE 9] Initializing Flagship Discrete GPUs...\\n";
    nvidia_gpu::NvidiaRtx4090Ada rtx4090;
    rtx4090.InitializeGpu();
    rtx4090.DispatchShaderExecutionReordering(10000000);
    rtx4090.ExecuteFp8TensorGemm(4096, 4096, 4096);
    rtx4090.GenerateInterpolatedFrameWithOfa(3840, 2160);
    rtx4090.PrintTelemetry();

    amd_gpu::AmdRadeonRx7900Xtx rx7900xtx;
    rx7900xtx.BootGpu();
    rx7900xtx.DispatchDualIssueStreamProcessors(5000000);
    rx7900xtx.PrintTelemetry();
    std::cout << "\\n";

    // ------------------------------------------------------------------------
    // 10. PC System Components: DDR5-6400, PCIe 5.0 DirectStorage & Digital VRM
    // ------------------------------------------------------------------------
    std::cout << "[PHASE 10] Initializing PC Components: DDR5, PCIe 5.0 NVMe, & Digital VRM...\\n";
    pc_memory::Ddr5MemoryController ddr5_ctrl;
    ddr5_ctrl.InitializeMemoryBus();
    ddr5_ctrl.ExecuteSameBankRefresh(2);
    ddr5_ctrl.PrintTelemetry();

    pc_storage::Pcie5NvmeController pcie5_ctrl;
    pcie5_ctrl.EnumeratePcieTopology();
    pcie5_ctrl.SubmitDirectStorageRead(0x40000, 2048, 0x20000000);
    pcie5_ctrl.PrintTelemetry();

    pc_motherboard::MotherboardVrmAndChipset vrm_chipset;
    vrm_chipset.PowerOnMotherboard();
    vrm_chipset.AdjustVcoreTransientDroop(280.0f);
    vrm_chipset.PrintTelemetry();
    std::cout << "\\n";

    std::cout << "===============================================================\\n";
    std::cout << " ALL CONSOLE & COMPUTER ARCHITECTURES SIMULATED SUCCESSFULLY!  \\n";
    std::cout << "===============================================================\\n";

    return 0;
}
`
};

// Combine all console and PC sources
export const ALL_CONSOLE_SOURCE_FILES: SourceFile[] = [
  ...PS3_SOURCE_FILES.map(f => ({ ...f, platform: f.platform || 'ps3' as const })),
  ...XBOX360_SOURCE_FILES,
  ...PS4_SOURCE_FILES,
  ...PS5_SOURCE_FILES,
  ...XBOXONE_SOURCE_FILES,
  ...SWITCH_PS2_SOURCE_FILES,
  ...CONSOLE_OS_SOURCE_FILES,
  ...PC_CPU_SOURCE_FILES,
  ...PC_GPU_SOURCE_FILES,
  ...PC_COMPONENTS_SOURCE_FILES,
  ...FUTURE_100Y_SILICON_SOURCE_FILES,
  MASTER_BENCHMARK_SOURCE
];
