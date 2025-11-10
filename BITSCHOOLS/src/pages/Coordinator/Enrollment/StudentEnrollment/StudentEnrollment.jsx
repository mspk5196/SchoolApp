import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, Modal, KeyboardAvoidingView, Platform, StatusBar, PermissionsAndroid } from 'react-native';
import * as DocumentPicker from '@react-native-documents/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles from './stuEnmtSty.jsx';
import ApiService from "../../../../utils/ApiService.js";
import Header from '../../../../components/General/Header';

const StudentEnrollment = ({ navigation }) => {
  const [student, setStudent] = useState({
    name: '',
    dob: '',
    roll: '',
    gender: '',
    email: '',
    mobileNumber: '',
    photoUrl: '',
    fatherName: '',
    fatherMobile: '',
    gradeId: null,
    sectionId: null,
    academicYear: new Date().getFullYear(),
  });

  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);

  const genderOptions = ['Male', 'Female', 'Other'];

  const handleChange = (field, value) => {
    setStudent({ ...student, [field]: value });
    if (value !== null && value !== undefined && value.toString().trim() !== '') {
      setErrors({ ...errors, [field]: null });
    }
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  // Normalize various DOB inputs to YYYY-MM-DD. If unable to normalize, returns original value.
  const normalizeDob = (val) => {
    if (!val) return val;
    // already in correct format
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    // Date object
    if (val instanceof Date && !isNaN(val)) return formatDate(val);
    // Try parsing string-ish dates
    const parsed = new Date(val);
    if (!isNaN(parsed)) return formatDate(parsed);
    return val;
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleChange('dob', formatDate(selectedDate));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!student.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!student.dob) {
      newErrors.dob = 'Date of Birth is required';
      isValid = false;
    } else {
      // Enforce YYYY-MM-DD format
      const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dobRegex.test(student.dob)) {
        newErrors.dob = 'DOB must be in YYYY-MM-DD format';
        isValid = false;
      }
    }

    if (!student.roll || !student.roll.trim()) {
      newErrors.roll = 'Roll number is required';
      isValid = false;
    }

    if (!student.gender) {
      newErrors.gender = 'Gender is required';
      isValid = false;
    }

    if (!student.email || !student.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(student.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
        isValid = false;
      }
    }

    if (!student.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(student.mobileNumber.trim())) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
      isValid = false;
    }

    if (!student.fatherName || !student.fatherName.trim()) {
      newErrors.fatherName = 'Father\'s name is required';
      isValid = false;
    }

    if (!student.fatherMobile.trim()) {
      newErrors.fatherMobile = 'Father\'s mobile is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(student.fatherMobile.trim())) {
      newErrors.fatherMobile = 'Please enter a valid 10-digit mobile number';
      isValid = false;
    }

    if (!student.photoUrl) {
      newErrors.photoUrl = 'Photo URL is required';
      isValid = false;
    }

    if (!student.gradeId) {
      newErrors.gradeId = 'Grade is required';
      isValid = false;
    }

    if (!student.sectionId) {
      newErrors.sectionId = 'Section is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const [grades, setGrades] = useState([]);
  const [sections, setSections] = useState([]);
  const [filteredSections, setFilteredSections] = useState([]);

  const fetchGrades = async () => {
    try {
      const response = await ApiService.makeRequest(`/general/getGrades`, {
        method: 'GET'
      });

      const data = await response.json();

      if (response.ok) {
        const sortedGrades = (data.data || []).sort((a, b) => a.id - b.id);
        setGrades(sortedGrades);
      } else {
        console.error('Failed to fetch grades:', data.message);
        Alert.alert('Error', 'Failed to fetch grades. Please try again later.');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Failed to fetch grades. Please check your internet connection.');
    }
  };

  const fetchSections = async () => {
    try {
      const response = await ApiService.makeRequest(`/general/getGradeSections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gradeID: student.gradeId }),
      });

      const data = await response.json().catch(() => ({}));

      // Backend returns { success: true, data: [ { section_id, section_name }, ... ] }
      if (response.ok && data && (data.data || data.result)) {
        const rawSections = data.data || data.result || [];

        // Normalize to the shape used by this component: { id, section, grade_id }
        const mapped = rawSections.map(s => ({
          id: s.section_id ?? s.id,
          section: s.section_name ?? s.section ?? s.name,
          grade_id: s.grade_id ?? student.gradeId ?? null,
        }));

        const sortedSections = mapped.sort((a, b) => (a.id || 0) - (b.id || 0));
        setSections(sortedSections);
      } else {
        console.error('Failed to fetch sections:', data?.message || 'unexpected response');
        Alert.alert('Error', 'Failed to fetch sections. Please try again later.');
        setSections([]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Failed to fetch sections. Please check your internet connection.');
      setSections([]);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);
  useEffect(() => {
    if (student.gradeId) {
      fetchSections();
    }
  }, [student.gradeId]);

  // Filter sections based on selected grade
  useEffect(() => {
    if (student.gradeId) {
      const filtered = sections.filter(s => s.grade_id === student.gradeId);
      setFilteredSections(filtered);

      // Reset section if it doesn't belong to the selected grade
      if (student.sectionId && !filtered.find(s => s.id === student.sectionId)) {
        handleChange('sectionId', null);
      }
    } else {
      setFilteredSections([]);
    }
  }, [student.gradeId, sections]);

  const handleGenerateTemplate = async () => {
    try {
      const result = await ApiService.downloadFile(
        '/coordinator/enrollment/generate-student-enroll-template',
        'student_enrollment_template.xlsx',
        {
          mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          title: 'Student Enrollment Template',
          description: 'Student enrollment template',
        }
      );

      Alert.alert('Success', result.message);
    } catch (error) {
      console.error('Template generation error:', error);
      Alert.alert('Error', error.message || 'Failed to generate template. Please try again.');
    }
  };

  const handleUploadDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.xlsx, DocumentPicker.types.allFiles],
        copyTo: 'cachesDirectory',
      });

      // pick() returns an array, get the first file
      const picked = result[0];

      const uploadResult = await ApiService.uploadFile(
        '/coordinator/enrollment/bulk-upload-students',
        picked
      );

      const { processed, succeeded, failed } = uploadResult.data;
      let message = `Processed: ${processed}\nSucceeded: ${succeeded}`;
      if (failed && failed.length) {
        message += `\nFailed: ${failed.length}`;
      }
      Alert.alert('Bulk upload result', message);
    } catch (err) {
      // Check if user cancelled the picker
      if (DocumentPicker.isCancel(err)) {
        return; // User cancelled, do nothing
      }
      console.error('Upload error:', err);
      Alert.alert('Error', err.message || 'Failed to upload file.');
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Incomplete Form', 'Please fill all required fields before submitting.');
      return;
    }
    // Ensure DOB is normalized to YYYY-MM-DD before sending
    const dobToSend = normalizeDob(student.dob);
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(dobToSend)) {
      setErrors(prev => ({ ...prev, dob: 'DOB must be in YYYY-MM-DD format' }));
      Alert.alert('Invalid DOB', 'Date of Birth must be in YYYY-MM-DD format before submitting.');
      return;
    }

    try {
      const payload = {
        name: student.name,
        dob: dobToSend,
        roll: student.roll,
        gender: student.gender,
        email: student.email,
        mobileNumber: student.mobileNumber,
        photoUrl: student.photoUrl,
        fatherName: student.fatherName,
        fatherMobile: student.fatherMobile,
        gradeId: student.gradeId,
        sectionId: student.sectionId,
        academicYear: student.academicYear,
      };

      const resp = await ApiService.makeRequest(`/coordinator/enrollment/enrollStudent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await resp.json().catch(() => null);
      if (!resp.ok || !data?.success) {
        Alert.alert('Error', data?.message || 'Failed to enroll student.');
        return;
      }

      Alert.alert('Success', 'Student enrolled successfully.');

      // Reset form
      setStudent({
        name: '',
        dob: '',
        roll: '',
        gender: '',
        email: '',
        mobileNumber: '',
        photoUrl: '',
        fatherName: '',
        fatherMobile: '',
        gradeId: null,
        sectionId: null,
        academicYear: new Date().getFullYear(),
      });
      setErrors({});
      setShowDatePicker(false);
      setShowGenderModal(false);
      setShowGradeModal(false);
      setShowSectionModal(false);
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', 'Failed to submit form.');
    }
  };

  const handleCancel = () => {
    if (navigation && typeof navigation.goBack === 'function') {
      navigation.goBack();
      return;
    }

    setStudent({
      name: '',
      dob: '',
      roll: '',
      gender: '',
      email: '',
      mobileNumber: '',
      photoUrl: '',
      fatherName: '',
      fatherMobile: '',
      gradeId: null,
      sectionId: null,
      academicYear: new Date().getFullYear(),
    });
    setErrors({});
  };

  const getGradeName = () => {
    const grade = grades.find(g => g.id === student.gradeId);
    return grade ? grade.grade_name : 'Select Grade';
  };

  const getSectionName = () => {
    const section = filteredSections.find(s => s.id === student.sectionId);
    return section ? section.section : 'Select Section';
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <Header
        title="Student Enrollment"
        navigation={navigation}
      />

      {/* Main Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.formContainer}
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* Bulk Upload Card */}
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 18,
            marginHorizontal: 16,
            marginTop: 16,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Ionicons name="cloud-upload-outline" size={22} color="#3557FF" style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 17, fontWeight: '700', color: '#1E293B' }}>Bulk Upload</Text>
            </View>
            <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 14, lineHeight: 18 }}>
              Download the template, fill in student details, and upload the Excel file for batch enrollment.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={handleGenerateTemplate}
                style={{
                  flex: 1,
                  height: 46,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: '#3557FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#F0F4FF',
                  flexDirection: 'row',
                }}
              >
                <Ionicons name="download-outline" size={18} color="#3557FF" style={{ marginRight: 6 }} />
                <Text style={{ color: '#3557FF', fontWeight: '700', fontSize: 14 }}>Template</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUploadDocument}
                style={{
                  flex: 1,
                  height: 46,
                  borderRadius: 12,
                  backgroundColor: '#3557FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  shadowColor: '#3557FF',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Ionicons name="cloud-upload" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>Upload</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Profile Photo</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Profile Photo URL<Text style={styles.requiredAsterisk}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.photoUrl ? styles.inputError : null]}
              placeholder="Paste or enter profile photo link"
              value={student.photoUrl}
              onChangeText={(text) => handleChange('photoUrl', text)}
            />
            {errors.photoUrl && <Text style={styles.errorText}>{errors.photoUrl}</Text>}
          </View>

          <Text style={styles.sectionTitle}>Student Details</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name<Text style={styles.requiredAsterisk}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.name ? styles.inputError : null]}
              placeholder="Enter student name"
              value={student.name}
              onChangeText={(text) => handleChange('name', text)}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Roll<Text style={styles.requiredAsterisk}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.roll ? styles.inputError : null]}
              placeholder="Enter roll number (e.g., STU001)"
              value={student.roll}
              onChangeText={(text) => handleChange('roll', text)}
            />
            {errors.roll && <Text style={styles.errorText}>{errors.roll}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>DOB<Text style={styles.requiredAsterisk}>*</Text></Text>
            <TouchableOpacity
              style={[styles.input, errors.dob ? styles.inputError : null]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={student.dob ? styles.inputText : styles.placeholderText}>
                {student.dob || "Enter DOB"}
              </Text>
              <Ionicons name="calendar-outline" size={18} color="#666" style={styles.inputIcon} />
            </TouchableOpacity>
            {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}

            {showDatePicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender<Text style={styles.requiredAsterisk}>*</Text></Text>
            <TouchableOpacity
              style={[styles.selectionInput, errors.gender ? styles.inputError : null]}
              onPress={() => setShowGenderModal(true)}
            >
              <Text style={styles.selectionText}>
                {student.gender || "Select Gender"}
              </Text>
            </TouchableOpacity>
            {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}

            <Modal
              transparent={true}
              visible={showGenderModal}
              animationType="fade"
              onRequestClose={() => setShowGenderModal(false)}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowGenderModal(false)}
              >
                <View style={styles.listModalContainer}>
                  {genderOptions.map(item => (
                    <TouchableOpacity
                      key={item}
                      style={styles.listModalItem}
                      onPress={() => {
                        handleChange('gender', item);
                        setShowGenderModal(false);
                      }}
                    >
                      <Text style={styles.listModalItemText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableOpacity>
            </Modal>
          </View>

          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email ID<Text style={styles.requiredAsterisk}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={student.email}
              onChangeText={(text) => handleChange('email', text)}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number<Text style={styles.requiredAsterisk}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.mobileNumber ? styles.inputError : null]}
              placeholder="Enter student mobile number"
              keyboardType="phone-pad"
              value={student.mobileNumber}
              onChangeText={(text) => handleChange('mobileNumber', text)}
              maxLength={10}
            />
            {errors.mobileNumber && <Text style={styles.errorText}>{errors.mobileNumber}</Text>}
          </View>

          <Text style={styles.sectionTitle}>Father's Information</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Father's Name<Text style={styles.requiredAsterisk}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.fatherName ? styles.inputError : null]}
              placeholder="Enter father's name"
              value={student.fatherName}
              onChangeText={(text) => handleChange('fatherName', text)}
            />
            {errors.fatherName && <Text style={styles.errorText}>{errors.fatherName}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Father's Mobile<Text style={styles.requiredAsterisk}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.fatherMobile ? styles.inputError : null]}
              placeholder="Enter father's mobile number"
              keyboardType="phone-pad"
              value={student.fatherMobile}
              onChangeText={(text) => handleChange('fatherMobile', text)}
              maxLength={10}
            />
            {errors.fatherMobile && <Text style={styles.errorText}>{errors.fatherMobile}</Text>}
          </View>

          <Text style={styles.sectionTitle}>Academic Details</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Grade<Text style={styles.requiredAsterisk}>*</Text></Text>
            <TouchableOpacity
              style={[styles.selectionInput, errors.gradeId ? styles.inputError : null]}
              onPress={() => setShowGradeModal(true)}
            >
              <Text style={styles.selectionText}>
                {getGradeName()}
              </Text>
            </TouchableOpacity>
            {errors.gradeId && <Text style={styles.errorText}>{errors.gradeId}</Text>}

            <Modal
              transparent={true}
              visible={showGradeModal}
              animationType="fade"
              onRequestClose={() => setShowGradeModal(false)}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowGradeModal(false)}
              >
                <View style={styles.listModalContainer}>
                  {grades.map(grade => (
                    <TouchableOpacity
                      key={grade.id}
                      style={styles.listModalItem}
                      onPress={() => {
                        handleChange('gradeId', grade.id);
                        setShowGradeModal(false);
                      }}
                    >
                      <Text style={styles.listModalItemText}>{grade.grade_name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableOpacity>
            </Modal>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Section<Text style={styles.requiredAsterisk}>*</Text></Text>
            <TouchableOpacity
              style={[styles.selectionInput, errors.sectionId ? styles.inputError : null]}
              onPress={() => {
                if (!student.gradeId) {
                  Alert.alert('Select Grade First', 'Please select a grade before choosing a section.');
                } else if (filteredSections.length === 0) {
                  Alert.alert('No Sections', 'No sections available for the selected grade.');
                } else {
                  setShowSectionModal(true);
                }
              }}
            >
              <Text style={styles.selectionText}>
                {getSectionName()}
              </Text>
            </TouchableOpacity>
            {errors.sectionId && <Text style={styles.errorText}>{errors.sectionId}</Text>}

            <Modal
              transparent={true}
              visible={showSectionModal}
              animationType="fade"
              onRequestClose={() => setShowSectionModal(false)}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowSectionModal(false)}
              >
                <View style={styles.listModalContainer}>
                  {filteredSections.map(section => (
                    <TouchableOpacity
                      key={section.id}
                      style={styles.listModalItem}
                      onPress={() => {
                        handleChange('sectionId', section.id);
                        setShowSectionModal(false);
                      }}
                    >
                      <Text style={styles.listModalItemText}>{section.section}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableOpacity>
            </Modal>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Academic Year<Text style={styles.requiredAsterisk}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Academic Year"
              value={student.academicYear.toString()}
              editable={false}
            />
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleSubmit}
          >
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default StudentEnrollment; 