// AddConceptGraph.jsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView
} from 'react-native';
import BackIcon from '../../../assets/GeneralAssests/backarrow.svg';
import styles from './AddConceptGraphStyle';

const AddConceptGraph = ({ navigation, route }) => {
  // Check if we're editing an existing concept
  const editingConcept = route.params?.concept;
  const isEditing = !!editingConcept;
  
  const [formData, setFormData] = useState({
    conceptName: editingConcept?.title || '',
    targetMonths: editingConcept?.month?.split(' ')[0] || '3',
    conceptType: editingConcept?.difficulty || ''
  });

  // For modal dropdowns visibility
  const [showTypeModal, setShowTypeModal] = useState(false);

  const conceptTypes = ["Easy", "Hard"];

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleAddConcept = () => {
    // Create concept object
    const newConcept = {
      id: editingConcept?.id || Date.now(),
      title: formData.conceptName,
      difficulty: formData.conceptType,
      month: `${formData.targetMonths} Month`,
      endsIn: editingConcept?.endsIn || '2 weeks', // Default value, could be calculated
      endsInColor: editingConcept?.endsInColor || 'blue',
      status: editingConcept?.status || 'Active'
    };

    // Navigate back with the new/updated concept
    navigation.navigate('ConceptGraph', { 
      newConcept,
      isEditing: isEditing
    });
  };

  // Concept Type selection modal
  const ConceptTypeModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showTypeModal}
      onRequestClose={() => setShowTypeModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Concept Type</Text>
          <ScrollView style={styles.modalScrollView}>
            {conceptTypes.map((type, index) => (
              <TouchableOpacity
                key={index}
                style={styles.modalItem}
                onPress={() => {
                  handleInputChange('conceptType', type);
                  setShowTypeModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowTypeModal(false)}
          >
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackIcon 
          width={19}
          height={17}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerText}>
          {isEditing ? 'Edit Concept' : 'Add Concept Graph'}
        </Text>
      </View>

      <ScrollView style={styles.formContainer}>
        {/* Concept Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Concept name</Text>
          <TextInput
            style={styles.textInput}
            value={formData.conceptName}
            onChangeText={(text) => handleInputChange('conceptName', text)}
            placeholder="Punctuation"
          />
        </View>

        {/* Target Months */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Target Months</Text>
          <TextInput
            style={styles.textInput}
            value={formData.targetMonths}
            onChangeText={(text) => handleInputChange('targetMonths', text)}
            placeholder="03"
            keyboardType="numeric"
          />
        </View>

        {/* Concept Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Concept type</Text>
          <TouchableOpacity 
            style={styles.pickerButton}
            onPress={() => setShowTypeModal(true)}
          >
            <Text style={formData.conceptType ? styles.pickerSelectedText : styles.placeholderText}>
              {formData.conceptType || "Select concept type"}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
          <ConceptTypeModal />
        </View>
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddConcept}
      >
        <Text style={styles.addButtonText}>
          {isEditing ? 'Update Concept' : 'Add Concept'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default AddConceptGraph;