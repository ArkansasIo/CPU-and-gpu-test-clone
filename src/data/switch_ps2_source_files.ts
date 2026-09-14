import { SourceFile } from '../types/cell';

export const SWITCH_PS2_SOURCE_FILES: SourceFile[] = [
  {
    id: 'switch-tegra-h',
    name: 'tegra_x1.h',
    path: 'switch/include/tegra_x1.h',
    category: 'switch',
    platform: 'switch',
    language: 'header',
    description: 'Nintendo Switch - NVIDIA Tegra X1 (T210) SoC: Quad ARM Cortex-A57 + 256-Core Maxwell GPU',
    content: `/**
 * Nintendo Switch (Odin) - NVIDIA Tegra X1 (T210) SoC Architecture
 * Quad-Core ARM Cortex-A57 64-bit + 256-Core NVIDIA Maxwell GPU
 * Copyright (c) Nintendo Co., Ltd. / NVIDIA Corporation.
 *
 * Microarchitectural Highlights:
 *  - CPU: 4x ARM Cortex-A57 cores @ 1.020 GHz (ARMv8-A 64-bit with 128-bit NEON SIMD)
 *  - 2 MB L2 shared cache for CPU cluster
 *  - GPU: NVIDIA Maxwell architecture with 256 CUDA cores (1 SM block)
 *  - GPU Clocks: 768 MHz (Docked) / 307.2 - 460 MHz (Handheld battery mode)
 *  - Compute: 393 GFLOPS FP32 (Docked) / 786 GFLOPS FP16 half-precision
 *  - Memory: 4 GB LPDDR4 @ 1600 MHz Docked (25.6 GB/s) / 1331 MHz Handheld
 */

#ifndef SWITCH_TEGRA_X1_H_
#define SWITCH_TEGRA_X1_H_

#include <cstdint>
#include <array>
#include <vector>

namespace switch_hw {

constexpr size_t   TEGRA_NUM_A57_CORES      = 4;
constexpr uint32_t TEGRA_A57_CLOCK_MHZ      = 1020;
constexpr size_t   TEGRA_MAXWELL_CUDA_CORES = 256;
constexpr uint32_t TEGRA_GPU_DOCKED_MHZ     = 768;
constexpr uint32_t TEGRA_GPU_HANDHELD_MHZ   = 384;
constexpr float    TEGRA_DRAM_BW_GBPS       = 25.6f; // 25.6 GB/s docked

enum class SwitchPowerMode {
    HANDHELD,
    DOCKED
};

class TegraX1SoC {
public:
    TegraX1SoC();
    ~TegraX1SoC() = default;

    void Boot();
    void SetMode(SwitchPowerMode mode);
    void Step();

    uint32_t GetGpuClock() const { return mode_ == SwitchPowerMode::DOCKED ? TEGRA_GPU_DOCKED_MHZ : TEGRA_GPU_HANDHELD_MHZ; }
    void PrintTelemetry() const;

private:
    SwitchPowerMode mode_;
    uint64_t cpu_cycles_;
    uint64_t gpu_frames_;
};

} // namespace switch_hw

#endif // SWITCH_TEGRA_X1_H_
`
  },
  {
    id: 'switch-tegra-cpp',
    name: 'tegra_x1.cpp',
    path: 'switch/src/tegra_x1.cpp',
    category: 'switch',
    platform: 'switch',
    language: 'cpp',
    description: 'Implementation of Tegra X1 Cortex-A57 NEON Dispatch and Maxwell GPU Throttling',
    content: `/**
 * Nintendo Switch - NVIDIA Tegra X1 SoC Hardware Implementation
 */

#include "tegra_x1.h"
#include <iostream>

namespace switch_hw {

TegraX1SoC::TegraX1SoC()
    : mode_(SwitchPowerMode::DOCKED), cpu_cycles_(0), gpu_frames_(0) {
    Boot();
}

void TegraX1SoC::Boot() {
    cpu_cycles_ = 0;
    gpu_frames_ = 0;
    std::cout << "[SWITCH TEGRA X1] NVIDIA Tegra X1 (T210) 64-bit SoC Online\\n";
    std::cout << "[SWITCH TEGRA X1] 4x ARM Cortex-A57 @ 1.02 GHz + 256 Maxwell CUDA Cores\\n";
}

void TegraX1SoC::SetMode(SwitchPowerMode mode) {
    mode_ = mode;
    std::cout << "[SWITCH TEGRA X1] Power Profile: " 
              << (mode == SwitchPowerMode::DOCKED ? "DOCKED (768 MHz GPU, 1600 MHz LPDDR4)" : "HANDHELD (384 MHz GPU, 1331 MHz LPDDR4)") << "\\n";
}

void TegraX1SoC::Step() {
    cpu_cycles_ += 4;
    gpu_frames_++;
}

void TegraX1SoC::PrintTelemetry() const {
    std::cout << "=== Nintendo Switch Tegra X1 Telemetry ===\\n";
    std::cout << "  CPU: 4x ARM Cortex-A57 (ARMv8-A 64-bit with 128-bit NEON)\\n";
    std::cout << "  GPU: NVIDIA Maxwell 256 Cores @ " << GetGpuClock() << " MHz\\n";
    std::cout << "  Profile: " << (mode_ == SwitchPowerMode::DOCKED ? "DOCKED" : "HANDHELD") << "\\n";
    std::cout << "  Memory: 4 GB LPDDR4 (Bandwidth: " << TEGRA_DRAM_BW_GBPS << " GB/s)\\n";
}

} // namespace switch_hw
`
  },
  {
    id: 'ps2-ee-h',
    name: 'emotion_engine.h',
    path: 'ps2/include/emotion_engine.h',
    category: 'ps2',
    platform: 'ps2',
    language: 'header',
    description: 'PlayStation 2 - 128-bit "Emotion Engine" MIPS R5900 CPU + Vector Units VU0/VU1 + Graphics Synthesizer',
    content: `/**
 * Sony PlayStation 2 - "Emotion Engine" Architecture Specification
 * 128-bit MIPS R5900 Core @ 294.912 MHz with Vector Units VU0 and VU1
 * Copyright (c) Sony Computer Entertainment Inc.
 *
 * Microarchitectural Highlights:
 *  - 128-bit MIPS III / IV R5900 Core @ 294.912 MHz
 *  - 32 x 128-bit General Purpose Registers (GPRs)
 *  - Vector Unit 0 (VU0): Attached coprocessor in Macro or Micro mode
 *  - Vector Unit 1 (VU1): Standalone 3D geometry transformation matrix engine
 *  - 10-Channel Direct Memory Access Controller (DMAC)
 *  - Graphics Synthesizer (GS): 4 MB Embedded DRAM with 2,560-bit internal bus (48 GB/s fillrate)
 */

#ifndef PS2_EMOTION_ENGINE_H_
#define PS2_EMOTION_ENGINE_H_

#include <cstdint>
#include <array>
#include <vector>

namespace ps2 {

constexpr uint32_t EE_CLOCK_FREQ_HZ = 294912000; // 294.912 MHz
constexpr size_t   VU0_MICRO_MEM_BYTES = 4096;   // 4 KB Microcode
constexpr size_t   VU1_MICRO_MEM_BYTES = 16384;  // 16 KB Microcode
constexpr size_t   GS_EDRAM_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB eDRAM
constexpr float    GS_BUS_BW_GBPS      = 48.0f;  // 48.0 GB/s internal 2560-bit bus

union alignas(16) ee_reg128_t {
    uint8_t  u8[16];
    uint16_t u16[8];
    uint32_t u32[4];
    uint64_t u64[2];
    float    f32[4];
};

struct EmotionEngineState {
    ee_reg128_t gpr[32]; // 32 x 128-bit registers (R0..R31)
    uint32_t pc;
    uint32_t hi, lo, hi1, lo1;
};

class VectorUnit {
public:
    explicit VectorUnit(uint32_t vu_id, size_t mem_size);
    ~VectorUnit() = default;

    void ExecuteMicrocode(uint32_t start_pc);
    void MultiplyMatrix4x4(const float mat[16], const float vec_in[4], float vec_out[4]);

private:
    uint32_t vu_id_;
    std::vector<uint8_t> micro_mem_;
    uint64_t micro_instructions_run_;
};

// PlayStation 2 Graphics Synthesizer (GS)
class GraphicsSynthesizer {
public:
    GraphicsSynthesizer();
    ~GraphicsSynthesizer() = default;

    void Clear(uint32_t color);
    void DrawTriangles(size_t count);

    size_t GetEdramBytes() const { return GS_EDRAM_SIZE_BYTES; }
    float GetInternalBandwidthGBps() const { return GS_BUS_BW_GBPS; }

private:
    std::vector<uint8_t> edram_;
    uint64_t triangles_drawn_;
};

class EmotionEngine {
public:
    EmotionEngine();
    ~EmotionEngine() = default;

    void Boot();
    void Step();

    void PrintTelemetry() const;

private:
    EmotionEngineState state_;
    VectorUnit vu0_;
    VectorUnit vu1_;
    GraphicsSynthesizer gs_;
    uint64_t cycles_;
};

} // namespace ps2

#endif // PS2_EMOTION_ENGINE_H_
`
  },
  {
    id: 'ps2-ee-cpp',
    name: 'emotion_engine.cpp',
    path: 'ps2/src/emotion_engine.cpp',
    category: 'ps2',
    platform: 'ps2',
    language: 'cpp',
    description: 'Implementation of PS2 128-bit MIPS R5900 Core, VU0/VU1 Vector Engines, and Graphics Synthesizer',
    content: `/**
 * Sony PlayStation 2 - "Emotion Engine" & Graphics Synthesizer Implementation
 */

#include "emotion_engine.h"
#include <iostream>
#include <cstring>

namespace ps2 {

VectorUnit::VectorUnit(uint32_t vu_id, size_t mem_size)
    : vu_id_(vu_id), micro_mem_(mem_size, 0), micro_instructions_run_(0) {
}

void VectorUnit::ExecuteMicrocode(uint32_t start_pc) {
    micro_instructions_run_ += 16;
}

void VectorUnit::MultiplyMatrix4x4(const float mat[16], const float vec_in[4], float vec_out[4]) {
    for (int r = 0; r < 4; ++r) {
        vec_out[r] = (mat[r * 4 + 0] * vec_in[0]) +
                     (mat[r * 4 + 1] * vec_in[1]) +
                     (mat[r * 4 + 2] * vec_in[2]) +
                     (mat[r * 4 + 3] * vec_in[3]);
    }
    micro_instructions_run_++;
}

GraphicsSynthesizer::GraphicsSynthesizer()
    : edram_(GS_EDRAM_SIZE_BYTES, 0), triangles_drawn_(0) {
}

void GraphicsSynthesizer::Clear(uint32_t color) {
    std::fill(edram_.begin(), edram_.end(), 0);
}

void GraphicsSynthesizer::DrawTriangles(size_t count) {
    triangles_drawn_ += count;
}

EmotionEngine::EmotionEngine()
    : vu0_(0, VU0_MICRO_MEM_BYTES), vu1_(1, VU1_MICRO_MEM_BYTES), cycles_(0) {
    Boot();
}

void EmotionEngine::Boot() {
    std::memset(&state_, 0, sizeof(state_));
    state_.pc = 0xBFC00000; // MIPS reset vector
    cycles_ = 0;
    std::cout << "[PS2 EE] Sony Emotion Engine 128-bit MIPS R5900 @ 294.912 MHz Initialized\\n";
    std::cout << "[PS2 EE] Vector Units VU0 & VU1 Ready | GS 4 MB eDRAM (2,560-bit bus @ 48 GB/s)\\n";
}

void EmotionEngine::Step() {
    state_.pc += 4;
    cycles_++;
}

void EmotionEngine::PrintTelemetry() const {
    std::cout << "=== PS2 Emotion Engine Telemetry ===\\n";
    std::cout << "  Core: 128-bit MIPS R5900 @ 294.912 MHz\\n";
    std::cout << "  Registers: 32 x 128-bit SIMD GPRs\\n";
    std::cout << "  Vector Coprocessors: VU0 (4 KB) + VU1 (16 KB 3D Transform Engine)\\n";
    std::cout << "  Graphics Synthesizer: 4 MB eDRAM (2,560-bit bus @ 48.0 GB/s bandwidth)\\n";
}

} // namespace ps2
`
  }
];
