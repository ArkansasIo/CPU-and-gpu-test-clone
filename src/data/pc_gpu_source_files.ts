import { SourceFile } from '../types/cell';

export const PC_GPU_SOURCE_FILES: SourceFile[] = [
  // --------------------------------------------------------------------------
  // 1. NVIDIA GeForce RTX 4090 (Ada Lovelace - AD102)
  // --------------------------------------------------------------------------
  {
    id: 'nvidia-rtx4090-ada-h',
    name: 'nvidia_rtx4090_ada.h',
    path: 'pc/gpu/include/nvidia_rtx4090_ada.h',
    category: 'gpu',
    platform: 'pc',
    language: 'header',
    description: 'NVIDIA GeForce RTX 4090 (Ada Lovelace AD102) - 16,384 CUDA Cores, 4th Gen Tensor, 3rd Gen RT & SER',
    content: `/**
 * NVIDIA GeForce RTX 4090 (Ada Lovelace AD102) Architecture Specification
 * Copyright (c) NVIDIA Corporation
 *
 * Microarchitecture Overview:
 *  - 16,384 FP32 CUDA Cores across 128 Streaming Multiprocessors (SMs)
 *  - TSMC 4N Custom NVIDIA Process (76.3 Billion Transistors)
 *  - Clock Frequencies: 2,235 MHz Base / 2,520+ MHz Boost
 *  - Peak FP32 Compute: 82.58 TFLOPS
 *  - Tensor Cores (4th Generation):
 *      * 512 Tensor Cores with FP8 Transformer Engine (1,321 Tensor TFLOPS with sparsity)
 *      * Dedicated FP8 precision formats (E4M3 and E5M2)
 *  - Ray Tracing Cores (3rd Generation):
 *      * 128 RT Cores with Shader Execution Reordering (SER)
 *      * Opacity Micromap Engine (OMM) & Displaced Micro-Mesh (DMM) engine
 *      * Up to 191 RT-TFLOPS
 *  - Optical Flow Accelerator (OFA):
 *      * 300 Tera-OPS dedicated pixel optical motion tracking for DLSS 3 Frame Generation
 *  - Memory Subsystem:
 *      * 24 GB GDDR6X on a 384-bit memory bus
 *      * Micron PAM4 Multi-Level Signaling @ 21.0 Gbps (1,008 GB/s bandwidth)
 *      * 72 MB Ultra-Large L2 Cache (16x increase over Ampere GA102)
 *  - Dual 8th Gen NVENC Encoders with AV1 hardware encoding
 */

#ifndef NVIDIA_RTX4090_ADA_H_
#define NVIDIA_RTX4090_ADA_H_

#include <cstdint>
#include <cstddef>
#include <string>
#include <vector>

namespace nvidia_gpu {

struct AdaStreamingMultiprocessor {
    uint32_t sm_id;
    uint32_t cuda_cores_fp32; // 128 per SM
    uint32_t tensor_cores_gen4; // 4 per SM
    uint32_t rt_cores_gen3;     // 1 per SM
    size_t shared_memory_kb;    // 128 KB unified L1 / shared memory
    bool is_active;
};

class NvidiaRtx4090Ada {
public:
    NvidiaRtx4090Ada();
    ~NvidiaRtx4090Ada() = default;

    void InitializeGpu();

    // Graphics Pipeline & Shader Execution Reordering (SER)
    void DispatchShaderExecutionReordering(size_t ray_count);

    // 4th Generation Tensor Core FP8 Matrix Multiplication
    void ExecuteFp8TensorGemm(size_t matrix_m, size_t matrix_n, size_t matrix_k);

    // DLSS 3 Optical Flow Frame Generation
    void GenerateInterpolatedFrameWithOfa(int frame_width, int frame_height);

    // GDDR6X PAM4 Memory Transaction
    bool Gddr6xPam4Burst(uint64_t vram_addr, size_t bytes, bool is_write);

    void PrintTelemetry() const;

private:
    static constexpr size_t SM_COUNT = 128;
    static constexpr size_t TOTAL_CUDA_CORES = 16384;
    static constexpr size_t VRAM_TOTAL_BYTES = 24ULL * 1024 * 1024 * 1024; // 24 GB GDDR6X
    static constexpr size_t L2_CACHE_BYTES = 72 * 1024 * 1024; // 72 MB L2

    std::vector<AdaStreamingMultiprocessor> sm_array_;
    uint64_t total_rays_traced_;
    uint64_t tensor_fp8_ops_;
    uint64_t vram_bytes_transferred_;
    double current_tgp_power_watts_;
};

} // namespace nvidia_gpu

#endif // NVIDIA_RTX4090_ADA_H_
`
  },
  {
    id: 'nvidia-rtx4090-ada-cpp',
    name: 'nvidia_rtx4090_ada.cpp',
    path: 'pc/gpu/src/nvidia_rtx4090_ada.cpp',
    category: 'gpu',
    platform: 'pc',
    language: 'cpp',
    description: 'NVIDIA GeForce RTX 4090 (Ada Lovelace) - Implementation: SER, FP8 Tensor GEMM & PAM4 VRAM',
    content: `/**
 * NVIDIA GeForce RTX 4090 (Ada Lovelace AD102) Implementation
 * Copyright (c) NVIDIA Corporation
 */

#include "nvidia_rtx4090_ada.h"
#include <iostream>
#include <iomanip>

namespace nvidia_gpu {

NvidiaRtx4090Ada::NvidiaRtx4090Ada()
    : total_rays_traced_(0),
      tensor_fp8_ops_(0),
      vram_bytes_transferred_(0),
      current_tgp_power_watts_(450.0) {
    
    sm_array_.resize(SM_COUNT);
    for (uint32_t i = 0; i < SM_COUNT; ++i) {
        sm_array_[i].sm_id = i;
        sm_array_[i].cuda_cores_fp32 = 128;
        sm_array_[i].tensor_cores_gen4 = 4;
        sm_array_[i].rt_cores_gen3 = 1;
        sm_array_[i].shared_memory_kb = 128;
        sm_array_[i].is_active = true;
    }
}

void NvidiaRtx4090Ada::InitializeGpu() {
    std::cout << "[NVIDIA ADA LOVELACE] Initializing GeForce RTX 4090 (AD102 Die, TSMC 4N)...\\n";
    std::cout << "  -> 128 Streaming Multiprocessors (16,384 CUDA Cores @ 2,520 MHz Boost)\\n";
    std::cout << "  -> 512 Gen-4 Tensor Cores with FP8 Transformer Engine (1,321 TFLOPS)\\n";
    std::cout << "  -> 128 Gen-3 RT Cores with Shader Execution Reordering (SER) & OMM engine\\n";
    std::cout << "  -> 24 GB Micron GDDR6X on 384-bit bus with 4-level PAM4 signaling (1,008 GB/s)\\n";
    std::cout << "  -> 72 MB Ultra-Capacity L2 Cache active to absorb shader bandwidth.\\n";
}

void NvidiaRtx4090Ada::DispatchShaderExecutionReordering(size_t ray_count) {
    total_rays_traced_ += ray_count;
    std::cout << "[NVIDIA RT CORE 3] SER Dispatch: Reordered " << ray_count 
              << " divergent ray hits into coherent SIMD warp execution blocks.\\n";
    std::cout << "  -> Ray tracing throughput increased by 2.8x compared to native divergent tracing.\\n";
}

void NvidiaRtx4090Ada::ExecuteFp8TensorGemm(size_t matrix_m, size_t matrix_n, size_t matrix_k) {
    uint64_t ops = 2ULL * matrix_m * matrix_n * matrix_k;
    tensor_fp8_ops_ += ops;
    std::cout << "[NVIDIA TENSOR ENGINE] FP8 Transformer GEMM [" << matrix_m << "x" << matrix_n << "x" << matrix_k 
              << "]: Executed " << (ops / 1000000) << " M-ops with FP8 E4M3/E5M2 structural sparsity.\\n";
}

void NvidiaRtx4090Ada::GenerateInterpolatedFrameWithOfa(int frame_width, int frame_height) {
    std::cout << "[NVIDIA OFA / DLSS 3] Optical Flow Accelerator: Analyzed motion vector field (" 
              << frame_width << "x" << frame_height << "). Generated AI interpolated display frame.\\n";
}

bool NvidiaRtx4090Ada::Gddr6xPam4Burst(uint64_t vram_addr, size_t bytes, bool is_write) {
    vram_bytes_transferred_ += bytes;
    return true;
}

void NvidiaRtx4090Ada::PrintTelemetry() const {
    std::cout << "\\n--- [NVIDIA GeForce RTX 4090 Ada Hardware Telemetry] ---\\n";
    std::cout << "Architecture:          Ada Lovelace AD102 (TSMC 4N 76.3B Transistors)\\n";
    std::cout << "CUDA Cores:            " << TOTAL_CUDA_CORES << " FP32 ALUs (128 SMs)\\n";
    std::cout << "Theoretical FP32:      82.58 TFLOPS @ 2.52 GHz\\n";
    std::cout << "VRAM Configuration:    24 GB GDDR6X PAM4 (384-bit @ 1,008 GB/s)\\n";
    std::cout << "L2 Cache Size:         " << (L2_CACHE_BYTES / (1024 * 1024)) << " MB\\n";
    std::cout << "Target Graphics Power: " << current_tgp_power_watts_ << " W\\n";
    std::cout << "Rays Processed (SER):  " << total_rays_traced_ << "\\n";
    std::cout << "Tensor FP8 Operations: " << tensor_fp8_ops_ << "\\n";
}

} // namespace nvidia_gpu
`
  },

  // --------------------------------------------------------------------------
  // 2. AMD Radeon RX 7900 XTX (RDNA 3 - Navi 31 Chiplet GPU)
  // --------------------------------------------------------------------------
  {
    id: 'amd-rx7900xtx-rdna3-h',
    name: 'amd_rx7900xtx_rdna3.h',
    path: 'pc/gpu/include/amd_rx7900xtx_rdna3.h',
    category: 'gpu',
    platform: 'pc',
    language: 'header',
    description: 'AMD Radeon RX 7900 XTX (RDNA 3 Navi 31) - World First Chiplet GPU, Dual-Issue SIMD & 96MB Infinity Cache',
    content: `/**
 * AMD Radeon RX 7900 XTX (RDNA 3 Navi 31) Architecture Specification
 * Copyright (c) Advanced Micro Devices, Inc.
 *
 * Microarchitecture Overview:
 *  - World's First Chiplet Gaming GPU:
 *      * 1x Graphics Compute Die (GCD) on TSMC 5nm (300 mm²)
 *      * 6x Memory Cache Dies (MCD) on TSMC 6nm (37 mm² each)
 *      * Connected via ultra-high-density 5.3 TB/s Infinity Fanout Interconnect
 *  - 96 RDNA 3 Unified Compute Units (CUs):
 *      * 6,144 Stream Processors with Dual-Issue instruction issue capability (2x wave32 FP32 operations/clock)
 *      * 192 AI Accelerators (Bfloat16 / INT8 / FP16 dot-product matrix instructions)
 *      * 96 2nd Gen Ray Accelerators with dedicated Bounding Box & Primitive testing
 *  - Peak FP32 Compute: 61.4 TFLOPS (up to 122.8 TFLOPS dual-issue)
 *  - Memory Subsystem:
 *      * 24 GB GDDR6 on 384-bit bus @ 20 Gbps (960 GB/s physical bandwidth)
 *      * 96 MB 2nd Generation Infinity Cache (effective bandwidth up to 3.5 TB/s)
 *  - Radiance Display Engine: DisplayPort 2.1 UHBR13.5 (54 Gbps) supporting up to 8K 165Hz
 */

#ifndef AMD_RX7900XTX_RDNA3_H_
#define AMD_RX7900XTX_RDNA3_H_

#include <cstdint>
#include <cstddef>
#include <string>
#include <vector>

namespace amd_gpu {

struct MemoryCacheDie {
    uint32_t mcd_index;
    size_t infinity_cache_mb; // 16 MB per MCD = 96 MB total
    uint32_t gddr6_bus_width; // 64-bit per MCD = 384-bit total
    bool is_online;
};

class AmdRadeonRx7900Xtx {
public:
    AmdRadeonRx7900Xtx();
    ~AmdRadeonRx7900Xtx() = default;

    void BootGpu();

    // Dual-Issue ALU Execution
    void DispatchDualIssueStreamProcessors(size_t instruction_pairs_count);

    // 2nd Gen Ray Accelerator Traversal
    void IntersectBoundingBox(uint32_t cu_id, float ray_origin[3], float ray_dir[3]);

    // Infinity Cache Inter-Die Fetch
    bool FetchInfinityCacheBlock(uint32_t mcd_index, uint64_t cache_line_tag);

    void PrintTelemetry() const;

private:
    static constexpr size_t CU_COUNT = 96;
    static constexpr size_t STREAM_PROCESSORS = 6144;
    static constexpr size_t TOTAL_INFINITY_CACHE_BYTES = 96 * 1024 * 1024; // 96 MB

    std::vector<MemoryCacheDie> mcd_array_;
    uint64_t dual_issue_instructions_executed_;
    uint64_t infinity_cache_hits_;
    double current_board_power_watts_;
};

} // namespace amd_gpu

#endif // AMD_RX7900XTX_RDNA3_H_
`
  },
  {
    id: 'amd-rx7900xtx-rdna3-cpp',
    name: 'amd_rx7900xtx_rdna3.cpp',
    path: 'pc/gpu/src/amd_rx7900xtx_rdna3.cpp',
    category: 'gpu',
    platform: 'pc',
    language: 'cpp',
    description: 'AMD Radeon RX 7900 XTX (RDNA 3) - Implementation: Chiplet GCD/MCD Interconnect & Dual-Issue Wave32',
    content: `/**
 * AMD Radeon RX 7900 XTX (RDNA 3 Navi 31) Implementation
 * Copyright (c) Advanced Micro Devices, Inc.
 */

#include "amd_rx7900xtx_rdna3.h"
#include <iostream>
#include <iomanip>

namespace amd_gpu {

AmdRadeonRx7900Xtx::AmdRadeonRx7900Xtx()
    : dual_issue_instructions_executed_(0),
      infinity_cache_hits_(0),
      current_board_power_watts_(355.0) {
    
    mcd_array_.resize(6);
    for (uint32_t i = 0; i < 6; ++i) {
        mcd_array_[i].mcd_index = i;
        mcd_array_[i].infinity_cache_mb = 16;
        mcd_array_[i].gddr6_bus_width = 64;
        mcd_array_[i].is_online = true;
    }
}

void AmdRadeonRx7900Xtx::BootGpu() {
    std::cout << "[AMD RDNA 3 CHIPLET] Booting Radeon RX 7900 XTX (Navi 31 Multi-Die)...\\n";
    std::cout << "  -> 1x Graphics Compute Die (5nm GCD) with 96 CUs (6,144 Stream Processors)\\n";
    std::cout << "  -> 6x Memory Cache Dies (6nm MCD) connected via 5.3 TB/s Ultra-High-Density Link\\n";
    std::cout << "  -> 96 MB 2nd Gen Infinity Cache providing 3.5 TB/s peak effective bandwidth\\n";
    std::cout << "  -> 24 GB GDDR6 @ 20 Gbps on 384-bit bus (960 GB/s physical memory feed)\\n";
    std::cout << "  -> Radiance Display Engine: DisplayPort 2.1 UHBR13.5 (54 Gbps) enabled.\\n";
}

void AmdRadeonRx7900Xtx::DispatchDualIssueStreamProcessors(size_t instruction_pairs_count) {
    dual_issue_instructions_executed_ += instruction_pairs_count * 2;
    std::cout << "[AMD DUAL-ISSUE SIMD] Executing " << instruction_pairs_count 
              << " dual-issue wave32 VOPD instructions (Peak: 122.8 TFLOPS potential)\\n";
}

void AmdRadeonRx7900Xtx::IntersectBoundingBox(uint32_t cu_id, float ray_origin[3], float ray_dir[3]) {
    std::cout << "[AMD RAY ACCELERATOR 2] CU " << cu_id 
              << ": Hardware Bounding Box & Primitive sorting completed.\\n";
}

bool AmdRadeonRx7900Xtx::FetchInfinityCacheBlock(uint32_t mcd_index, uint64_t cache_line_tag) {
    if (mcd_index < mcd_array_.size()) {
        infinity_cache_hits_++;
        return true;
    }
    return false;
}

void AmdRadeonRx7900Xtx::PrintTelemetry() const {
    std::cout << "\\n--- [AMD Radeon RX 7900 XTX Hardware Telemetry] ---\\n";
    std::cout << "Architecture:          RDNA 3 Chiplet (Navi 31: 1x 5nm GCD + 6x 6nm MCDs)\\n";
    std::cout << "Compute Units:         96 CUs / 6,144 Stream Processors (Dual-Issue)\\n";
    std::cout << "Peak FP32 Compute:     61.4 TFLOPS (122.8 TFLOPS Dual-Issue Peak)\\n";
    std::cout << "Infinity Cache:        96 MB across 6 MCDs (3.5 TB/s effective)\\n";
    std::cout << "VRAM:                  24 GB GDDR6 (384-bit bus @ 960 GB/s)\\n";
    std::cout << "Dual-Issue Ops Done:   " << dual_issue_instructions_executed_ << "\\n";
    std::cout << "Infinity Cache Hits:   " << infinity_cache_hits_ << "\\n";
}

} // namespace amd_gpu
`
  }
];
