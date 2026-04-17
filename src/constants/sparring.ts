// === SPARRING TRAINER ===
// Nummern-System:
// 1=Jab, 2=Cross, 3=Lead Hook, 4=Rear Hook, 5=Lead Uppercut, 6=Rear Uppercut
// B=Body, Slip/Roll/Block = Defense
//
// ZWEI STIMMEN:
// "trainer" (tief, deutsch) = DEINE Kombos → was du schlägst
// "opponent" (hoch, englisch) = GEGNER-Angriffe → was du dodgen musst

export interface SparringCall {
  type: 'offense' | 'defense' | 'combo';
  text: string;        // Display text on screen
  speech: string;      // What gets spoken
  icon: string;
  color: 'red' | 'blue' | 'green';
}

// === DEFENSIVE CALLS (Gegner greift an → hohe Stimme) ===
export const DEFENSIVE_CALLS: SparringCall[] = [
  { type: 'defense', text: 'SLIP LINKS', speech: '1!', icon: '⬅️', color: 'blue' },
  { type: 'defense', text: 'SLIP RECHTS', speech: '2!', icon: '➡️', color: 'blue' },
  { type: 'defense', text: 'ABTAUCHEN', speech: '3!', icon: '⬇️', color: 'blue' },
  { type: 'defense', text: 'BLOCK', speech: '1, 2!', icon: '🛡️', color: 'blue' },
  { type: 'defense', text: 'BODY ANGRIFF', speech: '2, body!', icon: '🛡️', color: 'blue' },
  { type: 'defense', text: 'ROLL LINKS', speech: '3, 2!', icon: '🔄', color: 'blue' },
  { type: 'defense', text: 'ROLL RECHTS', speech: '4!', icon: '🔄', color: 'blue' },
  { type: 'defense', text: 'ZURÜCK', speech: '1, 1, 2!', icon: '🔙', color: 'blue' },
  { type: 'defense', text: 'PARRY', speech: '2!', icon: '✋', color: 'blue' },
  { type: 'defense', text: 'HOOK KOMMT', speech: '3!', icon: '💫', color: 'blue' },
  { type: 'defense', text: 'UPPERCUT', speech: '5!', icon: '⬆️', color: 'blue' },
  { type: 'defense', text: '1-2 KOMMT', speech: '1, 2!', icon: '⚠️', color: 'blue' },
  { type: 'defense', text: '1-2-3 KOMMT', speech: '1, 2, 3!', icon: '⚠️', color: 'blue' },
];

// === OFFENSIVE CALLS (Du schlägst → tiefe Stimme) ===
export const OFFENSIVE_CALLS: SparringCall[] = [
  { type: 'offense', text: '1', speech: '1!', icon: '👊', color: 'red' },
  { type: 'offense', text: '2', speech: '2!', icon: '💥', color: 'red' },
  { type: 'offense', text: '1 – 2', speech: '1, 2!', icon: '👊', color: 'red' },
  { type: 'offense', text: '1 – 1 – 2', speech: '1, 1, 2!', icon: '👊', color: 'red' },
  { type: 'offense', text: '1 – 2 – 3', speech: '1, 2, 3!', icon: '🔥', color: 'red' },
  { type: 'offense', text: '1 – 2 – 3 – 2', speech: '1, 2, 3, 2!', icon: '🔥', color: 'red' },
  { type: 'offense', text: '3', speech: '3!', icon: '🪝', color: 'red' },
  { type: 'offense', text: '5', speech: '5!', icon: '⬆️', color: 'red' },
  { type: 'offense', text: '6', speech: '6!', icon: '⬆️', color: 'red' },
  { type: 'offense', text: '2B', speech: '2, body!', icon: '💪', color: 'red' },
  { type: 'offense', text: '3 – 2 – 3', speech: '3, 2, 3!', icon: '🔥', color: 'red' },
  { type: 'offense', text: '1 – 2 – 5 – 3', speech: '1, 2, 5, 3!', icon: '💥', color: 'red' },
  { type: 'offense', text: '5 – 3 – 2', speech: '5, 3, 2!', icon: '💥', color: 'red' },
  { type: 'offense', text: '1 – 2B – 3', speech: '1, 2 body, 3!', icon: '🔥', color: 'red' },
  { type: 'offense', text: '1 – 2 – 3 – 4 – 5 – 6', speech: '1, 2, 3, 4, 5, 6!', icon: '💥', color: 'red' },
  { type: 'offense', text: '2 – 3 – 2', speech: '2, 3, 2!', icon: '🔥', color: 'red' },
  { type: 'offense', text: '5B – 3 – 2', speech: '5 body, 3, 2!', icon: '💥', color: 'red' },
];

