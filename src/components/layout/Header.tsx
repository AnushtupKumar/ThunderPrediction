'use client';

import { useState, useEffect } from 'react';
import styles from './Header.module.css';

export default function Header() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Kolkata',
        }) + ' IST'
      );
      setDate(
        now.toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'Asia/Kolkata',
        })
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.logoWrap}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" stroke="#3b82f6" strokeWidth="1.5" />
            <path d="M14 6C14 6 8 10 8 15a6 6 0 0012 0c0-5-6-9-6-9z" fill="#3b82f6" opacity=".8"/>
            <path d="M14 10l1.5 3H12.5L14 10z" fill="#fbbf24" />
            <path d="M12 17l4-4-1 6-3-2z" fill="#fbbf24" opacity=".7"/>
          </svg>
        </div>
        <div className={styles.titleGroup}>
          <span className={styles.org}>MoES INDIA</span>
          <span className={styles.divider}>|</span>
          <span className={styles.title}>Disaster Management Dashboard</span>
          <span className={styles.divider}>|</span>
          <span className={styles.subtitle}>IMD Nowcasting Portal</span>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.statusDot} title="System Online" />
        <div className={styles.datetime}>
          <span className={styles.dateText}>{date}</span>
          <span className={styles.timeText}>{time}</span>
        </div>
        <div className={styles.badge}>LIVE</div>
      </div>
    </header>
  );
}
