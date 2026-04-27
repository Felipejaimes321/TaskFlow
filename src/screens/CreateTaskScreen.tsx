import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Alert, StyleSheet, StatusBar, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTaskStore } from '@/context/taskStore';
import { useTheme } from '@/context/themeContext';
import { Recurrence } from '@/types';
import { offsetDate, formatDate } from '@/utils/dateUtils';
import InlineDatePicker from '@/components/InlineDatePicker';
import InlineCategoryCreator from '@/components/InlineCategoryCreator';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
  const { colors } = useTheme();
  return <Text style={[secSt.text, { color: colors.textTertiary }]}>{text}</Text>;
}
const secSt = StyleSheet.create({
  text: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
});

function Chip({ label, selected, onPress, icon, color }: {
  label: string; selected: boolean; onPress: () => void; icon?: IoniconsName; color?: string;
}) {
  const { colors } = useTheme();
  const ac = color || colors.primary;
  return (
    <TouchableOpacity
      style={[chipSt.chip, { borderColor: selected ? ac : colors.border, backgroundColor: selected ? ac + '1A' : colors.surface }]}
      onPress={onPress} activeOpacity={0.7}
    >
      {icon && <Ionicons name={icon} size={13} color={selected ? ac : colors.icon} />}
      <Text style={[chipSt.label, { color: selected ? ac : colors.textSecondary }]}>{label}</Text>
    </TouchableOpacity>
  );
}
const chipSt = StyleSheet.create({
  chip:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  label: { fontSize: 13, fontWeight: '600' },
});

function PriorityPill({ label, selected, onPress, color }: {
  label: string; selected: boolean; onPress: () => void; color: string;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[prioSt.pill, { backgroundColor: selected ? color + '20' : colors.surface, borderColor: selected ? color : colors.border, flex: 1 }]}
      onPress={onPress} activeOpacity={0.7}
    >
      <View style={[prioSt.dot, { backgroundColor: color }]} />
      <Text style={[prioSt.label, { color: selected ? color : colors.textSecondary, fontWeight: selected ? '700' : '500' }]}>{label}</Text>
    </TouchableOpacity>
  );
}
const prioSt = StyleSheet.create({
  pill:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  dot:   { width: 7, height: 7, borderRadius: 3.5 },
  label: { fontSize: 14 },
});

// ─── Constants ─────────────────────────────────────────────────────────────────

const TODAY    = offsetDate(0);
const TOMORROW = offsetDate(1);
const IN_WEEK  = offsetDate(7);
type DateKey = 'today' | 'tomorrow' | 'week' | 'custom' | null;

