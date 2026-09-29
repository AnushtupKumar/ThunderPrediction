'use client';

import { useState, useEffect, useCallback } from 'react';
import { MOCK_RADAR_FRAMES } from '@/lib/mockData';
import { RadarFrame } from '@/types';
import { ANIMATION_INTERVAL_MS } from '@/lib/constants';

interface UseNowcastTimeReturn {
  currentFrame: RadarFrame;
  currentMinute: number;
  isPlaying: boolean;
  frameIndex: number;
  totalFrames: number;
  setFrameIndex: (index: number) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
}

export function useNowcastTime(): UseNowcastTimeReturn {
  // Index of the "now" frame
  const nowIndex = MOCK_RADAR_FRAMES.findIndex(f => f.minuteOffset === 0);
  const [frameIndex, setFrameIndex] = useState(nowIndex >= 0 ? nowIndex : 0);
  const [isPlaying, setIsPlaying] = useState(false);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const togglePlay = useCallback(() => setIsPlaying(prev => !prev), []);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setFrameIndex(prev => {
        if (prev >= MOCK_RADAR_FRAMES.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, ANIMATION_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isPlaying]);

  const currentFrame = MOCK_RADAR_FRAMES[frameIndex];

  return {
    currentFrame,
    currentMinute: currentFrame.minuteOffset,
    isPlaying,
    frameIndex,
    totalFrames: MOCK_RADAR_FRAMES.length,
    setFrameIndex,
    play,
    pause,
    togglePlay,
  };
}
