import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useStorage } from '../src/hooks/useStorage';
import { getWeekNumber } from '../src/utils/dateUtils';

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
  error: '#ffb4ab',
};

export default function SettingsScreen() {
  const router = useRouter();
  const { state, resetAll, setStartDate, setCurrentWeek } = useStorage();
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editingWeek, setEditingWeek] = useState(false);

  const currentWeek = getWeekNumber(state.startDate);

  const handleDateChange = async (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (event.type === 'dismissed') return;
    if (selectedDate) {
      const iso = selectedDate.toISOString().split('T')[0];
      await setStartDate(iso);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (Platform.OS === 'ios') {
        // iOS picker stays open, user closes manually
      }
    }
  };

  const handleWeekChange = async (week: number) => {
    await setCurrentWeek(week);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEditingWeek(false);
  };

  const handleReset = () => {
    Alert.alert(
      'Alle Daten löschen?',
      'Dein gesamter Fortschritt (Workouts, Streak, Progression) wird unwiderruflich gelöscht.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Alles löschen',
          style: 'destructive',
          onPress: async () => {
            await resetAll();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Einstellungen</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Program Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROGRAMM</Text>
          <View style={styles.card}>
            {/* Start Date */}
            <Pressable style={styles.row} onPress={() => setShowDatePicker(!showDatePicker)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>Startdatum</Text>
                <Text style={styles.rowHint}>Wann hast du mit dem Programm begonnen?</Text>
              </View>
              <Text style={styles.rowValue}>
                {new Date(state.startDate + 'T12:00:00').toLocaleDateString('de-DE')}
              </Text>
              <Text style={styles.editIcon}>✎</Text>
            </Pressable>

            {showDatePicker && (
              <View style={styles.datePickerWrap}>
                <DateTimePicker
                  value={new Date(state.startDate + 'T12:00:00')}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  locale="de-DE"
                  themeVariant="dark"
                />
                {Platform.OS === 'ios' && (
                  <Pressable style={styles.closeDatePicker} onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.closeDatePickerText}>Fertig</Text>
                  </Pressable>
                )}
              </View>
            )}

            <View style={styles.divider} />

            {/* Current Week */}
            <Pressable style={styles.row} onPress={() => setEditingWeek(!editingWeek)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>Aktuelle Woche</Text>
                <Text style={styles.rowHint}>Bestimmt die Progressionsstufe</Text>
              </View>
              <Text style={styles.rowValue}>Woche {currentWeek}</Text>
              <Text style={styles.editIcon}>✎</Text>
            </Pressable>

            {editingWeek && (
              <View style={styles.weekPickerWrap}>
                <Text style={styles.weekPickerLabel}>Woche auswählen:</Text>
                <View style={styles.weekGrid}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((w) => (
                    <Pressable
                      key={w}
                      style={[
                        styles.weekBtn,
                        w === currentWeek && styles.weekBtnActive,
                      ]}
                      onPress={() => handleWeekChange(w)}
                    >
                      <Text style={[
                        styles.weekBtnText,
                        w === currentWeek && styles.weekBtnTextActive,
                      ]}>{w}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.divider} />

            {/* Stats (read-only) */}
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Gesamt Workouts</Text>
              <Text style={styles.rowValue}>{state.completedWorkouts.length}</Text>
            </View>
          </View>
        </View>

        {/* Training Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TRAINING</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>Sprachansagen</Text>
                <Text style={styles.rowHint}>Übungen werden laut angesagt</Text>
              </View>
              <Switch
                value={speechEnabled}
                onValueChange={setSpeechEnabled}
                trackColor={{ false: C.surfaceContainerHighest, true: C.primaryContainer }}
                thumbColor={speechEnabled ? C.primary : C.onSurfaceVariant}
              />
            </View>
          </View>
        </View>

        {/* Equipment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EQUIPMENT</Text>
          <View style={styles.card}>
            <View style={styles.equipRow}>
              <Text style={styles.equipIcon}>🏋️</Text>
              <Text style={styles.equipText}>Kettlebells</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.equipRow}>
              <Text style={styles.equipIcon}>💪</Text>
              <Text style={styles.equipText}>Dips-Station</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.equipRow}>
              <Text style={styles.equipIcon}>🧗</Text>
              <Text style={styles.equipText}>Klimmzugstange</Text>
            </View>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APP INFO</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Version</Text>
              <Text style={styles.rowValue}>1.0.0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Datenspeicherung</Text>
              <Text style={styles.rowValue}>100% lokal</Text>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GEFAHRENZONE</Text>
          <Pressable
            style={({ pressed }) => [styles.dangerBtn, pressed && { opacity: 0.8 }]}
            onPress={handleReset}
          >
            <Text style={styles.dangerBtnText}>Alle Daten zurücksetzen</Text>
            <Text style={styles.dangerBtnHint}>Fortschritt, Streak und Checklist löschen</Text>
          </Pressable>
        </View>

        {/* Credits */}
        <View style={styles.credits}>
          <Text style={styles.creditsText}>BoxFit – Boxing Training Companion</Text>
          <Text style={styles.creditsText}>Kein Account, keine Cloud, kein Tracking</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.surfaceContainerHigh,
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { color: C.onSurface, fontSize: 24, marginTop: -2 },
  headerTitle: {
    fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, color: C.onSurface, letterSpacing: -0.5,
  },
  content: { paddingHorizontal: 20, gap: 24 },
  section: { gap: 8 },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk-Bold', fontSize: 10, letterSpacing: 3,
    color: C.onSurfaceVariant, marginLeft: 4,
  },
  card: {
    backgroundColor: C.surfaceContainerLow, borderRadius: 16, overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 8,
  },
  rowLabel: { fontFamily: 'Inter-Medium', fontSize: 15, color: C.onSurface },
  rowValue: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: C.primary },
  rowHint: { fontFamily: 'Inter', fontSize: 11, color: C.onSurfaceVariant, marginTop: 2 },
  editIcon: { fontSize: 14, color: C.onSurfaceVariant, marginLeft: 4 },
  divider: { height: 1, backgroundColor: C.surfaceContainerHighest, marginHorizontal: 16 },
  // Date picker
  datePickerWrap: {
    paddingHorizontal: 16, paddingBottom: 14,
    backgroundColor: C.surfaceContainerHigh, marginHorizontal: 8, borderRadius: 12,
    marginBottom: 8,
  },
  closeDatePicker: {
    alignItems: 'center', paddingVertical: 10,
    backgroundColor: C.primaryContainer, borderRadius: 10, marginTop: 8,
  },
  closeDatePickerText: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#fff' },
  // Week picker
  weekPickerWrap: {
    paddingHorizontal: 16, paddingBottom: 14, gap: 10,
  },
  weekPickerLabel: {
    fontFamily: 'Inter-Medium', fontSize: 13, color: C.onSurfaceVariant, marginBottom: 4,
  },
  weekGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
  },
  weekBtn: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: C.surfaceContainerHighest,
    alignItems: 'center', justifyContent: 'center',
  },
  weekBtnActive: {
    backgroundColor: C.primaryContainer,
    shadowColor: C.primaryContainer, shadowOpacity: 0.4, shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  weekBtnText: {
    fontFamily: 'SpaceGrotesk-Bold', fontSize: 16, color: C.onSurfaceVariant,
  },
  weekBtnTextActive: { color: '#fff' },
  // Equipment
  equipRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  equipIcon: { fontSize: 20 },
  equipText: { fontFamily: 'Inter-Medium', fontSize: 15, color: C.onSurface },
  // Danger
  dangerBtn: {
    backgroundColor: C.surfaceContainerLow, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: C.error + '30',
  },
  dangerBtnText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: C.error },
  dangerBtnHint: { fontFamily: 'Inter', fontSize: 12, color: C.onSurfaceVariant, marginTop: 4 },
  // Credits
  credits: { alignItems: 'center', gap: 4, paddingTop: 8 },
  creditsText: { fontFamily: 'Inter', fontSize: 12, color: C.onSurfaceVariant, opacity: 0.5 },
});
