import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStorage } from '../../src/hooks/useStorage';
import { useWorkoutState } from '../../src/hooks/useWorkoutState';
import { HeatmapCalendar } from '../../src/components/HeatmapCalendar';
import { WeeklyBarChart } from '../../src/components/WeeklyBarChart';
import { getHeatmapData, getWorkoutsPerWeek, calculateStreak } from '../../src/utils/dateUtils';

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

export default function FortschrittScreen() {
  const { state, isLoaded } = useStorage();
  const ws = useWorkoutState(state);

  if (!isLoaded) {
    return <View style={styles.container} />;
  }

  const heatmapData = getHeatmapData(state.completedWorkouts);
  const weeklyData = getWorkoutsPerWeek(state.completedWorkouts);
  const avgPerWeek =
    weeklyData.length > 0
      ? weeklyData.reduce((sum, w) => sum + w.count, 0) / weeklyData.length
      : 0;

  const maxStreak = (() => {
    if (state.completedWorkouts.length === 0) return 0;
    const dates = [...new Set(state.completedWorkouts.map((w) => w.date))].sort();
    let max = 1;
    let current = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1] + 'T12:00:00');
      const curr = new Date(dates[i] + 'T12:00:00');
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        current++;
        max = Math.max(max, current);
      } else {
        current = 1;
      }
    }
    return max;
  })();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.title}>STATISTIKEN</Text>
        <Text style={styles.subtitle}>DEIN FORTSCHRITT IM ÜBERBLICK</Text>

        {/* Bento Stats */}
        <View style={styles.bentoGrid}>
          <View style={[styles.bentoCard, styles.bentoWide]}>
            <Text style={styles.bentoLabel}>GESAMT WORKOUTS</Text>
            <View style={styles.bentoRow}>
              <Text style={styles.bentoValueLarge}>{ws.totalWorkouts}</Text>
              <Text style={{ fontSize: 20 }}>⚡</Text>
            </View>
          </View>
          <View style={styles.bentoCard}>
            <Text style={styles.bentoLabel}>REKORD STREAK</Text>
            <View style={styles.bentoRow}>
              <Text style={styles.bentoValue}>{maxStreak}</Text>
              <Text style={styles.bentoUnit}>TAGE</Text>
            </View>
          </View>
          <View style={styles.bentoCard}>
            <Text style={styles.bentoLabel}>AKTUELLE WOCHE</Text>
            <View style={styles.bentoRow}>
              <Text style={styles.bentoValue}>{ws.currentWeek}</Text>
              <Text style={{ fontSize: 16 }}>⭐</Text>
            </View>
          </View>
        </View>

        {/* Heatmap */}
        <HeatmapCalendar data={heatmapData} />

        {/* Weekly Chart */}
        <WeeklyBarChart data={weeklyData} average={avgPerWeek} />

        {/* Goal Card */}
        <View style={styles.goalCard}>
          <Text style={styles.goalLabel}>NÄCHSTES ZIEL</Text>
          <Text style={styles.goalTitle}>
            {ws.totalWorkouts < 10
              ? '10 WORKOUTS'
              : ws.totalWorkouts < 30
              ? '30 WORKOUTS'
              : ws.totalWorkouts < 60
              ? '60 WORKOUTS'
              : '100 WORKOUTS'}
          </Text>
          <Text style={styles.goalText}>
            Noch{' '}
            {(ws.totalWorkouts < 10
              ? 10
              : ws.totalWorkouts < 30
              ? 30
              : ws.totalWorkouts < 60
              ? 60
              : 100) - ws.totalWorkouts}{' '}
            Einheiten bis zum nächsten Badge.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  content: { paddingHorizontal: 20, gap: 20 },
  title: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 32,
    color: C.primary,
    letterSpacing: -1,
    marginTop: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: C.onSurfaceVariant,
    letterSpacing: 2,
    marginBottom: 4,
  },
  bentoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bentoWide: { flexBasis: '100%' },
  bentoCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: C.surfaceContainerLow,
    borderRadius: 16,
    padding: 18,
  },
  bentoLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    letterSpacing: 2,
    color: C.onSurfaceVariant,
    marginBottom: 12,
  },
  bentoRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  bentoValueLarge: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 44,
    color: C.onSurface,
  },
  bentoValue: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 32,
    color: C.onSurface,
  },
  bentoUnit: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12,
    color: C.onSurfaceVariant,
    letterSpacing: -0.5,
  },
  goalCard: {
    backgroundColor: C.surfaceContainerLow,
    borderRadius: 16,
    padding: 24,
  },
  goalLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11,
    letterSpacing: 3,
    color: C.primary,
    marginBottom: 8,
  },
  goalTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 28,
    color: C.onSurface,
    letterSpacing: -1,
    marginBottom: 4,
  },
  goalText: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: C.onSurfaceVariant,
  },
});
