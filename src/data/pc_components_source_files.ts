import { SourceFile } from '../types/cell';

export const PC_COMPONENTS_SOURCE_FILES: SourceFile[] = [
  // --------------------------------------------------------------------------
  // 1. DDR5 SDRAM Dual-Channel Memory Subsystem & Memory Controller
  // --------------------------------------------------------------------------
  {
    id: 'ddr5-memory-controller-h',
    name: 'ddr5_memory_controller.h',
    path: 'pc/components/include/ddr5_memory_controller.h',
    category: 'components',
    platform: 'pc',
    language: 'header',
    description: 'DDR5-6400 SDRAM Dual-Channel Memory Controller - Dual 32-bit Subchannels, On-Die ECC & PMIC',
    content: `/**
 * DDR5 SDRAM Dual-Channel Memory Controller Specification
 * JEDEC Standard JESD79-5
 *
 * Microarchitecture Overview:
 *  - Dual 32-bit Subchannels per DIMM:
 *      * Each standard DIMM presents two independent 32-bit channels (+ 8-bit ECC = 40-bit)
 *      * 2 DIMMs in dual-channel mode create 4 independent 32-bit concurrent memory channels
 *  - Burst Length 16 (BL16) with 64-byte minimum cache line access
 *  - On-Die Error-Correcting Code (ODECC):
 *      * Automatic transparent single-bit error detection and recovery within DRAM die
 *  - Power Management IC (PMIC):
 *      * On-module voltage regulation down from 12V / 5V to 1.1V VDD / VDDQ / VPP (1.8V)
 *  - Bank Architecture:
 *      * 32 Banks across 8 Bank Groups (4 banks per bank group)
 *      * Same-Bank Refresh (SBR) allows non-refreshing bank groups to service reads/writes simultaneously
 *  - Timings: CL32-38-38-96 @ 6400 MT/s (51.2 GB/s per channel, 102.4 GB/s dual-channel)
 */

#ifndef DDR5_MEMORY_CONTROLLER_H_
#define DDR5_MEMORY_CONTROLLER_H_

#include <cstdint>
#include <cstddef>
#include <string>
#include <vector>
#include <array>

namespace pc_memory {

struct Ddr5SubChannel {
    uint32_t channel_id; // Subchannel A or B
    uint32_t dimm_slot;
    bool is_busy;
    uint32_t current_bank_active;
    uint64_t reads_served;
    uint64_t writes_served;
    uint64_t odecc_corrections;
};

class Ddr5MemoryController {
public:
    Ddr5MemoryController();
    ~Ddr5MemoryController() = default;

    void InitializeMemoryBus();

    // Memory Access with BL16 scheduling
    bool ScheduleReadTransaction(uint64_t physical_address, uint8_t* dest_buffer, size_t bytes);
    bool ScheduleWriteTransaction(uint64_t physical_address, const uint8_t* src_buffer, size_t bytes);

    // On-Die ECC Recovery
    void TriggerOnDieEccEvent(uint32_t subchannel_id, uint64_t cell_address);

    // Same-Bank Refresh (SBR)
    void ExecuteSameBankRefresh(uint32_t bank_group);

    void PrintTelemetry() const;

private:
    static constexpr size_t SUBCHANNELS_COUNT = 4; // 2 DIMMs x 2 subchannels
    static constexpr size_t TOTAL_CAPACITY_BYTES = 64ULL * 1024 * 1024 * 1024; // 64 GB
    static constexpr double PEAK_BANDWIDTH_GB_S = 102.4; // 6400 MT/s dual-channel

    std::array<Ddr5SubChannel, SUBCHANNELS_COUNT> subchannels_;
    uint64_t total_transferred_bytes_;
    uint64_t total_odecc_flips_fixed_;
    double pmic_voltage_vdd_;
};

} // namespace pc_memory

#endif // DDR5_MEMORY_CONTROLLER_H_
`
  },
  {
    id: 'ddr5-memory-controller-cpp',
    name: 'ddr5_memory_controller.cpp',
    path: 'pc/components/src/ddr5_memory_controller.cpp',
    category: 'components',
    platform: 'pc',
    language: 'cpp',
    description: 'DDR5 Memory Controller - Implementation: Subchannel Interleaving, ODECC & SBR',
    content: `/**
 * DDR5 Memory Controller Implementation
 * JEDEC Standard JESD79-5
 */

#include "ddr5_memory_controller.h"
#include <iostream>
#include <iomanip>

namespace pc_memory {

Ddr5MemoryController::Ddr5MemoryController()
    : total_transferred_bytes_(0),
      total_odecc_flips_fixed_(0),
      pmic_voltage_vdd_(1.10) {
    
    for (uint32_t i = 0; i < SUBCHANNELS_COUNT; ++i) {
        subchannels_[i].channel_id = i;
        subchannels_[i].dimm_slot = i / 2;
        subchannels_[i].is_busy = false;
        subchannels_[i].current_bank_active = 0;
        subchannels_[i].reads_served = 0;
        subchannels_[i].writes_served = 0;
        subchannels_[i].odecc_corrections = 0;
    }
}

void Ddr5MemoryController::InitializeMemoryBus() {
    std::cout << "[DDR5 MEMORY CONTROLLER] Initializing Dual-Channel DDR5-6400 Subsystem (64 GB)...\\n";
    std::cout << "  -> 4 Independent 32-bit Subchannels (2x 32-bit per physical DIMM)\\n";
    std::cout << "  -> On-DIMM PMIC Voltage Regulator locked at 1.10V VDD / 1.10V VDDQ / 1.80V VPP\\n";
    std::cout << "  -> On-Die ECC (ODECC) engine active: Real-time bit-flip detection on DRAM cells\\n";
    std::cout << "  -> Same-Bank Refresh (SBR) enabled across 8 Bank Groups (32 Banks total)\\n";
    std::cout << "  -> Total Aggregate Memory Bandwidth: 102.4 GB/s @ CL32-38-38-96\\n";
}

bool Ddr5MemoryController::ScheduleReadTransaction(uint64_t physical_address, uint8_t* dest_buffer, size_t bytes) {
    uint32_t target_subchan = (physical_address >> 6) % SUBCHANNELS_COUNT;
    subchannels_[target_subchan].reads_served++;
    total_transferred_bytes_ += bytes;

    std::cout << "[DDR5 IMC] READ BL16 (" << bytes << " bytes) routed to Subchannel " 
              << target_subchan << " (DIMM " << subchannels_[target_subchan].dimm_slot 
              << ") @ Phys 0x" << std::hex << physical_address << std::dec << "\\n";
    return true;
}

bool Ddr5MemoryController::ScheduleWriteTransaction(uint64_t physical_address, const uint8_t* src_buffer, size_t bytes) {
    uint32_t target_subchan = (physical_address >> 6) % SUBCHANNELS_COUNT;
    subchannels_[target_subchan].writes_served++;
    total_transferred_bytes_ += bytes;
    return true;
}

void Ddr5MemoryController::TriggerOnDieEccEvent(uint32_t subchannel_id, uint64_t cell_address) {
    subchannels_[subchannel_id].odecc_corrections++;
    total_odecc_flips_fixed_++;
    std::cout << "[DDR5 ON-DIE ECC] Subchannel " << subchannel_id 
              << ": Single-bit DRAM cell flip detected & corrected at 0x" 
              << std::hex << cell_address << std::dec << " (Transparent to CPU OS)\\n";
}

void Ddr5MemoryController::ExecuteSameBankRefresh(uint32_t bank_group) {
    std::cout << "[DDR5 SBR] Same-Bank Refresh active on Bank Group " << bank_group 
              << ". Remaining 7 Bank Groups servicing read/write requests without pausing!\\n";
}

void Ddr5MemoryController::PrintTelemetry() const {
    std::cout << "\\n--- [DDR5-6400 Memory Controller Diagnostics] ---\\n";
    std::cout << "Configuration:         64 GB Dual-Channel (4x 32-bit Subchannels)\\n";
    std::cout << "Data Rate:             6400 MT/s (3200 MHz Clock)\\n";
    std::cout << "Peak Bandwidth:        " << PEAK_BANDWIDTH_GB_S << " GB/s\\n";
    std::cout << "PMIC Rail Voltage:     " << pmic_voltage_vdd_ << " V\\n";
    std::cout << "Total Data Streamed:   " << (total_transferred_bytes_ / (1024 * 1024)) << " MB\\n";
    std::cout << "ODECC Flips Repaired:  " << total_odecc_flips_fixed_ << "\\n";
}

} // namespace pc_memory
`
  },

  // --------------------------------------------------------------------------
  // 2. PCIe 5.0 Root Complex & DirectStorage NVMe Host Controller
  // --------------------------------------------------------------------------
  {
    id: 'pcie5-nvme-controller-h',
    name: 'pcie5_nvme_controller.h',
    path: 'pc/components/include/pcie5_nvme_controller.h',
    category: 'components',
    platform: 'pc',
    language: 'header',
    description: 'PCIe 5.0 Root Complex & NVMe 2.0 DirectStorage Controller - 32 GT/s per lane & DMA Ring Queues',
    content: `/**
 * PCI Express 5.0 Root Complex & NVMe 2.0 Host Controller Specification
 * PCI-SIG PCIe 5.0 / NVM Express 2.0
 *
 * Microarchitecture Overview:
 *  - PCIe 5.0 Physical Layer:
 *      * 32 GT/s (Gigatransfers per second) per lane
 *      * 128b/130b encoding efficiency (~98.46%)
 *      * x16 Slot Bandwidth: 64 GB/s unidirectional / 128 GB/s bidirectional
 *      * x4 NVMe SSD Bandwidth: 15.75 GB/s (enabling 14 GB/s sequential reads)
 *  - NVMe 2.0 DirectStorage DMA Engine:
 *      * Up to 64,000 Submission Queues (SQ) and Completion Queues (CQ)
 *      * Direct GPU memory DMA bypass (NVIDIA GPUDirect Storage / AMD SmartAccess Storage)
 *      * MSI-X multi-vector interrupts for asynchronous completion
 */

#ifndef PCIE5_NVME_CONTROLLER_H_
#define PCIE5_NVME_CONTROLLER_H_

#include <cstdint>
#include <cstddef>
#include <string>
#include <vector>

namespace pc_storage {

struct NvmeSubmissionQueueEntry {
    uint8_t opcode; // 0x02 = Read, 0x01 = Write
    uint32_t namespace_id;
    uint64_t prp1_dma_address;
    uint64_t starting_lba;
    uint16_t sector_count;
};

class Pcie5NvmeController {
public:
    Pcie5NvmeController();
    ~Pcie5NvmeController() = default;

    void EnumeratePcieTopology();

    // DirectStorage Asynchronous DMA Submission
    void SubmitDirectStorageRead(uint64_t source_lba, uint32_t sector_count, uint64_t gpu_vram_destination);

    // Host Controller DMA Scatter-Gather Processing
    void ProcessCompletionRing();

    void PrintTelemetry() const;

private:
    static constexpr size_t PCIE_LANE_COUNT = 16;
    static constexpr double PCIE5_LANE_RATE_GT_S = 32.0;

    std::vector<NvmeSubmissionQueueEntry> submission_ring_;
    uint64_t total_dma_bytes_streamed_;
    uint64_t direct_storage_iops_completed_;
    double peak_nvme_throughput_gb_s_;
};

} // namespace pc_storage

#endif // PCIE5_NVME_CONTROLLER_H_
`
  },
  {
    id: 'pcie5-nvme-controller-cpp',
    name: 'pcie5_nvme_controller.cpp',
    path: 'pc/components/src/pcie5_nvme_controller.cpp',
    category: 'components',
    platform: 'pc',
    language: 'cpp',
    description: 'PCIe 5.0 & NVMe Controller - Implementation: DirectStorage GPU DMA & PCIe 5.0 Root Complex',
    content: `/**
 * PCI Express 5.0 & NVMe 2.0 Controller Implementation
 * PCI-SIG PCIe 5.0 / NVM Express 2.0
 */

#include "pcie5_nvme_controller.h"
#include <iostream>
#include <iomanip>

namespace pc_storage {

Pcie5NvmeController::Pcie5NvmeController()
    : total_dma_bytes_streamed_(0),
      direct_storage_iops_completed_(0),
      peak_nvme_throughput_gb_s_(14.5) {}

void Pcie5NvmeController::EnumeratePcieTopology() {
    std::cout << "[PCIe 5.0 ROOT COMPLEX] Enumerating High-Speed Bus Topology...\\n";
    std::cout << "  -> PCIe Gen 5 x16 Slot (GPU): 32.0 GT/s, 128b/130b encoding (63.04 GB/s bandwidth)\\n";
    std::cout << "  -> PCIe Gen 5 x4 M.2 Slot (NVMe SSD): 15.75 GB/s bus bandwidth\\n";
    std::cout << "  -> NVMe 2.0 Controller initialized: 64,000 Queue Pairs with MSI-X vector dispatch.\\n";
    std::cout << "  -> DirectStorage / GPUDirect Storage direct GPU VRAM DMA bypass active.\\n";
}

void Pcie5NvmeController::SubmitDirectStorageRead(uint64_t source_lba, uint32_t sector_count, uint64_t gpu_vram_destination) {
    size_t transfer_bytes = sector_count * 512;
    total_dma_bytes_streamed_ += transfer_bytes;
    direct_storage_iops_completed_++;

    std::cout << "[DIRECTSTORAGE DMA] NVMe SSD LBA 0x" << std::hex << source_lba 
              << " -> GPU VRAM 0x" << gpu_vram_destination << std::dec 
              << " (" << (transfer_bytes / 1024) << " KB): Streamed at " 
              << peak_nvme_throughput_gb_s_ << " GB/s with 0% CPU overhead!\\n";
}

void Pcie5NvmeController::ProcessCompletionRing() {
    submission_ring_.clear();
}

void Pcie5NvmeController::PrintTelemetry() const {
    std::cout << "\\n--- [PCIe 5.0 & NVMe 2.0 Storage Subsystem Diagnostics] ---\\n";
    std::cout << "Root Complex Link:     PCIe 5.0 (32.0 GT/s per lane, 128b/130b)\\n";
    std::cout << "NVMe Protocol:         NVM Express 2.0 with DirectStorage Bypass\\n";
    std::cout << "Peak Read Throughput:  " << peak_nvme_throughput_gb_s_ << " GB/s\\n";
    std::cout << "DirectStorage IOPS:    " << direct_storage_iops_completed_ << " ops\\n";
    std::cout << "Total DMA Data Stream: " << (total_dma_bytes_streamed_ / (1024 * 1024)) << " MB\\n";
}

} // namespace pc_storage
`
  },

  // --------------------------------------------------------------------------
  // 3. Motherboard Digital VRM & High-End Chipset (Z790 / X670E)
  // --------------------------------------------------------------------------
  {
    id: 'motherboard-vrm-chipset-h',
    name: 'motherboard_vrm_chipset.h',
    path: 'pc/components/include/motherboard_vrm_chipset.h',
    category: 'components',
    platform: 'pc',
    language: 'header',
    description: 'Motherboard Digital VRM & High-End Chipset - 24+1+2 Phase 105A DrMOS & DMI 4.0 x8 Bus',
    content: `/**
 * Motherboard Digital VRM & High-End Chipset Architecture Specification
 * Intel Z790 / AMD X670E Dual Promontory 21
 *
 * Microarchitecture Overview:
 *  - Power Delivery (VRM - Voltage Regulator Module):
 *      * 24+1+2 Teamed Digital Power Phases (24 Vcore + 1 VCCAUX / SOC + 2 VCCIO / DRAM)
 *      * 105A Smart Power Stages (SPS / DrMOS) delivering up to 2,520 Amps
 *      * Multi-phase digital PWM controller with transient load-line calibration (LLC)
 *  - Chipset Interconnect:
 *      * DMI 4.0 x8 (Direct Media Interface) link to CPU (16 GB/s bidirectional)
 *      * Flexible High-Speed I/O (HSIO) lanes: USB 3.2 Gen 2x2 (20 Gbps), Thunderbolt 4 / USB4 (40 Gbps)
 *      * 2.5 GbE Intel I226-V / 10 GbE Aquantia LAN + Wi-Fi 7 (802.11be 320 MHz)
 */

#ifndef MOTHERBOARD_VRM_CHIPSET_H_
#define MOTHERBOARD_VRM_CHIPSET_H_

#include <cstdint>
#include <cstddef>
#include <string>
#include <vector>

namespace pc_motherboard {

struct PowerPhase {
    uint32_t phase_id;
    float current_amps;
    float temperature_celsius;
    bool is_switching;
};

class MotherboardVrmAndChipset {
public:
    MotherboardVrmAndChipset();
    ~MotherboardVrmAndChipset() = default;

    void PowerOnMotherboard();

    // VRM Voltage Load-Line Regulation
    void AdjustVcoreTransientDroop(float load_amperage);

    // Chipset DMI 4.0 Bus Routing
    void RouteDmiTraffic(const std::string& peripheral_source, size_t bytes);

    void PrintTelemetry() const;

private:
    static constexpr size_t VCORE_PHASES = 24;
    static constexpr float MAX_PHASE_AMPS = 105.0f;

    std::vector<PowerPhase> vcore_phases_;
    float regulated_vcore_volts_;
    float total_vcore_current_draw_amps_;
    uint64_t dmi_bytes_routed_;
};

} // namespace pc_motherboard

#endif // MOTHERBOARD_VRM_CHIPSET_H_
`
  },
  {
    id: 'motherboard-vrm-chipset-cpp',
    name: 'motherboard_vrm_chipset.cpp',
    path: 'pc/components/src/motherboard_vrm_chipset.cpp',
    category: 'components',
    platform: 'pc',
    language: 'cpp',
    description: 'Motherboard Digital VRM & Chipset - Implementation: Transient LLC, DrMOS & DMI 4.0 Routing',
    content: `/**
 * Motherboard Digital VRM & Chipset Implementation
 * Intel Z790 / AMD X670E Dual Promontory 21
 */

#include "motherboard_vrm_chipset.h"
#include <iostream>
#include <iomanip>

namespace pc_motherboard {

MotherboardVrmAndChipset::MotherboardVrmAndChipset()
    : regulated_vcore_volts_(1.250f),
      total_vcore_current_draw_amps_(85.0f),
      dmi_bytes_routed_(0) {
    
    vcore_phases_.resize(VCORE_PHASES);
    for (uint32_t i = 0; i < VCORE_PHASES; ++i) {
        vcore_phases_[i].phase_id = i;
        vcore_phases_[i].current_amps = 3.5f;
        vcore_phases_[i].temperature_celsius = 41.5f;
        vcore_phases_[i].is_switching = true;
    }
}

void MotherboardVrmAndChipset::PowerOnMotherboard() {
    std::cout << "[MOTHERBOARD CHIPSET & VRM] Power Delivery & Southbridge Chipset Online...\\n";
    std::cout << "  -> 24+1+2 Digital Power Phase VRM with 105A DrMOS (Total Capacity: 2,520 Amps)\\n";
    std::cout << "  -> High-Density Fin Array VRM Heatsinks with Direct-Touch Heatpipe active\\n";
    std::cout << "  -> DMI 4.0 x8 CPU Interconnect Link established @ 16.0 GB/s bidirectional\\n";
    std::cout << "  -> Thunderbolt 4 / USB4 (40 Gbps) & Wi-Fi 7 (320 MHz) controllers ready.\\n";
}

void MotherboardVrmAndChipset::AdjustVcoreTransientDroop(float load_amperage) {
    total_vcore_current_draw_amps_ = load_amperage;
    float per_phase = load_amperage / VCORE_PHASES;

    for (auto& phase : vcore_phases_) {
        phase.current_amps = per_phase;
        phase.temperature_celsius = 40.0f + (per_phase * 0.4f);
    }

    std::cout << "[DIGITAL PWM VRM] Heavy Transient Spike (" << load_amperage 
              << "A): Load-Line Calibration (LLC Level 6) compensated Vcore drop to " 
              << regulated_vcore_volts_ << "V across all 24 DrMOS phases\\n";
}

void MotherboardVrmAndChipset::RouteDmiTraffic(const std::string& peripheral_source, size_t bytes) {
    dmi_bytes_routed_ += bytes;
    std::cout << "[CHIPSET DMI 4.0] Routed " << (bytes / 1024) << " KB from '" 
              << peripheral_source << "' to CPU via DMI 4.0 x8 link\\n";
}

void MotherboardVrmAndChipset::PrintTelemetry() const {
    std::cout << "\\n--- [Motherboard VRM & Chipset Diagnostics] ---\\n";
    std::cout << "VRM Design:            24+1+2 Digital Power Stages (105A Smart Power Stages)\\n";
    std::cout << "Vcore Voltage:         " << regulated_vcore_volts_ << " V\\n";
    std::cout << "Total VRM Current:     " << total_vcore_current_draw_amps_ << " A\\n";
    std::cout << "Average MOSFET Temp:   " << vcore_phases_[0].temperature_celsius << " °C\\n";
    std::cout << "Chipset Bus Link:      DMI 4.0 x8 (16.0 GB/s)\\n";
    std::cout << "DMI Data Routed:       " << (dmi_bytes_routed_ / (1024 * 1024)) << " MB\\n";
}

} // namespace pc_motherboard
`
  }
];
