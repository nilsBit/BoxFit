# BoxFit Training Companion - Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete Expo React Native fitness app with timer-based boxing workouts, 12-week progression, local storage, and the Stitch design system.

**Architecture:** Tab-based navigation (expo-router) with 4 tabs (Home, Übungen, Fortschritt, Progression). Workout screen is a modal/stack screen pushed from Home. All data persisted via AsyncStorage with a custom hook layer. Timer logic isolated in a custom hook. Workout definitions and progression rules are pure data files.

**Tech Stack:** Expo SDK 55, expo-router, react-native-reanimated, expo-haptics, expo-av, @react-native-async-storage/async-storage, react-native-svg (for progress rings/charts)

---

## File Structure

```
BoxFit/
├── app/
│   ├── _layout.tsx              # Root layout (fonts, splash, providers)
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab navigator layout
│   │   ├── index.tsx            # Home screen
│   │   ├── uebungen.tsx         # Übungen screen
│   │   ├── fortschritt.tsx      # Fortschritt screen
│   │   └── progression.tsx      # Progression screen
│   └── workout.tsx              # Workout screen (modal stack)
├── src/
│   ├── constants/
│   │   ├── theme.ts             # Colors, fonts, spacing from Stitch design system
│   │   ├── workouts.ts          # All 5 day workout definitions (exercises, rounds, timings)
│   │   ├── exercises.ts         # Exercise catalog (name, description, muscles, difficulty)
│   │   └── progression.ts       # 12-week progression rules
│   ├── hooks/
│   │   ├── useStorage.ts        # AsyncStorage CRUD wrapper
│   │   ├── useWorkoutState.ts   # Current day, week, streak calculations
│   │   ├── useTimer.ts          # Countdown timer with pause/resume/skip
│   │   └── useSound.ts          # Sound playback (beep, gong)
│   ├── components/
│   │   ├── ProgressRing.tsx     # SVG circular progress indicator
│   │   ├── WorkoutCard.tsx      # Daily workout card (home screen)
│   │   ├── StreakBadge.tsx      # Streak fire badge
│   │   ├── ExerciseCard.tsx     # Exercise list item card
│   │   ├── HeatmapCalendar.tsx  # GitHub-style heatmap
│   │   ├── WeeklyBarChart.tsx   # Workouts per week bar chart
│   │   ├── TimelineItem.tsx     # Progression timeline node
│   │   ├── TimerDisplay.tsx     # Large countdown timer with ring
│   │   ├── PhaseIndicator.tsx   # Warmup/Circuit/Finisher progress bar
│   │   └── BottomTabBar.tsx     # Custom tab bar matching Stitch design
│   ├── utils/
│   │   ├── dateUtils.ts         # Date helpers (streak calc, week number, heatmap data)
│   │   └── workoutEngine.ts     # Applies progression rules to base workouts
│   └── types/
│       └── index.ts             # TypeScript interfaces
├── assets/
│   ├── fonts/
│   │   ├── SpaceGrotesk-*.ttf   # Space Grotesk font files
│   │   └── Inter-*.ttf          # Inter font files (if not using expo-google-fonts)
│   └── sounds/
│       ├── beep.mp3             # Timer beep sound
│       ├── gong.mp3             # Boxing gong sound
│       └── countdown.mp3        # 3-2-1 countdown beep
├── app.json                     # Expo config
├── package.json
└── tsconfig.json
```

---

## Task 1: Project Scaffolding & Theme

**Files:**
- Create: `BoxFit/` (entire project scaffold)
- Create: `src/constants/theme.ts`
- Create: `src/types/index.ts`
- Create: `app/_layout.tsx`
- Create: `app/(tabs)/_layout.tsx`
- Create: `app/(tabs)/index.tsx` (placeholder)

**Dependencies:** expo, expo-router, react-native-reanimated, expo-haptics, expo-av, @react-native-async-storage/async-storage, react-native-svg, expo-font, @expo-google-fonts/space-grotesk, @expo-google-fonts/inter

- [ ] **Step 1: Create Expo project**

```bash
cd /Users/nilsrobatscher
npx create-expo-app@latest BoxFit --template blank-typescript
cd BoxFit
```

- [ ] **Step 2: Install dependencies**

```bash
npx expo install expo-router expo-haptics expo-av @react-native-async-storage/async-storage react-native-svg react-native-reanimated expo-font @expo-google-fonts/space-grotesk @expo-google-fonts/inter expo-splash-screen expo-status-bar expo-symbols expo-linking expo-constants react-native-gesture-handler react-native-safe-area-context react-native-screens
```

- [ ] **Step 3: Create theme constants from Stitch design system**

Create `src/constants/theme.ts`:
```typescript
export const Colors = {
  background: '#131313',
  surface: '#131313',
  surfaceDim: '#131313',
  surfaceContainerLowest: '#0e0e0e',
  surfaceContainerLow: '#1c1b1b',
  surfaceContainer: '#201f1f',
  surfaceContainerHigh: '#2a2a2a',
  surfaceContainerHighest: '#353534',
  surfaceBright: '#393939',

  primary: '#ffb3b1',
  primaryContainer: '#ff535b',
  onPrimary: '#680011',
  onPrimaryContainer: '#5b000e',

  tertiary: '#6fd8cc',
  tertiaryContainer: '#2fa096',
  onTertiary: '#003733',
  onTertiaryContainer: '#00302c',

  secondary: '#c8c6c5',
  secondaryContainer: '#474746',
  onSecondary: '#303030',

  onSurface: '#e5e2e1',
  onSurfaceVariant: '#e4bebc',
  onBackground: '#e5e2e1',

  outline: '#ab8987',
  outlineVariant: '#5b403f',

  error: '#ffb4ab',
  errorContainer: '#93000a',
  onError: '#690005',

  inverseSurface: '#e5e2e1',
  inverseOnSurface: '#313030',
  inversePrimary: '#bb152c',

  // Day-specific accent colors
  dayColors: {
    1: '#4A90D9', // Mo: Blau - Push + Core
    2: '#4CAF50', // Di: Grün - Kondition + Beine
    3: '#9C27B0', // Mi: Lila - Pull + Core
    4: '#FF9800', // Do: Orange - Kondition + Ganzkörper
    5: '#E63946', // Fr: Rot - Vollgas Freitag
  } as Record<number, string>,
};

export const Fonts = {
  headline: 'SpaceGrotesk',
  body: 'Inter',
  label: 'Inter',
};

export const FontWeights = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  black: '900' as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};
```

