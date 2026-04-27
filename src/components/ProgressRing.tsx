import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/context/themeContext';

interface ProgressRingProps {
  /** 0 to 1 */
  progress: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showPercent?: boolean;
  style?: ViewStyle;
}

/**
 * Animated circular progress ring built with React Native Animated + border trick.
 * No SVG, no external dependencies — works on iOS, Android and Web.
 */
export default function ProgressRing({
  progress,
  size = 72,
  strokeWidth = 6,
  label,
  showPercent = true,
  style,
}: ProgressRingProps) {
  const { colors } = useTheme();
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const scaleAnim        = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(animatedProgress, {
      toValue: Math.min(Math.max(progress, 0), 1),
      tension: 40,
      friction: 7,
      useNativeDriver: false, // needed for non-transform props
    }).start();

    // Pulse when progress increases
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.08, tension: 300, friction: 5, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1,    tension: 300, friction: 5, useNativeDriver: true }),
    ]).start();
  }, [progress]);

  const isComplete = progress >= 1;
  const pct = Math.round(progress * 100);
  const innerSize = size - strokeWidth * 2;

  // Interpolate background color on completion
  const ringColor = isComplete ? colors.success : colors.primary;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      {/* Outer ring container */}
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: colors.surfaceAlt,
          },
        ]}
      >
        {/* Animated fill using a colored inner circle that grows */}
        <Animated.View
          style={[
            styles.fillOverlay,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              backgroundColor: animatedProgress.interpolate({
                inputRange: [0, 0.01, 1],
                outputRange: ['transparent', ringColor + '22', ringColor + '22'],
              }),
              borderWidth: animatedProgress.interpolate({
                inputRange: [0, 0.01, 1],
                outputRange: [0, strokeWidth, strokeWidth],
              }) as any,
              borderColor: ringColor,
            },
          ]}
        >
          {/* Center content */}
          <View style={styles.center}>
            {isComplete ? (
              <Text style={[styles.checkmark, { color: colors.success }]}>✓</Text>
            ) : showPercent ? (
              <Text style={[styles.percent, { color: colors.text, fontSize: size * 0.22 }]}>
                {pct}%
              </Text>
            ) : null}
            {label ? (
              <Text style={[styles.label, { color: colors.textSecondary, fontSize: size * 0.13 }]} numberOfLines={1}>
                {label}
              </Text>
            ) : null}
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  ring: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fillOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  percent: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  checkmark: {
    fontSize: 22,
    fontWeight: '700',
  },
  label: {
    fontWeight: '600',
    marginTop: 1,
  },
});
