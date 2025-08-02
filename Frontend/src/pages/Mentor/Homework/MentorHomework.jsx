import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, FlatList } from 'react-native';
import React, { useState, useEffect } from 'react';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Arrow from '../../../assets/MentorPage/arrow.svg';
import styles from './homeworksty';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { API_URL } from '../../../utils/env.js'

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

  const [level, setLevel] = useState('');
  const [levelModalVisible, setLevelModalVisible] = useState(false);
  const [levelItems, setLevelItems] = useState([]);
  const [selectedLevelName, setSelectedLevelName] = useState('');
  const [levelError, setLevelError] = useState('');

  const [date, setDate] = useState('');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

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

  // Fetch levels when subject changes
  useEffect(() => {
    if (grade && subject) {
      fetchLevels(grade, subject);
      setLevelError(''); // Clear level error when subject is selected
    }
  }, [subject]);

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

  const fetchLevels = async (gradeId, subjectId) => {
    try {
      const response = await fetch(`${API_URL}/api/mentor/getLevels?gradeId=${gradeId}&subjectId=${subjectId}`);
      const data = await response.json();
      if (data.success) {
        const formattedLevels = data.levels.map(l => ({
          name: `Level ${l}`,
          id: l.toString()
        }));
        setLevelItems(formattedLevels);
      }
    } catch (error) {
      console.error('Error fetching levels:', error);
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

  const handleLevelSelect = (item) => {
    setLevel(item.id);
    setSelectedLevelName(item.name);
    setLevelModalVisible(false);
  };

  const handleAddHomework = async () => {
    if (!grade || !subject || !section || !level || !date) {
      alert('Please fill all fields');
      return;
    }

    try {
      // Insert homework
      const response = await fetch(`${API_URL}/api/mentor/addHomework`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          grade_id: grade,
          section_id: section,
          subject_id: subject,
          level,
          mentor_id: mentorId // Replace with actual mentor ID from auth
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Homework added successfully');
        navigation.goBack();
      } else {
        alert('Failed to add homework');
      }
    } catch (error) {
      console.error('Error adding homework:', error);
      alert('Failed to add homework');
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
              {date || "Select Date"}
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

          <Text style={styles.label}>Level</Text>
          <TouchableOpacity 
            style={[styles.selectBox, levelError ? styles.errorBox : null]}
            onPress={() => {
              if (!subject) {
                setLevelError('Please select Subject first');
              } else {
                setLevelModalVisible(true);
                setLevelError('');
              }
            }}>
            <Text style={selectedLevelName ? styles.selectedText : styles.placeholderText}>
              {selectedLevelName || "Select Level"}
            </Text>
          </TouchableOpacity>
          {levelError ? <Text style={styles.errorText}>{levelError}</Text> : null}
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

      {/* Level Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={levelModalVisible}
        onRequestClose={() => setLevelModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Level</Text>
            <FlatList
              data={levelItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.modalItem} 
                  onPress={() => handleLevelSelect(item)}>
                  <Text style={styles.modalItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              style={styles.modalList}
            />
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setLevelModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
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