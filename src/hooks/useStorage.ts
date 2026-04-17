import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, CompletedWorkout } from '../types';
import { getTodayISO } from '../utils/dateUtils';

const STORAGE_KEY = '@boxfit_state';

const DEFAULT_STATE: AppState = {
  completedWorkouts: [],
  currentWeek: 1,
  startDate: getTodayISO(),
  progressionChecklist: {},
};

export function useStorage() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        setState(JSON.parse(raw));
      }
    } catch (e) {
      console.error('Failed to load state:', e);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveState = useCallback(async (newState: AppState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      setState(newState);
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }, []);

  const completeWorkout = useCallback(
    async (day: number) => {
      const workout: CompletedWorkout = { date: getTodayISO(), day };
      const newState = {
        ...state,
        completedWorkouts: [...state.completedWorkouts, workout],
      };
      await saveState(newState);
    },
    [state, saveState]
  );

  const toggleChecklistItem = useCallback(
    async (key: string) => {
      const newState = {
        ...state,
        progressionChecklist: {
          ...state.progressionChecklist,
          [key]: !state.progressionChecklist[key],
        },
      };
      await saveState(newState);
    },
    [state, saveState]
  );

  const setStartDate = useCallback(
    async (date: string) => {
      const newState = { ...state, startDate: date };
      await saveState(newState);
    },
    [state, saveState]
  );

  const setCurrentWeek = useCallback(
    async (week: number) => {
      const clamped = Math.max(1, Math.min(12, week));
      // Calculate a startDate that makes getWeekNumber return the desired week
      const now = new Date();
      const daysBack = (clamped - 1) * 7;
      const newStart = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
      const newState = { ...state, startDate: newStart.toISOString().split('T')[0] };
      await saveState(newState);
    },
    [state, saveState]
  );

  const resetAll = useCallback(async () => {
    await saveState({ ...DEFAULT_STATE, startDate: getTodayISO() });
  }, [saveState]);

  return {
    state,
    isLoaded,
    completeWorkout,
    toggleChecklistItem,
    setStartDate,
    setCurrentWeek,
    resetAll,
  };
}
