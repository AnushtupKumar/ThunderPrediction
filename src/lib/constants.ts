// ─── Map Configuration ────────────────────────────────────────────────────────
// India-centric view
export const INDIA_CENTER: [number, number] = [22.5, 82.0];
export const INDIA_ZOOM = 5;

// Active storm focus (Bihar / Patna region) — used for initial map load
export const FOCUS_CENTER: [number, number] = [22.5, 82.0];
export const FOCUS_ZOOM = 5;

// Hard bounds: keep the map restricted to India + immediate neighbours
export const INDIA_BOUNDS: [[number, number], [number, number]] = [
  [6.0, 65.0],   // SW corner
  [38.0, 100.0], // NE corner
];

// ─── Probability Heatmap Grid ─────────────────────────────────────────────────
// Coverage: India lat 8–37, lng 68–97
export const HEATMAP_LAT_MIN = 8;
export const HEATMAP_LAT_MAX = 37;
export const HEATMAP_LNG_MIN = 68;
export const HEATMAP_LNG_MAX = 97;
export const HEATMAP_STEP = 0.4; // degrees — finer grid for smooth full-India coverage

// ─── Timeline Configuration ───────────────────────────────────────────────────
export const TIMELINE_PAST_MIN = -60;
export const TIMELINE_FUTURE_MIN = 120;
export const ANIMATION_INTERVAL_MS = 800;

// ─── Radar dBZ Color Scale ────────────────────────────────────────────────────
export const RADAR_COLOR_SCALE: { min: number; max: number; color: string; alpha: number }[] = [
  { min: 5, max: 15, color: '#4ecdc4', alpha: 0.30 },
  { min: 15, max: 25, color: '#2ecc71', alpha: 0.45 },
  { min: 25, max: 35, color: '#f9ca24', alpha: 0.60 },
  { min: 35, max: 45, color: '#f0932b', alpha: 0.72 },
  { min: 45, max: 55, color: '#e74c3c', alpha: 0.82 },
  { min: 55, max: 65, color: '#c0392b', alpha: 0.90 },
  { min: 65, max: 75, color: '#8e44ad', alpha: 0.96 },
];

// ─── Probability Heatmap Color Stops ─────────────────────────────────────────
// probability 0→1 mapped to RGBA for canvas rendering
export const HEATMAP_COLOR_STOPS = [
  { p: 0.00, r: 0, g: 0, b: 255, a: 0 },  // transparent
  { p: 0.15, r: 0, g: 100, b: 255, a: 60 },  // blue
  { p: 0.30, r: 0, g: 220, b: 130, a: 90 },  // teal-green
  { p: 0.50, r: 255, g: 230, b: 0, a: 120 },  // yellow
  { p: 0.70, r: 255, g: 120, b: 0, a: 150 },  // orange
  { p: 0.85, r: 220, g: 30, b: 30, a: 175 },  // red
  { p: 1.00, r: 160, g: 0, b: 220, a: 200 },  // purple
];

// ─── Severity Colors ──────────────────────────────────────────────────────────
export const SEVERITY_COLORS = {
  low: { bg: '#2ecc71', border: '#27ae60', text: '#0d1f14' },
  moderate: { bg: '#f9ca24', border: '#f0932b', text: '#1a1200' },
  high: { bg: '#e74c3c', border: '#c0392b', text: '#fff' },
  extreme: { bg: '#8e44ad', border: '#6c3483', text: '#fff' },
} as const;

// ─── Alert Type Colors ────────────────────────────────────────────────────────
export const ALERT_COLORS = {
  urgent: { bg: 'rgba(231,76,60,0.15)', border: '#e74c3c', badge: '#e74c3c' },
  warning: { bg: 'rgba(243,156,18,0.15)', border: '#f39c12', badge: '#f39c12' },
  watch: { bg: 'rgba(52,152,219,0.15)', border: '#3498db', badge: '#3498db' },
  advisory: { bg: 'rgba(46,204,113,0.15)', border: '#2ecc71', badge: '#2ecc71' },
} as const;

// ─── Tile Layer ───────────────────────────────────────────────────────────────
export const DARK_TILE_URL =
  `https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=${process.env.NEXT_PUBLIC_STADIA_API_KEY || ''}`;
export const DARK_TILE_ATTRIBUTION =
  '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
