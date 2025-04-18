import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import BackIcon from '../../../assets/InfrastructureEnrollment/Back.svg';
import styles from './AddInfraEnrollmentStyle'; 

const AddInfraEnrollment = ({ navigation, route }) => {
  // Check if we're editing an existing classroom
  const editClassroom = route.params?.classroom;
  const isEditing = !!editClassroom;

  // Available grades and subjects
  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const subjects = ['General', 'Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Library', 'Art', 'Music'];
  const blocks = ['A', 'B', 'C', 'D']; // Added more blocks for flexibility

  // Modal states for dropdowns
  const [gradeModalVisible, setGradeModalVisible] = useState(false);
  const [subjectModalVisible, setSubjectModalVisible] = useState(false);
  const [blockModalVisible, setBlockModalVisible] = useState(false);

  // Initial state based on whether we're editing or creating
  const [formData, setFormData] = useState({
    name: isEditing ? editClassroom.name : '',
    block: isEditing ? (editClassroom.block || 'A') : 'A',
    floor: isEditing ? editClassroom.floor.toString() : '',
    capacity: isEditing ? editClassroom.capacity.toString() : '',
    grade: isEditing ? editClassroom.grade : '',
    subject: isEditing ? (editClassroom.subject || '') : '',
    status: isEditing ? editClassroom.status : 'Active'
  });

  // Handle text input changes
  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Handle form submission
  const handleSubmit = () => {
    // Validate form data
    if (!formData.name || !formData.floor || !formData.capacity) {
      alert('Please fill all required fields');
      return;
    }

    // Create classroom object
    const classroom = {
      name: formData.name,
      block: formData.block,
      floor: parseInt(formData.floor, 10),
      capacity: parseInt(formData.capacity, 10),
      grade: formData.grade,
      subject: formData.subject,
      status: formData.status,
      date: new Date().toLocaleDateString('en-GB') // Format: DD/MM/YYYY
    };

    // Pass the data back to the main screen
    navigation.navigate('InfrastructureEnrollment', { 
      newClassroom: classroom,
      isEditing: isEditing,
      classroomId: isEditing ? editClassroom.id : Date.now().toString() // Add unique ID for tracking
    });
  };

  // Block selection modal
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
                key={block}
                style={styles.modalItem}
                onPress={() => {
                  handleChange('block', block);
                  setBlockModalVisible(false);
                }}
              >
                <Text style={styles.modalItemText}>Block {block}</Text>
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

  // Grade selection modal
  const GradeSelectionModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={gradeModalVisible}
      onRequestClose={() => setGradeModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Grade</Text>
          <ScrollView style={styles.modalScrollView}>
            {grades.map((grade) => (
              <TouchableOpacity
                key={grade}
                style={styles.modalItem}
                onPress={() => {
                  handleChange('grade', grade);
                  setGradeModalVisible(false);
                }}
              >
                <Text style={styles.modalItemText}>{grade}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                handleChange('grade', grades.join(','));
                setGradeModalVisible(false);
              }}
            >
              <Text style={styles.modalItemText}>All Grades</Text>
            </TouchableOpacity>
          </ScrollView>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setGradeModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Subject selection modal
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
                key={subject}
                style={styles.modalItem}
                onPress={() => {
                  handleChange('subject', subject);
                  setSubjectModalVisible(false);
                }}
              >
                <Text style={styles.modalItemText}>{subject}</Text>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon width={20} height={20} />
        </TouchableOpacity>
        <Text style={styles.headerText}>
          {isEditing ? 'Edit Venue' : 'Infra Enrollment'}
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
              onChangeText={(text) => handleChange('name', text)}
            />
          </View>

          {/* Block - Changed to use Modal */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Block*</Text>
            <TouchableOpacity 
              style={[styles.input, styles.pickerInput]}
              onPress={() => setBlockModalVisible(true)}
            >
              <Text style={styles.inputText}>
                Block {formData.block}
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
              keyboardType="numeric"
              onChangeText={(text) => handleChange('capacity', text)}
            />
          </View>

          {/* Grade */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Grade</Text>
            <TouchableOpacity 
              style={[styles.input, styles.pickerInput]}
              onPress={() => setGradeModalVisible(true)}
            >
              <Text style={formData.grade ? styles.inputText : styles.placeholderText}>
                {formData.grade || 'Select grade'}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
            <GradeSelectionModal />
          </View>

          {/* Subject */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Subject</Text>
            <TouchableOpacity 
              style={[styles.input, styles.pickerInput]}
              onPress={() => setSubjectModalVisible(true)}
            >
              <Text style={formData.subject ? styles.inputText : styles.placeholderText}>
                {formData.subject || 'Select Subject'}
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
                  {color: formData.status === 'Active' ? '#34C300' : '#F44336'}
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
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>
            {isEditing ? 'Update Venue' : 'Enroll Venue'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddInfraEnrollment;