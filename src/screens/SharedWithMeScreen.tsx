import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  StatusBar, SectionList, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '@/context/authStore';
import { useTaskStore } from '@/context/taskStore';
import { useTheme } from '@/context/themeContext';
import AssignmentCard from '@/components/AssignmentCard';
import { TaskAssignment, SubtaskAssignment } from '@/types';

export default function SharedWithMeScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuthStore();
  const { pendingAssignments, loading, fetchPendingAssignments } = useTaskStore();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        fetchPendingAssignments(user.id);
      }
    }, [user?.id])
  );

  const handleRefresh = async () => {
    if (user?.id) {
      setRefreshing(true);
      try {
        await fetchPendingAssignments(user.id);
      } finally {
        setRefreshing(false);
      }
    }
  };

  const handleAction = () => {
    // Refetch después de aceptar/rechazar
    if (user?.id) {
      fetchPendingAssignments(user.id);
    }
  };

  // Separar en tareas y subtareas
  const taskAssignments = pendingAssignments.filter(
    (a) => 'task_id' in a && !('subtask_id' in a)
  ) as TaskAssignment[];

  const subtaskAssignments = pendingAssignments.filter(
    (a) => 'subtask_id' in a
  ) as SubtaskAssignment[];

  const sections = [
    {
      title: 'Tareas compartidas',
      data: taskAssignments,
      type: 'task',
    },
    {
      title: 'Subtareas compartidas',
      data: subtaskAssignments,
      type: 'subtask',
    },
  ].filter((section) => section.data.length > 0);

  const isEmpty = taskAssignments.length === 0 && subtaskAssignments.length === 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <View>
          <Text style={[styles.title, { color: colors.text }]}>
            Compartidas conmigo
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {pendingAssignments.length} pendientes
          </Text>
        </View>
        <Ionicons
          name="share-social"
          size={28}
          color={colors.primary}
          style={{ opacity: 0.7 }}
        />
      </View>

      {loading && isEmpty ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Cargando...
          </Text>
        </View>
      ) : isEmpty ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          <Ionicons
            name="checkmark-circle"
            size={56}
            color={colors.textTertiary}
            style={{ marginBottom: 12 }}
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Todo al día
          </Text>
          <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
            No tienes tareas ni subtareas pendientes de aceptar
          </Text>
        </ScrollView>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item, section }) => {
            const taskName =
              section.type === 'subtask'
                ? (item as SubtaskAssignment).subtask?.task_id
                : undefined;

            return (
              <View style={{ paddingHorizontal: 16 }}>
                <AssignmentCard
                  assignment={item}
                  type={section.type as 'task' | 'subtask'}
                  taskName={taskName}
                  onAction={handleAction}
                />
              </View>
            );
          }}
          renderSectionHeader={({ section }) => (
            <View
              style={[
                styles.sectionHeader,
                { backgroundColor: colors.background },
              ]}
            >
              <Ionicons
                name={
                  section.type === 'task'
                    ? 'document-outline'
                    : 'list-outline'
                }
                size={16}
                color={colors.primary}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.textSecondary },
                ]}
              >
                {section.title}
              </Text>
              <Text
                style={[
                  styles.sectionCount,
                  { color: colors.primary },
                ]}
              >
                {section.data.length}
              </Text>
            </View>
          )}
          scrollEnabled={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={{ paddingVertical: 12 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    marginTop: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    minHeight: 400,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    flex: 1,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
