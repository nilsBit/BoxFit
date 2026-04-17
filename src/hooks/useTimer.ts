import { useState, useRef, useCallback, useEffect } from 'react';

interface UseTimerReturn {
  secondsRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
  start: (seconds: number) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  onComplete: React.MutableRefObject<(() => void) | null>;
}

export function useTimer(): UseTimerReturn {
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onComplete = useRef<(() => void) | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback((seconds: number) => {
    clearTimer();
    setSecondsRemaining(seconds);
    setIsRunning(true);
    setIsPaused(false);

    intervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          setTimeout(() => onComplete.current?.(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer]);

  const pause = useCallback(() => {
    clearTimer();
    setIsPaused(true);
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (!isPaused) return;
    setIsPaused(false);

    intervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          setTimeout(() => onComplete.current?.(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [isPaused, clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setSecondsRemaining(0);
    setIsRunning(false);
    setIsPaused(false);
  }, [clearTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return { secondsRemaining, isRunning, isPaused, start, pause, resume, reset, onComplete };
}
