import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/themeContext';
import { Category } from '@/types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryFilterProps) {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  const handleSelectCategory = (categoryId: string | null) => {
    onSelectCategory(categoryId);
    setModalVisible(false);
  };

  return (
    <>
      {/* Filter Button */}
      <TouchableOpacity
        style={[
          styles.filterButton,
          {
            backgroundColor: colors.surfaceAlt,
            borderColor: selectedCategoryId ? colors.primary : colors.border,
          },
        ]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.filterContent}>
          {selectedCategory ? (
            <>
              <View
                style={[styles.categoryDot, { backgroundColor: selectedCategory.color }]}
              />
              <Text style={[styles.filterButtonText, { color: colors.text }]}>
                {selectedCategory.name}
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="layers-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.filterButtonText, { color: colors.textSecondary }]}>
                Filtrar por categoría
              </Text>
            </>
          )}
        </View>
        <Ionicons
          name={modalVisible ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            {/* Header */}
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: colors.border, backgroundColor: colors.surface },
              ]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Filtrar por categoría
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Category List */}
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    {
                      backgroundColor: colors.surfaceAlt,
                      borderColor: selectedCategoryId === item.id ? item.color : colors.border,
                      borderWidth: selectedCategoryId === item.id ? 2 : 1,
                    },
                  ]}
                  onPress={() => handleSelectCategory(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemContent}>
                    <View
                      style={[styles.categoryDot, { backgroundColor: item.color }]}
                    />
                    <Text style={[styles.categoryName, { color: colors.text }]}>
                      {item.name}
                    </Text>
                  </View>
                  {selectedCategoryId === item.id && (
                    <Ionicons name="checkmark" size={24} color={item.color} />
                  )}
                </TouchableOpacity>
              )}
              ListHeaderComponent={
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    {
                      backgroundColor: colors.surfaceAlt,
                      borderColor: selectedCategoryId === null ? colors.primary : colors.border,
                      borderWidth: selectedCategoryId === null ? 2 : 1,
                    },
                  ]}
                  onPress={() => handleSelectCategory(null)}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemContent}>
                    <Ionicons name="layers-outline" size={20} color={colors.primary} />
                    <Text style={[styles.categoryName, { color: colors.primary }]}>
                      Todas las categorías
                    </Text>
                  </View>
                  {selectedCategoryId === null && (
                    <Ionicons name="checkmark" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              }
            />

            {/* Close Button */}
            <View style={[styles.footer, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: colors.primary }]}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.closeButtonText}>Aplicar filtro</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
    borderRadius: 12,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  closeButton: {
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
