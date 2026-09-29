import {
  StormCell,
  LightningStrike,
  RadarFrame,
  AtmosphericData,
  WeatherAlert,
  LightningChartPoint,
  SituationReport,
  MapLayer,
  ProbabilityCell,
  NowcastPrediction,
} from '@/types';
import {
  HEATMAP_LAT_MIN, HEATMAP_LAT_MAX,
  HEATMAP_LNG_MIN, HEATMAP_LNG_MAX,
  HEATMAP_STEP,
} from '@/lib/constants';

// ─── Storm Cells (all placed inside India) ────────────────────────────────────
export const MOCK_STORM_CELLS: StormCell[] = [
  {
    id: 'cell-1',
    center: { lat: 25.6, lng: 85.1 },   // Patna, Bihar
    radius: 55,
    intensity: 62,
    severity: 'extreme',
    name: 'Patna Core',
    speed: 68,
    direction: 'WNW',
    capeIndex: 3100,
    lightningRate: 14,
  },
  {
    id: 'cell-2',
    center: { lat: 24.8, lng: 84.3 },   // Gaya, Bihar
    radius: 40,
    intensity: 48,
    severity: 'high',
    name: 'Gaya System',
    speed: 42,
    direction: 'NE',
    capeIndex: 2400,
    lightningRate: 8,
  },
  {
    id: 'cell-3',
    center: { lat: 26.1, lng: 86.5 },   // Muzaffarpur
    radius: 30,
    intensity: 35,
    severity: 'moderate',
    name: 'Muzaffarpur Cell',
    speed: 28,
    direction: 'ENE',
    capeIndex: 1600,
    lightningRate: 4,
  },
  {
    id: 'cell-4',
    center: { lat: 23.8, lng: 85.8 },   // Jharkhand
    radius: 25,
    intensity: 22,
    severity: 'low',
    name: 'Jharkhand Fringe',
    speed: 18,
    direction: 'N',
    capeIndex: 800,
    lightningRate: 2,
  },
  {
    id: 'cell-5',
    center: { lat: 22.3, lng: 87.2 },   // West Bengal / Midnapore
    radius: 45,
    intensity: 52,
    severity: 'high',
    name: 'Midnapore Storm',
    speed: 35,
    direction: 'NNW',
    capeIndex: 2700,
    lightningRate: 10,
  },
  {
    id: 'cell-6',
    center: { lat: 20.9, lng: 85.0 },   // Odisha
    radius: 38,
    intensity: 44,
    severity: 'high',
    name: 'Odisha System',
    speed: 22,
    direction: 'NW',
    capeIndex: 2200,
    lightningRate: 7,
  },
  {
    id: 'cell-7',
    center: { lat: 26.2, lng: 91.8 },   // Guwahati, Assam / Northeast
    radius: 48,
    intensity: 50,
    severity: 'high',
    name: 'Brahmaputra Valley Cell',
    speed: 26,
    direction: 'ENE',
    capeIndex: 2600,
    lightningRate: 9,
  },
  {
    id: 'cell-8',
    center: { lat: 17.2, lng: 73.8 },   // Western Ghats / Konkan
    radius: 40,
    intensity: 40,
    severity: 'moderate',
    name: 'Konkan Orographic Cell',
    speed: 20,
    direction: 'NNE',
    capeIndex: 1900,
    lightningRate: 5,
  },
];

// ─── India Boundary & Point-in-Polygon ─────────────────────────────────────────
import indiaGeoData from '@/data/india-simplified.json';
import { PointProbabilityInfo } from '@/types';

// Pre-compute bounding boxes for fast spatial indexing
interface RingWithBBox {
  ring: number[][];
  bbox: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
}

const INDIA_RINGS_WITH_BBOX: RingWithBBox[] = (() => {
  try {
    const coords = (indiaGeoData as any).features[0].geometry.coordinates;
    return coords.map((p: any) => {
      const ring: number[][] = p[0];
      let minX = 180, maxX = -180, minY = 90, maxY = -90;
      for (let i = 0; i < ring.length; i++) {
        const pt = ring[i];
        if (pt[0] < minX) minX = pt[0];
        if (pt[0] > maxX) maxX = pt[0];
        if (pt[1] < minY) minY = pt[1];
        if (pt[1] > maxY) maxY = pt[1];
      }
      return { ring, bbox: [minX, minY, maxX, maxY] };
    });
  } catch {
    return [];
  }
})();