- [ ] **Step 4: Create TypeScript types**

Create `src/types/index.ts`:
```typescript
export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscleGroups: string[];
  difficulty: 'Anfänger' | 'Mittel' | 'Fortgeschritten';
  equipment?: string;
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
  date: string; // ISO date string YYYY-MM-DD
  day: number;  // 1-5
}

export interface AppState {
  completedWorkouts: CompletedWorkout[];
  currentWeek: number;
  startDate: string; // ISO date when user started the program
  progressionChecklist: Record<string, boolean>;
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
```

- [ ] **Step 5: Configure app.json for expo-router**

Update `app.json`:
```json
{
  "expo": {
    "name": "BoxFit",
    "slug": "boxfit",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "boxfit",
    "userInterfaceStyle": "dark",
    "newArchEnabled": true,
    "splash": {
      "backgroundColor": "#131313"
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.boxfit.app"
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#131313"
      },
      "package": "com.boxfit.app"
    },
    "plugins": [
      "expo-router",
      "expo-font"
    ]
  }
}
```

- [ ] **Step 6: Create root layout with fonts and dark theme**

Create `app/_layout.tsx`:
```tsx
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import {
  useFonts,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { Colors } from '../src/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk: SpaceGrotesk_400Regular,
    'SpaceGrotesk-Medium': SpaceGrotesk_500Medium,
    'SpaceGrotesk-SemiBold': SpaceGrotesk_600SemiBold,
    'SpaceGrotesk-Bold': SpaceGrotesk_700Bold,
    Inter: Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: Colors.background }} />;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'slide_from_bottom',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="workout"
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </>
  );
}
```

- [ ] **Step 7: Create tab layout with custom bottom bar**

Create `app/(tabs)/_layout.tsx`:
```tsx
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Fonts } from '../../src/constants/theme';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    index: '🏠',
    uebungen: '💪',
    fortschritt: '📊',
    progression: '🔥',
  };
  const labels: Record<string, string> = {
    index: 'HOME',
    uebungen: 'ÜBUNGEN',
    fortschritt: 'STATS',
    progression: 'PFAD',
  };

  if (focused) {
    return (
      <View style={styles.activeTab}>
        <Text style={styles.activeIcon}>{icons[name]}</Text>
      </View>
    );
  }

  return (
    <View style={styles.inactiveTab}>
      <Text style={styles.inactiveIcon}>{icons[name]}</Text>
      <Text style={styles.tabLabel}>{labels[name]}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="index" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="uebungen"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="uebungen" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="fortschritt"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="fortschritt" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="progression"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="progression" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(28,27,27,0.8)',
    borderTopWidth: 0,
    height: 90,
    paddingTop: 8,
    paddingBottom: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    position: 'absolute',
    elevation: 0,
  },
  activeTab: {
    backgroundColor: Colors.primaryContainer,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  activeIcon: {
    fontSize: 24,
  },
  inactiveTab: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  inactiveIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
  tabLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 9,
    letterSpacing: 2,
    color: `${Colors.onSurface}99`,
  },
});
```

- [ ] **Step 8: Create placeholder home screen**

Create `app/(tabs)/index.tsx`:
```tsx
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../src/constants/theme';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>BoxFit</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: Colors.onSurface,
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 32,
  },
});
```

Create placeholder files for `app/(tabs)/uebungen.tsx`, `app/(tabs)/fortschritt.tsx`, `app/(tabs)/progression.tsx` with same pattern (different title text).

Create `app/workout.tsx` placeholder:
```tsx
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../src/constants/theme';

export default function WorkoutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Workout</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: Colors.onSurface,
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 32,
  },
});
```

- [ ] **Step 9: Verify app compiles and tabs navigate**

```bash
cd /Users/nilsrobatscher/BoxFit
npx expo start
```

Expected: App runs, shows 4 tabs, navigation works, fonts load.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: scaffold BoxFit Expo app with tabs, theme, and types"
```

---

## Task 2: Data Layer (Workout Definitions + Storage + Hooks)

**Files:**
- Create: `src/constants/workouts.ts`
- Create: `src/constants/exercises.ts`
- Create: `src/constants/progression.ts`
- Create: `src/hooks/useStorage.ts`
- Create: `src/hooks/useWorkoutState.ts`
- Create: `src/utils/dateUtils.ts`
- Create: `src/utils/workoutEngine.ts`

- [ ] **Step 1: Create workout definitions**

Create `src/constants/workouts.ts` with all 5 days:
```typescript
import { DayWorkout } from '../types';
import { Colors } from './theme';

export const WARMUP_EXERCISES = [
  'Armkreisen (30s)',
  'KB Halo (60s)',
  'Leichte KB Swings (60s)',
  'Schulterkreisen (30s)',
];

export const WARMUP_DURATION_SECONDS = 180; // 3 minutes

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
];
```

- [ ] **Step 2: Create exercise catalog**

Create `src/constants/exercises.ts` with all exercises:
```typescript
import { Exercise } from '../types';

