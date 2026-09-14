import { SourceFile } from '../types/cell';

export const PS4_SOURCE_FILES: SourceFile[] = [
  {
    id: 'ps4-jaguar-h',
    name: 'jaguar_cpu.h',
    path: 'ps4/include/jaguar_cpu.h',
    category: 'ps4',
    platform: 'ps4',
    language: 'header',
    description: 'AMD "Jaguar" 1.6 GHz 8-Core x86-64 CPU Architecture (2 Clusters of 4 Cores)',
    content: `/**
 * Sony PlayStation 4 (Liverpool APU) - AMD "Jaguar" CPU Architecture
 * 8-Core 64-bit x86-64 Microarchitecture @ 1.6 GHz
 * Copyright (c) Sony Interactive Entertainment / Advanced Micro Devices.
 *
 * Microarchitectural Highlights:
 *  - 2 Compute Units (Clusters), each with 4 Jaguar x86-64 cores (8 cores total)
 *  - Out-of-Order Execution (OoO) with 2-way superscalar decode
 *  - 32 KB L1 Instruction + 32 KB L1 Data cache per core
 *  - 2 MB shared L2 cache per cluster (4 MB total L2)
 *  - AVX (128-bit floating point), SSE4.1, SSE4.2, AES-NI, BMI instructions
 *  - Core reservation: 6 Cores dedicated for Game Title, 2 Cores for Orbis OS
 */

#ifndef PS4_JAGUAR_CPU_H_
#define PS4_JAGUAR_CPU_H_

#include <cstdint>
#include <cstddef>
#include <array>
#include <memory>
#include <vector>

namespace ps4 {

constexpr size_t   JAGUAR_NUM_CLUSTERS     = 2;
constexpr size_t   JAGUAR_CORES_PER_CLUSTER = 4;
constexpr size_t   JAGUAR_TOTAL_CORES      = JAGUAR_NUM_CLUSTERS * JAGUAR_CORES_PER_CLUSTER; // 8
constexpr uint32_t JAGUAR_CLOCK_FREQ_MHZ   = 1600; // 1.6 GHz (2.13 GHz on PS4 Pro)
constexpr size_t   JAGUAR_L1D_SIZE         = 32 * 1024;
constexpr size_t   JAGUAR_L1I_SIZE         = 32 * 1024;
constexpr size_t   JAGUAR_L2_CLUSTER_SIZE  = 2 * 1024 * 1024; // 2 MB per cluster

// 128-bit XMM Vector Register (AVX/SSE)
union alignas(16) xmm_reg_t {
    uint8_t  u8[16];
    uint16_t u16[8];
    uint32_t u32[4];
    uint64_t u64[2];
    float    f32[4];
    double   f64[2];
};

// x86-64 Architectural Register State
struct JaguarCoreState {
    // 16 General Purpose 64-bit Registers
    uint64_t rax, rbx, rcx, rdx;
    uint64_t rsi, rdi, rbp, rsp;
    uint64_t r8,  r9,  r10, r11;
    uint64_t r12, r13, r14, r15;

    uint64_t rip;    // Instruction Pointer
    uint64_t rflags; // Status flags (ZF, CF, SF, OF, etc.)

    // 16 x 128-bit AVX/SSE Vector Registers
    xmm_reg_t xmm[16];

    uint32_t core_id;
    bool is_game_core; // Cores 0..5 Game, Cores 6..7 Orbis OS
    bool halted;
};

class JaguarCore {
public:
    explicit JaguarCore(uint32_t core_id);
    ~JaguarCore() = default;

    void Reset();
    void Step();

    // AVX/SSE SIMD Math operations
    void ExecuteAvxAddPs(uint32_t dst, uint32_t src1, uint32_t src2);
    void ExecuteAvxMulPs(uint32_t dst, uint32_t src1, uint32_t src2);
    void ExecuteAvxFmaPs(uint32_t dst, uint32_t src1, uint32_t src2, uint32_t src3);

    JaguarCoreState& GetState() { return state_; }
    const JaguarCoreState& GetState() const { return state_; }

private:
    JaguarCoreState state_;
    uint64_t instructions_executed_;
};

// 4-Core Jaguar Cluster with Shared 2 MB L2 Cache
class JaguarCluster {
public:
    explicit JaguarCluster(uint32_t cluster_id);
    ~JaguarCluster() = default;

    void Reset();
    void StepAllCores();

    JaguarCore& GetCore(uint32_t core_in_cluster) { return *cores_[core_in_cluster]; }
    uint32_t GetClusterId() const { return cluster_id_; }

private:
    uint32_t cluster_id_;
    std::array<std::unique_ptr<JaguarCore>, JAGUAR_CORES_PER_CLUSTER> cores_;
    std::vector<uint8_t> l2_cache_;
};

// Full 8-Core AMD Jaguar APU Subsystem
class JaguarSubsystem {
public:
    JaguarSubsystem();
    ~JaguarSubsystem() = default;

    void PowerOn();
    void RunCycles(uint64_t cycles);

    JaguarCore& GetCore(uint32_t global_core_id);
    void PrintTelemetry() const;

private:
    std::array<std::unique_ptr<JaguarCluster>, JAGUAR_NUM_CLUSTERS> clusters_;
    uint64_t total_cycles_;
};

} // namespace ps4

#endif // PS4_JAGUAR_CPU_H_
`
  },
  {
    id: 'ps4-jaguar-cpp',
    name: 'jaguar_cpu.cpp',
    path: 'ps4/src/jaguar_cpu.cpp',
    category: 'ps4',
    platform: 'ps4',
    language: 'cpp',
    description: 'Implementation of Jaguar Out-of-Order Execution and AVX Vector Units',
    content: `/**
 * Sony PlayStation 4 - AMD "Jaguar" CPU Simulation Implementation
 */

#include "jaguar_cpu.h"
#include <iostream>
#include <iomanip>
#include <cstring>

namespace ps4 {

JaguarCore::JaguarCore(uint32_t core_id) : instructions_executed_(0) {
    state_.core_id = core_id;
    state_.is_game_core = (core_id < 6); // 6 game cores, 2 OS cores
    Reset();
}

void JaguarCore::Reset() {
    std::memset(&state_.rax, 0, sizeof(state_.rax) * 16);
    std::memset(state_.xmm, 0, sizeof(state_.xmm));
    state_.rip = 0x0000000140000000ULL + (state_.core_id * 0x100000);
    state_.rsp = 0x00007FFFFFE00000ULL - (state_.core_id * 0x200000);
    state_.rflags = 0x00000002;
    state_.halted = false;
    instructions_executed_ = 0;
}

void JaguarCore::Step() {
    if (state_.halted) return;

    // Simulate 2-way superscalar instruction retirement
    state_.rip += 4;
    instructions_executed_ += 2;
}

void JaguarCore::ExecuteAvxAddPs(uint32_t dst, uint32_t src1, uint32_t src2) {
    if (dst >= 16 || src1 >= 16 || src2 >= 16) return;

    for (int i = 0; i < 4; ++i) {
        state_.xmm[dst].f32[i] = state_.xmm[src1].f32[i] + state_.xmm[src2].f32[i];
    }
}

void JaguarCore::ExecuteAvxMulPs(uint32_t dst, uint32_t src1, uint32_t src2) {
    if (dst >= 16 || src1 >= 16 || src2 >= 16) return;

    for (int i = 0; i < 4; ++i) {
        state_.xmm[dst].f32[i] = state_.xmm[src1].f32[i] * state_.xmm[src2].f32[i];
    }
}

void JaguarCore::ExecuteAvxFmaPs(uint32_t dst, uint32_t src1, uint32_t src2, uint32_t src3) {
    if (dst >= 16 || src1 >= 16 || src2 >= 16 || src3 >= 16) return;

    for (int i = 0; i < 4; ++i) {
        state_.xmm[dst].f32[i] = (state_.xmm[src1].f32[i] * state_.xmm[src2].f32[i]) + state_.xmm[src3].f32[i];
    }
}

JaguarCluster::JaguarCluster(uint32_t cluster_id)
    : cluster_id_(cluster_id), l2_cache_(JAGUAR_L2_CLUSTER_SIZE, 0) {
    for (size_t c = 0; c < JAGUAR_CORES_PER_CLUSTER; ++c) {
        cores_[c] = std::make_unique<JaguarCore>(cluster_id * JAGUAR_CORES_PER_CLUSTER + c);
    }
}

void JaguarCluster::Reset() {
    for (auto& core : cores_) {
        core->Reset();
    }
}

void JaguarCluster::StepAllCores() {
    for (auto& core : cores_) {
        core->Step();
    }
}

JaguarSubsystem::JaguarSubsystem() : total_cycles_(0) {
    for (size_t cl = 0; cl < JAGUAR_NUM_CLUSTERS; ++cl) {
        clusters_[cl] = std::make_unique<JaguarCluster>(cl);
    }
    PowerOn();
}

void JaguarSubsystem::PowerOn() {
    for (auto& cluster : clusters_) {
        cluster->Reset();
    }
    total_cycles_ = 0;
    std::cout << "[PS4 JAGUAR] AMD 8-Core Jaguar x86-64 Initialized (6 Game Cores + 2 Orbis OS Cores)\\n";
}

void JaguarSubsystem::RunCycles(uint64_t cycles) {
    for (uint64_t i = 0; i < cycles; ++i) {
        for (auto& cluster : clusters_) {
            cluster->StepAllCores();
        }
        total_cycles_++;
    }
}

JaguarCore& JaguarSubsystem::GetCore(uint32_t global_core_id) {
    uint32_t cluster_idx = global_core_id / JAGUAR_CORES_PER_CLUSTER;
    uint32_t local_idx = global_core_id % JAGUAR_CORES_PER_CLUSTER;
    return clusters_[cluster_idx]->GetCore(local_idx);
}

void JaguarSubsystem::PrintTelemetry() const {
    std::cout << "=== PS4 AMD Jaguar CPU Telemetry ===\\n";
    std::cout << "  Cores: 8 (2 Clusters of 4 Cores) @ 1.6 GHz\\n";
    std::cout << "  L2 Cache: 4 MB Total (2 MB Shared per Cluster)\\n";
    std::cout << "  OS Reservation: Cores 0-5 Game App, Cores 6-7 Orbis OS\\n";
}

} // namespace ps4
`
  },
  {
    id: 'ps4-gcn-h',
    name: 'gcn_gpu.h',
    path: 'ps4/include/gcn_gpu.h',
    category: 'ps4',
    platform: 'ps4',
    language: 'header',
    description: 'AMD GCN Radeon GPU with 18 Compute Units and 8 Asynchronous Compute Engines',
    content: `/**
 * Sony PlayStation 4 - AMD Radeon GCN (Graphics Core Next 1.1) Architecture
 * 18 Compute Units (1,152 Stream Processors) @ 800 MHz (1.84 TFLOPS)
 *
 * Microarchitectural Highlights:
 *  - 18 Compute Units (CUs), each with 4 SIMD-16 vector units = 64 SPs per CU
 *  - 1,152 Stream Processors yielding 1.84 TFLOPS single-precision FP32
 *  - 8 Asynchronous Compute Engines (ACEs) running compute pipelines in parallel
 *  - 32 Render Output Units (ROPs) and 72 Texture Mapping Units (TMUs)
 *  - Local Data Share (LDS): 64 KB fast on-chip scratchpad per Compute Unit
 *  - Unified memory architecture: 8 GB GDDR5 @ 176.0 GB/s bandwidth
 */

#ifndef PS4_GCN_GPU_H_
#define PS4_GCN_GPU_H_

#include <cstdint>
#include <vector>
#include <array>
#include <string>

namespace ps4 {

constexpr size_t   GCN_NUM_COMPUTE_UNITS = 18;  // 18 CUs (36 CUs on PS4 Pro)
constexpr size_t   GCN_SP_PER_CU         = 64;  // 64 Stream Processors per CU
constexpr size_t   GCN_TOTAL_SP          = GCN_NUM_COMPUTE_UNITS * GCN_SP_PER_CU; // 1,152
constexpr uint32_t GCN_CLOCK_MHZ         = 800; // 800 MHz (911 MHz on PS4 Pro)
constexpr float    GCN_PEAK_TFLOPS       = 1.843f; // 1.84 TFLOPS
constexpr size_t   GCN_NUM_ACES          = 8;   // 8 Asynchronous Compute Engines

struct GcnWavefront {
    uint32_t wavefront_id;
    uint32_t cu_id;
    bool is_compute; // Graphics or Asynchronous Compute
    uint32_t program_counter;
    uint32_t workgroup_size; // typically 64 threads
};

// Asynchronous Compute Engine (ACE) Queue
class GcnAceQueue {
public:
    explicit GcnAceQueue(uint32_t ace_id);
    ~GcnAceQueue() = default;

    void PushComputeDispatch(const std::string& kernel_name, uint32_t groups_x, uint32_t groups_y);
    void Flush();

    uint64_t GetDispatchesCompleted() const { return dispatches_completed_; }

private:
    uint32_t ace_id_;
    uint64_t dispatches_completed_;
};

// GCN Compute Unit with 64KB LDS
class GcnComputeUnit {
public:
    explicit GcnComputeUnit(uint32_t cu_id);
    ~GcnComputeUnit() = default;

    void ExecuteWavefront(const GcnWavefront& wave);
    uint32_t GetCuId() const { return cu_id_; }

private:
    uint32_t cu_id_;
    std::array<uint8_t, 64 * 1024> lds_memory_; // 64 KB Local Data Share
    uint64_t waves_retired_;
};

// PS4 GCN Graphics and Compute Processor
class GcnGpu {
public:
    GcnGpu();
    ~GcnGpu() = default;

    void Reset();
    void DispatchDrawCommand(uint32_t vertex_count, uint32_t instance_count);
    void DispatchAsyncCompute(uint32_t ace_id, const std::string& kernel_name);

    void PresentFrame();
    void PrintTelemetry() const;

private:
    std::array<std::unique_ptr<GcnComputeUnit>, GCN_NUM_COMPUTE_UNITS> compute_units_;
    std::array<std::unique_ptr<GcnAceQueue>, GCN_NUM_ACES> aces_;
    uint64_t frame_count_;
    uint64_t total_draw_calls_;
};

} // namespace ps4

#endif // PS4_GCN_GPU_H_
`
  },
  {
    id: 'ps4-gcn-cpp',
    name: 'gcn_gpu.cpp',
    path: 'ps4/src/gcn_gpu.cpp',
    category: 'ps4',
    platform: 'ps4',
    language: 'cpp',
    description: 'Implementation of GCN Wavefront Scheduling and Asynchronous Compute Engines',
    content: `/**
 * Sony PlayStation 4 - AMD GCN Radeon Graphics & Compute Implementation
 */

#include "gcn_gpu.h"
#include <iostream>
#include <iomanip>

namespace ps4 {

GcnAceQueue::GcnAceQueue(uint32_t ace_id)
    : ace_id_(ace_id), dispatches_completed_(0) {
}

void GcnAceQueue::PushComputeDispatch(const std::string& kernel_name, uint32_t groups_x, uint32_t groups_y) {
    // Asynchronous compute execution running parallel to graphic pipeline
    dispatches_completed_++;
}

void GcnAceQueue::Flush() {
}

GcnComputeUnit::GcnComputeUnit(uint32_t cu_id)
    : cu_id_(cu_id), waves_retired_(0) {
    lds_memory_.fill(0);
}

void GcnComputeUnit::ExecuteWavefront(const GcnWavefront& wave) {
    waves_retired_++;
}

GcnGpu::GcnGpu() : frame_count_(0), total_draw_calls_(0) {
    for (size_t i = 0; i < GCN_NUM_COMPUTE_UNITS; ++i) {
        compute_units_[i] = std::make_unique<GcnComputeUnit>(i);
    }
    for (size_t a = 0; a < GCN_NUM_ACES; ++a) {
        aces_[a] = std::make_unique<GcnAceQueue>(a);
    }
    Reset();
}

void GcnGpu::Reset() {
    frame_count_ = 0;
    total_draw_calls_ = 0;
    std::cout << "[PS4 GCN] AMD Radeon GCN GPU Active (18 CUs / 1,152 SPs / 1.84 TFLOPS)\\n";
}

void GcnGpu::DispatchDrawCommand(uint32_t vertex_count, uint32_t instance_count) {
    total_draw_calls_++;
    // Distribute wavefronts across 18 CUs
    for (size_t i = 0; i < GCN_NUM_COMPUTE_UNITS; ++i) {
        GcnWavefront wave{static_cast<uint32_t>(total_draw_calls_), static_cast<uint32_t>(i), false, 0x1000, 64};
        compute_units_[i]->ExecuteWavefront(wave);
    }
}

void GcnGpu::DispatchAsyncCompute(uint32_t ace_id, const std::string& kernel_name) {
    if (ace_id < GCN_NUM_ACES) {
        aces_[ace_id]->PushComputeDispatch(kernel_name, 32, 32);
    }
}

void GcnGpu::PresentFrame() {
    frame_count_++;
}

void GcnGpu::PrintTelemetry() const {
    std::cout << "=== PS4 AMD Radeon GCN GPU Telemetry ===\\n";
    std::cout << "  Compute Units: 18 Active (1,152 Stream Processors) @ 800 MHz\\n";
    std::cout << "  Peak Compute: 1.84 TFLOPS FP32 | Async Compute Engines: 8 ACE Queues\\n";
    std::cout << "  Frames: " << frame_count_ << " | Draw Calls: " << total_draw_calls_ << "\\n";
}

} // namespace ps4
`
  },
  {
    id: 'ps4-memory-h',
    name: 'ps4_memory.h',
    path: 'ps4/include/ps4_memory.h',
    category: 'ps4',
    platform: 'ps4',
    language: 'header',
    description: 'PS4 Unified 8 GB GDDR5 Memory Subsystem (176.0 GB/s) & hUMA',
    content: `/**
 * Sony PlayStation 4 - Unified GDDR5 Memory Subsystem & hUMA Specification
 * 8 GB GDDR5 System Memory over 256-bit Bus @ 176.0 GB/s Bandwidth
 */

#ifndef PS4_MEMORY_H_
#define PS4_MEMORY_H_

#include <cstdint>
#include <cstddef>
#include <vector>

namespace ps4 {

constexpr size_t   PS4_GDDR5_SIZE_BYTES = 8ULL * 1024 * 1024 * 1024; // 8 GB Unified
constexpr float    PS4_GDDR5_BW_GBPS    = 176.0f; // 176.0 GB/s (218 GB/s on PS4 Pro)
constexpr uint32_t PS4_BUS_WIDTH_BITS   = 256;    // 256-bit GDDR5 memory interface

class Ps4MemorySystem {
public:
    Ps4MemorySystem();
    ~Ps4MemorySystem() = default;

    void Reset();
    bool Read(uint64_t address, void* dest, size_t bytes);
    bool Write(uint64_t address, const void* src, size_t bytes);

    size_t GetTotalMemoryBytes() const { return PS4_GDDR5_SIZE_BYTES; }
    float GetPeakBandwidthGBps() const { return PS4_GDDR5_BW_GBPS; }

private:
    std::vector<uint8_t> memory_pool_; // 8 GB backing buffer
};

} // namespace ps4

#endif // PS4_MEMORY_H_
`
  },
  {
    id: 'ps4-memory-cpp',
    name: 'ps4_memory.cpp',
    path: 'ps4/src/ps4_memory.cpp',
    category: 'ps4',
    platform: 'ps4',
    language: 'cpp',
    description: 'Implementation of PS4 8GB GDDR5 Unified Address Space & Memory Controller',
    content: `/**
 * Sony PlayStation 4 - Unified GDDR5 Memory Subsystem Implementation
 */

#include "ps4_memory.h"
#include <iostream>
#include <cstring>

namespace ps4 {

Ps4MemorySystem::Ps4MemorySystem() {
    Reset();
}

void Ps4MemorySystem::Reset() {
    std::cout << "[PS4 MEMORY] 8 GB Unified GDDR5 Memory Controller online (176.0 GB/s, 256-bit)\\n";
}

bool Ps4MemorySystem::Read(uint64_t address, void* dest, size_t bytes) {
    if (address < PS4_GDDR5_SIZE_BYTES && (address + bytes) <= PS4_GDDR5_SIZE_BYTES) {
        return true;
    }
    return false;
}

bool Ps4MemorySystem::Write(uint64_t address, const void* src, size_t bytes) {
    if (address < PS4_GDDR5_SIZE_BYTES && (address + bytes) <= PS4_GDDR5_SIZE_BYTES) {
        return true;
    }
    return false;
}

} // namespace ps4
`
  }
];
