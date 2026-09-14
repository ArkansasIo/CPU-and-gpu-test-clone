import { SourceFile } from '../types/cell';

export const XBOXONE_SOURCE_FILES: SourceFile[] = [
  {
    id: 'xboxone-cpu-h',
    name: 'durango_cpu.h',
    path: 'xboxone/include/durango_cpu.h',
    category: 'xboxone',
    platform: 'xboxone',
    language: 'header',
    description: 'Microsoft Xbox One ("Durango") AMD 8-Core Jaguar 1.75 GHz CPU & Hypervisor OS',
    content: `/**
 * Microsoft Xbox One ("Durango") - Processor & Dual-OS Architecture
 * AMD 8-Core Jaguar x86-64 Processor @ 1.75 GHz
 * Copyright (c) Microsoft Corporation.
 *
 * Microarchitectural Highlights:
 *  - 8 Jaguar x86-64 Cores clocked at 1.75 GHz (Boosted from 1.6 GHz)
 *  - Hypervisor architecture partitioning system resources:
 *      * Host OS (Hyper-V based hardware virtualization layer)
 *      * "Era" Exclusive Game OS (Allocated 7 cores + 5 GB RAM)
 *      * Shared System App OS (Allocated 1 core + 3 GB RAM for multitasking)
 *  - 12 GCN Compute Units (768 shader cores @ 853 MHz = 1.31 TFLOPS)
 *  - 4 Data Move Engines (DMEs) for rapid memory block moves and LZ decompression
 */

#ifndef XBOXONE_DURANGO_CPU_H_
#define XBOXONE_DURANGO_CPU_H_

#include <cstdint>
#include <array>
#include <memory>
#include <vector>

namespace xboxone {

constexpr size_t   XBOXONE_NUM_CORES        = 8;
constexpr uint32_t XBOXONE_CPU_CLOCK_MHZ    = 1750; // 1.75 GHz
constexpr size_t   XBOXONE_GAME_CORES       = 7;    // 7 game cores
constexpr size_t   XBOXONE_SYSTEM_CORES     = 1;    // 1 reserved OS core

struct XboxOneCoreState {
    uint64_t rip;
    uint64_t rsp;
    uint32_t core_id;
    bool is_game_partition;
};

class XboxOneCpu {
public:
    XboxOneCpu();
    ~XboxOneCpu() = default;

    void BootHypervisor();
    void Step();

    void PrintTelemetry() const;

private:
    std::array<XboxOneCoreState, XBOXONE_NUM_CORES> cores_;
    uint64_t cycles_elapsed_;
};

} // namespace xboxone

#endif // XBOXONE_DURANGO_CPU_H_
`
  },
  {
    id: 'xboxone-cpu-cpp',
    name: 'durango_cpu.cpp',
    path: 'xboxone/src/durango_cpu.cpp',
    category: 'xboxone',
    platform: 'xboxone',
    language: 'cpp',
    description: 'Implementation of Xbox One 1.75 GHz 8-Core Jaguar Dispatch and Hypervisor Partitioning',
    content: `/**
 * Microsoft Xbox One - CPU & Hypervisor Partitioning Implementation
 */

#include "durango_cpu.h"
#include <iostream>

namespace xboxone {

XboxOneCpu::XboxOneCpu() : cycles_elapsed_(0) {
    BootHypervisor();
}

void XboxOneCpu::BootHypervisor() {
    for (size_t i = 0; i < XBOXONE_NUM_CORES; ++i) {
        cores_[i].core_id = static_cast<uint32_t>(i);
        cores_[i].is_game_partition = (i < XBOXONE_GAME_CORES);
        cores_[i].rip = 0x140000000ULL + (i * 0x10000);
        cores_[i].rsp = 0x7FFFFFE00ULL - (i * 0x20000);
    }
    cycles_elapsed_ = 0;
    std::cout << "[XBOX ONE] Durango 8-Core Jaguar CPU @ 1.75 GHz Initialized (Hyper-V OS Active)\\n";
}

void XboxOneCpu::Step() {
    for (auto& core : cores_) {
        core.rip += 4;
    }
    cycles_elapsed_++;
}

void XboxOneCpu::PrintTelemetry() const {
    std::cout << "=== Xbox One CPU Telemetry ===\\n";
    std::cout << "  Cores: 8 Jaguar x86-64 Cores @ 1.75 GHz\\n";
    std::cout << "  Hypervisor Allocation: 7 Game Partition Cores + 1 Shared System OS Core\\n";
    std::cout << "  Cycles Elapsed: " << cycles_elapsed_ << "\\n";
}

} // namespace xboxone
`
  },
  {
    id: 'xboxone-esram-h',
    name: 'esram_subsystem.h',
    path: 'xboxone/include/esram_subsystem.h',
    category: 'xboxone',
    platform: 'xboxone',
    language: 'header',
    description: 'Xbox One 32 MB High-Speed On-Die Embedded SRAM (eSRAM) Subsystem (204 GB/s)',
    content: `/**
 * Microsoft Xbox One - 32 MB Embedded SRAM (eSRAM) Architecture
 * Ultra High Bandwidth On-Die Scratchpad (204 GB/s Peak)
 *
 * Microarchitectural Highlights:
 *  - 32 MB On-Die Static RAM (eSRAM) embedded directly on the APU silicon
 *  - 204 GB/s Peak Bidirectional Bandwidth (simultaneous 102 GB/s read + 102 GB/s write)
 *  - Supplements the 8 GB DDR3 Main Memory (68.3 GB/s bandwidth)
 *  - Used for G-Buffers, Depth Stencils, and Render Targets to prevent DDR3 bottlenecks
 *  - Managed by 4 on-chip Data Move Engines (DMEs)
 */

#ifndef XBOXONE_ESRAM_SUBSYSTEM_H_
#define XBOXONE_ESRAM_SUBSYSTEM_H_

#include <cstdint>
#include <vector>

namespace xboxone {

constexpr size_t XBOXONE_ESRAM_SIZE_BYTES = 32 * 1024 * 1024; // 32 MB
constexpr float  XBOXONE_ESRAM_BW_GBPS    = 204.0f; // 204 GB/s peak
constexpr size_t XBOXONE_DDR3_SIZE_BYTES  = 8ULL * 1024 * 1024 * 1024; // 8 GB DDR3
constexpr float  XBOXONE_DDR3_BW_GBPS     = 68.3f; // 68.3 GB/s

class EsramSubsystem {
public:
    EsramSubsystem();
    ~EsramSubsystem() = default;

    void Reset();
    bool AllocateRenderTarget(uint32_t width, uint32_t height, uint32_t bpp);
    void TransferDme(uint64_t ddr3_src, uint32_t esram_dst, size_t bytes);

    size_t GetAllocatedBytes() const { return allocated_bytes_; }
    float GetPeakBandwidthGBps() const { return XBOXONE_ESRAM_BW_GBPS; }
    void PrintTelemetry() const;

private:
    std::vector<uint8_t> esram_memory_;
    size_t allocated_bytes_;
    uint64_t dme_transfers_count_;
};

} // namespace xboxone

#endif // XBOXONE_ESRAM_SUBSYSTEM_H_
`
  },
  {
    id: 'xboxone-esram-cpp',
    name: 'esram_subsystem.cpp',
    path: 'xboxone/src/esram_subsystem.cpp',
    category: 'xboxone',
    platform: 'xboxone',
    language: 'cpp',
    description: 'Implementation of Xbox One 32MB eSRAM Memory Pool & Data Move Engines',
    content: `/**
 * Microsoft Xbox One - 32 MB eSRAM & DME Memory Subsystem Implementation
 */

#include "esram_subsystem.h"
#include <iostream>
#include <iomanip>

namespace xboxone {

EsramSubsystem::EsramSubsystem()
    : esram_memory_(XBOXONE_ESRAM_SIZE_BYTES, 0), allocated_bytes_(0), dme_transfers_count_(0) {
    Reset();
}

void EsramSubsystem::Reset() {
    std::fill(esram_memory_.begin(), esram_memory_.end(), 0);
    allocated_bytes_ = 0;
    dme_transfers_count_ = 0;
    std::cout << "[XBOX ONE eSRAM] 32 MB Embedded SRAM Online (204.0 GB/s peak bandwidth)\\n";
}

bool EsramSubsystem::AllocateRenderTarget(uint32_t width, uint32_t height, uint32_t bpp) {
    size_t surface_bytes = width * height * (bpp / 8);
    if (allocated_bytes_ + surface_bytes <= XBOXONE_ESRAM_SIZE_BYTES) {
        allocated_bytes_ += surface_bytes;
        return true;
    }
    return false;
}

void EsramSubsystem::TransferDme(uint64_t ddr3_src, uint32_t esram_dst, size_t bytes) {
    dme_transfers_count_++;
}

void EsramSubsystem::PrintTelemetry() const {
    std::cout << "=== Xbox One eSRAM Memory Telemetry ===\\n";
    std::cout << "  eSRAM: 32 MB On-Die (204 GB/s) | Allocated: " 
              << (allocated_bytes_ / (1024 * 1024)) << " MB / 32 MB\\n";
    std::cout << "  Main System RAM: 8 GB DDR3 (68.3 GB/s)\\n";
    std::cout << "  DME Hardware Transfers: " << dme_transfers_count_ << " DMA operations\\n";
}

} // namespace xboxone
`
  }
];
