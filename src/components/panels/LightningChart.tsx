'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { MOCK_LIGHTNING_CHART_DATA } from '@/lib/mockData';
import styles from './LightningChart.module.css';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const isPredicted = payload[0]?.payload?.predicted;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      <p className={styles.tooltipValue}>
        {payload[0].value} strikes
        {isPredicted && <span className={styles.tooltipPred}> (forecast)</span>}
      </p>
    </div>
  );
};

export default function LightningChart() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>Lightning Strike Frequency</span>
        <span className={styles.icon}>⚡</span>
      </div>
      <div className={styles.chartWrap}>
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart
            data={MOCK_LIGHTNING_CHART_DATA}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="lightningGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="predictedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tick={{ fill: '#475569', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#475569', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x="NOW" stroke="rgba(59,130,246,0.6)" strokeDasharray="4 3" />
            <Area
              type="monotone"
              dataKey="strikes"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#lightningGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#f59e0b' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#f59e0b' }} />
          Observed
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#8b5cf6' }} />
          Predicted
        </span>
      </div>
    </div>
  );
}
