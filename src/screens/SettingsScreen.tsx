import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/context/authStore';
import { useTheme } from '@/context/themeContext';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function MenuItem({
  icon, label, onPress, danger = false, rightElement,
}: {
  icon: IoniconsName; label: string; onPress?: () => void; danger?: boolean; rightElement?: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.menuItem, { borderBottomColor: colors.borderSubtle }]}
      onPress={onPress}
      activeOpacity={0.6}
      disabled={!onPress && !rightElement}
    >
      <View style={[styles.menuIconBox, { backgroundColor: danger ? colors.errorBg : colors.primaryLight }]}>
        <Ionicons name={icon} size={18} color={danger ? colors.error : colors.primary} />
      </View>
      <Text style={[styles.menuLabel, { color: danger ? colors.error : colors.text }]}>{label}</Text>
      {rightElement ?? (
        <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { user, signOut } = useAuthStore();
  const { colors, isDark, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    try { await signOut(); } catch (e: any) { /* silent */ }
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.full_name || 'Usuario'}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email || ''}</Text>
          <View style={[styles.planBadge, { backgroundColor: colors.primaryLight, borderColor: colors.primaryBorder }]}>
            <Ionicons name={user?.plan === 'pro' ? 'star' : 'flash-outline'} size={12} color={colors.primary} />
            <Text style={[styles.planText, { color: colors.primary }]}>
              {user?.plan === 'pro' ? 'Plan Pro' : 'Plan Free'}
            </Text>
          </View>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>APARIENCIA</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
            <MenuItem
              icon={isDark ? 'moon' : 'sunny'}
              label={isDark ? 'Modo oscuro' : 'Modo claro'}
              rightElement={
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: colors.surfaceAlt, true: colors.primary }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={colors.surfaceAlt}
                />
              }
            />
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>CUENTA</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
            <MenuItem icon="person-outline" label="Editar perfil" onPress={() => {}} />
            <MenuItem icon="lock-closed-outline" label="Cambiar contraseña" onPress={() => {}} />
          </View>
        </View>

        {/* Plan */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>PLAN</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
            {user?.plan === 'free' ? (
              <View style={[styles.upgradeRow, { borderBottomColor: colors.borderSubtle }]}>
                <View style={styles.upgradeLeft}>
                  <Text style={[styles.upgradeTitle, { color: colors.text }]}>Actualiza a Pro</Text>
                  <Text style={[styles.upgradeDesc, { color: colors.textSecondary }]}>
                    Colaboración ilimitada por $4.99/mes
                  </Text>
                </View>
                <TouchableOpacity style={[styles.upgradeBtn, { backgroundColor: colors.primary }]} activeOpacity={0.8}>
                  <Text style={styles.upgradeBtnText}>Ver</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <MenuItem icon="star-outline" label="Gestionar suscripción" onPress={() => {}} />
            )}
          </View>
        </View>

        {/* App */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>APLICACIÓN</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
            <MenuItem icon="notifications-outline" label="Notificaciones" onPress={() => {}} />
            <MenuItem icon="bar-chart-outline" label="Mis estadísticas" onPress={() => {}} />
            <MenuItem icon="information-circle-outline" label="Acerca de TaskFlow" onPress={() => {}} />
          </View>
        </View>

        {/* Sign out */}
        <View style={[styles.section, { marginBottom: 48 }]}>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
            <MenuItem icon="log-out-outline" label="Cerrar sesión" onPress={handleSignOut} danger />
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: { paddingTop: 60, paddingBottom: 28, alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth },
  avatar: { width: 76, height: 76, borderRadius: 38, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 26, fontWeight: '700', color: '#FFFFFF' },
  userName: { fontSize: 19, fontWeight: '700', marginBottom: 4 },
  userEmail: { fontSize: 13, marginBottom: 12 },
  planBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1 },
  planText: { fontSize: 12, fontWeight: '700' },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8, paddingLeft: 4 },
  card: { borderRadius: 14, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth },
  menuIconBox: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  upgradeRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  upgradeLeft: { flex: 1 },
  upgradeTitle: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  upgradeDesc: { fontSize: 12, lineHeight: 16 },
  upgradeBtn: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7 },
  upgradeBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
});
