import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStorage } from '../../src/hooks/useStorage';
import { useWorkoutState } from '../../src/hooks/useWorkoutState';
import { HeatmapCalendar } from '../../src/components/HeatmapCalendar';
import { WeeklyBarChart } from '../../src/components/WeeklyBarChart';
import { getHeatmapData, getWorkoutsPerWeek, calculateMaxStreak } from '../../src/utils/dateUtils';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/theme';

export default function FortschrittScreen() {
  const router = useRouter();
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

  const maxStreak = calculateMaxStreak(state.completedWorkouts);

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
        {(() => {
          const nextGoal = ws.totalWorkouts < 10 ? 10 : ws.totalWorkouts < 30 ? 30 : ws.totalWorkouts < 60 ? 60 : 100;
          return (
            <View style={styles.goalCard}>
              <Text style={styles.goalLabel}>NÄCHSTES ZIEL</Text>
              <Text style={styles.goalTitle}>{nextGoal} WORKOUTS</Text>
              <Text style={styles.goalText}>
                Noch {nextGoal - ws.totalWorkouts} Einheiten bis zum nächsten Badge.
              </Text>
            </View>
          );
        })()}

        {/* History Card */}
        <Pressable
          style={({ pressed }) => [styles.historyCard, pressed && { opacity: 0.8 }]}
          onPress={() => router.push('/history')}
        >
          <Text style={styles.historyCardTitle}>WORKOUT-VERLAUF</Text>
          <Text style={styles.historyCardSub}>Alle abgeschlossenen Workouts ansehen</Text>
        </Pressable>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20, gap: 20 },
  title: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 32,
    color: Colors.primary,
    letterSpacing: -1,
    marginTop: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    letterSpacing: 2,
    marginBottom: 4,
  },
  bentoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bentoWide: { flexBasis: '100%' },
  bentoCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 18,
  },
  bentoLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.onSurfaceVariant,
    marginBottom: 12,
  },
  bentoRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  bentoValueLarge: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 44,
    color: Colors.onSurface,
  },
  bentoValue: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 32,
    color: Colors.onSurface,
  },
  bentoUnit: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    letterSpacing: -0.5,
  },
  goalCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 24,
  },
  goalLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11,
    letterSpacing: 3,
    color: Colors.primary,
    marginBottom: 8,
  },
  goalTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 28,
    color: Colors.onSurface,
    letterSpacing: -1,
    marginBottom: 4,
  },
  goalText: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  historyCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 24,
  },
  historyCardTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 16,
    color: Colors.onSurface,
    letterSpacing: 1,
    marginBottom: 4,
  },
  historyCardSub: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
});
