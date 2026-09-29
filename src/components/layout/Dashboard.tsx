'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import styles from './Dashboard.module.css';
import Header from '@/components/layout/Header';
import LayerPanel from '@/components/panels/LayerPanel';
import AnalyticsPanel from '@/components/panels/AnalyticsPanel';
import NowcastTimeline from '@/components/timeline/NowcastTimeline';
import { useNowcastTime } from '@/hooks/useNowcastTime';
import { useMapLayers } from '@/hooks/useMapLayers';
import { generateProbabilityGrid } from '@/lib/mockData';

// Leaflet must be dynamically imported (no SSR)
const MapContainer = dynamic(() => import('@/components/map/MapContainer'), {
  ssr: false,
  loading: () => (
    <div className={styles.mapLoading}>
      <div className={styles.mapLoadingSpinner} />
      <span>Initialising IMD India Doppler &amp; Nowcast Radar Systems…</span>
    </div>
  ),
});

export default function Dashboard() {
  const {
    currentFrame, currentMinute, isPlaying,
    frameIndex, totalFrames, setFrameIndex, togglePlay,
  } = useNowcastTime();

  const { layers, toggleLayer } = useMapLayers();

  // Hidden by default for distraction-free India focus
  const [showLayersPanel, setShowLayersPanel] = useState(false);
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false);

  const layerMap = useMemo(
    () => Object.fromEntries(layers.map(l => [l.id, l.enabled])),
    [layers]
  );

  const probabilityCells = useMemo(
    () => generateProbabilityGrid(currentFrame.cells, currentFrame.minuteOffset),
    [currentFrame]
  );

  return (
    <div className={styles.dashboardRoot}>
      <Header />

      <div className={styles.body}>
        {/* Floating Collapsible Layer Panel (Hidden by default) */}
        {showLayersPanel && (
          <div className={styles.drawerLeft}>
            <LayerPanel
              layers={layers}
              onToggle={toggleLayer}
              onClose={() => setShowLayersPanel(false)}
            />
          </div>
        )}

        <main className={styles.main}>
          <MapContainer
            frame={currentFrame}
            probabilityCells={probabilityCells}
            showHeatmap={layerMap['heatmap'] ?? true}
            showRadar={layerMap['radar'] ?? true}
            showLightning={layerMap['lightning'] ?? true}
            showLayersPanel={showLayersPanel}
            showAnalyticsPanel={showAnalyticsPanel}
            onToggleLayers={() => setShowLayersPanel(p => !p)}
            onToggleAnalytics={() => setShowAnalyticsPanel(p => !p)}
          />
        </main>

        {/* Floating Collapsible Analytics Panel (Hidden by default) */}
        {showAnalyticsPanel && (
          <div className={styles.drawerRight}>
            <AnalyticsPanel
              onClose={() => setShowAnalyticsPanel(false)}
            />
          </div>
        )}
      </div>

      <NowcastTimeline
        frameIndex={frameIndex}
        totalFrames={totalFrames}
        currentMinute={currentMinute}
        isPlaying={isPlaying}
        onFrameChange={setFrameIndex}
        onTogglePlay={togglePlay}
      />
    </div>
  );
}