export const EXERCISES: Exercise[] = [
  {
    id: 'dips',
    name: 'Dips',
    description: 'Stütze dich an der Dips-Station ab, senke den Körper kontrolliert ab und drücke dich explosiv nach oben.',
    muscleGroups: ['Brust', 'Trizeps', 'Schultern'],
    difficulty: 'Mittel',
    equipment: 'Dips-Station',
  },
  {
    id: 'kb-ohp',
    name: 'KB Overhead Press',
    description: 'Drücke die Kettlebell von der Schulter über den Kopf. Wechsle die Seite nach jeder Runde.',
    muscleGroups: ['Schultern', 'Trizeps'],
    difficulty: 'Mittel',
    equipment: 'Kettlebell',
  },
  {
    id: 'push-ups-close',
    name: 'Liegestütze (eng)',
    description: 'Enge Liegestütze mit Händen unter den Schultern. Ellenbogen nah am Körper halten.',
    muscleGroups: ['Brust', 'Trizeps'],
    difficulty: 'Anfänger',
  },
  {
    id: 'pike-push-ups',
    name: 'Pike Push-ups',
    description: 'Hüfte hoch in V-Position, Kopf Richtung Boden senken. Trainiert die Schultern intensiv.',
    muscleGroups: ['Schultern', 'Trizeps'],
    difficulty: 'Mittel',
  },
  {
    id: 'russian-twists',
    name: 'Russian Twists (KB)',
    description: 'Sitzend, Füße leicht angehoben, Kettlebell seitlich hin und her drehen.',
    muscleGroups: ['Core', 'Obliques'],
    difficulty: 'Mittel',
    equipment: 'Kettlebell',
  },
  {
    id: 'hanging-knee-raises',
    name: 'Hanging Knee Raises',
    description: 'An der Klimmzugstange hängen, Knie kontrolliert zur Brust ziehen.',
    muscleGroups: ['Core', 'Hüftbeuger'],
    difficulty: 'Mittel',
    equipment: 'Klimmzugstange',
  },
  {
    id: 'hanging-leg-raises',
    name: 'Hanging Leg Raises',
    description: 'An der Klimmzugstange hängen, gestreckte Beine bis auf Hüfthöhe anheben.',
    muscleGroups: ['Core', 'Hüftbeuger'],
    difficulty: 'Fortgeschritten',
    equipment: 'Klimmzugstange',
  },
  {
    id: 'kb-swings',
    name: 'KB Swings',
    description: 'Explosiver Hüftschwung mit der Kettlebell. Rücken gerade, Kraft aus der Hüfte.',
    muscleGroups: ['Ganzkörper', 'Hüfte', 'Rücken'],
    difficulty: 'Mittel',
    equipment: 'Kettlebell',
  },
  {
    id: 'goblet-squats',
    name: 'Goblet Squats',
    description: 'Kettlebell vor der Brust halten, tief in die Kniebeuge gehen. Rücken gerade.',
    muscleGroups: ['Beine', 'Core'],
    difficulty: 'Anfänger',
    equipment: 'Kettlebell',
  },
  {
    id: 'plyo-push-ups',
    name: 'Plyo-Liegestütze',
    description: 'Explosive Liegestütze mit Abdrücken vom Boden. Weiche Landung.',
    muscleGroups: ['Brust', 'Trizeps', 'Explosivkraft'],
    difficulty: 'Fortgeschritten',
  },
  {
    id: 'split-squats-l',
    name: 'Split Squats links',
    description: 'Ausfallschritt-Position, linkes Bein vorne. Kontrolliert absenken und hochdrücken.',
    muscleGroups: ['Beine', 'Gesäß'],
    difficulty: 'Anfänger',
  },
  {
    id: 'split-squats-r',
    name: 'Split Squats rechts',
    description: 'Ausfallschritt-Position, rechtes Bein vorne. Kontrolliert absenken und hochdrücken.',
    muscleGroups: ['Beine', 'Gesäß'],
    difficulty: 'Anfänger',
  },
  {
    id: 'high-knees',
    name: 'High Knees',
    description: 'Auf der Stelle laufen, Knie abwechselnd hoch zur Brust ziehen. Hohe Frequenz.',
    muscleGroups: ['Kardio', 'Beine'],
    difficulty: 'Anfänger',
  },
  {
    id: 'pull-ups',
    name: 'Klimmzüge',
    description: 'Breiter Obergriff an der Stange, Körper kontrolliert hochziehen bis Kinn über der Stange.',
    muscleGroups: ['Rücken', 'Bizeps', 'Schultern'],
    difficulty: 'Fortgeschritten',
    equipment: 'Klimmzugstange',
  },
  {
    id: 'kb-row-l',
    name: 'KB Row links',
    description: 'Vorgebeugt, linke Hand zieht Kettlebell zum Körper. Schulterblatt zusammenziehen.',
    muscleGroups: ['Rücken', 'Bizeps'],
    difficulty: 'Mittel',
    equipment: 'Kettlebell',
  },
  {
    id: 'kb-row-r',
    name: 'KB Row rechts',
    description: 'Vorgebeugt, rechte Hand zieht Kettlebell zum Körper. Schulterblatt zusammenziehen.',
    muscleGroups: ['Rücken', 'Bizeps'],
    difficulty: 'Mittel',
    equipment: 'Kettlebell',
  },
  {
    id: 'chin-ups',
    name: 'Chin-ups',
    description: 'Enger Untergriff an der Stange. Körper hochziehen, Bizeps und Rücken aktivieren.',
    muscleGroups: ['Bizeps', 'Rücken'],
    difficulty: 'Fortgeschritten',
    equipment: 'Klimmzugstange',
  },
  {
    id: 'kb-clean-press',
    name: 'KB Clean & Press',
    description: 'Kettlebell vom Boden zur Schulter cleanen, dann über Kopf drücken. Wechselseitig.',
    muscleGroups: ['Ganzkörper', 'Schultern'],
    difficulty: 'Fortgeschritten',
    equipment: 'Kettlebell',
  },
  {
    id: 'kb-snatch',
    name: 'KB Snatch',
    description: 'Explosive Bewegung: Kettlebell in einem Zug vom Boden über den Kopf. Wechselseitig.',
    muscleGroups: ['Ganzkörper', 'Schultern', 'Explosivkraft'],
    difficulty: 'Fortgeschritten',
    equipment: 'Kettlebell',
  },
  {
    id: 'mountain-climbers',
    name: 'Mountain Climbers',
    description: 'Liegestütz-Position, Knie abwechselnd schnell zur Brust ziehen.',
    muscleGroups: ['Kardio', 'Core', 'Schultern'],
    difficulty: 'Anfänger',
  },
  {
    id: 'kb-swing-single',
    name: 'KB Swing einarmig',
    description: 'Einarmiger Kettlebell Swing. Mehr Griffkraft und Rotationsstabilität gefordert.',
    muscleGroups: ['Ganzkörper', 'Griffkraft'],
    difficulty: 'Fortgeschritten',
    equipment: 'Kettlebell',
  },
  {
    id: 'hollow-body',
    name: 'Hollow Body Hold',
    description: 'Auf dem Rücken liegend, Arme und Beine gestreckt vom Boden heben. Unterer Rücken bleibt am Boden.',
    muscleGroups: ['Core'],
    difficulty: 'Mittel',
  },
  {
    id: 'kb-thrusters',
    name: 'KB Thrusters',
    description: 'Kombination aus Kniebeuge und Overhead Press in einer flüssigen Bewegung.',
    muscleGroups: ['Ganzkörper', 'Beine', 'Schultern'],
    difficulty: 'Fortgeschritten',
    equipment: 'Kettlebell',
  },
  {
    id: 'kb-woodchops',
    name: 'KB Woodchops',
    description: 'Diagonale Rotationsbewegung mit der Kettlebell von unten nach oben. Wechselseitig.',
    muscleGroups: ['Core', 'Obliques', 'Schultern'],
    difficulty: 'Mittel',
    equipment: 'Kettlebell',
  },
  {
    id: 'burpees',
    name: 'Burpees',
    description: 'Ganzkörperübung: hinlegen, aufspringen, Hände über Kopf. Maximales Tempo.',
    muscleGroups: ['Ganzkörper', 'Kardio'],
    difficulty: 'Fortgeschritten',
  },
  {
    id: 'plank',
    name: 'Plank',
    description: 'Unterarmstütz halten. Körper bildet eine gerade Linie. Core maximal anspannen.',
    muscleGroups: ['Core', 'Schultern'],
    difficulty: 'Anfänger',
  },
  {
    id: 'shadowboxing',
    name: 'Shadowboxing',
    description: 'Freies Boxen in der Luft. Kombinationen aus Jab, Cross, Haken und Ausweichbewegungen.',
    muscleGroups: ['Kardio', 'Schultern', 'Core', 'Technik'],
    difficulty: 'Mittel',
  },
  {
    id: 'kb-shrugs',
    name: 'KB Shrugs',
    description: 'Kettlebells seitlich halten, Schultern zu den Ohren hochziehen und langsam senken.',
    muscleGroups: ['Nacken', 'Trapez'],
    difficulty: 'Anfänger',
    equipment: 'Kettlebell',
  },
  {
    id: 'neck-bridges',
    name: 'Neck Bridges',
    description: 'Nackenbrücke halten. Vorsichtig ausführen, Nackenmuskulatur stärken.',
    muscleGroups: ['Nacken'],
    difficulty: 'Fortgeschritten',
  },
];
```

- [ ] **Step 3: Create progression rules**

Create `src/constants/progression.ts`:
```typescript
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
    tips: ['Zeit für die nächste KB-Stufe', 'Runden werden mehr – Tempo halten!'],
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
    tips: ['Mentale Stärke – durchhalten!', 'Atme rhythmisch beim Shadowboxing'],
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
    description: 'Alles geben – danach Deload-Woche.',
    changes: ['Maximale Intensität bei allem', 'Nach Woche 12: Deload-Woche empfohlen'],
    circuitRoundsBonus: 1,
    workSecondsBonus: 5,
    restSecondsBonus: -5,
    finisherRoundsBonus: 1,
    finisherRestSecondsBonus: -10,
    tips: ['Du bist am Ziel – volle Power!', 'Nach dem Programm: 1 Woche leichtes Training'],
  },
];

