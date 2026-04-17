import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Colors = {
  surfaceContainerHigh: '#2a2a2a',
  surfaceContainerLow: '#1c1b1b',
  primaryContainer: '#ff535b',
  primary: '#ffb3b1',
  tertiaryContainer: '#2fa096',
  onSurface: '#e5e2e1',
  onSurfaceVariant: '#e4bebc',
  outlineVariant: '#5b403f',
};

interface ProgressionLevel {
  weekRange: [number, number];
  label: string;
  description: string;
  changes: string[];
  tips: string[];
}

interface Props {
  level: ProgressionLevel;
  isActive: boolean;
  isCompleted: boolean;
  isLast: boolean;
}

export function TimelineItem({ level, isActive, isCompleted, isLast }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.timeline}>
        <View
          style={[
            styles.dot,
            isActive && styles.dotActive,
            isCompleted && styles.dotCompleted,
          ]}
        >
          {isCompleted && <Text style={styles.check}>{'\u2713'}</Text>}
          {isActive && <Text style={styles.check}>{'\u2713'}</Text>}
        </View>
        {!isLast && (
          <View style={[styles.line, isCompleted && styles.lineCompleted]} />
        )}
      </View>
      <View
        style={[
          styles.card,
          isActive && styles.cardActive,
          !isActive && !isCompleted && styles.cardLocked,
        ]}
      >
        <Text style={[styles.phase, isActive && { color: Colors.primary }]}>
          {isActive ? 'AKTIVE PHASE' : isCompleted ? 'ABGESCHLOSSEN' : 'GESPERRT'}
        </Text>
        <Text style={styles.title}>
          Woche {level.weekRange[0]}-{level.weekRange[1]}: {level.label}
        </Text>
        <Text style={styles.desc}>{level.description}</Text>
        {(isActive || isCompleted) && level.changes.length > 0 && (
          <View style={styles.changes}>
            {level.changes.map((c, i) => (
              <Text key={i} style={styles.changeItem}>{'\u2022'} {c}</Text>
            ))}
          </View>
        )}
        {isActive && level.tips.length > 0 && (
          <View style={styles.tipsWrap}>
            {level.tips.map((t, i) => (
              <Text key={i} style={styles.tip}>{'\uD83D\uDCA1'} {t}</Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 16 },
  timeline: { alignItems: 'center', width: 48 },
  dot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '50',
  },
  dotActive: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.primaryContainer,
    shadowColor: Colors.primaryContainer,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  dotCompleted: {
    backgroundColor: Colors.tertiaryContainer,
    borderColor: Colors.tertiaryContainer,
  },
  check: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.surfaceContainerHigh,
    marginVertical: 4,
    minHeight: 20,
  },
  lineCompleted: { backgroundColor: Colors.tertiaryContainer },
  card: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardActive: { borderLeftWidth: 3, borderLeftColor: Colors.primary },
  cardLocked: { opacity: 0.4 },
  phase: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.onSurfaceVariant,
    marginBottom: 4,
  },
  title: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 16, color: Colors.onSurface, marginBottom: 4 },
  desc: { fontFamily: 'Inter', fontSize: 13, color: Colors.onSurfaceVariant, lineHeight: 20 },
  changes: { marginTop: 12, gap: 4 },
  changeItem: { fontFamily: 'Inter-Medium', fontSize: 13, color: Colors.onSurface },
  tipsWrap: { marginTop: 12, gap: 4 },
  tip: { fontFamily: 'Inter', fontSize: 12, color: Colors.primary },
});
