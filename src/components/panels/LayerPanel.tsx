'use client';

import styles from './LayerPanel.module.css';
import { MapLayer } from '@/types';

interface LayerPanelProps {
  layers: MapLayer[];
  onToggle: (id: string) => void;
  onClose?: () => void;
}

export default function LayerPanel({ layers, onToggle, onClose }: LayerPanelProps) {
  return (
    <aside className={styles.panel}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
        <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Map Layers</h3>
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
      <ul className={styles.layerList}>
        {layers.map(layer => (
          <li key={layer.id} className={styles.layerItem}>
            <span className={styles.layerIcon}>{layer.icon}</span>
            <span className={styles.layerLabel}>{layer.label}</span>
            <button
              role="switch"
              aria-checked={layer.enabled}
              aria-label={`Toggle ${layer.label}`}
              id={`layer-toggle-${layer.id}`}
              className={`${styles.toggle} ${layer.enabled ? styles.toggleOn : styles.toggleOff}`}
              style={{ '--layer-color': layer.color } as React.CSSProperties}
              onClick={() => onToggle(layer.id)}
            >
              <span className={styles.toggleThumb} />
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
