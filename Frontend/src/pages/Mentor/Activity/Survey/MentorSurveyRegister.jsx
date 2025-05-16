import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  FlatList,
  Alert,
  Modal,
  Image,
  Platform,
  ScrollView,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import { API_URL } from '@env';
import styles from "./surveyfoldersty";

// Import SVG components
import BackArrow from '../../../../assets/MentorPage/backarrow.svg';
import Home from '../../../../assets/MentorPage/Home2.svg';
import Add from '../../../../assets/MentorPage/Add.svg';
import Userlogo from '../../../../assets/MentorPage/userlogo.svg';
import Checkbox from '../../../../assets/MentorPage/checkbox.svg';

const MentorSurveyRegister = ({ navigation, route }) => {
  const { mentorData } = route.params;

  // Form fields
  const [title, setTitle] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isFromDatePickerVisible, setFromDatePickerVisible] = useState(false);
  const [isToDatePickerVisible, setToDatePickerVisible] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  // Feedback specific fields
  const [clarityTeaching, setClarityTeaching] = useState('');
  const [clarityMaterials, setClarityMaterials] = useState('');
  const [timeMgmt, setTimeMgmt] = useState('');
  const [satisfaction, setSatisfaction] = useState('');
  const [term, setTerm] = useState('');

  // Task type dropdown
  const [task, setTask] = useState('');
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskItems, setTaskItems] = useState([
    { label: 'Collect Fee', value: 'Collect Fee' },
    { label: 'Feedback', value: 'Feedback' },
    { label: 'Other', value: 'Other' },
  ]);

  // Term dropdown
  const [termOpen, setTermOpen] = useState(false);
  const [termItems, setTermItems] = useState([
    { label: 'Term 1', value: '1' },
    { label: 'Term 2', value: '2' },
  ]);

  // Grade dropdown
  const [grade, setGrade] = useState('');
  const [gradeOpen, setGradeOpen] = useState(false);
  const [gradeItems, setGradeItems] = useState([]);

  // Section dropdown
  const [section, setSection] = useState('');
  const [sectionOpen, setSectionOpen] = useState(false);
  const [sectionItems, setSectionItems] = useState([]);

  // Form validation
  const [isFormValid, setIsFormValid] = useState(false);

  const [students, setStudents] = useState([])

  // Validate form based on task type
  useEffect(() => {
    let valid = false;

    if (title && fromDate && toDate && task) {
      if (task === 'Collect Fee') {
        valid = grade && section && amount ? true : false;
      } else if (task === 'Feedback') {
        valid = grade && section && term ? true : false;
      } else if (task === 'Other') {
        valid = grade && section && description ? true : false;
      }
    }

    setIsFormValid(valid);
  }, [
    title, fromDate, toDate, task, grade, section,
    amount, description, term, clarityTeaching,
    clarityMaterials, timeMgmt, satisfaction
  ]);

  // Fetch grades on component mount
  useEffect(() => {
    fetchGrades();
  }, []);

  // Fetch sections when grade changes
  useEffect(() => {
    if (grade) {
      fetchSections();
    }
  }, [grade]);

  useEffect(() => {
    if (section) {
      fetchStudents();
    }
  }, [section])

  const fetchGrades = async () => {
    try {
      // For demo, using sample data
      setGradeItems([]);

      // Actual API call would be:

      const response = await fetch(`${API_URL}/api/mentor/survey/getGrades`);
      const data = await response.json();
      if (data.success) {
        setGradeItems(data.grades.map(g => ({
          label: g.grade_name, value: g.id
        })));
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
      Alert.alert("Error", "Failed to fetch grades");
    }
  };

  const fetchSections = async () => {
    try {
      // For demo, using sample data
      setSectionItems([]);

      // Actual API call would be:

      const response = await fetch(`${API_URL}/api/mentor/survey/getGradeSections?gradeId=${grade}`);
      const data = await response.json();
      if (data.success) {
        setSectionItems(data.sections.map(s => ({
          label: s.section_name, value: s.id
        })));
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
      Alert.alert("Error", "Failed to fetch sections");
    }
  };

  const fetchStudents = async () => {
    try {
      // Actual API call would be:
      setStudents([])

      const response = await fetch(`${API_URL}/api/mentor/survey/getMentorStudents?sectionId=${section}`);
      const data = await response.json();
      if (data.success) {
        setStudents(data.students.map(s => ({
          name: s.name, id: s.id, roll: s.roll
        })));
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      Alert.alert("Error", "Failed to fetch students");
    }
  };

  // Handle date picker
  const handleFromConfirm = (date) => {
    setFromDate(date.toLocaleDateString('en-GB'));
    setFromDatePickerVisible(false);
  };

  const handleToConfirm = (date) => {
    setToDate(date.toLocaleDateString('en-GB'));
    setToDatePickerVisible(false);
  };

  const formatDate = (date) => {
    const [day, month, year] = date.split('/');
    return `${year}-${month}-${day}`;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!isFormValid) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (selectedStudents.length === 0) {
      Alert.alert('Error', 'Please select at least one student');
      return;
    }

    const surveyData = {
      mentorId: mentorData[0].id,
      title: title || `${task === 'Collect Fee' ? 'Collect Fee' : task === 'Feedback' ? 'Feedback' : 'Other'} - ${amount || ''}`,
      taskType: task,
      gradeId: grade,
      sectionId: section,
      startDate: formatDate(fromDate),
      endDate: formatDate(toDate),
      amount: task === 'Collect Fee' ? amount : null,
      description,
      students: selectedStudents,
      // Feedback fields if applicable
      term: task === 'Feedback' ? parseInt(term, 10) : null, // Convert term to integer
      clarityTeaching: task === 'Feedback' ? clarityTeaching : null,
      clarityMaterials: task === 'Feedback' ? clarityMaterials : null,
      timeMgmt: task === 'Feedback' ? timeMgmt : null,
      satisfaction: task === 'Feedback' ? satisfaction : null,
    };

    console.log('Submitting survey:', surveyData);

    // API call to create survey

    fetch(`${API_URL}/api/mentor/survey/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(surveyData)
    })
    
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to create survey');
        }
        return response.json();
      })
      .then(data => {
        Alert.alert('Success', 'Survey created successfully');
        navigation.goBack();
      })
      .catch(error => {
        console.error('Error creating survey:', error);
        Alert.alert('Error', error.message || 'Failed to create survey');
      });


    // For demo purposes:
    Alert.alert('Success', 'Survey created successfully');
    // navigation.goBack();
  };

  // Helper function for z-index management
  const getZIndex = (isOpen) => {
    return isOpen ? 9999 : 1;
  };

  // Render different forms based on task type
  const renderFormFields = () => {
    let fields = [
      {
        label: 'Survey Title',
        value: title,
        placeholder: 'Enter survey title',
        onChange: setTitle,
        type: 'input'
      },
      {
        label: 'Start date',
        value: fromDate,
        placeholder: 'Select date',
        onPress: () => setFromDatePickerVisible(true),
        type: 'date'
      },
      {
        label: 'End date',
        value: toDate,
        placeholder: 'Select date',
        onPress: () => setToDatePickerVisible(true),
        type: 'date'
      },
      {
        label: 'Task',
        type: 'task'
      }
    ];

    if (task === 'Collect Fee') {
      fields = [
        ...fields,
        { label: 'Grade', type: 'grade' },
        { label: 'Section', type: 'section' },
        {
          label: 'Amount',
          value: amount,
          placeholder: 'Enter amount',
          onChange: setAmount,
          keyboardType: 'numeric',
          type: 'input'
        },
        {
          label: 'Description',
          value: description,
          placeholder: 'Enter description',
          onChange: setDescription,
          multiline: true,
          type: 'textarea'
        }
      ];
    } else if (task === 'Feedback') {
      fields = [
        ...fields,
        { label: 'Grade', type: 'grade' },
        { label: 'Section', type: 'section' },
        { label: 'Term', type: 'term' },
        {
          label: "Clarity of faculty's teaching (Max : 5)",
          value: clarityTeaching,
          placeholder: 'Enter score',
          onChange: setClarityTeaching,
          keyboardType: 'numeric',
          type: 'input'
        },
        {
          label: 'Clarity of materials provided (Max : 5)',
          value: clarityMaterials,
          placeholder: 'Enter score',
          onChange: setClarityMaterials,
          keyboardType: 'numeric',
          type: 'input'
        },
        {
          label: 'Time management (Max : 5)',
          value: timeMgmt,
          placeholder: 'Enter score',
          onChange: setTimeMgmt,
          keyboardType: 'numeric',
          type: 'input'
        },
        {
          label: 'Overall satisfaction (Max : 5)',
          value: satisfaction,
          placeholder: 'Enter score',
          onChange: setSatisfaction,
          keyboardType: 'numeric',
          type: 'input'
        }
      ];
    } else if (task === 'Other') {
      fields = [
        ...fields,
        { label: 'Grade', type: 'grade' },
        { label: 'Section', type: 'section' },
        {
          label: 'Description',
          value: description,
          placeholder: 'Enter description',
          onChange: setDescription,
          multiline: true,
          type: 'textarea'
        }
      ];
    }

    return fields;
  };

  // Render each form field based on type
  const renderField = (field, index) => {
    switch (field.type) {
      case 'input':
        return (
          <View key={index} style={styles.fieldContainer}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={styles.input}
              value={field.value}
              placeholder={field.placeholder}
              placeholderTextColor="#999"
              onChangeText={field.onChange}
              keyboardType={field.keyboardType || 'default'}
            />
          </View>
        );

      case 'textarea':
        return (
          <View key={index} style={styles.fieldContainer}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={styles.textArea}
              value={field.value}
              placeholder={field.placeholder}
              placeholderTextColor="#999"
              onChangeText={field.onChange}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        );

      case 'date':
        return (
          <View key={index} style={styles.fieldContainer}>
            <Text style={styles.label}>{field.label}</Text>
            <TouchableOpacity onPress={field.onPress}>
              <TextInput
                style={styles.input}
                value={field.value}
                placeholder={field.placeholder}
                placeholderTextColor="#999"
                editable={false}
              />
            </TouchableOpacity>
          </View>
        );

      case 'task':
        return (
          <View key={index} style={[styles.fieldContainer, { zIndex: getZIndex(taskOpen) }]}>
            <Text style={styles.label}>{field.label}</Text>
            <DropDownPicker
              open={taskOpen}
              value={task}
              items={taskItems}
              setOpen={setTaskOpen}
              setValue={setTask}
              setItems={setTaskItems}
              placeholder="Select task"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              zIndex={5000}
              zIndexInverse={1000}
              closeAfterSelecting={true}
            />
          </View>
        );

      case 'grade':
        return (
          <View key={index} style={[styles.fieldContainer, { zIndex: getZIndex(gradeOpen) }]}>
            <Text style={styles.label}>{field.label}</Text>
            <DropDownPicker
              open={gradeOpen}
              value={grade}
              items={gradeItems}
              setOpen={setGradeOpen}
              setValue={setGrade}
              setItems={setGradeItems}
              placeholder="Select Grade"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              zIndex={4000}
              zIndexInverse={2000}
              closeAfterSelecting={true}
            />
          </View>
        );

      case 'section':
        return (
          <View key={index} style={[styles.fieldContainer, { zIndex: getZIndex(sectionOpen) }]}>
            <Text style={styles.label}>{field.label}</Text>
            <DropDownPicker
              open={sectionOpen}
              value={section}
              items={sectionItems}
              setOpen={setSectionOpen}
              setValue={setSection}
              setItems={setSectionItems}
              placeholder="Select Section"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              zIndex={3000}
              zIndexInverse={3000}
              closeAfterSelecting={true}
            />
          </View>
        );

      case 'term':
        return (
          <View key={index} style={[styles.fieldContainer, { zIndex: getZIndex(termOpen) }]}>
            <Text style={styles.label}>{field.label}</Text>
            <DropDownPicker
              open={termOpen}
              value={term}
              items={termItems}
              setOpen={setTermOpen}
              setValue={setTerm}
              setItems={setTermItems}
              placeholder="Select term"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              zIndex={2000}
              zIndexInverse={4000}
              closeAfterSelecting={true}
            />
          </View>
        );

      default:
        return null;
    }
  };

  // Student selection modal
  const renderStudentModal = () => {
    // Sample student data for demonstration

    useEffect(() => {
      fetchStudents();
    }, [section])


    return (
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Students</Text>
            <View style={{ flex: 0 }}>
            <FlatList
              data={students}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                const isSelected = selectedStudents.includes(item.id);
                return (
                  <TouchableOpacity
                    style={styles.studentItem}
                    onPress={() => {
                      setSelectedStudents(prev =>
                        isSelected
                          ? prev.filter(id => id !== item.id)
                          : [...prev, item.id]
                      );
                    }}
                  >
                    <View style={styles.studentInfo}>
                      <View style={styles.avatarContainer}>
                        <Userlogo width={30} height={30} />
                      </View>
                      <View style={styles.studentDetails}>
                        <Text style={styles.studentName}>{item.name}</Text>
                        <Text style={styles.studentRoll}>{item.roll}</Text>
                      </View>
                    </View>
                    <View style={isSelected ? styles.checkboxSelected : styles.checkbox} />
                  </TouchableOpacity>
                );
              }}
            />
            </View>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => {
                setModalVisible(false);
                handleSubmit();
              }}
            >
              <Text style={styles.selectButtonText}>
                Create Survey with {selectedStudents.length} students
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackArrow width={24} height={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Survey</Text>
        </View>
        <View style={styles.divider} />

        <ScrollView
          style={styles.formContainer}
          contentContainerStyle={styles.formContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {renderFormFields().map((field, index) => renderField(field, index))}
          </View>
        </ScrollView>

        <DateTimePickerModal
          isVisible={isFromDatePickerVisible}
          mode="date"
          onConfirm={handleFromConfirm}
          onCancel={() => setFromDatePickerVisible(false)}
        />

        <DateTimePickerModal
          isVisible={isToDatePickerVisible}
          mode="date"
          onConfirm={handleToConfirm}
          onCancel={() => setToDatePickerVisible(false)}
        />

        {renderStudentModal()}

        <View style={styles.bottomBar}>
          {(
            <TouchableOpacity
              style={[
                styles.selectStudentsButton,
                !isFormValid && styles.disabledButton
              ]}
              disabled={!isFormValid}
              onPress={() => isFormValid && setModalVisible(true)}
            >
              <Text style={styles.selectStudentsText}>Select Students</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => navigation.navigate('MentorMain', { mentorData })}
          >
            <Home width={43} height={34} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MentorSurveyRegister;