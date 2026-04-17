import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const Colors = {
  surfaceContainerHighest: '#353534',
  primaryContainer: '#ff535b',
  tertiary: '#6fd8cc',
  onSurface: '#e5e2e1',
};

interface Props {
  secondsRemaining: number;
  totalSeconds: number;
  isResting: boolean;
  size?: number;
}

export function TimerDisplay({ secondsRemaining, totalSeconds, isResting, size = 256 }: Props) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? secondsRemaining / totalSeconds : 0;
  const strokeDashoffset = circumference * (1 - progress);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.surfaceContainerHighest}
          strokeWidth={4}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isResting ? Colors.tertiary : Colors.primaryContainer}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.time}>{timeStr}</Text>
        <Text style={[styles.label, { color: isResting ? Colors.tertiary : Colors.primaryContainer }]}>
          {isResting ? 'PAUSE' : 'WORK'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  center: { position: 'absolute', alignItems: 'center' },
  time: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 56, color: Colors.onSurface, letterSpacing: -2 },
  label: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 11, letterSpacing: 4, marginTop: 4 },
});
