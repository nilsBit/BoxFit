import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStorage } from '../../src/hooks/useStorage';
import { useWorkoutState } from '../../src/hooks/useWorkoutState';
import { ProgressRing } from '../../src/components/ProgressRing';
import { StreakBadge } from '../../src/components/StreakBadge';
import { WorkoutCard } from '../../src/components/WorkoutCard';
import { DAY_WORKOUTS } from '../../src/constants/workouts';
import { getWorkoutForDay, getAllWorkouts } from '../../src/utils/workoutEngine';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { DayWorkout } from '../../src/types';

const C = {
  background: '#131313',
  surfaceContainerLow: '#1c1b1b',
  surfaceContainerHighest: '#353534',
  primary: '#ffb3b1',
  primaryContainer: '#ff535b',
  onSurface: '#e5e2e1',
  onSurfaceVariant: '#e4bebc',
  tertiary: '#6fd8cc',
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Guten Morgen';
  if (h < 18) return 'Guten Tag';
  return 'Guten Abend';
}

function WorkoutMiniCard({ workout, icon, isStretching }: { workout: DayWorkout; icon: string; isStretching: boolean }) {
  const router = useRouter();
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: '/workout', params: { day: String(workout.day) } });
  };
  return (
    <Pressable
      style={({ pressed }) => [styles.miniCard, pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }]}
      onPress={handlePress}
    >
      <View style={[styles.miniCardIcon, { backgroundColor: workout.color + '25' }]}>
        <Text style={{ fontSize: 22 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.miniCardTitle}>
          {isStretching ? workout.title : `Tag ${workout.day} – ${workout.title}`}
        </Text>
        <Text style={styles.miniCardSubtitle}>{workout.subtitle}</Text>
        <View style={styles.miniCardMeta}>
          <Text style={[styles.miniCardMetaText, { color: workout.color }]}>
            {isStretching ? '🧘 ~20 Min' : `⏱ ~40 Min`}
          </Text>
          <Text style={styles.miniCardMetaText}>
            {workout.circuit.exercises.length} Übungen
          </Text>
        </View>
      </View>
      <Text style={{ color: workout.color, fontSize: 18 }}>›</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { state, isLoaded } = useStorage();
  const ws = useWorkoutState(state);

  if (!isLoaded) {
    return <View style={styles.container} />;
  }

  const progressPercent = ws.currentWeek / 12;
  const nextDay = ws.trainingDay < 5 ? ws.trainingDay + 1 : 0;
  const nextWorkout = nextDay > 0 ? getWorkoutForDay(nextDay, ws.currentWeek) : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.champ}>CHAMP!</Text>
          </View>
          <Pressable
            style={styles.settingsBtn}
            onPress={() => router.push('/settings')}
          >
            <Text style={{ fontSize: 20 }}>⚙️</Text>
          </Pressable>
        </View>

        {/* Progress Ring + Stats */}
        <View style={styles.heroSection}>
          <View style={styles.ringCard}>
            <ProgressRing
              progress={progressPercent}
              label={`Phase ${Math.ceil(ws.currentWeek / 2)}`}
              sublabel={`Woche ${ws.currentWeek} / 12`}
              valueText={`${Math.round(progressPercent * 100)}%`}
            />
          </View>

          <View style={styles.statsColumn}>
            <StreakBadge streak={ws.streak} />
            <View style={styles.miniStats}>
              <View style={styles.miniStat}>
                <Text style={styles.miniStatLabel}>WORKOUTS</Text>
                <Text style={styles.miniStatValue}>
                  {ws.workoutsThisWeek}{' '}
                  <Text style={styles.miniStatUnit}>diese Woche</Text>
                </Text>
              </View>
              <View style={styles.miniStat}>
                <Text style={styles.miniStatLabel}>GESAMT</Text>
                <Text style={styles.miniStatValue}>
                  {ws.totalWorkouts}{' '}
                  <Text style={styles.miniStatUnit}>total</Text>
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Today's Workout */}
        {ws.isRestDay ? (
          <View style={styles.restDayCard}>
            <Text style={styles.restDayIcon}>😴</Text>
            <Text style={styles.restDayTitle}>RUHETAG</Text>
            <Text style={styles.restDayText}>
              Gönne deinem Körper die Erholung. Morgen geht's weiter!
            </Text>
          </View>
        ) : ws.todayWorkout ? (
          <WorkoutCard
            workout={ws.todayWorkout}
            trainingDay={ws.trainingDay}
            disabled={ws.todayCompleted}
          />
        ) : null}

        {/* Sparring Trainer */}
        <Pressable
          style={({ pressed }) => [styles.sparringCard, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); router.push('/sparring'); }}
        >
          <View style={styles.sparringContent}>
            <Text style={{ fontSize: 36 }}>🥊</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.sparringTitle}>SPARRING TRAINER</Text>
              <Text style={styles.sparringSub}>Kombos, Defense-Calls & Konter</Text>
            </View>
            <Text style={{ fontSize: 18, color: '#fff' }}>›</Text>
          </View>
        </Pressable>

        {/* All Workouts */}
        <View style={styles.allWorkoutsSection}>
          <Text style={styles.sectionLabel}>ALLE WORKOUTS</Text>
          <Text style={styles.sectionHint}>Wähle ein beliebiges Workout</Text>
          {getAllWorkouts().map((w) => {
            const isStretching = w.day === 6;
            const dayIcon = isStretching ? '🧘' : w.day <= 5 ? ['💪', '🏃', '🧗', '⚡', '🔥'][w.day - 1] : '💪';
            return (
              <WorkoutMiniCard
                key={w.day}
                workout={w}
                icon={dayIcon}
                isStretching={isStretching}
              />
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  content: { paddingHorizontal: 20, gap: 24 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  greeting: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    letterSpacing: 2,
    color: C.primary,
    textTransform: 'uppercase',
  },
  champ: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 22,
    color: C.onSurface,
    letterSpacing: -0.5,
  },
  settingsBtn: {
    backgroundColor: C.surfaceContainerHighest,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSection: { gap: 16 },
  ringCard: {
    backgroundColor: C.surfaceContainerLow,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  statsColumn: { gap: 12 },
  miniStats: { flexDirection: 'row', gap: 12 },
  miniStat: {
    flex: 1,
    backgroundColor: C.surfaceContainerLow,
    borderRadius: 16,
    padding: 14,
  },
  miniStatLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 9,
    letterSpacing: 2,
    color: C.onSurfaceVariant,
    marginBottom: 6,
  },
  miniStatValue: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 20,
    color: C.onSurface,
  },
  miniStatUnit: {
    fontSize: 11,
    fontFamily: 'Inter',
    color: C.onSurfaceVariant,
    opacity: 0.6,
  },
  restDayCard: {
    backgroundColor: C.surfaceContainerLow,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  restDayIcon: { fontSize: 48 },
  restDayTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 24,
    color: C.onSurface,
    letterSpacing: 2,
  },
  restDayText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: C.onSurfaceVariant,
    textAlign: 'center',
  },
  nextSection: { gap: 10 },
  nextLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    letterSpacing: 3,
    color: C.onSurfaceVariant,
  },
  nextCard: {
    backgroundColor: C.surfaceContainerLow,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nextIconWrap: {
    width: 44,
    height: 44,
    backgroundColor: C.surfaceContainerHighest,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 15,
    color: C.onSurface,
  },
  nextSubtitle: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: C.onSurfaceVariant,
    marginTop: 2,
  },
  sparringCard: {
    backgroundColor: '#ff535b20',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ff535b50',
    overflow: 'hidden',
  },
  sparringContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
  },
  sparringTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 18,
    color: '#ff535b',
    letterSpacing: 1,
  },
  sparringSub: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: C.onSurfaceVariant,
    marginTop: 2,
  },
  allWorkoutsSection: { gap: 10 },
  sectionLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11,
    letterSpacing: 3,
    color: C.onSurfaceVariant,
  },
  sectionHint: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: C.onSurfaceVariant,
    opacity: 0.6,
    marginBottom: 4,
  },
  miniCard: {
    backgroundColor: C.surfaceContainerLow,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  miniCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniCardTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 15,
    color: C.onSurface,
    letterSpacing: -0.3,
  },
  miniCardSubtitle: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: C.onSurfaceVariant,
    marginTop: 1,
  },
  miniCardMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  miniCardMetaText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: C.onSurfaceVariant,
    opacity: 0.7,
  },
});
