import { useRef, useEffect } from 'react';
import { Audio } from 'expo-av';

export function useSound() {
  const beepRef = useRef<Audio.Sound | null>(null);
  const gongRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });

    return () => {
      beepRef.current?.unloadAsync();
      gongRef.current?.unloadAsync();
    };
  }, []);

  const playBeep = async () => {
    try {
      if (beepRef.current) {
        await beepRef.current.replayAsync();
      } else {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/beep.mp3')
        );
        beepRef.current = sound;
        await sound.playAsync();
      }
    } catch (e) {
      console.warn('Beep sound failed:', e);
    }
  };

  const playGong = async () => {
    try {
      if (gongRef.current) {
        await gongRef.current.replayAsync();
      } else {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/gong.mp3')
        );
        gongRef.current = sound;
        await sound.playAsync();
      }
    } catch (e) {
      console.warn('Gong sound failed:', e);
    }
  };

  return { playBeep, playGong };
}
