'use client';

import styles from './NowcastTimeline.module.css';
import { MOCK_RADAR_FRAMES } from '@/lib/mockData';

interface NowcastTimelineProps {
  frameIndex: number;
  totalFrames: number;
  currentMinute: number;
  isPlaying: boolean;
  onFrameChange: (index: number) => void;
  onTogglePlay: () => void;
}

function formatMinute(min: number): string {
  if (min === 0) return 'NOW';
  return min > 0 ? `+${min}m` : `${min}m`;
}

export default function NowcastTimeline({
  frameIndex,
  totalFrames,
  currentMinute,
  isPlaying,
  onFrameChange,
  onTogglePlay,
}: NowcastTimelineProps) {
  const nowIndex = MOCK_RADAR_FRAMES.findIndex(f => f.minuteOffset === 0);
  const minMinute = MOCK_RADAR_FRAMES[0].minuteOffset;
  const maxMinute = MOCK_RADAR_FRAMES[totalFrames - 1].minuteOffset;
  const range = maxMinute - minMinute;
  const progressPct = ((currentMinute - minMinute) / range) * 100;
  const nowPct = ((0 - minMinute) / range) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.label}>
        <span className={styles.labelText}>
          Nowcasting Timeline:&nbsp;
          <span className={styles.labelSub}>
            Past {Math.abs(minMinute)} min to Future {maxMinute} min
          </span>
        </span>
        <span className={styles.currentTime}>{formatMinute(currentMinute)}</span>
      </div>

      <div className={styles.controls}>
        <button
          className={styles.playBtn}
          onClick={onTogglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <rect x="2" y="1" width="4" height="12" rx="1" />
              <rect x="8" y="1" width="4" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M3 1.5l10 5.5-10 5.5V1.5z" />
            </svg>
          )}
        </button>

        <div className={styles.sliderWrap}>
          {/* NOW indicator line */}
          <div
            className={styles.nowLine}
            style={{ left: `${nowPct}%` }}
          >
            <span className={styles.nowLabel}>NOW</span>
          </div>

          {/* Tick marks */}
          {MOCK_RADAR_FRAMES.map((frame, i) => {
            const pct = ((frame.minuteOffset - minMinute) / range) * 100;
            return (
              <div
                key={frame.minuteOffset}
                className={`${styles.tick} ${i === frameIndex ? styles.tickActive : ''}`}
                style={{ left: `${pct}%` }}
              />
            );
          })}

          {/* Gradient bar: past (blue) → future (purple) */}
          <div className={styles.trackBg} />
          <div
            className={styles.trackFill}
            style={{ width: `${progressPct}%` }}
          />

          <input
            type="range"
            className={styles.rangeInput}
            min={0}
            max={totalFrames - 1}
            value={frameIndex}
            step={1}
            onChange={e => onFrameChange(Number(e.target.value))}
            aria-label="Nowcast timeline"
          />
        </div>
      </div>

      {/* Minute labels */}
      <div className={styles.minuteLabels}>
        {MOCK_RADAR_FRAMES.map(frame => {
          const pct = ((frame.minuteOffset - minMinute) / range) * 100;
          return (
            <span
              key={frame.minuteOffset}
              className={`${styles.minuteLabel} ${frame.minuteOffset === currentMinute ? styles.minuteLabelActive : ''}`}
              style={{ left: `${pct}%` }}
            >
              {frame.minuteOffset === 0 ? '' : frame.minuteOffset}
            </span>
          );
        })}
      </div>
    </div>
  );
}
