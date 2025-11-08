import React from 'react';
import { FlatList, View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const HorizontalChipSelector = ({ 
  data, 
  selectedItem, 
  onSelectItem, 
  idKey = 'id', 
  nameKey = 'name',
  containerStyle,
  chipStyle,
  chipSelectedStyle,
  textStyle,
  textSelectedStyle,
}) => {
  const renderItem = ({ item }) => {
    const isSelected = selectedItem?.[idKey] === item[idKey];
    
    return (
      <TouchableOpacity
        style={[
          styles.chip,
          chipStyle,
          isSelected && styles.chipSelected,
          isSelected && chipSelectedStyle,
        ]}
        onPress={() => onSelectItem(item)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.chipText,
          textStyle,
          isSelected && styles.chipTextSelected,
          isSelected && textSelectedStyle,
        ]}>
          {item[nameKey]}
        </Text>
      </TouchableOpacity>
    );
  };

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item[idKey].toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  contentContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginRight: 10,
  },
  chipSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
});

export default HorizontalChipSelector;