export function getProgressionForWeek(week: number): ProgressionLevel {
  const clamped = Math.min(Math.max(week, 1), 12);
  return PROGRESSION_LEVELS.find(
    (p) => clamped >= p.weekRange[0] && clamped <= p.weekRange[1]
  ) ?? PROGRESSION_LEVELS[0];
}
```

- [ ] **Step 4: Create date utilities**

Create `src/utils/dateUtils.ts`:
```typescript
import { CompletedWorkout } from '../types';

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function calculateStreak(workouts: CompletedWorkout[]): number {
  if (workouts.length === 0) return 0;

  const sorted = [...workouts]
    .map((w) => w.date)
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort()
    .reverse();

  const today = getTodayISO();
  let streak = 0;
  let checkDate = new Date(today);

  // If today isn't completed, start checking from yesterday
  if (sorted[0] !== today) {
    checkDate.setDate(checkDate.getDate() - 1);
    if (sorted[0] !== checkDate.toISOString().split('T')[0]) {
      return 0;
    }
  }

  for (const dateStr of sorted) {
    const expected = checkDate.toISOString().split('T')[0];
    if (dateStr === expected) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (dateStr < expected) {
      break;
    }
  }

  return streak;
}

export function getWeekNumber(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.min(Math.floor(diffDays / 7) + 1, 12);
}

export function getWorkoutsThisWeek(workouts: CompletedWorkout[]): number {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
  startOfWeek.setHours(0, 0, 0, 0);

  return workouts.filter((w) => new Date(w.date) >= startOfWeek).length;
}

export function getTrainingDayOfWeek(): number {
  const dayOfWeek = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  if (dayOfWeek === 0 || dayOfWeek === 6) return 0; // Rest day
  return dayOfWeek; // 1-5 maps to Tag 1-5
}

export function getHeatmapData(
  workouts: CompletedWorkout[],
  months: number = 6
): { date: string; count: number }[] {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const countMap: Record<string, number> = {};
  for (const w of workouts) {
    countMap[w.date] = (countMap[w.date] || 0) + 1;
  }

  const result: { date: string; count: number }[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    const key = current.toISOString().split('T')[0];
    result.push({ date: key, count: countMap[key] || 0 });
    current.setDate(current.getDate() + 1);
  }
  return result;
}

export function getWorkoutsPerWeek(
  workouts: CompletedWorkout[],
  weeks: number = 8
): { label: string; count: number }[] {
  const result: { label: string; count: number }[] = [];
  const now = new Date();

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1 - i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const count = workouts.filter((w) => {
      const d = new Date(w.date);
      return d >= weekStart && d <= weekEnd;
    }).length;

    const weekNum = Math.ceil(
      (weekStart.getTime() - new Date(weekStart.getFullYear(), 0, 1).getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    );

    result.push({
      label: i === 0 ? 'HEUTE' : `W${weekNum}`,
      count,
    });
  }
  return result;
}
```

- [ ] **Step 5: Create workout engine (applies progression to base workouts)**

Create `src/utils/workoutEngine.ts`:
```typescript
import { DayWorkout, ProgressionLevel } from '../types';
import { DAY_WORKOUTS } from '../constants/workouts';
import { getProgressionForWeek } from '../constants/progression';

