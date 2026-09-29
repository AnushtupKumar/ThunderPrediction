'use client';

import styles from './AlertBanner.module.css';
import { WeatherAlert, AlertType } from '@/types';
import { ALERT_COLORS } from '@/lib/constants';

interface AlertBannerProps {
  alert: WeatherAlert | undefined;
  onDismiss: (id: string) => void;
}

const ALERT_TYPE_LABEL: Record<AlertType, string> = {
  urgent:   '🚨 URGENT',
  warning:  '⚠️ WARNING',
  watch:    '👁️ WATCH',
  advisory: 'ℹ️ ADVISORY',
};

export default function AlertBanner({ alert, onDismiss }: AlertBannerProps) {
  if (!alert) return null;

  const colors = ALERT_COLORS[alert.type];

  return (
    <div
      className={styles.banner}
      style={{ background: colors.bg, borderColor: colors.border }}
    >
      <div className={styles.typeTag} style={{ background: colors.badge }}>
        {ALERT_TYPE_LABEL[alert.type]}
      </div>
      <div className={styles.content}>
        <p className={styles.description}>{alert.description}</p>
        <p className={styles.areas}>
          Areas: {alert.affectedAreas.join(', ')}
        </p>
      </div>
      <button
        className={styles.dismiss}
        onClick={() => onDismiss(alert.id)}
        aria-label="Dismiss alert"
      >
        ✕
      </button>
    </div>
  );
}
