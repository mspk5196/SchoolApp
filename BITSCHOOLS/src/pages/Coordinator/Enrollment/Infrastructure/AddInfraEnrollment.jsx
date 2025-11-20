import { apiFetch } from "../../../../utils/apiClient.js";
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Alert, ActivityIndicator } from 'react-native';
import styles from './AddInfraEnrollmentStyle';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const AddInfraEnrollment = ({ navigation, route }) => {
  const editVenue = route.params?.venue;
  const isEdit = route.params?.isEdit;
  const phoneNo = route.params?.phone;
  const isEditing = isEdit || !!editVenue;
  const [loading, setLoading] = useState(false);

  const [grades, setGrades] = useState([]);
  const [subjects, setSubject] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const types = ['Academic class', 'Laboratory', 'Library', 'Auditorium', 'Sports', 'Other'];

  const [gradeModalVisible, setGradeModalVisible] = useState(false);
  const [subjectModalVisible, setSubjectModalVisible] = useState(false);
  const [blockModalVisible, setBlockModalVisible] = useState(false);
  const [typeModalVisible, setTypeModalVisible] = useState(false);

  // Single grade selection initialization
  const [selectedGrade, setSelectedGrade] = useState(() => {
    if (isEditing && editVenue) {
      // If grades array exists (multiple grades) - take first one
      if (editVenue.grades && Array.isArray(editVenue.grades)) {
        return editVenue.grades[0]?.id || editVenue.grades[0] || null;
      }
      // If single grade_id exists
      if (editVenue.grade_id) {
        return editVenue.grade_id;
      }
    }
    return null;
  });

  // Block selection initialization
  const [selectedBlock, setSelectedBlock] = useState(() => {
    if (isEditing && editVenue) {
      // If block_id exists, use it; otherwise try to find block by name
      return editVenue.block_id || null;
    }
    return null;
  });

  // Add state for multiple subject selection
  const [selectedSubjects, setSelectedSubjects] = useState(() => {
    if (isEditing && editVenue) {
      // If subjects array exists (multiple subjects)
      if (editVenue.subjects && Array.isArray(editVenue.subjects)) {
        return editVenue.subjects.map(s => s.id || s);
      }
      // If single subject_id exists
      if (editVenue.subject_id) {
        return [editVenue.subject_id];
      }
    }
    return [];
  });

  const [formData, setFormData] = useState({
    name: isEditing && editVenue ? editVenue.name : '',
    floor: isEditing && editVenue ? editVenue.floor.toString() : '',
    capacity: isEditing && editVenue ? editVenue.capacity.toString() : '',
    type: isEditing && editVenue ? editVenue.type : 'Academic class',
    status: isEditing && editVenue ? editVenue.status : 'Active'
  });

  const [showFormData, setShowFormData] = useState({
    name: isEditing && editVenue ? editVenue.name : '',
    blockName: isEditing && editVenue ? editVenue.block : '',
    floor: isEditing && editVenue ? editVenue.floor.toString() : '',
    capacity: isEditing && editVenue ? editVenue.capacity.toString() : '',
    gradeName: '',
    subjectNames: '',
    type: isEditing && editVenue ? editVenue.type : 'Academic class',
    status: isEditing && editVenue ? editVenue.status : 'Active'
  });

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchGrades(), fetchSubject(), fetchBlock()]);
      
      // After loading options, set edit data if editing
      if (isEditing && editVenue) {
        loadEditData();
      }
    };
    
    loadData();
  }, []);

  // Load edit data after options are fetched
  const loadEditData = () => {
    // Set grade name for display
    if (selectedGrade && grades.length > 0) {
      const grade = grades.find(g => g.id === selectedGrade);
      if (grade) {
        handleChangeDisplay('gradeName', grade.grade_name);
      }
    }
    
    // Set block name for display
    if (selectedBlock && blocks.length > 0) {
      const block = blocks.find(b => b.id === selectedBlock);
      if (block) {
        handleChangeDisplay('blockName', block.block_name);
      }
    } else if (isEditing && editVenue && editVenue.block && blocks.length > 0) {
      // Try to find block by name if block_id not available
      const block = blocks.find(b => b.block_name === editVenue.block);
      if (block) {
        setSelectedBlock(block.id);
        handleChangeDisplay('blockName', block.block_name);
      }
    }
    
    // Set subject names for display
    if (selectedSubjects.length > 0 && subjects.length > 0) {
      const selectedSubjectNames = subjects
        .filter(subject => selectedSubjects.includes(subject.id))
        .map(subject => subject.subject_name)
        .join(', ');
      handleChangeDisplay('subjectNames', selectedSubjectNames);
    }
  };

  // Re-run loadEditData when grades, blocks, or subjects are loaded
  useEffect(() => {
    if (isEditing && editVenue && (grades.length > 0 || blocks.length > 0 || subjects.length > 0)) {
      loadEditData();
    }
  }, [grades, blocks, subjects, isEditing]);

  const fetchGrades = async () => {
    try {
      const response = await apiFetch(`/coordinator/enrollment/getGrades`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = response

      if (data.success) {
        setGrades(data.grades);
      } else {
        Alert.alert('No Grades Found', 'No grade is associated');
      }
    } catch (error) {
      console.error('Error fetching grades data:', error);
      Alert.alert('Error', 'Failed to fetch grades data');
    }
  };

  const fetchSubject = async () => {
    try {
      const response = await apiFetch(`/coordinator/enrollment/getSubjects`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = response
      if (data.success) {
        setSubject(data.subjects);
      }
    } catch (error) {
      console.error('Error fetching subject titles:', error);
    }
  };

  const fetchBlock = async () => {
    try {
      const response = await apiFetch(`/coordinator/enrollment/getBlocks`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = response
      if (data.success) {
        setBlocks(data.blocks);
      }
    } catch (error) {
      console.error('Error fetching blocks:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleChangeDisplay = (field, value) => {
    setShowFormData({
      ...showFormData,
      [field]: value
    });
  };

  const selectGrade = (gradeId, gradeName) => {
    setSelectedGrade(gradeId);
    handleChangeDisplay('gradeName', gradeName);
  };

  const toggleSubjectSelection = (subjectId, subjectName) => {
    setSelectedSubjects(prevSelectedSubjects => {
      // Check if subject is already selected
      if (prevSelectedSubjects.includes(subjectId)) {
        // Remove subject if already selected
        const newSelectedSubjects = prevSelectedSubjects.filter(id => id !== subjectId);

        // Update displayed subject names
        const selectedSubjectNames = subjects
          .filter(subject => newSelectedSubjects.includes(subject.id))
          .map(subject => subject.subject_name)
          .join(', ');

        handleChangeDisplay('subjectNames', selectedSubjectNames);

        return newSelectedSubjects;
      } else {
        // Add subject if not already selected
        const newSelectedSubjects = [...prevSelectedSubjects, subjectId];

        // Update displayed subject names
        const selectedSubjectNames = subjects
          .filter(subject => newSelectedSubjects.includes(subject.id))
          .map(subject => subject.subject_name)
          .join(', ');

        handleChangeDisplay('subjectNames', selectedSubjectNames);

        return newSelectedSubjects;
      }
    });
  };

  const handleSubmit = async () => {
    // Better validation
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Venue name is required');
      return;
    }
    
    if (!selectedBlock) {
      Alert.alert('Error', 'Block is required');
      return;
    }
    
    if (!formData.floor || isNaN(parseInt(formData.floor))) {
      Alert.alert('Error', 'Valid floor number is required');
      return;
    }
    
    if (!formData.capacity || isNaN(parseInt(formData.capacity))) {
      Alert.alert('Error', 'Valid capacity is required');
      return;
    }

    // Prepare data differently for create vs update
    const venueData = {
      name: formData.name.trim(),
      block_id: selectedBlock,
      floor: parseInt(formData.floor, 10),
      capacity: parseInt(formData.capacity, 10),
      type: formData.type,
      status: formData.status,
      created_by: phoneNo || '9876543201'
    };

    // Add single grade if selected
    if (selectedGrade) {
      venueData.grade_id = selectedGrade;
    }

    // Add multiple subjects if selected
    if (selectedSubjects.length > 0) {
      if (isEditing) {
        venueData.subjects = selectedSubjects;
      } else {
        venueData.subject_ids = selectedSubjects;
      }
    }

    console.log('Submitting venue data:', venueData); // Debug log

    try {
      setLoading(true);
      let response;

      if (isEditing) {
        response = await apiFetch(`/coordinator/enrollment/updateVenue/${editVenue.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(venueData)
        });
      } else {
        response = await apiFetch(`/coordinator/enrollment/createVenue`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(venueData)
        });
      }

      const responseData = response;
      console.log('Server response:', responseData); // Debug log

      if (response) {
        Alert.alert('Success', isEditing ? 'Venue updated successfully' : 'Venue added successfully');
        navigation.goBack();
      } else {
        throw new Error(responseData.message || 'Failed to save venue');
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Selection Modals
  const BlockSelectionModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={blockModalVisible}
      onRequestClose={() => setBlockModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Block</Text>
          <ScrollView style={styles.modalScrollView}>
            {blocks.map((block) => (
              <TouchableOpacity
                key={block.id}
                style={[
                  styles.modalItem,
                  selectedBlock === block.id && styles.modalItemSelected
                ]}
                onPress={() => {
                  setSelectedBlock(block.id);
                  handleChangeDisplay('blockName', block.block_name);
                  setBlockModalVisible(false);
                }}
              >
                <Text style={[
                  styles.modalItemText,
                  selectedBlock === block.id && { color: '#3557FF', fontWeight: '600' }
                ]}>
                  Block {block.block_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setBlockModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const TypeSelectionModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={typeModalVisible}
      onRequestClose={() => setTypeModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Type</Text>
          <ScrollView style={styles.modalScrollView}>
            {types.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.modalItem}
                onPress={() => {
                  handleChange('type', type);
                  handleChangeDisplay('type', type);
                  setTypeModalVisible(false);
                }}
              >
                <Text style={styles.modalItemText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setTypeModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const SubjectSelectionModal = React.memo(({
    visible,
    onClose,
    subjects,
    selectedSubjects,
    toggleSubjectSelection
  }) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Subjects</Text>
          <Text style={[styles.modalItemText, { textAlign: 'center', fontSize: 14, color: '#666', marginBottom: 16 }]}>
            Choose multiple subjects for this venue
          </Text>
          <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
            {subjects.map((subject) => {
              const isSelected = selectedSubjects.includes(subject.id);
              return (
                <TouchableOpacity
                  key={subject.id}
                  style={[
                    styles.checkboxItem,
                    isSelected && styles.modalItemSelected
                  ]}
                  onPress={() => {
                    // Only call toggleSubjectSelection, don't close modal
                    toggleSubjectSelection(subject.id, subject.subject_name);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.checkboxContainer}>
                    {isSelected ? (
                      <MaterialCommunityIcons name="checkbox-marked" color="#000" size={24} />
                    ) : (
                      <MaterialCommunityIcons name="checkbox-blank-outline" color="#000" size={24} />
                    )}
                    <Text style={[
                      styles.modalItemText,
                      isSelected && { color: '#3557FF', fontWeight: '600' }
                    ]}>
                      {subject.subject_name}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
            <Text style={[styles.modalItemText, { fontSize: 14, color: '#666' }]}>
              {selectedSubjects.length} selected
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  ));

  // Single grade selection modal
  const GradeSelectionModal = React.memo(({
    visible,
    onClose,
    grades,
    selectedGrade,
    selectGrade
  }) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Grade</Text>
          <Text style={[styles.modalItemText, { textAlign: 'center', fontSize: 14, color: '#666', marginBottom: 16 }]}>
            Choose a grade for this venue
          </Text>
          <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
            {grades.map((grade) => {
              const isSelected = selectedGrade === grade.id;
              return (
                <TouchableOpacity
                  key={grade.id}
                  style={[
                    styles.modalItem,
                    isSelected && styles.modalItemSelected
                  ]}
                  onPress={() => {
                    selectGrade(grade.id, grade.grade_name);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.modalItemText,
                    isSelected && { color: '#3557FF', fontWeight: '600' }
                  ]}>
                    {grade.grade_name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  ));

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>
          {isEditing ? 'Edit Venue' : 'Add New Venue'}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formContainer}>
          {/* Venue Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Venue name*</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Science Lab"
              value={formData.name}
              placeholderTextColor='grey'
              onChangeText={(text) => handleChange('name', text)}
            />
          </View>

          {/* Block */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Block*</Text>
            <TouchableOpacity
              style={[styles.input, styles.pickerInput]}
              onPress={() => setBlockModalVisible(true)}
            >
              <Text style={selectedBlock ? styles.inputText : styles.placeholderText}>
                {showFormData.blockName ? `Block ${showFormData.blockName}` : 'Select block'}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
            <BlockSelectionModal />
          </View>

          {/* Floor */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Floor*</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 1"
              value={formData.floor}
              placeholderTextColor='grey'
              keyboardType="numeric"
              onChangeText={(text) => handleChange('floor', text)}
            />
          </View>

          {/* Capacity */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Capacity*</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 30"
              value={formData.capacity}
              placeholderTextColor='grey'
              keyboardType="numeric"
              onChangeText={(text) => handleChange('capacity', text)}
            />
          </View>

          {/* Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Type*</Text>
            <TouchableOpacity
              style={[styles.input, styles.pickerInput]}
              onPress={() => setTypeModalVisible(true)}
            >
              <Text style={styles.inputText}>
                {showFormData.type}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
            <TypeSelectionModal />
          </View>

          {/* Grade */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Grade</Text>
            <TouchableOpacity
              style={[styles.input, styles.pickerInput]}
              onPress={() => setGradeModalVisible(true)}
            >
              <Text style={selectedGrade ? styles.inputText : styles.placeholderText}>
                {showFormData.gradeName || 'Select grade'}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
            <GradeSelectionModal
              visible={gradeModalVisible}
              onClose={() => setGradeModalVisible(false)}
              grades={grades}
              selectedGrade={selectedGrade}
              selectGrade={selectGrade}
            />
          </View>

          {/* Subjects */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Subjects</Text>
            <TouchableOpacity
              style={[styles.input, styles.pickerInput]}
              onPress={() => setSubjectModalVisible(true)}
            >
              <Text style={selectedSubjects.length > 0 ? styles.inputText : styles.placeholderText}>
                {showFormData.subjectNames || 'Select subjects'}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
            {selectedSubjects.length > 0 && (
              <View style={styles.selectedGradesContainer}>
                {subjects
                  .filter(subject => selectedSubjects.includes(subject.id))
                  .map(subject => (
                    <View key={subject.id} style={styles.selectedGradeTag}>
                      <Text style={styles.selectedGradeText}>{subject.subject_name}</Text>
                    </View>
                  ))}
              </View>
            )}
            <SubjectSelectionModal
              visible={subjectModalVisible}
              onClose={() => setSubjectModalVisible(false)}
              subjects={subjects}
              selectedSubjects={selectedSubjects}
              toggleSubjectSelection={toggleSubjectSelection}
            />
          </View>

          {/* Status - only show when editing */}
          {isEditing && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Status</Text>
              <TouchableOpacity
                style={[styles.input, styles.pickerInput]}
                onPress={() => {
                  const newStatus = formData.status === 'Active' ? 'InActive' : 'Active';
                  handleChange('status', newStatus);
                }}
              >
                <Text style={[
                  styles.inputText,
                  { color: formData.status === 'Active' ? '#34C300' : '#F44336' }
                ]}>
                  {formData.status}
                </Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {isEditing ? 'Update Venue' : 'Add Venue'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddInfraEnrollment;