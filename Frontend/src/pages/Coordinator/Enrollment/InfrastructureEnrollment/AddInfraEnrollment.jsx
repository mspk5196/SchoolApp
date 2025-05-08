import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Alert, ActivityIndicator } from 'react-native';
import BackIcon from '../../../../assets/CoordinatorPage/InfrastructureEnrollment/Back.svg';
import CheckboxOff from '../../../../assets/CoordinatorPage/InfrastructureEnrollment/CheckBoxOff.svg';
import CheckboxON from '../../../../assets/CoordinatorPage/InfrastructureEnrollment/CheckBoxOn.svg';
import styles from './AddInfraEnrollmentStyle';
import { API_URL } from '@env';


const AddInfraEnrollment = ({ navigation, route }) => {
  const editVenue = route.params?.venue;
  const isEditing = !!editVenue;
  const [loading, setLoading] = useState(false);

  const [grades, setGrades] = useState([]);
  const [subjects, setSubject] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const types = ['Academic class', 'Laboratory', 'Library', 'Auditorium', 'Sports', 'Other'];

  const [gradeModalVisible, setGradeModalVisible] = useState(false);
  const [subjectModalVisible, setSubjectModalVisible] = useState(false);
  const [blockModalVisible, setBlockModalVisible] = useState(false);
  const [typeModalVisible, setTypeModalVisible] = useState(false);

  // Store selected grades as an array of ids
  const [selectedGrades, setSelectedGrades] = useState(
    isEditing && editVenue.grades ? editVenue.grades.map(g => g.id) : []
  );

  const [formData, setFormData] = useState({
    name: isEditing ? editVenue.name : '',
    block: isEditing ? editVenue.block : 'A',
    floor: isEditing ? editVenue.floor.toString() : '',
    capacity: isEditing ? editVenue.capacity.toString() : '',
    subject: isEditing ? editVenue.subject : '',
    type: isEditing ? editVenue.type : 'Academic class',
    status: isEditing ? editVenue.status : 'Active'
  });

  const [showFormData, setShowFormData] = useState({
    name: isEditing ? editVenue.name : '',
    block: isEditing ? editVenue.block : 'A',
    floor: isEditing ? editVenue.floor.toString() : '',
    capacity: isEditing ? editVenue.capacity.toString() : '',
    gradeNames: isEditing && editVenue.grades ? editVenue.grades.map(g => g.grade_name).join(', ') : '',
    subject: isEditing && editVenue.subject_name ? editVenue.subject_name : '',
    type: isEditing ? editVenue.type : 'Academic class',
    status: isEditing ? editVenue.status : 'Active'
  });

  useEffect(() => {
    fetchGrades();
    fetchSubject();
    fetchBlock();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/enrollment/getGrades`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

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
      const response = await fetch(`${API_URL}/api/coordinator/enrollment/getSubjects`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (data.success) {
        setSubject(data.subjects);
      }
    } catch (error) {
      console.error('Error fetching subject titles:', error);
    }
  };

  const fetchBlock = async () => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/enrollment/getBlocks`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
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

  const toggleGradeSelection = (gradeId, gradeName) => {
    setSelectedGrades(prevSelectedGrades => {
      // Check if grade is already selected
      if (prevSelectedGrades.includes(gradeId)) {
        // Remove grade if already selected
        const newSelectedGrades = prevSelectedGrades.filter(id => id !== gradeId);

        // Update displayed grade names
        const selectedGradeNames = grades
          .filter(grade => newSelectedGrades.includes(grade.id))
          .map(grade => grade.grade_name)
          .join(', ');

        handleChangeDisplay('gradeNames', selectedGradeNames);

        return newSelectedGrades;
      } else {
        // Add grade if not already selected
        const newSelectedGrades = [...prevSelectedGrades, gradeId];

        // Update displayed grade names
        const selectedGradeNames = grades
          .filter(grade => newSelectedGrades.includes(grade.id))
          .map(grade => grade.grade_name)
          .join(', ');

        handleChangeDisplay('gradeNames', selectedGradeNames);

        return newSelectedGrades;
      }
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.floor || !formData.capacity) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const venueData = {
      name: formData.name,
      block: formData.block,
      floor: parseInt(formData.floor, 10),
      capacity: parseInt(formData.capacity, 10),
      grade_ids: selectedGrades.length > 0 ? selectedGrades : [],
      subject_id: formData.subject ? parseInt(formData.subject, 10) : null,
      type: formData.type,
      status: formData.status
    };

    try {
      setLoading(true);
      let response;

      if (isEditing) {
        response = await fetch(`${API_URL}/api/coordinator/enrollment/updateVenue/${editVenue.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(venueData)
        });
      } else {
        response = await fetch(`${API_URL}/api/coordinator/enrollment/createVenue`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(venueData)
        });
      }

      const responseData = await response.json();

      if (response.ok) {
        navigation.goBack();
      } else {
        throw new Error(responseData.message || 'Failed to save venue');
      }
    } catch (error) {
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
                style={styles.modalItem}
                onPress={() => {
                  handleChange('block', block.block_name);
                  handleChangeDisplay('block', block.block_name);
                  setBlockModalVisible(false);
                }}
              >
                <Text style={styles.modalItemText}>Block {block.block_name}</Text>
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

  const SubjectSelectionModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={subjectModalVisible}
      onRequestClose={() => setSubjectModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Subject</Text>
          <ScrollView style={styles.modalScrollView}>
            {subjects.map((subject) => (
              <TouchableOpacity
                key={subject.id}
                style={styles.modalItem}
                onPress={() => {
                  handleChange('subject', subject.id);
                  handleChangeDisplay('subject', subject.subject_name);
                  setSubjectModalVisible(false);
                }}
              >
                <Text style={styles.modalItemText}>{subject.subject_name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSubjectModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Updated grade selection modal with checkboxes
  const GradeSelectionModal = React.memo(({
    visible,
    onClose,
    grades,
    selectedGrades,
    toggleGradeSelection
  }) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Grades</Text>
          <ScrollView style={styles.modalScrollView}>
            {grades.map((grade) => (
              <TouchableOpacity
                key={grade.id}
                style={styles.checkboxItem}
                onPress={() => toggleGradeSelection(grade.id, grade.grade_name)}
              >
                <View style={styles.checkboxContainer}>
                  {selectedGrades.includes(grade.id) ? (
                    <CheckboxON width={20} height={20} />
                  ) : (
                    <CheckboxOff width={20} height={20} />
                  )}
                  <Text style={styles.modalItemText}>{grade.grade_name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Done</Text>
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
          <BackIcon width={20} height={20} />
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
              <Text style={styles.inputText}>
                Block {showFormData.block}
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

          {/* Multiple Grades */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Grades</Text>
            <TouchableOpacity
              style={[styles.input, styles.pickerInput]}
              onPress={() => setGradeModalVisible(true)}
            >
              <Text style={selectedGrades.length > 0 ? styles.inputText : styles.placeholderText}>
                {showFormData.gradeNames || 'Select grades'}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
            <GradeSelectionModal
              visible={gradeModalVisible}
              onClose={() => setGradeModalVisible(false)}
              grades={grades}
              selectedGrades={selectedGrades}
              toggleGradeSelection={toggleGradeSelection}
            />
          </View>

          {/* Subject */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Subject</Text>
            <TouchableOpacity
              style={[styles.input, styles.pickerInput]}
              onPress={() => setSubjectModalVisible(true)}
            >
              <Text style={formData.subject ? styles.inputText : styles.placeholderText}>
                {showFormData.subject || 'Select Subject'}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
            <SubjectSelectionModal />
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