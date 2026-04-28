import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  Modal, TextInput, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/themeContext';
import { useTaskStore } from '@/context/taskStore';
import { useToast } from '@/components/Toast';
import { TaskAssignment, SubtaskAssignment } from '@/types';
import { hapticImpact } from '@/utils/haptics';

interface AssignmentCardProps {
  assignment: TaskAssignment | SubtaskAssignment;
  type: 'task' | 'subtask';
  taskName?: string;
  onAction?: () => void;
}

export default function AssignmentCard({
  assignment, type, taskName, onAction,
}: AssignmentCardProps) {
  const { colors } = useTheme();
  const { acceptAssignment, rejectAssignment } = useTaskStore();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const isTask = type === 'task';
  const title = isTask
    ? (assignment as TaskAssignment).task?.title || 'Tarea sin título'
    : (assignment as SubtaskAssignment).subtask?.title || 'Subtarea sin título';

  const getStatusColor = () => {
    if (assignment.status === 'pending') return colors.warning;
    if (assignment.status === 'accepted') return colors.success;
    return colors.error;
  };

  const getStatusText = () => {
    if (assignment.status === 'pending') return 'Pendiente';
    if (assignment.status === 'accepted') return 'Aceptada';
    return 'Rechazada';
  };

  const handleAccept = async () => {
    setLoading(true);
    try {
      await acceptAssignment(assignment.id, type);
      showToast({
        message: `${isTask ? 'Tarea' : 'Subtarea'} aceptada`,
        type: 'success',
      });
      hapticImpact('medium');
      onAction?.();
    } catch (error: any) {
      showToast({
        message: error.message || 'Error al aceptar',
        type: 'error',
      });
      hapticImpact('heavy');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectPress = () => {
    setShowRejectModal(true);
    hapticImpact('light');
  };

  const handleRejectConfirm = async () => {
    setLoading(true);
    try {
      await rejectAssignment(assignment.id, type, rejectionReason);
      showToast({
        message: `${isTask ? 'Tarea' : 'Subtarea'} rechazada`,
        type: 'info',
      });
      hapticImpact('medium');
      setShowRejectModal(false);
      setRejectionReason('');
      onAction?.();
    } catch (error: any) {
      showToast({
        message: error.message || 'Error al rechazar',
        type: 'error',
      });
      hapticImpact('heavy');
    } finally {
      setLoading(false);
    }
  };

  const webPointer = Platform.OS === 'web' ? { cursor: 'pointer' } : {};

  return (
    <>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.borderSubtle,
            borderLeftColor: getStatusColor(),
          },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor() },
              ]}
            >
              <Ionicons
                name={
                  assignment.status === 'pending'
                    ? 'time-outline'
                    : assignment.status === 'accepted'
                      ? 'checkmark-circle'
                      : 'close-circle'
                }
                size={12}
                color="#FFFFFF"
              />
            </View>
            <Text
              style={[
                styles.title,
                { color: colors.text },
              ]}
              numberOfLines={2}
            >
              {title}
            </Text>
          </View>
          <Text
            style={[
              styles.status,
              { color: getStatusColor() },
            ]}
          >
            {getStatusText()}
          </Text>
        </View>

        {/* Context para subtareas */}
        {!isTask && taskName && (
          <Text
            style={[
              styles.taskContext,
              { color: colors.textSecondary },
            ]}
          >
            De: {taskName}
          </Text>
        )}

        {/* Shared by */}
        <Text
          style={[
            styles.sharedBy,
            { color: colors.textTertiary },
          ]}
        >
          Compartida por {assignment.shared_by?.full_name || 'Usuario'}
        </Text>

        {/* Rejection reason */}
        {assignment.status === 'rejected' && assignment.rejection_reason && (
          <View
            style={[
              styles.rejectionBox,
              { backgroundColor: colors.errorBg, borderColor: colors.error },
            ]}
          >
            <Ionicons
              name="alert-circle"
              size={14}
              color={colors.error}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.rejectionText,
                { color: colors.error },
              ]}
            >
              {assignment.rejection_reason}
            </Text>
          </View>
        )}

        {/* Actions */}
        {assignment.status === 'pending' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.rejectBtn,
                {
                  backgroundColor: colors.errorBg,
                  borderColor: colors.error,
                },
              ]}
              onPress={handleRejectPress}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.error} />
              ) : (
                <Text style={[styles.rejectBtnText, { color: colors.error }]}>
                  Rechazar
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.acceptBtn,
                { backgroundColor: colors.success },
              ]}
              onPress={handleAccept}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.acceptBtnText}>Aceptar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Reject Modal */}
      <Modal
        visible={showRejectModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRejectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modal,
              { backgroundColor: colors.background },
            ]}
          >
            <View
              style={[
                styles.modalHeader,
                { backgroundColor: colors.surface },
              ]}
            >
              <Ionicons
                name="alert-circle"
                size={24}
                color={colors.error}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.modalTitle,
                  { color: colors.text },
                ]}
              >
                Rechazar {isTask ? 'tarea' : 'subtarea'}
              </Text>
            </View>

            <Text
              style={[
                styles.modalDescription,
                { color: colors.textSecondary },
              ]}
            >
              ¿Por qué rechazas esto? (opcional)
            </Text>

            <View
              style={[
                styles.reasonInput,
                { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
              ]}
            >
              <TextInput
                style={[
                  styles.reasonInputField,
                  { color: colors.text },
                  Platform.OS === 'web' && { outlineStyle: 'none' } as any,
                ]}
                placeholder="Ej: Ya no es necesario"
                placeholderTextColor={colors.placeholder}
                value={rejectionReason}
                onChangeText={setRejectionReason}
                multiline
                numberOfLines={3}
                editable={!loading}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalCancelBtn,
                  { borderColor: colors.border },
                ]}
                onPress={() => setShowRejectModal(false)}
                disabled={loading}
              >
                <Text style={[styles.modalCancelText, { color: colors.text }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalConfirmBtn,
                  { backgroundColor: colors.error },
                ]}
                onPress={handleRejectConfirm}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalConfirmText}>Rechazar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    flexShrink: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  status: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  taskContext: {
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 6,
    marginLeft: 32,
  },
  sharedBy: {
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 8,
    marginLeft: 32,
  },
  rejectionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
  rejectionText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  rejectBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  rejectBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  acceptBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modal: {
    borderRadius: 16,
    paddingVertical: 0,
    maxWidth: 400,
    width: '100%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  modalDescription: {
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  reasonInput: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
  },
  reasonInputField: {
    fontSize: 14,
    fontWeight: '400',
    minHeight: 80,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  modalCancelBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
