import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/themeContext';
import { useTaskStore } from '@/context/taskStore';

const PRESET_COLORS = [
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#EC4899', // Pink
];

interface InlineCategoryCreatorProps {
  onCreated: (categoryId: string) => void;
  onCancel: () => void;
  limitReached?: boolean;
}

export default function InlineCategoryCreator({ onCreated, onCancel, limitReached }: InlineCategoryCreatorProps) {
  const { colors } = useTheme();
  const { createCategory, categories } = useTaskStore();

  const [name,    setName]    = useState('');
  const [color,   setColor]   = useState(PRESET_COLORS[0]);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  if (limitReached) {
    return (
      <View style={[styles.container, { backgroundColor: colors.warningBg, borderColor: colors.warningBorder }]}>
        <Ionicons name="star-outline" size={18} color={colors.warning} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.limitTitle, { color: colors.warning }]}>Límite de categorías</Text>
          <Text style={[styles.limitDesc, { color: colors.textSecondary }]}>El plan Free permite 5 categorías. Actualiza a Pro para crear más.</Text>
        </View>
        <TouchableOpacity onPress={onCancel}>
          <Ionicons name="close" size={18} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>
    );
  }

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) { setError('Escribe un nombre.'); return; }
    if (categories.find(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('Ya tienes una categoría con ese nombre.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await createCategory(trimmed, color, 'folder');
      // Find the newly created category by name
      const fresh = useTaskStore.getState().categories.find(c => c.name === trimmed);
      if (fresh) onCreated(fresh.id);
      else onCancel();
    } catch (e: any) {
      setError(e.message || 'No se pudo crear la categoría.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.primaryBorder }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Nueva categoría</Text>
        <TouchableOpacity onPress={onCancel} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close" size={18} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Name input */}
      <View style={[styles.inputRow, { backgroundColor: colors.inputBg, borderColor: error ? colors.error : colors.border }]}>
        <View style={[styles.colorPreview, { backgroundColor: color }]} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Nombre de la categoría"
          placeholderTextColor={colors.placeholder}
          value={name}
          onChangeText={t => { setName(t); setError(''); }}
          autoFocus
          maxLength={24}
          returnKeyType="done"
          onSubmitEditing={handleSave}
        />
      </View>

      {!!error && (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      )}

      {/* Color picker */}
      <View style={styles.colorRow}>
        {PRESET_COLORS.map(c => (
          <TouchableOpacity
            key={c}
            style={[
              styles.colorDot,
              { backgroundColor: c },
              color === c && styles.colorDotSelected,
            ]}
            onPress={() => setColor(c)}
          >
            {color === c && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: name.trim() ? color : colors.surfaceAlt }]}
          onPress={handleSave}
          disabled={saving || !name.trim()}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator size="small" color="#FFFFFF" />
            : <Text style={[styles.saveBtnText, { color: name.trim() ? '#FFFFFF' : colors.textTertiary }]}>
                Crear categoría
              </Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { borderRadius: 14, borderWidth: 1, padding: 14, marginTop: 10 },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title:           { fontSize: 14, fontWeight: '700' },
  inputRow:        { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 10, height: 44, gap: 10, marginBottom: 8 },
  colorPreview:    { width: 16, height: 16, borderRadius: 8 },
  input:           { flex: 1, fontSize: 15 },
  errorText:       { fontSize: 12, marginBottom: 8, fontWeight: '500' },
  colorRow:        { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  colorDot:        { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  colorDotSelected:{ borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.6)' },
  actions:         {},
  saveBtn:         { height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  saveBtnText:     { fontSize: 14, fontWeight: '700' },
  limitTitle:      { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  limitDesc:       { fontSize: 12, lineHeight: 16 },
});
