// FilterPopup.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import CloseIcon from '../../../assets/InfrastructureEnrollment/Close.svg'
import CheckboxOffIcon from '../../../assets/InfrastructureEnrollment/CheckBoxOff.svg'
import CheckboxOnIcon from '../../../assets/InfrastructureEnrollment/CheckBoxOn.svg'
import styles from './FilterPopupStyle'; 

const FilterPopup = ({ visible, onClose, onApply, initialFilters = {} }) => {
  // Filter states
  const [gradeFilters, setGradeFilters] = useState(initialFilters.grades || []);
  const [typeFilters, setTypeFilters] = useState(initialFilters.types || []);
  const [statusFilters, setStatusFilters] = useState(initialFilters.statuses || []);
  const [blockFilters, setBlockFilters] = useState(initialFilters.blocks || []);

  // Reset filters when modal becomes visible with initialFilters
  useEffect(() => {
    if (visible) {
      setGradeFilters(initialFilters.grades || []);
      setTypeFilters(initialFilters.types || []);
      setStatusFilters(initialFilters.statuses || []);
      setBlockFilters(initialFilters.blocks || []);
    }
  }, [visible, initialFilters]);

  // Handle checkbox changes
  const toggleGrade = (grade) => {
    if (gradeFilters.includes(grade)) {
      setGradeFilters(gradeFilters.filter(g => g !== grade));
    } else {
      setGradeFilters([...gradeFilters, grade]);
    }
  };

  const toggleType = (type) => {
    if (typeFilters.includes(type)) {
      setTypeFilters(typeFilters.filter(t => t !== type));
    } else {
      setTypeFilters([...typeFilters, type]);
    }
  };

  const toggleStatus = (status) => {
    if (statusFilters.includes(status)) {
      setStatusFilters(statusFilters.filter(s => s !== status));
    } else {
      setStatusFilters([...statusFilters, status]);
    }
  };

  const toggleBlock = (block) => {
    if (blockFilters.includes(block)) {
      setBlockFilters(blockFilters.filter(b => b !== block));
    } else {
      setBlockFilters([...blockFilters, block]);
    }
  };

  // Apply filters
  const handleApply = () => {
    onApply({
      grades: gradeFilters,
      types: typeFilters,
      statuses: statusFilters,
      blocks: blockFilters
    });
    onClose();
  };

  // Remove a single filter tag
  const removeFilter = (type, value) => {
    switch (type) {
      case 'grade':
        setGradeFilters(gradeFilters.filter(g => g !== value));
        break;
      case 'type':
        setTypeFilters(typeFilters.filter(t => t !== value));
        break;
      case 'status':
        setStatusFilters(statusFilters.filter(s => s !== status));
        break;
      case 'block':
        setBlockFilters(blockFilters.filter(b => b !== value));
        break;
      default:
        break;
    }
  };

  // Remove all filters
  const removeAllFilters = () => {
    setGradeFilters([]);
    setTypeFilters([]);
    setStatusFilters([]);
    setBlockFilters([]);
  };

  // Custom checkbox component using the SVG icons
  const CustomCheckbox = ({ checked, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.customCheckbox}>
      {checked ? <CheckboxOnIcon /> : <CheckboxOffIcon />}
    </TouchableOpacity>
  );

  // Selected filters display
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
              onPress={() => removeFilter(filter.type, filter.value)}
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filters</Text>
            <TouchableOpacity onPress={removeAllFilters}>
              <Text style={styles.removeFiltersText}>Remove filters</Text>
            </TouchableOpacity>
          </View>

          {/* Selected filter tags */}
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
                      onPress={() => toggleGrade(grade.toString())}
                    />
                    <Text>{grade}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.checkboxRow}>
                {[6, 7, 8, 9, 10].map(grade => (
                  <View key={`grade-${grade}`} style={styles.checkboxItem}>
                    <CustomCheckbox
                      checked={gradeFilters.includes(grade.toString())}
                      onPress={() => toggleGrade(grade.toString())}
                    />
                    <Text>{grade}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Type Filters */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Type</Text>
              <View style={styles.checkboxColumn}>
                <View style={styles.checkboxItem}>
                  <CustomCheckbox
                    checked={typeFilters.includes("Academic class")}
                    onPress={() => toggleType("Academic class")}
                  />
                  <Text>Academic class</Text>
                </View>
                <View style={styles.checkboxItem}>
                  <CustomCheckbox
                    checked={typeFilters.includes("Laboratory")}
                    onPress={() => toggleType("Laboratory")}
                  />
                  <Text>Laboratory</Text>
                </View>
              </View>
            </View>

            {/* Status Filters */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Status</Text>
              <View style={styles.checkboxColumn}>
                <View style={styles.checkboxItem}>
                  <CustomCheckbox
                    checked={statusFilters.includes("Active")}
                    onPress={() => toggleStatus("Active")}
                  />
                  <Text>Active</Text>
                </View>
                <View style={styles.checkboxItem}>
                  <CustomCheckbox
                    checked={statusFilters.includes("InActive")}
                    onPress={() => toggleStatus("InActive")}
                  />
                  <Text>InActive</Text>
                </View>
              </View>
            </View>

            {/* Block Filters */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Block</Text>
              <View style={styles.checkboxColumn}>
                <View style={styles.checkboxItem}>
                  <CustomCheckbox
                    checked={blockFilters.includes("A")}
                    onPress={() => toggleBlock("A")}
                  />
                  <Text>Block A</Text>
                </View>
                <View style={styles.checkboxItem}>
                  <CustomCheckbox
                    checked={blockFilters.includes("B")}
                    onPress={() => toggleBlock("B")}
                  />
                  <Text>Block B</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Apply Button */}
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply filter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default FilterPopup;