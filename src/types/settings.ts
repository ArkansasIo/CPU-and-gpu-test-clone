export interface AppSettings {
  // Simulation & Engine
  clockMultiplier: number;          // 0.25x, 0.5x, 1x, 2x, 4x, 10x
  cycleAccurateMode: boolean;       // Step strictly cycle-by-cycle vs burst
  thermalThrottlingSim: boolean;    // Simulate TjMax clock reduction
  speculativeExecution: boolean;    // Branch Prediction & Speculative Issue
  outOfOrderWindowSize: number;     // 32, 64, 128, 256, 512 uops
  strictDualIssue: boolean;         // Enforce 1 Even + 1 Odd pipe slotting

  // Bus & Interconnect
  busArchitecture: 'eib' | 'intel_ring' | 'amd_if' | 'pcie5' | 'photonic_mesh' | 'quantum_qeib';
  busArbitration: 'round_robin' | 'priority_weighted' | 'least_latency';
  cacheCoherency: 'mesi' | 'moesi' | 'directory_based' | 'quantum_entangled';
  busContentionJitter: boolean;     // Inject realistic arbitration latency

  // Visuals & HUD
  highContrastGlow: boolean;        // Particle and ring glowing FX
  showTelemetryOverlay: boolean;    // Live HUD stats on top
  visualizerSpeed: number;          // 0.5x, 1x, 2x
  uiDensity: 'compact' | 'comfortable';
  syntaxTheme: 'cyan' | 'matrix' | 'obsidian' | 'synthwave';

  // Code Editor
  fontSize: number;                 // 11, 12, 13, 14, 16 px
  wordWrap: boolean;
  showLineNumbers: boolean;
  showBusGutterBadges: boolean;

  // Audio Feedback
  audioEnabled: boolean;
  audioVolume: number;              // 0 to 1
  audioProfile: 'scifi_retro' | 'datacenter_clicks' | 'quantum_hum';

  // Century 100-Year Silicon Active Target
  centuryActiveEra: '2026_current' | '2035_angstrom' | '2050_photonic' | '2075_biosilicon' | '2126_computronium';
}

export const DEFAULT_SETTINGS: AppSettings = {
  clockMultiplier: 1,
  cycleAccurateMode: true,
  thermalThrottlingSim: false,
  speculativeExecution: true,
  outOfOrderWindowSize: 128,
  strictDualIssue: true,

  busArchitecture: 'eib',
  busArbitration: 'round_robin',
  cacheCoherency: 'moesi',
  busContentionJitter: false,

  highContrastGlow: true,
  showTelemetryOverlay: true,
  visualizerSpeed: 1,
  uiDensity: 'comfortable',
  syntaxTheme: 'cyan',

  fontSize: 12,
  wordWrap: false,
  showLineNumbers: true,
  showBusGutterBadges: true,

  audioEnabled: false,
  audioVolume: 0.35,
  audioProfile: 'scifi_retro',

  centuryActiveEra: '2026_current'
};
