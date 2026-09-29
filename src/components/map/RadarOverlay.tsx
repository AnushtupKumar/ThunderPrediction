'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { StormCell } from '@/types';
import { RADAR_COLOR_SCALE, SEVERITY_COLORS } from '@/lib/constants';

interface RadarOverlayProps {
  map: L.Map | null;
  cells: StormCell[];
  visible: boolean;
}

function dBZtoColor(dbz: number): { color: string; opacity: number } {
  for (const scale of RADAR_COLOR_SCALE) {
    if (dbz >= scale.min && dbz < scale.max) {
      return { color: scale.color, opacity: scale.alpha };
    }
  }
  return { color: '#ffffff', opacity: 0.5 };
}

export default function RadarOverlay({ map, cells, visible }: RadarOverlayProps) {
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!map) return;
    if (!layerGroupRef.current) {
      layerGroupRef.current = L.layerGroup().addTo(map);
    }
    return () => {
      layerGroupRef.current?.clearLayers();
    };
  }, [map]);

  useEffect(() => {
    if (!map || !layerGroupRef.current) return;
    layerGroupRef.current.clearLayers();
    if (!visible) return;

    cells.forEach(cell => {
      // Outer glow ring
      const glowColor = SEVERITY_COLORS[cell.severity].bg;
      L.circle([cell.center.lat, cell.center.lng], {
        radius: cell.radius * 1000 * 1.3,
        color: glowColor,
        weight: 0,
        fillColor: glowColor,
        fillOpacity: 0.07,
        interactive: false,
      }).addTo(layerGroupRef.current!);

      // dBZ gradient rings (from edge to center, increasingly intense)
      const steps = 5;
      for (let i = steps; i >= 1; i--) {
        const fraction = i / steps;
        const interpolatedDbz = cell.intensity * fraction;
        const { color, opacity } = dBZtoColor(Math.max(interpolatedDbz, 5));
        L.circle([cell.center.lat, cell.center.lng], {
          radius: cell.radius * 1000 * fraction,
          color: 'transparent',
          weight: 0,
          fillColor: color,
          fillOpacity: opacity * (1 - fraction * 0.3),
          interactive: false,
        }).addTo(layerGroupRef.current!);
      }

      // Storm cell label
      const popup = L.popup({
        closeButton: false,
        className: 'radar-popup',
        maxWidth: 200,
      }).setContent(`
        <div style="font-family:monospace;font-size:11px;color:#e2e8f0;background:rgba(10,15,30,0.95);border:1px solid rgba(59,130,246,0.3);border-radius:6px;padding:8px 10px;">
          <div style="font-weight:700;color:#60a5fa;margin-bottom:4px;">${cell.name}</div>
          <div>Intensity: <span style="color:#f59e0b">${cell.intensity} dBZ</span></div>
          <div>Severity: <span style="color:${SEVERITY_COLORS[cell.severity].bg}">${cell.severity.toUpperCase()}</span></div>
          <div>Speed: ${cell.speed} km/h ${cell.direction}</div>
          <div>CAPE: ${cell.capeIndex.toLocaleString()} J/kg</div>
          <div>Lightning: ${cell.lightningRate} strikes/min</div>
        </div>
      `);

      const marker = L.circleMarker([cell.center.lat, cell.center.lng], {
        radius: 4,
        color: glowColor,
        weight: 2,
        fillColor: glowColor,
        fillOpacity: 1,
      })
        .bindPopup(popup)
        .addTo(layerGroupRef.current!);
    });
  }, [map, cells, visible]);

  return null;
}