export function getWorkoutForDay(day: number, week: number): DayWorkout {
  const base = DAY_WORKOUTS.find((w) => w.day === day);
  if (!base) throw new Error(`No workout for day ${day}`);

  const progression = getProgressionForWeek(week);
  return applyProgression(base, progression);
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
```

- [ ] **Step 6: Create storage hook**

Create `src/hooks/useStorage.ts`:
```typescript
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

  const saveState = async (newState: AppState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      setState(newState);
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  };

  const completeWorkout = useCallback(
    async (day: number) => {
      const workout: CompletedWorkout = { date: getTodayISO(), day };
      const newState = {
        ...state,
        completedWorkouts: [...state.completedWorkouts, workout],
      };
      await saveState(newState);
    },
    [state]
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
    [state]
  );

  const resetAll = useCallback(async () => {
    await saveState({ ...DEFAULT_STATE, startDate: getTodayISO() });
  }, []);

  return {
    state,
    isLoaded,
    completeWorkout,
    toggleChecklistItem,
    resetAll,
  };
}
```

- [ ] **Step 7: Create workout state hook**

Create `src/hooks/useWorkoutState.ts`:
```typescript
import { useMemo } from 'react';
import { AppState } from '../types';
import {
  calculateStreak,
  getWeekNumber,
  getWorkoutsThisWeek,
  getTrainingDayOfWeek,
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
      (w) => w.date === new Date().toISOString().split('T')[0]
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
```

- [ ] **Step 8: Commit data layer**

```bash
git add -A
git commit -m "feat: add workout definitions, exercises, progression, storage hooks"
```

---

## Task 3: Shared Components

**Files:**
- Create: `src/components/ProgressRing.tsx`
- Create: `src/components/WorkoutCard.tsx`
- Create: `src/components/StreakBadge.tsx`
- Create: `src/components/ExerciseCard.tsx`
- Create: `src/components/HeatmapCalendar.tsx`
- Create: `src/components/WeeklyBarChart.tsx`
- Create: `src/components/TimelineItem.tsx`
- Create: `src/components/TimerDisplay.tsx`
- Create: `src/components/PhaseIndicator.tsx`

- [ ] **Step 1: Create ProgressRing**

Create `src/components/ProgressRing.tsx`:
```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../constants/theme';

interface Props {
  progress: number; // 0-1
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  valueText?: string;
}

export function ProgressRing({
  progress,
  size = 192,
  strokeWidth = 12,
  label,
  sublabel,
  valueText,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.surfaceContainerHighest}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.primaryContainer}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.center}>
        {label && <Text style={styles.label}>{label}</Text>}
        {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
        {valueText && <Text style={styles.value}>{valueText}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  center: { position: 'absolute', alignItems: 'center' },
  label: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  sublabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 20,
    color: Colors.onSurface,
    marginTop: 4,
  },
  value: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 28,
    color: Colors.primary,
    marginTop: 2,
  },
});
```

- [ ] **Step 2: Create WorkoutCard**

Create `src/components/WorkoutCard.tsx`:
```tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Colors, BorderRadius } from '../constants/theme';
import { DayWorkout } from '../types';

interface Props {
  workout: DayWorkout;
  trainingDay: number;
  disabled?: boolean;
}

export function WorkoutCard({ workout, trainingDay, disabled }: Props) {
  const router = useRouter();

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push({
      pathname: '/workout',
      params: { day: String(workout.day) },
    });
  };

  return (
    <View style={[styles.outerBorder, { borderColor: workout.color + '40' }]}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={[styles.badge, { backgroundColor: workout.color + '30' }]}>
            <Text style={[styles.badgeText, { color: workout.color }]}>STRENGTH FOCUS</Text>
          </View>
          <Text style={styles.dayLabel}>• Tag {trainingDay} von 5</Text>
        </View>

        <Text style={styles.title}>
          TAG {workout.day} – {workout.title.toUpperCase()}
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoText}>⏱ Dauer: ~40 Min</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>⚡ Intensität: Hoch</Text>
        </View>

        <View style={styles.tags}>
          <Text style={styles.tagsLabel}>FOKUSBEREICHE</Text>
          <View style={styles.tagRow}>
            {workout.circuit.exercises.slice(0, 3).map((e, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{e.name.split(' ')[0]}</Text>
              </View>
            ))}
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: workout.color },
            pressed && { transform: [{ scale: 0.96 }] },
            disabled && { opacity: 0.5 },
          ]}
          onPress={handlePress}
          disabled={disabled}
        >
          <Text style={styles.buttonText}>
            {disabled ? 'BEREITS TRAINIERT ✓' : 'WORKOUT STARTEN'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerBorder: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: 1,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.lg - 2,
    padding: 24,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 10, letterSpacing: 2 },
  dayLabel: { color: Colors.onSurfaceVariant, fontSize: 12, fontFamily: 'Inter-Medium' },
  title: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 28,
    color: Colors.onSurface,
    letterSpacing: -1,
    marginBottom: 12,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  infoText: { color: Colors.onSurfaceVariant, fontFamily: 'Inter-Medium', fontSize: 14 },
  tags: { marginTop: 12, marginBottom: 20 },
  tagsLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.onSurfaceVariant,
    marginBottom: 8,
  },
  tagRow: { flexDirection: 'row', gap: 8 },
  tag: {
    backgroundColor: Colors.surfaceContainerHighest,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tagText: { color: Colors.onSurface, fontFamily: 'Inter-SemiBold', fontSize: 12 },
  button: {
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff535b',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  buttonText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 16,
    letterSpacing: 2,
    color: '#fff',
  },
});
```

- [ ] **Step 3: Create StreakBadge**

Create `src/components/StreakBadge.tsx`:
```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';

interface Props {
  streak: number;
}

