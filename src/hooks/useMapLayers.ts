'use client';

import { useState, useEffect } from 'react';
import { MOCK_MAP_LAYERS } from '@/lib/mockData';
import { MapLayer } from '@/types';

export function useMapLayers() {
  const [layers, setLayers] = useState<MapLayer[]>(MOCK_MAP_LAYERS);

  const toggleLayer = (id: string) => {
    setLayers(prev =>
      prev.map(l => (l.id === id ? { ...l, enabled: !l.enabled } : l))
    );
  };

  return { layers, toggleLayer };
}
