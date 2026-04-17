import { DayWorkout, ProgressionLevel } from '../types';
import { DAY_WORKOUTS } from '../constants/workouts';
import { getProgressionForWeek } from '../constants/progression';

export function getWorkoutForDay(day: number, week: number): DayWorkout {
  const base = DAY_WORKOUTS.find((w) => w.day === day);
  if (!base) throw new Error(`No workout for day ${day}`);

  // Stretching (day 6) doesn't get progression applied
  if (day === 6) return base;

  const progression = getProgressionForWeek(week);
  return applyProgression(base, progression);
}

export function getAllWorkouts(): DayWorkout[] {
  return DAY_WORKOUTS;
}

function applyProgression(
  workout: DayWorkout,
  progression: ProgressionLevel
): DayWorkout {
  return {
    ...workout,
    circuit: {
      ...workout.circuit,
      rounds: workout.circuit.rounds + progression.circuitRoundsBonus,
      workSeconds: Math.max(15, workout.circuit.workSeconds + progression.workSecondsBonus),
      restSeconds: Math.max(10, workout.circuit.restSeconds + progression.restSecondsBonus),
    },
    finisher: {
      ...workout.finisher,
      rounds: workout.finisher.rounds + progression.finisherRoundsBonus,
      restSeconds: Math.max(10, workout.finisher.restSeconds + progression.finisherRestSecondsBonus),
    },
  };
}
