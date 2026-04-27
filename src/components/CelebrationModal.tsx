import React, { useEffect, useRef } from 'react';
import {
  View, Text, Modal, StyleSheet, Animated, TouchableOpacity, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/themeContext';

const { width: W, height: H } = Dimensions.get('window');

const MOTIVATIONAL = [
  '¡Lo lograste! Cada pequeño paso cuenta. 🚀',
  '¡Increíble! Eres una máquina de productividad. ⚡',
  '¡Misión cumplida! Sigue así y nada te detiene. 🏆',
  '¡Tarea completada! Tu futuro yo te lo agradece. 🌟',
  '¡Excelente trabajo! Un logro más en tu lista. 🎯',
];

interface ConfettiParticle {
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  color: string;
  size: number;
}

const CONFETTI_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

function useConfetti(count = 20): ConfettiParticle[] {
  return useRef(
    Array.from({ length: count }, () => ({
      x:       new Animated.Value(Math.random() * W),
      y:       new Animated.Value(-20),
      opacity: new Animated.Value(1),
      scale:   new Animated.Value(Math.random() * 0.6 + 0.4),
      color:   CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size:    Math.random() * 8 + 5,
    }))
  ).current;
}

interface CelebrationModalProps {
  visible: boolean;
  taskTitle: string;
  subtaskCount: number;
  onClose: () => void;
}

export default function CelebrationModal({ visible, taskTitle, subtaskCount, onClose }: CelebrationModalProps) {
  const { colors, isDark } = useTheme();
  const particles = useConfetti(24);

  const containerScale   = useRef(new Animated.Value(0.6)).current;
  const containerOpacity = useRef(new Animated.Value(0)).current;
  const checkScale       = useRef(new Animated.Value(0)).current;
  const textOpacity      = useRef(new Animated.Value(0)).current;

  const phrase = MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)];

  useEffect(() => {
    if (!visible) return;

    // Reset
    particles.forEach(p => { p.y.setValue(-20); p.x.setValue(Math.random() * W); p.opacity.setValue(1); });
    containerScale.setValue(0.6);
    containerOpacity.setValue(0);
    checkScale.setValue(0);
    textOpacity.setValue(0);

    // Animate in
    Animated.sequence([
      Animated.parallel([
        Animated.spring(containerScale,   { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
        Animated.timing(containerOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]),
      Animated.spring(checkScale,  { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }),
      Animated.timing(textOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    // Confetti rain
    const confettiAnims = particles.map(p =>
      Animated.parallel([
        Animated.timing(p.y, {
          toValue: H * 0.85,
          duration: 1200 + Math.random() * 800,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(600 + Math.random() * 400),
          Animated.timing(p.opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]),
      ])
    );
    Animated.stagger(40, confettiAnims).start();
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <View style={styles.backdrop}>
        {/* Confetti particles */}
        {particles.map((p, i) => (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                backgroundColor: p.color,
                width: p.size,
                height: p.size,
                borderRadius: Math.random() > 0.5 ? p.size / 2 : 2,
                transform: [{ translateX: p.x }, { translateY: p.y }, { scale: p.scale }],
                opacity: p.opacity,
              },
            ]}
          />
        ))}

        {/* Card */}
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: containerOpacity,
              transform: [{ scale: containerScale }],
            },
          ]}
        >
          {/* Checkmark circle */}
          <Animated.View
            style={[
              styles.checkCircle,
              { backgroundColor: colors.successBg, borderColor: colors.successBorder, transform: [{ scale: checkScale }] },
            ]}
          >
            <Ionicons name="checkmark-circle" size={52} color={colors.success} />
          </Animated.View>

          {/* Title */}
          <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
            <Text style={[styles.congrats, { color: colors.text }]}>¡Tarea Completada!</Text>
            <Text style={[styles.taskName, { color: colors.primary }]} numberOfLines={2}>{taskTitle}</Text>

            {/* Stats */}
            <View style={[styles.statsRow, { backgroundColor: colors.primaryLight, borderColor: colors.primaryBorder }]}>
              <View style={styles.stat}>
                <Ionicons name="checkmark-done" size={18} color={colors.primary} />
                <Text style={[styles.statNum, { color: colors.text }]}>{subtaskCount}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {subtaskCount === 1 ? 'subtarea' : 'subtareas'}
                </Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.stat}>
                <Ionicons name="trophy" size={18} color={colors.warning} />
                <Text style={[styles.statNum, { color: colors.text }]}>+10</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>XP</Text>
              </View>
            </View>

            <Text style={[styles.phrase, { color: colors.textSecondary }]}>{phrase}</Text>
          </Animated.View>

          {/* Close button */}
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: colors.primary }]}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.closeBtnText}>¡Genial! 🎉</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  particle:     { position: 'absolute' },
  card:         { width: W * 0.82, borderRadius: 24, padding: 28, alignItems: 'center', borderWidth: 1 },
  checkCircle:  { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', borderWidth: 2, marginBottom: 20 },
  congrats:     { fontSize: 22, fontWeight: '800', marginBottom: 6 },
  taskName:     { fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 20, paddingHorizontal: 8 },
  statsRow:     { flexDirection: 'row', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24, borderWidth: 1, gap: 24, marginBottom: 18 },
  stat:         { alignItems: 'center', gap: 3 },
  statNum:      { fontSize: 20, fontWeight: '800' },
  statLabel:    { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  statDivider:  { width: 1, height: '100%' },
  phrase:       { fontSize: 13, textAlign: 'center', lineHeight: 18, marginBottom: 24, paddingHorizontal: 8 },
  closeBtn:     { width: '100%', height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  closeBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
