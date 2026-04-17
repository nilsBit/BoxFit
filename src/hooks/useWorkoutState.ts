import { useMemo } from 'react';
import { AppState } from '../types';
import {
  calculateStreak,
  getWeekNumber,
  getWorkoutsThisWeek,
  getTrainingDayOfWeek,
  getTodayISO,
} from '../utils/dateUtils';
import { getWorkoutForDay } from '../utils/workoutEngine';
import { getProgressionForWeek } from '../constants/progression';

export function useWorkoutState(appState: AppState) {
  return useMemo(() => {
    const currentWeek = getWeekNumber(appState.startDate);
    const streak = calculateStreak(appState.completedWorkouts);
    const workoutsThisWeek = getWorkoutsThisWeek(appState.completedWorkouts);
    const trainingDay = getTrainingDayOfWeek();
    const isRestDay = trainingDay === 0;
    const todayWorkout = isRestDay ? null : getWorkoutForDay(trainingDay, currentWeek);
    const progression = getProgressionForWeek(currentWeek);
    const totalWorkouts = appState.completedWorkouts.length;
    const todayCompleted = appState.completedWorkouts.some(
      (w) => w.date === getTodayISO()
    );

    return {
      currentWeek,
      streak,
      workoutsThisWeek,
      trainingDay,
      isRestDay,
      todayWorkout,
      progression,
      totalWorkouts,
      todayCompleted,
    };
  }, [appState]);
}
