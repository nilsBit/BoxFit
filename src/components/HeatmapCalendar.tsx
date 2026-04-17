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
  const weeks: { date: string; count: number }[][] = [];
  let currentWeek: { date: string; count: number }[] = [];

  const firstDay = new Date(data[0]?.date ?? new Date());
  const dayOfWeek = (firstDay.getDay() + 6) % 7;
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
