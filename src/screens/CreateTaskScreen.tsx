import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import { useTaskStore } from '@/context/taskStore';
import { useAuthStore } from '@/context/authStore';

const PRIORITY_OPTIONS = [
  { label: 'Baja', value: 'low' },
  { label: 'Media', value: 'medium' },
  { label: 'Alta', value: 'high' },
];

export default function CreateTaskScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { categories, createTask, loading } = useTaskStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('low');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }

    try {
      await createTask(
        title,
        description || null,
        categoryId,
        priority,
        dueDate || null
      );
      Alert.alert('Éxito', 'Tarea creada');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedPriority = PRIORITY_OPTIONS.find((p) => p.value === priority);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Título *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Comprar leche"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#999"
          editable={!loading}
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Detalles adicionales..."
          value={description}
          onChangeText={setDescription}
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          editable={!loading}
        />

        <Text style={styles.label}>Prioridad</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setShowPriorityModal(true)}
          disabled={loading}
        >
          <Text style={styles.selectButtonText}>
            {selectedPriority?.label || 'Seleccionar'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Categoría</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setShowCategoryModal(true)}
          disabled={loading}
        >
          <Text style={styles.selectButtonText}>
            {selectedCategory?.name || 'Sin categoría'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Fecha Límite</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={dueDate}
          onChangeText={setDueDate}
          placeholderTextColor="#999"
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creando...' : 'Crear Tarea'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      {/* Priority Modal */}
      <Modal
        visible={showPriorityModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPriorityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar Prioridad</Text>
            <FlatList
              data={PRIORITY_OPTIONS}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setPriority(item.value);
                    setShowPriorityModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      priority === item.value && styles.modalItemSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.value}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPriorityModal(false)}
            >
              <Text style={styles.modalCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar Categoría</Text>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setCategoryId(null);
                setShowCategoryModal(false);
              }}
            >
              <Text
                style={[
                  styles.modalItemText,
                  !categoryId && styles.modalItemSelected,
                ]}
              >
                Sin categoría
              </Text>
            </TouchableOpacity>
            <FlatList
              data={categories}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setCategoryId(item.id);
                    setShowCategoryModal(false);
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View
                      style={[
                        styles.categoryColor,
                        { backgroundColor: item.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.modalItemText,
                        categoryId === item.id &&
                          styles.modalItemSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={styles.modalCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  form: {
    padding: 20,
    paddingTop: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  multilineInput: {
    minHeight: 100,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  selectButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectButtonText: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 24,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  modalItem: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  modalItemSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  modalCloseButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 8,
  },
  modalCloseText: {
    textAlign: 'center',
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
