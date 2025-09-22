import { apiFetch } from "../../../../utils/apiClient.js";
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Platform, Alert, Modal, FlatList, PermissionsAndroid } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import CalenderIcon from '../../../../assets/CoordinatorPage/StudentMentorEnrollment/Calender.svg';
import BackIcon from '../../../../assets/CoordinatorPage/StudentMentorEnrollment/Back.svg';
import PlusIcon from '../../../../assets/CoordinatorPage/StudentMentorEnrollment/Plus.svg';
import DeleteIcon from '../../../../assets/CoordinatorPage/StudentMentorEnrollment/delete-icon.svg';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles from './StudentEnrollmentStyle';
import { API_URL } from '../../../../utils/env.js';

const StudentEnrollment = ({ navigation, route }) => {

  const { coordinatorData } = route.params;

  const [student, setStudent] = useState({
    name: '',
    dob: '',
    gender: '',
    grade: '',
    mobileNumber: '',
    section: '',
    sectionMentorID: '',
    profileImage: null,
    aadharNo: '',
    emisNo: '',
    bloodGroup: '',
    fatherName: '',
    motherName: '',
    fatherMobile: '',
    motherMobile: '',
    address: '',
    pincode: ''
  });

  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [gradeOptions, setGradeOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [mentorID, setMentorID] = useState(null);
  const [showUploadOptionsModal, setShowUploadOptionsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const genderOptions = ['Male', 'Female', 'Other'];

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/getGrades`);
      const data = response

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
      const response = await apiFetch(`/coordinator/getGradeSections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gradeID: gradeId })
      });
      const data = response

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


  const fetchSectionMentor = async (sectionID) => {
    console.log("Fetching mentor...");
    try {
      const response = await apiFetch(`/coordinator/getSpecificSectionMentor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sectionID })
      });
      const data = response

      if (data.success) {
        setMentorID(data.sectionMentor);
        console.log(data.sectionMentor);
      } else {
        Alert.alert('Error', 'Failed to fetch sections');
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      Alert.alert('Error', 'Failed to fetch sections');
    }
  }

  const handleChange = (field, value) => {
    setStudent({ ...student, [field]: value });
    // Clear error when field is filled
    if (value !== '') {
      setErrors({ ...errors, [field]: null });
    }

    // If grade is changed, fetch sections for that grade
    if (field === 'grade') {
      fetchSections(value);
    }
    if (field === 'section') {
      fetchSectionMentor(value)
    }
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`; // Format for database
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
        setStudent({ ...student, profileImage: source });
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

    // Required fields validation
    const requiredFields = [
      'name', 'dob', 'gender', 'grade', 'section',
      'mobileNumber',
      // 'aadharNo', 'emisNo', 
      // 'fatherName', 'motherName', 'fatherMobile',
      // 'address', 'pincode'
    ];

    requiredFields.forEach(field => {
      if (!student[field]) {
        newErrors[field] = 'This field is required';
        isValid = false;
      }
    });

    // Mobile number validation
    if (student.mobileNumber && !/^\d{10}$/.test(student.mobileNumber.trim())) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
      isValid = false;
    }

    // Father mobile validation
    if (student.fatherMobile && !/^\d{10}$/.test(student.fatherMobile.trim())) {
      newErrors.fatherMobile = 'Please enter a valid 10-digit mobile number';
      isValid = false;
    }

    // Mother mobile validation
    if (student.motherMobile && !/^\d{10}$/.test(student.motherMobile.trim())) {
      newErrors.motherMobile = 'Please enter a valid 10-digit mobile number';
      isValid = false;
    }

    // Pincode validation
    if (student.pincode && !/^\d{6}$/.test(student.pincode.trim())) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleUploadOptions = () => {
    setShowUploadOptionsModal(true);
  };

  const handleGenerateTemplate = async () => {
    try {
      setIsLoading(true);

      // Request permissions for Android
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to your storage to download the template',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        // if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        //   Alert.alert('Permission Denied', 'Storage permission is required to download the template');
        //   return;
        // }
      }

      const response = await apiFetch(`/coordinator/enrollment/generate-student-template`, {
        method: 'GET'
      });

      if (response.ok) {
        // Get the blob data
        const blob = await response.blob();
        const base64Data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(',')[1]);
          reader.readAsDataURL(blob);
        });

        // Define download path
        const downloadPath = Platform.OS === 'ios' 
          ? `${RNFS.DocumentDirectoryPath}/student_enrollment_template.xlsx`
          : `${RNFS.DownloadDirectoryPath}/student_enrollment_template.xlsx`;

        // Write file
        await RNFS.writeFile(downloadPath, base64Data, 'base64');

        Alert.alert(
          'Success', 
          `Template downloaded successfully!\nSaved to: ${Platform.OS === 'ios' ? 'Files app' : 'Downloads folder'}`,
          [{ text: 'OK' }]
        );
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to generate template');
      }
    } catch (error) {
      console.error('Template generation error:', error);
      Alert.alert('Error', 'Failed to generate template. Please try again.');
    } finally {
      setIsLoading(false);
      setShowUploadOptionsModal(false);
    }
  };

  const handleUploadDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.xlsx],
        allowMultiSelection: false,
      });

      if (result && result.length > 0) {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('excelFile', {
          uri: result[0].uri,
          name: result[0].name,
          type: result[0].type,
        });

        const response = await apiFetch(`/coordinator/enrollment/bulk-upload-students`, {
          method: 'POST',
          body: formData,
        });

        console.log('Upload response status:', response.status);
        console.log('Upload response headers:', response.headers);

        const data = response
        console.log('Upload response data:', data);

        if (response.ok) {
          Alert.alert('Success', `Successfully uploaded ${data.successfulUploads} students. ${data.failedUploads > 0 ? `${data.failedUploads} failed.` : ''}`);
          if (data.errors && data.errors.length > 0) {
            Alert.alert('Upload Details', data.errors.join('\n'));
          }
        } else {
          Alert.alert('Error', data.message || 'Failed to upload students');
        }
      }
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        console.log('User cancelled document picker');
      } else {
        console.error('Document upload error:', error);
        Alert.alert('Error', 'Failed to upload document');
      }
    } finally {
      setIsLoading(false);
      setShowUploadOptionsModal(false);
    }
  };

  const handleConfirm = async () => {
    if (!validateForm()) {
      Alert.alert('Incomplete Form', 'Please fill all required fields before submitting.');
      return;
    }

    try {
      // Create form data for file upload
      const formData = new FormData();

      // Add student data
      formData.append('name', student.name);
      formData.append('fatherName', student.fatherName);
      formData.append('dob', student.dob);
      formData.append('gender', student.gender);
      formData.append('grade', student.grade);
      formData.append('section', student.section);
      formData.append('mentorID', mentorID[0].id);
      formData.append('mobileNumber', student.mobileNumber);

      // Add profile photo if exists
      if (student.profileImage) {
        const photo = {
          uri: student.profileImage,
          type: 'image/jpeg',
          name: 'profile.jpg'
        };
        formData.append('profilePhoto', photo);
      }

      // Submit to backend
      const response = await apiFetch(`/coordinator/enrollStudent`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response

      if (data.success) {
        Alert.alert('Success', 'Student enrolled successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', data.message || 'Failed to enroll student');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      Alert.alert('Error', 'Failed to enroll student');
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
          onPress={() => navigation && navigation.navigate('CoordinatorEnrollmentHome', { coordinatorData })}
        >
          <BackIcon color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Student Enrollment</Text>
      </View>

      <ScrollView style={styles.formContainer}>
        <View style={styles.profileImageContainer}>
          {student.profileImage ? (
            <Image source={{ uri: student.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profilePlaceholder, errors.profileImage ? styles.inputError : null]}>
              <Text style={styles.profilePlaceholderText}>👨‍🎓</Text>
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

        {/* Basic Information Section */}
        <Text style={styles.sectionHeader}>Basic Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name<Text style={styles.requiredAsterisk}>*</Text></Text>
          <TextInput
            style={[styles.input, errors.name ? styles.inputError : null]}
            placeholder="Enter name"
            value={student.name}
            placeholderTextColor='grey'
            onChangeText={(text) => handleChange('name', text)}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Father Name<Text style={styles.requiredAsterisk}>*</Text></Text>
          <TextInput
            style={[styles.input, errors.name ? styles.inputError : null]}
            placeholder="Enter Father name"
            value={student.fatherName}
            placeholderTextColor='grey'
            onChangeText={(text) => handleChange('fatherName', text)}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>DOB<Text style={styles.requiredAsterisk}>*</Text></Text>
          <TouchableOpacity
            style={[styles.input, errors.dob ? styles.inputError : null]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={student.dob ? styles.inputText : styles.placeholderText}>
              {student.dob || "Select DOB"}
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
                <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
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
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        {/* <View style={styles.inputGroup}>
          <Text style={styles.label}>Blood Group</Text>
          <TouchableOpacity
            style={styles.selectionInput}
            onPress={() => setShowBloodGroupModal(true)}
          >
            <Text style={styles.selectionText}>
              {student.bloodGroup || "Select Blood Group"}
            </Text>
          </TouchableOpacity>

          <Modal
            transparent={true}
            visible={showBloodGroupModal}
            animationType="fade"
            onRequestClose={() => setShowBloodGroupModal(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowBloodGroupModal(false)}
            >
              <View style={styles.listModalContainer}>
                {bloodGroupOptions.map(item => (
                  <TouchableOpacity
                    key={item}
                    style={styles.listModalItem}
                    onPress={() => {
                      handleChange('bloodGroup', item);
                      setShowBloodGroupModal(false);
                    }}
                  >
                    <Text style={styles.listModalItemText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
        </View> */}

        {/* Academic Information Section */}
        <Text style={styles.sectionHeader}>Academic Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Grade<Text style={styles.requiredAsterisk}>*</Text></Text>
          <TouchableOpacity
            style={[styles.selectionInput, errors.grade ? styles.inputError : null]}
            onPress={() => setShowGradeModal(true)}
          >
            <Text style={styles.selectionText}>
              {student.grade ? gradeOptions.find(g => g.id === student.grade)?.grade_name : "Select Grade"}
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
              <View style={styles.listModalContainer}>
                <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                  {gradeOptions.map(item => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.listModalItem}
                      onPress={() => {
                        handleChange('grade', item.id);
                        setShowGradeModal(false);
                      }}
                    >
                      <Text style={styles.listModalItemText}>{item.grade_name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Section<Text style={styles.requiredAsterisk}>*</Text></Text>
          <TouchableOpacity
            style={[styles.selectionInput, errors.section ? styles.inputError : null]}
            onPress={() => setShowSectionModal(true)}
          >
            <Text style={styles.selectionText}>
              {student.section ? sectionOptions.find(s => s.id === student.section)?.section_name : "Select Section"}
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
                <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
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
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        {/* Contact Information Section */}
        <Text style={styles.sectionHeader}>Contact Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mobile Number<Text style={styles.requiredAsterisk}>*</Text></Text>
          <TextInput
            style={[styles.input, errors.mobileNumber ? styles.inputError : null]}
            placeholder="Enter mobile number"
            keyboardType="phone-pad"
            value={student.mobileNumber}
            onChangeText={(text) => handleChange('mobileNumber', text)}
          />
          {errors.mobileNumber && <Text style={styles.errorText}>{errors.mobileNumber}</Text>}
        </View>

        {/* <View style={styles.inputGroup}>
          <Text style={styles.label}>Aadhar Number<Text style={styles.requiredAsterisk}>*</Text></Text>
          <TextInput
            style={[styles.input, errors.aadharNo ? styles.inputError : null]}
            placeholder="Enter Aadhar number"
            keyboardType="numeric"
            value={student.aadharNo}
            onChangeText={(text) => handleChange('aadharNo', text)}
          />
          {errors.aadharNo && <Text style={styles.errorText}>{errors.aadharNo}</Text>}
        </View> */}

        {/* <View style={styles.inputGroup}>
          <Text style={styles.label}>EMIS Number<Text style={styles.requiredAsterisk}>*</Text></Text>
          <TextInput
            style={[styles.input, errors.emisNo ? styles.inputError : null]}
            placeholder="Enter EMIS number"
            value={student.emisNo}
            onChangeText={(text) => handleChange('emisNo', text)}
          />
          {errors.emisNo && <Text style={styles.errorText}>{errors.emisNo}</Text>}
        </View> */}

        {/* Parent Information Section */}
        {/* <Text style={styles.sectionHeader}>Parent Information</Text>
        
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
          <Text style={styles.label}>Mother's Name<Text style={styles.requiredAsterisk}>*</Text></Text>
          <TextInput
            style={[styles.input, errors.motherName ? styles.inputError : null]}
            placeholder="Enter mother's name"
            value={student.motherName}
            onChangeText={(text) => handleChange('motherName', text)}
          />
          {errors.motherName && <Text style={styles.errorText}>{errors.motherName}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Father's Mobile<Text style={styles.requiredAsterisk}>*</Text></Text>
          <TextInput
            style={[styles.input, errors.fatherMobile ? styles.inputError : null]}
            placeholder="Enter father's mobile"
            keyboardType="phone-pad"
            value={student.fatherMobile}
            onChangeText={(text) => handleChange('fatherMobile', text)}
          />
          {errors.fatherMobile && <Text style={styles.errorText}>{errors.fatherMobile}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mother's Mobile</Text>
          <TextInput
            style={[styles.input, errors.motherMobile ? styles.inputError : null]}
            placeholder="Enter mother's mobile"
            keyboardType="phone-pad"
            value={student.motherMobile}
            onChangeText={(text) => handleChange('motherMobile', text)}
          />
          {errors.motherMobile && <Text style={styles.errorText}>{errors.motherMobile}</Text>}
        </View> */}

        {/* Address Information Section */}
        {/* <Text style={styles.sectionHeader}>Address Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address<Text style={styles.requiredAsterisk}>*</Text></Text>
          <TextInput
            style={[styles.input, errors.address ? styles.inputError : null]}
            placeholder="Enter address"
            value={student.address}
            onChangeText={(text) => handleChange('address', text)}
            multiline
          />
          {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pincode<Text style={styles.requiredAsterisk}>*</Text></Text>
          <TextInput
            style={[styles.input, errors.pincode ? styles.inputError : null]}
            placeholder="Enter pincode"
            keyboardType="numeric"
            value={student.pincode}
            onChangeText={(text) => handleChange('pincode', text)}
          />
          {errors.pincode && <Text style={styles.errorText}>{errors.pincode}</Text>}
        </View> */}

        {/* Documents Section */}
        <View style={styles.documentsSection}>
          <Text style={styles.sectionHeader}>Documents</Text>

          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleUploadOptions}
          >
            <Text style={styles.uploadButtonText}>
              Upload Documents{'\n'}
              <Text style={styles.uploadButtonSubtext}>Choose upload method</Text>
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
                  >
                    <DeleteIcon />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Upload Options Modal */}
        <Modal
          transparent={true}
          visible={showUploadOptionsModal}
          animationType="fade"
          onRequestClose={() => setShowUploadOptionsModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowUploadOptionsModal(false)}
          >
            <View style={styles.uploadOptionsModal}>
              <Text style={styles.uploadOptionsTitle}>Choose Upload Method</Text>

              <TouchableOpacity
                style={styles.uploadOptionButton}
                onPress={handleGenerateTemplate}
              >
                <Text style={styles.uploadOptionButtonText}>📄 Generate Excel Template</Text>
                <Text style={styles.uploadOptionButtonSubtext}>Download a pre-formatted Excel template with all required columns</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.uploadOptionButton}
                onPress={handleUploadDocument}
              >
                <Text style={styles.uploadOptionButtonText}>📤 Upload Filled Document</Text>
                <Text style={styles.uploadOptionButtonSubtext}>Upload an Excel file with student data already filled in</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.uploadOptionCancelButton}
                onPress={() => setShowUploadOptionsModal(false)}
              >
                <Text style={styles.uploadOptionCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmButtonText}>Enroll Student</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default StudentEnrollment;