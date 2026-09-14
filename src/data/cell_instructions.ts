import { CellInstructionDef } from '../types/cell';

export const CELL_SPU_INSTRUCTIONS: CellInstructionDef[] = [
  {
    mnemonic: 'fa',
    fullName: 'Floating Add',
    pipe: 'Even',
    unit: 'FP',
    latency: 6,
    syntax: 'fa $rt, $ra, $rb',
    description: 'Adds four 32-bit single-precision floating-point numbers in $ra to corresponding elements in $rb, placing results in $rt.',
    opcodeBin: '01110000000'
  },
  {
    mnemonic: 'fs',
    fullName: 'Floating Subtract',
    pipe: 'Even',
    unit: 'FP',
    latency: 6,
    syntax: 'fs $rt, $ra, $rb',
    description: 'Subtracts four 32-bit float values in $rb from $ra, placing results in $rt.',
    opcodeBin: '01110000001'
  },
  {
    mnemonic: 'fm',
    fullName: 'Floating Multiply',
    pipe: 'Even',
    unit: 'FP',
    latency: 6,
    syntax: 'fm $rt, $ra, $rb',
    description: 'Multiplies four 32-bit float values in $ra with $rb and stores quadword in $rt.',
    opcodeBin: '01110000010'
  },
  {
    mnemonic: 'fma',
    fullName: 'Floating Multiply-Add',
    pipe: 'Even',
    unit: 'FP',
    latency: 6,
    syntax: 'fma $rt, $ra, $rb, $rc',
    description: 'Fused Multiply-Add: Calculates ($ra * $rb) + $rc across 4 float lanes without intermediate rounding.',
    opcodeBin: '01110000'
  },
  {
    mnemonic: 'fms',
    fullName: 'Floating Multiply-Subtract',
    pipe: 'Even',
    unit: 'FP',
    latency: 6,
    syntax: 'fms $rt, $ra, $rb, $rc',
    description: 'Calculates ($ra * $rb) - $rc across all 4 vector floating-point elements.',
    opcodeBin: '01110001'
  },
  {
    mnemonic: 'dfa',
    fullName: 'Double Floating Add',
    pipe: 'Even',
    unit: 'FP',
    latency: 13,
    syntax: 'dfa $rt, $ra, $rb',
    description: 'Adds two 64-bit IEEE double-precision floats in $ra to $rb, placing results in $rt.',
    opcodeBin: '01110000100'
  },
  {
    mnemonic: 'dfm',
    fullName: 'Double Floating Multiply',
    pipe: 'Even',
    unit: 'FP',
    latency: 13,
    syntax: 'dfm $rt, $ra, $rb',
    description: 'Multiplies two 64-bit double-precision floats in $ra by $rb.',
    opcodeBin: '01110000110'
  },
  {
    mnemonic: 'a',
    fullName: 'Add Word',
    pipe: 'Even',
    unit: 'FX1',
    latency: 2,
    syntax: 'a $rt, $ra, $rb',
    description: 'Adds four 32-bit integers in $ra to $rb without carry, storing result in $rt.',
    opcodeBin: '00011000000'
  },
  {
    mnemonic: 'ai',
    fullName: 'Add Immediate Word',
    pipe: 'Even',
    unit: 'FX1',
    latency: 2,
    syntax: 'ai $rt, $ra, value',
    description: 'Sign-extends a 10-bit immediate value to 32 bits and adds it to each 32-bit word in $ra.',
    opcodeBin: '00011100'
  },
  {
    mnemonic: 'sf',
    fullName: 'Subtract from Word',
    pipe: 'Even',
    unit: 'FX1',
    latency: 2,
    syntax: 'sf $rt, $ra, $rb',
    description: 'Subtracts each 32-bit word in $ra from corresponding word in $rb ($rt = $rb - $ra).',
    opcodeBin: '00011000001'
  },
  {
    mnemonic: 'rotqby',
    fullName: 'Rotate Quadword by Bytes',
    pipe: 'Odd',
    unit: 'SHUF',
    latency: 4,
    syntax: 'rotqby $rt, $ra, $rb',
    description: 'Rotates the 128-bit quadword in $ra to the left by the number of bytes specified in $rb (bits 27:31).',
    opcodeBin: '00111111100'
  },
  {
    mnemonic: 'rotqbyi',
    fullName: 'Rotate Quadword by Bytes Immediate',
    pipe: 'Odd',
    unit: 'SHUF',
    latency: 4,
    syntax: 'rotqbyi $rt, $ra, count',
    description: 'Rotates 128-bit quadword in $ra left by an immediate 5-bit byte count into $rt.',
    opcodeBin: '001111110'
  },
  {
    mnemonic: 'shlqby',
    fullName: 'Shift Left Quadword by Bytes',
    pipe: 'Odd',
    unit: 'SHUF',
    latency: 4,
    syntax: 'shlqby $rt, $ra, $rb',
    description: 'Shifts 128-bit quadword in $ra to the left by byte count in $rb, filling vacated low bytes with zero.',
    opcodeBin: '00111111000'
  },
  {
    mnemonic: 'shufb',
    fullName: 'Shuffle Bytes',
    pipe: 'Odd',
    unit: 'SHUF',
    latency: 4,
    syntax: 'shufb $rt, $ra, $rb, $rc',
    description: 'Constructs a 16-byte result in $rt by selecting bytes from $ra and $rb based on control mask quadword $rc.',
    opcodeBin: '01011000'
  },
  {
    mnemonic: 'lqd',
    fullName: 'Load Quadword (d-form)',
    pipe: 'Even',
    unit: 'LS',
    latency: 6,
    syntax: 'lqd $rt, symbol($ra)',
    description: 'Loads 128-bit quadword from 256KB Local Store at address ($ra + imm * 16) into register $rt.',
    opcodeBin: '00110100'
  },
  {
    mnemonic: 'stqd',
    fullName: 'Store Quadword (d-form)',
    pipe: 'Even',
    unit: 'LS',
    latency: 6,
    syntax: 'stqd $rt, symbol($ra)',
    description: 'Stores 128-bit quadword from $rt into 256KB Local Store address ($ra + imm * 16).',
    opcodeBin: '00100100'
  },
  {
    mnemonic: 'lqa',
    fullName: 'Load Quadword (a-form)',
    pipe: 'Even',
    unit: 'LS',
    latency: 6,
    syntax: 'lqa $rt, address',
    description: 'Loads 128-bit quadword from an absolute 18-bit Local Store address into $rt.',
    opcodeBin: '00110001'
  },
  {
    mnemonic: 'stqa',
    fullName: 'Store Quadword (a-form)',
    pipe: 'Even',
    unit: 'LS',
    latency: 6,
    syntax: 'stqa $rt, address',
    description: 'Stores 128-bit quadword in $rt to an absolute 18-bit Local Store address.',
    opcodeBin: '00100001'
  },
  {
    mnemonic: 'wrch',
    fullName: 'Write Channel',
    pipe: 'Odd',
    unit: 'CTRL',
    latency: 6,
    syntax: 'wrch channel, $rt',
    description: 'Writes 32-bit scalar value from preferred slot of $rt to specified MFC or SPU hardware channel.',
    opcodeBin: '00011010100'
  },
  {
    mnemonic: 'rdch',
    fullName: 'Read Channel',
    pipe: 'Odd',
    unit: 'CTRL',
    latency: 6,
    syntax: 'rdch $rt, channel',
    description: 'Reads 32-bit scalar value from specified hardware channel into preferred slot of $rt.',
    opcodeBin: '00011010101'
  },
  {
    mnemonic: 'rchcnt',
    fullName: 'Read Channel Count',
    pipe: 'Odd',
    unit: 'CTRL',
    latency: 6,
    syntax: 'rchcnt $rt, channel',
    description: 'Reads available capacity or pending entry count of specified channel into preferred slot of $rt.',
    opcodeBin: '00011010110'
  },
  {
    mnemonic: 'brz',
    fullName: 'Branch If Zero Word',
    pipe: 'Odd',
    unit: 'BR',
    latency: 4,
    syntax: 'brz $ra, target',
    description: 'Branches to target address if preferred slot of $ra equals zero.',
    opcodeBin: '00100000'
  },
  {
    mnemonic: 'brnz',
    fullName: 'Branch If Not Zero Word',
    pipe: 'Odd',
    unit: 'BR',
    latency: 4,
    syntax: 'brnz $ra, target',
    description: 'Branches to target address if preferred slot of $ra is non-zero.',
    opcodeBin: '00100001'
  },
  {
    mnemonic: 'bi',
    fullName: 'Branch Indirect',
    pipe: 'Odd',
    unit: 'BR',
    latency: 4,
    syntax: 'bi $ra',
    description: 'Unconditionally branches to instruction address contained in $ra (typically $lr for function return).',
    opcodeBin: '00110101000'
  },
  {
    mnemonic: 'bisl',
    fullName: 'Branch Indirect and Set Link',
    pipe: 'Odd',
    unit: 'BR',
    latency: 4,
    syntax: 'bisl $rt, $ra',
    description: 'Saves return address (next PC) in $rt and branches indirectly to address in $ra.',
    opcodeBin: '00110101001'
  },
  {
    mnemonic: 'stop',
    fullName: 'Stop and Signal',
    pipe: 'Odd',
    unit: 'CTRL',
    latency: 4,
    syntax: 'stop type',
    description: 'Halts SPU execution immediately and triggers an interrupt to the PPE host thread with 14-bit stop code.',
    opcodeBin: '00000000000'
  },
  {
    mnemonic: 'hbr',
    fullName: 'Hint for Branch',
    pipe: 'Odd',
    unit: 'BR',
    latency: 1,
    syntax: 'hbr target, branch_pc',
    description: 'Directs branch target prefetch hardware buffer to preload instructions at target to prevent branch stalls.',
    opcodeBin: '00101100'
  }
];
