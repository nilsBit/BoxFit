import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

const Colors = {
  surfaceContainerLow: '#1c1b1b',
  surfaceContainerHighest: '#353534',
  onSurface: '#e5e2e1',
  onSurfaceVariant: '#e4bebc',
  primary: '#ffb3b1',
};

interface Exercise {
  id: string;
  name: string;
  description: string;
  muscleGroups: string[];
  difficulty: 'Anfänger' | 'Mittel' | 'Fortgeschritten';
  equipment?: string;
  icon?: string;
  tips?: string;
}

interface Props {
  exercise: Exercise;
}

const difficultyColors: Record<string, { bg: string; text: string }> = {
  'Anfänger': { bg: 'rgba(76,175,80,0.2)', text: '#66BB6A' },
  Mittel: { bg: 'rgba(255,152,0,0.2)', text: '#FFA726' },
  Fortgeschritten: { bg: 'rgba(255,83,91,0.2)', text: '#ffb3b1' },
};

export function ExerciseCard({ exercise }: Props) {
  const [expanded, setExpanded] = useState(false);
  const dc = difficultyColors[exercise.difficulty] ?? difficultyColors.Mittel;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
      onPress={() => setExpanded(!expanded)}
    >
      <View style={styles.headerRow}>
        {exercise.icon ? <Text style={styles.icon}>{exercise.icon}</Text> : null}
        <Text style={styles.name} numberOfLines={expanded ? undefined : 1}>{exercise.name}</Text>
        <View style={[styles.diffBadge, { backgroundColor: dc.bg }]}>
          <Text style={[styles.diffText, { color: dc.text }]}>{exercise.difficulty.toUpperCase()}</Text>
        </View>
      </View>
      {expanded && exercise.description ? (
        <Text style={styles.description}>{exercise.description}</Text>
      ) : null}
      {expanded && exercise.equipment ? (
        <Text style={styles.equipment}>🔧 Equipment: {exercise.equipment}</Text>
      ) : null}
      {expanded && exercise.tips ? (
        <Text style={styles.tip}>💡 {exercise.tips}</Text>
      ) : null}
      <View style={styles.tags}>
        {exercise.muscleGroups.map((m) => (
          <View key={m} style={styles.tag}>
            <Text style={styles.tagText}>{m.toUpperCase()}</Text>
          </View>
        ))}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  icon: { fontSize: 24, marginRight: 4 },
  name: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, color: Colors.onSurface, flex: 1 },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  diffText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 9, letterSpacing: 1 },
  description: { fontFamily: 'Inter', fontSize: 13, color: Colors.onSurfaceVariant, marginBottom: 8, lineHeight: 20 },
  equipment: { fontFamily: 'Inter-Medium', fontSize: 12, color: Colors.primary, marginBottom: 8 },
  tip: { fontFamily: 'Inter', fontSize: 12, color: '#6fd8cc', marginBottom: 8, lineHeight: 18 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: Colors.surfaceContainerHighest, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  tagText: { fontFamily: 'Inter-SemiBold', fontSize: 9, color: Colors.onSurfaceVariant, letterSpacing: 1 },
});
