import { useState, useEffect, useRef } from 'react';

export type Period = 1 | 2;

export function useMatchTimer() {
  const [ms, setMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [period, setPeriod] = useState<Period>(1);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(() => {
        setMs((prev) => prev + 1000);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const toggleTimer = () => setRunning((prev) => !prev);
  
  const resetTimer = () => {
    setRunning(false);
    setMs(0);
  };

  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const time = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return {
    ms,
    seconds: totalSeconds,
    time,
    running,
    period,
    setPeriod,
    toggleTimer,
    resetTimer
  };
}