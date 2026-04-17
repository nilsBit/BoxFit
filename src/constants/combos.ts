// Boxing Numbering System (International Standard):
// 1 = Jab (Führhand)
// 2 = Cross (Schlaghand)
// 3 = Lead Hook (Führhand-Haken)
// 4 = Rear Hook (Schlaghand-Haken)
// 5 = Lead Uppercut (Führhand-Aufwärtshaken)
// 6 = Rear Uppercut (Schlaghand-Aufwärtshaken)
// B = Body (zum Körper)
// Slip = Ausweichen
// Roll = Abrollen
// Bob = Abtauchen

export interface BoxingCombo {
  id: string;
  name: string;
  sequence: string;
  description: string;
  level: 'Anfänger' | 'Mittel' | 'Fortgeschritten' | 'Profi';
  focus: string;
  tips: string;
}

// === ANFÄNGER KOMBINATIONEN ===
const BEGINNER_COMBOS: BoxingCombo[] = [
  {
    id: 'basic-1-2',
    name: 'The Basic',
    sequence: '1 – 2',
    description: 'Jab → Cross. Die wichtigste Kombination im Boxen. Alles beginnt hier.',
    level: 'Anfänger',
    focus: 'Grundlagen',
    tips: 'Jab schnell raus, Cross mit voller Hüftrotation. Hand zurück ans Kinn!',
  },
  {
    id: 'double-jab',
    name: 'Double Jab Cross',
    sequence: '1 – 1 – 2',
    description: 'Doppelter Jab → Cross. Der erste Jab testet die Distanz, der zweite öffnet die Deckung.',
    level: 'Anfänger',
    focus: 'Distanzkontrolle',
    tips: 'Erster Jab leicht, zweiter Jab härter, Cross volle Power',
  },
  {
    id: 'jab-cross-hook',
    name: 'Classic Three',
    sequence: '1 – 2 – 3',
    description: 'Jab → Cross → Lead Hook. Die klassische Drei-Schlag-Kombi der Profis.',
    level: 'Anfänger',
    focus: 'Grundkombination',
    tips: 'Nach dem Cross sofort den Hook nachsetzen. Hüfte dreht zurück.',
  },
  {
    id: 'jab-body',
    name: 'High-Low',
    sequence: '1 – 2B',
    description: 'Jab zum Kopf → Cross zum Körper. Level-Change ist im Kampf essentiell.',
    level: 'Anfänger',
    focus: 'Level-Change',
    tips: 'Beim Body-Cross in die Knie gehen, nicht den Rücken beugen!',
  },
];

// === MITTEL KOMBINATIONEN ===
const INTERMEDIATE_COMBOS: BoxingCombo[] = [
  {
    id: 'classic-four',
    name: 'The Four Punch',
    sequence: '1 – 2 – 3 – 2',
    description: 'Jab → Cross → Hook → Cross. Vier Schläge, Maximum Druck.',
    level: 'Mittel',
    focus: 'Kombination',
    tips: 'Rhythmus: schnell-schnell-schnell-HART. Letzter Cross mit voller Power.',
  },
  {
    id: 'body-head',
    name: 'Body-Head Combo',
    sequence: '1 – 2B – 3 – 2',
    description: 'Jab → Body Cross → Lead Hook (Kopf) → Cross. Klassischer Body-Head-Wechsel.',
    level: 'Mittel',
    focus: 'Level-Change',
    tips: 'Gegner senkt die Deckung nach dem Body-Shot → Hook zum Kopf!',
  },
  {
    id: 'hook-cross-hook',
    name: 'Three Hooks',
    sequence: '3 – 2 – 3',
    description: 'Lead Hook → Cross → Lead Hook. Druckvolle Mitteldistanz-Kombination.',
    level: 'Mittel',
    focus: 'Infight',
    tips: 'In der Mitteldistanz bleiben, Hüfte pendelt wie ein Metronom',
  },
  {
    id: 'slip-counter',
    name: 'Slip & Counter',
    sequence: 'Slip → 2 – 3 – 2',
    description: 'Ausweichen nach links → Cross → Hook → Cross. Konter nach dem Ausweichen.',
    level: 'Mittel',
    focus: 'Konter',
    tips: 'Slip mit den Knien, nicht dem Rücken. Sofort kontern!',
  },
  {
    id: 'uppercut-hook',
    name: 'Uppercut-Hook',
    sequence: '1 – 2 – 5 – 3',
    description: 'Jab → Cross → Lead Uppercut → Lead Hook. Aufwärtshaken öffnet die Deckung.',
    level: 'Mittel',
    focus: 'Variation',
    tips: 'Uppercut kommt aus den Beinen, nicht aus dem Arm!',
  },
  {
    id: 'check-hook',
    name: 'Check Hook Exit',
    sequence: '1 – 1 – 3 (Pivot)',
    description: 'Doppelter Jab → Lead Hook mit Pivot nach links. Schlagen und wegbewegen.',
    level: 'Mittel',
    focus: 'Footwork',
    tips: 'Beim Hook gleichzeitig auf dem Vorderfuß pivoten. Wie Floyd Mayweather.',
  },
];