const RECURRENCE_OPTIONS: { key: Recurrence; label: string; icon: IoniconsName }[] = [
  { key: null,      label: 'No repetir',   icon: 'remove-outline'    },
  { key: 'daily',   label: 'Cada día',     icon: 'sunny-outline'     },
  { key: 'weekly',  label: 'Cada semana',  icon: 'repeat-outline'    },
  { key: 'monthly', label: 'Cada mes',     icon: 'calendar-outline'  },
];

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function CreateTaskScreen({ navigation }: any) {
  const { categories, createTask, loading } = useTaskStore();
  const { colors, isDark } = useTheme();

  // Form state
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [showDesc,    setShowDesc]    = useState(false);
  const [priority,    setPriority]    = useState<'low' | 'medium' | 'high'>('low');
  const [categoryId,  setCategoryId]  = useState<string | null>(null);
  const [recurrence,  setRecurrence]  = useState<Recurrence>(null);
  const [dateKey,     setDateKey]     = useState<DateKey>(null);
  const [customDate,  setCustomDate]  = useState<string | null>(null);
  const [showPicker,  setShowPicker]  = useState(false);
  const [showCatCreator, setShowCatCreator] = useState(false);

  const titleRef = useRef<TextInput>(null);
  const descAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(descAnim, { toValue: showDesc ? 1 : 0, duration: 200, useNativeDriver: true }).start();
  }, [showDesc]);

  const resolvedDate = (): string | null => {
    if (dateKey === 'today')    return TODAY;
    if (dateKey === 'tomorrow') return TOMORROW;
    if (dateKey === 'week')     return IN_WEEK;
    if (dateKey === 'custom')   return customDate;
    return null;
  };

  const handleQuickDate = (key: DateKey) => {
    if (key === dateKey) { setDateKey(null); setShowPicker(false); setCustomDate(null); return; }
    setDateKey(key);
    setShowPicker(key === 'custom');
    if (key !== 'custom') setCustomDate(null);
  };

  const handleCreate = async () => {
    const trimmed = title.trim();
    if (!trimmed) { titleRef.current?.focus(); return; }
    try {
      await createTask(trimmed, description.trim() || null, categoryId, priority, resolvedDate(), recurrence);
      navigation.replace('TaskSuccess', {
        title: trimmed,
        priority,
        dueDate: resolvedDate(),
        categoryName: categories.find(c => c.id === categoryId)?.name || null,
        recurrence,
      });
    } catch (error: any) {
      Alert.alert('Error al crear', error.message);
    }
  };

  const titleReady   = title.trim().length > 0;
  const date         = resolvedDate();
  const pColor       = (v: string) => v === 'high' ? colors.priorityHigh : v === 'medium' ? colors.priorityMed : colors.priorityLow;
  const FREE_LIMIT   = 5;
  const atCatLimit   = categories.length >= FREE_LIMIT;

  return (
    <KeyboardAvoidingView style={[styles.root, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Nueva tarea</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* ── Title ──────────────────────────────────────────────── */}
        <TextInput
          ref={titleRef}
          style={[styles.titleInput, { color: colors.text }]}
          placeholder="¿Qué necesitas hacer?"
          placeholderTextColor={colors.placeholder}
          value={title} onChangeText={setTitle}
          autoFocus multiline blurOnSubmit editable={!loading}
        />

        {/* ── Description ────────────────────────────────────────── */}
        {!showDesc ? (
          <TouchableOpacity style={styles.addNotesRow} onPress={() => setShowDesc(true)} activeOpacity={0.6}>
            <Ionicons name="add" size={15} color={colors.textTertiary} />
            <Text style={[styles.addNotesText, { color: colors.textTertiary }]}>Agregar notas...</Text>
          </TouchableOpacity>
        ) : (
          <Animated.View style={{ opacity: descAnim }}>
            <TextInput
              style={[styles.descInput, { color: colors.text, borderColor: colors.borderSubtle }]}
              placeholder="Notas adicionales..."
              placeholderTextColor={colors.placeholder}
              value={description} onChangeText={setDescription}
              multiline autoFocus textAlignVertical="top" editable={!loading}
            />
          </Animated.View>
        )}

        <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

        {/* ── Priority ───────────────────────────────────────────── */}
        <View style={styles.section}>
          <SectionLabel text="Prioridad" />
          <View style={styles.priorityRow}>
            {(['low','medium','high'] as const).map(v => (
              <PriorityPill key={v} label={v === 'low' ? 'Baja' : v === 'medium' ? 'Media' : 'Alta'} selected={priority === v} color={pColor(v)} onPress={() => setPriority(v)} />
            ))}
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

        {/* ── Recurrence ─────────────────────────────────────────── */}
        <View style={styles.section}>
          <SectionLabel text="Repetir" />
          <View style={styles.chipRow}>
            {RECURRENCE_OPTIONS.map(opt => (
              <Chip
                key={String(opt.key)}
                label={opt.label}
                icon={opt.icon}
                selected={recurrence === opt.key}
                onPress={() => setRecurrence(opt.key)}
              />
            ))}
          </View>
          {recurrence && (
            <View style={[styles.infoRow, { backgroundColor: colors.primaryLight, borderColor: colors.primaryBorder }]}>
              <Ionicons name="information-circle-outline" size={13} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.primary }]}>
                {recurrence === 'daily'   && 'Se creará una nueva tarea al completar esta, con la fecha del día siguiente.'}
                {recurrence === 'weekly'  && 'Se creará una nueva tarea al completar esta, con fecha 7 días después.'}
                {recurrence === 'monthly' && 'Se creará una nueva tarea al completar esta, con fecha del mes siguiente.'}
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

        {/* ── Date ───────────────────────────────────────────────── */}
        <View style={styles.section}>
          <SectionLabel text="Fecha límite" />
          <View style={styles.chipRow}>
            <Chip label="Hoy"         icon="sunny-outline"    selected={dateKey === 'today'}    onPress={() => handleQuickDate('today')} />
            <Chip label="Mañana"      icon="moon-outline"     selected={dateKey === 'tomorrow'} onPress={() => handleQuickDate('tomorrow')} />
            <Chip label="Esta semana" icon="calendar-outline" selected={dateKey === 'week'}     onPress={() => handleQuickDate('week')} />
            <Chip
              label={dateKey === 'custom' && customDate ? formatDate(customDate) : 'Elegir'}
              icon="calendar"
              selected={dateKey === 'custom'}
              onPress={() => handleQuickDate('custom')}
            />
          </View>

          {showPicker && (
            <InlineDatePicker
              value={customDate}
              onSelect={(iso) => { setCustomDate(iso); setDateKey('custom'); setShowPicker(false); }}
              onClear={() => { setCustomDate(null); setDateKey(null); setShowPicker(false); }}
            />
          )}

          {date && (
            <View style={[styles.selectedRow, { backgroundColor: colors.primaryLight, borderColor: colors.primaryBorder }]}>
              <Ionicons name="calendar" size={13} color={colors.primary} />
              <Text style={[styles.selectedRowText, { color: colors.primary }]}>{formatDate(date)}</Text>
              <TouchableOpacity onPress={() => { setDateKey(null); setCustomDate(null); setShowPicker(false); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={15} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

        {/* ── Category ───────────────────────────────────────────── */}
        <View style={styles.section}>
          <SectionLabel text="Categoría" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
            {/* Ninguna */}
            <TouchableOpacity
              style={[styles.catChip, { borderColor: !categoryId ? colors.primary : colors.border, backgroundColor: !categoryId ? colors.primaryLight : colors.surface }]}
              onPress={() => { setCategoryId(null); setShowCatCreator(false); }}
            >
              <Ionicons name="albums-outline" size={13} color={!categoryId ? colors.primary : colors.icon} />
              <Text style={[styles.catChipText, { color: !categoryId ? colors.primary : colors.textSecondary }]}>Ninguna</Text>
            </TouchableOpacity>

            {/* Existing categories */}
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catChip, { borderColor: categoryId === cat.id ? cat.color : colors.border, backgroundColor: categoryId === cat.id ? cat.color + '18' : colors.surface }]}
                onPress={() => { setCategoryId(cat.id); setShowCatCreator(false); }}
              >
                <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                <Text style={[styles.catChipText, { color: categoryId === cat.id ? cat.color : colors.textSecondary }]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}

            {/* "+ Nueva" button */}
            <TouchableOpacity
              style={[styles.catChip, { borderColor: showCatCreator ? colors.primary : colors.border, backgroundColor: showCatCreator ? colors.primaryLight : colors.surface, borderStyle: 'dashed' }]}
              onPress={() => setShowCatCreator(v => !v)}
            >
              <Ionicons name={showCatCreator ? 'close' : 'add'} size={13} color={showCatCreator ? colors.primary : colors.icon} />
              <Text style={[styles.catChipText, { color: showCatCreator ? colors.primary : colors.textSecondary }]}>
                {showCatCreator ? 'Cancelar' : 'Nueva'}
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Inline category creator */}
          {showCatCreator && (
            <InlineCategoryCreator
              limitReached={atCatLimit}
              onCreated={(id) => { setCategoryId(id); setShowCatCreator(false); }}
              onCancel={() => setShowCatCreator(false)}
            />
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Sticky Create Button ───────────────────────────────── */}
      <View style={[styles.stickyFooter, { backgroundColor: colors.background, borderTopColor: colors.borderSubtle }]}>
        <TouchableOpacity
          style={[styles.createBtn, { backgroundColor: titleReady ? colors.primary : colors.surfaceAlt }]}
          onPress={handleCreate} disabled={loading} activeOpacity={0.85}
        >
          <Text style={[styles.createBtnText, { color: titleReady ? '#fff' : colors.textTertiary }]}>
            {loading ? 'Creando...' : 'Crear tarea'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color={titleReady ? '#fff' : colors.textTertiary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:            { flex: 1 },
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  headerTitle:     { fontSize: 16, fontWeight: '700' },
  closeBtn:        { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  scroll:          { flex: 1 },
  scrollContent:   { paddingHorizontal: 20, paddingTop: 24 },
  titleInput:      { fontSize: 26, fontWeight: '700', letterSpacing: -0.3, lineHeight: 34, marginBottom: 12, minHeight: 40 },
  addNotesRow:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20, paddingVertical: 4 },
  addNotesText:    { fontSize: 14 },
  descInput:       { fontSize: 15, lineHeight: 22, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: 20, minHeight: 72 },
  divider:         { height: StyleSheet.hairlineWidth, marginVertical: 20 },
  section:         { marginBottom: 4 },
  priorityRow:     { flexDirection: 'row', gap: 8 },
  chipRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  infoRow:         { flexDirection: 'row', alignItems: 'flex-start', gap: 7, marginTop: 10, borderRadius: 10, borderWidth: 1, padding: 10 },
  infoText:        { flex: 1, fontSize: 12, lineHeight: 17, fontWeight: '500' },
  selectedRow:     { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 10, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7, alignSelf: 'flex-start' },
  selectedRowText: { fontSize: 13, fontWeight: '700' },
  catRow:          { gap: 8, paddingBottom: 4 },
  catChip:         { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  catChipText:     { fontSize: 13, fontWeight: '600' },
  catDot:          { width: 7, height: 7, borderRadius: 3.5 },
  stickyFooter:    { paddingHorizontal: 20, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 36 : 20, borderTopWidth: StyleSheet.hairlineWidth },
  createBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: 14 },
  createBtnText:   { fontSize: 16, fontWeight: '700' },
});
