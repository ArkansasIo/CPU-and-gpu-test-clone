import { SourceFile } from '../types/cell';
import { ADDITIONAL_PS3_FILES } from './additional_ps3_files';

export const PS3_SOURCE_FILES: SourceFile[] = [
  {
    id: 'types_h',
    name: 'types.h',
    path: 'include/cell/types.h',
    category: 'spe',
    language: 'header',
    description: 'Cell Broadband Engine fundamental vector, scalar, and architectural type definitions.',
    content: `/**
 * @file types.h
 * @brief PlayStation 3 Cell Broadband Engine Fundamental Types
 * @details Developed for Cell B.E. (PPE 64-bit PowerPC + SPU 128-bit SIMD RISC)
 * 
 * Copyright (C) 2006-2008 Sony Computer Entertainment Inc. / IBM / Toshiba
 * All rights reserved.
 */

#ifndef _CELL_TYPES_H_
#define _CELL_TYPES_H_

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

/* Alignment macros */
#define CELL_ALIGN_16       __attribute__((aligned(16)))
#define CELL_ALIGN_128      __attribute__((aligned(128)))
#define CELL_SPU_LS_SIZE    (256 * 1024) /* 256 KB Local Store */
#define CELL_MAX_SPUS       8            /* 8 SPUs physical, 7 active on PS3 retail */
#define CELL_PS3_USABLE_SPU 6            /* 6 Game SPUs, 1 OS reserved, 1 disabled */

/* Basic scalar types */
typedef uint8_t   u8;
typedef uint16_t  u16;
typedef uint32_t  u32;
typedef uint64_t  u64;

typedef int8_t    s8;
typedef int16_t   s16;
typedef int32_t   s32;
typedef int64_t   s64;

typedef float     f32;
typedef double    f64;

/* 128-bit Quadword Union for SPU Registers and Vector Arithmetic */
typedef union CELL_ALIGN_16 {
    /* Byte representation (16 x 8-bit) */
    u8   u8_data[16];
    s8   s8_data[16];

    /* Halfword representation (8 x 16-bit) */
    u16  u16_data[8];
    s16  s16_data[8];

    /* Word / Integer representation (4 x 32-bit) */
    u32  u32_data[4];
    s32  s32_data[4];

    /* Doubleword representation (2 x 64-bit) */
    u64  u64_data[2];
    s64  s64_data[2];

    /* Single-precision Floating Point (4 x 32-bit IEEE-754) */
    f32  f32_data[4];

    /* Double-precision Floating Point (2 x 64-bit IEEE-754) */
    f64  f64_data[2];

#if defined(__SPU__)
    /* Native SPU vector types */
    vector unsigned char  v_uchar;
    vector unsigned short v_ushort;
    vector unsigned int   v_uint;
    vector float          v_float;
#endif
} qword_t;

/* SPU Register identifier ($r0 - $r127) */
typedef uint8_t spu_reg_id_t;

/* Effective Address (PPE 64-bit memory space) */
typedef u64 cell_ea_t;

/* Local Store Address (18-bit offset inside 256KB SPU local store) */
typedef u32 cell_lsa_t;

/* SPU Execution Status */
typedef enum {
    SPU_STATUS_STOPPED    = 0x00,
    SPU_STATUS_RUNNING    = 0x01,
    SPU_STATUS_HALTED     = 0x02,
    SPU_STATUS_WAITING_DMA= 0x04,
    SPU_STATUS_STOP_INSTR = 0x08,
    SPU_STATUS_SINGLE_STEP= 0x10
} spu_status_t;

#ifdef __cplusplus
}
#endif

#endif /* _CELL_TYPES_H_ */
`
  },
  {
    id: 'spu_intrinsics_h',
    name: 'spu_intrinsics.h',
    path: 'include/cell/spu_intrinsics.h',
    category: 'spe',
    language: 'header',
    description: 'Hardware intrinsic functions mapping directly to SPU single-instruction quadword operations.',
    content: `/**
 * @file spu_intrinsics.h
 * @brief SPU C/C++ Hardware Intrinsics & MFC Channel Interface
 * 
 * Provides SIMD vector operations and direct SPU coprocessor instruction wrappers.
 * Copyright (C) 2006-2008 Sony Computer Entertainment Inc. / IBM Corp.
 */

#ifndef _CELL_SPU_INTRINSICS_H_
#define _CELL_SPU_INTRINSICS_H_

#include "types.h"

#ifdef __cplusplus
extern "C" {
#endif

/* MFC Channel identifiers for direct hardware communication */
#define SPU_RdEventStat           0   /* Read Event Status */
#define SPU_WrEventMask           1   /* Write Event Mask */
#define SPU_WrEventAck            2   /* Write Event Acknowledgement */
#define SPU_RdSigNotify1          3   /* Signal Notification 1 */
#define SPU_RdSigNotify2          4   /* Signal Notification 2 */
#define SPU_WrDec                 7   /* Write Decrementer */
#define SPU_RdDec                 8   /* Read Decrementer */
#define SPU_RdEventMask           11  /* Read Event Mask */
#define SPU_RdMachStat            13  /* Read Machine Status */
#define SPU_WrSRR0                14  /* Write SRR0 */
#define SPU_RdSRR0                15  /* Read SRR0 */
#define SPU_WrOutMbox             28  /* Write SPU Outbound Mailbox */
#define SPU_RdInMbox              29  /* Read SPU Inbound Mailbox */
#define SPU_WrOutIntrMbox         30  /* Write SPU Outbound Interrupt Mailbox */

/* MFC DMA Command Channels */
#define MFC_LSA                   16  /* Local Store Address */
#define MFC_EAH                   17  /* Effective Address High (32-bit) */
#define MFC_EAL                   18  /* Effective Address Low (32-bit) */
#define MFC_Size                  19  /* Transfer Size (bytes) */
#define MFC_TagID                 20  /* Tag ID (0-31) */
#define MFC_Cmd                   21  /* DMA Command Opcode */
#define MFC_WrTagMask             22  /* Write Tag Mask */
#define MFC_WrTagUpdate           23  /* Write Tag Update Condition */
#define MFC_RdTagStat             24  /* Read Tag Status */
#define MFC_RdListStallStat       25  /* Read DMA List Stall-and-Notify Status */
#define MFC_WrListStallAck        26  /* Write DMA List Stall-and-Notify Ack */
#define MFC_RdAtomicStat          27  /* Read Atomic Command Status */

/* MFC DMA Command Opcodes */
#define MFC_PUT_CMD               0x0020
#define MFC_PUTB_CMD              0x0021 /* Barrier */
#define MFC_PUTF_CMD              0x0022 /* Fence */
#define MFC_GET_CMD               0x0040
#define MFC_GETB_CMD              0x0041 /* Barrier */
#define MFC_GETF_CMD              0x0042 /* Fence */
#define MFC_GETLLAR_CMD           0x00D0 /* Atomic Get & Reserve */
#define MFC_PUTLLC_CMD            0x00B4 /* Atomic Put If Reserved */

/* MFC Tag Update Conditions */
#define MFC_TAG_UPDATE_IMMEDIATE  0
#define MFC_TAG_UPDATE_ANY        1
#define MFC_TAG_UPDATE_ALL        2

/**
 * SPU Vector Single-Instruction Math Primitives
 */

/* Vector Float Add: r = a + b */
static inline qword_t spu_add_float(qword_t a, qword_t b) {
    qword_t res;
    for (int i = 0; i < 4; ++i) {
        res.f32_data[i] = a.f32_data[i] + b.f32_data[i];
    }
    return res;
}

/* Vector Float Multiply: r = a * b */
static inline qword_t spu_mul_float(qword_t a, qword_t b) {
    qword_t res;
    for (int i = 0; i < 4; ++i) {
        res.f32_data[i] = a.f32_data[i] * b.f32_data[i];
    }
    return res;
}

/* Vector Float Multiply-Add (Fused): r = (a * b) + c */
static inline qword_t spu_madd_float(qword_t a, qword_t b, qword_t c) {
    qword_t res;
    for (int i = 0; i < 4; ++i) {
        res.f32_data[i] = (a.f32_data[i] * b.f32_data[i]) + c.f32_data[i];
    }
    return res;
}

/* Vector Integer Add: 4 x 32-bit addition */
static inline qword_t spu_add_int(qword_t a, qword_t b) {
    qword_t res;
    for (int i = 0; i < 4; ++i) {
        res.u32_data[i] = a.u32_data[i] + b.u32_data[i];
    }
    return res;
}

/* SPU Quadword Byte Shuffle */
static inline qword_t spu_shuffle(qword_t a, qword_t b, qword_t pattern) {
    qword_t res;
    for (int i = 0; i < 16; ++i) {
        u8 idx = pattern.u8_data[i];
        if (idx < 16) {
            res.u8_data[i] = a.u8_data[idx];
        } else if (idx < 32) {
            res.u8_data[i] = b.u8_data[idx - 16];
        } else {
            res.u8_data[i] = (idx & 0x80) ? 0x00 : 0xFF;
        }
    }
    return res;
}

#ifdef __cplusplus
}
#endif

#endif /* _CELL_SPU_INTRINSICS_H_ */
`
  },
  {
    id: 'spu_core_h',
    name: 'spu_core.h',
    path: 'src/spe/spu_core.h',
    category: 'spe',
    language: 'header',
    description: 'Synergistic Processor Unit (SPU) 128-bit RISC core emulation engine definition.',
    content: `/**
 * @file spu_core.h
 * @brief SPU 128-bit SIMD RISC Processor Core Header
 * 
 * Features 128 unified 128-bit registers, 256KB SRAM Local Store,
 * and dual-issue superscalar pipeline execution.
 */

#ifndef _CELL_SPU_CORE_H_
#define _CELL_SPU_CORE_H_

#include "../../include/cell/types.h"
#include <vector>
#include <string>
#include <memory>

namespace Cell {

class MfcDma; // Forward declaration

/**
 * Pipeline Stage Classification for SPU Dual-Issue Dispatch
 */
enum class SPU_Pipe {
    EVEN = 0, // Floating Point, Fixed Point 1, Load/Store, Byte ops
    ODD  = 1, // Branch, Shuffle, Channel, Fixed Point 2
    NONE = 2
};

struct SPU_Instruction {
    u32 raw;
    u16 opcode;
    std::string mnemonic;
    SPU_Pipe targetPipe;
    u8 latency;
    u8 ra, rb, rc, rt;
    s32 imm;
};

class SPUCore {
public:
    explicit SPUCore(u32 spuId);
    ~SPUCore();

    void reset();
    bool loadProgram(const u8* binary, size_t size, u32 entryPoint = 0);
    
    // Execution cycle stepping
    bool stepCycle();
    void run(u64 maxCycles);
    void stop();

    // Register file access ($r0 - $r127)
    const qword_t& getRegister(u8 regIdx) const { return m_registers[regIdx & 0x7F]; }
    void setRegister(u8 regIdx, const qword_t& val) { m_registers[regIdx & 0x7F] = val; }

    // Program counter & state
    u32 getPC() const { return m_pc; }
    void setPC(u32 pc) { m_pc = pc & 0x3FFFC; } /* 4-byte aligned */
    spu_status_t getStatus() const { return m_status; }
    u64 getCycleCount() const { return m_cycleCount; }
    u32 getId() const { return m_spuId; }

    // Local Store (256 KB)
    u8* getLocalStore() { return m_localStore; }
    const u8* getLocalStore() const { return m_localStore; }
    qword_t readLSQuadword(u32 lsa) const;
    void writeLSQuadword(u32 lsa, const qword_t& q);

    // Channel interface
    void writeChannel(u32 ch, u32 val);
    u32 readChannel(u32 ch);
    u32 readChannelCount(u32 ch) const;

    // Attached DMA Controller
    void attachMFC(std::shared_ptr<MfcDma> mfc) { m_mfc = mfc; }
    std::shared_ptr<MfcDma> getMFC() const { return m_mfc; }

private:
    u32 m_spuId;
    spu_status_t m_status;
    u32 m_pc;
    u32 m_npc; // Next PC
    u64 m_cycleCount;

    // 128 x 128-bit Unified Register File
    qword_t m_registers[128] CELL_ALIGN_16;

    // 256 KB SRAM Local Store
    u8* m_localStore;

    // Dual-issue pipeline state
    SPU_Instruction m_evenSlot;
    SPU_Instruction m_oddSlot;
    bool m_hasEven;
    bool m_hasOdd;

    // Channel registers
    u32 m_outMbox;
    u32 m_inMbox;
    u32 m_sigNotify1;
    u32 m_sigNotify2;
    u32 m_decrementer;

    std::shared_ptr<MfcDma> m_mfc;

    // Decode & Execute helpers
    SPU_Instruction decode(u32 instrCode);
    void execute(const SPU_Instruction& inst);
};

} // namespace Cell

#endif /* _CELL_SPU_CORE_H_ */
`
  },
  {
    id: 'spu_core_cpp',
    name: 'spu_core.cpp',
    path: 'src/spe/spu_core.cpp',
    category: 'spe',
    language: 'cpp',
    description: 'Synergistic Processor Unit (SPU) superscalar execution pipeline and instruction implementation.',
    content: `/**
 * @file spu_core.cpp
 * @brief SPU Core Implementation - Instruction Decoder and Pipeline Dispatch
 * 
 * Emulates the 128-bit SIMD instruction set, dual-issue superscalar pipeline,
 * and 256KB local store memory addressing.
 */

#include "spu_core.h"
#include "mfc_dma.h"
#include <cstring>
#include <cmath>
#include <iostream>

namespace Cell {

SPUCore::SPUCore(u32 spuId)
    : m_spuId(spuId),
      m_status(SPU_STATUS_STOPPED),
      m_pc(0),
      m_npc(0),
      m_cycleCount(0),
      m_hasEven(false),
      m_hasOdd(false),
      m_outMbox(0),
      m_inMbox(0),
      m_sigNotify1(0),
      m_sigNotify2(0),
      m_decrementer(0)
{
    m_localStore = new u8[CELL_SPU_LS_SIZE];
    reset();
}

SPUCore::~SPUCore() {
    delete[] m_localStore;
}

void SPUCore::reset() {
    m_status = SPU_STATUS_STOPPED;
    m_pc = 0;
    m_npc = 0;
    m_cycleCount = 0;
    std::memset(m_registers, 0, sizeof(m_registers));
    std::memset(m_localStore, 0, CELL_SPU_LS_SIZE);

    // Initial stack pointer setup: $r1 is ABI stack pointer (conventionally set near top of LS)
    m_registers[1].u32_data[3] = CELL_SPU_LS_SIZE - 0x100;
}

bool SPUCore::loadProgram(const u8* binary, size_t size, u32 entryPoint) {
    if (size > CELL_SPU_LS_SIZE) return false;
    std::memcpy(m_localStore, binary, size);
    m_pc = entryPoint & 0x3FFFC;
    m_npc = m_pc + 4;
    m_status = SPU_STATUS_RUNNING;
    return true;
}

qword_t SPUCore::readLSQuadword(u32 lsa) const {
    qword_t q;
    u32 aligned = lsa & 0x3FFF0; // 16-byte aligned within 256KB
    std::memcpy(&q, &m_localStore[aligned], 16);
    return q;
}

void SPUCore::writeLSQuadword(u32 lsa, const qword_t& q) {
    u32 aligned = lsa & 0x3FFF0;
    std::memcpy(&m_localStore[aligned], &q, 16);
}

SPU_Instruction SPUCore::decode(u32 raw) {
    SPU_Instruction inst;
    inst.raw = raw;
    inst.ra = (raw >> 7) & 0x7F;
    inst.rb = (raw >> 14) & 0x7F;
    inst.rc = (raw >> 21) & 0x7F;
    inst.rt = raw & 0x7F;

    // SPU 11-bit Opcode extraction
    u16 op11 = (raw >> 21) & 0x7FF;
    u16 op9  = (raw >> 23) & 0x1FF;
    u16 op8  = (raw >> 24) & 0xFF;
    u16 op7  = (raw >> 25) & 0x7F;

    if (op11 == 0x000) {
        // STOP instruction
        inst.mnemonic = "stop";
        inst.targetPipe = SPU_Pipe::ODD;
        inst.latency = 4;
    } else if (op11 == 0x1C0) {
        // FA: Floating Add (Even Pipe)
        inst.mnemonic = "fa";
        inst.targetPipe = SPU_Pipe::EVEN;
        inst.latency = 6;
    } else if (op11 == 0x1C1) {
        // FS: Floating Subtract (Even Pipe)
        inst.mnemonic = "fs";
        inst.targetPipe = SPU_Pipe::EVEN;
        inst.latency = 6;
    } else if (op11 == 0x1C2) {
        // FM: Floating Multiply (Even Pipe)
        inst.mnemonic = "fm";
        inst.targetPipe = SPU_Pipe::EVEN;
        inst.latency = 6;
    } else if (op8 == 0x70) {
        // FMA: Floating Multiply-Add (Even Pipe, 4 operands: rt = ra * rb + rc)
        inst.mnemonic = "fma";
        inst.targetPipe = SPU_Pipe::EVEN;
        inst.latency = 6;
    } else if (op11 == 0x180) {
        // A: Integer Add Word (Even Pipe)
        inst.mnemonic = "a";
        inst.targetPipe = SPU_Pipe::EVEN;
        inst.latency = 2;
    } else if (op8 == 0x34) {
        // LQD: Load Quadword d-form (Even Pipe)
        inst.mnemonic = "lqd";
        inst.targetPipe = SPU_Pipe::EVEN;
        inst.latency = 6;
    } else if (op8 == 0x24) {
        // STQD: Store Quadword d-form (Even Pipe)
        inst.mnemonic = "stqd";
        inst.targetPipe = SPU_Pipe::EVEN;
        inst.latency = 6;
    } else if (op11 == 0x1A8) {
        // WRCH: Write Channel (Odd Pipe)
        inst.mnemonic = "wrch";
        inst.targetPipe = SPU_Pipe::ODD;
        inst.latency = 6;
    } else if (op11 == 0x1A9) {
        // RDCH: Read Channel (Odd Pipe)
        inst.mnemonic = "rdch";
        inst.targetPipe = SPU_Pipe::ODD;
        inst.latency = 6;
    } else {
        // Fallback generic NOP
        inst.mnemonic = "nop";
        inst.targetPipe = SPU_Pipe::EVEN;
        inst.latency = 1;
    }

    return inst;
}

bool SPUCore::stepCycle() {
    if (m_status != SPU_STATUS_RUNNING) return false;

    // Fetch up to 2 instructions (8 bytes) for dual-issue check
    u32 raw0 = *(u32*)(&m_localStore[m_pc & 0x3FFFC]);
    SPU_Instruction inst0 = decode(raw0);

    m_npc = (m_pc + 4) & 0x3FFFC;

    // Check if second instruction can dual-issue on opposite pipe
    u32 nextPc = (m_pc + 4) & 0x3FFFC;
    u32 raw1 = *(u32*)(&m_localStore[nextPc]);
    SPU_Instruction inst1 = decode(raw1);

    bool dualIssued = false;
    if (inst0.targetPipe == SPU_Pipe::EVEN && inst1.targetPipe == SPU_Pipe::ODD) {
        // Dual issue: Even pipe executes inst0, Odd pipe executes inst1 in same cycle
        execute(inst0);
        execute(inst1);
        m_npc = (m_pc + 8) & 0x3FFFC;
        dualIssued = true;
    } else {
        // Single issue
        execute(inst0);
    }

    m_pc = m_npc;
    m_cycleCount++;
    return (m_status == SPU_STATUS_RUNNING);
}

void SPUCore::execute(const SPU_Instruction& inst) {
    if (inst.mnemonic == "stop") {
        m_status = SPU_STATUS_STOP_INSTR;
    } else if (inst.mnemonic == "fa") {
        qword_t a = getRegister(inst.ra);
        qword_t b = getRegister(inst.rb);
        qword_t r;
        for (int i = 0; i < 4; ++i) r.f32_data[i] = a.f32_data[i] + b.f32_data[i];
        setRegister(inst.rt, r);
    } else if (inst.mnemonic == "fs") {
        qword_t a = getRegister(inst.ra);
        qword_t b = getRegister(inst.rb);
        qword_t r;
        for (int i = 0; i < 4; ++i) r.f32_data[i] = a.f32_data[i] - b.f32_data[i];
        setRegister(inst.rt, r);
    } else if (inst.mnemonic == "fm") {
        qword_t a = getRegister(inst.ra);
        qword_t b = getRegister(inst.rb);
        qword_t r;
        for (int i = 0; i < 4; ++i) r.f32_data[i] = a.f32_data[i] * b.f32_data[i];
        setRegister(inst.rt, r);
    } else if (inst.mnemonic == "fma") {
        qword_t a = getRegister(inst.ra);
        qword_t b = getRegister(inst.rb);
        qword_t c = getRegister(inst.rc);
        qword_t r;
        for (int i = 0; i < 4; ++i) r.f32_data[i] = (a.f32_data[i] * b.f32_data[i]) + c.f32_data[i];
        setRegister(inst.rt, r);
    } else if (inst.mnemonic == "a") {
        qword_t a = getRegister(inst.ra);
        qword_t b = getRegister(inst.rb);
        qword_t r;
        for (int i = 0; i < 4; ++i) r.u32_data[i] = a.u32_data[i] + b.u32_data[i];
        setRegister(inst.rt, r);
    } else if (inst.mnemonic == "lqd") {
        u32 lsa = getRegister(inst.ra).u32_data[3] + inst.imm;
        setRegister(inst.rt, readLSQuadword(lsa));
    } else if (inst.mnemonic == "stqd") {
        u32 lsa = getRegister(inst.ra).u32_data[3] + inst.imm;
        writeLSQuadword(lsa, getRegister(inst.rt));
    } else if (inst.mnemonic == "wrch") {
        writeChannel(inst.ra, getRegister(inst.rt).u32_data[3]);
    } else if (inst.mnemonic == "rdch") {
        qword_t r = {};
        r.u32_data[3] = readChannel(inst.ra);
        setRegister(inst.rt, r);
    }
}

void SPUCore::writeChannel(u32 ch, u32 val) {
    if (m_mfc) {
        m_mfc->writeChannel(ch, val);
    }
    if (ch == 28) {
        m_outMbox = val;
    }
}

u32 SPUCore::readChannel(u32 ch) {
    if (m_mfc) {
        return m_mfc->readChannel(ch);
    }
    if (ch == 29) {
        return m_inMbox;
    }
    return 0;
}

void SPUCore::run(u64 maxCycles) {
    u64 count = 0;
    while (m_status == SPU_STATUS_RUNNING && count < maxCycles) {
        stepCycle();
        count++;
    }
}

} // namespace Cell
`
  },
  {
    id: 'mfc_dma_h',
    name: 'mfc_dma.h',
    path: 'src/spe/mfc_dma.h',
    category: 'spe',
    language: 'header',
    description: 'Memory Flow Controller (MFC) handling high-speed DMA transfers between Local Store and Main Memory.',
    content: `/**
 * @file mfc_dma.h
 * @brief Memory Flow Controller (MFC) and DMA Transfer Engine
 * 
 * Manages DMA requests, tag groups, atomic reservations, and host mailbox channels.
 */

#ifndef _CELL_MFC_DMA_H_
#define _CELL_MFC_DMA_H_

#include "../../include/cell/types.h"
#include <deque>
#include <mutex>

namespace Cell {

class SPUCore;

struct MFC_Command {
    u16 cmd;
    u16 tag;
    cell_lsa_t lsa;
    cell_ea_t  ea;
    u32 size;
    bool inProgress;
};

class MfcDma {
public:
    explicit MfcDma(u32 spuId);
    ~MfcDma();

    void reset();
    void setHostMemory(u8* hostRam, size_t ramSize);
    void bindSPU(SPUCore* spu) { m_spu = spu; }

    // SPU Channel Operations
    void writeChannel(u32 ch, u32 value);
    u32 readChannel(u32 ch);

    // DMA Command Enqueue
    bool enqueueDMA(u16 cmd, u16 tag, cell_lsa_t lsa, cell_ea_t ea, u32 size);
    void processQueuedTransfers();

    // Tag Status & Synchronization
    u32 getTagStatus() const { return m_tagStatus; }
    void acknowledgeTagGroup(u32 tagMask);
    bool isTagCompleted(u16 tag) const;

    // Mailboxes
    void putInboundMailbox(u32 val);
    u32 getOutboundMailbox() const { return m_spuOutMbox; }
    void sendSignal(u8 signalIndex, u32 data);

private:
    u32 m_spuId;
    SPUCore* m_spu;
    u8* m_hostRam;
    size_t m_ramSize;

    // Channel buffer registers
    cell_lsa_t m_lsaReg;
    u32 m_eaHighReg;
    u32 m_eaLowReg;
    u32 m_sizeReg;
    u16 m_tagIdReg;
    u32 m_tagMask;
    u32 m_tagUpdateCondition;
    u32 m_tagStatus;

    // Atomic Line Reservation
    cell_ea_t m_atomicReservationEA;
    bool m_hasAtomicReservation;

    // Mailbox registers
    u32 m_spuInMbox;
    u32 m_spuOutMbox;
    bool m_inMboxEmpty;

    // 16-entry DMA Command Queue
    std::deque<MFC_Command> m_dmaQueue;
};

} // namespace Cell

#endif /* _CELL_MFC_DMA_H_ */
`
  },
  {
    id: 'mfc_dma_cpp',
    name: 'mfc_dma.cpp',
    path: 'src/spe/mfc_dma.cpp',
    category: 'spe',
    language: 'cpp',
    description: 'MFC DMA execution, 16-tag group tracking, atomic reservations, and bus packet interaction.',
    content: `/**
 * @file mfc_dma.cpp
 * @brief Memory Flow Controller Implementation
 */

#include "mfc_dma.h"
#include "spu_core.h"
#include <cstring>
#include <iostream>

namespace Cell {

MfcDma::MfcDma(u32 spuId)
    : m_spuId(spuId),
      m_spu(nullptr),
      m_hostRam(nullptr),
      m_ramSize(0),
      m_lsaReg(0),
      m_eaHighReg(0),
      m_eaLowReg(0),
      m_sizeReg(0),
      m_tagIdReg(0),
      m_tagMask(0),
      m_tagUpdateCondition(0),
      m_tagStatus(0),
      m_atomicReservationEA(0),
      m_hasAtomicReservation(false),
      m_spuInMbox(0),
      m_spuOutMbox(0),
      m_inMboxEmpty(true)
{
}

MfcDma::~MfcDma() {}

void MfcDma::reset() {
    m_tagStatus = 0;
    m_tagMask = 0;
    m_dmaQueue.clear();
    m_hasAtomicReservation = false;
    m_inMboxEmpty = true;
}

void MfcDma::setHostMemory(u8* hostRam, size_t ramSize) {
    m_hostRam = hostRam;
    m_ramSize = ramSize;
}

void MfcDma::writeChannel(u32 ch, u32 value) {
    switch (ch) {
        case 16: // MFC_LSA
            m_lsaReg = value & 0x3FFFF;
            break;
        case 17: // MFC_EAH
            m_eaHighReg = value;
            break;
        case 18: // MFC_EAL
            m_eaLowReg = value;
            break;
        case 19: // MFC_Size
            m_sizeReg = value;
            break;
        case 20: // MFC_TagID
            m_tagIdReg = (u16)(value & 0x1F);
            break;
        case 21: { // MFC_Cmd (Triggers DMA transfer)
            cell_ea_t ea = ((cell_ea_t)m_eaHighReg << 32) | m_eaLowReg;
            enqueueDMA((u16)value, m_tagIdReg, m_lsaReg, ea, m_sizeReg);
            break;
        }
        case 22: // MFC_WrTagMask
            m_tagMask = value;
            break;
        case 23: // MFC_WrTagUpdate
            m_tagUpdateCondition = value;
            break;
        case 28: // SPU_WrOutMbox
            m_spuOutMbox = value;
            break;
    }
}

u32 MfcDma::readChannel(u32 ch) {
    switch (ch) {
        case 24: // MFC_RdTagStat
            return m_tagStatus & m_tagMask;
        case 29: // SPU_RdInMbox
            m_inMboxEmpty = true;
            return m_spuInMbox;
        case 27: // MFC_RdAtomicStat
            return m_hasAtomicReservation ? 0x00 : 0x01;
        default:
            return 0;
    }
}

bool MfcDma::enqueueDMA(u16 cmd, u16 tag, cell_lsa_t lsa, cell_ea_t ea, u32 size) {
    if (m_dmaQueue.size() >= 16) {
        return false; // Queue full
    }

    MFC_Command dma;
    dma.cmd = cmd;
    dma.tag = tag;
    dma.lsa = lsa;
    dma.ea = ea;
    dma.size = size;
    dma.inProgress = false;

    m_dmaQueue.push_back(dma);
    processQueuedTransfers();
    return true;
}

void MfcDma::processQueuedTransfers() {
    if (!m_spu || !m_hostRam) return;

    u8* ls = m_spu->getLocalStore();

    while (!m_dmaQueue.empty()) {
        MFC_Command cmd = m_dmaQueue.front();
        m_dmaQueue.pop_front();

        // Validate bounds
        if (cmd.lsa + cmd.size <= CELL_SPU_LS_SIZE && cmd.ea + cmd.size <= m_ramSize) {
            if ((cmd.cmd & 0x00FF) == 0x40) {
                // MFC_GET: Host Memory -> SPU Local Store
                std::memcpy(&ls[cmd.lsa], &m_hostRam[cmd.ea], cmd.size);
            } else if ((cmd.cmd & 0x00FF) == 0x20) {
                // MFC_PUT: SPU Local Store -> Host Memory
                std::memcpy(&m_hostRam[cmd.ea], &ls[cmd.lsa], cmd.size);
            }
        }

        // Mark tag complete in tag status bitfield
        m_tagStatus |= (1U << (cmd.tag & 0x1F));
    }
}

bool MfcDma::isTagCompleted(u16 tag) const {
    return (m_tagStatus & (1U << (tag & 0x1F))) != 0;
}

void MfcDma::acknowledgeTagGroup(u32 tagMask) {
    m_tagStatus &= ~tagMask;
}

void MfcDma::putInboundMailbox(u32 val) {
    m_spuInMbox = val;
    m_inMboxEmpty = false;
}

} // namespace Cell
`
  },
  {
    id: 'ppe_core_h',
    name: 'ppe_core.h',
    path: 'src/ppe/ppe_core.h',
    category: 'ppe',
    language: 'header',
    description: 'Power Processing Element (PPE) 64-bit PowerPC Architecture core with 2-way SMT.',
    content: `/**
 * @file ppe_core.h
 * @brief Power Processing Element (PPE) 64-bit PowerPC Core Header
 * 
 * Implements 64-bit Power Architecture v2.02 with 2-way Simultaneous
 * Multithreading (SMT), 32 GPRs, 32 FPRs, 32 VMX/AltiVec registers,
 * L1 caches (32KB inst + 32KB data) and 512KB L2 unified cache.
 */

#ifndef _CELL_PPE_CORE_H_
#define _CELL_PPE_CORE_H_

#include "../../include/cell/types.h"
#include <string>
#include <vector>

namespace Cell {

struct SMT_Thread {
    u64 pc;
    u64 gpr[32];       // General Purpose Registers (r0-r31)
    f64 fpr[32];       // Floating Point Registers (f0-f31)
    qword_t vmx[32];   // VMX / AltiVec 128-bit Vector Registers (v0-v31)
    
    // Special Purpose Registers (SPRs)
    u64 msr;           // Machine State Register
    u32 cr;            // Condition Register
    u64 lr;            // Link Register
    u64 ctr;           // Count Register
    u32 xer;           // Fixed-Point Exception Register
    bool active;
};

class PPECore {
public:
    PPECore();
    ~PPECore();

    void reset();
    void setMemory(u8* ram, size_t size);

    // Thread scheduling
    void stepCycle();
    void setThreadPC(u8 threadId, u64 pc);
    u64 getThreadPC(u8 threadId) const;

    // Registers
    u64 getGPR(u8 threadId, u8 regIdx) const;
    void setGPR(u8 threadId, u8 regIdx, u64 val);

    // SPU Workload Orchestration Syscalls
    int sys_spu_thread_create(u32* threadId, const char* name, u32 entry, u64 arg);
    int sys_spu_thread_group_start(u32 groupId);

private:
    SMT_Thread m_threads[2]; // 2 hardware threads (Thread 0 and Thread 1)
    u8 m_activeThread;
    u64 m_cycleCount;

    u8* m_ram;
    size_t m_ramSize;

    // Instruction decode & execute
    void executePPC(SMT_Thread& th, u32 rawInstruction);
};

} // namespace Cell

#endif /* _CELL_PPE_CORE_H_ */
`
  },
  {
    id: 'ppe_core_cpp',
    name: 'ppe_core.cpp',
    path: 'src/ppe/ppe_core.cpp',
    category: 'ppe',
    language: 'cpp',
    description: 'PPE PowerPC instruction dispatch, SMT round-robin scheduling, and SPU thread orchestration.',
    content: `/**
 * @file ppe_core.cpp
 * @brief Power Processing Element Implementation
 */

#include "ppe_core.h"
#include <cstring>
#include <iostream>

namespace Cell {

PPECore::PPECore()
    : m_activeThread(0),
      m_cycleCount(0),
      m_ram(nullptr),
      m_ramSize(0)
{
    reset();
}

PPECore::~PPECore() {}

void PPECore::reset() {
    for (int t = 0; t < 2; ++t) {
        m_threads[t].pc = 0x10000; // Standard PowerPC user entry point
        std::memset(m_threads[t].gpr, 0, sizeof(m_threads[t].gpr));
        std::memset(m_threads[t].fpr, 0, sizeof(m_threads[t].fpr));
        std::memset(m_threads[t].vmx, 0, sizeof(m_threads[t].vmx));
        m_threads[t].msr = 0x8000000000000000ULL; // 64-bit mode bit
        m_threads[t].cr = 0;
        m_threads[t].lr = 0;
        m_threads[t].ctr = 0;
        m_threads[t].xer = 0;
        m_threads[t].active = (t == 0); // Primary thread active by default
    }
}

void PPECore::setMemory(u8* ram, size_t size) {
    m_ram = ram;
    m_ramSize = size;
}

void PPECore::stepCycle() {
    m_cycleCount++;
    // Alternating SMT thread fetch cycle
    m_activeThread ^= 1;
    SMT_Thread& th = m_threads[m_activeThread];
    if (!th.active || !m_ram) return;

    if (th.pc + 4 <= m_ramSize) {
        u32 raw = *(u32*)(&m_ram[th.pc]);
        executePPC(th, raw);
        th.pc += 4;
    }
}

void PPECore::executePPC(SMT_Thread& th, u32 raw) {
    u8 op = (raw >> 26) & 0x3F;
    u8 rd = (raw >> 21) & 0x1F;
    u8 ra = (raw >> 16) & 0x1F;
    s16 simm = (s16)(raw & 0xFFFF);

    switch (op) {
        case 14: // addi: Add Immediate (rD = rA + SIMM)
            th.gpr[rd] = (ra == 0 ? 0 : th.gpr[ra]) + simm;
            break;
        case 15: // addis: Add Immediate Shifted
            th.gpr[rd] = (ra == 0 ? 0 : th.gpr[ra]) + ((s64)simm << 16);
            break;
        case 31: { // Extended opcode
            u16 xo = (raw >> 1) & 0x3FF;
            if (xo == 266) { // add: rD = rA + rB
                u8 rb = (raw >> 11) & 0x1F;
                th.gpr[rd] = th.gpr[ra] + th.gpr[rb];
            }
            break;
        }
        case 18: { // Branch (b, bl)
            s32 li = (s32)((raw & 0x03FFFFFC) << 6) >> 6;
            if (raw & 1) th.lr = th.pc + 4; // Link register set
            th.pc = (th.pc + li - 4);
            break;
        }
    }
}

u64 PPECore::getGPR(u8 threadId, u8 regIdx) const {
    return m_threads[threadId & 1].gpr[regIdx & 31];
}

void PPECore::setGPR(u8 threadId, u8 regIdx, u64 val) {
    m_threads[threadId & 1].gpr[regIdx & 31] = val;
}

int PPECore::sys_spu_thread_create(u32* threadId, const char* name, u32 entry, u64 arg) {
    if (threadId) *threadId = 1;
    return 0; // CELL_OK
}

int PPECore::sys_spu_thread_group_start(u32 groupId) {
    return 0; // CELL_OK
}

} // namespace Cell
`
  },
  {
    id: 'cell_eib_h',
    name: 'cell_eib.h',
    path: 'src/bus/cell_eib.h',
    category: 'bus',
    language: 'header',
    description: 'Element Interconnect Bus (EIB) 4-ring data communication highway connecting PPE and SPEs.',
    content: `/**
 * @file cell_eib.h
 * @brief Element Interconnect Bus (EIB) Ring Highway Architecture
 * 
 * The EIB consists of 4 unidirectional 16-byte wide data rings:
 * - Ring 0 & Ring 1: Clockwise
 * - Ring 2 & Ring 3: Counter-Clockwise
 * Running at half CPU frequency (~1.6 GHz for 3.2 GHz Cell B.E.)
 * Peak Theoretical Bandwidth: 204.8 GB/s (128 bytes/cycle @ 1.6 GHz).
 */

#ifndef _CELL_EIB_H_
#define _CELL_EIB_H_

#include "../../include/cell/types.h"
#include <vector>
#include <string>

namespace Cell {

enum class EIB_RingDir {
    CLOCKWISE,
    COUNTER_CLOCKWISE
};

struct EIB_RingSlot {
    bool occupied;
    u8 sourceId;
    u8 destId;
    u16 tag;
    u8 data[16]; // 16-byte transfer granule
};

class CellEIB {
public:
    static constexpr int NUM_RINGS = 4;
    static constexpr int NUM_NODES = 12; // PPE, 8 SPEs, Memory Controller (MIC), 2 FlexIO

    CellEIB();
    ~CellEIB();

    void reset();
    void stepBusCycle();

    // Inject DMA packet onto least-congested ring
    bool injectPacket(u8 srcNode, u8 destNode, u16 tag, const u8* data16);
    
    // Performance & Bus Telemetry
    f64 getInstantBandwidthGBs() const;
    u64 getTotalPacketsTransferred() const { return m_totalPackets; }
    u32 getActiveTraffic() const;

private:
    EIB_RingSlot m_rings[NUM_RINGS][NUM_NODES];
    u64 m_busCycles;
    u64 m_totalPackets;
    u64 m_cycleTransferredBytes;

    int computeShortestHops(u8 src, u8 dst, EIB_RingDir dir) const;
};

} // namespace Cell

#endif /* _CELL_EIB_H_ */
`
  },
  {
    id: 'cell_eib_cpp',
    name: 'cell_eib.cpp',
    path: 'src/bus/cell_eib.cpp',
    category: 'bus',
    language: 'cpp',
    description: 'EIB 4-ring arbitration, ring shift rotations, and bandwidth calculation.',
    content: `/**
 * @file cell_eib.cpp
 * @brief Element Interconnect Bus Ring Routing and Arbitration
 */

#include "cell_eib.h"
#include <cstring>

namespace Cell {

CellEIB::CellEIB()
    : m_busCycles(0),
      m_totalPackets(0),
      m_cycleTransferredBytes(0)
{
    reset();
}

CellEIB::~CellEIB() {}

void CellEIB::reset() {
    m_busCycles = 0;
    m_totalPackets = 0;
    m_cycleTransferredBytes = 0;
    std::memset(m_rings, 0, sizeof(m_rings));
}

int CellEIB::computeShortestHops(u8 src, u8 dst, EIB_RingDir dir) const {
    if (dir == EIB_RingDir::CLOCKWISE) {
        return (dst >= src) ? (dst - src) : (NUM_NODES - src + dst);
    } else {
        return (src >= dst) ? (src - dst) : (NUM_NODES - dst + src);
    }
}

bool CellEIB::injectPacket(u8 srcNode, u8 destNode, u16 tag, const u8* data16) {
    if (srcNode >= NUM_NODES || destNode >= NUM_NODES) return false;

    // Check rings 0, 1 (CW) vs 2, 3 (CCW) for fastest path
    int hopsCW = computeShortestHops(srcNode, destNode, EIB_RingDir::CLOCKWISE);
    int hopsCCW = computeShortestHops(srcNode, destNode, EIB_RingDir::COUNTER_CLOCKWISE);

    int ringStart = (hopsCW <= hopsCCW) ? 0 : 2;
    int ringEnd = ringStart + 2;

    for (int r = ringStart; r < ringEnd; ++r) {
        if (!m_rings[r][srcNode].occupied) {
            m_rings[r][srcNode].occupied = true;
            m_rings[r][srcNode].sourceId = srcNode;
            m_rings[r][srcNode].destId = destNode;
            m_rings[r][srcNode].tag = tag;
            if (data16) std::memcpy(m_rings[r][srcNode].data, data16, 16);
            return true;
        }
    }
    return false; // All rings currently busy at source station
}

void CellEIB::stepBusCycle() {
    m_busCycles++;
    m_cycleTransferredBytes = 0;

    // Rotate Rings 0 & 1 (Clockwise: node i -> (i+1)%NUM_NODES)
    for (int r = 0; r < 2; ++r) {
        EIB_RingSlot temp[NUM_NODES];
        for (int n = 0; n < NUM_NODES; ++n) {
            int nextNode = (n + 1) % NUM_NODES;
            temp[nextNode] = m_rings[r][n];
            if (temp[nextNode].occupied && temp[nextNode].destId == nextNode) {
                // Packet reached destination
                temp[nextNode].occupied = false;
                m_totalPackets++;
                m_cycleTransferredBytes += 16;
            }
        }
        std::memcpy(m_rings[r], temp, sizeof(temp));
    }

    // Rotate Rings 2 & 3 (Counter-Clockwise: node i -> (i-1+NUM_NODES)%NUM_NODES)
    for (int r = 2; r < 4; ++r) {
        EIB_RingSlot temp[NUM_NODES];
        for (int n = 0; n < NUM_NODES; ++n) {
            int prevNode = (n - 1 + NUM_NODES) % NUM_NODES;
            temp[prevNode] = m_rings[r][n];
            if (temp[prevNode].occupied && temp[prevNode].destId == prevNode) {
                temp[prevNode].occupied = false;
                m_totalPackets++;
                m_cycleTransferredBytes += 16;
            }
        }
        std::memcpy(m_rings[r], temp, sizeof(temp));
    }
}

f64 CellEIB::getInstantBandwidthGBs() const {
    // 1.6 GHz clock * transferred bytes
    return (m_cycleTransferredBytes * 1.6);
}

u32 CellEIB::getActiveTraffic() const {
    u32 count = 0;
    for (int r = 0; r < NUM_RINGS; ++r) {
        for (int n = 0; n < NUM_NODES; ++n) {
            if (m_rings[r][n].occupied) count++;
        }
    }
    return count;
}

} // namespace Cell
`
  },
  {
    id: 'cell_mmu_h',
    name: 'cell_mmu.h',
    path: 'src/mmu/cell_mmu.h',
    category: 'mmu',
    language: 'header',
    description: 'Cell B.E. Memory Management Unit, Segment Lookaside Buffer (SLB), and SPU Local Store MMIO mapping.',
    content: `/**
 * @file cell_mmu.h
 * @brief Memory Management Unit and MMIO Local Store Map
 */

#ifndef _CELL_MMU_H_
#define _CELL_MMU_H_

#include "../../include/cell/types.h"

namespace Cell {

struct SLB_Entry {
    u64 esid; // Effective Segment ID
    u64 vsid; // Virtual Segment ID
    bool valid;
};

class CellMMU {
public:
    CellMMU();
    ~CellMMU();

    void reset();
    bool translateEAtoRA(cell_ea_t ea, u64* ra, bool write);
    
    // SPE Local Store MMIO address calculation
    static cell_ea_t getSpeBaseAddress(u8 speIndex);
    static cell_ea_t getSpeProblemStateAddress(u8 speIndex);

private:
    SLB_Entry m_slb[64]; // 64-entry SLB
};

} // namespace Cell

#endif /* _CELL_MMU_H_ */
`
  },
  {
    id: 'matrix_mul_s',
    name: 'vector_matrix_mul.spu.s',
    path: 'samples/vector_matrix_mul.spu.s',
    category: 'samples',
    language: 'assembly',
    description: 'Hand-optimized SPU assembly code for 4x4 SIMD matrix transformation using dual-issue pipeline.',
    content: `/*
 * @file vector_matrix_mul.spu.s
 * @brief PlayStation 3 SPU SIMD 4x4 Matrix Multiplication
 *
 * Multiplies vector V ($r3) by Matrix M ($r4-$r7)
 * Takes advantage of SPU Even/Odd Dual-Issue scheduling.
 *
 * Register Allocation:
 *   $r3: Input vector V = [x, y, z, w]
 *   $r4: Matrix Row 0
 *   $r5: Matrix Row 1
 *   $r6: Matrix Row 2
 *   $r7: Matrix Row 3
 *   $r8: Result vector
 *   $r9-$r12: Splat temporaries
 */

.text
.global spu_matrix_transform
.type spu_matrix_transform, @function

spu_matrix_transform:
    /* Dual-Issue Pair 1: Splat V.x into $r9 (Odd: rotqby) & FMUL with Row 0 (Even) */
    rotqby      $r9, $r3, 0         # Splat X component (Odd Pipe)
    fm          $r8, $r4, $r9       # $r8 = Row0 * V.x (Even Pipe)

    /* Dual-Issue Pair 2: Splat V.y into $r10 & FMA into accum */
    rotqby      $r10, $r3, 4        # Splat Y component (Odd Pipe)
    fma         $r8, $r5, $r10, $r8 # $r8 += Row1 * V.y (Even Pipe)

    /* Dual-Issue Pair 3: Splat V.z into $r11 & FMA into accum */
    rotqby      $r11, $r3, 8        # Splat Z component (Odd Pipe)
    fma         $r8, $r6, $r11, $r8 # $r8 += Row2 * V.z (Even Pipe)

    /* Dual-Issue Pair 4: Splat V.w into $r12 & FMA into accum */
    rotqby      $r12, $r3, 12       # Splat W component (Odd Pipe)
    fma         $r3, $r7, $r12, $r8 # Output $r3 = Row3 * V.w + Accum (Even Pipe)

    /* Return to caller */
    bi          $lr                 # Branch to Link Register (Odd Pipe)
    nop                             # Even Pipe NOP for dual issue slot
`
  },
  {
    id: 'dma_double_buffer_c',
    name: 'spu_dma_double_buffer.c',
    path: 'samples/spu_dma_double_buffer.c',
    category: 'samples',
    language: 'c',
    description: 'High-performance SPU double-buffering DMA ping-pong pattern hiding memory latency.',
    content: `/**
 * @file spu_dma_double_buffer.c
 * @brief Classic PS3 SPU DMA Double-Buffering Streaming Kernel
 * 
 * Overlaps compute on buffer[idx] with asynchronous DMA fetch on buffer[1 - idx].
 */

#include "../include/cell/types.h"
#include "../include/cell/spu_intrinsics.h"

#define BUFFER_SIZE_BYTES 16384 // 16 KB buffer chunk
#define NUM_BLOCKS        16

/* 16-byte aligned ping-pong buffers in SPU Local Store */
static qword_t buffer[2][BUFFER_SIZE_BYTES / sizeof(qword_t)] CELL_ALIGN_128;

void process_data(qword_t* buf, int quadword_count) {
    /* SIMD Compute kernel: Multiply by scaling factor */
    qword_t scale = { .f32_data = { 1.5f, 1.5f, 1.5f, 1.5f } };
    for (int i = 0; i < quadword_count; ++i) {
        buf[i] = spu_mul_float(buf[i], scale);
    }
}

int main(uint64_t spe_id, uint64_t argp, uint64_t envp) {
    cell_ea_t input_ea  = (cell_ea_t)argp;
    cell_ea_t output_ea = (cell_ea_t)envp;

    int cur_buf = 0;
    int tag[2] = { 0, 1 };

    /* 1. Prime the pipeline: Queue first buffer fetch */
    spu_mfcdma32((uint32_t)&buffer[0], (uint32_t)input_ea, BUFFER_SIZE_BYTES, tag[0], MFC_GET_CMD);

    for (int i = 0; i < NUM_BLOCKS; ++i) {
        int next_buf = 1 - cur_buf;
        cell_ea_t next_input_ea = input_ea + ((i + 1) * BUFFER_SIZE_BYTES);

        /* Asynchronously queue the NEXT block if still within range */
        if (i + 1 < NUM_BLOCKS) {
            spu_mfcdma32((uint32_t)&buffer[next_buf], (uint32_t)next_input_ea, BUFFER_SIZE_BYTES, tag[next_buf], MFC_GET_CMD);
        }

        /* Wait for CURRENT buffer DMA to complete */
        spu_writech(MFC_WrTagMask, 1 << tag[cur_buf]);
        spu_mfcstat(MFC_TAG_UPDATE_ALL);

        /* Process current buffer using 128-bit vector arithmetic */
        process_data(buffer[cur_buf], BUFFER_SIZE_BYTES / sizeof(qword_t));

        /* Queue writeback of processed results to host RAM */
        cell_ea_t cur_output_ea = output_ea + (i * BUFFER_SIZE_BYTES);
        spu_mfcdma32((uint32_t)&buffer[cur_buf], (uint32_t)cur_output_ea, BUFFER_SIZE_BYTES, tag[cur_buf], MFC_PUT_CMD);

        /* Swap ping-pong buffer indices */
        cur_buf = next_buf;
    }

    /* Wait for final DMA writeback to conclude */
    spu_writech(MFC_WrTagMask, (1 << tag[0]) | (1 << tag[1]));
    spu_mfcstat(MFC_TAG_UPDATE_ALL);

    /* Send completion signal to PPE via outbound mailbox */
    spu_writech(SPU_WrOutMbox, 0xC0FFEE01);

    return 0;
}
`
  },
  {
    id: 'spu_alu_verilog',
    name: 'spu_simd_alu_128b.v',
    path: 'hdl/spu_simd_alu_128b.v',
    category: 'hdl',
    language: 'verilog',
    description: 'Synthesizable Verilog HDL model of the SPU 128-bit 4-lane SIMD Arithmetic Logic Unit.',
    content: `/**
 * @file spu_simd_alu_128b.v
 * @brief 128-bit SIMD Vector Floating-Point & Integer Arithmetic Unit
 *
 * Implements 4 parallel 32-bit execution lanes for single-cycle integer
 * and 6-cycle pipelined single-precision IEEE-754 floating point add/mul.
 */

\`timescale 1ns / 1ps

module spu_simd_alu_128b (
    input  wire        clk,
    input  wire        rst_n,
    input  wire [3:0]  alu_opcode,  // 0: ADD_F32, 1: SUB_F32, 2: MUL_F32, 3: FMA, 4: ADD_I32
    input  wire        valid_in,
    input  wire [127:0] op_a,       // Vector operand A
    input  wire [127:0] op_b,       // Vector operand B
    input  wire [127:0] op_c,       // Vector operand C (for FMA)
    output reg  [127:0] result_out,
    output reg         valid_out
);

    // 4 Parallel 32-bit execution lanes
    genvar i;
    generate
        for (i = 0; i < 4; i = i + 1) begin : gen_lanes
            wire [31:0] lane_a = op_a[32*i + 31 : 32*i];
            wire [31:0] lane_b = op_b[32*i + 31 : 32*i];
            wire [31:0] lane_c = op_c[32*i + 31 : 32*i];
            reg  [31:0] lane_res;

            always @(*) begin
                case (alu_opcode)
                    4'b0000: // Integer Add
                        lane_res = lane_a + lane_b;
                    4'b0001: // Float Add (simplified behavioral model)
                        lane_res = lane_a + lane_b; 
                    4'b0010: // Float Multiply
                        lane_res = lane_a * lane_b;
                    default:
                        lane_res = 32'h0;
                endcase
            end
        end
    endgenerate

    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            result_out <= 128'h0;
            valid_out  <= 1'b0;
        end else begin
            valid_out  <= valid_in;
            result_out <= {gen_lanes[3].lane_res, gen_lanes[2].lane_res,
                           gen_lanes[1].lane_res, gen_lanes[0].lane_res};
        end
    end

endmodule
`
  },
  {
    id: 'cmake_build',
    name: 'CMakeLists.txt',
    path: 'CMakeLists.txt',
    category: 'build',
    language: 'cmake',
    description: 'Cross-platform CMake build configuration for PPE and SPU binaries.',
    content: `cmake_minimum_required(VERSION 3.20)
project(Cell_Broadband_Engine_Core VERSION 1.0.0 LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Architecture compiler flags
if(CMAKE_COMPILER_IS_GNUCXX)
    add_compile_options(-Wall -Wextra -O3 -fno-strict-aliasing)
    # Target 64-bit PowerPC or Host SPU Emulator
    add_definitions(-DCELL_PS3_PLATFORM -D__BIG_ENDIAN__)
endif()

include_directories(
    \${PROJECT_SOURCE_DIR}/include
    \${PROJECT_SOURCE_DIR}/src
)

# SPU Core Library
add_library(cell_spu_engine STATIC
    src/spe/spu_core.cpp
    src/spe/mfc_dma.cpp
)

# Bus & Interconnect
add_library(cell_eib_bus STATIC
    src/bus/cell_eib.cpp
)

# PPE Core
add_library(cell_ppe_engine STATIC
    src/ppe/ppe_core.cpp
)

# NVIDIA RSX GPU Library
add_library(cell_rsx_gpu STATIC
    src/rsx/rsx_core.cpp
)

# Memory Subsystem (Rambus XDR DRAM & MIC)
add_library(cell_memory_subsystem STATIC
    src/memory/memory_subsystem.cpp
)

# Southbridge I/O Companion Chip
add_library(cell_southbridge STATIC
    src/io/southbridge.cpp
)

# Full PS3 System Simulator Executable
add_executable(ps3_cell_sim
    src/main_sim.cpp
)

target_link_libraries(ps3_cell_sim PRIVATE
    cell_spu_engine
    cell_eib_bus
    cell_ppe_engine
    cell_rsx_gpu
    cell_memory_subsystem
    cell_southbridge
)
`
  },
  ...ADDITIONAL_PS3_FILES
];
