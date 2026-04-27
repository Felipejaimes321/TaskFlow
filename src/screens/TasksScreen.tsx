import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuthStore } from '@/context/authStore';
import { useTaskStore } from '@/context/taskStore';
import { Task } from '@/types';

export default function TasksScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { tasks, loading, fetchTasks, deleteTask, completeTask } = useTaskStore();

  useEffect(() => {
    if (user?.id) {
      fetchTasks(user.id);
      // Refetch every 10 seconds for polling
      const interval = setInterval(() => fetchTasks(user.id), 10000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const handleDelete = (taskId: string) => {
    Alert.alert('Eliminar tarea', '¿Estás seguro?', [
      { text: 'Cancelar', onPress: () => {} },
      {
        text: 'Eliminar',
        onPress: async () => {
          try {
            await deleteTask(taskId);
            Alert.alert('Éxito', 'Tarea eliminada');
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleComplete = async (task: Task) => {
    try {
      await completeTask(task.id);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const renderTaskItem = ({ item }: { item: Task }) => {
    const pendingSubtasks =
      (item.subtasks || []).filter((s) => !s.completed).length || 0;
    const totalSubtasks = (item.subtasks || []).length;
    const progress =
      totalSubtasks > 0
        ? `${totalSubtasks - pendingSubtasks}/${totalSubtasks}`
        : null;

    return (
      <TouchableOpacity style={styles.taskItem} onPress={() => {}}>
        <View style={styles.taskContent}>
          <View style={styles.taskHeader}>
            <Text
              style={[
                styles.taskTitle,
                item.status === 'completed' && styles.taskCompleted,
              ]}
            >
              {item.title}
            </Text>
            <View
              style={[
                styles.priorityBadge,
                item.priority === 'high' && styles.priorityHigh,
                item.priority === 'medium' && styles.priorityMedium,
                item.priority === 'low' && styles.priorityLow,
              ]}
            >
              <Text style={styles.priorityText}>
                {item.priority.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>

          {item.description && (
            <Text style={styles.taskDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}

          {progress && (
            <Text style={styles.progressText}>Subtareas: {progress}</Text>
          )}

          {item.due_date && (
            <Text style={styles.dueDate}>{item.due_date}</Text>
          )}
        </View>

        <View style={styles.taskActions}>
          {item.status !== 'completed' && (
            <TouchableOpacity
              style={styles.completeBtn}
              onPress={() => handleComplete(item)}
            >
              <Text style={styles.completeBtnText}>✓</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item.id)}
          >
            <Text style={styles.deleteBtnText}>🗑</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && tasks.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Tareas</Text>
        <Text style={styles.subtitle}>
          {pendingTasks.length} pendientes • {completedTasks.length} completadas
        </Text>
      </View>

      {pendingTasks.length === 0 && completedTasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No hay tareas aún</Text>
          <Text style={styles.emptySubtext}>
            Toca el botón + para crear una nueva
          </Text>
        </View>
      ) : (
        <FlatList
          data={[
            { type: 'header', label: 'Pendientes' },
            ...pendingTasks.map((t) => ({ type: 'task', data: t })),
            ...(completedTasks.length > 0
              ? [{ type: 'header', label: 'Completadas' }]
              : []),
            ...completedTasks.map((t) => ({ type: 'task', data: t })),
          ]}
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return (
                <Text style={styles.sectionHeader}>{item.label}</Text>
              );
            }
            return renderTaskItem({ item: item.data });
          }}
          keyExtractor={(item, idx) =>
            item.type === 'header'
              ? `header-${item.label}`
              : item.data.id
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTask')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
    paddingLeft: 4,
  },
  taskItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    alignItems: 'center',
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  taskCompleted: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  priorityHigh: {
    backgroundColor: '#FFE5E5',
  },
  priorityMedium: {
    backgroundColor: '#FFF4E5',
  },
  priorityLow: {
    backgroundColor: '#E5F5FF',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
  },
  taskDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 12,
    color: '#007AFF',
  },
  taskActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 12,
  },
  completeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5F5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeBtnText: {
    fontSize: 18,
    color: '#4CAF50',
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: {
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
});
