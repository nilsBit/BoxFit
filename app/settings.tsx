import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useStorage } from '../src/hooks/useStorage';
import { useNotifications } from '../src/hooks/useNotifications';
import { getWeekNumber } from '../src/utils/dateUtils';
import { Colors } from '../src/constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { state, resetAll, setStartDate, setCurrentWeek, setSpeechEnabled, setNotificationSettings } = useStorage();
  const { requestPermission, scheduleDaily, cancelAll } = useNotifications();
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

  const handleNotificationToggle = async (enabled: boolean) => {
    try {
      if (enabled) {
        const granted = await requestPermission();
        if (!granted) {
          Alert.alert('Berechtigung benötigt', 'Bitte erlaube Benachrichtigungen in den Systemeinstellungen.');
          return;
        }
        await scheduleDaily(state.notificationHour ?? 18, state.notificationMinute ?? 0);
      } else {
        await cancelAll();
      }
      await setNotificationSettings(enabled, state.notificationHour ?? 18, state.notificationMinute ?? 0);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      console.warn('Notification toggle error:', e);
      await setNotificationSettings(enabled, state.notificationHour ?? 18, state.notificationMinute ?? 0);
    }
  };

  const adjustHour = async (delta: number) => {
    const current = state.notificationHour ?? 18;
    const newHour = (current + delta + 24) % 24;
    await setNotificationSettings(true, newHour, state.notificationMinute ?? 0);
    await scheduleDaily(newHour, state.notificationMinute ?? 0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const adjustMinute = async (delta: number) => {
    const current = state.notificationMinute ?? 0;
    const newMinute = (current + delta + 60) % 60;
    await setNotificationSettings(true, state.notificationHour ?? 18, newMinute);
    await scheduleDaily(state.notificationHour ?? 18, newMinute);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
                value={state.speechEnabled ?? true}
                onValueChange={setSpeechEnabled}
                trackColor={{ false: Colors.surfaceContainerHighest, true: Colors.primaryContainer }}
                thumbColor={(state.speechEnabled ?? true) ? Colors.primary : Colors.onSurfaceVariant}
              />
            </View>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BENACHRICHTIGUNGEN</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>Tägliche Erinnerung</Text>
                <Text style={styles.rowHint}>Erinnert dich ans Training</Text>
              </View>
              <Switch
                value={state.notificationsEnabled ?? false}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: Colors.surfaceContainerHighest, true: Colors.primaryContainer }}
                thumbColor={(state.notificationsEnabled ?? false) ? Colors.primary : Colors.onSurfaceVariant}
              />
            </View>

            {(state.notificationsEnabled ?? false) && (
              <>
                <View style={styles.divider} />
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Uhrzeit</Text>
                  <View style={styles.timePicker}>
                    <View style={styles.timeGroup}>
                      <Pressable onPress={() => adjustHour(-1)} style={styles.timeBtn}>
                        <Text style={styles.timeBtnText}>-</Text>
                      </Pressable>
                      <Text style={styles.timeDisplay}>
                        {String(state.notificationHour ?? 18).padStart(2, '0')}
                      </Text>
                      <Pressable onPress={() => adjustHour(1)} style={styles.timeBtn}>
                        <Text style={styles.timeBtnText}>+</Text>
                      </Pressable>
                    </View>
                    <Text style={styles.timeSeparator}>:</Text>
                    <View style={styles.timeGroup}>
                      <Pressable onPress={() => adjustMinute(-5)} style={styles.timeBtn}>
                        <Text style={styles.timeBtnText}>-</Text>
                      </Pressable>
                      <Text style={styles.timeDisplay}>
                        {String(state.notificationMinute ?? 0).padStart(2, '0')}
                      </Text>
                      <Pressable onPress={() => adjustMinute(5)} style={styles.timeBtn}>
                        <Text style={styles.timeBtnText}>+</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </>
            )}
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
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { color: Colors.onSurface, fontSize: 24, marginTop: -2 },
  headerTitle: {
    fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, color: Colors.onSurface, letterSpacing: -0.5,
  },
  content: { paddingHorizontal: 20, gap: 24 },
  section: { gap: 8 },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk-Bold', fontSize: 10, letterSpacing: 3,
    color: Colors.onSurfaceVariant, marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.surfaceContainerLow, borderRadius: 16, overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 8,
  },
  rowLabel: { fontFamily: 'Inter-Medium', fontSize: 15, color: Colors.onSurface },
  rowValue: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: Colors.primary },
  rowHint: { fontFamily: 'Inter', fontSize: 11, color: Colors.onSurfaceVariant, marginTop: 2 },
  editIcon: { fontSize: 14, color: Colors.onSurfaceVariant, marginLeft: 4 },
  divider: { height: 1, backgroundColor: Colors.surfaceContainerHighest, marginHorizontal: 16 },
  // Date picker
  datePickerWrap: {
    paddingHorizontal: 16, paddingBottom: 14,
    backgroundColor: Colors.surfaceContainerHigh, marginHorizontal: 8, borderRadius: 12,
    marginBottom: 8,
  },
  closeDatePicker: {
    alignItems: 'center', paddingVertical: 10,
    backgroundColor: Colors.primaryContainer, borderRadius: 10, marginTop: 8,
  },
  closeDatePickerText: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#fff' },
  // Week picker
  weekPickerWrap: {
    paddingHorizontal: 16, paddingBottom: 14, gap: 10,
  },
  weekPickerLabel: {
    fontFamily: 'Inter-Medium', fontSize: 13, color: Colors.onSurfaceVariant, marginBottom: 4,
  },
  weekGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
  },
  weekBtn: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: Colors.surfaceContainerHighest,
    alignItems: 'center', justifyContent: 'center',
  },
  weekBtnActive: {
    backgroundColor: Colors.primaryContainer,
    shadowColor: Colors.primaryContainer, shadowOpacity: 0.4, shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  weekBtnText: {
    fontFamily: 'SpaceGrotesk-Bold', fontSize: 16, color: Colors.onSurfaceVariant,
  },
  weekBtnTextActive: { color: '#fff' },
  // Time picker
  timePicker: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  timeGroup: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  timeBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: Colors.surfaceContainerHighest,
    alignItems: 'center', justifyContent: 'center',
  },
  timeBtnText: {
    fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, color: Colors.onSurface, marginTop: -1,
  },
  timeDisplay: {
    fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, color: Colors.primary,
    minWidth: 28, textAlign: 'center',
  },
  timeSeparator: {
    fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, color: Colors.onSurfaceVariant,
  },
  // Equipment
  equipRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  equipIcon: { fontSize: 20 },
  equipText: { fontFamily: 'Inter-Medium', fontSize: 15, color: Colors.onSurface },
  // Danger
  dangerBtn: {
    backgroundColor: Colors.surfaceContainerLow, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.error + '30',
  },
  dangerBtnText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: Colors.error },
  dangerBtnHint: { fontFamily: 'Inter', fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 4 },
  // Credits
  credits: { alignItems: 'center', gap: 4, paddingTop: 8 },
  creditsText: { fontFamily: 'Inter', fontSize: 12, color: Colors.onSurfaceVariant, opacity: 0.5 },
});
