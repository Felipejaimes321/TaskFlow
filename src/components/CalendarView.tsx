import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/themeContext';
import { Task } from '@/types';

const { width: W } = Dimensions.get('window');
const DAYS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function getPriorityColor(tasks: Task[], colors: any): string {
  if (tasks.some(t => t.priority === 'high'))   return colors.priorityHigh;
  if (tasks.some(t => t.priority === 'medium')) return colors.priorityMed;
  return colors.priorityLow;
}

interface CalendarViewProps {
  tasks: Task[];
  onSelectTask?: (task: Task) => void;
}

export default function CalendarView({ tasks, onSelectTask }: CalendarViewProps) {
  const { colors } = useTheme();
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  // Build calendar grid
  const { grid, tasksByDate } = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Map tasks to date strings YYYY-MM-DD
    const map: Record<string, Task[]> = {};
    tasks.forEach(t => {
      if (!t.due_date) return;
      const key = t.due_date.slice(0, 10);
      const d = new Date(key + 'T00:00:00');
      if (d.getFullYear() === year && d.getMonth() === month) {
        if (!map[key]) map[key] = [];
        map[key].push(t);
      }
    });

    // Build rows (weeks)
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    const rows: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

    return { grid: rows, tasksByDate: map };
  }, [year, month, tasks]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const getDateKey = (day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const selectedTasks = selectedDay ? (tasksByDate[getDateKey(selectedDay)] || []) : [];
  const isToday = (day: number) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const cellSize = Math.floor((W - 32 - 12) / 7);

  return (
    <View>
      {/* Month navigation */}
      <View style={[styles.monthNav, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.monthLabel, { color: colors.text }]}>
          {MONTHS[month]} {year}
        </Text>
        <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Day headers */}
      <View style={styles.dayHeaders}>
        {DAYS.map((d, i) => (
          <View key={i} style={[styles.dayHeader, { width: cellSize }]}>
            <Text style={[styles.dayHeaderText, { color: colors.textTertiary }]}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Grid */}
      <View style={[styles.grid, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {grid.map((row, ri) => (
          <View key={ri} style={styles.week}>
            {row.map((day, ci) => {
              if (!day) return <View key={ci} style={{ width: cellSize, height: cellSize + 8 }} />;
              const key = getDateKey(day);
              const dayTasks = tasksByDate[key] || [];
              const hasTasks = dayTasks.length > 0;
              const isSel = selectedDay === day;
              const itToday = isToday(day);
              return (
                <TouchableOpacity
                  key={ci}
                  style={[
                    styles.dayCell,
                    { width: cellSize, height: cellSize + 8 },
                    isSel && { backgroundColor: colors.primary, borderRadius: cellSize / 2 },
                    itToday && !isSel && { borderWidth: 1.5, borderColor: colors.primary, borderRadius: cellSize / 2 },
                  ]}
                  onPress={() => setSelectedDay(isSel ? null : day)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.dayNum,
                    { color: isSel ? '#FFFFFF' : itToday ? colors.primary : colors.text },
                  ]}>
                    {day}
                  </Text>
                  {hasTasks && (
                    <View style={styles.dotsRow}>
                      {dayTasks.slice(0, 3).map((_, ti) => (
                        <View
                          key={ti}
                          style={[
                            styles.dot,
                            { backgroundColor: isSel ? 'rgba(255,255,255,0.8)' : getPriorityColor(dayTasks, colors) },
                          ]}
                        />
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* Selected day tasks */}
      {selectedDay !== null && (
        <View style={[styles.selectedSection, { borderColor: colors.border }]}>
          <Text style={[styles.selectedTitle, { color: colors.text }]}>
            {selectedDay} de {MONTHS[month]}
            {selectedTasks.length > 0
              ? ` · ${selectedTasks.length} tarea${selectedTasks.length > 1 ? 's' : ''}`
              : ' · Sin tareas'}
          </Text>

          {selectedTasks.length === 0 ? (
            <View style={styles.noTasksRow}>
              <Ionicons name="calendar-outline" size={24} color={colors.textTertiary} />
              <Text style={[styles.noTasksText, { color: colors.textSecondary }]}>
                No hay tareas para este día
              </Text>
            </View>
          ) : (
            selectedTasks.map(t => {
              const priorityColor =
                t.priority === 'high' ? colors.priorityHigh :
                t.priority === 'medium' ? colors.priorityMed : colors.priorityLow;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.taskChip, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}
                  onPress={() => onSelectTask?.(t)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.taskChipBar, { backgroundColor: priorityColor }]} />
                  <View style={styles.taskChipContent}>
                    <Text style={[styles.taskChipTitle, { color: colors.text }]} numberOfLines={1}>{t.title}</Text>
                    {t.category && (
                      <Text style={[styles.taskChipCategory, { color: colors.textSecondary }]}>{t.category.name}</Text>
                    )}
                  </View>
                  <View style={[styles.statusDot, {
                    backgroundColor: t.status === 'completed' ? colors.success : t.status === 'rejected' ? colors.error : colors.warning,
                  }]} />
                </TouchableOpacity>
              );
            })
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  monthNav:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 4, borderWidth: StyleSheet.hairlineWidth, marginBottom: 8 },
  navBtn:         { padding: 8 },
  monthLabel:     { fontSize: 16, fontWeight: '700' },
  dayHeaders:     { flexDirection: 'row', paddingHorizontal: 0, marginBottom: 4 },
  dayHeader:      { alignItems: 'center' },
  dayHeaderText:  { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  grid:           { borderRadius: 16, padding: 6, borderWidth: StyleSheet.hairlineWidth, marginBottom: 16 },
  week:           { flexDirection: 'row' },
  dayCell:        { alignItems: 'center', justifyContent: 'center', padding: 2 },
  dayNum:         { fontSize: 14, fontWeight: '600' },
  dotsRow:        { flexDirection: 'row', gap: 2, marginTop: 2 },
  dot:            { width: 4, height: 4, borderRadius: 2 },
  selectedSection:{ borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 16, gap: 8 },
  selectedTitle:  { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  noTasksRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  noTasksText:    { fontSize: 14 },
  taskChip:       { flexDirection: 'row', alignItems: 'center', borderRadius: 12, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth },
  taskChipBar:    { width: 4, alignSelf: 'stretch' },
  taskChipContent:{ flex: 1, paddingVertical: 10, paddingHorizontal: 12 },
  taskChipTitle:  { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  taskChipCategory:{ fontSize: 12 },
  statusDot:      { width: 8, height: 8, borderRadius: 4, marginRight: 14 },
});
