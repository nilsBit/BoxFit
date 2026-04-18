import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, CompletedWorkout } from '../types';
import { getTodayISO } from '../utils/dateUtils';

const STORAGE_KEY = '@boxfit_state';

const DEFAULT_STATE: AppState = {
  completedWorkouts: [],
  currentWeek: 1,
  startDate: getTodayISO(),
  progressionChecklist: {},
  speechEnabled: true,
  kbWeight: 16,
  trainingDays: [1, 2, 3, 4, 5],
  onboardingDone: false,
  notificationsEnabled: false,
  notificationHour: 18,
  notificationMinute: 0,
};

export function useStorage() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setState(parsed);
        stateRef.current = parsed;
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
      stateRef.current = newState;
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }, []);

  const completeWorkout = useCallback(async (day: number) => {
    const current = stateRef.current;
    const workout: CompletedWorkout = { date: getTodayISO(), day };
    const newState = {
      ...current,
      completedWorkouts: [...current.completedWorkouts, workout],
    };
    await saveState(newState);
  }, [saveState]);

  const toggleChecklistItem = useCallback(async (key: string) => {
    const current = stateRef.current;
    const newState = {
      ...current,
      progressionChecklist: {
        ...current.progressionChecklist,
        [key]: !current.progressionChecklist[key],
      },
    };
    await saveState(newState);
  }, [saveState]);

  const setStartDate = useCallback(async (date: string) => {
    const current = stateRef.current;
    await saveState({ ...current, startDate: date });
  }, [saveState]);

  const setCurrentWeek = useCallback(async (week: number) => {
    const current = stateRef.current;
    const clamped = Math.max(1, Math.min(12, week));
    const now = new Date();
    const daysBack = (clamped - 1) * 7;
    const newStart = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    await saveState({ ...current, startDate: newStart.toISOString().split('T')[0] });
  }, [saveState]);

  const setSpeechEnabled = useCallback(async (enabled: boolean) => {
    const current = stateRef.current;
    await saveState({ ...current, speechEnabled: enabled });
  }, [saveState]);

  const setKbWeight = useCallback(async (weight: number) => {
    const current = stateRef.current;
    await saveState({ ...current, kbWeight: weight });
  }, [saveState]);

  const setTrainingDays = useCallback(async (days: number[]) => {
    const current = stateRef.current;
    await saveState({ ...current, trainingDays: days });
  }, [saveState]);

  const completeOnboarding = useCallback(async (kbWeight: number, trainingDays: number[]) => {
    const current = stateRef.current;
    await saveState({ ...current, kbWeight, trainingDays, onboardingDone: true, startDate: getTodayISO() });
  }, [saveState]);

  const setNotificationSettings = useCallback(async (enabled: boolean, hour: number, minute: number) => {
    const current = stateRef.current;
    await saveState({ ...current, notificationsEnabled: enabled, notificationHour: hour, notificationMinute: minute });
  }, [saveState]);

  const clearCompletedWorkouts = useCallback(async () => {
    const current = stateRef.current;
    await saveState({ ...current, completedWorkouts: [] });
  }, [saveState]);

  const resetAll = useCallback(async () => {
    await saveState({ ...DEFAULT_STATE, startDate: getTodayISO() });
  }, [saveState]);

  return { state, isLoaded, completeWorkout, toggleChecklistItem, setStartDate, setCurrentWeek, setSpeechEnabled, setKbWeight, setTrainingDays, completeOnboarding, setNotificationSettings, clearCompletedWorkouts, resetAll };
}