// === COMBO CALLS (Du musst dodgen DANN schlagen) ===
export const COMBO_CALLS: SparringCall[] = [
  { type: 'combo', text: 'SLIP → 2 – 3', speech: 'Slip! ... 2, 3!', icon: '⚡', color: 'green' },
  { type: 'combo', text: 'DUCK → 5 – 3', speech: 'Duck! ... 5, 3!', icon: '⚡', color: 'green' },
  { type: 'combo', text: 'ROLL → 2 – 3 – 2', speech: 'Roll! ... 2, 3, 2!', icon: '⚡', color: 'green' },
  { type: 'combo', text: 'BLOCK → 1 – 2 – 3', speech: 'Block! ... 1, 2, 3!', icon: '⚡', color: 'green' },
  { type: 'combo', text: 'PARRY → 2 – 5B – 3', speech: 'Parry! ... 2, 5 body, 3!', icon: '⚡', color: 'green' },
  { type: 'combo', text: 'SLIP → SLIP → 2 – 3 – 2', speech: 'Slip! Slip! ... 2, 3, 2!', icon: '⚡', color: 'green' },
  { type: 'combo', text: 'BACK → 1 – 1 – 2 – 3', speech: 'Back! ... 1, 1, 2, 3!', icon: '⚡', color: 'green' },
  { type: 'combo', text: 'DUCK → 3 – 2 – 3', speech: 'Duck! ... 3, 2, 3!', icon: '⚡', color: 'green' },
];

export type SparringIntensity = 'locker' | 'mittel' | 'hart' | 'champion';

interface IntensityConfig {
  label: string;
  intervalMs: number;
  defenseRatio: number;
  includeCombo: boolean;
  rounds: number;
  roundMinutes: number;
  restSeconds: number;
}

export const SPARRING_INTENSITIES: Record<SparringIntensity, IntensityConfig> = {
  locker: {
    label: 'Locker (Anfänger)',
    intervalMs: 5000,
    defenseRatio: 0.2,
    includeCombo: false,
    rounds: 3,
    roundMinutes: 2,
    restSeconds: 60,
  },
  mittel: {
    label: 'Mittel',
    intervalMs: 4000,
    defenseRatio: 0.3,
    includeCombo: true,
    rounds: 4,
    roundMinutes: 3,
    restSeconds: 45,
  },
  hart: {
    label: 'Hart (Fortgeschritten)',
    intervalMs: 3000,
    defenseRatio: 0.4,
    includeCombo: true,
    rounds: 5,
    roundMinutes: 3,
    restSeconds: 30,
  },
  champion: {
    label: 'Champion',
    intervalMs: 2000,
    defenseRatio: 0.5,
    includeCombo: true,
    rounds: 6,
    roundMinutes: 3,
    restSeconds: 30,
  },
};

export function getRandomCall(intensity: SparringIntensity): SparringCall {
  const config = SPARRING_INTENSITIES[intensity];
  const rand = Math.random();

  if (config.includeCombo && rand < 0.15) {
    return COMBO_CALLS[Math.floor(Math.random() * COMBO_CALLS.length)];
  }

  if (rand < config.defenseRatio + 0.15) {
    return DEFENSIVE_CALLS[Math.floor(Math.random() * DEFENSIVE_CALLS.length)];
  }

  return OFFENSIVE_CALLS[Math.floor(Math.random() * OFFENSIVE_CALLS.length)];
}
