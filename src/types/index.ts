export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscleGroups: string[];
  difficulty: 'Anfänger' | 'Mittel' | 'Fortgeschritten';
  equipment?: string;
  icon: string;
  tips?: string;
}

export interface WorkoutExercise {
  exerciseId: string;
  name: string;
}

export interface CircuitConfig {
  rounds: number;
  workSeconds: number;
  restSeconds: number;
  exercises: WorkoutExercise[];
}

export interface FinisherConfig {
  rounds: number;
  durationMinutes: number;
  restSeconds: number;
  label: string;
}

export interface ClosingConfig {
  name: string;
  sets: number;
  reps?: number;
  durationSeconds?: number;
}

export interface DayWorkout {
  day: number;
  title: string;
  subtitle: string;
  color: string;
  circuit: CircuitConfig;
  finisher: FinisherConfig;
  closing: ClosingConfig;
}

export interface ProgressionLevel {
  weekRange: [number, number];
  label: string;
  description: string;
  changes: string[];
  circuitRoundsBonus: number;
  workSecondsBonus: number;
  restSecondsBonus: number;
  finisherRoundsBonus: number;
  finisherRestSecondsBonus: number;
  tips: string[];
}

export interface CompletedWorkout {
  date: string;
  day: number;
}

export interface AppState {
  completedWorkouts: CompletedWorkout[];
  currentWeek: number;
  startDate: string;
  progressionChecklist: Record<string, boolean>;
  speechEnabled: boolean;
  kbWeight: number;
  trainingDays: number[]; // 1=Mo, 2=Di, ..., 7=So
  onboardingDone: boolean;
  notificationsEnabled: boolean;
  notificationHour: number;
  notificationMinute: number;
}

export type WorkoutPhase = 'warmup' | 'circuit' | 'finisher' | 'closing' | 'done';

export interface TimerState {
  phase: WorkoutPhase;
  exerciseIndex: number;
  roundIndex: number;
  secondsRemaining: number;
  isResting: boolean;
  isPaused: boolean;
  isRunning: boolean;
}
