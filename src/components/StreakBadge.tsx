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
      <View style={{ flex: 1 }}>
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
