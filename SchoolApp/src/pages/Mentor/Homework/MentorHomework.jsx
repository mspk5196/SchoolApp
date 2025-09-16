import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, FlatList, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Arrow from '../../../assets/MentorPage/arrow.svg';
import styles from './homeworksty';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { API_URL } from '../../../utils/env.js'
import { set } from 'date-fns';

const MentorHomework = ({ navigation, route }) => {
  const { mentorId } = route.params;
  const [grade, setGrade] = useState('');
  const [gradeModalVisible, setGradeModalVisible] = useState(false);
  const [gradeItems, setGradeItems] = useState([]);
  const [selectedGradeName, setSelectedGradeName] = useState('');

  const [section, setSection] = useState('');
  const [sectionModalVisible, setSectionModalVisible] = useState(false);
  const [sectionItems, setSectionItems] = useState([]);
  const [selectedSectionName, setSelectedSectionName] = useState('');
  const [sectionError, setSectionError] = useState('');

  const [subject, setSubject] = useState('');
  const [subjectModalVisible, setSubjectModalVisible] = useState(false);
  const [subjectItems, setSubjectItems] = useState([]);
  const [selectedSubjectName, setSelectedSubjectName] = useState('');
  const [subjectError, setSubjectError] = useState('');

  const [topic, setTopic] = useState('');
  const [topicModalVisible, setTopicModalVisible] = useState(false);
  const [topicItems, setTopicItems] = useState([]);
  const [selectedTopicName, setSelectedTopicName] = useState('');
  const [topicError, setTopicError] = useState('');

  const [batch, setBatch] = useState('');
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [batchItems, setBatchItems] = useState([]);
  const [selectedBatchName, setSelectedBatchName] = useState('');
  const [batchError, setBatchError] = useState('');



  const [date, setDate] = useState('');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [studentSelectionVisible, setStudentSelectionVisible] = useState(false);
  const [allSelected, setAllSelected] = useState(false);

  // Fetch grades on component mount
  useEffect(() => {
    fetchGrades();
  }, []);

  // Fetch subjects when grade changes
  useEffect(() => {
    if (grade) {
      fetchSections(grade);
      setSectionError(''); // Clear section error when grade is selected
    }
  }, [grade]);

  useEffect(() => {
    if (section) {
      fetchSubjects(section);
      setSubjectError(''); // Clear subject error when section is selected
    }
  }, [section]);

  useEffect(() => {
    if (subject && section && grade) {
      fetchTopics(subject, grade);
      fetchBatches(subject, section);
      setTopicError(''); // Clear topic error when subject is selected
      setBatchError(''); // Clear batch error when subject is selected
    }
  }, [subject, section, grade]);

  const formatDate = (input) => {
    const [day, month, year] = input.split('/');
    return `${year}-${month}-${day}`; // ➜ '2025-05-16'
  };

  const fetchGrades = async () => {
    try {
      const response = await fetch(`${API_URL}/api/mentor/getGrades`);
      const data = await response.json();
      if (data.success) {
        const formattedGrades = data.grades.map(g => ({
          name: g.grade_name,
          id: g.id.toString()
        }));
        setGradeItems(formattedGrades);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const fetchSubjects = async (sectionId) => {
    try {
      const response = await fetch(`${API_URL}/api/mentor/getSectionSubjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionId
        }),
      });
      const data = await response.json();
      setTopicItems([]);
      setSelectedTopicName('');
      setBatch('');
      setBatchError('');
      setBatchItems([]);
      setSelectedBatchName('')
      if (data.success) {
        const formattedSubjects = data.subjects.map(s => ({
          name: s.subject_name,
          id: s.subject_id
        }));
        setSubjectItems(formattedSubjects);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchSections = async (gradeId) => {
    try {
      const response = await fetch(`${API_URL}/api/mentor/sections/${gradeId}`);
      const data = await response.json();
      if (data.success) {
        const formattedSections = data.sections.map(s => ({
          name: s.section_name,
          id: s.id.toString()
        }));
        setSectionItems(formattedSections);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const fetchTopics = async (subjectId, gradeId) => {
    try {
      const response = await fetch(`${API_URL}/api/mentor/topic-hierarchy/get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjectId,
          gradeId
        }),
      });
      const data = await response.json();

      if (data.success && data.data && data.data.hierarchy) {
        // console.log("Fetched Topics Hierarchy:", data.data.hierarchy);

        // Function to recursively flatten the hierarchy with breadcrumb paths
        const flattenHierarchy = (topics, parentPath = '') => {
          let flattenedTopics = [];

          topics.forEach(topic => {
            // Build the current path (breadcrumb)
            const currentPath = parentPath ? `${parentPath} > ${topic.topic_name}` : topic.topic_name;

            // Add the current topic
            flattenedTopics.push({
              name: currentPath,
              id: topic.id.toString(),
              originalName: topic.topic_name,
              breadcrumb: currentPath,
              is_bottom_level: topic.is_bottom_level,
              full_topic_name: topic.full_topic_name
            });

            // If this topic has children, recursively add them
            if (topic.children && topic.children.length > 0) {
              const childTopics = flattenHierarchy(topic.children, currentPath);
              flattenedTopics = flattenedTopics.concat(childTopics);
            }
          });

          return flattenedTopics;
        };

        // Get the flattened hierarchy with breadcrumbs
        const allTopics = flattenHierarchy(data.data.hierarchy);

        // console.log("Flattened Topics with Breadcrumbs:", allTopics);

        setTopicItems(allTopics);
      } else {
        console.log("No topics found or API error:", data);
        setTopicItems([]);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
      setTopicItems([]);
    }
  };

  const fetchBatches = async (subjectId, sectionId) => {
    try {
      const response = await fetch(`${API_URL}/api/mentor/batches/${sectionId}/${subjectId}`);
      const data = await response.json();
      // console.log("Fetched Batches Response:", data);

      if (data.success && data.data) {
        const formattedBatches = data.data.map(b => ({
          name: b.batch_name || `Batch ${b.batch_number}`,
          id: b.id.toString()
        }));
        setBatchItems(formattedBatches);
        // console.log("Formatted Batches:", formattedBatches);
        // console.log("Fetched Students:", data);
        
      } else {
        console.log("No batches found or API error:", data);
        setBatchItems([]);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      setBatchItems([]);
    }
  };

  const fetchBatchStudents = async (selectedBatchName) => {
    try {
      const response = await fetch(`${API_URL}/api/mentor/batches/details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batch_name: selectedBatchName,
          section_id: section,
          subject_id: subject
        }),
      });
      const data = await response.json();
      // console.log("Fetched Batch Students Response:", data);

      if (data.success && data.students) {
        setStudents(data.students);
        setSelectedStudents([]);
        setAllSelected(false);
        console.log("Batch Students:", data.students);
      } else {
        console.log("No students found or API error:", data);
        setStudents([]);
        setSelectedStudents([]);
        setAllSelected(false);
      }
    } catch (error) {
      console.error('Error fetching batch students:', error);
      setStudents([]);
      setSelectedStudents([]);
      setAllSelected(false);
    }
  };

  const handleConfirm = selectedDate => {
    const formatted = selectedDate.toLocaleDateString('en-GB');
    setDate(formatDate(formatted));
    setDatePickerVisible(false);
  };

  const handleGradeSelect = (item) => {
    setGrade(item.id);
    setSelectedGradeName(item.name);
    setGradeModalVisible(false);
  };

  const handleSectionSelect = (item) => {
    setSection(item.id);
    setSelectedSectionName(item.name);
    setSectionModalVisible(false);
  };

  const handleSubjectSelect = (item) => {
    setSubject(item.id);
    setSelectedSubjectName(item.name);
    setSubjectModalVisible(false);
  };

  const handleTopicSelect = (item) => {
    setTopic(item.id);
    setSelectedTopicName(item.breadcrumb); // Show the full breadcrumb path in selected display
    setTopicModalVisible(false);
  };

  const handleBatchSelect = (item) => {
    setBatch(item.id);
    setSelectedBatchName(item.name);
    setBatchModalVisible(false);
  };

  const toggleStudentSelection = (studentRoll) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentRoll)) {
        const newSelection = prev.filter(roll => roll !== studentRoll);
        setAllSelected(newSelection.length === students.length);
        return newSelection;
      } else {
        const newSelection = [...prev, studentRoll];
        setAllSelected(newSelection.length === students.length);
        return newSelection;
      }
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedStudents([]);
      setAllSelected(false);
    } else {
      setSelectedStudents(students.map(s => s.student_roll));
      setAllSelected(true);
    }
  };

  const handleAddHomework = async () => {
    if (!grade || !subject || !section || !topic || !batch || !date) {
      Alert.alert('Please fill all fields');
      return;
    }

    // Fetch students and show selection modal
    await fetchBatchStudents(selectedBatchName);
    setStudentSelectionVisible(true);
  };

  const submitHomework = async () => {
    if (selectedStudents.length === 0) {
      Alert.alert('Please select at least one student');
      return;
    }

    try {
      // Submit homework with selected students
      const response = await fetch(`${API_URL}/api/mentor/addHomework`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completion_date: date,
          grade_id: grade,
          section_id: section,
          subject_id: subject,
          batch_id: batch,
          topic_id: topic,
          created_by: mentorId,
          student_rolls: selectedStudents,
          due_date: date
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Homework assigned successfully');
        setStudentSelectionVisible(false);
        navigation.goBack();
      } else {
        Alert.alert('Failed to assign homework');
      }
    } catch (error) {
      console.error('Error assigning homework:', error);
      Alert.alert('Failed to assign homework');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Arrow width={wp('9%')} height={wp('9%')} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Homework</Text>
      </View>
      <View style={styles.headerBorder} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 15,
          flexGrow: 1,
          paddingBottom: 100, // Add padding for the fixed button
        }}
        keyboardShouldPersistTaps="handled">
        <View style={styles.formContainer}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity onPress={() => setDatePickerVisible(true)} style={styles.selectBox}>
            <Text style={date ? styles.selectedText : styles.placeholderText}>
              {date || "Select Completion Date"}
            </Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirm}
            onCancel={() => setDatePickerVisible(false)}
            display="spinner"
          />

          <Text style={styles.label}>Grade</Text>
          <TouchableOpacity
            style={styles.selectBox}
            onPress={() => setGradeModalVisible(true)}>
            <Text style={selectedGradeName ? styles.selectedText : styles.placeholderText}>
              {selectedGradeName || "Select Grade"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Section</Text>
          <TouchableOpacity
            style={[styles.selectBox, sectionError ? styles.errorBox : null]}
            onPress={() => {
              if (!grade) {
                setSectionError('Please select Grade first');
              } else {
                setSectionModalVisible(true);
                setSectionError('');
              }
            }}>
            <Text style={selectedSectionName ? styles.selectedText : styles.placeholderText}>
              {selectedSectionName || "Select Section"}
            </Text>
          </TouchableOpacity>
          {sectionError ? <Text style={styles.errorText}>{sectionError}</Text> : null}

          <Text style={styles.label}>Subject</Text>
          <TouchableOpacity
            style={[styles.selectBox, subjectError ? styles.errorBox : null]}
            onPress={() => {
              if (!section) {
                setSubjectError('Please select Section first');
              } else {
                setSubjectModalVisible(true);
                setSubjectError('');
              }
            }}>
            <Text style={selectedSubjectName ? styles.selectedText : styles.placeholderText}>
              {selectedSubjectName || "Select Subject"}
            </Text>
          </TouchableOpacity>
          {subjectError ? <Text style={styles.errorText}>{subjectError}</Text> : null}

          <Text style={styles.label}>Topic</Text>
          <TouchableOpacity
            style={[styles.selectBox, topicError ? styles.errorBox : null]}
            onPress={() => {
              if (!subject) {
                setTopicError('Please select Subject first');
              } else {
                setTopicModalVisible(true);
                setTopicError('');
              }
            }}>
            <Text style={selectedTopicName ? styles.selectedText : styles.placeholderText}>
              {selectedTopicName || "Select Topic"}
            </Text>
          </TouchableOpacity>
          {topicError ? <Text style={styles.errorText}>{topicError}</Text> : null}

          <Text style={styles.label}>Batch</Text>
          <TouchableOpacity
            style={[styles.selectBox, batchError ? styles.errorBox : null]}
            onPress={() => {
              if (!subject) {
                setBatchError('Please select Subject first');
              } else {
                setBatchModalVisible(true);
                setBatchError('');
              }
            }}>
            <Text style={selectedBatchName ? styles.selectedText : styles.placeholderText}>
              {selectedBatchName || "Select Batch"}
            </Text>
          </TouchableOpacity>
          {batchError ? <Text style={styles.errorText}>{batchError}</Text> : null}
        </View>
      </ScrollView>

      {/* Grade Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={gradeModalVisible}
        onRequestClose={() => setGradeModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Grade</Text>
            <FlatList
              data={gradeItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleGradeSelect(item)}>
                  <Text style={styles.modalItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              style={styles.modalList}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setGradeModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Section Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={sectionModalVisible}
        onRequestClose={() => setSectionModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Section</Text>
            <FlatList
              data={sectionItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSectionSelect(item)}>
                  <Text style={styles.modalItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              style={styles.modalList}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSectionModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Subject Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={subjectModalVisible}
        onRequestClose={() => setSubjectModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Subject</Text>
            <FlatList
              data={subjectItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSubjectSelect(item)}>
                  <Text style={styles.modalItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              style={styles.modalList}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSubjectModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Topic Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={topicModalVisible}
        onRequestClose={() => setTopicModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Topic</Text>
            <FlatList
              data={topicItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    item.is_bottom_level === 1 ? styles.selectableTopicItem : styles.parentTopicItem
                  ]}
                  onPress={() => handleTopicSelect(item)}>
                  <Text style={[
                    styles.modalItemText,
                    item.is_bottom_level === 1 ? styles.selectableTopicText : styles.parentTopicText
                  ]}>
                    {item.name}
                  </Text>
                  {item.is_bottom_level !== 1 && (
                    <Text style={styles.parentIndicator}>(Parent)</Text>
                  )}
                </TouchableOpacity>
              )}
              style={styles.modalList}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setTopicModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Batch Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={batchModalVisible}
        onRequestClose={() => setBatchModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Batch</Text>
            <FlatList
              data={batchItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleBatchSelect(item)}>
                  <Text style={styles.modalItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              style={styles.modalList}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setBatchModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Student Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={studentSelectionVisible}
        onRequestClose={() => setStudentSelectionVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { height: '80%' }]}>
            <Text style={styles.modalTitle}>Select Students</Text>

            <TouchableOpacity
              style={styles.selectAllButton}
              onPress={toggleSelectAll}>
              <View style={[styles.checkbox, allSelected && styles.checkboxSelected]}>
                {allSelected && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.selectAllText}>Select All ({students.length})</Text>
            </TouchableOpacity>

            <FlatList
              data={students}
              keyExtractor={(item) => item.student_roll}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.studentItem}
                  onPress={() => toggleStudentSelection(item.student_roll)}>
                  <View style={[styles.checkbox, selectedStudents.includes(item.student_roll) && styles.checkboxSelected]}>
                    {selectedStudents.includes(item.student_roll) && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{item.student_name}</Text>
                    <Text style={styles.studentRoll}>Roll: {item.student_roll}</Text>
                  </View>
                </TouchableOpacity>
              )}
              style={styles.modalList}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.closeButton, { flex: 1, marginRight: 10 }]}
                onPress={() => setStudentSelectionVisible(false)}>
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmButton, { flex: 1, marginLeft: 10 }]}
                onPress={submitHomework}>
                <Text style={styles.confirmText}>
                  Assign ({selectedStudents.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleAddHomework}>
          <Text style={styles.confirmText}>Add Homework</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MentorHomework;