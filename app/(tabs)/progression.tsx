import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStorage } from '../../src/hooks/useStorage';
import { useWorkoutState } from '../../src/hooks/useWorkoutState';
import { TimelineItem } from '../../src/components/TimelineItem';
import { PROGRESSION_LEVELS } from '../../src/constants/progression';

const C = {
  background: '#131313',
  surfaceContainerLow: '#1c1b1b',
  surfaceContainerHigh: '#2a2a2a',
  surfaceContainerHighest: '#353534',
  primary: '#ffb3b1',
  primaryContainer: '#ff535b',
  onSurface: '#e5e2e1',
  onSurfaceVariant: '#e4bebc',
  tertiary: '#6fd8cc',
};

export default function ProgressionScreen() {
  const { state, isLoaded, toggleChecklistItem } = useStorage();
  const ws = useWorkoutState(state);

  if (!isLoaded) {
    return <View style={styles.container} />;
  }

  const overallProgress = Math.round((ws.currentWeek / 12) * 100);
  const currentLevel = ws.progression;

  const checklistItems = currentLevel.changes.map((change, i) => ({
    key: `w${currentLevel.weekRange[0]}-${i}`,
    label: change,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.phaseLabel}>PROGRESSED TRAINING</Text>
        <Text style={styles.title}>12-WOCHEN-PFAD</Text>

        {/* Timeline */}
        <View style={styles.timeline}>
          {PROGRESSION_LEVELS.map((level, i) => {
            const isActive =
              ws.currentWeek >= level.weekRange[0] &&
              ws.currentWeek <= level.weekRange[1];
            const isCompleted = ws.currentWeek > level.weekRange[1];
            return (
              <TimelineItem
                key={i}
                level={level}
                isActive={isActive}
                isCompleted={isCompleted}
                isLast={i === PROGRESSION_LEVELS.length - 1}
              />
            );
          })}
        </View>

        {/* Overall Progress */}
        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>GESAMTFORTSCHRITT</Text>
          <View style={styles.progressRow}>
            <Text style={styles.progressValue}>{overallProgress}%</Text>
            <Text style={styles.progressUnit}>ABGESCHLOSSEN</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[styles.progressBarFill, { width: `${overallProgress}%` }]}
            />
          </View>
        </View>

        {/* Bento Stats */}
        <View style={styles.bentoRow}>
          <View style={styles.bentoCard}>
            <Text style={{ fontSize: 18 }}>⚡</Text>
            <Text style={styles.bentoValue}>{ws.totalWorkouts}</Text>
            <Text style={styles.bentoLabel}>WORKOUTS</Text>
          </View>
          <View style={styles.bentoCard}>
            <Text style={{ fontSize: 18 }}>⏱</Text>
            <Text style={styles.bentoValue}>{Math.round(ws.totalWorkouts * 0.67)}h</Text>
            <Text style={styles.bentoLabel}>TRAININGSZEIT</Text>
          </View>
        </View>

        {/* Checklist */}
        {checklistItems.length > 0 && (
          <View style={styles.checklistSection}>
            <Text style={styles.checklistTitle}>AKTUELLE ZIELE</Text>
            {checklistItems.map((item) => (
              <Pressable
                key={item.key}
                style={styles.checklistItem}
                onPress={() => toggleChecklistItem(item.key)}
              >
                <View
                  style={[
                    styles.checkbox,
                    state.progressionChecklist[item.key] && styles.checkboxChecked,
                  ]}
                >
                  {state.progressionChecklist[item.key] && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.checklistText,
                    state.progressionChecklist[item.key] && styles.checklistTextDone,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Motivation */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationQuote}>
            „Champions werden in der Basis-Phase geschmiedet."
          </Text>
          <Text style={styles.motivationAuthor}>COACH MILLER</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  content: { paddingHorizontal: 20, gap: 20 },
  phaseLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11,
    letterSpacing: 2,
    color: C.primary,
    marginTop: 8,
  },
  title: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 32,
    color: C.onSurface,
    letterSpacing: -1,
    fontStyle: 'italic',
  },
  timeline: { marginTop: 8 },
  progressCard: {
    backgroundColor: C.surfaceContainerLow,
    borderRadius: 16,
    padding: 20,
    gap: 8,
  },
  progressLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    letterSpacing: 2,
    color: C.primary,
  },
  progressRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  progressValue: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 36,
    color: C.onSurface,
    letterSpacing: -1,
  },
  progressUnit: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11,
    color: C.onSurfaceVariant,
    letterSpacing: 1,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: C.surfaceContainerHighest,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: C.primaryContainer,
    borderRadius: 2,
  },
  bentoRow: { flexDirection: 'row', gap: 12 },
  bentoCard: {
    flex: 1,
    backgroundColor: C.surfaceContainerHigh,
    borderRadius: 16,
    padding: 16,
    aspectRatio: 1,
    justifyContent: 'space-between',
  },
  bentoValue: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 24,
    color: C.onSurface,
  },
  bentoLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 9,
    letterSpacing: 2,
    color: C.onSurfaceVariant,
  },
  checklistSection: {
    backgroundColor: C.surfaceContainerLow,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  checklistTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12,
    letterSpacing: 2,
    color: C.onSurface,
    marginBottom: 4,
  },
  checklistItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: C.primary + '60',
    backgroundColor: C.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: C.primaryContainer + '30',
    borderColor: C.primary,
  },
  checkmark: { color: C.primary, fontWeight: 'bold', fontSize: 14 },
  checklistText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: C.onSurface,
    flex: 1,
  },
  checklistTextDone: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  motivationCard: {
    backgroundColor: C.surfaceContainerHighest,
    borderRadius: 16,
    padding: 24,
    gap: 8,
  },
  motivationQuote: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 18,
    color: C.onSurface,
    fontStyle: 'italic',
    lineHeight: 26,
  },
  motivationAuthor: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    letterSpacing: 2,
    color: C.primary,
  },
});
