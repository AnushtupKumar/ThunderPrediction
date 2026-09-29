'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import RadarOverlay from './RadarOverlay';
import LightningMarkers from './LightningMarkers';
import ProbabilityHeatmap from './ProbabilityHeatmap';
import { RadarFrame, ProbabilityCell, PointProbabilityInfo } from '@/types';
import { isInsideIndia, getPointThunderDetails } from '@/lib/mockData';
import indiaGeoData from '@/data/india-simplified.json';
import {
  DARK_TILE_URL, DARK_TILE_ATTRIBUTION,
} from '@/lib/constants';
import styles from './MapContainer.module.css';

interface MapContainerProps {
  frame: RadarFrame;
  probabilityCells: ProbabilityCell[];
  showRadar: boolean;
  showLightning: boolean;
  showHeatmap: boolean;
  showLayersPanel?: boolean;
  showAnalyticsPanel?: boolean;
  onToggleLayers?: () => void;
  onToggleAnalytics?: () => void;
}

export default function MapContainer({
  frame,
  probabilityCells,
  showRadar,
  showLightning,
  showHeatmap,
  showLayersPanel = false,
  showAnalyticsPanel = false,
  onToggleLayers,
  onToggleAnalytics,
}: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const probeMarkerRef = useRef<L.Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Live Hover Probe state
  const [hoverInfo, setHoverInfo] = useState<{
    lat: number;
    lng: number;
    percentage: number;
    riskCategory: string;
    riskColor: string;
  } | null>(null);

  // Pinned Click Probe state
  const [pinnedProbe, setPinnedProbe] = useState<PointProbabilityInfo | null>(null);

  // Initialize Leaflet Map focused strictly on India
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Tight India geographical bounding box for viewport fitting
    const southWest: [number, number] = [8.0, 68.0];
    const northEast: [number, number] = [36.5, 96.5];
    const indiaBounds = L.latLngBounds(southWest, northEast);

    const maxSW: [number, number] = [5.5, 65.5];
    const maxNE: [number, number] = [38.0, 99.0];
    const maxIndiaBounds = L.latLngBounds(maxSW, maxNE);

    const map = L.map(mapRef.current, {
      center: [22.5, 82.0],
      zoom: 5,
      minZoom: 4,
      maxZoom: 11,
      zoomControl: false,
      attributionControl: false,
      maxBounds: maxIndiaBounds,
      maxBoundsViscosity: 1.0, // Hard stop at boundaries
    });

    // Fit view to India tightly
    map.fitBounds(indiaBounds, { padding: [8, 8] });

    // Dark sleek basemap
    L.tileLayer(DARK_TILE_URL, {
      attribution: DARK_TILE_ATTRIBUTION,
      maxZoom: 18,
      subdomains: 'abcd',
    }).addTo(map);

    // Zoom control on top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Minimal attribution bottom-left
    L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map);

    // ── Inverted Outer Mask: Darken rest of the world so India stands out ─────
    try {
      const worldRing: [number, number][] = [
        [-90, -180], [90, -180], [90, 180], [-90, 180], [-90, -180],
      ];
      const holes: [number, number][][] = [];
      const coords = (indiaGeoData as any).features[0].geometry.coordinates;
      for (let i = 0; i < coords.length; i++) {
        const ring = coords[i][0];
        if (ring.length >= 3) {
          holes.push(ring.map((pt: number[]) => [pt[1], pt[0]]));
        }
      }

      L.polygon([worldRing, ...holes], {
        fillColor: '#030712',
        fillOpacity: 0.72,
        stroke: false,
        interactive: false,
      }).addTo(map);

      // Glowing India National Boundary
      L.geoJSON(indiaGeoData as any, {
        style: {
          color: '#38bdf8',
          weight: 1.8,
          opacity: 0.85,
          fill: false,
        },
        interactive: false,
      }).addTo(map);
    } catch (e) {
      console.error('Failed to load India boundary mask:', e);
    }

    // Leaflet global styles
    if (!document.getElementById('leaflet-nowcast-css')) {
      const style = document.createElement('style');
      style.id = 'leaflet-nowcast-css';
      style.textContent = `
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.5) !important;
          border-radius: 8px !important;
          overflow: hidden;
        }
        .leaflet-control-zoom a {
          background: rgba(15,23,42,0.92) !important;
          color: #94a3b8 !important;
          border: 1px solid rgba(56,189,248,0.2) !important;
          width: 30px !important;
          height: 30px !important;
          line-height: 30px !important;
          font-size: 15px !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(56,189,248,0.2) !important;
          color: #38bdf8 !important;
        }
        .leaflet-control-attribution {
          background: rgba(10,15,30,0.6) !important;
          color: #334155 !important;
          font-size: 9px !important;
        }
      `;
      document.head.appendChild(style);
    }

    mapInstanceRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Handle map clicks and mouse moves for Point Probing
  const handleMapMove = useCallback(
    (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (!isInsideIndia(lat, lng)) {
        setHoverInfo(null);
        return;
      }
      const details = getPointThunderDetails(lat, lng, frame.cells, frame.minuteOffset);
      setHoverInfo({
        lat: Number(lat.toFixed(2)),
        lng: Number(lng.toFixed(2)),
        percentage: details.percentage,
        riskCategory: details.riskCategory,
        riskColor: details.riskColor,
      });
    },
    [frame]
  );

  const handleMapClick = useCallback(
    (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (!isInsideIndia(lat, lng)) return;

      const details = getPointThunderDetails(lat, lng, frame.cells, frame.minuteOffset);
      setPinnedProbe(details);

      // Place or move pulsing marker pin on map
      const map = mapInstanceRef.current;
      if (!map) return;

      if (probeMarkerRef.current) {
        probeMarkerRef.current.setLatLng([lat, lng]);
      } else {
        const pinIcon = L.divIcon({
          className: 'probe-marker-pin',
          html: '<div class="probe-marker-center"></div><div class="probe-marker-ring"></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
        probeMarkerRef.current = marker;
      }
    },
    [frame]
  );

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.on('mousemove', handleMapMove);
    map.on('click', handleMapClick);

    return () => {
      map.off('mousemove', handleMapMove);
      map.off('click', handleMapClick);
    };
  }, [handleMapMove, handleMapClick]);

  // Dismiss pinned probe
  const dismissProbe = () => {
    setPinnedProbe(null);
    if (probeMarkerRef.current && mapInstanceRef.current) {
      probeMarkerRef.current.remove();
      probeMarkerRef.current = null;
    }
  };

  return (
    <div className={styles.wrapper}>
      <div ref={mapRef} className={styles.map} />

      {/* Top Floating Control Bar */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          {onToggleLayers && (
            <button
              onClick={onToggleLayers}
              className={`${styles.glassBtn} ${showLayersPanel ? styles.glassBtnActive : ''}`}
              title="Toggle Layer Settings"
            >
              <span>🗺️ Layers</span>
              <span className={styles.badgeDot} />
            </button>
          )}
        </div>

        <div className={styles.topCenter}>
          {hoverInfo ? (
            <div className={styles.hoverProbeHUD}>
              <span>📍 {hoverInfo.lat}°N, {hoverInfo.lng}°E</span>
              <span
                className={styles.probeProbTag}
                style={{ backgroundColor: hoverInfo.riskColor }}
              >
                {hoverInfo.percentage}% Thunder Prob
              </span>
            </div>
          ) : (
            <div className={styles.frameBadge}>
              {frame.minuteOffset === 0
                ? '🟢 LIVE NOWCAST — INDIA'
                : frame.minuteOffset < 0
                ? `📼 ${Math.abs(frame.minuteOffset)}m AGO`
                : `🔮 +${frame.minuteOffset}m FORECAST`}
            </div>
          )}
        </div>

        <div className={styles.topRight}>
          {onToggleAnalytics && (
            <button
              onClick={onToggleAnalytics}
              className={`${styles.glassBtn} ${showAnalyticsPanel ? styles.glassBtnActive : ''}`}
              title="Toggle Regional Analytics"
            >
              <span>📊 Analytics</span>
            </button>
          )}
        </div>
      </div>

      {mapReady && mapInstanceRef.current && (
        <>
          {/* Continuous meteorological heatmap strictly clipped to India */}
          <ProbabilityHeatmap
            map={mapInstanceRef.current}
            stormCells={frame.cells}
            minuteOffset={frame.minuteOffset}
            cells={probabilityCells}
            visible={showHeatmap}
          />

          {/* Doppler radar echoes */}
          <RadarOverlay
            map={mapInstanceRef.current}
            cells={frame.cells}
            visible={showRadar}
          />

          {/* Lightning sensors */}
          <LightningMarkers
            map={mapInstanceRef.current}
            strikes={frame.strikes}
            visible={showLightning}
          />
        </>
      )}

      {/* Interactive Pinned Point Probability Inspection Card */}
      {pinnedProbe && (
        <div className={styles.probeCard}>
          <div className={styles.probeCardHeader}>
            <div>
              <div className={styles.probeCardTitle}>
                <span>⚡ PROBE POINT NOWCAST</span>
              </div>
              <div className={styles.probeCoords}>
                {pinnedProbe.lat}°N, {pinnedProbe.lng}°E
              </div>
            </div>
            <button
              onClick={dismissProbe}
              className={styles.closeProbeBtn}
              title="Close Probe"
            >
              ✕
            </button>
          </div>

          <div className={styles.probeMainMetric}>
            <div>
              <span className={styles.probeGridLabel}>Thunder Probability</span>
              <div
                className={styles.probeProbValue}
                style={{ color: pinnedProbe.riskColor }}
              >
                {pinnedProbe.percentage}%
              </div>
            </div>
            <div
              className={styles.probeRiskPill}
              style={{ backgroundColor: pinnedProbe.riskColor }}
            >
              {pinnedProbe.riskCategory} Risk
            </div>
          </div>

          <div className={styles.probeGrid}>
            <div className={styles.probeGridItem}>
              <span className={styles.probeGridLabel}>CAPE Index</span>
              <div className={styles.probeGridValue}>{pinnedProbe.cape} J/kg</div>
            </div>
            <div className={styles.probeGridItem}>
              <span className={styles.probeGridLabel}>Reflectivity</span>
              <div className={styles.probeGridValue}>{pinnedProbe.reflectivity} dBZ</div>
            </div>
            <div className={styles.probeGridItem}>
              <span className={styles.probeGridLabel}>Lightning Threat</span>
              <div className={styles.probeGridValue}>{pinnedProbe.lightningRisk}</div>
            </div>
            <div className={styles.probeGridItem}>
              <span className={styles.probeGridLabel}>Nowcast Trend</span>
              <div className={styles.probeGridValue}>{pinnedProbe.trend}</div>
            </div>
          </div>

          <div className={styles.probeFeatureBar}>
            <span>🎯 Nearest storm:</span>
            <strong>{pinnedProbe.nearestFeature}</strong>
          </div>
        </div>
      )}

      {/* Meteorological Probability Legend */}
      {showHeatmap && (
        <div className={styles.legend}>
          <div className={styles.legendTitle}>
            <span>Thunderstorm Probability</span>
            <span className={styles.legendTitleTag}>IMD Scale</span>
          </div>
          <div className={styles.legendBar}>
            <div className={styles.legendGradient} />
            <div className={styles.legendLabels}>
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
