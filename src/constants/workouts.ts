import { DayWorkout } from '../types';
import { Colors } from './theme';

export interface WarmupExercise {
  name: string;
  duration: number;
  icon: string;
  hint: string;
}

export const WARMUP_EXERCISES: WarmupExercise[] = [
  { name: 'Armkreisen', duration: 30, icon: '🔄', hint: 'Große Kreise, vorwärts & rückwärts' },
  { name: 'KB Halo', duration: 60, icon: '💫', hint: 'Kettlebell langsam um den Kopf kreisen' },
  { name: 'Leichte KB Swings', duration: 60, icon: '🔔', hint: 'Lockere Swings, Hüfte aktivieren' },
  { name: 'Schulterkreisen', duration: 30, icon: '🔃', hint: 'Kleine → große Kreise' },
];

export const WARMUP_TOTAL_SECONDS = WARMUP_EXERCISES.reduce((s, e) => s + e.duration, 0);

export const DAY_WORKOUTS: DayWorkout[] = [
  {
    day: 1,
    title: 'Push + Core',
    subtitle: 'Brust, Schultern & Bauch',
    color: Colors.dayColors[1],
    circuit: {
      rounds: 4,
      workSeconds: 45,
      restSeconds: 15,
      exercises: [
        { exerciseId: 'dips', name: 'Dips' },
        { exerciseId: 'kb-ohp', name: 'KB Overhead Press (Wechsel)' },
        { exerciseId: 'push-ups-close', name: 'Liegestütze (eng)' },
        { exerciseId: 'pike-push-ups', name: 'Pike Push-ups' },
        { exerciseId: 'russian-twists', name: 'Russian Twists (KB)' },
        { exerciseId: 'hanging-knee-raises', name: 'Hanging Knee Raises' },
      ],
    },
    finisher: { rounds: 3, durationMinutes: 3, restSeconds: 30, label: 'Shadowboxing' },
    closing: { name: 'KB Shrugs', sets: 2, reps: 20 },
  },
  {
    day: 2,
    title: 'Kondition + Beine',
    subtitle: 'Explosiv & Ausdauer',
    color: Colors.dayColors[2],
    circuit: {
      rounds: 4,
      workSeconds: 45,
      restSeconds: 15,
      exercises: [
        { exerciseId: 'kb-swings', name: 'KB Swings (schwer, explosiv)' },
        { exerciseId: 'goblet-squats', name: 'Goblet Squats' },
        { exerciseId: 'plyo-push-ups', name: 'Plyo-Liegestütze' },
        { exerciseId: 'split-squats-l', name: 'Split Squats links' },
        { exerciseId: 'split-squats-r', name: 'Split Squats rechts' },
        { exerciseId: 'high-knees', name: 'High Knees' },
      ],
    },
    finisher: { rounds: 2, durationMinutes: 3, restSeconds: 30, label: 'Shadowboxing' },
    closing: { name: 'Neck Bridges', sets: 2, durationSeconds: 30 },
  },
  {
    day: 3,
    title: 'Pull + Core',
    subtitle: 'Rücken & Rotation',
    color: Colors.dayColors[3],
    circuit: {
      rounds: 4,
      workSeconds: 45,
      restSeconds: 15,
      exercises: [
        { exerciseId: 'pull-ups', name: 'Klimmzüge' },
        { exerciseId: 'kb-row-l', name: 'KB Row links' },
        { exerciseId: 'kb-row-r', name: 'KB Row rechts' },
        { exerciseId: 'chin-ups', name: 'Chin-ups' },
        { exerciseId: 'russian-twists', name: 'Russian Twists (KB)' },
        { exerciseId: 'hanging-leg-raises', name: 'Hanging Leg Raises' },
      ],
    },
    finisher: { rounds: 3, durationMinutes: 3, restSeconds: 30, label: 'Shadowboxing' },
    closing: { name: 'KB Shrugs', sets: 2, reps: 20 },
  },
  {
    day: 4,
    title: 'Kondition + Ganzkörper',
    subtitle: 'Kraft-Ausdauer Mix',
    color: Colors.dayColors[4],
    circuit: {
      rounds: 5,
      workSeconds: 30,
      restSeconds: 15,
      exercises: [
        { exerciseId: 'kb-clean-press', name: 'KB Clean & Press (Wechsel)' },
        { exerciseId: 'kb-snatch', name: 'KB Snatch (Wechsel)' },
        { exerciseId: 'mountain-climbers', name: 'Mountain Climbers' },
        { exerciseId: 'kb-swing-single', name: 'KB Swing einarmig' },
        { exerciseId: 'hollow-body', name: 'Hollow Body Hold' },
      ],
    },
    finisher: { rounds: 3, durationMinutes: 3, restSeconds: 30, label: 'Shadowboxing' },
    closing: { name: 'Neck Bridges', sets: 2, durationSeconds: 30 },
  },
  {
    day: 5,
    title: 'Vollgas Freitag',
    subtitle: 'Maximale Intensität',
    color: Colors.dayColors[5],
    circuit: {
      rounds: 4,
      workSeconds: 40,
      restSeconds: 20,
      exercises: [
        { exerciseId: 'kb-thrusters', name: 'KB Thrusters' },
        { exerciseId: 'dips', name: 'Dips' },
        { exerciseId: 'pull-ups', name: 'Klimmzüge' },
        { exerciseId: 'kb-woodchops', name: 'KB Woodchops (Wechsel)' },
        { exerciseId: 'burpees', name: 'Burpees' },
        { exerciseId: 'plank', name: 'Plank' },
      ],
    },
    finisher: { rounds: 4, durationMinutes: 2, restSeconds: 30, label: 'Shadowboxing (volle Power)' },
    closing: { name: 'KB Shrugs', sets: 2, reps: 20 },
  },
  // === STRETCHING WORKOUT (Tag 6) ===
  {
    day: 6,
    title: 'Dehnen & Mobilität',
    subtitle: 'Kampfkunst-Stretching',
    color: '#00BCD4',
    circuit: {
      rounds: 2,
      workSeconds: 45,
      restSeconds: 10,
      exercises: [
        { exerciseId: 'hip-flexor-stretch', name: 'Hüftbeuger-Dehnung' },
        { exerciseId: 'hamstring-stretch', name: 'Beinrückseite dehnen' },
        { exerciseId: 'pigeon-stretch', name: 'Tauben-Stretch' },
        { exerciseId: 'butterfly-stretch', name: 'Schmetterling' },
        { exerciseId: 'side-kick-stretch', name: 'Seitkick-Dehnung' },
        { exerciseId: 'roundhouse-hip-opener', name: 'Roundhouse Hüftöffner' },
        { exerciseId: 'side-split-stretch', name: 'Seitliche Grätsche' },
        { exerciseId: 'front-split-stretch', name: 'Frontspagat-Vorbereitung' },
        { exerciseId: 'world-greatest-stretch', name: 'World\'s Greatest Stretch' },
        { exerciseId: 'scorpion-stretch', name: 'Skorpion-Stretch' },
        { exerciseId: 'shoulder-stretch', name: 'Schulterdehnung' },
        { exerciseId: 'cobra-stretch', name: 'Kobra-Stretch' },
      ],
    },
    finisher: { rounds: 1, durationMinutes: 2, restSeconds: 0, label: 'Freies Dehnen – Problemzonen' },
    closing: { name: 'Tiefe Atmung', sets: 1, durationSeconds: 60 },
  },
];
