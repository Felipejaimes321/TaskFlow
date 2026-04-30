import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, StatusBar, Animated, ScrollView, Platform, LayoutAnimation
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/context/authStore';
import { useTaskStore } from '@/context/taskStore';
import { useTheme } from '@/context/themeContext';
import { Task, Category } from '@/types';
import TimelinePicker from '@/components/TimelinePicker';
import TaskSkeleton from '@/components/TaskSkeleton';
import CategoryFilter from '@/components/CategoryFilter';
import RecurrenceIndicator from '@/components/RecurrenceIndicator';
import { formatDate } from '@/utils/dateUtils';
import { hapticImpact, hapticNotification } from '@/utils/haptics';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function getPriority(colors: any, level: string) {
  if (level === 'high')   return { label: 'Alta',  color: colors.priorityHigh,  bg: colors.priorityHighBg,  border: colors.priorityHighBorder };
  if (level === 'medium') return { label: 'Media', color: colors.priorityMed,   bg: colors.priorityMedBg,   border: colors.priorityMedBorder  };
  return                         { label: 'Baja',  color: colors.priorityLow,   bg: colors.priorityLowBg,   border: colors.priorityLowBorder  };
}

function TaskCard({ item, onPress, onComplete, onDelete }: {
  item: Task; onPress: () => void; onComplete: () => void; onDelete: () => void;
}) {
  const { colors } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const priority  = getPriority(colors, item.priority);
  const totalSub  = (item.subtasks || []).length;
  const doneSub   = (item.subtasks || []).filter(s => s.completed).length;
  const isDone    = item.status === 'completed';
  const percent   = totalSub > 0 ? Math.round((doneSub / totalSub) * 100) : 0;

  const onPressIn  = () => Animated.spring(scaleAnim, { toValue: 0.975, useNativeDriver: true, tension: 300 }).start();
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1,     useNativeDriver: true, tension: 300 }).start();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.taskCard, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }, isDone && styles.taskCardDone]}
        activeOpacity={1} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}
      >
        <View style={[styles.accentBar, { backgroundColor: isDone ? colors.textTertiary : priority.color }]} />
        <View style={styles.taskContent}>
          <View style={styles.taskTopRow}>
            <View style={styles.titleWrapper}>
              <Text style={[styles.taskTitle, { color: isDone ? colors.textTertiary : colors.text }, isDone && styles.taskTitleDone]} numberOfLines={2}>
                {item.title}
              </Text>
              {!isDone && (
                <View style={[styles.priorityBadge, { backgroundColor: priority.bg, borderColor: priority.border }]}>
                  <Text style={[styles.priorityText, { color: priority.color }]}>{priority.label}</Text>
                </View>
              )}
            </View>
            {item.recurrence && (
              <RecurrenceIndicator recurrence={item.recurrence} />
            )}
          </View>
          {item.description ? (
            <Text style={[styles.taskDesc, { color: colors.textSecondary }]} numberOfLines={2}>{item.description}</Text>
          ) : null}
          <View style={styles.taskMeta}>
            {item.category && (
              <View style={[styles.categoryBadge, { backgroundColor: item.category.color }]}>
                <Text style={styles.categoryBadgeText}>{item.category.name}</Text>
              </View>
            )}
            {item.due_date && (
              <View style={[styles.chip, { backgroundColor: colors.primaryLight, borderColor: colors.primaryBorder }]}>
                <Ionicons name="calendar-outline" size={11} color={colors.primary} />
                <Text style={[styles.chipText, { color: colors.primary }]}>{formatDate(item.due_date)}</Text>
              </View>
            )}
          </View>
          {totalSub > 0 && (
            <View style={styles.subtaskContainer}>
              <View style={styles.subtaskHeader}>
                <Text style={[styles.subtaskText, { color: colors.textSecondary }]}>Subtareas</Text>
                <Text style={[styles.subtaskText, { color: colors.text, fontWeight: '700' }]}>{doneSub}/{totalSub} ({percent}%)</Text>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: colors.surfaceAlt }]}>
                <View style={[styles.progressFill, { width: `${percent}%` as any, backgroundColor: isDone ? colors.textTertiary : colors.primary }]} />
              </View>
            </View>
          )}
        </View>
        <View style={styles.taskActions}>
          {!isDone && (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.successBg, borderColor: colors.successBorder }]} onPress={onComplete}>
              <Ionicons name="checkmark" size={16} color={colors.success} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.errorBg, borderColor: colors.errorBorder }]} onPress={onDelete}>
            <Ionicons name="trash-outline" size={15} color={colors.error} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

