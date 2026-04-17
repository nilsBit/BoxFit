import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

const Colors = {
  surfaceContainerLow: '#1c1b1b',
  surfaceContainerHighest: '#353534',
  onSurface: '#e5e2e1',
  onSurfaceVariant: '#e4bebc',
};

interface DayWorkout {
  day: number;
  title: string;
  subtitle: string;
  color: string;
  circuit: {
    exercises: { exerciseId: string; name: string }[];
    rounds: number;
    workSeconds: number;
    restSeconds: number;
  };
  finisher: { rounds: number; durationMinutes: number; restSeconds: number; label: string };
  closing: { name: string; sets: number; reps?: number; durationSeconds?: number };
}

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
    router.push({ pathname: '/workout', params: { day: String(workout.day) } });
  };

  const focusAreas = [...new Set(
    workout.circuit.exercises.slice(0, 4).map((e) => e.name.split(' ')[0].replace('(', ''))
  )].slice(0, 3);

  return (
    <View style={[styles.outerBorder, { borderColor: workout.color + '40' }]}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={[styles.badge, { backgroundColor: workout.color + '30' }]}>
            <Text style={[styles.badgeText, { color: workout.color }]}>STRENGTH FOCUS</Text>
          </View>
          <Text style={styles.dayLabel}>Tag {trainingDay} von 5</Text>
        </View>

        <Text style={styles.title}>
          TAG {workout.day} {'\u2013'} {workout.title.toUpperCase()}
        </Text>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>⏱</Text>
            <Text style={styles.infoText}>Dauer: ~40 Min</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>⚡</Text>
            <Text style={styles.infoText}>Intensität: Hoch</Text>
          </View>
        </View>

        <View style={styles.tags}>
          <Text style={styles.tagsLabel}>FOKUSBEREICHE</Text>
          <View style={styles.tagRow}>
            {focusAreas.map((area, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{area}</Text>
              </View>
            ))}
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: workout.color },
            pressed && { transform: [{ scale: 0.96 }], opacity: 0.9 },
            disabled && { opacity: 0.5 },
          ]}
          onPress={handlePress}
          disabled={disabled}
        >
          <Text style={styles.buttonText}>
            {disabled ? 'BEREITS TRAINIERT \u2713' : 'WORKOUT STARTEN'}
          </Text>
          {!disabled && <Text style={styles.buttonIcon}>▶</Text>}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerBorder: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 1,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 26,
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
    lineHeight: 32,
    marginBottom: 12,
  },
  infoSection: { gap: 4, marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoIcon: { fontSize: 16 },
  infoText: { color: Colors.onSurfaceVariant, fontFamily: 'Inter-Medium', fontSize: 14 },
  tags: { marginBottom: 20 },
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
    flexDirection: 'row',
    gap: 8,
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
  buttonIcon: { color: '#fff', fontSize: 14 },
});
