'use client';

import styles from './AnalyticsPanel.module.css';
import AlertBanner from './AlertBanner';
import LightningChart from './LightningChart';
import WindMetrics from './WindMetrics';
import SituationReport from './SituationReport';
import { useAlerts } from '@/hooks/useAlerts';

interface AnalyticsPanelProps {
  onClose?: () => void;
}

export default function AnalyticsPanel({ onClose }: AnalyticsPanelProps) {
  const { currentAlert, dismissAlert } = useAlerts();

  return (
    <aside className={styles.panel}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
        <h3 className={styles.panelTitle} style={{ margin: 0 }}>Real-time Analytics</h3>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.85rem',
              padding: '2px 6px',
            }}
          >
            ✕
          </button>
        )}
      </div>

      <AlertBanner alert={currentAlert} onDismiss={dismissAlert} />

      <div className={styles.spacer} />
      <LightningChart />

      <div className={styles.spacer} />
      <WindMetrics />

      <div className={styles.spacer} />
      <SituationReport />
    </aside>
  );
}