export function isInsideIndia(lat: number, lng: number): boolean {
  // Broad outer bounding box rejection
  if (lat < 6.7 || lat > 37.5 || lng < 68.0 || lng > 97.5) return false;
  if (INDIA_RINGS_WITH_BBOX.length === 0) {
    return lat >= 8.0 && lat <= 36.5 && lng >= 68.5 && lng <= 97.0;
  }

  for (let r = 0; r < INDIA_RINGS_WITH_BBOX.length; r++) {
    const { ring, bbox } = INDIA_RINGS_WITH_BBOX[r];
    if (lng < bbox[0] || lng > bbox[2] || lat < bbox[1] || lat > bbox[3]) continue;
    
    // Ray-casting algorithm
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0], yi = ring[i][1];
      const xj = ring[j][0], yj = ring[j][1];
      const intersect = ((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    if (inside) return true;
  }
  return false;
}

// Haversine distance in km
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Continuous Meteorological Field Computation ──────────────────────────────
export function computeThunderProbability(
  lat: number,
  lng: number,
  cells: StormCell[],
  minuteOffset = 0
): number {
  if (lat < 6.5 || lat > 37.5 || lng < 67.5 || lng > 98.0) return 0;

  // Regional baseline instability across Indian climate zones
  // 1. Monsoon Trough & Eastern Plains (continuous elliptical Gaussian)
  const dTrough = Math.pow((lat - 24.5) / 4.0, 2) + Math.pow((lng - 84.0) / 8.0, 2);
  const trough = 0.22 * Math.exp(-dTrough);

  // 2. Northeast India / Assam Valley (continuous Gaussian)
  const dNE = Math.pow((lat - 26.0) / 3.0, 2) + Math.pow((lng - 92.5) / 4.0, 2);
  const ne = 0.24 * Math.exp(-dNE);

  // 3. Western Ghats / Coastal Karnataka & Kerala (continuous ridge Gaussian)
  const latClamped = Math.max(8.5, Math.min(18.5, lat));
  const dGhats = Math.pow((lat - latClamped) / 2.0, 2) + Math.pow((lng - 75.0) / 2.5, 2);
  const ghats = 0.18 * Math.exp(-dGhats);

  // 4. Arid Northwest / Thar Desert (smooth dry reduction)
  const dDry = Math.pow((lat - 27.0) / 4.0, 2) + Math.pow((lng - 71.0) / 4.0, 2);
  const dry = 0.08 * Math.exp(-dDry);

  // Smooth regional base field across India (continuous, zero step edges)
  const base = Math.max(0.04, Math.min(0.45, 0.10 + trough + ne + ghats - dry));

  // Active Convective Storm Cells contribution (Gaussian field)
  let stormMax = 0;
  for (let i = 0; i < cells.length; i++) {
    const c = cells[i];
    const dLat = (lat - c.center.lat) * 111;
    const dLng = (lng - c.center.lng) * 102;
    const distSq = dLat * dLat + dLng * dLng;

    const sigma = Math.max(35, c.radius * 0.95);
    const peakProb = Math.min(0.92, (c.intensity / 65) * 0.88);
    const contrib = peakProb * Math.exp(-distSq / (2 * sigma * sigma));
    if (contrib > stormMax) {
      stormMax = contrib;
    }
  }

  const combined = base + stormMax * (1 - base * 0.5);
  const factor = minuteOffset > 0 ? Math.max(0.65, 1 - (minuteOffset / 320)) : 1;
  return Math.min(0.98, combined * factor);
}

// ─── Detailed Point Inspector for Map Clicks & Probes ─────────────────────────
export function getPointThunderDetails(
  lat: number,
  lng: number,
  cells: StormCell[],
  minuteOffset = 0
): PointProbabilityInfo {
  const prob = computeThunderProbability(lat, lng, cells, minuteOffset);
  const percentage = Math.round(prob * 100);

  // Find nearest storm cell and distance
  let nearestCell = cells[0];
  let minDist = Infinity;
  for (let i = 0; i < cells.length; i++) {
    const d = haversineKm(lat, lng, cells[i].center.lat, cells[i].center.lng);
    if (d < minDist) {
      minDist = d;
      nearestCell = cells[i];
    }
  }

  let riskCategory: PointProbabilityInfo['riskCategory'] = 'Nil';
  let riskColor = '#64748b';
  let lightningRisk: PointProbabilityInfo['lightningRisk'] = 'None';

  if (percentage >= 85) {
    riskCategory = 'Extreme';
    riskColor = '#a855f7'; // purple
    lightningRisk = 'High';
  } else if (percentage >= 70) {
    riskCategory = 'Severe';
    riskColor = '#ef4444'; // red
    lightningRisk = 'High';
  } else if (percentage >= 50) {
    riskCategory = 'High';
    riskColor = '#f97316'; // orange
    lightningRisk = 'Moderate';
  } else if (percentage >= 35) {
    riskCategory = 'Moderate';
    riskColor = '#eab308'; // yellow
    lightningRisk = 'Moderate';
  } else if (percentage >= 20) {
    riskCategory = 'Slight';
    riskColor = '#22c55e'; // green
    lightningRisk = 'Low';
  } else if (percentage >= 10) {
    riskCategory = 'Low';
    riskColor = '#0ea5e9'; // cyan
    lightningRisk = 'Low';
  } else {
    riskCategory = 'Nil';
    riskColor = '#64748b';
    lightningRisk = 'None';
  }

  const cape = Math.round(500 + prob * 2800);
  const reflectivity = Math.round(Math.max(10, prob * 62));
  const trend: PointProbabilityInfo['trend'] =
    minuteOffset > 30 ? 'Weakening' : nearestCell.intensity > 50 ? 'Intensifying' : 'Stable';

  return {
    lat: Number(lat.toFixed(3)),
    lng: Number(lng.toFixed(3)),
    probability: Number(prob.toFixed(3)),
    percentage,
    riskCategory,
    riskColor,
    nearestFeature: `${nearestCell.name} (${Math.round(minDist)} km)`,
    distanceToStormKm: Math.round(minDist),
    cape,
    reflectivity,
    lightningRisk,
    trend,
  };
}

// Grid generator for compatibility
export function generateProbabilityGrid(cells: StormCell[], minuteOffset = 0): ProbabilityCell[] {
  const result: ProbabilityCell[] = [];
  for (let lat = HEATMAP_LAT_MIN; lat <= HEATMAP_LAT_MAX; lat += 0.8) {
    for (let lng = HEATMAP_LNG_MIN; lng <= HEATMAP_LNG_MAX; lng += 0.8) {
      if (!isInsideIndia(lat, lng)) continue;
      const probability = computeThunderProbability(lat, lng, cells, minuteOffset);
      result.push({ lat, lng, probability });
    }
  }
  return result;
}

export const MOCK_PROBABILITY_GRID: ProbabilityCell[] = generateProbabilityGrid(MOCK_STORM_CELLS, 0);


// ─── Lightning Strikes (inside India) ─────────────────────────────────────────
const now = Date.now();

export const MOCK_LIGHTNING_STRIKES: LightningStrike[] = [
  { id: 'ls-1',  position: { lat: 25.61, lng: 85.12 }, timestamp: now - 120000, intensity: 5, type: 'cloud-ground' },
  { id: 'ls-2',  position: { lat: 25.59, lng: 85.08 }, timestamp: now - 90000,  intensity: 4, type: 'cloud-ground' },
  { id: 'ls-3',  position: { lat: 25.63, lng: 85.15 }, timestamp: now - 60000,  intensity: 5, type: 'cloud-ground' },
  { id: 'ls-4',  position: { lat: 25.58, lng: 85.18 }, timestamp: now - 45000,  intensity: 3, type: 'cloud-cloud'  },
  { id: 'ls-5',  position: { lat: 25.65, lng: 85.05 }, timestamp: now - 30000,  intensity: 4, type: 'cloud-ground' },
  { id: 'ls-6',  position: { lat: 25.62, lng: 85.22 }, timestamp: now - 20000,  intensity: 5, type: 'cloud-ground' },
  { id: 'ls-7',  position: { lat: 25.57, lng: 85.09 }, timestamp: now - 10000,  intensity: 3, type: 'cloud-cloud'  },
  { id: 'ls-8',  position: { lat: 25.64, lng: 85.14 }, timestamp: now - 5000,   intensity: 5, type: 'cloud-ground' },
  { id: 'ls-9',  position: { lat: 24.82, lng: 84.32 }, timestamp: now - 180000, intensity: 3, type: 'cloud-ground' },
  { id: 'ls-10', position: { lat: 24.79, lng: 84.28 }, timestamp: now - 150000, intensity: 4, type: 'cloud-ground' },
  { id: 'ls-11', position: { lat: 24.85, lng: 84.35 }, timestamp: now - 70000,  intensity: 2, type: 'cloud-cloud'  },
  { id: 'ls-12', position: { lat: 24.78, lng: 84.42 }, timestamp: now - 40000,  intensity: 3, type: 'cloud-ground' },
  { id: 'ls-13', position: { lat: 26.14, lng: 86.48 }, timestamp: now - 200000, intensity: 2, type: 'cloud-cloud'  },
  { id: 'ls-14', position: { lat: 26.08, lng: 86.52 }, timestamp: now - 130000, intensity: 2, type: 'cloud-ground' },
  { id: 'ls-15', position: { lat: 22.35, lng: 87.18 }, timestamp: now - 90000,  intensity: 4, type: 'cloud-ground' },
  { id: 'ls-16', position: { lat: 22.28, lng: 87.24 }, timestamp: now - 55000,  intensity: 3, type: 'cloud-ground' },
  { id: 'ls-17', position: { lat: 20.92, lng: 85.02 }, timestamp: now - 75000,  intensity: 4, type: 'cloud-ground' },
  { id: 'ls-18', position: { lat: 20.85, lng: 84.96 }, timestamp: now - 35000,  intensity: 3, type: 'cloud-ground' },
];

// ─── Radar Frames ─────────────────────────────────────────────────────────────
function shiftCells(cells: StormCell[], latOff: number, lngOff: number, intensityScale: number): StormCell[] {
  return cells.map(c => ({
    ...c,
    center: { lat: c.center.lat + latOff, lng: c.center.lng + lngOff },
    intensity: Math.min(70, Math.max(5, c.intensity * intensityScale)),
  }));
}

export const MOCK_RADAR_FRAMES: RadarFrame[] = [
  { timestamp: now - 3600000, minuteOffset: -60, cells: shiftCells(MOCK_STORM_CELLS, -0.5, -0.8, 0.6),  strikes: MOCK_LIGHTNING_STRIKES.filter(s => s.timestamp < now - 3000000) },
  { timestamp: now - 2700000, minuteOffset: -45, cells: shiftCells(MOCK_STORM_CELLS, -0.35, -0.55, 0.72), strikes: MOCK_LIGHTNING_STRIKES.filter(s => s.timestamp < now - 2000000) },
  { timestamp: now - 1800000, minuteOffset: -30, cells: shiftCells(MOCK_STORM_CELLS, -0.22, -0.35, 0.82), strikes: MOCK_LIGHTNING_STRIKES.filter(s => s.timestamp < now - 1000000) },
  { timestamp: now - 900000,  minuteOffset: -15, cells: shiftCells(MOCK_STORM_CELLS, -0.1, -0.15, 0.92),  strikes: MOCK_LIGHTNING_STRIKES.filter(s => s.timestamp < now - 300000)  },
  { timestamp: now,            minuteOffset: 0,   cells: MOCK_STORM_CELLS, strikes: MOCK_LIGHTNING_STRIKES },
  { timestamp: now + 1800000, minuteOffset: 30,   cells: shiftCells(MOCK_STORM_CELLS, 0.12, 0.18, 1.05),  strikes: [] },
  { timestamp: now + 3600000, minuteOffset: 60,   cells: shiftCells(MOCK_STORM_CELLS, 0.22, 0.35, 1.08),  strikes: [] },
  { timestamp: now + 5400000, minuteOffset: 90,   cells: shiftCells(MOCK_STORM_CELLS, 0.3,  0.50, 1.03),  strikes: [] },
  { timestamp: now + 7200000, minuteOffset: 120,  cells: shiftCells(MOCK_STORM_CELLS, 0.38, 0.62, 0.95),  strikes: [] },
];

// ─── Atmospheric Data ─────────────────────────────────────────────────────────
export const MOCK_ATMOSPHERIC_DATA: AtmosphericData = {
  windSpeed: 68,
  windDirection: 'WNW',
  capeIndex: 3100,
  liftedIndex: -6.4,
  precipitableWater: 58,
  dewPoint: 24.2,
  temperature: 31.5,
};

// ─── Alerts ───────────────────────────────────────────────────────────────────
export const MOCK_ALERTS: WeatherAlert[] = [
  {
    id: 'alert-1',
    type: 'urgent',
    title: 'URGENT: SEVERE WEATHER ALERT',
    description: 'High Risk: Area Patna. Severe Thunderstorm & Frequent Lightning. Immediate Action Advised.',
    affectedAreas: ['Patna', 'Khagaul', 'Phulwari Sharif'],
    issuedAt: now - 900000,
    expiresAt: now + 5400000,
    isActive: true,
  },
  {
    id: 'alert-2',
    type: 'warning',
    title: 'LIGHTNING WARNING',
    description: 'Elevated lightning over Gaya district. Outdoor activities discouraged.',
    affectedAreas: ['Gaya', 'Bodh Gaya', 'Jehanabad'],
    issuedAt: now - 1800000,
    expiresAt: now + 3600000,
    isActive: true,
  },
  {
    id: 'alert-3',
    type: 'watch',
    title: 'THUNDERSTORM WATCH',
    description: 'Conditions favorable for storm development over Midnapore & Odisha coast.',
    affectedAreas: ['Midnapore', 'Balasore', 'Bhubaneswar'],
    issuedAt: now - 3600000,
    expiresAt: now + 7200000,
    isActive: true,
  },
];

// ─── Lightning Frequency Chart ─────────────────────────────────────────────────
export const MOCK_LIGHTNING_CHART_DATA: LightningChartPoint[] = [
  { time: '-60m', strikes: 3,  predicted: false },
  { time: '-50m', strikes: 5,  predicted: false },
  { time: '-40m', strikes: 8,  predicted: false },
  { time: '-30m', strikes: 14, predicted: false },
  { time: '-20m', strikes: 22, predicted: false },
  { time: '-10m', strikes: 31, predicted: false },
  { time: 'NOW',  strikes: 38, predicted: false },
  { time: '+10m', strikes: 42, predicted: true  },
  { time: '+20m', strikes: 45, predicted: true  },
  { time: '+30m', strikes: 41, predicted: true  },
  { time: '+40m', strikes: 35, predicted: true  },
  { time: '+50m', strikes: 27, predicted: true  },
  { time: '+60m', strikes: 19, predicted: true  },
];

// ─── Situation Report ─────────────────────────────────────────────────────────
export const MOCK_SITUATION_REPORT: SituationReport = {
  activeStormCells: 6,
  affectedAreas: ['Patna', 'Gaya', 'Midnapore', 'Bhubaneswar'],
  activeRequests: [],
  totalLightningStrikes: 247,
  flightAdvisories: 3,
  groundStops: 1,
};

// ─── Map Layers ───────────────────────────────────────────────────────────────
// Only Radar, Heatmap and Lightning are on by default.
export const MOCK_MAP_LAYERS: MapLayer[] = [
  { id: 'heatmap',   label: 'Thunder Probability', icon: '🌡️', color: '#ef4444', enabled: true  },
  { id: 'radar',     label: 'Doppler Radar',        icon: '📡', color: '#2ecc71', enabled: true  },
  { id: 'lightning', label: 'Lightning Sensors',    icon: '⚡', color: '#f9ca24', enabled: true  },
];