type FilterType = 'all' | 'pending' | 'completed';
type ViewMode  = 'list' | 'calendar';

export default function TasksScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { tasks, loading, fetchTasks, deleteTask, completeTask, categories } = useTaskStore();
  const { colors, isDark } = useTheme();
  const [filter,   setFilter]   = useState<FilterType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const handleSetFilter = (newFilter: FilterType) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilter(newFilter);
  };

  const handleSetViewMode = (mode: ViewMode) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setViewMode(mode);
  };

  const handleSetSelectedCategory = (cat: string | null) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedCategory(cat);
  };

  const handleSetSelectedDate = (date: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedDate(date);
  };

  useEffect(() => {
    if (user?.id) {
      fetchTasks(user.id);
      const iv = setInterval(() => fetchTasks(user.id), 10000);
      return () => clearInterval(iv);
    }
  }, [user?.id]);

  const handleComplete = (taskId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    hapticImpact('medium');
    completeTask(taskId);
  };

  const handleDelete = (taskId: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm('¿Seguro? Esta acción no se puede deshacer.')) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        hapticNotification('warning');
        deleteTask(taskId);
      }
    } else {
      hapticNotification('warning');
      Alert.alert('Eliminar tarea', '¿Seguro? Esta acción no se puede deshacer.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            deleteTask(taskId);
        }},
      ]);
    }
  };

  const pending   = tasks.filter(t => t.status === 'pending');
  const completed = tasks.filter(t => t.status === 'completed');

  // Apply status filter
  let displayed = filter === 'pending' ? pending : filter === 'completed' ? completed : tasks;

  // Apply category filter if selected
  if (selectedCategory) {
    displayed = displayed.filter(t => t.category_id === selectedCategory);
  }

  const highCount = pending.filter(t => t.priority === 'high').length;

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all',       label: `Todas (${tasks.length})`        },
    { key: 'pending',   label: `Pendientes (${pending.length})` },
    { key: 'completed', label: `Listas (${completed.length})`   },
  ];

  if (loading && tasks.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={[styles.header, { borderBottomColor: colors.borderSubtle, opacity: 0.5 }]}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>Cargando...</Text>
            <Text style={[styles.title, { color: colors.text }]}>Mis Tareas</Text>
          </View>
        </View>
        <View style={styles.listContent}>
          <TaskSkeleton />
          <TaskSkeleton />
          <TaskSkeleton />
          <TaskSkeleton />
          <TaskSkeleton />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            Hola, {user?.full_name?.split(' ')[0] || 'usuario'}
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>Mis Tareas</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.statsRow}>
            <View style={[styles.statChip, { backgroundColor: colors.primaryLight, borderColor: colors.primaryBorder }]}>
              <Text style={[styles.statNum, { color: colors.primary }]}>{pending.length}</Text>
              <Text style={[styles.statLabel, { color: colors.primary }]}>pendientes</Text>
            </View>
            {highCount > 0 && (
              <View style={[styles.statChip, { backgroundColor: colors.errorBg, borderColor: colors.errorBorder }]}>
                <Text style={[styles.statNum, { color: colors.error }]}>{highCount}</Text>
                <Text style={[styles.statLabel, { color: colors.error }]}>urgentes</Text>
              </View>
            )}
          </View>
          {/* View toggle */}
          <View style={[styles.viewToggle, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'list' && { backgroundColor: colors.surface }]}
              onPress={() => handleSetViewMode('list')}
            >
              <Ionicons name="list" size={16} color={viewMode === 'list' ? colors.primary : colors.icon} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'calendar' && { backgroundColor: colors.surface }]}
              onPress={() => handleSetViewMode('calendar')}
            >
              <Ionicons name="calendar" size={16} color={viewMode === 'calendar' ? colors.primary : colors.icon} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {viewMode === 'calendar' ? (
        // ── Calendar View ──
        <View style={{ flex: 1, paddingTop: 14 }}>
          <TimelinePicker 
            selectedDate={selectedDate} 
            onSelectDate={handleSetSelectedDate} 
            tasks={tasks} 
          />
          <FlatList
            data={tasks.filter(t => t.due_date?.slice(0,10) === selectedDate)}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TaskCard
                item={item}
                onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
                onComplete={() => handleComplete(item.id)}
                onDelete={() => handleDelete(item.id)}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="calendar-clear-outline" size={56} color={colors.textTertiary} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Día libre</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>No hay tareas para esta fecha</Text>
              </View>
            }
          />
        </View>
      ) : (
        // ── List View ──
        <>
          {/* Status Filters */}
          <View style={styles.filterRow}>
            {filters.map(f => (
              <TouchableOpacity
                key={f.key}
                style={[
                  styles.filterTab,
                  {
                    backgroundColor: filter === f.key ? colors.primary : colors.surfaceAlt,
                    borderColor: filter === f.key ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleSetFilter(f.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: filter === f.key ? '#FFFFFF' : colors.textSecondary,
                    },
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Category Filter Dropdown */}
          {categories && categories.length > 0 && (
            <CategoryFilter
              categories={categories}
              selectedCategoryId={selectedCategory}
              onSelectCategory={handleSetSelectedCategory}
            />
          )}

          {displayed.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name={filter === 'completed' ? 'trophy-outline' : 'list-outline'} size={56} color={colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {filter === 'completed' ? 'Sin completadas aún' : 'Sin tareas aún'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Toca el botón + para agregar una
              </Text>
            </View>
          ) : (
            <FlatList
              data={displayed}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TaskCard
                  item={item}
                  onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
                  onComplete={() => handleComplete(item.id)}
                  onDelete={() => handleDelete(item.id)}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}

      {/* FAB */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => { hapticImpact('light'); navigation.navigate('CreateTask'); }} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1 },
  loading:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:        { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  greeting:      { fontSize: 13, marginBottom: 3 },
  title:         { fontSize: 27, fontWeight: '800', letterSpacing: -0.5, marginBottom: 8 },
  headerRight:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statsRow:      { flexDirection: 'row', gap: 8, alignItems: 'center' },
  statChip:      { borderRadius: 10, paddingHorizontal: 9, paddingVertical: 5, alignItems: 'center', borderWidth: 1 },
  statNum:       { fontSize: 17, fontWeight: '800' },
  statLabel:     { fontSize: 9, fontWeight: '600', textTransform: 'uppercase' },
  viewToggle:    { flexDirection: 'row', borderRadius: 10, padding: 3, borderWidth: StyleSheet.hairlineWidth, gap: 2 },
  toggleBtn:     { padding: 6, borderRadius: 8 },
  filterRow:     { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, gap: 10, justifyContent: 'space-between' },
  filterTab:     { flex: 1, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  filterText:    { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  listContent:   { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 100 },
  calendarContent:{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 100 },
  taskCard:      { flexDirection: 'row', borderRadius: 20, marginBottom: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  taskCardDone:  { opacity: 0.5 },
  accentBar:     { width: 4 },
  taskContent:   { flex: 1, padding: 18 },
  taskTopRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  titleWrapper:  { flex: 1, flexDirection: 'row', alignItems: 'flex-start', flexWrap: 'wrap', gap: 6, marginRight: 12 },
  taskTitle:     { fontSize: 16, fontWeight: '700', lineHeight: 22 },
  taskTitleDone: { textDecorationLine: 'line-through' },
  priorityBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, borderWidth: 1, marginTop: 2 },
  priorityText:  { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  taskDesc:      { fontSize: 14, marginBottom: 12, lineHeight: 20 },
  taskMeta:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  subtaskContainer:{ marginTop: 14, gap: 8 },
  subtaskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressTrack: { width: '100%', height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill:  { height: '100%', borderRadius: 3 },
  subtaskText:   { fontSize: 12, fontWeight: '600' },
  chip:          { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  chipText:      { fontSize: 11, fontWeight: '700' },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  categoryBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 0.5 },
  taskActions:   { justifyContent: 'center', gap: 7, paddingRight: 11, paddingVertical: 11 },
  actionBtn:     { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  empty:         { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingBottom: 80 },
  emptyTitle:    { fontSize: 18, fontWeight: '700', marginTop: 14, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, marginTop: 6, textAlign: 'center', lineHeight: 20 },
  fab:           { position: 'absolute', bottom: 28, right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 8 },
});
