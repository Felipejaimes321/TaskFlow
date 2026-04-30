import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/themeContext';
import { Recurrence } from '@/types';

interface RecurrenceIndicatorProps {
  recurrence: Recurrence;
  style?: any;
}

export default function RecurrenceIndicator({ recurrence, style }: RecurrenceIndicatorProps) {
  const { colors } = useTheme();

  if (!recurrence) return null;

  const config = {
    daily:   { label: 'Diaria',  icon: 'sunny',    color: '#F59E0B', bg: '#F59E0B15' }, // Vibrante Naranja
    weekly:  { label: 'Semanal', icon: 'calendar', color: '#3B82F6', bg: '#3B82F615' }, // Vibrante Azul
    monthly: { label: 'Mensual', icon: 'calendar-number', color: '#8B5CF6', bg: '#8B5CF615' }, // Vibrante Morado
  };

  const current = config[recurrence as keyof typeof config];

  if (!current) return null;

  return (
    <View style={[styles.badge, { backgroundColor: current.bg, borderColor: current.color + '40' }, style]}>
      <Ionicons name={current.icon as any} size={12} color={current.color} style={styles.icon} />
      <Text style={[styles.text, { color: current.color }]}>{current.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
