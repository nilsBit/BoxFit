import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useTimer } from '../src/hooks/useTimer';
import { useSound } from '../src/hooks/useSound';
import { useSpeech } from '../src/hooks/useSpeech';
import { TimerDisplay } from '../src/components/TimerDisplay';
import {
  SparringCall,
  SparringIntensity,
  SPARRING_INTENSITIES,
  getRandomCall,
} from '../src/constants/sparring';

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
};

const CALL_COLORS = {
  red: { bg: '#ff535b25', border: '#ff535b', text: '#ff535b' },
  blue: { bg: '#4A90D925', border: '#4A90D9', text: '#6AAFFF' },
  green: { bg: '#4CAF5025', border: '#4CAF50', text: '#66BB6A' },
};

type SparringPhase = 'select' | 'countdown' | 'round' | 'rest' | 'done';

export default function SparringScreen() {
  const router = useRouter();
  const timer = useTimer();
  const { playBeep, playGong } = useSound();
  const speech = useSpeech();

  const [phase, setPhase] = useState<SparringPhase>('select');
  const [intensity, setIntensity] = useState<SparringIntensity>('mittel');
  const [currentRound, setCurrentRound] = useState(0);
  const [currentCall, setCurrentCall] = useState<SparringCall | null>(null);
  const [lastCalls, setLastCalls] = useState<SparringCall[]>([]);
  const [totalTimerSecs, setTotalTimerSecs] = useState(0);

  const callIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef(phase);
  const roundRef = useRef(currentRound);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { roundRef.current = currentRound; }, [currentRound]);

  useEffect(() => {
    activateKeepAwakeAsync();
    return () => {
      deactivateKeepAwake();
      stopCalls();
      speech.stop();
    };
  }, []);

  const stopCalls = useCallback(() => {
    if (callIntervalRef.current) {
      clearInterval(callIntervalRef.current);
      callIntervalRef.current = null;
    }
  }, []);

  const speakCall = useCallback((call: SparringCall) => {
    // Defense = opponent voice (high pitch, English)
    // Offense = trainer voice (deep, German)
    // Combo = trainer voice for the counter part
    const voice = call.type === 'defense' ? 'opponent' as const : 'trainer' as const;
    speech.speak(call.speech, voice);
  }, [speech]);

  const startCalls = useCallback(() => {
    const config = SPARRING_INTENSITIES[intensity];
    stopCalls();

    // First call immediately
    const firstCall = getRandomCall(intensity);
    setCurrentCall(firstCall);
    speakCall(firstCall);
    Haptics.impactAsync(
      firstCall.type === 'defense'
        ? Haptics.ImpactFeedbackStyle.Heavy
        : Haptics.ImpactFeedbackStyle.Medium
    );

    callIntervalRef.current = setInterval(() => {
      const call = getRandomCall(intensity);
      setCurrentCall(call);
      setLastCalls((prev) => [call, ...prev].slice(0, 3));
      speakCall(call);
      Haptics.impactAsync(
        call.type === 'defense'
          ? Haptics.ImpactFeedbackStyle.Heavy
          : Haptics.ImpactFeedbackStyle.Medium
      );
    }, config.intervalMs);
  }, [intensity, stopCalls, speech]);

  const advanceState = useCallback(() => {
    const p = phaseRef.current;
    const r = roundRef.current;
    const config = SPARRING_INTENSITIES[intensity];

    if (p === 'countdown') {
      // Start round
      playGong();
      speech.announcePhase(`Runde ${1}. Boxen!`);
      setPhase('round');
      setCurrentRound(0);
      const secs = config.roundMinutes * 60;
      setTotalTimerSecs(secs);
      timer.start(secs);
      startCalls();
      return;
    }

    if (p === 'round') {
      stopCalls();
      playGong();
      const nextRound = r + 1;
      if (nextRound >= config.rounds) {
        // Done
        speech.announcePhase('Fertig! Gute Arbeit!');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setPhase('done');
        return;
      }
      // Rest
      speech.announceRest();
      setPhase('rest');
      setTotalTimerSecs(config.restSeconds);
      timer.start(config.restSeconds);
      return;
    }

    if (p === 'rest') {
      const nextRound = r + 1;
      playGong();
      speech.announcePhase(`Runde ${nextRound + 1}. Boxen!`);
      setCurrentRound(nextRound);
      setPhase('round');
      const secs = config.roundMinutes * 60;
      setTotalTimerSecs(secs);
      timer.start(secs);
      startCalls();
      return;
    }
  }, [intensity, timer, playGong, speech, startCalls, stopCalls]);

  useEffect(() => {
    timer.onComplete.current = advanceState;
  }, [advanceState, timer.onComplete]);

  // 3-2-1 countdown beep
  useEffect(() => {
    if (timer.secondsRemaining <= 3 && timer.secondsRemaining > 0 && timer.isRunning) {
      if (phase === 'round') {
        playBeep();
      }
    }
  }, [timer.secondsRemaining]);

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    speech.announcePhase('Mach dich bereit!');
    setPhase('countdown');
    setTotalTimerSecs(5);
    timer.start(5);
    setLastCalls([]);
  };

  const handlePauseResume = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (timer.isPaused) {
      timer.resume();
      if (phase === 'round') startCalls();
    } else {
      timer.pause();
      stopCalls();
    }
  };

  const handleQuit = () => {
    stopCalls();
    timer.pause();
    speech.stop();
    Alert.alert('Sparring beenden?', '', [
      { text: 'Weiterkämpfen', style: 'cancel', onPress: () => { timer.resume(); if (phase === 'round') startCalls(); } },
      { text: 'Beenden', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  const config = SPARRING_INTENSITIES[intensity];
  const callColors = currentCall ? CALL_COLORS[currentCall.color] : null;

  // === SELECT INTENSITY ===
  if (phase === 'select') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.selectScreen}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>

          <Text style={styles.selectIcon}>🥊</Text>
          <Text style={styles.selectTitle}>SPARRING{'\n'}TRAINER</Text>
          <Text style={styles.selectDesc}>
            Dein virtueller Trainer ruft Kombos{'\n'}und gegnerische Angriffe
          </Text>

          <View style={styles.intensityList}>
            {(Object.keys(SPARRING_INTENSITIES) as SparringIntensity[]).map((key) => {
              const cfg = SPARRING_INTENSITIES[key];
              const isSelected = intensity === key;
              return (
                <Pressable
                  key={key}
                  style={[styles.intensityCard, isSelected && styles.intensityCardActive]}
                  onPress={() => setIntensity(key)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.intensityName, isSelected && { color: C.primaryContainer }]}>
                      {cfg.label}
                    </Text>
                    <Text style={styles.intensityMeta}>
                      {cfg.rounds} Runden × {cfg.roundMinutes} Min | {(cfg.intervalMs / 1000).toFixed(0)}s Takt
                    </Text>
                  </View>
                  {isSelected && <Text style={{ fontSize: 20 }}>✓</Text>}
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={({ pressed }) => [styles.startBtn, pressed && { transform: [{ scale: 0.96 }] }]}
            onPress={handleStart}
          >
            <Text style={styles.startBtnText}>🥊 SPARRING STARTEN</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // === DONE ===
  if (phase === 'done') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.doneScreen}>
          <Text style={{ fontSize: 80 }}>🏆</Text>
          <Text style={styles.doneTitle}>SPARRING{'\n'}GESCHAFFT!</Text>
          <Text style={styles.doneSub}>
            {config.rounds} Runden × {config.roundMinutes} Min | {config.label}
          </Text>
          <Pressable
            style={({ pressed }) => [styles.doneBtn, pressed && { transform: [{ scale: 0.96 }] }]}
            onPress={() => router.back()}
          >
            <Text style={styles.doneBtnText}>ZURÜCK</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // === ACTIVE SPARRING ===
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.main}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleQuit} style={styles.quitBtn}>
            <Text style={styles.quitIcon}>✕</Text>
          </Pressable>
          <Text style={styles.headerTitle}>
            {phase === 'countdown' ? 'BEREIT MACHEN' :
             phase === 'rest' ? 'PAUSE' :
             `RUNDE ${currentRound + 1} / ${config.rounds}`}
          </Text>
          <View style={styles.intensityBadge}>
            <Text style={styles.intensityBadgeText}>{config.label.split(' ')[0].toUpperCase()}</Text>
          </View>
        </View>

        {/* Current Call Display */}
        {phase === 'round' && currentCall ? (
          <View style={[styles.callCard, { backgroundColor: callColors?.bg, borderColor: callColors?.border }]}>
            <Text style={styles.callType}>
              {currentCall.type === 'defense' ? '🛡️ GEGNER SCHLÄGT' :
               currentCall.type === 'combo' ? '⚡ DODGE & COUNTER' : '👊 DU SCHLÄGST'}
            </Text>
            <Text style={styles.callIcon}>{currentCall.icon}</Text>
            <Text style={[styles.callText, { color: callColors?.text }]}>{currentCall.text}</Text>
            {currentCall.type === 'defense' && (
              <Text style={styles.callHint}>Ausweichen!</Text>
            )}
          </View>
        ) : phase === 'countdown' ? (
          <View style={styles.countdownWrap}>
            <Text style={styles.countdownNum}>{timer.secondsRemaining}</Text>
            <Text style={styles.countdownLabel}>BEREIT MACHEN</Text>
          </View>
        ) : phase === 'rest' ? (
          <View style={styles.restWrap}>
            <Text style={{ fontSize: 48 }}>😮‍💨</Text>
            <Text style={styles.restTitle}>PAUSE</Text>
            <Text style={styles.restSub}>Nächste Runde in...</Text>
          </View>
        ) : null}

        {/* Timer */}
        {phase !== 'countdown' && (
          <View style={styles.timerWrap}>
            <TimerDisplay
              secondsRemaining={timer.secondsRemaining}
              totalSeconds={totalTimerSecs}
              isResting={phase === 'rest'}
              size={Math.min(SCREEN_WIDTH - 120, 220)}
            />
          </View>
        )}

        {/* Recent Calls History */}
        {phase === 'round' && lastCalls.length > 0 && (
          <View style={styles.historyWrap}>
            <Text style={styles.historyLabel}>LETZTE CALLS</Text>
            {lastCalls.map((call, i) => (
              <Text key={i} style={[styles.historyItem, { opacity: 1 - i * 0.3 }]}>
                {call.icon} {call.text}
              </Text>
            ))}
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable
            style={({ pressed }) => [styles.mainBtn, pressed && { transform: [{ scale: 0.95 }] }]}
            onPress={handlePauseResume}
          >
            <Text style={styles.mainBtnIcon}>{timer.isPaused ? '▶' : '⏸'}</Text>
            <Text style={styles.mainBtnText}>{timer.isPaused ? 'WEITER' : 'PAUSE'}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },

  // Select screen
  selectScreen: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.surfaceContainerHigh,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  backIcon: { color: C.onSurface, fontSize: 24, marginTop: -2 },
  selectIcon: { fontSize: 56, textAlign: 'center' },
  selectTitle: {
    fontFamily: 'SpaceGrotesk-Bold', fontSize: 36, color: C.onSurface,
    textAlign: 'center', letterSpacing: -1, lineHeight: 42, marginTop: 8,
  },
  selectDesc: {
    fontFamily: 'Inter', fontSize: 14, color: C.onSurfaceVariant,
    textAlign: 'center', lineHeight: 22, marginTop: 8, marginBottom: 24,
  },
  intensityList: { gap: 10, flex: 1 },
  intensityCard: {
    backgroundColor: C.surfaceContainerLow, borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'transparent',
  },
  intensityCardActive: { borderColor: C.primaryContainer },
  intensityName: {
    fontFamily: 'SpaceGrotesk-Bold', fontSize: 16, color: C.onSurface,
  },
  intensityMeta: {
    fontFamily: 'Inter', fontSize: 12, color: C.onSurfaceVariant, marginTop: 2,
  },
  startBtn: {
    backgroundColor: C.primaryContainer, borderRadius: 999, height: 60,
    alignItems: 'center', justifyContent: 'center', marginTop: 16, marginBottom: 24,
    shadowColor: C.primaryContainer, shadowOpacity: 0.4, shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  startBtnText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, color: '#fff', letterSpacing: 1 },

  // Active screen
  main: { flex: 1, paddingHorizontal: 20, paddingTop: 8, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  quitBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center',
  },
  quitIcon: { color: C.onSurfaceVariant, fontSize: 16 },
  headerTitle: {
    fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: C.onSurface, letterSpacing: 1,
  },
  intensityBadge: {
    backgroundColor: C.surfaceContainerHigh, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
  },
  intensityBadgeText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 10, color: C.primary, letterSpacing: 1 },

  // Call card
  callCard: {
    borderRadius: 20, padding: 24, alignItems: 'center', gap: 8,
    borderWidth: 2, minHeight: 180, justifyContent: 'center',
  },
  callType: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 11, letterSpacing: 3, color: C.onSurfaceVariant },
  callIcon: { fontSize: 48 },
  callText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 32, letterSpacing: 2, textAlign: 'center' },
  callHint: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#6AAFFF', marginTop: 4 },

  // Countdown
  countdownWrap: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  countdownNum: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 120, color: C.primaryContainer },
  countdownLabel: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 16, color: C.onSurfaceVariant, letterSpacing: 3 },

  // Rest
  restWrap: { alignItems: 'center', gap: 8 },
  restTitle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 28, color: C.tertiary },
  restSub: { fontFamily: 'Inter', fontSize: 14, color: C.onSurfaceVariant },

  // Timer
  timerWrap: { alignItems: 'center' },

  // History
  historyWrap: {
    backgroundColor: C.surfaceContainerLow, borderRadius: 12, padding: 12, gap: 4,
  },
  historyLabel: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 9, letterSpacing: 2, color: C.onSurfaceVariant },
  historyItem: { fontFamily: 'Inter-Medium', fontSize: 13, color: C.onSurface },

  // Controls
  controls: { paddingBottom: 24 },
  mainBtn: {
    height: 60, borderRadius: 30, backgroundColor: C.primaryContainer,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: C.primaryContainer, shadowOpacity: 0.5, shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  mainBtnIcon: { fontSize: 22, color: '#fff' },
  mainBtnText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 16, color: '#fff' },

  // Done
  doneScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 24 },
  doneTitle: {
    fontFamily: 'SpaceGrotesk-Bold', fontSize: 36, color: C.onSurface, textAlign: 'center', lineHeight: 42,
  },
  doneSub: { fontFamily: 'Inter-Medium', fontSize: 14, color: C.onSurfaceVariant },
  doneBtn: {
    backgroundColor: C.primaryContainer, paddingHorizontal: 40, paddingVertical: 18,
    borderRadius: 999, marginTop: 16,
  },
  doneBtnText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 16, color: '#fff', letterSpacing: 1 },
});
