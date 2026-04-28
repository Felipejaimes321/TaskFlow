import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/context/themeContext';

export default function TaskSkeleton() {
  const { colors, isDark } = useTheme();
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const baseColor = isDark ? '#333333' : '#E0E0E0';
  const highlightColor = isDark ? '#444444' : '#F0F0F0';

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
      <View style={[styles.accentBar, { backgroundColor: colors.surfaceAlt }]} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          {/* Title skeleton */}
          <Animated.View style={[styles.titleSk, { backgroundColor: baseColor, opacity: pulseAnim }]} />
          {/* Priority skeleton */}
          <Animated.View style={[styles.badgeSk, { backgroundColor: baseColor, opacity: pulseAnim }]} />
        </View>
        {/* Description skeleton */}
        <Animated.View style={[styles.descSk, { backgroundColor: baseColor, opacity: pulseAnim }]} />
        <Animated.View style={[styles.descSk, { width: '60%', backgroundColor: baseColor, opacity: pulseAnim }]} />
        
        {/* Meta row skeleton */}
        <View style={styles.metaRow}>
          <Animated.View style={[styles.chipSk, { backgroundColor: baseColor, opacity: pulseAnim }]} />
          <Animated.View style={[styles.chipSk, { backgroundColor: baseColor, opacity: pulseAnim }]} />
        </View>
      </View>
      {/* Action button skeleton */}
      <View style={styles.actions}>
        <Animated.View style={[styles.circleSk, { backgroundColor: baseColor, opacity: pulseAnim }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  accentBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 13,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleSk: {
    height: 18,
    width: '50%',
    borderRadius: 4,
  },
  badgeSk: {
    height: 18,
    width: 40,
    borderRadius: 4,
  },
  descSk: {
    height: 12,
    width: '85%',
    borderRadius: 4,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  chipSk: {
    height: 20,
    width: 60,
    borderRadius: 6,
  },
  actions: {
    justifyContent: 'center',
    paddingRight: 11,
  },
  circleSk: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});
