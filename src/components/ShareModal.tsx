import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TextInput, TouchableOpacity,
  ActivityIndicator, ScrollView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/themeContext';
import { useToast } from '@/components/Toast';
import { hapticImpact } from '@/utils/haptics';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  taskTitle?: string;
  subtaskTitle?: string;
  onShare: (email: string) => Promise<void>;
}

export default function ShareModal({
  visible, onClose, taskTitle, subtaskTitle, onShare,
}: ShareModalProps) {
  const { colors, isDark } = useTheme();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      showToast({ message: 'Ingresa un email', type: 'error' });
      return;
    }

    if (!emailRegex.test(email.trim())) {
      showToast({ message: 'Email inválido', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await onShare(email.toLowerCase().trim());
      showToast({
        message: `${subtaskTitle ? 'Subtarea' : 'Tarea'} compartida con ${email}`,
        type: 'success',
      });
      hapticImpact('medium');
      resetForm();
      onClose();
    } catch (error: any) {
      showToast({
        message: error.message || 'Error al compartir',
        type: 'error',
      });
      hapticImpact('heavy');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
  };

  const title = subtaskTitle
    ? `Compartir subtarea: "${subtaskTitle}"`
    : `Compartir tarea: "${taskTitle}"`;

  const webPointer = Platform.OS === 'web' ? { cursor: 'pointer' } : {};
  const isValidEmail = email.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View
          style={[
            styles.container,
            { backgroundColor: colors.background },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              { backgroundColor: colors.surface, borderBottomColor: colors.border },
            ]}
          >
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              disabled={loading}
              style={webPointer}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            {/* Info */}
            <View style={styles.section}>
              <View
                style={[
                  styles.infoBox,
                  { backgroundColor: colors.primaryLight, borderColor: colors.primaryBorder },
                ]}
              >
                <Ionicons name="information-circle" size={20} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.primary }]}>
                  Puedes compartir con cualquier email. Se enviará una invitación automática.
                </Text>
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Email del destinatario
              </Text>
              <View
                style={[
                  styles.inputBox,
                  {
                    backgroundColor: colors.surfaceAlt,
                    borderColor: isValidEmail ? colors.primary : colors.border,
                    borderWidth: 1.5,
                  },
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={colors.textTertiary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    { color: colors.text },
                    Platform.OS === 'web' && { outlineStyle: 'none' } as any,
                  ]}
                  placeholder="usuario@ejemplo.com"
                  placeholderTextColor={colors.placeholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                  autoCorrect={false}
                />
                {isValidEmail && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                )}
              </View>
            </View>

            {/* Help text */}
            <View style={styles.section}>
              <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                Si la persona no tiene cuenta en TaskFlow, la invitación se le enviará por correo.
                Cuando se registre, verá la tarea automáticamente.
              </Text>
            </View>
          </ScrollView>

          {/* Footer - Actions */}
          <View
            style={[
              styles.footer,
              { borderTopColor: colors.border, backgroundColor: colors.background },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.cancelBtn,
                { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
              ]}
              onPress={onClose}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelBtnText, { color: colors.text }]}>
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.shareBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: isValidEmail && !loading ? 1 : 0.5,
                },
              ]}
              onPress={handleShare}
              disabled={!isValidEmail || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="send" size={18} color="#FFFFFF" />
                  <Text style={styles.shareBtnText}>Enviar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    paddingRight: 12,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 20,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    paddingLeft: 4,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  helpText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  shareBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
