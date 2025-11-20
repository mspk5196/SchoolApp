import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import styles from './FilterPopupStyle'; 
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const FilterPopup = ({ visible, onClose, onApply, initialFilters = {} }) => {
  const [gradeFilters, setGradeFilters] = useState(initialFilters.grades || []);
  const [typeFilters, setTypeFilters] = useState(initialFilters.types || []);
  const [statusFilters, setStatusFilters] = useState(initialFilters.statuses || []);
  const [blockFilters, setBlockFilters] = useState(initialFilters.blocks || []);
 
  useEffect(() => {
    if (visible) {
      setGradeFilters(initialFilters.grades || []);
      setTypeFilters(initialFilters.types || []);
      setStatusFilters(initialFilters.statuses || []);
      setBlockFilters(initialFilters.blocks || []);
    }
  }, [visible, initialFilters]);

  const toggleFilter = (filterType, value) => {
    const filterSetters = {
      grade: setGradeFilters,
      type: setTypeFilters,
      status: setStatusFilters,
      block: setBlockFilters
    };
    
    const currentFilters = {
      grade: gradeFilters,
      type: typeFilters,
      status: statusFilters,
      block: blockFilters
    };
    
    if (currentFilters[filterType].includes(value)) {
      filterSetters[filterType](currentFilters[filterType].filter(item => item !== value));
    } else {
      filterSetters[filterType]([...currentFilters[filterType], value]);
    }
  };

  const handleApply = () => {
    onApply({
      grades: gradeFilters,
      types: typeFilters,
      statuses: statusFilters,
      blocks: blockFilters
    });
    onClose();
  };

  const removeAllFilters = () => {
    setGradeFilters([]);
    setTypeFilters([]);
    setStatusFilters([]);
    setBlockFilters([]);
  };

  const CustomCheckbox = ({ checked, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.customCheckbox}>
      {checked ? <MaterialCommunityIcons name="checkbox-marked" size={24} color="black" /> : <MaterialCommunityIcons name="checkbox-blank-outline" size={24} color="black" />}
    </TouchableOpacity>
  );

  const renderFilterTags = () => {
    const allFilters = [
      ...gradeFilters.map(g => ({ type: 'grade', value: g })),
      ...typeFilters.map(t => ({ type: 'type', value: t })),
      ...statusFilters.map(s => ({ type: 'status', value: s })),
      ...blockFilters.map(b => ({ type: 'block', value: b }))
    ];

    if (allFilters.length === 0) return null;

    return (
      <View style={styles.filterTagsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {allFilters.map((filter, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.filterTag}
              onPress={() => toggleFilter(filter.type, filter.value)}
            >
              <Text style={styles.filterTagText}>{filter.value}</Text>
              <Text style={styles.removeTagIcon}>×</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filters</Text>
            <TouchableOpacity onPress={removeAllFilters}>
              <Text style={styles.removeFiltersText}>Remove filters</Text>
            </TouchableOpacity>
          </View>

          {renderFilterTags()}

          <ScrollView style={styles.scrollContent}>
            {/* Grade Filters */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Grade</Text>
              <View style={styles.checkboxRow}>
                {[1, 2, 3, 4, 5].map(grade => (
                  <View key={`grade-${grade}`} style={styles.checkboxItem}>
                    <CustomCheckbox
                      checked={gradeFilters.includes(grade.toString())}
                      onPress={() => toggleFilter('grade', grade.toString())}
                    />
                    <Text style={{color:'black'}}>{grade}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.checkboxRow}>
                {[6, 7, 8, 9, 10].map(grade => (
                  <View key={`grade-${grade}`} style={styles.checkboxItem}>
                    <CustomCheckbox
                      checked={gradeFilters.includes(grade.toString())}
                      onPress={() => toggleFilter('grade', grade.toString())}
                    />
                    <Text style={{color:'black'}}>{grade}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Type Filters */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Type</Text>
              <View style={styles.checkboxColumn}>
                {['Academic class', 'Laboratory', 'Library', 'Auditorium', 'Sports', 'Other'].map(type => (
                  <View key={`type-${type}`} style={styles.checkboxItem}>
                    <CustomCheckbox
                      checked={typeFilters.includes(type)}
                      onPress={() => toggleFilter('type', type)}
                    />
                    <Text style={{color:'black', marginLeft: 10}}>{type}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Status Filters */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Status</Text>
              <View style={styles.checkboxColumn}>
                {['Active', 'InActive'].map(status => (
                  <View key={`status-${status}`} style={styles.checkboxItem}>
                    <CustomCheckbox
                      checked={statusFilters.includes(status)}
                      onPress={() => toggleFilter('status', status)}
                    />
                    <Text style={{color:'black', marginLeft: 10}}>{status}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Block Filters */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Block</Text>
              <View style={styles.checkboxColumn}>
                {['A', 'B', 'C', 'D'].map(block => (
                  <View key={`block-${block}`} style={styles.checkboxItem}>
                    <CustomCheckbox
                      checked={blockFilters.includes(block)}
                      onPress={() => toggleFilter('block', block)}
                    />
                    <Text style={{color:'black', marginLeft: 10}}>Block {block}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply filter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default FilterPopup;