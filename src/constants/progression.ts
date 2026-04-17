import { ProgressionLevel } from '../types';

export const PROGRESSION_LEVELS: ProgressionLevel[] = [
  {
    weekRange: [1, 2],
    label: 'Basis-Phase',
    description: 'Grundlagen der Beinarbeit und Kraftausdauer.',
    changes: ['Standard-Programm wie definiert'],
    circuitRoundsBonus: 0,
    workSecondsBonus: 0,
    restSecondsBonus: 0,
    finisherRoundsBonus: 0,
    finisherRestSecondsBonus: 0,
    tips: ['Fokus auf saubere Technik', 'Finde dein KB-Gewicht'],
  },
  {
    weekRange: [3, 4],
    label: 'Steigerung',
    description: 'Erhöhung der Intensität und Schlagkraft.',
    changes: ['+2 Wdh bei Bodyweight-Übungen', 'Shadowboxing Pausen auf 25s'],
    circuitRoundsBonus: 0,
    workSecondsBonus: 0,
    restSecondsBonus: 0,
    finisherRoundsBonus: 0,
    finisherRestSecondsBonus: -5,
    tips: ['Versuche die Pausen wirklich kurz zu halten', 'Mehr Power bei Shadowboxing'],
  },
  {
    weekRange: [5, 6],
    label: 'Power & Speed',
    description: 'Schwerere Kettlebells und mehr Runden.',
    changes: ['Schwerere KB verwenden', '+1 Runde bei Circuit'],
    circuitRoundsBonus: 1,
    workSecondsBonus: 0,
    restSecondsBonus: 0,
    finisherRoundsBonus: 0,
    finisherRestSecondsBonus: -5,
    tips: ['Zeit für die nächste KB-Stufe', 'Runden werden mehr - Tempo halten!'],
  },
  {
    weekRange: [7, 8],
    label: 'Ausdauer-Push',
    description: 'Shadowboxing-Steigerung und kürzere Pausen.',
    changes: ['Shadowboxing +1 Runde', 'Pausen auf 20s'],
    circuitRoundsBonus: 1,
    workSecondsBonus: 0,
    restSecondsBonus: 0,
    finisherRoundsBonus: 1,
    finisherRestSecondsBonus: -10,
    tips: ['Mentale Stärke - durchhalten!', 'Atme rhythmisch beim Shadowboxing'],
  },
  {
    weekRange: [9, 10],
    label: 'Elite-Stufe',
    description: 'Gewichte bei Klimmzügen/Dips, EMOM-Runden.',
    changes: ['KB bei Klimmzügen/Dips (Gewichtsgürtel oder zwischen Füße)', 'EMOM-Runden einbauen'],
    circuitRoundsBonus: 1,
    workSecondsBonus: 0,
    restSecondsBonus: -5,
    finisherRoundsBonus: 1,
    finisherRestSecondsBonus: -10,
    tips: ['Verwende KB als Zusatzgewicht bei Dips/Klimmzügen', 'EMOM = jede Minute starten'],
  },
  {
    weekRange: [11, 12],
    label: 'Maximale Intensität',
    description: 'Alles geben - danach Deload-Woche.',
    changes: ['Maximale Intensität bei allem', 'Nach Woche 12: Deload-Woche empfohlen'],
    circuitRoundsBonus: 1,
    workSecondsBonus: 5,
    restSecondsBonus: -5,
    finisherRoundsBonus: 1,
    finisherRestSecondsBonus: -10,
    tips: ['Du bist am Ziel - volle Power!', 'Nach dem Programm: 1 Woche leichtes Training'],
  },
];

export function getProgressionForWeek(week: number): ProgressionLevel {
  const clamped = Math.min(Math.max(week, 1), 12);
  return PROGRESSION_LEVELS.find(
    (p) => clamped >= p.weekRange[0] && clamped <= p.weekRange[1]
  ) ?? PROGRESSION_LEVELS[0];
}
