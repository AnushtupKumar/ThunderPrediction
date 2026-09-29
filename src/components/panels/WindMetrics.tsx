'use client';

import styles from './WindMetrics.module.css';
import { MOCK_ATMOSPHERIC_DATA } from '@/lib/mockData';

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      <span className={`${styles.value} ${highlight ? styles.highlight : ''}`}>{value}</span>
    </div>
  );
}

export default function WindMetrics() {
  const d = MOCK_ATMOSPHERIC_DATA;
  const capeRisk = d.capeIndex >= 2500 ? 'Very High' : d.capeIndex >= 1500 ? 'High' : 'Moderate';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>Atmospheric Conditions</span>
        <span className={styles.icon}>🌪️</span>
      </div>
      <div className={styles.metrics}>
        <Row label="Wind" value={`${d.windSpeed} km/h ${d.windDirection}`} highlight={d.windSpeed > 60} />
        <Row label="CAPE" value={`${d.capeIndex.toLocaleString()} J/kg (${capeRisk})`} highlight={d.capeIndex >= 2500} />
        <Row label="Lifted Index" value={`${d.liftedIndex}`} highlight={d.liftedIndex <= -4} />
        <Row label="Dew Point" value={`${d.dewPoint}°C`} />
      </div>
    </div>
  );
}
