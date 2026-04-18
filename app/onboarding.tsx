import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius } from '../src/constants/theme';
import { useStorage } from '../src/hooks/useStorage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding } = useStorage();
  const scrollRef = useRef<ScrollView>(null);

  const [page, setPage] = useState(0);
  const [kbWeight, setKbWeight] = useState('16');
  const [trainingDays, setTrainingDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const goToPage = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    setPage(index);
  };

  const toggleDay = (day: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTrainingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleComplete = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const weight = parseInt(kbWeight, 10) || 16;
    await completeOnboarding(weight, trainingDays);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Page Dots */}
      <View style={styles.dotsRow}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === page && styles.dotActive,
            ]}
          />
        ))}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
      >
        {/* Page 1: Willkommen */}
        <View style={styles.page}>
          <View style={styles.pageContent}>
            <Text style={styles.logoEmoji}>🥊</Text>
            <Text style={styles.logoText}>BoxFit</Text>
            <Text style={styles.tagline}>Dein Boxing Training Companion</Text>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📅</Text>
                <Text style={styles.infoText}>5 Tage Training, 2 Tage Pause</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>⏱</Text>
                <Text style={styles.infoText}>40 Minuten pro Tag</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📈</Text>
                <Text style={styles.infoText}>12 Wochen Progressionsprogramm</Text>
              </View>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={() => goToPage(1)}
          >
            <Text style={styles.buttonText}>Los geht's</Text>
          </Pressable>
        </View>

        {/* Page 2: Equipment */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.page}
        >
          <View style={styles.pageContent}>
            <Text style={styles.pageTitle}>Dein Equipment</Text>
            <Text style={styles.pageSubtitle}>Du brauchst nur diese 3 Geräte</Text>

            <View style={styles.equipmentGrid}>
              <View style={styles.equipmentCard}>
                <Text style={styles.equipmentIcon}>🏋️</Text>
                <Text style={styles.equipmentLabel}>Kettlebell</Text>
              </View>
              <View style={styles.equipmentCard}>
                <Text style={styles.equipmentIcon}>💪</Text>
                <Text style={styles.equipmentLabel}>Dips-Station</Text>
              </View>
              <View style={styles.equipmentCard}>
                <Text style={styles.equipmentIcon}>🧗</Text>
                <Text style={styles.equipmentLabel}>Klimmzugstange</Text>
              </View>
            </View>

            <View style={styles.weightSection}>
              <Text style={styles.weightLabel}>Kettlebell Gewicht</Text>
              <View style={styles.weightInputRow}>
                <TextInput
                  style={styles.weightInput}
                  value={kbWeight}
                  onChangeText={setKbWeight}
                  keyboardType="number-pad"
                  maxLength={3}
                  selectTextOnFocus
                />
                <Text style={styles.weightUnit}>kg</Text>
              </View>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={() => goToPage(2)}
          >
            <Text style={styles.buttonText}>Weiter</Text>
          </Pressable>
        </KeyboardAvoidingView>

        {/* Page 3: Trainingstage */}
        <View style={styles.page}>
          <View style={styles.pageContent}>
            <Text style={styles.pageTitle}>Trainingstage</Text>
            <Text style={styles.pageSubtitle}>An welchen Tagen möchtest du trainieren?</Text>

            <View style={styles.daysGrid}>
              {DAY_LABELS.map((label, index) => {
                const day = index + 1;
                const isSelected = trainingDays.includes(day);
                return (
                  <Pressable
                    key={day}
                    style={[
                      styles.dayButton,
                      isSelected && styles.dayButtonActive,
                    ]}
                    onPress={() => toggleDay(day)}
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        isSelected && styles.dayButtonTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.daysSummary}>
              {trainingDays.length} {trainingDays.length === 1 ? 'Tag' : 'Tage'} pro Woche
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.buttonStart,
              pressed && styles.buttonPressed,
              trainingDays.length === 0 && styles.buttonDisabled,
            ]}
            onPress={handleComplete}
            disabled={trainingDays.length === 0}
          >
            <Text style={styles.buttonText}>Training starten!</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceContainerHighest,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  scroll: {
    flex: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-between',
    paddingBottom: Spacing.xl,
  },
  pageContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
  },

  // Page 1
  logoEmoji: {
    fontSize: 80,
  },
  logoText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 48,
    color: Colors.onSurface,
    letterSpacing: -1,
  },
  tagline: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    width: '100%',
    marginTop: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoText: {
    fontFamily: 'Inter',
    fontSize: 15,
    color: Colors.onSurface,
  },

  // Page 2
  pageTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 28,
    color: Colors.onSurface,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontFamily: 'Inter',
    fontSize: 15,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: -Spacing.sm,
  },
  equipmentGrid: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  equipmentCard: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  equipmentIcon: {
    fontSize: 40,
  },
  equipmentLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  weightSection: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  weightLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 13,
    letterSpacing: 1,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  weightInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  weightInput: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 32,
    color: Colors.primary,
    textAlign: 'center',
    minWidth: 60,
  },
  weightUnit: {
    fontFamily: 'Inter',
    fontSize: 20,
    color: Colors.onSurfaceVariant,
  },

  // Page 3
  daysGrid: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    justifyContent: 'center',
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dayButtonActive: {
    backgroundColor: Colors.primaryContainer + '30',
    borderColor: Colors.primary,
  },
  dayButtonText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  dayButtonTextActive: {
    color: Colors.primary,
  },
  daysSummary: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginTop: -Spacing.sm,
  },

  // Buttons
  button: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: BorderRadius.full,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonStart: {
    backgroundColor: Colors.primaryContainer,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 17,
    color: Colors.onPrimaryContainer,
    letterSpacing: 0.5,
  },
});
