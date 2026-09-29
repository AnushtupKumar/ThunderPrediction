'use client';

import styles from './SituationReport.module.css';
import { MOCK_SITUATION_REPORT } from '@/lib/mockData';

export default function SituationReport() {
  const report = MOCK_SITUATION_REPORT;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>Situation Report</span>
        <span className={styles.icon}>📋</span>
      </div>

      <div className={styles.grid}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{report.activeStormCells}</span>
          <span className={styles.statLabel}>Active Cells</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{report.totalLightningStrikes}</span>
          <span className={styles.statLabel}>Strikes (1hr)</span>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statValue} ${styles.warning}`}>{report.flightAdvisories}</span>
          <span className={styles.statLabel}>Flight Adv.</span>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statValue} ${styles.danger}`}>{report.groundStops}</span>
          <span className={styles.statLabel}>Ground Stops</span>
        </div>
      </div>

      <div className={styles.row}>
        <span className={styles.rowLabel}>Affected Areas</span>
        <span className={styles.rowValue}>{report.affectedAreas.join(', ')}</span>
      </div>

      <div className={styles.row}>
        <span className={styles.rowLabel}>Active Requests</span>
        <span className={`${styles.rowValue} ${styles.muted}`}>
          {report.activeRequests.length === 0 ? 'No active requests.' : report.activeRequests.join(', ')}
        </span>
      </div>
    </div>
  );
}
