import * as Speech from 'expo-speech';
import { useRef, useEffect, useState } from 'react';

export type SpeechVoice = 'trainer' | 'opponent';

interface VoiceIds {
  male: string | undefined;    // Männlich (Standard + Sparring Gegner)
  female: string | undefined;  // Weiblich (Sparring deine Kombos)
}

export function useSpeech() {
  const lastSpoken = useRef('');
  const [voices, setVoices] = useState<VoiceIds>({ male: undefined, female: undefined });

  // Load available voices and find male/female German voices
  useEffect(() => {
    (async () => {
      try {
        const available = await Speech.getAvailableVoicesAsync();

        // Find German voices
        const deVoices = available.filter(
          (v) => v.language.startsWith('de') && v.quality !== Speech.VoiceQuality?.Default
        );
        const deAll = available.filter((v) => v.language.startsWith('de'));
        const pool = deVoices.length > 0 ? deVoices : deAll;

        // Try to find male/female by common naming patterns
        const maleKeywords = ['male', 'mann', 'martin', 'markus', 'daniel', 'thomas', 'yannick', 'hans'];
        const femaleKeywords = ['female', 'frau', 'anna', 'petra', 'helena', 'marie', 'vicki', 'marlene'];

        let maleVoice = pool.find((v) =>
          maleKeywords.some((k) => v.identifier.toLowerCase().includes(k) || v.name?.toLowerCase().includes(k))
        );
        let femaleVoice = pool.find((v) =>
          femaleKeywords.some((k) => v.identifier.toLowerCase().includes(k) || v.name?.toLowerCase().includes(k))
        );

        // Fallback: if we can't identify gender, use first two different voices
        if (!maleVoice && !femaleVoice && pool.length >= 2) {
          maleVoice = pool[0];
          femaleVoice = pool[1];
        } else if (!maleVoice && pool.length >= 1) {
          maleVoice = pool[0];
        } else if (!femaleVoice && pool.length >= 1) {
          femaleVoice = pool.find((v) => v.identifier !== maleVoice?.identifier) ?? pool[0];
        }

        // Also check English voices for more variety
        const enVoices = available.filter((v) => v.language.startsWith('en'));
        const enMale = enVoices.find((v) =>
          maleKeywords.some((k) => v.identifier.toLowerCase().includes(k) || v.name?.toLowerCase().includes(k))
        );

        setVoices({
          male: maleVoice?.identifier ?? enMale?.identifier,
          female: femaleVoice?.identifier,
        });
      } catch (e) {
        // Fallback: no specific voices, use pitch differentiation
        console.warn('Could not load voices:', e);
      }
    })();
  }, []);

  const speak = (text: string, voice?: SpeechVoice) => {
    if (text === lastSpoken.current) return;
    lastSpoken.current = text;

    Speech.stop();

    if (voice === 'opponent') {
      // GEGNER: männliche Stimme, tief und aggressiv
      Speech.speak(text, {
        language: 'de-DE',
        voice: voices.male,
        rate: 1.2,
        pitch: 0.75,
      });
    } else if (voice === 'trainer') {
      // DEINE KOMBOS: weibliche Stimme, klar und bestimmt
      Speech.speak(text, {
        language: 'de-DE',
        voice: voices.female,
        rate: 1.1,
        pitch: 1.3,
      });
    } else {
      // Standard (Übungsansagen, Phasen etc.): männliche Stimme
      Speech.speak(text, {
        language: 'de-DE',
        voice: voices.male,
        rate: 1.0,
        pitch: 0.85,
      });
    }
  };

  const announceExercise = (name: string) => {
    speak(name);
  };

  const announceRest = () => {
    speak('Pause');
  };

  const announceRound = (round: number, total: number) => {
    speak(`Runde ${round} von ${total}`);
  };

  const announcePhase = (phase: string) => {
    speak(phase);
  };

  const announceCountdown = (seconds: number) => {
    if (seconds <= 3 && seconds > 0) {
      speak(String(seconds));
    }
  };

  const stop = () => {
    Speech.stop();
    lastSpoken.current = '';
  };

  return {
    speak,
    announceExercise,
    announceRest,
    announceRound,
    announcePhase,
    announceCountdown,
    stop,
  };
}
