import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Platform, Alert, Modal, FlatList } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import CalenderIcon from '../../../assets/StudentMentorEnrollment/Calender.svg';
import BackIcon from '../../../assets/GeneralAssests/backarrow.svg';
import PlusIcon from '../../../assets/StudentMentorEnrollment/Plus.svg';
import DeleteIcon from '../../../assets/StudentMentorEnrollment/delete-icon.svg';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles from './MentorEnrollmentStyle';

const MentorEnrollment = ({ navigation }) => {
  const [mentor, setMentor] = useState({
    name: '',
    dob: '',
    gender: '',
    grade: '',
    mobileNumber: '',
    specification: '',
    profileImage: null,
  });

  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);

  const genderOptions = ['Male', 'Female', 'Other'];
  const gradeOptions = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
    'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

  const handleChange = (field, value) => {
    setMentor({ ...mentor, [field]: value });
    if (value.trim() !== '') {
      setErrors({ ...errors, [field]: null });
    }
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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

    setErrors(newErrors);
    return isValid;
  };

  const handleConfirm = () => {
    if (validateForm()) {
      console.log('Mentor data:', mentor);
      console.log('Uploaded documents:', uploadedDocuments);
      Alert.alert('Success', 'Mentor enrollment submitted successfully');
    } else {
      Alert.alert('Incomplete Form', 'Please fill all required fields before submitting.');
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackIcon
          width={styles.BackIcon.width}
          height={styles.BackIcon.height}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTxt}>Mentor Enrollment</Text>
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
              <View style={styles.listModalContainer}>
                {gradeOptions.map(item => (
                  <TouchableOpacity
                    key={item}
                    style={styles.listModalItem}
                    onPress={() => {
                      handleChange('grade', item);
                      setShowGradeModal(false);
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
          <Text style={styles.label}>Mobile number<Text style={styles.requiredAsterisk}>*</Text></Text>
          <TextInput
            style={[styles.input, errors.mobileNumber ? styles.inputError : null]}
            placeholder="Enter number"
            keyboardType="phone-pad"
            value={mentor.mobileNumber}
            onChangeText={(text) => handleChange('mobileNumber', text)}
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
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MentorEnrollment;
