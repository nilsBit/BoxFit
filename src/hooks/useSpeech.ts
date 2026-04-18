import * as Speech from 'expo-speech';
import { useRef, useEffect, useCallback, useState } from 'react';

export type SpeechVoice = 'trainer' | 'opponent';

interface VoiceIds {
  male: string | undefined;
  female: string | undefined;
}

export function useSpeech(enabled: boolean = true) {
  const lastSpoken = useRef<{ text: string; time: number }>({ text: '', time: 0 });
  const voicesRef = useRef<VoiceIds>({ male: undefined, female: undefined });

  useEffect(() => {
    (async () => {
      try {
        const available = await Speech.getAvailableVoicesAsync();
        const deVoices = available.filter((v) => v.language.startsWith('de'));
        const maleKeywords = ['male', 'mann', 'martin', 'markus', 'daniel', 'thomas', 'yannick', 'hans'];
        const femaleKeywords = ['female', 'frau', 'anna', 'petra', 'helena', 'marie', 'vicki', 'marlene'];

        let maleVoice = deVoices.find((v) =>
          maleKeywords.some((k) => v.identifier.toLowerCase().includes(k) || v.name?.toLowerCase().includes(k))
        );
        let femaleVoice = deVoices.find((v) =>
          femaleKeywords.some((k) => v.identifier.toLowerCase().includes(k) || v.name?.toLowerCase().includes(k))
        );

        if (!maleVoice && !femaleVoice && deVoices.length >= 2) {
          maleVoice = deVoices[0];
          femaleVoice = deVoices[1];
        } else if (!maleVoice && deVoices.length >= 1) {
          maleVoice = deVoices[0];
        } else if (!femaleVoice && deVoices.length >= 1) {
          femaleVoice = deVoices.find((v) => v.identifier !== maleVoice?.identifier) ?? deVoices[0];
        }

        voicesRef.current = {
          male: maleVoice?.identifier,
          female: femaleVoice?.identifier,
        };
      } catch (e) {
        console.warn('Could not load voices:', e);
      }
    })();
  }, []);

  const speak = useCallback((text: string, voice?: SpeechVoice) => {
    if (!enabled) return;
    const now = Date.now();
    if (text === lastSpoken.current.text && now - lastSpoken.current.time < 500) return;
    lastSpoken.current = { text, time: now };

    Speech.stop();
    const voices = voicesRef.current;

    if (voice === 'opponent') {
      Speech.speak(text, { language: 'de-DE', voice: voices.male, rate: 1.2, pitch: 0.75 });
    } else if (voice === 'trainer') {
      Speech.speak(text, { language: 'de-DE', voice: voices.female, rate: 1.1, pitch: 1.3 });
    } else {
      Speech.speak(text, { language: 'de-DE', voice: voices.male, rate: 1.0, pitch: 0.85 });
    }
  }, [enabled]);

  const announceExercise = useCallback((name: string) => { speak(name); }, [speak]);
  const announceRest = useCallback(() => { speak('Pause'); }, [speak]);
  const announceRound = useCallback((round: number, total: number) => { speak(`Runde ${round} von ${total}`); }, [speak]);
  const announcePhase = useCallback((phase: string) => { speak(phase); }, [speak]);
  const stop = useCallback(() => { Speech.stop(); lastSpoken.current = { text: '', time: 0 }; }, []);

  return { speak, announceExercise, announceRest, announceRound, announcePhase, stop };
}
