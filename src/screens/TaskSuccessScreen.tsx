import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  StatusBar, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/themeContext';
import { formatDate } from '@/utils/dateUtils';

const { width: W } = Dimensions.get('window');
const AUTO_DISMISS_MS = 2800;

const PHRASES = [
  'Un paso más cerca de tu meta.',
  'Cada tarea es un logro.',
  'El progreso empieza con una acción.',
  'Tu futuro yo te lo agradece.',
  'Sin excusas, solo resultados.',
];

const PRIORITY_CONFIG: Record<string, { label: string }> = {
  high:   { label: 'Alta'  },
  medium: { label: 'Media' },
  low:    { label: 'Baja'  },
};

// ─── Animated dot ─────────────────────────────────────────────────────────────
function AnimDot({ color, delay }: { color: string; delay: number }) {
  const y  = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.spring(y,  { toValue: -14, tension: 60, friction: 5, useNativeDriver: true }),
          Animated.timing(op, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.spring(y,  { toValue: 0, tension: 60, friction: 5, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color, opacity: op, transform: [{ translateY: y }], marginHorizontal: 4 }} />
  );
}

interface TaskSuccessScreenProps {
  route: { params: { title: string; priority: string; dueDate?: string | null; categoryName?: string | null } };
  navigation: any;
}

export default function TaskSuccessScreen({ route, navigation }: TaskSuccessScreenProps) {
  const { title, priority, dueDate, categoryName } = route.params;
  const { colors, isDark } = useTheme();

  const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];
  const pc     = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.low;

  const priorityColor =
    priority === 'high' ? colors.priorityHigh :
    priority === 'medium' ? colors.priorityMed : colors.priorityLow;

  // Animations
  const checkScale  = useRef(new Animated.Value(0)).current;
  const contentOp   = useRef(new Animated.Value(0)).current;
  const contentY    = useRef(new Animated.Value(20)).current;
  const btnsOp      = useRef(new Animated.Value(0)).current;
  const progressW   = useRef(new Animated.Value(0)).current;

  // Auto-dismiss progress bar
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Entrance animation sequence
    Animated.sequence([
      Animated.spring(checkScale, { toValue: 1, tension: 50, friction: 6, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(contentOp, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.spring(contentY,  { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
      ]),
      Animated.timing(btnsOp, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();

    // Auto-dismiss countdown bar
    Animated.timing(progressW, {
      toValue: 1,
      duration: AUTO_DISMISS_MS,
      useNativeDriver: false,
    }).start();

    // Auto-navigate after timeout
    const timer = setTimeout(() => {
      if (!dismissed) navigation.navigate('TasksList');
    }, AUTO_DISMISS_MS);

    return () => clearTimeout(timer);
  }, []);

  const handleViewTasks = () => {
    setDismissed(true);
    navigation.navigate('TasksList');
  };

  const handleCreateAnother = () => {
    setDismissed(true);
    navigation.goBack();
  };

  // Dot colors using theme palette
  const dotColors = [colors.primary, colors.success, colors.warning, colors.error, colors.primary, colors.success];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Auto-dismiss progress bar */}
      <Animated.View
        style={[
          styles.progressBar,
          {
            backgroundColor: colors.primary,
            width: progressW.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          },
        ]}
      />

      {/* Content */}
      <View style={styles.inner}>

        {/* Animated dots above checkmark */}
        <View style={styles.dotsRow}>
          {dotColors.map((c, i) => (
            <AnimDot key={i} color={c} delay={i * 120} />
          ))}
        </View>

        {/* Checkmark circle */}
        <Animated.View style={{ transform: [{ scale: checkScale }], marginBottom: 28 }}>
          <View style={[styles.checkOuter, { borderColor: colors.successBorder, backgroundColor: colors.successBg }]}>
            <View style={[styles.checkInner, { backgroundColor: colors.success }]}>
              <Ionicons name="checkmark" size={40} color="#FFFFFF" />
            </View>
          </View>
        </Animated.View>

        {/* Text + card */}
        <Animated.View style={[styles.textBlock, { opacity: contentOp, transform: [{ translateY: contentY }] }]}>
          <Text style={[styles.headline, { color: colors.text }]}>¡Tarea creada!</Text>
          <Text style={[styles.phrase, { color: colors.textSecondary }]}>{phrase}</Text>

          {/* Summary card */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Task title */}
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>{title}</Text>

            {/* Meta chips */}
            <View style={styles.metaRow}>
              <View style={[styles.badge, { backgroundColor: priorityColor + '18', borderColor: priorityColor + '40' }]}>
                <Ionicons name="flag" size={11} color={priorityColor} />
                <Text style={[styles.badgeText, { color: priorityColor }]}>{pc.label}</Text>
              </View>
              {dueDate && (
                <View style={[styles.badge, { backgroundColor: colors.primaryLight, borderColor: colors.primaryBorder }]}>
                  <Ionicons name="calendar-outline" size={11} color={colors.primary} />
                  <Text style={[styles.badgeText, { color: colors.primary }]}>{formatDate(dueDate)}</Text>
                </View>
              )}
              {categoryName && (
                <View style={[styles.badge, { backgroundColor: colors.primaryLight, borderColor: colors.primaryBorder }]}>
                  <Ionicons name="folder-outline" size={11} color={colors.primary} />
                  <Text style={[styles.badgeText, { color: colors.primary }]}>{categoryName}</Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Action buttons */}
        <Animated.View style={[styles.buttons, { opacity: btnsOp }]}>
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={handleViewTasks} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Ver mis tareas</Text>
            <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.secondaryBtn, { borderColor: colors.border }]} onPress={handleCreateAnother} activeOpacity={0.7}>
            <Ionicons name="add" size={17} color={colors.primary} />
            <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>Crear otra tarea</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Dismiss hint */}
        <Text style={[styles.dismissHint, { color: colors.textTertiary }]}>
          Volviendo a tus tareas automáticamente...
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1 },
  progressBar:     { height: 3, position: 'absolute', top: 0, left: 0 },
  inner:           { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, paddingBottom: 24 },
  dotsRow:         { flexDirection: 'row', alignItems: 'flex-end', height: 30, marginBottom: 20 },
  checkOuter:      { width: 100, height: 100, borderRadius: 50, borderWidth: 2.5, justifyContent: 'center', alignItems: 'center' },
  checkInner:      { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center' },
  textBlock:       { width: '100%', alignItems: 'center', marginBottom: 32 },
  headline:        { fontSize: 26, fontWeight: '800', letterSpacing: -0.4, marginBottom: 6 },
  phrase:          { fontSize: 14, textAlign: 'center', marginBottom: 22, lineHeight: 20 },
  card:            { width: '100%', borderRadius: 16, padding: 16, borderWidth: StyleSheet.hairlineWidth },
  cardTitle:       { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  metaRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  badge:           { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  badgeText:       { fontSize: 11, fontWeight: '700' },
  buttons:         { width: '100%', gap: 10 },
  primaryBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: 14 },
  primaryBtnText:  { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondaryBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth },
  secondaryBtnText:{ fontSize: 15, fontWeight: '600' },
  dismissHint:     { fontSize: 11, marginTop: 18 },
});