export function StreakBadge({ streak }: Props) {
  const message =
    streak >= 10 ? 'Unaufhaltbar!' :
    streak >= 5 ? 'Du bist in der Zone, bleib dran!' :
    streak >= 3 ? 'Guter Lauf!' :
    streak >= 1 ? 'Weiter so!' :
    'Starte deine Serie!';

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>🔥</Text>
      </View>
      <View>
        <Text style={styles.count}>{streak} Tage Streak</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    backgroundColor: Colors.primaryContainer + '30',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 24 },
  count: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, color: Colors.onSurface },
  message: { fontFamily: 'Inter-Medium', fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 2 },
});
```

- [ ] **Step 4: Create ExerciseCard**

Create `src/components/ExerciseCard.tsx`:
```tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';
import { Exercise } from '../types';

interface Props {
  exercise: Exercise;
  onPress?: () => void;
}

const difficultyColors: Record<string, { bg: string; text: string }> = {
  Anfänger: { bg: 'rgba(76,175,80,0.2)', text: '#66BB6A' },
  Mittel: { bg: 'rgba(255,152,0,0.2)', text: '#FFA726' },
  Fortgeschritten: { bg: 'rgba(255,83,91,0.2)', text: Colors.primary },
};

export function ExerciseCard({ exercise, onPress }: Props) {
  const dc = difficultyColors[exercise.difficulty] ?? difficultyColors.Mittel;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{exercise.name}</Text>
          <View style={[styles.diffBadge, { backgroundColor: dc.bg }]}>
            <Text style={[styles.diffText, { color: dc.text }]}>{exercise.difficulty}</Text>
          </View>
        </View>
        {exercise.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {exercise.description}
          </Text>
        ) : null}
        <View style={styles.tags}>
          {exercise.muscleGroups.map((m) => (
            <View key={m} style={styles.tag}>
              <Text style={styles.tagText}>{m}</Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 16,
  },
  content: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  name: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, color: Colors.onSurface, flex: 1 },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  diffText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase' },
  description: { fontFamily: 'Inter', fontSize: 13, color: Colors.onSurfaceVariant, marginBottom: 8 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: Colors.surfaceContainerHighest, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  tagText: { fontFamily: 'Inter-SemiBold', fontSize: 10, color: Colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 1 },
});
```

- [ ] **Step 5: Create HeatmapCalendar**

Create `src/components/HeatmapCalendar.tsx`:
```tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';

interface Props {
  data: { date: string; count: number }[];
}

function getColor(count: number): string {
  if (count === 0) return Colors.surfaceContainerHigh;
  if (count === 1) return Colors.primaryContainer + '60';
  return Colors.primaryContainer;
}

export function HeatmapCalendar({ data }: Props) {
  // Group into weeks (columns of 7)
  const weeks: { date: string; count: number }[][] = [];
  let currentWeek: { date: string; count: number }[] = [];

  // Pad start to align to Monday
  const firstDay = new Date(data[0]?.date ?? new Date());
  const dayOfWeek = (firstDay.getDay() + 6) % 7; // Mon=0
  for (let i = 0; i < dayOfWeek; i++) {
    currentWeek.push({ date: '', count: -1 });
  }

  for (const d of data) {
    currentWeek.push(d);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>TRAINING FREQUENZ</Text>
        <Text style={styles.subtitle}>LETZTE 6 MONATE</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.grid}>
          {weeks.map((week, wi) => (
            <View key={wi} style={styles.column}>
              {week.map((day, di) => (
                <View
                  key={di}
                  style={[
                    styles.cell,
                    {
                      backgroundColor:
                        day.count < 0 ? 'transparent' : getColor(day.count),
                    },
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.legend}>
        <Text style={styles.legendText}>Weniger</Text>
        <View style={[styles.legendCell, { backgroundColor: Colors.surfaceContainerHigh }]} />
        <View style={[styles.legendCell, { backgroundColor: Colors.primaryContainer + '40' }]} />
        <View style={[styles.legendCell, { backgroundColor: Colors.primaryContainer + '80' }]} />
        <View style={[styles.legendCell, { backgroundColor: Colors.primaryContainer }]} />
        <Text style={styles.legendText}>Mehr</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: Colors.surfaceContainerLow, borderRadius: 16, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: Colors.onSurface, letterSpacing: 1 },
  subtitle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 10, color: Colors.onSurfaceVariant, letterSpacing: 2 },
  grid: { flexDirection: 'row', gap: 3 },
  column: { flexDirection: 'column', gap: 3 },
  cell: { width: 14, height: 14, borderRadius: 3 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 12 },
  legendText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 9, color: Colors.onSurfaceVariant, letterSpacing: 2 },
  legendCell: { width: 12, height: 12, borderRadius: 2 },
});
```

- [ ] **Step 6: Create WeeklyBarChart**

Create `src/components/WeeklyBarChart.tsx`:
```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';

interface Props {
  data: { label: string; count: number }[];
  average?: number;
}

export function WeeklyBarChart({ data, average }: Props) {
  const maxCount = Math.max(...data.map((d) => d.count), 5);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>WÖCHENTLICHE AKTIVITÄT</Text>
          <Text style={styles.subtitle}>WORKOUTS PRO WOCHE</Text>
        </View>
        {average !== undefined && (
          <View style={styles.avgWrap}>
            <Text style={styles.avgValue}>{average.toFixed(1)}</Text>
            <Text style={styles.avgLabel}>Ø PRO WOCHE</Text>
          </View>
        )}
      </View>
      <View style={styles.bars}>
        {data.map((item, i) => (
          <View key={i} style={styles.barCol}>
            <View style={[styles.barBg, { height: 160 }]}>
              <View
                style={[
                  styles.barFill,
                  { height: maxCount > 0 ? (item.count / maxCount) * 160 : 0 },
                ]}
              />
            </View>
            <Text style={styles.barLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: Colors.surfaceContainerLow, borderRadius: 16, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 },
  title: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 16, color: Colors.onSurface, letterSpacing: -0.5 },
  subtitle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 10, color: Colors.tertiary, letterSpacing: 2, marginTop: 2 },
  avgWrap: { alignItems: 'flex-end' },
  avgValue: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 32, color: Colors.onSurface },
  avgLabel: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 9, color: Colors.onSurfaceVariant, letterSpacing: 2 },
  bars: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  barCol: { alignItems: 'center', flex: 1 },
  barBg: {
    width: 32,
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: 999,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 999,
    backgroundColor: Colors.primaryContainer,
  },
  barLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 9,
    color: Colors.onSurfaceVariant,
    marginTop: 8,
    letterSpacing: 1,
  },
});
```

- [ ] **Step 7: Create TimerDisplay**

Create `src/components/TimerDisplay.tsx`:
```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../constants/theme';

