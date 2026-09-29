// ─── Core Geographic Types ────────────────────────────────────────────────────
export interface LatLng {
  lat: number;
  lng: number;
}

// ─── Storm Cell ───────────────────────────────────────────────────────────────
export type SeverityLevel = 'low' | 'moderate' | 'high' | 'extreme';

export interface StormCell {
  id: string;
  center: LatLng;
  radius: number;           // km
  intensity: number;        // dBZ value 0-70
  severity: SeverityLevel;
  name: string;
  speed: number;            // km/h
  direction: string;        // e.g. "NNE"
  capeIndex: number;        // J/kg
  lightningRate: number;    // strikes/min
}

// ─── Lightning Strike ─────────────────────────────────────────────────────────
export interface LightningStrike {
  id: string;
  position: LatLng;
  timestamp: number;        // epoch ms
  intensity: number;        // 1–5
  type: 'cloud-ground' | 'cloud-cloud';
}

// ─── Radar Frame ──────────────────────────────────────────────────────────────
export interface RadarFrame {
  timestamp: number;        // epoch ms relative offset in minutes from "now"
  minuteOffset: number;     // negative = past, positive = future
  cells: StormCell[];
  strikes: LightningStrike[];
}

// ─── NWP / Environmental Data ─────────────────────────────────────────────────
export interface AtmosphericData {
  windSpeed: number;        // km/h
  windDirection: string;
  capeIndex: number;        // J/kg
  liftedIndex: number;
  precipitableWater: number; // mm
  dewPoint: number;          // °C
  temperature: number;       // °C
}

// ─── Alert ────────────────────────────────────────────────────────────────────
export type AlertType = 'urgent' | 'warning' | 'watch' | 'advisory';

export interface WeatherAlert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  affectedAreas: string[];
  issuedAt: number;
  expiresAt: number;
  isActive: boolean;
}

// ─── Chart Data ───────────────────────────────────────────────────────────────
export interface LightningChartPoint {
  time: string;
  strikes: number;
  predicted: boolean;
}

// ─── Layer Controls ───────────────────────────────────────────────────────────
export interface MapLayer {
  id: string;
  label: string;
  icon: string;
  color: string;
  enabled: boolean;
}

// ─── Situation Report ─────────────────────────────────────────────────────────
export interface SituationReport {
  activeStormCells: number;
  affectedAreas: string[];
  activeRequests: string[];
  totalLightningStrikes: number;
  flightAdvisories: number;
  groundStops: number;
}

// ─── Nowcast Prediction ───────────────────────────────────────────────────────
export interface NowcastPrediction {
  minuteOffset: number;
  probabilityGrid: ProbabilityCell[];
  confidence: number;       // 0-1
}

export interface ProbabilityCell {
  lat: number;
  lng: number;
  probability: number;      // 0-1
}

// ─── Interactive Point Probability Probe ──────────────────────────────────────
export interface PointProbabilityInfo {
  lat: number;
  lng: number;
  probability: number;      // 0-1
  percentage: number;       // 0-100
  riskCategory: 'Extreme' | 'Severe' | 'High' | 'Moderate' | 'Slight' | 'Low' | 'Nil';
  riskColor: string;
  nearestFeature: string;
  distanceToStormKm: number;
  cape: number;             // J/kg
  reflectivity: number;     // dBZ
  lightningRisk: 'High' | 'Moderate' | 'Low' | 'None';
  trend: 'Intensifying' | 'Stable' | 'Weakening';
}

