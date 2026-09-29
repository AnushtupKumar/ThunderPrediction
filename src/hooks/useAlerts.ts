'use client';

import { useState, useEffect } from 'react';
import { MOCK_ALERTS } from '@/lib/mockData';
import { WeatherAlert } from '@/types';

export function useAlerts() {
  const [alerts, setAlerts] = useState<WeatherAlert[]>(MOCK_ALERTS);
  const [activeAlertIndex, setActiveAlertIndex] = useState(0);

  // Cycle through active alerts every 8 seconds
  useEffect(() => {
    const active = alerts.filter(a => a.isActive);
    if (active.length <= 1) return;
    const id = setInterval(() => {
      setActiveAlertIndex(prev => (prev + 1) % active.length);
    }, 8000);
    return () => clearInterval(id);
  }, [alerts]);

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, isActive: false } : a)));
  };

  const activeAlerts = alerts.filter(a => a.isActive);
  const currentAlert = activeAlerts[activeAlertIndex] ?? activeAlerts[0];

  return { alerts, activeAlerts, currentAlert, dismissAlert };
}
