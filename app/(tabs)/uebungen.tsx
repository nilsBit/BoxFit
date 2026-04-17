import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExerciseCard } from '../../src/components/ExerciseCard';
import { EXERCISES } from '../../src/constants/exercises';
import { ALL_COMBOS, BoxingCombo } from '../../src/constants/combos';

const C = {
  background: '#131313',
  surfaceContainerLowest: '#0e0e0e',
  surfaceContainerLow: '#1c1b1b',
  surfaceContainerHigh: '#2a2a2a',
  primary: '#ffb3b1',
  onPrimary: '#680011',
  onSurface: '#e5e2e1',
  onSurfaceVariant: '#e4bebc',
};

const FILTERS = ['ALLE', 'KOMBOS', 'BEINE', 'OBERKÖRPER', 'CORE', 'BOXEN', 'KARDIO', 'DEHNUNG'];

const FILTER_MUSCLE_MAP: Record<string, string[]> = {
  BEINE: ['Beine', 'Gesäß', 'Hüfte'],
  OBERKÖRPER: ['Brust', 'Rücken', 'Schultern', 'Bizeps', 'Trizeps', 'Trapez', 'Nacken'],
  DEHNUNG: ['Dehnung'],
  CORE: ['Core', 'Obliques', 'Hüftbeuger'],
  BOXEN: ['Technik'],
  KARDIO: ['Kardio', 'Explosivkraft'],
};

// Section order + icons for grouped view
const SECTIONS: { key: string; label: string; icon: string; muscles: string[] }[] = [
  { key: 'OBERKÖRPER', label: 'Oberkörper', icon: '💪', muscles: ['Brust', 'Rücken', 'Schultern', 'Bizeps', 'Trizeps', 'Trapez', 'Nacken'] },
  { key: 'BEINE', label: 'Beine & Hüfte', icon: '🦵', muscles: ['Beine', 'Gesäß', 'Hüfte'] },
  { key: 'CORE', label: 'Core & Bauch', icon: '🌀', muscles: ['Core', 'Obliques', 'Hüftbeuger'] },
  { key: 'KARDIO', label: 'Kardio & Explosivkraft', icon: '🏃', muscles: ['Kardio', 'Explosivkraft'] },
  { key: 'GANZKÖRPER', label: 'Ganzkörper', icon: '⚡', muscles: ['Ganzkörper', 'Griffkraft'] },
  { key: 'BOXEN', label: 'Boxen & Technik', icon: '🥊', muscles: ['Technik'] },
  { key: 'DEHNUNG', label: 'Dehnung & Mobilität', icon: '🧘', muscles: ['Dehnung'] },
  { key: 'NACKEN', label: 'Nacken', icon: '🌉', muscles: ['Nacken'] },
];

const comboLevelColors: Record<string, { bg: string; text: string }> = {
  'Anfänger': { bg: 'rgba(76,175,80,0.2)', text: '#66BB6A' },
  Mittel: { bg: 'rgba(255,152,0,0.2)', text: '#FFA726' },
  Fortgeschritten: { bg: 'rgba(255,83,91,0.2)', text: '#ffb3b1' },
  Profi: { bg: 'rgba(156,39,176,0.2)', text: '#CE93D8' },
};

function ComboCard({ combo }: { combo: BoxingCombo }) {
  const [expanded, setExpanded] = useState(false);
  const lc = comboLevelColors[combo.level] ?? comboLevelColors.Mittel;
  return (
    <Pressable
      style={({ pressed }) => [styles.comboCard, pressed && { opacity: 0.85 }]}
      onPress={() => setExpanded(!expanded)}
    >
      <View style={styles.comboHeader}>
        <Text style={styles.comboName}>🥊 {combo.name}</Text>
        <View style={[styles.comboBadge, { backgroundColor: lc.bg }]}>
          <Text style={[styles.comboBadgeText, { color: lc.text }]}>{combo.level.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.comboSequence}>{combo.sequence}</Text>
      {expanded && (
        <>
          <Text style={styles.comboDesc}>{combo.description}</Text>
          <View style={styles.comboFocusRow}>
            <Text style={styles.comboFocusLabel}>Fokus:</Text>
            <Text style={styles.comboFocusValue}>{combo.focus}</Text>
          </View>
          <Text style={styles.comboTip}>💡 {combo.tips}</Text>
        </>
      )}
    </Pressable>
  );
}

