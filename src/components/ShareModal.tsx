import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TextInput, TouchableOpacity,
  ActivityIndicator, ScrollView, Platform, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/themeContext';
import { useTaskStore } from '@/context/taskStore';
import { useToast } from '@/components/Toast';
import { User } from '@/types';
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
  const { findUserByEmail } = useTaskStore();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Debounce email search
  useEffect(() => {
    if (!email.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      searchUser(email.trim());
    }, 500);

    return () => clearTimeout(timer);
  }, [email]);

  const searchUser = async (emailToSearch: string) => {
    setSearchLoading(true);
    try {
      const user = await findUserByEmail(emailToSearch);
      if (user) {
        setSuggestions([user]);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      setSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setEmail(user.email);
    setSuggestions([]);
    hapticImpact('light');
  };

  const handleShare = async () => {
    if (!selectedUser) {
      showToast({ message: 'Selecciona un usuario', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await onShare(selectedUser.email);
      showToast({
        message: `${subtaskTitle ? 'Subtarea' : 'Tarea'} compartida con ${selectedUser.full_name}`,
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
    setMessage('');
    setSelectedUser(null);
    setSuggestions([]);
  };

  const title = subtaskTitle
    ? `Compartir subtarea: "${subtaskTitle}"`
    : `Compartir tarea: "${taskTitle}"`;

  const webPointer = Platform.OS === 'web' ? { cursor: 'pointer' } : {};

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
            {/* Email Input */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Email del usuario
              </Text>
              <View
                style={[
                  styles.inputBox,
                  { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
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
                {searchLoading && <ActivityIndicator size="small" color={colors.primary} />}
              </View>
            </View>

            {/* Suggestions */}
            {suggestions.length > 0 && selectedUser === null && (
              <View style={styles.section}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Usuarios encontrados
                </Text>
                <FlatList
                  data={suggestions}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.suggestionItem,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.borderSubtle,
                        },
                      ]}
                      onPress={() => handleSelectUser(item)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.suggestionContent}>
                        <Text style={[styles.suggestionName, { color: colors.text }]}>
                          {item.full_name}
                        </Text>
                        <Text
                          style={[
                            styles.suggestionEmail,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {item.email}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            {/* Selected User */}
            {selectedUser && (
              <View style={styles.section}>
                <View
                  style={[
                    styles.selectedUserCard,
                    { backgroundColor: colors.primaryLight, borderColor: colors.primaryBorder },
                  ]}
                >
                  <View style={styles.selectedUserContent}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={[styles.selectedUserName, { color: colors.primary }]}>
                        {selectedUser.full_name}
                      </Text>
                      <Text
                        style={[
                          styles.selectedUserEmail,
                          { color: colors.primary, opacity: 0.8 },
                        ]}
                      >
                        {selectedUser.email}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedUser(null)}
                    disabled={loading}
                    style={webPointer}
                  >
                    <Ionicons name="close-circle" size={24} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Message (Optional) */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Mensaje (opcional)
              </Text>
              <View
                style={[
                  styles.inputBox,
                  { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                ]}
              >
                <TextInput
                  style={[
                    styles.messageInput,
                    { color: colors.text },
                    Platform.OS === 'web' && { outlineStyle: 'none' } as any,
                  ]}
                  placeholder="Ej: Por favor revisa esto cuando puedas"
                  placeholderTextColor={colors.placeholder}
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  editable={!loading}
                  numberOfLines={3}
                />
              </View>
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
                  opacity: selectedUser && !loading ? 1 : 0.5,
                },
              ]}
              onPress={handleShare}
              disabled={!selectedUser || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="share-social" size={18} color="#FFFFFF" />
                  <Text style={styles.shareBtnText}>Compartir</Text>
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
    maxHeight: '90%',
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
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  messageInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    paddingVertical: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  suggestionEmail: {
    fontSize: 12,
    fontWeight: '400',
  },
  selectedUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  selectedUserContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedUserName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  selectedUserEmail: {
    fontSize: 12,
    fontWeight: '400',
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
