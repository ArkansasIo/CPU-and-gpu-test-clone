import { SourceFile } from '../types/cell';

export const PC_CPU_SOURCE_FILES: SourceFile[] = [
  // --------------------------------------------------------------------------
  // 1. Intel Core i9-14900KS (Raptor Lake Refresh - Hybrid Architecture)
  // --------------------------------------------------------------------------
  {
    id: 'intel-raptor-lake-h',
    name: 'intel_raptor_lake.h',
    path: 'pc/cpu/include/intel_raptor_lake.h',
    category: 'cpu',
    platform: 'pc',
    language: 'header',
    description: 'Intel Core i9-14900KS - Raptor Lake Architecture: Hybrid P/E-Cores, Thread Director, Ring Bus & DDR5 Controller',
    content: `/**
 * Intel Core i9-14900KS (Raptor Lake Refresh) Architecture Specification
 * Copyright (c) Intel Corporation
 *
 * Microarchitecture Overview:
 *  - 24 Cores / 32 Threads:
 *      * 8 Raptor Cove Performance Cores (P-Cores) @ up to 6.2 GHz TVB
 *      * 16 Gracemont Efficient Cores (E-Cores) in 4 quad-core clusters @ 4.5 GHz
 *  - Intel Thread Director (ITD): Hardware telemetry microcontroller providing real-time
 *    runtime hints to the Windows / Linux OS scheduler (EHFI - Enhanced Hardware Feedback Interface)
 *  - Intel Smart Cache: 36 MB shared L3 cache linked via bidirectional Ring Bus
 *  - L2 Cache: 2 MB per P-core (16 MB) + 4 MB per E-core cluster (16 MB) = 32 MB L2
 *  - Integrated Memory Controller (IMC): Dual-channel DDR5-5600 JEDEC (DDR5-8000+ XMP 3.0)
 *  - PCIe Complex: 16x PCIe 5.0 lanes (GPU) + 4x PCIe 4.0 lanes (CPU NVMe)
 *  - Instruction Sets: x86-64, Intel VT-x/VT-d, SSE4.2, AVX2, FMA3, Intel DL Boost (VNNI)
 */

#ifndef INTEL_RAPTOR_LAKE_H_
#define INTEL_RAPTOR_LAKE_H_

#include <cstdint>
#include <cstddef>
#include <string>
#include <vector>
#include <array>

namespace intel_cpu {

enum CoreType {
    CORE_TYPE_RAPTOR_COVE_PCORE = 0,
    CORE_TYPE_GRACEMONT_ECORE   = 1
};

struct ExecutionThread {
    uint32_t thread_id;
    uint32_t core_id;
    CoreType core_type;
    double current_freq_ghz;
    bool is_active;
    uint64_t instructions_retired;
    float thermal_celsius;
};

class IntelRaptorLake14900KS {
public:
    IntelRaptorLake14900KS();
    ~IntelRaptorLake14900KS() = default;

    void BootProcessor();

    // Intel Thread Director Hardware Scheduling
    uint32_t ScheduleWorkload(const std::string& task_name, bool is_latency_sensitive, bool is_avx_heavy);
    
    // Ring Bus Interconnect Transaction
    bool RingBusL3Transaction(uint32_t requester_core, uint64_t physical_address, size_t bytes, bool is_write);

    // Thermal Velocity Boost (TVB) & Power Telemetry (PL1 / PL2)
    void UpdatePowerThermalState(double power_watts);
    void PrintTelemetry() const;

private:
    static constexpr size_t P_CORE_COUNT = 8;
    static constexpr size_t E_CORE_COUNT = 16;
    static constexpr size_t TOTAL_THREADS = (P_CORE_COUNT * 2) + E_CORE_COUNT; // 32 Threads
    static constexpr size_t L3_CACHE_SIZE_BYTES = 36 * 1024 * 1024; // 36 MB

    std::array<ExecutionThread, TOTAL_THREADS> threads_;
    double pl1_tau_limit_watts_;
    double pl2_peak_limit_watts_;
    double current_package_power_watts_;
    double peak_recorded_freq_ghz_;
    uint64_t ring_bus_transfers_count_;
};

} // namespace intel_cpu

#endif // INTEL_RAPTOR_LAKE_H_
`
  },
  {
    id: 'intel-raptor-lake-cpp',
    name: 'intel_raptor_lake.cpp',
    path: 'pc/cpu/src/intel_raptor_lake.cpp',
    category: 'cpu',
    platform: 'pc',
    language: 'cpp',
    description: 'Intel Core i9-14900KS - Raptor Lake Implementation: Hybrid Scheduling, Ring Bus & Thermal Telemetry',
    content: `/**
 * Intel Core i9-14900KS (Raptor Lake Refresh) Implementation
 * Copyright (c) Intel Corporation
 */

#include "intel_raptor_lake.h"
#include <iostream>
#include <iomanip>

namespace intel_cpu {

IntelRaptorLake14900KS::IntelRaptorLake14900KS()
    : pl1_tau_limit_watts_(253.0),
      pl2_peak_limit_watts_(320.0),
      current_package_power_watts_(125.0),
      peak_recorded_freq_ghz_(6.2),
      ring_bus_transfers_count_(0) {
    
    // Initialize 8 P-Cores (Hyper-Threaded -> 16 logical threads)
    for (uint32_t i = 0; i < 16; ++i) {
        threads_[i].thread_id = i;
        threads_[i].core_id = i / 2;
        threads_[i].core_type = CORE_TYPE_RAPTOR_COVE_PCORE;
        threads_[i].current_freq_ghz = 5.7; // Base boost
        threads_[i].is_active = false;
        threads_[i].instructions_retired = 0;
        threads_[i].thermal_celsius = 42.0f;
    }

    // Initialize 16 E-Cores (Single-Threaded -> 16 logical threads)
    for (uint32_t i = 16; i < TOTAL_THREADS; ++i) {
        threads_[i].thread_id = i;
        threads_[i].core_id = 8 + (i - 16);
        threads_[i].core_type = CORE_TYPE_GRACEMONT_ECORE;
        threads_[i].current_freq_ghz = 4.4;
        threads_[i].is_active = false;
        threads_[i].instructions_retired = 0;
        threads_[i].thermal_celsius = 38.0f;
    }
}

void IntelRaptorLake14900KS::BootProcessor() {
    std::cout << "[INTEL RAPTOR LAKE] Initializing Intel Core i9-14900KS (LGA1700)...\\n";
    std::cout << "  -> 8 Raptor Cove P-Cores (16T, 6.2 GHz TVB) + 16 Gracemont E-Cores (16T, 4.5 GHz)\\n";
    std::cout << "  -> 36 MB Intel Smart Cache Ring Bus Ring Stop routing online.\\n";
    std::cout << "  -> Dual-Channel DDR5 Integrated Memory Controller (IMC) @ 5600 MT/s (Gear 2)\\n";
    std::cout << "  -> Intel Thread Director (ITD) EHFI Hardware Microcontroller standing by.\\n";
}

uint32_t IntelRaptorLake14900KS::ScheduleWorkload(const std::string& task_name, bool is_latency_sensitive, bool is_avx_heavy) {
    uint32_t target_thread = 0;

    // Intel Thread Director heuristic logic:
    // Latency-critical or AVX/gaming workloads prioritize P-Cores; background/encode prioritize E-Cores
    if (is_latency_sensitive || is_avx_heavy) {
        for (uint32_t i = 0; i < 16; ++i) {
            if (!threads_[i].is_active) {
                target_thread = i;
                break;
            }
        }
        threads_[target_thread].is_active = true;
        threads_[target_thread].current_freq_ghz = (threads_[target_thread].core_id < 2) ? 6.2 : 5.8;
        std::cout << "[INTEL THREAD DIRECTOR] Task '" << task_name 
                  << "' routed to Raptor Cove P-Core " << threads_[target_thread].core_id 
                  << " (Thread " << target_thread << " @ " << threads_[target_thread].current_freq_ghz << " GHz TVB)\\n";
    } else {
        for (uint32_t i = 16; i < TOTAL_THREADS; ++i) {
            if (!threads_[i].is_active) {
                target_thread = i;
                break;
            }
        }
        threads_[target_thread].is_active = true;
        std::cout << "[INTEL THREAD DIRECTOR] Background Task '" << task_name 
                  << "' routed to Gracemont E-Core " << threads_[target_thread].core_id 
                  << " (Thread " << target_thread << " @ " << threads_[target_thread].current_freq_ghz << " GHz)\\n";
    }

    threads_[target_thread].instructions_retired += 1500000;
    return target_thread;
}

bool IntelRaptorLake14900KS::RingBusL3Transaction(uint32_t requester_core, uint64_t physical_address, size_t bytes, bool is_write) {
    ring_bus_transfers_count_++;
    uint32_t ring_stop = requester_core % 12;
    std::cout << "[INTEL RING BUS] Core " << requester_core << " -> Ring Stop " << ring_stop 
              << ": L3 Shared Cache " << (is_write ? "WRITE" : "READ") << " " << bytes 
              << " bytes @ Phys 0x" << std::hex << physical_address << std::dec << "\\n";
    return true;
}

void IntelRaptorLake14900KS::UpdatePowerThermalState(double power_watts) {
    current_package_power_watts_ = power_watts;
    if (current_package_power_watts_ > pl2_peak_limit_watts_) {
        std::cout << "[INTEL THERMAL MONITOR] PL2 Limit (320W) breached: Package Power " 
                  << current_package_power_watts_ << "W. Initiating Thermal Velocity Throttling.\\n";
    }
}

void IntelRaptorLake14900KS::PrintTelemetry() const {
    std::cout << "\\n--- [Intel Core i9-14900KS Hardware Telemetry] ---\\n";
    std::cout << "Package Cores/Threads: 24 Cores / 32 Threads (8P + 16E)\\n";
    std::cout << "Peak Single-Core Clock:" << peak_recorded_freq_ghz_ << " GHz (Thermal Velocity Boost)\\n";
    std::cout << "L3 Smart Cache:        " << (L3_CACHE_SIZE_BYTES / (1024 * 1024)) << " MB Shared Ring Bus\\n";
    std::cout << "Current Package Power: " << current_package_power_watts_ << " W (PL1: 253W, PL2: 320W)\\n";
    std::cout << "Ring Bus Transactions: " << ring_bus_transfers_count_ << " cycles\\n";
}

} // namespace intel_cpu
`
  },

  // --------------------------------------------------------------------------
  // 2. AMD Ryzen 9 7950X3D (Zen 4 + 3D V-Cache Chiplet Architecture)
  // --------------------------------------------------------------------------
  {
    id: 'amd-zen4-x3d-h',
    name: 'amd_zen4_x3d.h',
    path: 'pc/cpu/include/amd_zen4_x3d.h',
    category: 'cpu',
    platform: 'pc',
    language: 'header',
    description: 'AMD Ryzen 9 7950X3D - Zen 4 Chiplet Architecture: 3D V-Cache, Infinity Fabric & Dual-Issue AVX-512',
    content: `/**
 * AMD Ryzen 9 7950X3D (Zen 4 + 3D V-Cache) Architecture Specification
 * Copyright (c) Advanced Micro Devices, Inc.
 *
 * Microarchitecture Overview:
 *  - 16 Cores / 32 Threads across 2 Core Complex Dies (CCDs) on TSMC 5nm:
 *      * CCD0: 8 Cores / 16 Threads with 64 MB 3D V-Cache stacked atop 32 MB 2D L3 = 96 MB L3 Cache!
 *      * CCD1: 8 Cores / 16 Threads standard frequency-optimized Zen 4 (up to 5.7 GHz boost)
 *  - Total L3 Cache: 128 MB (96 MB on CCD0 + 32 MB on CCD1)
 *  - Total Cache (L2 + L3): 144 MB
 *  - Client I/O Die (cIOD 6nm):
 *      * Dual-channel DDR5-6000 EXPO memory controller
 *      * 28 PCIe 5.0 lanes
 *      * RDNA 2 integrated graphics compute unit
 *  - Infinity Fabric (IFOP): On-package inter-die interconnect operating at FCLK 2000 MHz (64 GB/s)
 *  - AVX-512 Support: Dual-pumped 256-bit SIMD vector execution datapath without frequency downclocking
 */

#ifndef AMD_ZEN4_X3D_H_
#define AMD_ZEN4_X3D_H_

#include <cstdint>
#include <cstddef>
#include <string>
#include <vector>
#include <array>

namespace amd_cpu {

struct Zen4Core {
    uint32_t core_id;
    uint32_t ccd_index; // 0 = 3D V-Cache CCD, 1 = High-Frequency CCD
    bool has_3d_vcache;
    double max_boost_freq_ghz;
    double current_freq_ghz;
    bool is_busy;
};

class AmdRyzen7950X3D {
public:
    AmdRyzen7950X3D();
    ~AmdRyzen7950X3D() = default;

    void BootProcessor();

    // AMD 3D V-Cache Optimizer Driver Dispatch
    uint32_t DispatchWorkload(const std::string& workload_name, bool cache_sensitive_gaming);

    // Infinity Fabric Inter-Die Transfer
    void SendInfinityFabricPacket(uint32_t src_ccd, uint32_t dest_ccd, size_t bytes);

    // AVX-512 Vector Execution
    void ExecuteAvx512VectorAdd(uint32_t core_id, size_t element_count);

    void PrintTelemetry() const;

private:
    static constexpr size_t CORES_PER_CCD = 8;
    static constexpr size_t TOTAL_CORES = 16;
    static constexpr size_t TOTAL_L3_BYTES = 128ULL * 1024 * 1024; // 128 MB L3

    std::array<Zen4Core, TOTAL_CORES> cores_;
    uint64_t infinity_fabric_bytes_routed_;
    uint64_t cache_hits_on_3d_vcache_;
    double fclk_freq_mhz_;
};

} // namespace amd_cpu

#endif // AMD_ZEN4_X3D_H_
`
  },
  {
    id: 'amd-zen4-x3d-cpp',
    name: 'amd_zen4_x3d.cpp',
    path: 'pc/cpu/src/amd_zen4_x3d.cpp',
    category: 'cpu',
    platform: 'pc',
    language: 'cpp',
    description: 'AMD Ryzen 9 7950X3D - Zen 4 Implementation: 3D V-Cache Allocation, Infinity Fabric & AVX-512',
    content: `/**
 * AMD Ryzen 9 7950X3D (Zen 4 + 3D V-Cache) Implementation
 * Copyright (c) Advanced Micro Devices, Inc.
 */

#include "amd_zen4_x3d.h"
#include <iostream>
#include <iomanip>

namespace amd_cpu {

AmdRyzen7950X3D::AmdRyzen7950X3D()
    : infinity_fabric_bytes_routed_(0),
      cache_hits_on_3d_vcache_(0),
      fclk_freq_mhz_(2000.0) {
    
    // CCD0: 3D V-Cache Cores (Cores 0-7, 96MB L3 total on die)
    for (uint32_t i = 0; i < 8; ++i) {
        cores_[i].core_id = i;
        cores_[i].ccd_index = 0;
        cores_[i].has_3d_vcache = true;
        cores_[i].max_boost_freq_ghz = 5.25;
        cores_[i].current_freq_ghz = 4.2;
        cores_[i].is_busy = false;
    }

    // CCD1: High-Frequency Cores (Cores 8-15, up to 5.7 GHz)
    for (uint32_t i = 8; i < 16; ++i) {
        cores_[i].core_id = i;
        cores_[i].ccd_index = 1;
        cores_[i].has_3d_vcache = false;
        cores_[i].max_boost_freq_ghz = 5.70;
        cores_[i].current_freq_ghz = 4.5;
        cores_[i].is_busy = false;
    }
}

void AmdRyzen7950X3D::BootProcessor() {
    std::cout << "[AMD RYZEN 7950X3D] Initializing Zen 4 Chiplet Socket AM5 Processor...\\n";
    std::cout << "  -> CCD0 (3D V-Cache): 8 Cores / 16 Threads + 96 MB L3 (TSV direct copper-to-copper bond)\\n";
    std::cout << "  -> CCD1 (Frequency):  8 Cores / 16 Threads + 32 MB L3 (Up to 5.7 GHz boost)\\n";
    std::cout << "  -> Client I/O Die (cIOD 6nm): Dual DDR5-6000 EXPO + 28 PCIe 5.0 Lanes\\n";
    std::cout << "  -> Infinity Fabric Interconnect (IFOP): Active @ FCLK 2000 MHz (64 GB/s bidirectional)\\n";
}

uint32_t AmdRyzen7950X3D::DispatchWorkload(const std::string& workload_name, bool cache_sensitive_gaming) {
    uint32_t selected_core = 0;

    if (cache_sensitive_gaming) {
        // Route to CCD0 (3D V-Cache) to maximize L3 cache hits and minimize DRAM latency
        for (uint32_t i = 0; i < 8; ++i) {
            if (!cores_[i].is_busy) {
                selected_core = i;
                break;
            }
        }
        cores_[selected_core].is_busy = true;
        cores_[selected_core].current_freq_ghz = cores_[selected_core].max_boost_freq_ghz;
        cache_hits_on_3d_vcache_ += 2500000;
        std::cout << "[AMD 3D V-CACHE DRIVER] Gaming Workload '" << workload_name 
                  << "' locked to CCD0 Core " << selected_core 
                  << " (96 MB 3D V-Cache hit rate: 98.4%)\\n";
    } else {
        // Route to CCD1 for raw peak multi-threaded or high-frequency clock speed
        for (uint32_t i = 8; i < 16; ++i) {
            if (!cores_[i].is_busy) {
                selected_core = i;
                break;
            }
        }
        cores_[selected_core].is_busy = true;
        cores_[selected_core].current_freq_ghz = cores_[selected_core].max_boost_freq_ghz;
        std::cout << "[AMD CHIPSET DRIVER] Compute Workload '" << workload_name 
                  << "' locked to CCD1 High-Frequency Core " << selected_core 
                  << " (@ " << cores_[selected_core].max_boost_freq_ghz << " GHz Boost)\\n";
    }

    return selected_core;
}

void AmdRyzen7950X3D::SendInfinityFabricPacket(uint32_t src_ccd, uint32_t dest_ccd, size_t bytes) {
    infinity_fabric_bytes_routed_ += bytes;
    std::cout << "[AMD INFINITY FABRIC] IFOP Inter-Die Link: Routed " << (bytes / 1024) 
              << " KB from CCD" << src_ccd << " to CCD" << dest_ccd 
              << " via cIOD @ FCLK " << fclk_freq_mhz_ << " MHz\\n";
}

void AmdRyzen7950X3D::ExecuteAvx512VectorAdd(uint32_t core_id, size_t element_count) {
    std::cout << "[AMD ZEN 4 AVX-512] Core " << core_id 
              << ": Executing dual 256-bit AVX-512 vector pipelines (" 
              << element_count << " 32-bit floats) without CPU downclocking!\\n";
}

void AmdRyzen7950X3D::PrintTelemetry() const {
    std::cout << "\\n--- [AMD Ryzen 9 7950X3D Silicon Telemetry] ---\\n";
    std::cout << "Physical Cores:        16 Cores / 32 Threads (2x 5nm CCDs + 6nm cIOD)\\n";
    std::cout << "Total L3 Cache:        " << (TOTAL_L3_BYTES / (1024 * 1024)) << " MB (96MB 3D V-Cache + 32MB Standard)\\n";
    std::cout << "Infinity Fabric FCLK:  " << fclk_freq_mhz_ << " MHz (64 GB/s Inter-Die Bandwidth)\\n";
    std::cout << "3D V-Cache Hits:       " << cache_hits_on_3d_vcache_ << " operations\\n";
    std::cout << "Fabric Data Streamed:  " << (infinity_fabric_bytes_routed_ / (1024 * 1024)) << " MB\\n";
}

} // namespace amd_cpu
`
  },

  // --------------------------------------------------------------------------
  // 3. Apple Silicon M3 Max (ARMv9-A Heterogeneous Workstation SoC)
  // --------------------------------------------------------------------------
  {
    id: 'apple-m3-max-h',
    name: 'apple_m3_max.h',
    path: 'pc/cpu/include/apple_m3_max.h',
    category: 'cpu',
    platform: 'pc',
    language: 'header',
    description: 'Apple Silicon M3 Max - ARMv9-A SoC: 16-Core CPU, 512-bit UMA 400 GB/s & 16-Core Neural Engine',
    content: `/**
 * Apple Silicon M3 Max Architecture Specification
 * Copyright (c) Apple Inc.
 *
 * Microarchitecture Overview:
 *  - TSMC 3nm Process (92 Billion Transistors)
 *  - 16-Core CPU:
 *      * 12 Performance Cores (P-Cores) with 192 KB L1 Instruction Cache, 128 KB L1 Data Cache
 *      * 4 Efficiency Cores (E-Cores) with 128 KB L1 Instruction Cache, 64 KB L1 Data Cache
 *  - Unified Memory Architecture (UMA):
 *      * 512-bit LPDDR5-6400 memory bus delivering 400 GB/s unified bandwidth
 *      * Zero-copy shared pool between CPU, 40-core GPU, and Apple Neural Engine
 *  - Apple Neural Engine (ANE): 16-core NPU delivering 18 TOPS INT8/FP16 for on-device AI
 *  - Media Engine: Hardware decode/encode for H.264, HEVC, ProRes, ProRes RAW, and AV1
 */

#ifndef APPLE_M3_MAX_H_
#define APPLE_M3_MAX_H_

#include <cstdint>
#include <cstddef>
#include <string>
#include <vector>

namespace apple_silicon {

class AppleM3MaxSoc {
public:
    AppleM3MaxSoc();
    ~AppleM3MaxSoc() = default;

    void BootSoc();

    // Unified Memory Zero-Copy Allocation
    uint64_t AllocateUnifiedBuffer(size_t size_bytes, const std::string& buffer_name);

    // Apple Neural Engine Hardware Inference
    void RunNeuralEngineInference(const std::string& model_name, size_t token_count);

    // Media Engine Hardware Accelerator
    void EncodeProResStream(int width, int height, int fps);

    void PrintTelemetry() const;

private:
    bool is_soc_booted_;
    size_t total_uma_allocated_bytes_;
    uint64_t neural_engine_ops_count_;
};

} // namespace apple_silicon

#endif // APPLE_M3_MAX_H_
`
  },
  {
    id: 'apple-m3-max-cpp',
    name: 'apple_m3_max.cpp',
    path: 'pc/cpu/src/apple_m3_max.cpp',
    category: 'cpu',
    platform: 'pc',
    language: 'cpp',
    description: 'Apple Silicon M3 Max - ARMv9 Implementation: 512-bit UMA Fabric & Neural Engine Dispatch',
    content: `/**
 * Apple Silicon M3 Max Implementation
 * Copyright (c) Apple Inc.
 */

#include "apple_m3_max.h"
#include <iostream>
#include <iomanip>

namespace apple_silicon {

AppleM3MaxSoc::AppleM3MaxSoc()
    : is_soc_booted_(false),
      total_uma_allocated_bytes_(0),
      neural_engine_ops_count_(0) {}

void AppleM3MaxSoc::BootSoc() {
    std::cout << "[APPLE M3 MAX] Booting Apple Silicon M3 Max SoC (TSMC 3nm, 92B Transistors)...\\n";
    std::cout << "  -> 16-Core ARMv9 CPU: 12 High-Performance Cores + 4 High-Efficiency Cores\\n";
    std::cout << "  -> 512-bit Unified Memory Architecture (UMA) Bus active: 400 GB/s bandwidth\\n";
    std::cout << "  -> 16-Core Apple Neural Engine (ANE) & Dual ProRes Codec engines initialized\\n";
    is_soc_booted_ = true;
}

uint64_t AppleM3MaxSoc::AllocateUnifiedBuffer(size_t size_bytes, const std::string& buffer_name) {
    uint64_t uma_addr = 0x100000000ULL + total_uma_allocated_bytes_;
    total_uma_allocated_bytes_ += size_bytes;

    std::cout << "[APPLE UMA FABRIC] Allocated " << (size_bytes / (1024 * 1024)) 
              << " MB Unified Buffer ('" << buffer_name << "') @ 0x" << std::hex << uma_addr << std::dec
              << " (Zero-copy accessible by CPU, GPU, & Neural Engine simultaneously!)\\n";
    return uma_addr;
}

void AppleM3MaxSoc::RunNeuralEngineInference(const std::string& model_name, size_t token_count) {
    neural_engine_ops_count_ += token_count * 1000000;
    std::cout << "[APPLE NEURAL ENGINE] Dispatched Model '" << model_name 
              << "' on 16-Core ANE (" << token_count << " tokens generated @ 18 TOPS)\\n";
}

void AppleM3MaxSoc::EncodeProResStream(int width, int height, int fps) {
    std::cout << "[APPLE MEDIA ENGINE] Dedicated hardware ProRes 422 HQ encode stream active: " 
              << width << "x" << height << " @ " << fps << " fps (Zero CPU Utilization)\\n";
}

void AppleM3MaxSoc::PrintTelemetry() const {
    std::cout << "\\n--- [Apple M3 Max SoC Architecture Diagnostics] ---\\n";
    std::cout << "SoC Status:            " << (is_soc_booted_ ? "ACTIVE (ARMv9 3nm)" : "OFFLINE") << "\\n";
    std::cout << "CPU Topology:          16 Cores (12 Performance + 4 Efficiency)\\n";
    std::cout << "Unified Memory Bus:    512-bit LPDDR5-6400 (400.0 GB/s Shared Bandwidth)\\n";
    std::cout << "UMA Allocated:         " << (total_uma_allocated_bytes_ / (1024 * 1024)) << " MB\\n";
    std::cout << "Neural Engine Compute: " << neural_engine_ops_count_ << " matrix operations\\n";
}

} // namespace apple_silicon
`
  }
];
