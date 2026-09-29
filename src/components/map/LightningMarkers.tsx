'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { LightningStrike } from '@/types';

interface LightningMarkersProps {
  map: L.Map | null;
  strikes: LightningStrike[];
  visible: boolean;
}

function createLightningIcon(intensity: number, isRecent: boolean): L.DivIcon {
  const size = 10 + intensity * 2;
  const color = isRecent ? '#fbbf24' : '#78716c';
  const glow = isRecent ? `0 0 ${intensity * 4}px ${color}` : 'none';
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      display:flex;align-items:center;justify-content:center;
      color:${color};font-size:${size + 2}px;line-height:1;
      filter:drop-shadow(${glow});
      transform:translate(-50%,-50%);
      animation:${isRecent ? 'lgFlash 0.8s ease-out' : 'none'};
    ">⚡</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function LightningMarkers({ map, strikes, visible }: LightningMarkersProps) {
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!map) return;
    if (!layerGroupRef.current) {
      layerGroupRef.current = L.layerGroup().addTo(map);
    }
  }, [map]);

  useEffect(() => {
    if (!map || !layerGroupRef.current) return;
    layerGroupRef.current.clearLayers();
    if (!visible) return;

    const now = Date.now();
    strikes.forEach(strike => {
      const age = now - strike.timestamp;
      const isRecent = age < 60000; // < 1 min
      const icon = createLightningIcon(strike.intensity, isRecent);

      L.marker([strike.position.lat, strike.position.lng], { icon, interactive: false })
        .addTo(layerGroupRef.current!);
    });
  }, [map, strikes, visible]);

  return null;
}