export default function UebungenScreen() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALLE');

  const showCombos = activeFilter === 'KOMBOS';

  const showGrouped = activeFilter === 'ALLE' && !search.trim();

  const filtered = useMemo(() => {
    if (showCombos) return [];

    let result = EXERCISES;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.muscleGroups.some((m) => m.toLowerCase().includes(q))
      );
    }

    if (activeFilter !== 'ALLE') {
      const muscles = FILTER_MUSCLE_MAP[activeFilter] ?? [];
      result = result.filter((e) =>
        e.muscleGroups.some((m) => muscles.includes(m))
      );
    }

    return result;
  }, [search, activeFilter, showCombos]);

  // Group exercises by section for "ALLE" view
  const groupedExercises = useMemo(() => {
    if (!showGrouped) return [];
    const assigned = new Set<string>();
    return SECTIONS.map((section) => {
      const exercises = EXERCISES.filter((e) => {
        if (assigned.has(e.id)) return false;
        return e.muscleGroups.some((m) => section.muscles.includes(m));
      });
      exercises.forEach((e) => assigned.add(e.id));
      return { ...section, exercises };
    }).filter((s) => s.exercises.length > 0);
  }, [showGrouped]);

  const filteredCombos = useMemo(() => {
    if (!showCombos) return [];
    if (search.trim()) {
      const q = search.toLowerCase();
      return ALL_COMBOS.filter(
        (c) => c.name.toLowerCase().includes(q) || c.sequence.toLowerCase().includes(q)
      );
    }
    return ALL_COMBOS;
  }, [search, showCombos]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Übungen</Text>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Übung suchen..."
            placeholderTextColor={C.onSurfaceVariant + '80'}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {FILTERS.map((f) => (
            <Pressable
              key={f}
              style={[
                styles.chip,
                activeFilter === f && styles.chipActive,
              ]}
              onPress={() => setActiveFilter(f)}
            >
              <Text
                style={[
                  styles.chipText,
                  activeFilter === f && styles.chipTextActive,
                ]}
              >
                {f}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Boxing Combos */}
        {showCombos && (
          <View style={styles.list}>
            <View style={styles.comboLegend}>
              <Text style={styles.legendTitle}>NUMMERN-SYSTEM</Text>
              <Text style={styles.legendItem}>1 = Jab (Führhand)</Text>
              <Text style={styles.legendItem}>2 = Cross (Schlaghand)</Text>
              <Text style={styles.legendItem}>3 = Lead Hook</Text>
              <Text style={styles.legendItem}>4 = Rear Hook</Text>
              <Text style={styles.legendItem}>5 = Lead Uppercut</Text>
              <Text style={styles.legendItem}>6 = Rear Uppercut</Text>
              <Text style={styles.legendItem}>B = Body (zum Körper)</Text>
            </View>
            {filteredCombos.map((combo) => (
              <ComboCard key={combo.id} combo={combo} />
            ))}
            {filteredCombos.length === 0 && (
              <Text style={styles.empty}>Keine Kombos gefunden.</Text>
            )}
          </View>
        )}

        {/* Exercise List — grouped by section */}
        {!showCombos && showGrouped && (
          <View style={styles.list}>
            {groupedExercises.map((section) => (
              <View key={section.key} style={styles.sectionWrap}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionIcon}>{section.icon}</Text>
                  <Text style={styles.sectionTitle}>{section.label.toUpperCase()}</Text>
                  <Text style={styles.sectionCount}>{section.exercises.length}</Text>
                </View>
                <View style={styles.sectionList}>
                  {section.exercises.map((exercise) => (
                    <ExerciseCard key={exercise.id} exercise={exercise} />
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Exercise List — flat (filtered or searched) */}
        {!showCombos && !showGrouped && (
          <View style={styles.list}>
            {filtered.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
            {filtered.length === 0 && (
              <Text style={styles.empty}>Keine Übungen gefunden.</Text>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  content: { paddingHorizontal: 20 },
  title: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 40,
    color: C.onSurface,
    letterSpacing: -2,
    marginTop: 8,
    marginBottom: 20,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: 999,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 16,
    color: C.onSurface,
    paddingVertical: 14,
  },
  filters: { gap: 8, paddingBottom: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: C.surfaceContainerHigh,
    borderRadius: 999,
  },
  chipActive: { backgroundColor: C.primary },
  chipText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11,
    letterSpacing: 2,
    color: C.onSurfaceVariant,
  },
  chipTextActive: { color: C.onPrimary },
  list: { gap: 16 },
  sectionWrap: { gap: 8 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#353534',
    marginBottom: 2,
  },
  sectionIcon: { fontSize: 18 },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12,
    letterSpacing: 2,
    color: '#ffb3b1',
    flex: 1,
  },
  sectionCount: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11,
    color: '#e4bebc',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  sectionList: { gap: 8 },
  empty: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: C.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 40,
  },
  // Combo styles
  comboLegend: {
    backgroundColor: C.surfaceContainerHigh,
    borderRadius: 12,
    padding: 14,
    gap: 3,
    marginBottom: 4,
  },
  legendTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    letterSpacing: 2,
    color: C.primary,
    marginBottom: 6,
  },
  legendItem: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  comboCard: {
    backgroundColor: C.surfaceContainerLow,
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  comboHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  comboName: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 16,
    color: C.onSurface,
    flex: 1,
  },
  comboBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  comboBadgeText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 9,
    letterSpacing: 1,
  },
  comboSequence: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 22,
    color: C.primary,
    letterSpacing: 1,
    marginVertical: 4,
  },
  comboDesc: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: C.onSurfaceVariant,
    lineHeight: 20,
    marginTop: 4,
  },
  comboFocusRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  comboFocusLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  comboFocusValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#6fd8cc',
  },
  comboTip: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#6fd8cc',
    marginTop: 6,
    lineHeight: 18,
  },
});
