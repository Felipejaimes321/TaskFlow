import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '@/context/themeContext';
import { Task } from '@/types';

const { width } = Dimensions.get('window');

interface TimelinePickerProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  tasks: Task[];
}

const DAYS_ES = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// Generamos 15 días en el pasado y 30 en el futuro
const generateDates = () => {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = -15; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
};

export default function TimelinePicker({ selectedDate, onSelectDate, tasks }: TimelinePickerProps) {
  const { colors } = useTheme();
  const listRef = useRef<FlatList>(null);
  
  const dates = useMemo(() => generateDates(), []);
  
  // Mapa para busquedas rápidas de O(1)
  const taskMap = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach(t => {
      if (t.due_date) {
        const d = t.due_date.slice(0, 10);
        if (!map[d]) map[d] = [];
        map[d].push(t);
      }
    });
    return map;
  }, [tasks]);

  // Hacer scroll inicial al día seleccionado (o a "hoy")
  useEffect(() => {
    const idx = dates.findIndex(d => d.toISOString().slice(0, 10) === selectedDate);
    if (idx !== -1 && listRef.current) {
      setTimeout(() => {
        listRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.5 });
      }, 300);
    }
  }, []);

  const renderItem = ({ item }: { item: Date }) => {
    const dateStr = item.toISOString().slice(0, 10);
    const isSelected = dateStr === selectedDate;
    const dayName = DAYS_ES[item.getDay()];
    const dayNum = item.getDate();
    const hasTasks = !!taskMap[dateStr] && taskMap[dateStr].length > 0;
    const isToday = new Date().toISOString().slice(0, 10) === dateStr;

    return (
      <TouchableOpacity 
        style={[
          styles.dayItem, 
          isSelected && { backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
          isToday && !isSelected && { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.primary + '10' }
        ]}
        onPress={() => onSelectDate(dateStr)}
        activeOpacity={0.7}
      >
        <Text style={[styles.dayName, { color: isSelected ? '#fff' : colors.textTertiary }]}>
          {dayName}
        </Text>
        <Text style={[styles.dayNum, { color: isSelected ? '#fff' : colors.text }]}>
          {dayNum}
        </Text>
        {/* Dot indicator */}
        <View style={[
          styles.dot, 
          { backgroundColor: hasTasks ? (isSelected ? '#fff' : colors.primary) : 'transparent' }
        ]} />
      </TouchableOpacity>
    );
  };

  const selDateObj = new Date(selectedDate + 'T00:00:00');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.monthYear, { color: colors.text }]}>
          {MONTHS_ES[selDateObj.getMonth()]} {selDateObj.getFullYear()}
        </Text>
        <TouchableOpacity onPress={() => onSelectDate(new Date().toISOString().slice(0,10))}>
          <Text style={[styles.todayBtn, { color: colors.primary }]}>Hoy</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={dates}
        keyExtractor={d => d.toISOString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        getItemLayout={(data, index) => ({ length: 70, offset: 70 * index, index })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  todayBtn: {
    fontSize: 14,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 12,
  },
  dayItem: {
    width: 62,
    height: 82,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 31,
    marginHorizontal: 4,
  },
  dayName: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  dayNum: {
    fontSize: 22,
    fontWeight: '800',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  }
});