// === FORTGESCHRITTEN KOMBINATIONEN ===
const ADVANCED_COMBOS: BoxingCombo[] = [
  {
    id: 'mayweather-pull',
    name: 'Mayweather Pull Counter',
    sequence: 'Pull Back → 2 – 3 – 2',
    description: 'Zurücklehnen (Pull) → Cross → Hook → Cross. Floyd\'s Signature Move.',
    level: 'Fortgeschritten',
    focus: 'Konter',
    tips: 'Oberkörper nur leicht zurücklehnen, sofort mit dem Cross kontern',
  },
  {
    id: 'six-punch',
    name: 'Six Punch Blitz',
    sequence: '1 – 2 – 3 – 4 – 5 – 6',
    description: 'Jab → Cross → Lead Hook → Rear Hook → Lead Uppercut → Rear Uppercut. Alle sechs Schläge.',
    level: 'Fortgeschritten',
    focus: 'Kombination',
    tips: 'Nicht alles volle Power — Rhythmus und Flow sind wichtiger',
  },
  {
    id: 'philly-shell',
    name: 'Philly Shell Counter',
    sequence: 'Roll → 2 – 5 – 2 – 3',
    description: 'Abrollen → Cross → Lead Uppercut → Cross → Hook. Aus der Philly Shell Deckung.',
    level: 'Fortgeschritten',
    focus: 'Defense & Counter',
    tips: 'Schulter vorne als Schutz, nach dem Roll sofort countern',
  },
  {
    id: 'body-destroyer',
    name: 'Body Destroyer',
    sequence: '1 – 2B – 5B – 2 – 3',
    description: 'Jab → Body Cross → Body Uppercut → Cross → Hook. Drei Körpertreffer dann oben abschließen.',
    level: 'Fortgeschritten',
    focus: 'Körperarbeit',
    tips: 'Tief bleiben bei den Body-Shots, dann explosiv nach oben',
  },
  {
    id: 'pivot-combo',
    name: 'Pivot Kombination',
    sequence: '1 – 2 – Pivot → 3 – 2',
    description: 'Jab → Cross → Pivot nach links → Lead Hook → Cross aus neuem Winkel.',
    level: 'Fortgeschritten',
    focus: 'Winkel & Footwork',
    tips: 'Nach dem Pivot stehst du im neuen Winkel — Gegner muss sich erst orientieren',
  },
];

// === PROFI KOMBINATIONEN ===
const PRO_COMBOS: BoxingCombo[] = [
  {
    id: 'canelo-combo',
    name: 'Canelo Special',
    sequence: 'Slip → 5B – 3 – 2 – 3',
    description: 'Slip nach rechts → Body Uppercut → Lead Hook → Cross → Hook. Canelo Álvarez\' Signature.',
    level: 'Profi',
    focus: 'Power & Counter',
    tips: 'Der Slip lädt den Uppercut auf. Explosive Hüftrotation bei jedem Schlag!',
  },
  {
    id: 'pacquiao-blitz',
    name: 'Pacquiao Blitz',
    sequence: '1 – 1 – 2 – 3 – 2 – 1 (Speed)',
    description: 'Schnellfeuer: Doppelter Jab → Cross → Hook → Cross → Jab. Pacquiao-Tempo.',
    level: 'Profi',
    focus: 'Geschwindigkeit',
    tips: 'Alles aus dem Handgelenk, minimale Bewegung, maximale Geschwindigkeit',
  },
  {
    id: 'tyson-peek-a-boo',
    name: 'Tyson Peek-a-Boo',
    sequence: 'Bob → Bob → 5 – 3 – 2 – 3',
    description: 'Doppeltes Abtauchen → Uppercut → Hook → Cross → Hook. Mike Tyson\'s explosiver Stil.',
    level: 'Profi',
    focus: 'Infight & Power',
    tips: 'Tief abtauchen, Kraft aus den Beinen! Schläge kommen von unten.',
  },
  {
    id: 'ali-shuffle',
    name: 'Ali Shuffle Combo',
    sequence: '1 – 1 – 1 – Shuffle → 2 – 3',
    description: 'Triple Jab → Ali Shuffle (Fußarbeit-Finte) → Cross → Hook. Showtime.',
    level: 'Profi',
    focus: 'Footwork & Finten',
    tips: 'Die Jabs irritieren, der Shuffle verwirrt, Cross-Hook beendet',
  },
  {
    id: 'lomachenko-angles',
    name: 'Lomachenko Angles',
    sequence: 'Pivot → 1 – 2 – Pivot → 3 – 6 – 3',
    description: 'Pivot rein → Jab → Cross → Pivot → Hook → Rear Uppercut → Hook. Ständig neue Winkel.',
    level: 'Profi',
    focus: 'Winkel & Bewegung',
    tips: 'Nie stehen bleiben! Jeder Pivot gibt dir einen neuen Angriffswinkel.',
  },
];

export const ALL_COMBOS: BoxingCombo[] = [
  ...BEGINNER_COMBOS,
  ...INTERMEDIATE_COMBOS,
  ...ADVANCED_COMBOS,
  ...PRO_COMBOS,
];

export function getCombosForLevel(level: BoxingCombo['level']): BoxingCombo[] {
  return ALL_COMBOS.filter((c) => c.level === level);
}

// Get random combos for a shadowboxing round, scaled by progression week
export function getCombosForRound(week: number, count: number = 4): BoxingCombo[] {
  let pool: BoxingCombo[];
  if (week <= 2) {
    pool = [...BEGINNER_COMBOS];
  } else if (week <= 4) {
    pool = [...BEGINNER_COMBOS, ...INTERMEDIATE_COMBOS];
  } else if (week <= 8) {
    pool = [...BEGINNER_COMBOS, ...INTERMEDIATE_COMBOS, ...ADVANCED_COMBOS];
  } else {
    pool = [...ALL_COMBOS];
  }

  // Shuffle and pick
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
