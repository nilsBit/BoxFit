import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useStorage } from '../src/hooks/useStorage';
import { useTimer } from '../src/hooks/useTimer';
import { useSound } from '../src/hooks/useSound';
import { useSpeech } from '../src/hooks/useSpeech';
import { TimerDisplay } from '../src/components/TimerDisplay';
import { PhaseIndicator } from '../src/components/PhaseIndicator';
import { getWorkoutForDay } from '../src/utils/workoutEngine';
import { getWeekNumber } from '../src/utils/dateUtils';
import { WARMUP_EXERCISES } from '../src/constants/workouts';
import { getExerciseById } from '../src/constants/exercises';
import { getCombosForRound, BoxingCombo } from '../src/constants/combos';
import { WorkoutPhase } from '../src/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  tertiaryContainer: '#2fa096',
  outlineVariant: '#5b403f',
};

export default function WorkoutScreen() {
  const { day } = useLocalSearchParams<{ day: string }>();
  const router = useRouter();
  const { state, completeWorkout } = useStorage();
  const timer = useTimer();
  const { playBeep, playGong } = useSound();
  const speech = useSpeech();

  const dayNum = parseInt(day ?? '1', 10);
  const currentWeek = getWeekNumber(state.startDate);
  const workout = getWorkoutForDay(dayNum, currentWeek);

  // State
  const [phase, setPhase] = useState<WorkoutPhase>('warmup');
  const [warmupIdx, setWarmupIdx] = useState(0);
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [roundIdx, setRoundIdx] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [finisherRound, setFinisherRound] = useState(0);
  const [totalTimerSeconds, setTotalTimerSeconds] = useState(WARMUP_EXERCISES[0].duration);
  const [countdownBeepPlayed, setCountdownBeepPlayed] = useState(false);
  const [currentCombos, setCurrentCombos] = useState<BoxingCombo[]>([]);
  const [comboIdx, setComboIdx] = useState(0);
  const comboIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Refs for callback access
  const refs = useRef({ phase, warmupIdx, exerciseIdx, roundIdx, isResting, finisherRound });
  useEffect(() => {
    refs.current = { phase, warmupIdx, exerciseIdx, roundIdx, isResting, finisherRound };
  });

  useEffect(() => {
    activateKeepAwakeAsync();
    return () => { deactivateKeepAwake(); };
  }, []);

  // 3-2-1 countdown beep
  useEffect(() => {
    if (timer.secondsRemaining <= 3 && timer.secondsRemaining > 0 && timer.isRunning) {
      playBeep();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [timer.secondsRemaining]);

  const stopComboRotation = useCallback(() => {
    if (comboIntervalRef.current) {
      clearInterval(comboIntervalRef.current);
      comboIntervalRef.current = null;
    }
  }, []);

  const startComboRotation = useCallback((combos: BoxingCombo[]) => {
    stopComboRotation();
    let idx = 0;
    // Announce a new combo every 15 seconds
    comboIntervalRef.current = setInterval(() => {
      idx = (idx + 1) % combos.length;
      setComboIdx(idx);
      speech.speak(combos[idx].sequence);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 15000);
  }, [stopComboRotation, speech]);

  // Cleanup combo interval on unmount
  useEffect(() => {
    return () => stopComboRotation();
  }, [stopComboRotation]);

  const advanceState = useCallback(() => {
    const { phase: p, warmupIdx: wIdx, exerciseIdx: eIdx, roundIdx: rIdx, isResting: resting, finisherRound: fRound } = refs.current;

    // === WARMUP: individual exercises ===
    if (p === 'warmup') {
      const nextW = wIdx + 1;
      if (nextW < WARMUP_EXERCISES.length) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        playBeep();
        speech.announceExercise(WARMUP_EXERCISES[nextW].name);
        setWarmupIdx(nextW);
        const secs = WARMUP_EXERCISES[nextW].duration;
        setTotalTimerSeconds(secs);
        timer.start(secs);
        return;
      }
      // Warmup done → Circuit
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      playGong();
      speech.announcePhase('Circuit startet. ' + workout.circuit.exercises[0].name);
      setPhase('circuit');
      setIsResting(false);
      setExerciseIdx(0);
      setRoundIdx(0);
      const secs = workout.circuit.workSeconds;
      setTotalTimerSeconds(secs);
      timer.start(secs);
      return;
    }

    // === CIRCUIT ===
    if (p === 'circuit') {
      if (!resting) {
        // Work done → Rest
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        playBeep();
        speech.announceRest();
        setIsResting(true);
        const secs = workout.circuit.restSeconds;
        setTotalTimerSeconds(secs);
        timer.start(secs);
        return;
      }

      // Rest done → Next exercise or round
      const exercises = workout.circuit.exercises;
      const nextEx = eIdx + 1;

      if (nextEx < exercises.length) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        playBeep();
        speech.announceExercise(exercises[nextEx].name);
        setIsResting(false);
        setExerciseIdx(nextEx);
        const secs = workout.circuit.workSeconds;
        setTotalTimerSeconds(secs);
        timer.start(secs);
        return;
      }

      // Round complete
      const nextRound = rIdx + 1;
      if (nextRound < workout.circuit.rounds) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        playGong();
        speech.announceRound(nextRound + 1, workout.circuit.rounds);
        setTimeout(() => speech.announceExercise(exercises[0].name), 1500);
        setIsResting(false);
        setExerciseIdx(0);
        setRoundIdx(nextRound);
        const secs = workout.circuit.workSeconds;
        setTotalTimerSeconds(secs);
        timer.start(secs);
        return;
      }

      // Circuit done → Finisher
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      playGong();
      const combos = getCombosForRound(currentWeek, 6);
      setCurrentCombos(combos);
      setComboIdx(0);
      speech.announcePhase('Shadowboxing! Runde 1. ' + combos[0]?.sequence);
      startComboRotation(combos);
      setPhase('finisher');
      setFinisherRound(0);
      setIsResting(false);
      const secs = workout.finisher.durationMinutes * 60;
      setTotalTimerSeconds(secs);
      timer.start(secs);
      return;
    }

    // === FINISHER ===
    if (p === 'finisher') {
      if (!resting) {
        const nextF = fRound + 1;
        if (nextF < workout.finisher.rounds) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          playGong();
          stopComboRotation();
          speech.announceRest();
          setIsResting(true);
          const secs = workout.finisher.restSeconds;
          setTotalTimerSeconds(secs);
          timer.start(secs);
          return;
        }
        // Finisher done → Closing
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        playGong();
        stopComboRotation();
        speech.announcePhase('Abschluss. ' + workout.closing.name);
        setPhase('closing');
        return;
      }

      // Rest done → Next finisher round
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      playGong();
      const combos = getCombosForRound(currentWeek, 6);
      setCurrentCombos(combos);
      setComboIdx(0);
      speech.announcePhase(`Runde ${fRound + 2}. ${combos[0]?.sequence ?? 'Boxen!'}`);
      startComboRotation(combos);
      setIsResting(false);
      setFinisherRound(fRound + 1);
      const secs = workout.finisher.durationMinutes * 60;
      setTotalTimerSeconds(secs);
      timer.start(secs);
      return;
    }
  }, [workout, timer, playBeep, playGong, speech, currentWeek]);

  useEffect(() => {
    timer.onComplete.current = advanceState;
  }, [advanceState, timer.onComplete]);

  // Start warmup on mount
  useEffect(() => {
    const secs = WARMUP_EXERCISES[0].duration;
    setTotalTimerSeconds(secs);
    timer.start(secs);
    speech.announcePhase('Aufwärmen. ' + WARMUP_EXERCISES[0].name);
  }, []);

  const handlePauseResume = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (timer.isPaused) timer.resume();
    else if (timer.isRunning) timer.pause();
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    timer.reset();
    advanceState();
  };

  const handleFinish = async () => {
    speech.stop();
    await completeWorkout(dayNum);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const handleQuit = () => {
    timer.pause();
    speech.stop();
    Alert.alert('Workout abbrechen?', 'Dein Fortschritt geht verloren.', [
      { text: 'Weitermachen', style: 'cancel', onPress: () => timer.resume() },
      { text: 'Abbrechen', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  // Current exercise info
  const exerciseInfo = (() => {
    if (phase === 'warmup') {
      const w = WARMUP_EXERCISES[warmupIdx];
      return { name: w.name, icon: w.icon, hint: w.hint, subtitle: `${warmupIdx + 1} / ${WARMUP_EXERCISES.length} Aufwärmübungen` };
    }
    if (phase === 'circuit') {
      const ex = workout.circuit.exercises[exerciseIdx];
      const details = getExerciseById(ex.exerciseId);
      return {
        name: ex.name,
        icon: details?.icon ?? '💪',
        hint: details?.tips ?? details?.description ?? '',
        subtitle: isResting ? 'PAUSE – Durchatmen!' : `Übung ${exerciseIdx + 1} / ${workout.circuit.exercises.length}`,
      };
    }
    if (phase === 'finisher') {
      return {
        name: workout.finisher.label,
        icon: '🥊',
        hint: 'Volle Power! Jab, Cross, Haken – bleib in Bewegung!',
        subtitle: isResting ? 'PAUSE' : `Runde ${finisherRound + 1} / ${workout.finisher.rounds}`,
      };
    }
    return { name: '', icon: '', hint: '', subtitle: '' };
  })();

  // Next exercise preview
  const nextExercise = (() => {
    if (phase === 'warmup') {
      if (warmupIdx + 1 < WARMUP_EXERCISES.length) {
        const next = WARMUP_EXERCISES[warmupIdx + 1];
        return `${next.icon} ${next.name}`;
      }
      return `💪 ${workout.circuit.exercises[0]?.name ?? 'Circuit'}`;
    }
    if (phase === 'circuit' && !isResting) {
      return 'Pause';
    }
    if (phase === 'circuit' && isResting) {
      const nextEx = exerciseIdx + 1;
      if (nextEx < workout.circuit.exercises.length) {
        const ex = workout.circuit.exercises[nextEx];
        const details = getExerciseById(ex.exerciseId);
        return `${details?.icon ?? '💪'} ${ex.name}`;
      }
      if (roundIdx + 1 < workout.circuit.rounds) {
        const ex = workout.circuit.exercises[0];
        const details = getExerciseById(ex.exerciseId);
        return `${details?.icon ?? '💪'} ${ex.name} (Runde ${roundIdx + 2})`;
      }
      return `🥊 ${workout.finisher.label}`;
    }
    if (phase === 'finisher' && isResting) {
      return `🥊 Runde ${finisherRound + 2}`;
    }
    return '';
  })();

  const roundDisplay = (() => {
    if (phase === 'circuit') return `Runde ${roundIdx + 1} / ${workout.circuit.rounds}`;
    if (phase === 'finisher') return `Runde ${finisherRound + 1} / ${workout.finisher.rounds}`;
    if (phase === 'warmup') return 'Aufwärmen';
    return '';
  })();

  // === DONE SCREEN ===
  if (phase === 'done') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.doneScreen}>
          <Text style={{ fontSize: 80 }}>🏆</Text>
          <Text style={styles.doneTitle}>WORKOUT{'\n'}GESCHAFFT!</Text>
          <Text style={styles.doneSubtitle}>
            Tag {dayNum} – {workout.title}
          </Text>
          <View style={styles.doneSummary}>
            <View style={styles.doneStat}>
              <Text style={styles.doneStatValue}>{workout.circuit.rounds}</Text>
              <Text style={styles.doneStatLabel}>RUNDEN</Text>
            </View>
            <View style={styles.doneStat}>
              <Text style={styles.doneStatValue}>{workout.circuit.exercises.length}</Text>
              <Text style={styles.doneStatLabel}>ÜBUNGEN</Text>
            </View>
            <View style={styles.doneStat}>
              <Text style={styles.doneStatValue}>~40</Text>
              <Text style={styles.doneStatLabel}>MINUTEN</Text>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [styles.doneButton, pressed && { transform: [{ scale: 0.96 }] }]}
            onPress={handleFinish}
          >
            <Text style={styles.doneButtonText}>SPEICHERN & ZURÜCK</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // === CLOSING SCREEN ===
  if (phase === 'closing') {
    const closingId = workout.closing.name.toLowerCase().includes('shrug') ? 'kb-shrugs'
      : workout.closing.name.toLowerCase().includes('neck') ? 'neck-bridges'
      : null;
    const closingExercise = closingId ? getExerciseById(closingId) : null;
    const closingIcon = closingExercise?.icon ?? (workout.day === 6 ? '🧘' : '💪');
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.closingScreen}>
          <PhaseIndicator currentPhase="closing" />
          <Text style={{ fontSize: 64 }}>{closingIcon}</Text>
          <Text style={styles.closingLabel}>ABSCHLUSS</Text>
          <Text style={styles.closingTitle}>{workout.closing.name}</Text>
          <View style={styles.closingInfoCard}>
            <Text style={styles.closingInfoText}>
              {workout.closing.sets} Sets ×{' '}
              {workout.closing.reps
                ? `${workout.closing.reps} Wiederholungen`
                : `${workout.closing.durationSeconds}s halten`}
            </Text>
            {closingExercise?.tips && (
              <Text style={styles.closingTip}>💡 {closingExercise.tips}</Text>
            )}
          </View>
          <Text style={styles.closingHint}>
            Führe die Übung in deinem Tempo aus.{'\n'}Drücke "Fertig" wenn du alle Sets gemacht hast.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.closingButton, pressed && { transform: [{ scale: 0.96 }] }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              setPhase('done');
            }}
          >
            <Text style={styles.closingButtonText}>FERTIG ✓</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // === ACTIVE WORKOUT SCREEN ===
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.main}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleQuit} style={styles.quitBtn}>
            <Text style={styles.quitIcon}>✕</Text>
          </Pressable>
          <Text style={styles.headerDay}>
            Tag {dayNum} – {workout.title}
          </Text>
          <View style={styles.roundBadge}>
            <Text style={styles.roundText}>{roundDisplay}</Text>
          </View>
        </View>

        {/* Phase Indicator */}
        <PhaseIndicator currentPhase={phase} />

        {/* Exercise Icon + Name */}
        <View style={styles.exerciseHeader}>
          <Text style={styles.exerciseIcon}>{exerciseInfo.icon}</Text>
          <Text style={styles.exerciseName} numberOfLines={2}>{exerciseInfo.name}</Text>
          <Text style={styles.exerciseSubtitle}>{exerciseInfo.subtitle}</Text>
        </View>

        {/* Timer */}
        <View style={styles.timerWrap}>
          <TimerDisplay
            secondsRemaining={timer.secondsRemaining}
            totalSeconds={totalTimerSeconds}
            isResting={isResting}
            size={Math.min(SCREEN_WIDTH - 80, 280)}
          />
        </View>

        {/* Boxing Combo Card (during Finisher) */}
        {phase === 'finisher' && !isResting && currentCombos.length > 0 ? (
          <View style={styles.comboCard}>
            <View style={styles.comboHeader}>
              <Text style={styles.comboLabel}>🥊 KOMBINATION</Text>
              <Text style={styles.comboLevel}>{currentCombos[comboIdx]?.level}</Text>
            </View>
            <Text style={styles.comboName}>{currentCombos[comboIdx]?.name}</Text>
            <Text style={styles.comboSequence}>{currentCombos[comboIdx]?.sequence}</Text>
            <Text style={styles.comboTip}>{currentCombos[comboIdx]?.tips}</Text>
          </View>
        ) : null}

        {/* Exercise Tip (not during finisher) */}
        {phase !== 'finisher' && exerciseInfo.hint && !isResting ? (
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipText}>{exerciseInfo.hint}</Text>
          </View>
        ) : null}

        {/* Rest message */}
        {isResting ? (
          <View style={styles.restCard}>
            <Text style={styles.restIcon}>😮‍💨</Text>
            <Text style={styles.restText}>Durchatmen & vorbereiten</Text>
          </View>
        ) : null}

        {/* Next Exercise Preview */}
        {nextExercise ? (
          <View style={styles.nextPreview}>
            <Text style={styles.nextLabel}>NÄCHSTE</Text>
            <Text style={styles.nextName}>{nextExercise}</Text>
          </View>
        ) : null}

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable
            style={({ pressed }) => [styles.controlBtnMain, pressed && { transform: [{ scale: 0.95 }] }]}
            onPress={handlePauseResume}
          >
            <Text style={styles.controlMainIcon}>
              {timer.isPaused ? '▶' : '⏸'}
            </Text>
            <Text style={styles.controlMainText}>
              {timer.isPaused ? 'WEITER' : 'PAUSE'}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.skipBtn, pressed && { transform: [{ scale: 0.95 }] }]}
            onPress={handleSkip}
          >
            <Text style={styles.skipText}>SKIP ⏭</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  main: { flex: 1, paddingHorizontal: 20, paddingTop: 8, gap: 12 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  quitBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.surfaceContainerHigh,
    alignItems: 'center', justifyContent: 'center',
  },
  quitIcon: { color: C.onSurfaceVariant, fontSize: 16 },
  headerDay: {
    fontFamily: 'SpaceGrotesk-Bold', fontSize: 12, letterSpacing: 1,
    color: C.tertiary, textTransform: 'uppercase', flex: 1, textAlign: 'center',
  },
  roundBadge: {
    backgroundColor: C.surfaceContainerHigh,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
  },
  roundText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 11, color: C.onSurface, letterSpacing: 1 },

  // Exercise Header
  exerciseHeader: { alignItems: 'center', gap: 4 },
  exerciseIcon: { fontSize: 48 },
  exerciseName: {
    fontFamily: 'SpaceGrotesk-Bold', fontSize: 26, color: C.onSurface,
    letterSpacing: -1, textAlign: 'center', lineHeight: 32,
  },
  exerciseSubtitle: {
    fontFamily: 'Inter-Medium', fontSize: 13, color: C.onSurfaceVariant,
    letterSpacing: 1,
  },

  // Timer
  timerWrap: { alignItems: 'center', justifyContent: 'center' },

  // Tip card
  tipCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.surfaceContainerLow, borderRadius: 12, padding: 14,
    borderLeftWidth: 3, borderLeftColor: C.tertiary,
  },
  tipIcon: { fontSize: 18 },
  tipText: { fontFamily: 'Inter', fontSize: 13, color: C.onSurfaceVariant, flex: 1, lineHeight: 19 },

  // Rest card
  restCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.tertiaryContainer + '30', borderRadius: 12, padding: 14,
  },
  restIcon: { fontSize: 24 },
  restText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 16, color: C.tertiary },

  // Combo card
  comboCard: {
    backgroundColor: C.primaryContainer + '15',
    borderRadius: 16, padding: 16, gap: 6,
    borderLeftWidth: 3, borderLeftColor: C.primaryContainer,
  },
  comboHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  comboLabel: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 10, letterSpacing: 2, color: C.primaryContainer },
  comboLevel: { fontFamily: 'Inter-Medium', fontSize: 10, color: C.onSurfaceVariant },
  comboName: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 16, color: C.onSurface },
  comboSequence: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 28, color: C.primary, letterSpacing: 2, marginVertical: 4 },
  comboTip: { fontFamily: 'Inter', fontSize: 12, color: C.onSurfaceVariant, lineHeight: 18 },

  // Next preview
  nextPreview: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.surfaceContainerHighest + '50', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: C.outlineVariant + '15',
  },
  nextLabel: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 9, letterSpacing: 2, color: C.onSurfaceVariant },
  nextName: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: C.onSurface, flex: 1 },

  // Controls
  controls: { flexDirection: 'row', gap: 12, paddingBottom: 16 },
  controlBtnMain: {
    flex: 1, height: 60, borderRadius: 30,
    backgroundColor: C.primaryContainer,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: C.primaryContainer, shadowOpacity: 0.5, shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  controlMainIcon: { fontSize: 22, color: '#fff' },
  controlMainText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 16, color: '#fff', letterSpacing: -0.5 },
  skipBtn: {
    height: 60, paddingHorizontal: 24, borderRadius: 30,
    backgroundColor: C.surfaceContainerHigh,
    alignItems: 'center', justifyContent: 'center',
  },
  skipText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: C.onSurface, letterSpacing: 1 },

  // Done screen
  doneScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 24 },
  doneTitle: {
    fontFamily: 'SpaceGrotesk-Bold', fontSize: 36, color: C.onSurface,
    letterSpacing: -1, textAlign: 'center', lineHeight: 42,
  },
  doneSubtitle: { fontFamily: 'Inter-Medium', fontSize: 16, color: C.onSurfaceVariant, textAlign: 'center' },
  doneSummary: { flexDirection: 'row', gap: 24, marginTop: 8 },
  doneStat: { alignItems: 'center', gap: 4 },
  doneStatValue: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 28, color: C.primaryContainer },
  doneStatLabel: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 9, letterSpacing: 2, color: C.onSurfaceVariant },
  doneButton: {
    backgroundColor: C.primaryContainer, paddingHorizontal: 40, paddingVertical: 18,
    borderRadius: 999, marginTop: 24,
    shadowColor: C.primaryContainer, shadowOpacity: 0.4, shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  doneButtonText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 16, color: '#fff', letterSpacing: 1 },

  // Closing screen
  closingScreen: {
    flex: 1, paddingHorizontal: 24, paddingTop: 16,
    gap: 16, alignItems: 'center', justifyContent: 'center',
  },
  closingLabel: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 12, letterSpacing: 3, color: C.tertiary },
  closingTitle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 32, color: C.onSurface, textAlign: 'center' },
  closingInfoCard: {
    backgroundColor: C.surfaceContainerLow, borderRadius: 16, padding: 20,
    gap: 8, width: '100%', alignItems: 'center',
  },
  closingInfoText: { fontFamily: 'Inter-SemiBold', fontSize: 18, color: C.onSurface, textAlign: 'center' },
  closingTip: { fontFamily: 'Inter', fontSize: 13, color: C.tertiary, textAlign: 'center' },
  closingHint: {
    fontFamily: 'Inter', fontSize: 14, color: C.onSurfaceVariant,
    textAlign: 'center', lineHeight: 22,
  },
  closingButton: {
    backgroundColor: C.tertiaryContainer, paddingHorizontal: 40, paddingVertical: 18,
    borderRadius: 999, marginTop: 8,
  },
  closingButtonText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 16, color: '#fff', letterSpacing: 1 },
});
