import React from 'react';
import {
  View, Text, StyleSheet, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/themeContext';
import { TaskAssignment } from '@/types';

interface ShareInfoProps {
  assignments?: TaskAssignment[];
}

const getStatusIcon = (status: string) => {
  if (status === 'pending') return 'time-outline';
  if (status === 'accepted') return 'checkmark-circle';
  return 'close-circle';
};

const getStatusColor = (status: string, colors: any) => {
  if (status === 'pending') return colors.warning;
  if (status === 'accepted') return colors.success;
  return colors.error;
};

const getStatusLabel = (status: string) => {
  if (status === 'pending') return 'Pendiente';
  if (status === 'accepted') return 'Aceptada';
  return 'Rechazada';
};

export default function ShareInfo({ assignments = [] }: ShareInfoProps) {
  const { colors } = useTheme();

  if (assignments.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="share-social" size={18} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>
          Compartida con
        </Text>
      </View>

      <FlatList
        data={assignments}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View
            style={[
              styles.item,
              {
                backgroundColor: colors.surface,
                borderColor: colors.borderSubtle,
              },
            ]}
          >
            <View style={styles.itemContent}>
              <Text style={[styles.itemName, { color: colors.text }]}>
                {item.shared_to?.full_name || item.shared_to_id}
              </Text>
              <Text
                style={[
                  styles.itemEmail,
                  { color: colors.textSecondary },
                ]}
              >
                {item.shared_to?.email}
              </Text>
            </View>
            <View style={styles.statusContainer}>
              <Ionicons
                name={getStatusIcon(item.status)}
                size={16}
                color={getStatusColor(item.status, colors)}
              />
              <Text
                style={[
                  styles.statusLabel,
                  { color: getStatusColor(item.status, colors) },
                ]}
              >
                {getStatusLabel(item.status)}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemEmail: {
    fontSize: 12,
    fontWeight: '400',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
