'use client';

/**
 * ProbabilityHeatmap — Industry-standard continuous meteorological field heatmap.
 *
 * 1. Computes continuous convective probability field across the visible area.
 * 2. Maps values to standard meteorological severe-storm color ramp (IMD/NWS style).
 * 3. Clips strictly to the geographic land boundary of India using vector geometry.
 * 4. Renders with hardware bilinear filtering for silky-smooth gradients with zero banding.
 */

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { StormCell, ProbabilityCell } from '@/types';
import { computeThunderProbability } from '@/lib/mockData';
import indiaGeoData from '@/data/india-simplified.json';

interface Props {
  map: L.Map | null;
  stormCells?: StormCell[];
  minuteOffset?: number;
  cells?: ProbabilityCell[];
  visible: boolean;
}

// ─── Pre-computed 256-step meteorological colour LUT ──────────────────────────
// Stop points: [probability (0..1), R, G, B, Alpha (0..255)]
const LUT_SIZE = 256;
const LUT = (() => {
  const stops: [number, number, number, number, number][] = [
    [0.00,   0,   0,   0,   0],   // 0% - Nil (transparent)
    [0.08,   0,   0,   0,   0],   // <8% - Clear / transparent
    [0.12,  14, 165, 233,  45],   // 12% - faint cool blue/cyan
    [0.22,  34, 197,  94,  95],   // 22% - soft emerald green
    [0.38, 234, 179,   8, 140],   // 38% - vivid yellow
    [0.55, 245, 158,  11, 180],   // 55% - deep amber
    [0.72, 239,  68,  68, 210],   // 72% - bright storm red
    [0.85, 220,  38,  38, 230],   // 85% - deep crimson red
    [1.00, 168,  85, 247, 245],   // 100% - severe convective magenta/purple
  ];

  const lut = new Uint8ClampedArray(LUT_SIZE * 4);

  for (let i = 0; i < LUT_SIZE; i++) {
    const t = i / (LUT_SIZE - 1);
    let lo = stops[0], hi = stops[stops.length - 1];
    for (let s = 0; s < stops.length - 1; s++) {
      if (t >= stops[s][0] && t <= stops[s + 1][0]) {
        lo = stops[s];
        hi = stops[s + 1];
        break;
      }
    }
    const f = lo[0] === hi[0] ? 0 : (t - lo[0]) / (hi[0] - lo[0]);
    lut[i * 4 + 0] = Math.round(lo[1] + f * (hi[1] - lo[1]));
    lut[i * 4 + 1] = Math.round(lo[2] + f * (hi[2] - lo[2]));
    lut[i * 4 + 2] = Math.round(lo[3] + f * (hi[3] - lo[3]));
    lut[i * 4 + 3] = Math.round(lo[4] + f * (hi[4] - lo[4]));
  }
  return lut;
})();

const INDIA_POLYGONS: number[][][] = (() => {
  try {
    const coords = (indiaGeoData as any).features[0].geometry.coordinates;
    return coords.map((p: any) => p[0]);
  } catch {
    return [];
  }
})();

function renderMeteorologicalHeatmap(
  canvas: HTMLCanvasElement,
  map: L.Map,
  stormCells: StormCell[],
  minuteOffset: number
) {
  const size = map.getSize();
  if (size.x <= 0 || size.y <= 0) return;

  canvas.width = size.x;
  canvas.height = size.y;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Offscreen resolution: 180x180 is computed in ~4ms and scaled smoothly by GPU
  const offW = 180;
  const offH = 180;
  const offscreen = document.createElement('canvas');
  offscreen.width = offW;
  offscreen.height = offH;
  const octx = offscreen.getContext('2d');
  if (!octx) return;

  const imgData = octx.createImageData(offW, offH);
  const data = imgData.data;

  // Sample the meteorological scalar field across the map view
  for (let y = 0; y < offH; y++) {
    const screenY = (y / (offH - 1)) * size.y;
    for (let x = 0; x < offW; x++) {
      const screenX = (x / (offW - 1)) * size.x;
      const latLng = map.containerPointToLatLng(L.point(screenX, screenY));

      const prob = computeThunderProbability(latLng.lat, latLng.lng, stormCells, minuteOffset);
      const lutIdx = Math.min(LUT_SIZE - 1, Math.max(0, Math.round(prob * (LUT_SIZE - 1))));

      const pixelIdx = (y * offW + x) * 4;
      data[pixelIdx + 0] = LUT[lutIdx * 4 + 0];
      data[pixelIdx + 1] = LUT[lutIdx * 4 + 1];
      data[pixelIdx + 2] = LUT[lutIdx * 4 + 2];
      data[pixelIdx + 3] = LUT[lutIdx * 4 + 3];
    }
  }

  octx.putImageData(imgData, 0, 0);

  // Clear visible canvas
  ctx.clearRect(0, 0, size.x, size.y);

  // ── Clip rendering STRICTLY to India boundary ──────────────────────────────
  ctx.save();
  ctx.beginPath();
  for (let r = 0; r < INDIA_POLYGONS.length; r++) {
    const ring = INDIA_POLYGONS[r];
    if (ring.length < 3) continue;
    for (let i = 0; i < ring.length; i++) {
      const pt = map.latLngToContainerPoint([ring[i][1], ring[i][0]]);
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
  }
  ctx.closePath();
  ctx.clip();

  // Draw offscreen smooth meteorological raster with hardware bilinear upscaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(offscreen, 0, 0, size.x, size.y);
  ctx.restore();
}

export default function ProbabilityHeatmap({
  map,
  stormCells = [],
  minuteOffset = 0,
  visible,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const paramsRef = useRef({ stormCells, minuteOffset });
  paramsRef.current = { stormCells, minuteOffset };

  useEffect(() => {
    if (!map) return;

    const container = map.getContainer();
    const canvas = document.createElement('canvas');
    canvas.style.cssText =
      'position:absolute;top:0;left:0;pointer-events:none;z-index:400;transition:opacity 0.2s ease;';
    container.appendChild(canvas);
    canvasRef.current = canvas;

    const redraw = () => {
      if (visible && canvasRef.current) {
        renderMeteorologicalHeatmap(
          canvasRef.current,
          map,
          paramsRef.current.stormCells,
          paramsRef.current.minuteOffset
        );
      }
    };

    const handleMoveStart = () => {
      // Keep canvas visible or slightly dimmed during smooth panning
      if (canvasRef.current) canvasRef.current.style.opacity = '0.7';
    };

    const handleMoveEnd = () => {
      if (canvasRef.current) canvasRef.current.style.opacity = '1';
      redraw();
    };

    map.on('movestart', handleMoveStart);
    map.on('moveend zoomend resize', handleMoveEnd);

    if (visible) redraw();

    return () => {
      map.off('movestart', handleMoveStart);
      map.off('moveend zoomend resize', handleMoveEnd);
      canvas.remove();
      canvasRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // Update on frame or visibility change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !map) return;

    if (visible) {
      canvas.style.display = 'block';
      renderMeteorologicalHeatmap(canvas, map, stormCells, minuteOffset);
    } else {
      canvas.style.display = 'none';
    }
  }, [map, visible, stormCells, minuteOffset]);

  return null;
}
