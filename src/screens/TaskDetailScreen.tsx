import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, StatusBar, Animated, Platform, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/themeContext';
import { useTaskStore } from '@/context/taskStore';
import { useAuthStore } from '@/context/authStore';
import { Task, Subtask, Recurrence } from '@/types';
import ProgressRing from '@/components/ProgressRing';
import CelebrationModal from '@/components/CelebrationModal';
import InlineDatePicker from '@/components/InlineDatePicker';
import { useToast } from '@/components/Toast';
import { formatDate, offsetDate } from '@/utils/dateUtils';
import { generateSubtasks } from '@/services/aiService';
import { hapticImpact, hapticNotification } from '@/utils/haptics';

const PRIORITY_LABELS: Record<string, string> = { high: 'Alta', medium: 'Media', low: 'Baja' };

const RECURRENCE_OPTIONS: { key: Recurrence; label: string }[] = [
  { key: null,      label: 'No repetir' },
  { key: 'daily',   label: 'Cada día' },
  { key: 'weekly',  label: 'Cada semana' },
  { key: 'monthly', label: 'Cada mes' },
];

function SubtaskRow({
  subtask, onToggle, onDelete,
}: { subtask: Subtask; onToggle: () => void; onDelete: () => void; }) {
  const { colors } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handleToggle = () => {
    hapticImpact('light');
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.92, tension: 300, friction: 5, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1,    tension: 300, friction: 5, useNativeDriver: true }),
    ]).start();
    onToggle();
  };

  return (
    <Animated.View style={[styles.subtaskRow, { borderBottomColor: colors.borderSubtle, transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[
          styles.subtaskCheck,
          { borderColor: subtask.completed ? colors.success : colors.border },
          subtask.completed && { backgroundColor: colors.successBg },
        ]}
        onPress={handleToggle}
      >
        {subtask.completed && <Ionicons name="checkmark" size={13} color={colors.success} />}
      </TouchableOpacity>
      <Text style={[styles.subtaskTitle, { color: subtask.completed ? colors.textTertiary : colors.text }, subtask.completed && styles.subtaskDone]}>
        {subtask.title}
      </Text>
      <TouchableOpacity onPress={onDelete} style={styles.subtaskDeleteBtn}>
        <Ionicons name="close" size={15} color={colors.textTertiary} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function TaskDetailScreen({ route, navigation }: any) {
  const { taskId } = route.params as { taskId: string };
  const { colors, isDark } = useTheme();
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const { tasks, categories, createSubtask, updateSubtask, deleteSubtask, completeTask, updateTask } = useTaskStore();

  const task: Task | undefined = tasks.find(t => t.id === taskId);

  // ── Edit mode state ────────────────────────────────────────────────────────
  const [isEditing, setIsEditing]         = useState(false);
  const [editTitle, setEditTitle]         = useState('');
  const [editDesc, setEditDesc]           = useState('');
  const [editPriority, setEditPriority]   = useState<'low'|'medium'|'high'>('low');
  const [editCategoryId, setEditCatId]    = useState<string|null>(null);
  const [editRecurrence, setEditRec]      = useState<Recurrence>(null);
  const [editDueDate, setEditDueDate]     = useState<string|null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving]           = useState(false);

  // ── Subtask state ──────────────────────────────────────────────────────────
  const [newSubtask, setNewSubtask]       = useState('');
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [wasComplete, setWasComplete]     = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const subtasks = task?.subtasks || [];
  const total    = subtasks.length;
  const done     = subtasks.filter(s => s.completed).length;
  const progress = total > 0 ? done / total : 0;

  useEffect(() => {
    if (!task) return;
    const isNowComplete = total > 0 && done === total;
    if (isNowComplete && !wasComplete && task.status !== 'completed') {
      hapticNotification('success');
      setShowCelebration(true);
      completeTask(task.id);
    }
    setWasComplete(isNowComplete);
  }, [done, total]);

  const startEditing = () => {
    if (!task) return;
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditPriority(task.priority as any || 'low');
    setEditCatId(task.category_id || null);
    setEditRec((task.recurrence as Recurrence) || null);
    setEditDueDate(task.due_date || null);
    setShowDatePicker(false);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!task || !editTitle.trim()) return;
    setIsSaving(true);
    try {
      await updateTask(task.id, {
        title:       editTitle.trim(),
        description: editDesc.trim() || null,
        priority:    editPriority,
        category_id: editCategoryId,
        recurrence:  editRecurrence,
        due_date:    editDueDate,
      } as any);
      setIsEditing(false);
      showToast({ message: 'Tarea actualizada', type: 'success' });
    } catch (e: any) {
      showToast({ message: 'Error al guardar: ' + e.message, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSubtask = async () => {
    const title = newSubtask.trim();
    if (!title) return;
    try {
      setAddingSubtask(true);
      await createSubtask(taskId, title);
      hapticImpact('light');
      setNewSubtask('');
    } catch (e: any) {
      showToast({ message: e.message || 'Error', type: 'error' });
    } finally {
      setAddingSubtask(false);
    }
  };

  const handleToggle = async (subtask: Subtask) => {
    try { await updateSubtask(subtask.id, !subtask.completed); }
    catch (e: any) {
      showToast({ message: e.message || 'Error', type: 'error' });
    }
  };

  const handleAIBreakdown = async () => {
    if (!task) return;
    try {
      setIsGeneratingAI(true);
      const generated = await generateSubtasks(task.title);
      for (const st of generated) {
        await createSubtask(task.id, st);
        await new Promise(r => setTimeout(r, 200));
      }
      showToast({ message: 'Subtareas generadas', type: 'success' });
    } catch (e: any) {
      showToast({ message: 'Error IA: ' + e.message, type: 'error' });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm('¿Seguro que quieres eliminar esta subtarea?')) { 
        hapticNotification('warning');
        deleteSubtask(subtaskId); 
      }
    } else {
      hapticNotification('warning');
      Alert.alert('Eliminar subtarea', '¿Seguro?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => deleteSubtask(subtaskId) },
      ]);
    }
  };

  const getPriorityColor = (p?: string) => {
    const priority = p || task?.priority;
    if (priority === 'high')   return colors.priorityHigh;
    if (priority === 'medium') return colors.priorityMed;
    return colors.priorityLow;
  };

  if (!task) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.textTertiary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Tarea no encontrada</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.primary, marginTop: 12, fontWeight: '600' }}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
        <TouchableOpacity 
          style={[styles.headerBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} 
          onPress={() => { 
            if (isEditing) setIsEditing(false);
            else navigation.goBack(); 
          }}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{task?.title || 'Detalle'}</Text>
        {isEditing ? (
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
            onPress={handleSaveEdit} disabled={isSaving}
          >
            {isSaving ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="checkmark" size={20} color="#fff" />}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={startEditing}
          >
            <Ionicons name="pencil" size={18} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Progress section */}
        {total > 0 && (
          <View style={[styles.progressSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ProgressRing progress={progress} size={88} strokeWidth={7} showPercent />
            <View style={styles.progressInfo}>
              <Text style={[styles.progressTitle, { color: colors.text }]}>
                {done === total && total > 0 ? '¡Completada! 🎉' : `${done} de ${total} subtareas`}
              </Text>
              <Text style={[styles.progressSubtitle, { color: colors.textSecondary }]}>
                {done === total && total > 0 ? 'Has terminado todas las subtareas' : `Faltan ${total - done} por completar`}
              </Text>
              <View style={[styles.linearTrack, { backgroundColor: colors.surfaceAlt }]}>
                <Animated.View style={[styles.linearFill, { width: `${progress * 100}%`, backgroundColor: done === total && total > 0 ? colors.success : colors.primary }]} />
              </View>
            </View>
          </View>
        )}

        {/* ── Task info / Edit form ─────────────────────────────────── */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: isEditing ? colors.primary : colors.border }]}>

          {isEditing ? (
            <>
              {/* Edit title */}
              <Text style={[styles.editLabel, { color: colors.textTertiary }]}>Título</Text>
              <TextInput
                style={[styles.editTitleInput, { color: colors.text, borderColor: colors.border }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Título de la tarea"
                placeholderTextColor={colors.placeholder}
                multiline
              />

              {/* Edit description */}
              <Text style={[styles.editLabel, { color: colors.textTertiary }]}>Notas</Text>
              <TextInput
                style={[styles.editDescInput, { color: colors.text, borderColor: colors.border }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                value={editDesc}
                onChangeText={setEditDesc}
                placeholder="Agregar notas..."
                placeholderTextColor={colors.placeholder}
                multiline
                textAlignVertical="top"
              />

              {/* Edit priority */}
              <Text style={[styles.editLabel, { color: colors.textTertiary }]}>Prioridad</Text>
              <View style={styles.editRow}>
                {(['low','medium','high'] as const).map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.editChip, { borderColor: editPriority === p ? getPriorityColor(p) : colors.border, backgroundColor: editPriority === p ? getPriorityColor(p) + '20' : colors.surfaceAlt }]}
                    onPress={() => setEditPriority(p)}
                  >
                    <View style={[styles.colorDot, { backgroundColor: getPriorityColor(p) }]} />
                    <Text style={[styles.editChipText, { color: editPriority === p ? getPriorityColor(p) : colors.textSecondary }]}>
                      {p === 'low' ? 'Baja' : p === 'medium' ? 'Media' : 'Alta'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Edit due date */}
              <Text style={[styles.editLabel, { color: colors.textTertiary }]}>Fecha límite</Text>
              <TouchableOpacity
                style={[styles.editDateBtn, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
                onPress={() => setShowDatePicker(v => !v)}
              >
                <Ionicons name="calendar-outline" size={16} color={editDueDate ? colors.primary : colors.textTertiary} />
                <Text style={{ color: editDueDate ? colors.primary : colors.textTertiary, fontSize: 14, fontWeight: '600' }}>
                  {editDueDate ? formatDate(editDueDate) : 'Sin fecha'}
                </Text>
                {editDueDate && (
                  <TouchableOpacity onPress={() => { setEditDueDate(null); setShowDatePicker(false); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
              {showDatePicker && (
                <InlineDatePicker
                  value={editDueDate}
                  onSelect={(iso) => { setEditDueDate(iso); setShowDatePicker(false); }}
                  onClear={() => { setEditDueDate(null); setShowDatePicker(false); }}
                />
              )}

              {/* Edit category */}
              <Text style={[styles.editLabel, { color: colors.textTertiary }]}>Categoría</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
                <TouchableOpacity
                  style={[styles.editChip, { borderColor: !editCategoryId ? colors.primary : colors.border, backgroundColor: !editCategoryId ? colors.primaryLight : colors.surfaceAlt }]}
                  onPress={() => setEditCatId(null)}
                >
                  <Text style={[styles.editChipText, { color: !editCategoryId ? colors.primary : colors.textSecondary }]}>Ninguna</Text>
                </TouchableOpacity>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.editChip, { borderColor: editCategoryId === cat.id ? cat.color : colors.border, backgroundColor: editCategoryId === cat.id ? cat.color + '20' : colors.surfaceAlt }]}
                    onPress={() => setEditCatId(cat.id)}
                  >
                    <View style={[styles.colorDot, { backgroundColor: cat.color }]} />
                    <Text style={[styles.editChipText, { color: editCategoryId === cat.id ? cat.color : colors.textSecondary }]}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Edit recurrence */}
              <Text style={[styles.editLabel, { color: colors.textTertiary }]}>Repetición</Text>
              <View style={[styles.editRow, { flexWrap: 'wrap' }]}>
                {RECURRENCE_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={String(opt.key)}
                    style={[styles.editChip, { borderColor: editRecurrence === opt.key ? colors.primary : colors.border, backgroundColor: editRecurrence === opt.key ? colors.primaryLight : colors.surfaceAlt }]}
                    onPress={() => setEditRec(opt.key)}
                  >
                    <Text style={[styles.editChipText, { color: editRecurrence === opt.key ? colors.primary : colors.textSecondary }]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Cancel button */}
              <TouchableOpacity onPress={() => setIsEditing(false)} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                <Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[styles.taskTitle, { color: colors.text }]}>{task.title}</Text>
              {task.description ? (
                <Text style={[styles.taskDesc, { color: colors.textSecondary }]}>{task.description}</Text>
              ) : null}
              <View style={styles.metaRow}>
                <View style={[styles.metaBadge, { backgroundColor: getPriorityColor() + '18', borderColor: getPriorityColor() + '44' }]}>
                  <Ionicons name="flag" size={12} color={getPriorityColor()} />
                  <Text style={[styles.metaBadgeText, { color: getPriorityColor() }]}>
                    Prioridad {PRIORITY_LABELS[task.priority] || 'Baja'}
                  </Text>
                </View>
                {task.due_date && (
                  <View style={[styles.metaBadge, { backgroundColor: colors.primaryLight, borderColor: colors.primaryBorder }]}>
                    <Ionicons name="calendar-outline" size={12} color={colors.primary} />
                    <Text style={[styles.metaBadgeText, { color: colors.primary }]}>{formatDate(task.due_date)}</Text>
                  </View>
                )}
                {task.category && (
                  <View style={[styles.metaBadge, { backgroundColor: task.category.color + '18', borderColor: task.category.color + '44' }]}>
                    <View style={[styles.colorDot, { backgroundColor: task.category?.color || colors.primary }]} />
                    <Text style={[styles.metaBadgeText, { color: task.category?.color || colors.primary }]}>{task.category?.name || 'Categoría'}</Text>
                  </View>
                )}
              </View>
            </>
          )}
        </View>

        {/* Subtasks */}
        <View style={[styles.subtasksCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.subtasksHeader}>
            <Text style={[styles.subtasksTitle, { color: colors.text }]}>Subtareas</Text>
            <Text style={[styles.subtasksCount, { color: colors.textSecondary }]}>{done}/{total}</Text>
          </View>

          {subtasks.length === 0 ? (
            <View style={styles.emptySubtasks}>
              <Ionicons name="sparkles-outline" size={28} color={colors.primary} />
              <Text style={[styles.emptySubtasksText, { color: colors.textSecondary }]}>
                La Inteligencia Artificial puede dividir esta tarea en pasos accionables por ti.
              </Text>
              <TouchableOpacity
                style={[styles.aiButton, { backgroundColor: colors.primaryLight, borderColor: colors.primaryBorder }]}
                onPress={handleAIBreakdown} disabled={isGeneratingAI} activeOpacity={0.8}
              >
                {isGeneratingAI ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={16} color={colors.primary} />
                    <Text style={[styles.aiButtonText, { color: colors.primary }]}>Desglosar con IA</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            subtasks.map(s => (
              <SubtaskRow
                key={s.id} subtask={s}
                onToggle={() => handleToggle(s)}
                onDelete={() => handleDeleteSubtask(s.id)}
              />
            ))
          )}

          {task.status !== 'completed' && (
            <View style={[styles.addRow, { borderTopColor: colors.borderSubtle }]}>
              <TextInput
                style={[styles.addInput, { color: colors.text }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                placeholder="Agregar subtarea..."
                placeholderTextColor={colors.placeholder}
                value={newSubtask}
                onChangeText={setNewSubtask}
                onSubmitEditing={handleAddSubtask}
                returnKeyType="done"
                editable={!addingSubtask}
              />
              <TouchableOpacity
                style={[styles.addBtn, { backgroundColor: newSubtask.trim() ? colors.primary : colors.surfaceAlt }]}
                onPress={handleAddSubtask} disabled={!newSubtask.trim() || addingSubtask}
              >
                <Ionicons name="add" size={20} color={newSubtask.trim() ? '#FFFFFF' : colors.textTertiary} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      <CelebrationModal
        visible={showCelebration}
        taskTitle={task.title}
        subtaskCount={total}
        onClose={() => { setShowCelebration(false); navigation.goBack(); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1 },
  header:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  headerBtn:         { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', borderWidth: StyleSheet.hairlineWidth },
  headerTitle:       { flex: 1, fontSize: 16, fontWeight: '700', textAlign: 'center', marginHorizontal: 8 },
  scroll:            { padding: 16, gap: 12, paddingBottom: 60 },
  progressSection:   { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 18, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth },
  progressInfo:      { flex: 1 },
  progressTitle:     { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  progressSubtitle:  { fontSize: 13, marginBottom: 10 },
  linearTrack:       { height: 6, borderRadius: 3, overflow: 'hidden' },
  linearFill:        { height: '100%', borderRadius: 3 },
  infoCard:          { padding: 18, borderRadius: 16, borderWidth: 1.5 },
  taskTitle:         { fontSize: 19, fontWeight: '800', marginBottom: 6, letterSpacing: -0.3 },
  taskDesc:          { fontSize: 14, lineHeight: 20, marginBottom: 14 },
  metaRow:           { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaBadge:         { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  metaBadgeText:     { fontSize: 11, fontWeight: '700' },
  colorDot:          { width: 8, height: 8, borderRadius: 4 },
  // Edit form
  editLabel:         { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 14, marginBottom: 6 },
  editTitleInput:    { fontSize: 17, fontWeight: '700', borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 4 },
  editDescInput:     { fontSize: 14, borderWidth: 1, borderRadius: 10, padding: 10, minHeight: 64, marginBottom: 4 },
  editRow:           { flexDirection: 'row', gap: 8, marginBottom: 4 },
  editChip:          { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  editChipText:      { fontSize: 13, fontWeight: '600' },
  editDateBtn:       { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 4 },
  cancelBtn:         { marginTop: 16, borderWidth: 1, borderRadius: 10, padding: 10, alignItems: 'center' },
  // Subtasks
  subtasksCard:      { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  subtasksHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 12 },
  subtasksTitle:     { fontSize: 16, fontWeight: '700' },
  subtasksCount:     { fontSize: 13, fontWeight: '600' },
  emptySubtasks:     { alignItems: 'center', padding: 24, gap: 10 },
  emptySubtasksText: { fontSize: 13, textAlign: 'center', lineHeight: 18, marginBottom: 8 },
  aiButton:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 16, height: 38, borderRadius: 10, borderWidth: 1, minWidth: 160 },
  aiButtonText:      { fontSize: 14, fontWeight: '700' },
  emptyText:         { fontSize: 16, marginTop: 12 },
  subtaskRow:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  subtaskCheck:      { width: 22, height: 22, borderRadius: 11, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  subtaskTitle:      { flex: 1, fontSize: 14, fontWeight: '500' },
  subtaskDone:       { textDecorationLine: 'line-through' },
  subtaskDeleteBtn:  { padding: 4 },
  addRow:            { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, gap: 10 },
  addInput:          { flex: 1, fontSize: 15, paddingVertical: 6 },
  addBtn:            { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
});
