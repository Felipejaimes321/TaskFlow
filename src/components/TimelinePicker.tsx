import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, LayoutAnimation } from 'react-native';
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

  const handlePress = (dateStr: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    onSelectDate(dateStr);
  };

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
          isSelected && { backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
          isToday && !isSelected && { backgroundColor: colors.primary + '15' }
        ]}
        onPress={() => handlePress(dateStr)}
        activeOpacity={0.6}
      >
        <Text style={[styles.dayName, { color: isSelected ? '#FFFFFF' : colors.textTertiary }]}>
          {dayName}
        </Text>
        <Text style={[styles.dayNum, { color: isSelected ? '#FFFFFF' : colors.text }]}>
          {dayNum}
        </Text>
        {/* Dot indicator */}
        <View style={[
          styles.dot, 
          { backgroundColor: hasTasks ? (isSelected ? '#FFFFFF' : colors.primary) : 'transparent' }
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
        getItemLayout={(data, index) => ({ length: 80, offset: 80 * index, index })}
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
    width: 70,
    height: 94,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 35,
    marginHorizontal: 5,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  dayNum: {
    fontSize: 26,
    fontWeight: '900',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  }
});
