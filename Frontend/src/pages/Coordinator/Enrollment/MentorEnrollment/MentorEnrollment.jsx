import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Platform, Alert, Modal, ActivityIndicator } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import CalenderIcon from '../../../../assets/CoordinatorPage/StudentMentorEnrollment/Calender.svg';
import BackIcon from '../../../../assets/CoordinatorPage/StudentMentorEnrollment/Back.svg';
import PlusIcon from '../../../../assets/CoordinatorPage/StudentMentorEnrollment/Plus.svg';
import DeleteIcon from '../../../../assets/CoordinatorPage/StudentMentorEnrollment/delete-icon.svg';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles from './MentorEnrollmentStyle';
import { API_URL } from '../../../../utils/env.js';

const MentorEnrollment = ({ navigation, route }) => {

  const {coordinatorData} =route.params;

  const [mentor, setMentor] = useState({
    name: '',
    dob: '',
    gender: 'Male',
    grade: '',
    section: '',
    subject: '',
    mobileNumber: '',
    specification: '',
    profileImage: null,
  });

  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gradeOptions, setGradeOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);

  const genderOptions = ['Male', 'Female', 'Other'];

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/getGrades`);
      const data = await response.json();

      if (data.success) { 
        setGradeOptions(data.grades);
      } else {
        Alert.alert('Error', 'Failed to fetch grades');
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
      Alert.alert('Error', 'Failed to fetch grades');
    }
  };

  const fetchSections = async (gradeId) => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/getGradeSections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gradeID: gradeId })
      });
      const data = await response.json();

      if (data.success) {
        setSectionOptions(data.gradeSections);
      } else {
        Alert.alert('Error', 'Failed to fetch sections');
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      Alert.alert('Error', 'Failed to fetch sections');
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/getSubjects`);
      const data = await response.json();

      if (data.success) {
        setSubjectOptions(data.subjects);
      } else {
        Alert.alert('Error', 'Failed to fetch subjects');
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      Alert.alert('Error', 'Failed to fetch subjects');
    }
  };

  const handleChange = (field, value) => {
    setMentor({ ...mentor, [field]: value });
    if (value!== '') {
      setErrors({ ...errors, [field]: null });
    }

    // When grade changes, fetch sections for that grade
    if (field === 'grade') {
      const selectedGrade = gradeOptions.find(g => g.grade_name === value);
      if (selectedGrade) {
        fetchSections(selectedGrade.id);
      }
    }
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`; // Format for backend
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleChange('dob', formatDate(selectedDate));
    }
  };

  const pickImage = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 800,
      maxWidth: 800,
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Error', 'There was a problem selecting this image.');
      } else {
        const source = response.assets[0].uri;
        setMentor({ ...mentor, profileImage: source });
        setErrors({ ...errors, profileImage: null });
      }
    });
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.csv, DocumentPicker.types.xls, DocumentPicker.types.xlsx],
        allowMultiSelection: false,
      });

      console.log('Document picked:', result);
      setUploadedDocuments([...uploadedDocuments, result[0]]);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled document picker');
      } else {
        console.log('Document picker error:', err);
        Alert.alert('Error', 'There was a problem selecting this document.');
      }
    }
  };

  const deleteDocument = (index) => {
    const updatedDocs = [...uploadedDocuments];
    updatedDocs.splice(index, 1);
    setUploadedDocuments(updatedDocs);
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!mentor.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!mentor.dob) {
      newErrors.dob = 'Date of Birth is required';
      isValid = false;
    }

    if (!mentor.gender) {
      newErrors.gender = 'Gender is required';
      isValid = false;
    }

    if (!mentor.grade) {
      newErrors.grade = 'Grade is required';
      isValid = false;
    }

    // if (!mentor.section) {
    //   newErrors.section = 'Section is required';
    //   isValid = false;
    // }

    // if (!mentor.subject) {
    //   newErrors.subject = 'Subject is required';
    //   isValid = false;
    // }

    if (!mentor.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(mentor.mobileNumber.trim())) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
      isValid = false;
    }

    if (!mentor.specification.trim()) {
      newErrors.specification = 'Specification is required';
      isValid = false;
    }
    if (!mentor.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    }

    if (!mentor.profileImage) {
      newErrors.profileImage = 'Profile image is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Incomplete Form', 'Please fill all required fields before submitting.');
      return;
    }
  
    setIsLoading(true);
  
    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('name', mentor.name);
      formData.append('dob', mentor.dob);
      formData.append('gender', mentor.gender);
      formData.append('grade', mentor.grade);
      // formData.append('section', mentor.section);
      // formData.append('subject', mentor.subject);
      formData.append('mobileNumber', mentor.mobileNumber);
      formData.append('specification', mentor.specification);
      formData.append('email', mentor.email);
  
      // Append profile image
      if (mentor.profileImage) {
        formData.append('profilePhoto', {
          uri: mentor.profileImage,
          type: 'image/jpeg',
          name: 'profile.jpg'
        });
      }
  
      // Submit to backend
      const response = await fetch(`${API_URL}/api/coordinator/enrollMentor`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      const data = await response.json();
  
      if (data.success) {
        Alert.alert('Success', 'Mentor enrolled successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', data.message || 'Failed to enroll mentor');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      Alert.alert('Error', 'Failed to enroll mentor. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation && navigation.navigate('CoordinatorEnrollmentHome', {coordinatorData})}
        >
          <BackIcon  color="black" />
        </TouchableOpacity> 
        <Text style={styles.headerTitle}>Mentor Enrollment</Text>
      </View>

      <ScrollView style={styles.formContainer}>
        <View style={styles.profileImageContainer}>
          {mentor.profileImage ? (
            <Image source={{ uri: mentor.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profilePlaceholder, errors.profileImage ? styles.inputError : null]}>
              <Text style={styles.profilePlaceholderText}>👨‍🏫</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={pickImage}
          >
            <PlusIcon width={37} height={37} />
          </TouchableOpacity>
          {errors.profileImage && <Text style={styles.errorText}>{errors.profileImage}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name<Text style={styles.requiredAsterisk}>*</Text></Text>
          <TextInput
            style={[styles.input, errors.name ? styles.inputError : null]}
            placeholder="Enter name"
            value={mentor.name}
            onChangeText={(text) => handleChange('name', text)}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>DOB<Text style={styles.requiredAsterisk}>*</Text></Text>
          <TouchableOpacity
            style={[styles.input, errors.dob ? styles.inputError : null]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={mentor.dob ? styles.inputText : styles.placeholderText}>
              {mentor.dob || "Enter DOB"}
            </Text>
            <CalenderIcon style={styles.inputIcon} />
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
              {mentor.gender || "Select Gender"}
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

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Grade<Text style={styles.requiredAsterisk}>*</Text></Text>
          <TouchableOpacity
            style={[styles.selectionInput, errors.grade ? styles.inputError : null]}
            onPress={() => setShowGradeModal(true)}
          >
            <Text style={styles.selectionText}>
              {mentor.grade || "Select Grade"}
            </Text>
          </TouchableOpacity>
          {errors.grade && <Text style={styles.errorText}>{errors.grade}</Text>}

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
              <ScrollView style={styles.listModalContainer}>
                {gradeOptions.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.listModalItem}
                    onPress={() => {
                      handleChange('grade', item.grade_name);
                      setShowGradeModal(false);
                    }}
                  >
                    <Text style={styles.listModalItemText}>{item.grade_name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </TouchableOpacity>
          </Modal>
        </View>

        {/* <View style={styles.inputGroup}>
          <Text style={styles.label}>Section<Text style={styles.requiredAsterisk}>*</Text></Text>
          <TouchableOpacity
            style={[styles.selectionInput, errors.section ? styles.inputError : null]}
            onPress={() => {
              if (!mentor.grade) {
                Alert.alert('Select Grade First', 'Please select a grade before choosing a section');
                return;
              }
              setShowSectionModal(true);
            }}
          >
            <Text style={styles.selectionText}>
            {mentor.section ? sectionOptions.find(s => s.id === mentor.section)?.section_name : "Select Section"}
            </Text>
          </TouchableOpacity>
          {errors.section && <Text style={styles.errorText}>{errors.section}</Text>}

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
                {sectionOptions.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.listModalItem}
                    onPress={() => {
                      handleChange('section', item.id);
                      setShowSectionModal(false);
                    }}
                  >
                    <Text style={styles.listModalItemText}>{item.section_name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
        </View> */}

        {/* <View style={styles.inputGroup}>
          <Text style={styles.label}>Subject<Text style={styles.requiredAsterisk}>*</Text></Text>
          <TouchableOpacity
            style={[styles.selectionInput, errors.subject ? styles.inputError : null]}
            onPress={() => {
              if (subjectOptions.length === 0) {
                fetchSubjects(); 
              }
              setShowSubjectModal(true);
            }}
          >
            <Text style={styles.selectionText}>
              {mentor.subject ? subjectOptions.find(s => s.id === mentor.subject)?.subject_name : "Select Subject"}
            </Text>
          </TouchableOpacity>
          {errors.subject && <Text style={styles.errorText}>{errors.subject}</Text>}

          <Modal
            transparent={true}
            visible={showSubjectModal}
            animationType="fade"
            onRequestClose={() => setShowSubjectModal(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowSubjectModal(false)}
            >
              <View style={styles.listModalContainer}>
                {subjectOptions.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.listModalItem}
                    onPress={() => {
                      handleChange('subject', item.id);
                      setShowSubjectModal(false);
                    }}
                  >
                    <Text style={styles.listModalItemText}>{item.subject_name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
        </View> */}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mobile number<Text style={styles.requiredAsterisk}>*</Text></Text>
          <TextInput
            style={[styles.input, errors.mobileNumber ? styles.inputError : null]}
            placeholder="Enter number"
            keyboardType="phone-pad"
            value={mentor.mobileNumber}
            onChangeText={(text) => handleChange('mobileNumber', text)}
            maxLength={10}
          />
          {errors.mobileNumber && <Text style={styles.errorText}>{errors.mobileNumber}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Specification<Text style={styles.requiredAsterisk}>*</Text></Text>
          <TextInput
            style={[styles.input, errors.specification ? styles.inputError : null]}
            placeholder="Enter Specification"
            value={mentor.specification}
            onChangeText={(text) => handleChange('specification', text)}
          />
          {errors.specification && <Text style={styles.errorText}>{errors.specification}</Text>}
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>EMail<Text style={styles.requiredAsterisk}>*</Text></Text>
          <TextInput
            style={[styles.input, errors.email ? styles.inputError : null]}
            placeholder="Enter Email"
            value={mentor.email}
            onChangeText={(text) => handleChange('email', text)}
          />
          {errors.specification && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={pickDocument}
        >
          <Text style={styles.uploadButtonText}>
            Upload Mentor{'\n'}
            <Text style={styles.uploadButtonSubtext}>details from sheet</Text>
          </Text>
        </TouchableOpacity>

        {uploadedDocuments.length > 0 && (
          <View style={styles.uploadedDocsContainer}>
            <Text style={styles.uploadedDocsTitle}>Uploaded Documents</Text>
            {uploadedDocuments.map((doc, index) => (
              <View key={index} style={styles.documentItem}>
                <View style={styles.documentInfo}>
                  <View style={styles.documentDetails}>
                    <Text style={styles.documentName} numberOfLines={1}>{doc.name}</Text>
                    <Text style={styles.documentSize}>{(doc.size / 1024).toFixed(2)} KB</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.documentDeleteButton}
                  onPress={() => deleteDocument(index)}
                ><DeleteIcon /></TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MentorEnrollment;