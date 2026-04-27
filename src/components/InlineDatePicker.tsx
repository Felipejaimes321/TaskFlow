import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/themeContext';
import { pad, toISODate } from '@/utils/dateUtils';

const W = Dimensions.get('window').width;

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAYS   = ['D','L','M','M','J','V','S'];

interface InlineDatePickerProps {
  /** Currently selected ISO date (YYYY-MM-DD) or null */
  value: string | null;
  onSelect: (iso: string) => void;
  onClear: () => void;
}

export default function InlineDatePicker({ value, onSelect, onClear }: InlineDatePickerProps) {
  const { colors } = useTheme();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  // Build calendar grid
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  const selectedDay = (() => {
    if (!value) return null;
    const [y, m, d] = value.split('-').map(Number);
    if (y === year && m - 1 === month) return d;
    return null;
  })();

  const isToday = (d: number) => {
    return d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const isPast = (d: number) => {
    const date = new Date(year, month, d);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleSelect = (d: number) => {
    const date = new Date(year, month, d);
    onSelect(toISODate(date));
  };

  const cellSize = Math.floor((W - 40 - 28) / 7); // 40 padding + 28 internal padding

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Month navigation */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={prevMonth} style={styles.navBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={18} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.monthLabel, { color: colors.text }]}>
          {MONTHS[month]} {year}
        </Text>
        <TouchableOpacity onPress={nextMonth} style={styles.navBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Day headers */}
      <View style={styles.dayHeaders}>
        {DAYS.map((d, i) => (
          <View key={i} style={[styles.dayHeaderCell, { width: cellSize }]}>
            <Text style={[styles.dayHeaderText, { color: colors.textTertiary }]}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Grid */}
      {rows.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((day, ci) => {
            if (!day) return <View key={ci} style={{ width: cellSize, height: cellSize }} />;
            const isSel  = selectedDay === day;
            const today_ = isToday(day);
            const past   = isPast(day);
            return (
              <TouchableOpacity
                key={ci}
                style={[
                  styles.dayCell,
                  { width: cellSize, height: cellSize },
                  isSel  && { backgroundColor: colors.primary, borderRadius: cellSize / 2 },
                  today_ && !isSel && { borderWidth: 1.5, borderColor: colors.primary, borderRadius: cellSize / 2 },
                ]}
                onPress={() => !past && handleSelect(day)}
                disabled={past}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.dayNum,
                  { color: isSel ? '#FFFFFF' : today_ ? colors.primary : past ? colors.textTertiary : colors.text },
                ]}>
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {/* Clear button */}
      {value && (
        <TouchableOpacity style={styles.clearRow} onPress={onClear}>
          <Ionicons name="close-circle-outline" size={15} color={colors.error} />
          <Text style={[styles.clearText, { color: colors.error }]}>Quitar fecha</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 14, marginTop: 10 },
  monthNav:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  navBtn:        { padding: 2 },
  monthLabel:    { fontSize: 14, fontWeight: '700' },
  dayHeaders:    { flexDirection: 'row', marginBottom: 4 },
  dayHeaderCell: { alignItems: 'center' },
  dayHeaderText: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  row:           { flexDirection: 'row' },
  dayCell:       { alignItems: 'center', justifyContent: 'center' },
  dayNum:        { fontSize: 14, fontWeight: '500' },
  clearRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 12, paddingTop: 10 },
  clearText:     { fontSize: 13, fontWeight: '600' },
});
