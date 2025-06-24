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
import { API_URL } from '../../../../utils/env.js';
import styles from "./surveyfoldersty";

// Import SVG components
import BackArrow from '../../../../assets/MentorPage/backarrow.svg';  
import Home from '../../../../assets/MentorPage/Home2.svg';
import Add from '../../../../assets/MentorPage/Add.svg';
import Userlogo from '../../../../assets/MentorPage/userlogo.svg';
import Remove from '../../../../assets/MentorPage/rejected.svg'; // Assuming you have a remove icon

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
  const [term, setTerm] = useState('');

  // --- NEW: Dynamic questions for feedback ---
  const [questions, setQuestions] = useState([{ question_text: '', answer_type: 'Text' }]);
  const [questionAnswerTypeOpen, setQuestionAnswerTypeOpen] = useState({});

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

  const [isFormValid, setIsFormValid] = useState(false);
  const [students, setStudents] = useState([]);

  // Validate form based on task type
  useEffect(() => {
    let valid = false;
    if (title && fromDate && toDate && task && grade && section) {
      if (task === 'Collect Fee') {
        valid = !!amount;
      } else if (task === 'Feedback') {
        const questionsValid = questions.every(q =>
          q.question_text.trim() !== '' &&
          // (q.answer_type === 'Text' || (q.answer_type === 'Options' && q.max_score > 0 && q.max_score <= 5))
          (q.answer_type === 'Text' || (q.answer_type === 'Options'))
        );
        valid = !!term && questions.length > 0 && questionsValid;
      } else if (task === 'Other') {
        valid = !!description;
      }
    }
    setIsFormValid(valid);
  }, [title, fromDate, toDate, task, grade, section, amount, description, term, questions]);

  // Fetch grades on component mount
  useEffect(() => { fetchGrades(); }, []);
  // Fetch sections when grade changes
  useEffect(() => { if (grade) fetchSections(); }, [grade]);
  // Fetch students when section changes
  useEffect(() => { if (section) fetchStudents(); }, [section]);

  const fetchGrades = () => {
    fetch(`${API_URL}/api/mentor/survey/getGrades`)
      .then(res => res.json()).then(data => {
        if (data.success) setGradeItems(data.grades.map(g => ({ label: g.grade_name, value: g.id })));
      }).catch(err => Alert.alert("Error", "Failed to fetch grades"));
  };

  const fetchSections = () => {
    fetch(`${API_URL}/api/mentor/survey/getGradeSections?gradeId=${grade}`)
      .then(res => res.json()).then(data => {
        if (data.success) setSectionItems(data.sections.map(s => ({ label: s.section_name, value: s.id })));
      }).catch(err => Alert.alert("Error", "Failed to fetch sections"));
  };

  const fetchStudents = () => {
    fetch(`${API_URL}/api/mentor/survey/getMentorStudents?sectionId=${section}`)
      .then(res => res.json()).then(data => {
        if (data.success) setStudents(data.students.map(s => ({ name: s.name, id: s.id, roll: s.roll })));
      }).catch(err => Alert.alert("Error", "Failed to fetch students"));
  };

  const handleFromConfirm = (date) => { setFromDate(date.toLocaleDateString('en-GB')); setFromDatePickerVisible(false); };
  const handleToConfirm = (date) => { setToDate(date.toLocaleDateString('en-GB')); setToDatePickerVisible(false); };
  const formatDate = (date) => { const [day, month, year] = date.split('/'); return `${year}-${month}-${day}`; };

  const handleSubmit = () => {
    if (!isFormValid) { Alert.alert('Error', 'Please fill in all required fields correctly.'); return; }
    if (selectedStudents.length === 0) { Alert.alert('Error', 'Please select at least one student'); return; }

    const surveyData = {
      mentorId: mentorData[0].id,
      title,
      taskType: task,
      gradeId: grade,
      sectionId: section,
      startDate: formatDate(fromDate),
      endDate: formatDate(toDate),
      description,
      students: selectedStudents,
      term: task === 'Feedback' ? term : null,
      amount: task === 'Collect Fee' ? amount : null,
      questions: task === 'Feedback' ? questions : null,
    };

    fetch(`${API_URL}/api/mentor/survey/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(surveyData)
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          Alert.alert('Success', 'Survey created successfully');
          navigation.goBack();
        } else {
          throw new Error(data.message || 'Failed to create survey');
        }
      })
      .catch(error => {
        console.error('Error creating survey:', error);
        Alert.alert('Error', error.message);
      });
  };

  // --- NEW: Question handlers ---
  const handleAddQuestion = () => {
    setQuestions([...questions, { question_text: '', answer_type: 'Text'}]);
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    // if (field === 'answer_type' && value === 'Text') {
    //   newQuestions[index].max_score = null;
    // }
    setQuestions(newQuestions);
  };

  const toggleAnswerTypeDropdown = (index, isOpen) => {
    setQuestionAnswerTypeOpen(prev => ({ ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}), [index]: isOpen }));
  };

  // --- NEW: Render dynamic feedback questions ---
  const renderFeedbackQuestions = () => (
    <View style={{ zIndex: 1 }}>
      <Text style={[styles.label, { marginTop: 10 }]}>Feedback Questions</Text>
      {questions.map((q, index) => (
        <View key={index} style={[styles.questionContainer, { zIndex: questions.length - index }]}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionLabel}>Question {index + 1}</Text>
            {questions.length > 1 && (
              <TouchableOpacity onPress={() => handleRemoveQuestion(index)}>
                <Remove width={20} height={20} />
              </TouchableOpacity>
            )}
          </View>
          <TextInput
            style={styles.input}
            placeholder="Enter question text"
            placeholderTextColor="#999"
            value={q.question_text}
            onChangeText={(text) => handleQuestionChange(index, 'question_text', text)}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', zIndex: 5000 - index * 10 }}>
            <View style={{ flex: 1, marginRight: q.answer_type === 'Options' ? 10 : 0 }}>
              <Text style={styles.label}>Answer Type</Text>
              <DropDownPicker
                open={questionAnswerTypeOpen[index] || false}
                value={q.answer_type}
                items={[{ label: 'Text Input', value: 'Text' }, { label: 'Options (Score)', value: 'Options' }]}
                setOpen={(isOpen) => toggleAnswerTypeDropdown(index, isOpen)}
                setValue={(callback) => handleQuestionChange(index, 'answer_type', callback())}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                placeholder="Select Type"
                zIndex={5000 - index * 10}
              />
            </View>
            {/* {q.answer_type === 'Options' && (
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.label}>Max Score (1-5)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 5"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  value={String(q.max_score || '')}
                  onChangeText={(text) => handleQuestionChange(index, 'max_score', parseInt(text) || 0)}
                  maxLength={1}
                />
              </View>
            )} */}
          </View>
        </View>
      ))}
      <TouchableOpacity style={styles.addQuestionButton} onPress={handleAddQuestion}>
        <Add width={16} height={16} style={{ marginRight: 8 }} />
        <Text style={styles.addQuestionButtonText}>Add Another Question</Text>
      </TouchableOpacity>
    </View>
  );

  const getZIndex = (isOpen) => isOpen ? 9999 : 1;

  const renderFormFields = () => {
    const baseFields = (
      <>
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Survey Title</Text>
          <TextInput style={styles.input} value={title} placeholder="Enter survey title" onChangeText={setTitle} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={[styles.fieldContainer, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Start date</Text>
            <TouchableOpacity onPress={() => setFromDatePickerVisible(true)}>
              <TextInput style={styles.input} value={fromDate} placeholder="Select date" editable={false} />
            </TouchableOpacity>
          </View>
          <View style={[styles.fieldContainer, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.label}>End date</Text>
            <TouchableOpacity onPress={() => setToDatePickerVisible(true)}>
              <TextInput style={styles.input} value={toDate} placeholder="Select date" editable={false} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.fieldContainer, { zIndex: getZIndex(taskOpen) }]}>
          <Text style={styles.label}>Task</Text>
          <DropDownPicker open={taskOpen} value={task} items={taskItems} setOpen={setTaskOpen} setValue={setTask} setItems={setTaskItems} placeholder="Select task" style={styles.dropdown} dropDownContainerStyle={styles.dropdownContainer} zIndex={5000} />
        </View>
      </>
    );

    if (!task) return baseFields;

    const commonDropdowns = (
      <>
        <View style={[styles.fieldContainer, { zIndex: getZIndex(gradeOpen) }]}>
          <Text style={styles.label}>Grade</Text>
          <DropDownPicker open={gradeOpen} value={grade} items={gradeItems} setOpen={setGradeOpen} setValue={setGrade} placeholder="Select Grade" style={styles.dropdown} dropDownContainerStyle={styles.dropdownContainer} zIndex={4000} />
        </View>
        <View style={[styles.fieldContainer, { zIndex: getZIndex(sectionOpen) }]}>
          <Text style={styles.label}>Section</Text>
          <DropDownPicker open={sectionOpen} value={section} items={sectionItems} setOpen={setSectionOpen} setValue={setSection} placeholder="Select Section" style={styles.dropdown} dropDownContainerStyle={styles.dropdownContainer} zIndex={3000} />
        </View>
      </>
    );

    let specificFields;
    if (task === 'Collect Fee') {
      specificFields = (
        <>
          {commonDropdowns}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Amount</Text>
            <TextInput style={styles.input} value={amount} placeholder="Enter amount" onChangeText={setAmount} keyboardType="numeric" />
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput style={styles.textArea} value={description} placeholder="Enter description" onChangeText={setDescription} multiline />
          </View>
        </>
      );
    } else if (task === 'Feedback') {
      specificFields = (
        <>
          {commonDropdowns}
          <View style={[styles.fieldContainer, { zIndex: getZIndex(termOpen) }]}>
            <Text style={styles.label}>Term</Text>
            <DropDownPicker open={termOpen} value={term} items={termItems} setOpen={setTermOpen} setValue={setTerm} placeholder="Select term" style={styles.dropdown} dropDownContainerStyle={styles.dropdownContainer} zIndex={2000} />
          </View>
          {renderFeedbackQuestions()}
        </>
      );
    } else if (task === 'Other') {
      specificFields = (
        <>
          {commonDropdowns}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput style={styles.textArea} value={description} placeholder="Enter description" onChangeText={setDescription} multiline />
          </View>
        </>
      );
    }

    return <>{baseFields}{specificFields}</>;
  };

  const renderStudentModal = () => (
    <Modal visible={isModalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Students</Text>
          <FlatList
            data={students}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const isSelected = selectedStudents.includes(item.id);
              return (
                <TouchableOpacity style={styles.studentItem} onPress={() => { setSelectedStudents(prev => isSelected ? prev.filter(id => id !== item.id) : [...prev, item.id]); }}>
                  <View style={styles.studentInfo}>
                    <View style={styles.avatarContainer}><Userlogo width={30} height={30} /></View>
                    <View style={styles.studentDetails}><Text style={styles.studentName}>{item.name}</Text><Text style={styles.studentRoll}>{item.roll}</Text></View>
                  </View>
                  <View style={isSelected ? styles.checkboxSelected : styles.checkbox} />
                </TouchableOpacity>
              );
            }}
          />
          <TouchableOpacity style={styles.selectButton} onPress={() => { setModalVisible(false); handleSubmit(); }}>
            <Text style={styles.selectButtonText}>Create Survey with {selectedStudents.length} students</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><BackArrow width={24} height={24} /></TouchableOpacity>
          <Text style={styles.headerTitle}>Create Survey</Text>
        </View>
        <View style={styles.divider} />
        <ScrollView style={styles.formContainer} contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>{renderFormFields()}</View>
        </ScrollView>
        <DateTimePickerModal isVisible={isFromDatePickerVisible} mode="date" onConfirm={handleFromConfirm} onCancel={() => setFromDatePickerVisible(false)} />
        <DateTimePickerModal isVisible={isToDatePickerVisible} mode="date" onConfirm={handleToConfirm} onCancel={() => setToDatePickerVisible(false)} />
        {renderStudentModal()}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={[styles.selectStudentsButton, !isFormValid && styles.disabledButton]} disabled={!isFormValid} onPress={() => isFormValid && setModalVisible(true)}>
            <Text style={styles.selectStudentsText}>Select Students</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('MentorMain', { mentorData })}>
            <Home width={43} height={34} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MentorSurveyRegister;