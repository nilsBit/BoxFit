import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStorage } from '../src/hooks/useStorage';
import { Colors } from '../src/constants/theme';
import { DAY_WORKOUTS } from '../src/constants/workouts';
import { CompletedWorkout } from '../src/types';

const DAY_ICONS: Record<number, string> = {
  1: '💪',
  2: '🏃',
  3: '🔗',
  4: '⚡',
  5: '🔥',
  6: '🧘',
};

function formatDate(iso: string): string {
  const date = new Date(iso + 'T12:00:00');
  const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const months = [
    'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
    'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez',
  ];
  const dayName = days[date.getDay()];
  const d = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}, ${d}. ${month} ${year}`;
}

function getWorkoutName(day: number): string {
  const workout = DAY_WORKOUTS.find((w) => w.day === day);
  return workout ? `Tag ${day} – ${workout.title}` : `Tag ${day}`;
}

export default function HistoryScreen() {
  const router = useRouter();
  const { state, clearCompletedWorkouts } = useStorage();
  const workouts = state.completedWorkouts;

  // Group by date
  const grouped = workouts.reduce<Record<string, CompletedWorkout[]>>(
    (acc, w) => {
      if (!acc[w.date]) acc[w.date] = [];
      acc[w.date].push(w);
      return acc;
    },
    {},
  );

  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  const handleClearAll = () => {
    Alert.alert(
      'Alle löschen?',
      'Möchtest du wirklich den gesamten Workout-Verlauf löschen? Das kann nicht rückgängig gemacht werden.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => clearCompletedWorkouts(),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backButton}>← Zurück</Text>
          </Pressable>
        </View>

        <Text style={styles.title}>WORKOUT-VERLAUF</Text>
        <Text style={styles.subtitle}>ALLE ABGESCHLOSSENEN EINHEITEN</Text>

        {/* Summary bar */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>
            {workouts.length} {workouts.length === 1 ? 'Workout' : 'Workouts'} gesamt
          </Text>
          {workouts.length > 0 && (
            <Pressable onPress={handleClearAll}>
              <Text style={styles.clearButton}>Alle löschen</Text>
            </Pressable>
          )}
        </View>

        {/* Grouped list */}
        {sortedDates.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              Noch keine Workouts abgeschlossen. Leg los!
            </Text>
          </View>
        )}

        {sortedDates.map((date) => (
          <View key={date} style={styles.dateGroup}>
            <Text style={styles.dateLabel}>{formatDate(date)}</Text>
            {grouped[date].map((w, i) => (
              <View key={`${date}-${i}`} style={styles.workoutCard}>
                <Text style={styles.workoutIcon}>
                  {DAY_ICONS[w.day] || '🥊'}
                </Text>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutName}>
                    {getWorkoutName(w.day)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20, gap: 16 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  backButton: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.primary,
  },
  title: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 32,
    color: Colors.primary,
    letterSpacing: -1,
    marginTop: 4,
  },
  subtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    letterSpacing: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 18,
  },
  summaryText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 16,
    color: Colors.onSurface,
  },
  clearButton: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: Colors.error,
  },
  dateGroup: {
    gap: 8,
  },
  dateLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 13,
    letterSpacing: 1,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  workoutIcon: {
    fontSize: 24,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: Colors.onSurface,
  },
  emptyCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
