import { SourceFile } from '../types/cell';

export const CONSOLE_OS_SOURCE_FILES: SourceFile[] = [
  // --------------------------------------------------------------------------
  // 1. PlayStation 3: CellOS (LV1 Hypervisor & LV2 GameOS Kernel)
  // --------------------------------------------------------------------------
  {
    id: 'ps3-cellos-kernel-h',
    name: 'cellos_lv2_kernel.h',
    path: 'ps3/os/include/cellos_lv2_kernel.h',
    category: 'ps3',
    platform: 'ps3',
    language: 'header',
    description: 'PlayStation 3 CellOS - Level 2 (LV2) GameOS Kernel & Level 1 (LV1) Hypervisor',
    content: `/**
 * Sony PlayStation 3 - CellOS LV2 Kernel & LV1 Hypervisor Specification
 * Copyright (c) Sony Computer Entertainment Inc.
 *
 * Operating System Architecture:
 *  - Level 1 (LV1): Secure Hypervisor running in PPE root privileged mode
 *  - Level 2 (LV2): GameOS Kernel providing POSIX-like microservices:
 *      * sys_process: Process management and SELF/BIN decryption
 *      * sys_ppu_thread: PPE hardware thread scheduler (64-bit PowerPC)
 *      * sys_spu_thread: SPU hardware thread groups & context switching
 *      * sys_event: Event queues and semaphore synchronization
 *      * sys_memory: User/Kernel page allocation in Rambus XDR DRAM
 *      * sys_fs: Virtual File System (dev_flash, dev_hdd0, dev_bdvd)
 *  - Userland: Virtual Shell (VSH) / Cross Media Bar (XMB) interface
 */

#ifndef PS3_CELLOS_LV2_KERNEL_H_
#define PS3_CELLOS_LV2_KERNEL_H_

#include <cstdint>
#include <cstddef>
#include <string>
#include <vector>
#include <array>
#include <memory>

namespace cellos {

constexpr uint32_t SYS_PROCESS_SPAWN_STACK_SIZE_DEFAULT = 0x20000; // 128 KB
constexpr size_t   MAX_ACTIVE_PPU_THREADS = 64;
constexpr size_t   MAX_ACTIVE_SPU_GROUPS  = 8;
constexpr uint32_t CELLOS_KERNEL_VERSION  = 0x048800; // Firmware 4.88

// Syscall Error Codes
enum CellOsError : int32_t {
    CELL_OK                  = 0,
    CELL_ENOMEM              = -1,
    CELL_EINVAL              = -2,
    CELL_EBUSY               = -3,
    CELL_ETIMEDOUT           = -4,
    CELL_ENOTFOUND           = -5,
    CELL_EPERM               = -6
};

// SPU Thread Group Priority and Configuration
struct SysSpuThreadGroupAttribute {
    char name[32];
    uint32_t n_threads;     // 1 to 6 SPU worker threads
    int32_t  priority;      // 0 (highest) to 255 (lowest)
    uint32_t type;          // Raw or SPU Runtime Managed
};

// PPE Thread Context
struct PpuThreadContext {
    uint64_t thread_id;
    std::string name;
    uint32_t priority;
    uint64_t entry_point;
    uint64_t stack_base;
    size_t   stack_size;
    bool     is_running;
};

// LV1 Hypervisor Security Isolation
class Lv1Hypervisor {
public:
    Lv1Hypervisor();
    ~Lv1Hypervisor() = default;

    void BootHypervisor();
    bool AllocatePhysicalLpar(uint64_t lpar_id, uint64_t xdr_size_bytes);
    bool ConfigureSpeIsolation(uint32_t spe_index, bool isolated_mode);

    uint64_t CallHypervisorSyscall(uint32_t syscall_num, uint64_t arg0, uint64_t arg1);

private:
    bool hypervisor_locked_;
    std::array<bool, 8> spe_isolation_mask_;
};

// LV2 GameOS Microkernel Core
class Lv2GameOsKernel {
public:
    Lv2GameOsKernel();
    ~Lv2GameOsKernel() = default;

    void InitializeKernel(Lv1Hypervisor* hypervisor);

    // Core System Calls (Syscalls)
    int32_t sys_process_create(const std::string& self_path, uint32_t& process_id);
    int32_t sys_ppu_thread_create(uint64_t& thread_id, const std::string& name, uint64_t entry_point, uint32_t prio, size_t stack_size);
    int32_t sys_spu_thread_group_create(uint32_t& group_id, const SysSpuThreadGroupAttribute& attr);
    int32_t sys_spu_thread_group_start(uint32_t group_id);
    int32_t sys_memory_allocate(size_t size, uint32_t flags, uint64_t& alloc_addr);

    void DispatchSchedulerTick();
    void DumpKernelDiagnostics() const;

private:
    Lv1Hypervisor* hypervisor_;
    uint32_t current_process_id_;
    std::vector<PpuThreadContext> ppu_threads_;
    std::vector<SysSpuThreadGroupAttribute> spu_groups_;
    uint64_t total_allocated_xdr_bytes_;
};

} // namespace cellos

#endif // PS3_CELLOS_LV2_KERNEL_H_
`
  },
  {
    id: 'ps3-cellos-kernel-cpp',
    name: 'cellos_lv2_kernel.cpp',
    path: 'ps3/os/src/cellos_lv2_kernel.cpp',
    category: 'ps3',
    platform: 'ps3',
    language: 'cpp',
    description: 'PlayStation 3 CellOS - LV2 Kernel & LV1 Hypervisor Implementation',
    content: `/**
 * Sony PlayStation 3 - CellOS LV2 GameOS & LV1 Hypervisor Implementation
 * Copyright (c) Sony Computer Entertainment Inc.
 */

#include "cellos_lv2_kernel.h"
#include <iostream>
#include <iomanip>
#include <cstring>

namespace cellos {

Lv1Hypervisor::Lv1Hypervisor() : hypervisor_locked_(false) {
    spe_isolation_mask_.fill(false);
}

void Lv1Hypervisor::BootHypervisor() {
    std::cout << "[LV1 HYPERVISOR] Bootstrapping Cell Broadband Engine LPAR 0...\\n";
    // Reserve SPE 7 for hypervisor/crypto security monitor
    spe_isolation_mask_[7] = true;
    hypervisor_locked_ = true;
    std::cout << "  -> SPE 7 locked in isolated security boundary.\\n";
    std::cout << "  -> Hardware address translation and SLB initialized.\\n";
}

bool Lv1Hypervisor::AllocatePhysicalLpar(uint64_t lpar_id, uint64_t xdr_size_bytes) {
    std::cout << "[LV1 HYPERVISOR] Allocating LPAR ID " << lpar_id 
              << " with " << (xdr_size_bytes / (1024 * 1024)) << " MB Rambus XDR memory.\\n";
    return true;
}

bool Lv1Hypervisor::ConfigureSpeIsolation(uint32_t spe_index, bool isolated_mode) {
    if (spe_index >= 8) return false;
    spe_isolation_mask_[spe_index] = isolated_mode;
    std::cout << "[LV1 HYPERVISOR] SPU " << spe_index 
              << (isolated_mode ? " isolated" : " unmasked for GameOS") << ".\\n";
    return true;
}

uint64_t Lv1Hypervisor::CallHypervisorSyscall(uint32_t syscall_num, uint64_t arg0, uint64_t arg1) {
    // Hypervisor dispatch
    return 0; // Success
}

// ----------------------------------------------------------------------------
// LV2 GameOS Microkernel Implementation
// ----------------------------------------------------------------------------

Lv2GameOsKernel::Lv2GameOsKernel()
    : hypervisor_(nullptr),
      current_process_id_(1001),
      total_allocated_xdr_bytes_(0) {}

void Lv2GameOsKernel::InitializeKernel(Lv1Hypervisor* hypervisor) {
    hypervisor_ = hypervisor;
    std::cout << "[LV2 GAMEOS] Initializing Sony PlayStation 3 GameOS Kernel (FW 4.88)...\\n";
    std::cout << "  -> Virtual File System mounted: /dev_flash, /dev_hdd0, /dev_bdvd\\n";
    std::cout << "  -> VSH (Virtual Shell) & XMB subsystems standing by.\\n";
    std::cout << "  -> SPU Thread Scheduler initialized for 6 available worker SPEs.\\n";
}

int32_t Lv2GameOsKernel::sys_process_create(const std::string& self_path, uint32_t& process_id) {
    std::cout << "[LV2 GAMEOS] sys_process_create: Loading signed encrypted ELF (" 
              << self_path << ")...\\n";
    process_id = current_process_id_++;
    std::cout << "  -> Process ID assigned: " << process_id << "\\n";
    return CELL_OK;
}

int32_t Lv2GameOsKernel::sys_ppu_thread_create(
    uint64_t& thread_id, 
    const std::string& name, 
    uint64_t entry_point, 
    uint32_t prio, 
    size_t stack_size
) {
    thread_id = 0x1000 + ppu_threads_.size();
    PpuThreadContext ctx;
    ctx.thread_id = thread_id;
    ctx.name = name;
    ctx.priority = prio;
    ctx.entry_point = entry_point;
    ctx.stack_base = 0xD0000000 + (ppu_threads_.size() * 0x40000);
    ctx.stack_size = stack_size;
    ctx.is_running = true;

    ppu_threads_.push_back(ctx);

    std::cout << "[LV2 GAMEOS] sys_ppu_thread_create: Spawned PPE Thread '" << name 
              << "' [TID: 0x" << std::hex << thread_id << std::dec << ", Prio: " << prio << "]\\n";
    return CELL_OK;
}

int32_t Lv2GameOsKernel::sys_spu_thread_group_create(
    uint32_t& group_id, 
    const SysSpuThreadGroupAttribute& attr
) {
    group_id = static_cast<uint32_t>(spu_groups_.size() + 1);
    spu_groups_.push_back(attr);

    std::cout << "[LV2 GAMEOS] sys_spu_thread_group_create: Group '" << attr.name 
              << "' created with " << attr.n_threads << " SPU worker threads.\\n";
    return CELL_OK;
}

int32_t Lv2GameOsKernel::sys_spu_thread_group_start(uint32_t group_id) {
    if (group_id == 0 || group_id > spu_groups_.size()) return CELL_EINVAL;
    std::cout << "[LV2 GAMEOS] sys_spu_thread_group_start: Dispatched SPU Thread Group ID " 
              << group_id << " to hardware SPE cores.\\n";
    return CELL_OK;
}

int32_t Lv2GameOsKernel::sys_memory_allocate(size_t size, uint32_t flags, uint64_t& alloc_addr) {
    alloc_addr = 0x20000000 + total_allocated_xdr_bytes_;
    total_allocated_xdr_bytes_ += size;
    std::cout << "[LV2 GAMEOS] sys_memory_allocate: Allocated " << (size / 1024) 
              << " KB in Rambus XDR DRAM @ 0x" << std::hex << alloc_addr << std::dec << "\\n";
    return CELL_OK;
}

void Lv2GameOsKernel::DispatchSchedulerTick() {
    // SPU & PPU preemptive scheduler
}

void Lv2GameOsKernel::DumpKernelDiagnostics() const {
    std::cout << "\\n--- [PS3 CellOS Kernel Diagnostics] ---\\n";
    std::cout << "Active PPU Threads: " << ppu_threads_.size() << "\\n";
    std::cout << "Active SPU Groups:  " << spu_groups_.size() << "\\n";
    std::cout << "Allocated XDR RAM:  " << (total_allocated_xdr_bytes_ / (1024 * 1024)) << " MB / 212 MB Available\\n";
    std::cout << "OS Kernel Status:   Running (LV1 & LV2 Operational)\\n";
}

} // namespace cellos
`
  },

  // --------------------------------------------------------------------------
  // 2. PlayStation 4: Orbis OS (FreeBSD 9.0 Based Kernel & libkernel)
  // --------------------------------------------------------------------------
  {
    id: 'ps4-orbis-kernel-h',
    name: 'orbis_os_kernel.h',
    path: 'ps4/os/include/orbis_os_kernel.h',
    category: 'ps4',
    platform: 'ps4',
    language: 'header',
    description: 'PlayStation 4 Orbis OS - FreeBSD 9.0 Derived Kernel & System Services Architecture',
    content: `/**
 * Sony PlayStation 4 - Orbis OS Kernel Architecture
 * Based on FreeBSD 9.0 (UNIX POSIX) with proprietary Sony extensions
 *
 * Subsystems:
 *  - Mach-style microkernel concepts on top of FreeBSD kernel
 *  - SceSysCore: System core daemon managing background services & dashboard
 *  - libkernel: C runtime providing POSIX APIs & SCE custom syscalls
 *  - sceKernelAllocateDirectMemory: hUMA unified GDDR5 memory manager
 *  - Gnm/Gnmx: Hardware-direct GPU command buffer submissions
 *  - SELF (Signed Executable and Linkable Format) loader & dynamic linker
 */

#ifndef PS4_ORBIS_OS_KERNEL_H_
#define PS4_ORBIS_OS_KERNEL_H_

#include <cstdint>
#include <cstddef>
#include <string>
#include <vector>
#include <memory>

namespace orbis {

constexpr size_t ORBIS_GDDR5_TOTAL_SIZE = 8ULL * 1024 * 1024 * 1024; // 8 GB
constexpr size_t ORBIS_GAME_MEMORY_BUDGET = 5ULL * 1024 * 1024 * 1024; // 5 GB for Games, 3 GB for Orbis OS

enum OrbisMemoryType {
    ORBIS_MEMORY_TYPE_WB_ONION = 0,  // Cache coherent CPU/GPU memory
    ORBIS_MEMORY_TYPE_WC_GARLIC = 1   // Uncached write-combined high bandwidth GPU memory
};

struct OrbisProcess {
    uint32_t pid;
    std::string title_id; // e.g. "CUSA00123"
    std::string executable_name;
    uint64_t direct_mem_allocated;
    bool is_suspended;
};

class OrbisKernel {
public:
    OrbisKernel();
    ~OrbisKernel() = default;

    void BootOrbisKernel();

    // Orbis OS System Calls
    int32_t sceKernelLoadStartModule(const std::string& module_name, uint32_t& module_handle);
    int32_t sceKernelAllocateDirectMemory(size_t size, OrbisMemoryType type, uint64_t& physical_addr);
    int32_t sceKernelMapDirectMemory(uint64_t physical_addr, size_t size, uint64_t& virtual_addr);
    int32_t sceKernelCreateThread(const std::string& name, void* entry_point, int32_t prio, size_t stack_size);

    void LaunchTitle(const std::string& title_id, const std::string& title_name);
    void SuspendTitle();
    void ResumeTitle();

    void PrintTelemetry() const;

private:
    bool kernel_initialized_;
    uint64_t gddr5_memory_used_;
    std::vector<OrbisProcess> processes_;
    uint32_t active_threads_count_;
};

} // namespace orbis

#endif // PS4_ORBIS_OS_KERNEL_H_
`
  },
  {
    id: 'ps4-orbis-kernel-cpp',
    name: 'orbis_os_kernel.cpp',
    path: 'ps4/os/src/orbis_os_kernel.cpp',
    category: 'ps4',
    platform: 'ps4',
    language: 'cpp',
    description: 'PlayStation 4 Orbis OS - Kernel Implementation & hUMA Memory Allocation',
    content: `/**
 * Sony PlayStation 4 - Orbis OS Kernel Implementation
 * Copyright (c) Sony Interactive Entertainment
 */

#include "orbis_os_kernel.h"
#include <iostream>
#include <iomanip>

namespace orbis {

OrbisKernel::OrbisKernel()
    : kernel_initialized_(false),
      gddr5_memory_used_(0),
      active_threads_count_(0) {}

void OrbisKernel::BootOrbisKernel() {
    std::cout << "[ORBIS OS] Booting PlayStation 4 Orbis OS Kernel (FreeBSD 9.0-RELEASE)...\\n";
    std::cout << "  -> Initializing 8-Core AMD Jaguar hardware thread scheduler (6 Game + 2 OS Cores).\\n";
    std::cout << "  -> Initializing hUMA (heterogeneous Unified Memory Architecture) Page Tables.\\n";
    std::cout << "  -> Initializing SceSysCore daemon & PlayGo background streaming engine.\\n";
    kernel_initialized_ = true;
}

int32_t OrbisKernel::sceKernelLoadStartModule(const std::string& module_name, uint32_t& module_handle) {
    std::cout << "[ORBIS OS] sceKernelLoadStartModule: Decrypting & linking dynamic PRX '" 
              << module_name << "'...\\n";
    module_handle = 0x200 + static_cast<uint32_t>(processes_.size());
    return 0; // Success
}

int32_t OrbisKernel::sceKernelAllocateDirectMemory(size_t size, OrbisMemoryType type, uint64_t& physical_addr) {
    physical_addr = 0x80000000 + gddr5_memory_used_;
    gddr5_memory_used_ += size;

    const char* type_str = (type == ORBIS_MEMORY_TYPE_WB_ONION) ? "WB_ONION (CPU Coherent)" : "WC_GARLIC (GPU Uncached)";
    std::cout << "[ORBIS OS] sceKernelAllocateDirectMemory: Allocated " << (size / (1024 * 1024))
              << " MB [" << type_str << "] @ Phys 0x" << std::hex << physical_addr << std::dec << "\\n";
    return 0;
}

int32_t OrbisKernel::sceKernelMapDirectMemory(uint64_t physical_addr, size_t size, uint64_t& virtual_addr) {
    virtual_addr = physical_addr + 0xFFFF800000000000ULL;
    return 0;
}

int32_t OrbisKernel::sceKernelCreateThread(const std::string& name, void* entry_point, int32_t prio, size_t stack_size) {
    active_threads_count_++;
    std::cout << "[ORBIS OS] sceKernelCreateThread: Thread '" << name << "' created with priority " 
              << prio << " on AMD Jaguar core affinity.\\n";
    return 0;
}

void OrbisKernel::LaunchTitle(const std::string& title_id, const std::string& title_name) {
    OrbisProcess proc;
    proc.pid = 101;
    proc.title_id = title_id;
    proc.executable_name = title_name + " (eboot.bin)";
    proc.direct_mem_allocated = 4ULL * 1024 * 1024 * 1024; // 4 GB initially
    proc.is_suspended = false;

    processes_.push_back(proc);
    gddr5_memory_used_ += proc.direct_mem_allocated;

    std::cout << "[ORBIS OS] Launching Title: " << title_name << " [" << title_id << "]\\n";
    std::cout << "  -> Memory Budget: 5 GB GDDR5 reserved for game, 3 GB reserved for Orbis OS shell.\\n";
}

void OrbisKernel::SuspendTitle() {
    if (!processes_.empty()) {
        processes_.back().is_suspended = true;
        std::cout << "[ORBIS OS] Title suspended. Context preserved in GDDR5 standby for instant resume.\\n";
    }
}

void OrbisKernel::ResumeTitle() {
    if (!processes_.empty()) {
        processes_.back().is_suspended = false;
        std::cout << "[ORBIS OS] Title resumed immediately from standby mode.\\n";
    }
}

void OrbisKernel::PrintTelemetry() const {
    std::cout << "\\n--- [PS4 Orbis OS Telemetry] ---\\n";
    std::cout << "Kernel Status:       " << (kernel_initialized_ ? "ACTIVE (FreeBSD 9.0 Orbis)" : "STOPPED") << "\\n";
    std::cout << "Active Processes:    " << processes_.size() << "\\n";
    std::cout << "Active POSIX Threads:" << active_threads_count_ << "\\n";
    std::cout << "GDDR5 Memory Used:   " << (gddr5_memory_used_ / (1024 * 1024)) << " MB / 8192 MB\\n";
}

} // namespace orbis
`
  },

  // --------------------------------------------------------------------------
  // 3. PlayStation 5: Prosperity OS (FreeBSD 11/12 + Tempest & Kraken I/O)
  // --------------------------------------------------------------------------
  {
    id: 'ps5-prosperity-kernel-h',
    name: 'prosperity_os_kernel.h',
    path: 'ps5/os/include/prosperity_os_kernel.h',
    category: 'ps5',
    platform: 'ps5',
    language: 'header',
    description: 'PlayStation 5 Prosperity OS - Modernized FreeBSD Kernel with NVMe Direct-to-GPU Storage',
    content: `/**
 * Sony PlayStation 5 - Prosperity OS Kernel Architecture
 * Based on FreeBSD 11/12 with Next-Gen Hardware Acceleration
 *
 * Core Capabilities:
 *  - Zen 2 Multi-Die Thread Scheduler with SMT & AMD SmartShift dynamic thermal boost
 *  - Custom NVMe DirectStorage DMA engine bypassing CPU for raw 5.5 GB/s asset feeds
 *  - Hardware Kraken Decompression Kernel Driver (8-9 GB/s throughput)
 *  - Tempest 3D Audio HRTF Server Subsystem
 *  - AGC (Advanced Graphics Core) Next-Gen Driver for RDNA 2
 *  - Fast Resume & Background Activity Cards integration
 */

#ifndef PS5_PROSPERITY_OS_KERNEL_H_
#define PS5_PROSPERITY_OS_KERNEL_H_

#include <cstdint>
#include <cstddef>
#include <string>
#include <vector>

namespace prosperity {

struct Ps5ActivityCard {
    std::string activity_id;
    std::string title;
    float completion_pct;
    bool is_playable;
};

class ProsperityOsKernel {
public:
    ProsperityOsKernel();
    ~ProsperityOsKernel() = default;

    void BootProsperityKernel();

    // High-Bandwidth Storage DMA System Call
    int32_t sceKernelDirectStorageRead(
        uint64_t nvme_offset, 
        uint64_t gddr6_vram_addr, 
        size_t bytes_to_stream, 
        bool hardware_kraken_decompress
    );

    // Zen 2 Thread Scheduling
    int32_t sceKernelCreateZen2Thread(const std::string& name, uint32_t core_affinity, uint32_t priority);

    // Activity Cards (Deep Linking to game levels)
    void RegisterActivityCard(const Ps5ActivityCard& card);
    void LaunchActivityDirect(const std::string& activity_id);

    void PrintTelemetry() const;

private:
    bool is_booted_;
    uint64_t total_nvme_bytes_streamed_;
    std::vector<Ps5ActivityCard> activity_cards_;
    uint32_t zen2_thread_count_;
};

} // namespace prosperity

#endif // PS5_PROSPERITY_OS_KERNEL_H_
`
  },
  {
    id: 'ps5-prosperity-kernel-cpp',
    name: 'prosperity_os_kernel.cpp',
    path: 'ps5/os/src/prosperity_os_kernel.cpp',
    category: 'ps5',
    platform: 'ps5',
    language: 'cpp',
    description: 'PlayStation 5 Prosperity OS - Kernel Implementation & Fast Storage Dispatch',
    content: `/**
 * Sony PlayStation 5 - Prosperity OS Kernel Implementation
 * Copyright (c) Sony Interactive Entertainment
 */

#include "prosperity_os_kernel.h"
#include <iostream>
#include <iomanip>

namespace prosperity {

ProsperityOsKernel::ProsperityOsKernel()
    : is_booted_(false),
      total_nvme_bytes_streamed_(0),
      zen2_thread_count_(0) {}

void ProsperityOsKernel::BootProsperityKernel() {
    std::cout << "[PROSPERITY OS] Booting PlayStation 5 Operating System (FreeBSD 11-Custom)...\\n";
    std::cout << "  -> AMD Zen 2 CPU 8-Core/16-Thread Scheduler Online with SmartShift boost.\\n";
    std::cout << "  -> 12-Channel PCIe 4.0 NVMe SSD Storage Stack & Hardware Kraken engine online.\\n";
    std::cout << "  -> Tempest 3D Audio HRTF server daemon active.\\n";
    std::cout << "  -> Control Center & Universal Activity Cards subsystem initialized.\\n";
    is_booted_ = true;
}

int32_t ProsperityOsKernel::sceKernelDirectStorageRead(
    uint64_t nvme_offset, 
    uint64_t gddr6_vram_addr, 
    size_t bytes_to_stream, 
    bool hardware_kraken_decompress
) {
    total_nvme_bytes_streamed_ += bytes_to_stream;
    std::cout << "[PROSPERITY OS] sceKernelDirectStorageRead: Streaming " 
              << (bytes_to_stream / (1024 * 1024)) << " MB directly to GDDR6 VRAM @ 0x" 
              << std::hex << gddr6_vram_addr << std::dec;
    if (hardware_kraken_decompress) {
        std::cout << " [Kraken Hardware Decompression: Active (8.9 GB/s peak)]";
    }
    std::cout << "\\n";
    return 0; // Success
}

int32_t ProsperityOsKernel::sceKernelCreateZen2Thread(const std::string& name, uint32_t core_affinity, uint32_t priority) {
    zen2_thread_count_++;
    std::cout << "[PROSPERITY OS] Spawned Zen 2 Worker Thread '" << name 
              << "' on Core " << core_affinity << " [SMT Thread, Priority " << priority << "]\\n";
    return 0;
}

void ProsperityOsKernel::RegisterActivityCard(const Ps5ActivityCard& card) {
    activity_cards_.push_back(card);
    std::cout << "[PROSPERITY OS] Activity Card Registered: '" << card.title 
              << "' (" << card.activity_id << ")\\n";
}

void ProsperityOsKernel::LaunchActivityDirect(const std::string& activity_id) {
    std::cout << "[PROSPERITY OS] Instant Deep Linking into Activity: " << activity_id << "...\\n";
    std::cout << "  -> Game state fast-loaded in 2.1 seconds without splash or loading screen!\\n";
}

void ProsperityOsKernel::PrintTelemetry() const {
    std::cout << "\\n--- [PS5 Prosperity OS Telemetry] ---\\n";
    std::cout << "Kernel Status:         " << (is_booted_ ? "RUNNING (Prosperity FW 8.00)" : "OFFLINE") << "\\n";
    std::cout << "Active Zen 2 Threads:  " << zen2_thread_count_ << "\\n";
    std::cout << "NVMe Direct Streamed:  " << (total_nvme_bytes_streamed_ / (1024 * 1024)) << " MB\\n";
    std::cout << "Registered Cards:      " << activity_cards_.size() << "\\n";
}

} // namespace prosperity
`
  },

  // --------------------------------------------------------------------------
  // 4. Microsoft Xbox 360: Xbox OS (Windows NT-Derived Monolithic Kernel)
  // --------------------------------------------------------------------------
  {
    id: 'xbox360-os-kernel-h',
    name: 'xbox360_kernel.h',
    path: 'xbox360/os/include/xbox360_kernel.h',
    category: 'xbox360',
    platform: 'xbox360',
    language: 'header',
    description: 'Microsoft Xbox 360 OS - Custom Windows NT Monolithic Kernel & XAM System Services',
    content: `/**
 * Microsoft Xbox 360 OS Kernel Specification
 * Copyright (c) Microsoft Corporation
 *
 * Architecture:
 *  - Monolithic single-address-space kernel based on Windows NT 5.x / 2000
 *  - Runs in Kernel Privilege Mode on all 6 Xenon hardware threads
 *  - XEX (Xbox Executable) signed & encrypted loader
 *  - XAM (Xbox Auxiliary Messages): In-game Guide, Achievements, Xbox Live multiplayer
 *  - Title Memory Partition: 480 MB for game titles, 32 MB for Xbox Dashboard / Guide
 */

#ifndef XBOX360_KERNEL_H_
#define XBOX360_KERNEL_H_

#include <cstdint>
#include <cstddef>
#include <string>
#include <vector>

namespace xbox360_os {

struct XexHeader {
    char magic[4];         // "XEX2"
    uint32_t module_flags;
    uint32_t certificate_offset;
    uint32_t entry_point;
};

class Xbox360Kernel {
public:
    Xbox360Kernel();
    ~Xbox360Kernel() = default;

    void BootKernel();

    // NT Executive Functions
    int32_t KeCreateThread(const std::string& name, uint32_t thread_proc, uint32_t processor_mask);
    int32_t XexLoadImage(const std::string& xex_path, XexHeader& out_header);
    
    // Xbox Auxiliary Messages (XAM) Subsystem
    void XamShowGuideUI();
    void XamAwardAchievement(uint32_t user_index, uint32_t achievement_id, const std::string& name, uint32_t gamerscore);

    void PrintTelemetry() const;

private:
    bool is_kernel_booted_;
    uint32_t active_nt_threads_;
    uint32_t total_gamerscore_awarded_;
};

} // namespace xbox360_os

#endif // XBOX360_KERNEL_H_
`
  },
  {
    id: 'xbox360-os-kernel-cpp',
    name: 'xbox360_kernel.cpp',
    path: 'xbox360/os/src/xbox360_kernel.cpp',
    category: 'xbox360',
    platform: 'xbox360',
    language: 'cpp',
    description: 'Microsoft Xbox 360 OS - Windows NT Kernel Implementation & In-Game Guide UI',
    content: `/**
 * Microsoft Xbox 360 OS Kernel Implementation
 * Copyright (c) Microsoft Corporation
 */

#include "xbox360_kernel.h"
#include <iostream>
#include <iomanip>

namespace xbox360_os {

Xbox360Kernel::Xbox360Kernel()
    : is_kernel_booted_(false),
      active_nt_threads_(0),
      total_gamerscore_awarded_(0) {}

void Xbox360Kernel::BootKernel() {
    std::cout << "[XBOX 360 KERNEL] Initializing Microsoft Xbox 360 OS (NT 5.2.17559 Kernel)...\\n";
    std::cout << "  -> Xenon SMP Thread Dispatcher online: 3 Cores, 6 Hardware SMT Threads.\\n";
    std::cout << "  -> Allocating 480 MB UMA Title Partition + 32 MB System Guide Partition.\\n";
    std::cout << "  -> Initializing XAM (Xbox Auxiliary Messages) & Xbox Live Network Stack.\\n";
    is_kernel_booted_ = true;
}

int32_t Xbox360Kernel::KeCreateThread(const std::string& name, uint32_t thread_proc, uint32_t processor_mask) {
    active_nt_threads_++;
    std::cout << "[XBOX 360 KERNEL] KeCreateThread: Thread '" << name 
              << "' scheduled on Xenon Core Mask 0x" << std::hex << processor_mask << std::dec << "\\n";
    return 0; // STATUS_SUCCESS
}

int32_t Xbox360Kernel::XexLoadImage(const std::string& xex_path, XexHeader& out_header) {
    out_header.magic[0] = 'X';
    out_header.magic[1] = 'E';
    out_header.magic[2] = 'X';
    out_header.magic[3] = '2';
    out_header.module_flags = 0x00000001;
    out_header.entry_point = 0x82000000;

    std::cout << "[XBOX 360 KERNEL] XexLoadImage: Successfully authenticated and decrypted '" 
              << xex_path << "' (Entry Point: 0x82000000)\\n";
    return 0;
}

void Xbox360Kernel::XamShowGuideUI() {
    std::cout << "[XBOX 360 XAM] Opening Xbox Guide Mini-Dashboard Overlay (XAM.XEX)...\\n";
    std::cout << "  -> Friends List, Messages, Media Player, and Party Chat loaded in 32 MB partition.\\n";
}

void Xbox360Kernel::XamAwardAchievement(uint32_t user_index, uint32_t achievement_id, const std::string& name, uint32_t gamerscore) {
    total_gamerscore_awarded_ += gamerscore;
    std::cout << "[XBOX 360 XAM] ACHIEVEMENT UNLOCKED! \\" " << name << "\\" (" 
              << gamerscore << " G) for Player " << user_index << "\\n";
}

void Xbox360Kernel::PrintTelemetry() const {
    std::cout << "\\n--- [Xbox 360 OS Kernel Diagnostics] ---\\n";
    std::cout << "Kernel Status:       " << (is_kernel_booted_ ? "ACTIVE (NT Monolithic)" : "STOPPED") << "\\n";
    std::cout << "Active NT Threads:   " << active_nt_threads_ << "\\n";
    std::cout << "Total Gamerscore:    " << total_gamerscore_awarded_ << " G\\n";
}

} // namespace xbox360_os
`
  },

  // --------------------------------------------------------------------------
  // 5. Microsoft Xbox One: Tri-OS Architecture (Hyper-V, ERA Game OS, Shared OS)
  // --------------------------------------------------------------------------
  {
    id: 'xboxone-tri-os-h',
    name: 'xboxone_tri_os.h',
    path: 'xboxone/os/include/xboxone_tri_os.h',
    category: 'xboxone',
    platform: 'xboxone',
    language: 'header',
    description: 'Microsoft Xbox One Tri-OS Architecture - Hyper-V Hypervisor, ERA Game OS, and Shared OS',
    content: `/**
 * Microsoft Xbox One Tri-OS Virtualized Operating System Architecture
 * Copyright (c) Microsoft Corporation
 *
 * Architecture:
 *  1. Host OS: Hardened Hyper-V Type-1 Hypervisor managing hardware silicon
 *  2. "ERA" (Exclusive Resource Allocation) Game OS: Fast, bare-metal VM running games
 *     - Guaranteed 7 Jaguar CPU cores, 5 GB DDR3 + 32 MB eSRAM direct access
 *  3. Shared OS: Windows 10 UWP Virtual Machine running apps, Kinect, snapped views, and UI
 *     - 1 Jaguar CPU core, 3 GB DDR3
 *  - Fast switching between gaming and TV/apps without terminating the game state!
 */

#ifndef XBOXONE_TRI_OS_H_
#define XBOXONE_TRI_OS_H_

#include <cstdint>
#include <string>

namespace xboxone_os {

enum VirtualMachineId {
    VM_HOST_HYPERVISOR = 0,
    VM_ERA_GAME_OS     = 1,
    VM_SHARED_APP_OS   = 2
};

class XboxOneTriOs {
public:
    XboxOneTriOs();
    ~XboxOneTriOs() = default;

    void BootTriOsEnvironment();

    // Hypervisor VM State Switching
    void SwitchActiveContext(VirtualMachineId target_vm);
    void SnapAppAlongsideGame(const std::string& app_name);

    void PrintTelemetry() const;

private:
    bool hypervisor_running_;
    VirtualMachineId active_vm_;
    bool is_app_snapped_;
    std::string snapped_app_name_;
};

} // namespace xboxone_os

#endif // XBOXONE_TRI_OS_H_
`
  },
  {
    id: 'xboxone-tri-os-cpp',
    name: 'xboxone_tri_os.cpp',
    path: 'xboxone/os/src/xboxone_tri_os.cpp',
    category: 'xboxone',
    platform: 'xboxone',
    language: 'cpp',
    description: 'Microsoft Xbox One Tri-OS - Hyper-V Partitioning & Instant VM Switching Implementation',
    content: `/**
 * Microsoft Xbox One Tri-OS Implementation
 * Copyright (c) Microsoft Corporation
 */

#include "xboxone_tri_os.h"
#include <iostream>

namespace xboxone_os {

XboxOneTriOs::XboxOneTriOs()
    : hypervisor_running_(false),
      active_vm_(VM_HOST_HYPERVISOR),
      is_app_snapped_(false) {}

void XboxOneTriOs::BootTriOsEnvironment() {
    std::cout << "[XBOX ONE TRI-OS] Booting Microsoft Hyper-V Type-1 Hypervisor...\\n";
    std::cout << "  -> Partition 1: Era Game OS provisioned with 7 Cores, 5 GB DDR3, 32 MB eSRAM.\\n";
    std::cout << "  -> Partition 2: Shared Windows 10 OS provisioned with 1 Core, 3 GB DDR3.\\n";
    hypervisor_running_ = true;
    active_vm_ = VM_ERA_GAME_OS;
    std::cout << "  -> Era Game OS initialized and ready for title execution.\\n";
}

void XboxOneTriOs::SwitchActiveContext(VirtualMachineId target_vm) {
    active_vm_ = target_vm;
    const char* vm_name = (target_vm == VM_ERA_GAME_OS) ? "Era Exclusive Game OS" : "Shared Windows App OS";
    std::cout << "[XBOX ONE TRI-OS] Seamless context switch to " << vm_name 
              << " without interrupting running game background state.\\n";
}

void XboxOneTriOs::SnapAppAlongsideGame(const std::string& app_name) {
    is_app_snapped_ = true;
    snapped_app_name_ = app_name;
    std::cout << "[XBOX ONE TRI-OS] Snapping App '" << app_name 
              << "' on right 25% column while Era Game OS renders in 75% main window.\\n";
}

void XboxOneTriOs::PrintTelemetry() const {
    std::cout << "\\n--- [Xbox One Tri-OS Telemetry] ---\\n";
    std::cout << "Hyper-V Hypervisor:  " << (hypervisor_running_ ? "ACTIVE" : "OFFLINE") << "\\n";
    std::cout << "Active VM Partition: " << (active_vm_ == VM_ERA_GAME_OS ? "Era Game OS" : "Shared App OS") << "\\n";
    std::cout << "Snap Mode:           " << (is_app_snapped_ ? ("Snapped: " + snapped_app_name_) : "Disabled") << "\\n";
}

} // namespace xboxone_os
`
  },

  // --------------------------------------------------------------------------
  // 6. Nintendo Switch: Horizon OS (Mesosphere Microkernel & IPC Sysmodules)
  // --------------------------------------------------------------------------
  {
    id: 'switch-horizon-microkernel-h',
    name: 'horizon_microkernel.h',
    path: 'switch/os/include/horizon_microkernel.h',
    category: 'switch',
    platform: 'switch',
    language: 'header',
    description: 'Nintendo Switch Horizon OS - Mesosphere Microkernel & IPC System Service Modules',
    content: `/**
 * Nintendo Switch Horizon OS Specification
 * Copyright (c) Nintendo Co., Ltd.
 *
 * Architecture:
 *  - Microkernel design (evolution from 3DS kernel, known as Mesosphere in reverse engineering)
 *  - Pure Inter-Process Communication (IPC) via message ports and session handles
 *  - System Modules (Sysmodules):
 *      * sm: Service Manager (handles service registration & queries)
 *      * fs: File System (GameCard, SD Card, RomFS, SaveData)
 *      * vi / nv: Video Interface & NVIDIA Tegra graphics driver bridge (NVN API)
 *      * nifm: Network Interface Management
 *      * hid: Human Interface Device (Joy-Con pairing, HD Rumble, IR Motion)
 */

#ifndef SWITCH_HORIZON_MICROKERNEL_H_
#define SWITCH_HORIZON_MICROKERNEL_H_

#include <cstdint>
#include <string>
#include <vector>
#include <unordered_map>

namespace switch_os {

using ServiceHandle = uint32_t;

enum class JoyConStatus {
    ATTACHED,
    WIRELESS_TABLETOP,
    DISCONNECTED
};

class HorizonMicrokernel {
public:
    HorizonMicrokernel();
    ~HorizonMicrokernel() = default;

    void BootMicrokernel();

    // Service Manager (sm:)
    int32_t SmRegisterService(const std::string& name, ServiceHandle handle);
    int32_t SmGetServiceHandle(const std::string& name, ServiceHandle& out_handle);

    // Hardware Interface Daemon (hid:)
    void SetJoyConStatus(int controller_id, JoyConStatus status);
    void TriggerHdRumble(int controller_id, float low_freq, float high_freq);

    void PrintTelemetry() const;

private:
    bool is_mesosphere_active_;
    std::unordered_map<std::string, ServiceHandle> registered_services_;
    JoyConStatus left_joycon_;
    JoyConStatus right_joycon_;
};

} // namespace switch_os

#endif // SWITCH_HORIZON_MICROKERNEL_H_
`
  },
  {
    id: 'switch-horizon-microkernel-cpp',
    name: 'horizon_microkernel.cpp',
    path: 'switch/os/src/horizon_microkernel.cpp',
    category: 'switch',
    platform: 'switch',
    language: 'cpp',
    description: 'Nintendo Switch Horizon OS - Microkernel IPC & Sysmodule Registration Implementation',
    content: `/**
 * Nintendo Switch Horizon OS Implementation
 * Copyright (c) Nintendo Co., Ltd.
 */

#include "horizon_microkernel.h"
#include <iostream>

namespace switch_os {

HorizonMicrokernel::HorizonMicrokernel()
    : is_mesosphere_active_(false),
      left_joycon_(JoyConStatus::ATTACHED),
      right_joycon_(JoyConStatus::ATTACHED) {}

void HorizonMicrokernel::BootMicrokernel() {
    std::cout << "[HORIZON OS] Booting Nintendo Switch Microkernel (ARM64 Kernel)...\\n";
    std::cout << "  -> Initializing Inter-Process Communication (IPC) Session Subsystem.\\n";
    is_mesosphere_active_ = true;

    // Register primary sysmodules
    SmRegisterService("sm:", 0x10);
    SmRegisterService("fspr", 0x11);
    SmRegisterService("vi:u", 0x12);
    SmRegisterService("nvdrv:a", 0x13);
    SmRegisterService("hid", 0x14);
    SmRegisterService("nifm:u", 0x15);
    std::cout << "  -> Horizon System Modules (Sysmodules) loaded and listening on IPC ports.\\n";
}

int32_t HorizonMicrokernel::SmRegisterService(const std::string& name, ServiceHandle handle) {
    registered_services_[name] = handle;
    return 0; // Success
}

int32_t HorizonMicrokernel::SmGetServiceHandle(const std::string& name, ServiceHandle& out_handle) {
    auto it = registered_services_.find(name);
    if (it != registered_services_.end()) {
        out_handle = it->second;
        return 0;
    }
    return -1; // Not found
}

void HorizonMicrokernel::SetJoyConStatus(int controller_id, JoyConStatus status) {
    if (controller_id == 0) left_joycon_ = status;
    else right_joycon_ = status;
    std::cout << "[HORIZON OS] Joy-Con " << (controller_id == 0 ? "Left" : "Right") 
              << " state changed.\\n";
}

void HorizonMicrokernel::TriggerHdRumble(int controller_id, float low_freq, float high_freq) {
    std::cout << "[HORIZON OS] Sent HD Rumble haptic packet to Joy-Con " << controller_id 
              << " (Low: " << low_freq << " Hz, High: " << high_freq << " Hz)\\n";
}

void HorizonMicrokernel::PrintTelemetry() const {
    std::cout << "\\n--- [Nintendo Switch Horizon OS Diagnostics] ---\\n";
    std::cout << "Microkernel Status:   " << (is_mesosphere_active_ ? "RUNNING" : "OFFLINE") << "\\n";
    std::cout << "Registered Services:  " << registered_services_.size() << " Sysmodules\\n";
    std::cout << "Joy-Con Configuration: " 
              << (left_joycon_ == JoyConStatus::ATTACHED ? "Attached (Handheld)" : "Wireless") << "\\n";
}

} // namespace switch_os
`
  },

  // --------------------------------------------------------------------------
  // 7. PlayStation 2: Emotion Engine Kernel & IOP Modular OS (IRX & SIF RPC)
  // --------------------------------------------------------------------------
  {
    id: 'ps2-ee-iop-kernel-h',
    name: 'ps2_ee_iop_os.h',
    path: 'ps2/os/include/ps2_ee_iop_os.h',
    category: 'ps2',
    platform: 'ps2',
    language: 'header',
    description: 'PlayStation 2 Dual-Core OS - Emotion Engine Kernel & IOP (I/O Processor) IRX Modular Architecture',
    content: `/**
 * Sony PlayStation 2 - Dual-Core Operating System Specification
 * Copyright (c) Sony Computer Entertainment Inc.
 *
 * Architecture:
 *  1. EE Kernel (Emotion Engine 128-bit MIPS R5900):
 *     - Minimalist real-time microkernel handling threads, semaphores, and interrupts
 *     - OSDSYS (Original System Display / Browser & Memory Card screen)
 *  2. IOP Kernel (I/O Processor MIPS R3000):
 *     - Modular real-time OS executing loadable relocatable driver modules (.IRX)
 *     - Controls CDVD drive, SPU2 sound, Memory Card, and controller inputs
 *  3. SIF (Subsystem Interface):
 *     - High-speed bidirectional DMA RPC bus bridging EE and IOP
 */

#ifndef PS2_EE_IOP_OS_H_
#define PS2_EE_IOP_OS_H_

#include <cstdint>
#include <string>
#include <vector>

namespace ps2_os {

struct IrxModule {
    std::string name;
    uint32_t version;
    size_t size_bytes;
    bool is_loaded;
};

class Ps2DualKernelSystem {
public:
    Ps2DualKernelSystem();
    ~Ps2DualKernelSystem() = default;

    void BootSystem();

    // SIF RPC bridge between EE and IOP
    int32_t SifLoadModule(const std::string& irx_name);
    int32_t SifCallRpc(uint32_t rpc_channel, void* send_data, size_t send_size);

    // EE Threading
    int32_t CreateEeThread(const std::string& name, uint32_t entry_point, int32_t priority);

    void PrintTelemetry() const;

private:
    bool ee_kernel_running_;
    bool iop_kernel_running_;
    std::vector<IrxModule> loaded_irx_modules_;
};

} // namespace ps2_os

#endif // PS2_EE_IOP_OS_H_
`
  },
  {
    id: 'ps2-ee-iop-kernel-cpp',
    name: 'ps2_ee_iop_os.cpp',
    path: 'ps2/os/src/ps2_ee_iop_os.cpp',
    category: 'ps2',
    platform: 'ps2',
    language: 'cpp',
    description: 'PlayStation 2 Dual-Core OS - SIF RPC & IOP IRX Module Loader Implementation',
    content: `/**
 * Sony PlayStation 2 - Dual-Core OS Implementation
 * Copyright (c) Sony Computer Entertainment Inc.
 */

#include "ps2_ee_iop_os.h"
#include <iostream>

namespace ps2_os {

Ps2DualKernelSystem::Ps2DualKernelSystem()
    : ee_kernel_running_(false),
      iop_kernel_running_(false) {}

void Ps2DualKernelSystem::BootSystem() {
    std::cout << "[PS2 OS] Booting Sony PlayStation 2 Dual-Core Architecture...\\n";
    std::cout << "  -> EE Kernel (MIPS R5900 @ 294.9 MHz): OSDSYS Browser & Memory Card manager online.\\n";
    std::cout << "  -> IOP Kernel (MIPS R3000 @ 36.8 MHz): Real-time I/O Module Manager online.\\n";
    std::cout << "  -> SIF (Subsystem Interface) DMA bidirectional channel active.\\n";
    
    ee_kernel_running_ = true;
    iop_kernel_running_ = true;

    // Load standard Sony driver modules into IOP memory
    SifLoadModule("cdvd.irx");
    SifLoadModule("mcman.irx");
    SifLoadModule("padman.irx");
    SifLoadModule("freesd.irx");
}

int32_t Ps2DualKernelSystem::SifLoadModule(const std::string& irx_name) {
    IrxModule mod;
    mod.name = irx_name;
    mod.version = 0x0100;
    mod.size_bytes = 32 * 1024;
    mod.is_loaded = true;

    loaded_irx_modules_.push_back(mod);
    std::cout << "[PS2 SIF] SifLoadModule: Loaded '" << irx_name 
              << "' into IOP 2MB RAM via SIF DMA.\\n";
    return 0; // Success
}

int32_t Ps2DualKernelSystem::SifCallRpc(uint32_t rpc_channel, void* send_data, size_t send_size) {
    std::cout << "[PS2 SIF] Dispatched SIF RPC Call to IOP channel 0x" 
              << std::hex << rpc_channel << std::dec << " (" << send_size << " bytes)\\n";
    return 0;
}

int32_t Ps2DualKernelSystem::CreateEeThread(const std::string& name, uint32_t entry_point, int32_t priority) {
    std::cout << "[PS2 EE KERNEL] Spawned Emotion Engine thread '" << name 
              << "' [Prio: " << priority << "]\\n";
    return 0;
}

void Ps2DualKernelSystem::PrintTelemetry() const {
    std::cout << "\\n--- [PS2 EE & IOP Operating System Diagnostics] ---\\n";
    std::cout << "EE Kernel Status:   " << (ee_kernel_running_ ? "ACTIVE" : "OFFLINE") << "\\n";
    std::cout << "IOP Kernel Status:  " << (iop_kernel_running_ ? "ACTIVE" : "OFFLINE") << "\\n";
    std::cout << "Loaded IRX Modules: " << loaded_irx_modules_.size() << "\\n";
}

} // namespace ps2_os
`
  }
];