interface Props {
  secondsRemaining: number;
  totalSeconds: number;
  isResting: boolean;
  size?: number;
}

export function TimerDisplay({ secondsRemaining, totalSeconds, isResting, size = 256 }: Props) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? secondsRemaining / totalSeconds : 0;
  const strokeDashoffset = circumference * (1 - progress);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.surfaceContainerHighest}
          strokeWidth={4}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isResting ? Colors.tertiary : Colors.primaryContainer}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.time}>{timeStr}</Text>
        <Text style={[styles.label, { color: isResting ? Colors.tertiary : Colors.primaryContainer }]}>
          {isResting ? 'PAUSE' : 'WORK'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  center: { position: 'absolute', alignItems: 'center' },
  time: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 56, color: Colors.onSurface, letterSpacing: -2 },
  label: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 11, letterSpacing: 4, marginTop: 4 },
});
```

- [ ] **Step 8: Create PhaseIndicator and TimelineItem**

Create `src/components/PhaseIndicator.tsx`:
```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';
import { WorkoutPhase } from '../types';

interface Props {
  currentPhase: WorkoutPhase;
}

const PHASES: WorkoutPhase[] = ['warmup', 'circuit', 'finisher', 'closing'];

export function PhaseIndicator({ currentPhase }: Props) {
  const currentIdx = PHASES.indexOf(currentPhase);

  return (
    <View style={styles.container}>
      {PHASES.map((phase, i) => (
        <View
          key={phase}
          style={[
            styles.segment,
            { backgroundColor: i <= currentIdx ? Colors.primaryContainer : Colors.surfaceContainerHighest },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 4,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 999,
    padding: 4,
  },
  segment: { flex: 1, height: 6, borderRadius: 999 },
});
```

Create `src/components/TimelineItem.tsx`:
```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';
import { ProgressionLevel } from '../types';

interface Props {
  level: ProgressionLevel;
  isActive: boolean;
  isCompleted: boolean;
  isLast: boolean;
}

export function TimelineItem({ level, isActive, isCompleted, isLast }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.timeline}>
        <View
          style={[
            styles.dot,
            isActive && styles.dotActive,
            isCompleted && styles.dotCompleted,
          ]}
        >
          {isCompleted && <Text style={styles.check}>✓</Text>}
        </View>
        {!isLast && (
          <View style={[styles.line, isCompleted && styles.lineCompleted]} />
        )}
      </View>
      <View
        style={[
          styles.card,
          isActive && styles.cardActive,
          !isActive && !isCompleted && styles.cardLocked,
        ]}
      >
        <Text style={[styles.phase, isActive && { color: Colors.primary }]}>
          {isActive ? 'AKTIVE PHASE' : isCompleted ? 'ABGESCHLOSSEN' : 'NÄCHSTER SCHRITT'}
        </Text>
        <Text style={styles.title}>
          Woche {level.weekRange[0]}-{level.weekRange[1]}: {level.label}
        </Text>
        <Text style={styles.desc}>{level.description}</Text>
        {isActive && level.changes.length > 0 && (
          <View style={styles.changes}>
            {level.changes.map((c, i) => (
              <Text key={i} style={styles.changeItem}>• {c}</Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 16 },
  timeline: { alignItems: 'center', width: 48 },
  dot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '50',
  },
  dotActive: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.primaryContainer,
    shadowColor: Colors.primaryContainer,
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  dotCompleted: {
    backgroundColor: Colors.tertiaryContainer,
    borderColor: Colors.tertiaryContainer,
  },
  check: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.surfaceContainerHigh,
    marginVertical: 4,
  },
  lineCompleted: { backgroundColor: Colors.tertiaryContainer },
  card: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardActive: { borderLeftWidth: 3, borderLeftColor: Colors.primary },
  cardLocked: { opacity: 0.5 },
  phase: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.onSurfaceVariant,
    marginBottom: 4,
  },
  title: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 16, color: Colors.onSurface, marginBottom: 4 },
  desc: { fontFamily: 'Inter', fontSize: 13, color: Colors.onSurfaceVariant },
  changes: { marginTop: 12 },
  changeItem: { fontFamily: 'Inter-Medium', fontSize: 13, color: Colors.onSurface, marginBottom: 4 },
});
```

- [ ] **Step 9: Commit components**

```bash
git add -A
git commit -m "feat: add shared UI components (rings, cards, charts, timer)"
```

---

## Task 4: Home Screen

**Files:**
- Modify: `app/(tabs)/index.tsx`

- [ ] **Step 1: Implement full Home screen**

Rewrite `app/(tabs)/index.tsx` with:
- Top greeting bar ("Guten Morgen, Champ!")
- ProgressRing showing current week/12
- StreakBadge
- Stats row (calories placeholder, workouts this week)
- WorkoutCard for today (or rest day message)
- "Morgen geplant" preview section

The screen uses `useStorage` and `useWorkoutState` hooks. ScrollView with safe area insets. Match the Stitch home-screen design. Rest day shows a relaxed message instead of workout card.

- [ ] **Step 2: Verify home screen renders correctly**

```bash
npx expo start
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: implement Home screen with progress ring, streak, workout card"
```

---

## Task 5: Übungen Screen

**Files:**
- Modify: `app/(tabs)/uebungen.tsx`

- [ ] **Step 1: Implement Übungen screen**

Full exercise library screen with:
- Search bar (filters by name)
- Filter chips: ALLE, BEINE, OBERKÖRPER, CORE, BOXEN, KARDIO
- Scrollable list of ExerciseCard components
- Expandable card detail on press (shows full description)

Uses the `EXERCISES` array from constants. Filter logic is local state.

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: implement Übungen screen with search and filter"
```

---

## Task 6: Fortschritt Screen

**Files:**
- Modify: `app/(tabs)/fortschritt.tsx`

- [ ] **Step 1: Implement Fortschritt screen**

Stats dashboard with:
- Title section "STATISTIKEN"
- Bento grid: Gesamt Workouts, Rekord Streak, Aktuelle Woche
- HeatmapCalendar component
- WeeklyBarChart component
- Achievement/goal card at bottom

Uses `useStorage` + `useWorkoutState` hooks + date utils.

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: implement Fortschritt screen with heatmap and charts"
```

---

## Task 7: Progression Screen

**Files:**
- Modify: `app/(tabs)/progression.tsx`

- [ ] **Step 1: Implement Progression screen**

12-week journey screen with:
- Title "12-WOCHEN-PFAD"
- Vertical timeline using TimelineItem components
- Active phase highlighted, completed phases checked, future locked
- Bento stats (Gesamtfortschritt %, calories, time)
- Checklist section with toggleable items from `progressionChecklist`
- Motivational banner at bottom

Uses `useStorage` + progression constants.

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: implement Progression screen with timeline and checklist"
```

---

## Task 8: Timer Hooks & Sound

**Files:**
- Create: `src/hooks/useTimer.ts`
- Create: `src/hooks/useSound.ts`
- Create: `assets/sounds/` (generate simple beep/gong)

- [ ] **Step 1: Create timer hook**

Create `src/hooks/useTimer.ts`:
```typescript
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

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

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
          onComplete.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const pause = useCallback(() => {
    clearTimer();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    if (!isPaused) return;
    setIsPaused(false);

    intervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          onComplete.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [isPaused]);

  const reset = useCallback(() => {
    clearTimer();
    setSecondsRemaining(0);
    setIsRunning(false);
    setIsPaused(false);
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, []);

  return { secondsRemaining, isRunning, isPaused, start, pause, resume, reset, onComplete };
}
```

- [ ] **Step 2: Create sound hook**

Create `src/hooks/useSound.ts`:
```typescript
import { useRef, useEffect } from 'react';
import { Audio } from 'expo-av';

export function useSound() {
  const beepRef = useRef<Audio.Sound | null>(null);
  const gongRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });

    return () => {
      beepRef.current?.unloadAsync();
      gongRef.current?.unloadAsync();
    };
  }, []);

  const playBeep = async () => {
    try {
      if (beepRef.current) {
        await beepRef.current.replayAsync();
      } else {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/beep.mp3')
        );
        beepRef.current = sound;
        await sound.playAsync();
      }
    } catch (e) {
      console.warn('Beep sound failed:', e);
    }
  };

  const playGong = async () => {
    try {
      if (gongRef.current) {
        await gongRef.current.replayAsync();
      } else {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/gong.mp3')
        );
        gongRef.current = sound;
        await sound.playAsync();
      }
    } catch (e) {
      console.warn('Gong sound failed:', e);
    }
  };

  return { playBeep, playGong };
}
```

- [ ] **Step 3: Generate placeholder sound files**

Use `expo-av` compatible short audio files. Create minimal beep/gong mp3 files (can use ffmpeg to generate sine wave tones):
```bash
# Generate a short beep (440Hz, 0.2s)
ffmpeg -f lavfi -i "sine=frequency=880:duration=0.15" -ar 44100 assets/sounds/beep.mp3
# Generate a gong-like tone (lower frequency, longer, with fade)
ffmpeg -f lavfi -i "sine=frequency=200:duration=1.5" -af "afade=t=out:st=0.5:d=1" -ar 44100 assets/sounds/gong.mp3
# Generate countdown beep
ffmpeg -f lavfi -i "sine=frequency=660:duration=0.1" -ar 44100 assets/sounds/countdown.mp3
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add timer hook, sound hook, and audio assets"
```

---

## Task 9: Workout Screen (The Big One)

**Files:**
- Modify: `app/workout.tsx`

- [ ] **Step 1: Implement workout screen state machine**

The workout screen manages a multi-phase workout:
1. **Warmup** (3 min countdown with exercise list)
2. **Circuit** (exercise intervals: work/rest × exercises × rounds)
3. **Finisher** (Shadowboxing rounds with gong)
4. **Closing** (display closing exercise info, manual completion)
5. **Done** (completion summary, save workout)

State machine approach: `currentPhase`, `exerciseIndex`, `roundIndex`, `isResting`. Timer hook drives countdown. On timer complete → advance to next state. Haptic feedback on phase transitions. Sound on work/rest transitions.

Full screen with:
- PhaseIndicator at top
- Exercise name + round counter
- TimerDisplay (large circular timer)
- Stats row (target heart rate, estimated calories)
- Next exercise preview
- Pause/Skip controls
- Bottom: skip previous / pause / skip next

On completion: call `completeWorkout(day)` and navigate back.

- [ ] **Step 2: Wire up haptics**

Add `Haptics.impactAsync()` on:
- Phase transitions (Heavy)
- Work → Rest transitions (Medium)
- Rest → Work transitions (Light)
- Workout completion (Success notification)

- [ ] **Step 3: Test full workout flow**

Run app, start a workout, verify:
- Warmup counts down from 3:00
- Circuit cycles through exercises with work/rest
- Rounds increment correctly
- Finisher uses gong sound
- Closing shows exercise info
- Done screen saves workout

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: implement workout screen with timer, phases, sound, haptics"
```

---

## Task 10: Polish & Integration

**Files:**
- Various touch-ups across all files

- [ ] **Step 1: Add keep-awake during workout**

Install `expo-keep-awake` and activate during workout screen.

- [ ] **Step 2: Add animated transitions**

Use `react-native-reanimated` for:
- FadeIn on screen mount
- Scale animation on workout card press
- Timer number change animation (optional)

- [ ] **Step 3: Handle edge cases**

- App backgrounding during workout (timer continues)
- Empty state for fresh install (no completed workouts)
- Week rollover when program ends (suggest restart)

- [ ] **Step 4: Final test and commit**

```bash
git add -A
git commit -m "feat: polish with animations, keep-awake, edge case handling"
```

---

## Dependency Graph

```
Task 1 (Scaffold) → Task 2 (Data) → Task 3 (Components) → Task 4 (Home)
                                                          → Task 5 (Übungen)
                                                          → Task 6 (Fortschritt)
                                                          → Task 7 (Progression)
                                  → Task 8 (Timer/Sound)  → Task 9 (Workout)
                                                                    ↓
                                                          Task 10 (Polish)
```

Tasks 4-7 are independent once Task 3 is done. Task 9 depends on Tasks 3 + 8. Task 10 is last.
