import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Colors = {
  surfaceContainerLow: '#1c1b1b',
  surfaceContainerHighest: '#353534',
  primaryContainer: '#ff535b',
  onSurface: '#e5e2e1',
  onSurfaceVariant: '#e4bebc',
  tertiary: '#6fd8cc',
};

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
            <View style={styles.barBg}>
              <View
                style={[
                  styles.barFill,
                  { height: maxCount > 0 ? `${(item.count / maxCount) * 100}%` : '0%' },
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
  bars: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 160 },
  barCol: { alignItems: 'center', flex: 1 },
  barBg: {
    width: 32,
    height: 140,
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
