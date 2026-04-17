import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';
import { WorkoutPhase } from '../types';

const PHASES: WorkoutPhase[] = ['warmup', 'circuit', 'finisher', 'closing'];

interface Props {
  currentPhase: WorkoutPhase;
}

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
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 999,
    padding: 4,
  },
  segment: { flex: 1, height: 6, borderRadius: 999 },
});
