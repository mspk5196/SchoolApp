import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, Modal, KeyboardAvoidingView, Platform, StatusBar, PermissionsAndroid } from 'react-native';
import * as DocumentPicker from '@react-native-documents/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles from './Sty.jsx';
import ApiService from "../../../../utils/ApiService.js";
import Header from '../../../../components/General/Header';

const AdminFacultyEnrollment = ({ navigation }) => {
  const [faculty, setFaculty] = useState({
    name: '',
    dob: '',
    roll: '',
    gender: '',
    email: '',
    mobileNumber: '',
    specification: '',
    profileImage: '',
    role: '',
    selectedGrades: [],
    selectedSections: [],
  });

  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const genderOptions = ['Male', 'Female', 'Other'];
  const roleOptions = ['Coordinator', 'Mentor'];

  const handleChange = (field, value) => {
    setFaculty({ ...faculty, [field]: value });
    if (value.trim !== undefined && value.trim() !== '') {
      setErrors({ ...errors, [field]: null });
    }
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
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

    if (!faculty.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!faculty.dob) {
      newErrors.dob = 'Date of Birth is required';
      isValid = false;
    }

    if (!faculty.roll || !faculty.roll.trim()) {
      newErrors.roll = 'Roll number is required';
      isValid = false;
    }

    if (!faculty.gender) {
      newErrors.gender = 'Gender is required';
      isValid = false;
    }

    if (!faculty.role) {
      newErrors.role = 'Role is required';
      isValid = false;
    }

    if (!faculty.email || !faculty.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(faculty.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
        isValid = false;
      }
    }

    if (!faculty.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(faculty.mobileNumber.trim())) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
      isValid = false;
    }

    if (!faculty.profileImage) {
      newErrors.profileImage = 'Profile url is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const [grades, setGrades] = useState([]);
  const [sections, setSections] = useState([]);

  const fetchGrades = async () => {
    try {
      const response = await ApiService.makeRequest(`/general/getGrades`,{
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
      const response = await ApiService.makeRequest(`/general/getSections`,{
        method: 'GET'
      });
      const data = await response.json();
      if (response.ok) {
        const sortedSections = (data.sections || []).sort((a, b) => a.id - b.id);
        setSections(sortedSections);
      } else {
        console.error('Failed to fetch sections:', data.message);
        Alert.alert('Error', 'Failed to fetch sections. Please try again later.');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Failed to fetch sections. Please check your internet connection.');
    }
  };

  useEffect(() => {
    fetchGrades();
    fetchSections();
  }, []);

  const handleGenerateTemplate = async () => {
    try {
      const result = await ApiService.downloadFile(
        '/admin/enrollment/generate-faculty-enroll-template',
        'faculty_enrollment_template.xlsx',
        {
          mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          title: 'Faculty Enrollment Template',
          description: 'Faculty enrollment template',
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
        '/admin/enrollment/bulk-upload-facultys',
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

    try {
      const payload = {
        name: faculty.name,
        dob: faculty.dob,
        roll: faculty.roll,
        gender: faculty.gender,
        email: faculty.email,
        mobileNumber: faculty.mobileNumber,
        specification: faculty.specification,
        profilePhoto: faculty.profileImage,
        role: faculty.role,
        grades: faculty.selectedGrades,
        sections: faculty.selectedSections,
      };

      const resp = await ApiService.makeRequest(`/admin/enrollfaculty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await resp.json().catch(() => null);
      if (!resp.ok || !data?.success) {
        Alert.alert('Error', data?.message || 'Failed to enroll faculty.');
        return;
      }

      Alert.alert('Success', 'Faculty enrolled successfully.');

      // Reset form
      setFaculty({
        name: '',
        dob: '',
        roll: '',
        gender: '',
        email: '',
        mobileNumber: '',
        specification: '',
        profileImage: '',
        role: '',
        selectedGrades: [],
        selectedSections: [],
      });
      setErrors({});
      setShowDatePicker(false);
      setShowGenderModal(false);
      setShowRoleModal(false);
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

    setFaculty({
      name: '',
      dob: '',
      roll: '',
      gender: '',
      email: '',
      mobileNumber: '',
      specification: '',
      profileImage: '',
      role: '',
      selectedGrades: [],
      selectedSections: [],
    });
    setErrors({});
  };

  const handleGradeCheckbox = (gradeId) => {
    setFaculty(prev => {
      const selected = prev.selectedGrades.includes(gradeId)
        ? prev.selectedGrades.filter(id => id !== gradeId)
        : [...prev.selectedGrades, gradeId];
      return { ...prev, selectedGrades: selected };
    });
    if (errors.grades) {
      setErrors({ ...errors, grades: null });
    }
  };

  const handleSectionCheckbox = (sectionId) => {
    setFaculty(prev => {
      const selected = prev.selectedSections.includes(sectionId)
        ? prev.selectedSections.filter(id => id !== sectionId)
        : [...prev.selectedSections, sectionId];
      return { ...prev, selectedSections: selected };
    });
    if (errors.sections) {
      setErrors({ ...errors, sections: null });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <Header 
        title="Faculty Enrollment" 
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
              Download the template, fill in faculty details, and upload the Excel file for batch enrollment.
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
              style={[styles.input, errors.profileImage ? styles.inputError : null]}
              placeholder="Paste or enter profile photo link"
              value={faculty.profileImage}
              onChangeText={(text) => handleChange('profileImage', text)}
            />
            {errors.profileImage && <Text style={styles.errorText}>{errors.profileImage}</Text>}
          </View>

          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name<Text style={styles.requiredAsterisk}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.name ? styles.inputError : null]}
              placeholder="Enter name"
              value={faculty.name}
              onChangeText={(text) => handleChange('name', text)}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Roll<Text style={styles.requiredAsterisk}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.roll ? styles.inputError : null]}
              placeholder="Enter roll number (e.g., FAC001)"
              value={faculty.roll}
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
              <Text style={faculty.dob ? styles.inputText : styles.placeholderText}>
                {faculty.dob || "Enter DOB"}
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
                {faculty.gender || "Select Gender"}
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

          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email ID<Text style={styles.requiredAsterisk}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={faculty.email}
              onChangeText={(text) => handleChange('email', text)}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile number<Text style={styles.requiredAsterisk}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.mobileNumber ? styles.inputError : null]}
              placeholder="Enter number"
              keyboardType="phone-pad"
              value={faculty.mobileNumber}
              onChangeText={(text) => handleChange('mobileNumber', text)}
              maxLength={10}
            />
            {errors.mobileNumber && <Text style={styles.errorText}>{errors.mobileNumber}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Specification</Text>
            <TextInput
              style={[styles.input, errors.specification ? styles.inputError : null]}
              placeholder="Enter specification (e.g., Computer Science)"
              value={faculty.specification}
              onChangeText={(text) => handleChange('specification', text)}
            />
            {errors.specification && <Text style={styles.errorText}>{errors.specification}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Role<Text style={styles.requiredAsterisk}>*</Text></Text>
            <TouchableOpacity
              style={[styles.selectionInput, errors.role ? styles.inputError : null]}
              onPress={() => setShowRoleModal(true)}
            >
              <Text style={styles.selectionText}>
                {faculty.role || "Select Role"}
              </Text>
            </TouchableOpacity>
            {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}

            <Modal
              transparent={true}
              visible={showRoleModal}
              animationType="fade"
              onRequestClose={() => setShowRoleModal(false)}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowRoleModal(false)}
              >
                <View style={styles.listModalContainer}>
                  {roleOptions.map(item => (
                    <TouchableOpacity
                      key={item}
                      style={styles.listModalItem}
                      onPress={() => {
                        handleChange('role', item);
                        setShowRoleModal(false);
                      }}
                    >
                      <Text style={styles.listModalItemText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableOpacity>
            </Modal>
          </View>

          {faculty.role === 'Coordinator' && (
            <>
              <Text style={styles.sectionTitle}>Grades (Coordinator)</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Select grade(s) (Optional)</Text>
                <View style={[styles.checkboxContainer, errors.grades ? styles.inputError : null]}>
                  {grades.map((grade) => (
                    <View key={grade.id} style={styles.checkboxItem}>
                      <TouchableOpacity
                        style={[
                          styles.checkbox,
                          faculty.selectedGrades.includes(grade.id) && styles.checkboxChecked,
                        ]}
                        onPress={() => handleGradeCheckbox(grade.id)}
                      >
                        {faculty.selectedGrades.includes(grade.id) && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </TouchableOpacity>
                      <Text style={styles.checkboxLabel}>{grade.grade_name}</Text>
                    </View>
                  ))}
                </View>
                {errors.grades && <Text style={styles.errorText}>{errors.grades}</Text>}
              </View>
            </>
          )}

          {faculty.role === 'Mentor' && (
            <>
              <Text style={styles.sectionTitle}>Sections (Mentor)</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Select section(s) (Optional)</Text>
                <View style={[styles.checkboxContainer, errors.sections ? styles.inputError : null]}>
                  {sections.map((section) => (
                    <View key={section.id} style={styles.checkboxItem}>
                      <TouchableOpacity
                        style={[
                          styles.checkbox,
                          faculty.selectedSections.includes(section.id) && styles.checkboxChecked,
                        ]}
                        onPress={() => handleSectionCheckbox(section.id)}
                      >
                        {faculty.selectedSections.includes(section.id) && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </TouchableOpacity>
                      <Text style={styles.checkboxLabel}>
                        {section.section} {section.grade_name ? `(${section.grade_name})` : ''}
                      </Text>
                    </View>
                  ))}
                </View>
                {errors.sections && <Text style={styles.errorText}>{errors.sections}</Text>}
              </View>
            </>
          )}
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

export default AdminFacultyEnrollment;