import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Modal, Pressable } from 'react-native';
import BackIcon from '../../../assets/GeneralAssests/backarrow.svg';
import AddIcon from '../../../assets/SubjectActivityEnrollment/Add.svg';
import DeleteIcon from '../../../assets/SubjectActivityEnrollment/Delete.svg';
import CancelIcon from '../../../assets/SubjectActivityEnrollment/Cancel.svg';
import AddIcon2 from '../../../assets/SubjectActivityEnrollment/Add2.svg';
import { styles } from './SubjectAllotmentStyle';

const SubjectAllotment = ({ navigation }) => {
  const [activeSection, setActiveSection] = useState('B');
  const [subjects, setSubjects] = useState([
    {
      id: 1,
      name: 'Tamil',
      categories: ['Academic', 'Assessment']
    },
    {
      id: 2,
      name: 'English',
      categories: ['Academic', 'Assessment']
    }
  ]);

  const sections = ['A', 'B', 'C', 'D', 'E'];
  
  // State variables for modals
  const [showSubjectTypeModal, setShowSubjectTypeModal] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [subjectTypeOptions, setSubjectTypeOptions] = useState(['Academic', 'Assessment', 'Extra-Curricular']);
  
  // State for the floating action buttons
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  
  // State for Add Subject modal - now with multiple inputs
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [subjectInputs, setSubjectInputs] = useState(['']);
  
  // State for Add Activity (Subject Type) modal - now with multiple inputs
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [activityInputs, setActivityInputs] = useState(['']);

  // Add proper state for subjectTitleModal
  const [subjectTitleModal, setSubjectTitleModal] = useState(false);
  const [subjectTitles] = useState(['Tamil', 'English', 'Maths', 'Science', 'Social']);
  
  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const handleAddCategory = (subjectId, category) => {
    setSubjects(subjects.map(subject => {
      if (subject.id === subjectId) {
        // Only add if the category doesn't already exist
        if (!subject.categories.includes(category)) {
          return {
            ...subject,
            categories: [...subject.categories, category]
          };
        }
      }
      return subject;
    }));
    setShowSubjectTypeModal(false);
  };

  const handleRemoveSubject = (subjectId) => {
    setSubjects(subjects.filter(subject => subject.id !== subjectId));
  };

  const handleRemoveCategory = (subjectId, category) => {
    setSubjects(subjects.map(subject => {
      if (subject.id === subjectId) {
        return {
          ...subject,
          categories: subject.categories.filter(cat => cat !== category)
        };
      }
      return subject;
    }));
  };

  const handleSelectSubjectTitle = (title) => {
    // Add the selected subject title to the subjects list
    const newSubject = {
      id: subjects.length > 0 ? Math.max(...subjects.map(s => s.id)) + 1 : 1,
      name: title,
      categories: []
    };
    
    setSubjects([...subjects, newSubject]);
    setSubjectTitleModal(false);
    setIsAddMenuOpen(false);
  };
  
  const handleAddMoreSubject = () => {
    // Reset subject inputs to a single empty input
    setSubjectInputs(['']);
    setShowAddSubjectModal(true);
    setIsAddMenuOpen(false);
  };
  
  const handleAddMoreActivity = () => {
    // Reset activity inputs to a single empty input
    setActivityInputs(['']);
    setShowAddActivityModal(true);
    setIsAddMenuOpen(false);
  };

  const openSubjectTypeModal = (subjectId) => {
    setSelectedSubjectId(subjectId);
    setShowSubjectTypeModal(true);
  };
  
  // Handle adding another subject input field
  const addSubjectInput = () => {
    setSubjectInputs([...subjectInputs, '']);
  };
  
  // Handle adding another activity input field
  const addActivityInput = () => {
    setActivityInputs([...activityInputs, '']);
  };
  
  // Handle updating a specific subject input
  const updateSubjectInput = (text, index) => {
    const newInputs = [...subjectInputs];
    newInputs[index] = text;
    setSubjectInputs(newInputs);
  };
  
  // Handle updating a specific activity input
  const updateActivityInput = (text, index) => {
    const newInputs = [...activityInputs];
    newInputs[index] = text;
    setActivityInputs(newInputs);
  };
  
  // Submit all subject inputs
  const submitSubjects = () => {
    // Filter out empty inputs
    const validSubjects = subjectInputs.filter(input => input.trim() !== '');
    
    if (validSubjects.length > 0) {
      const maxId = subjects.length > 0 ? Math.max(...subjects.map(s => s.id)) : 0;
      
      const newSubjects = validSubjects.map((name, index) => ({
        id: maxId + index + 1,
        name: name.trim(),
        categories: []
      }));
      
      setSubjects([...subjects, ...newSubjects]);
      setShowAddSubjectModal(false);
      setSubjectInputs(['']); // Reset to one empty input
    }
  };
  
  // Submit all activity inputs
  const submitActivities = () => {
    // Filter out empty inputs and inputs already in options
    const validActivities = activityInputs
      .filter(input => input.trim() !== '' && !subjectTypeOptions.includes(input.trim()));
    
    if (validActivities.length > 0) {
      setSubjectTypeOptions([...subjectTypeOptions, ...validActivities]);
      setShowAddActivityModal(false);
      setActivityInputs(['']); // Reset to one empty input
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackIcon 
          width={styles.BackIcon.width} 
          height={styles.BackIcon.height} 
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTxt}>Subject Enrollment</Text>
      </View>

      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sectionTabsContainer}
        style={{flexGrow: 0}}
        nestedScrollEnabled={true}
      >
        {sections.map(section => (
          <TouchableOpacity
            key={section}
            style={[styles.sectionTab, activeSection === section && styles.activeSectionTab]}
            onPress={() => handleSectionChange(section)}
          >
            <Text style={[styles.sectionTabText, activeSection === section && styles.activeSectionTabText]}>
              Section {section}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Subject List */}
      <ScrollView style={styles.subjectList}>
        {subjects.map(subject => (
          <View key={subject.id} style={styles.subjectCard}>
            <View style={styles.subjectHeader}>
              <Text style={styles.subjectName}>{subject.name}</Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  onPress={() => openSubjectTypeModal(subject.id)}
                  style={styles.actionButton}
                >
                 <AddIcon2 width={18} height={18} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleRemoveSubject(subject.id)}
                  style={styles.actionButton}
                >
                   <DeleteIcon width={20} height={20} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.categoryContainer}>
              {subject.categories.map(category => (
                <View key={category} style={styles.categoryItem}>
                  <Text style={styles.categoryName}>{category}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveCategory(subject.id, category)}
                    style={styles.removeCategory}
                  >
                    <CancelIcon width={15} height={15} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        ))}
        {/* Extra space at the bottom to ensure the FAB doesn't cover content */}
        <View style={{ height: 150 }} />
      </ScrollView>

      {/* Subject Type Selection Modal */}
      <Modal
        transparent={true}
        visible={showSubjectTypeModal}
        animationType="fade"
        onRequestClose={() => setShowSubjectTypeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSubjectTypeModal(false)}
        >
          <View style={styles.listModalContainer} onStartShouldSetResponder={() => true}>
            {subjectTypeOptions.map(item => (
              <TouchableOpacity
                key={item}
                style={styles.listModalItem}
                onPress={() => handleAddCategory(selectedSubjectId, item)}
              >
                <Text style={styles.listModalItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Subject Title Modal */}
      <Modal
        transparent={true}
        visible={subjectTitleModal}
        animationType="fade"
        onRequestClose={() => setSubjectTitleModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSubjectTitleModal(false)}
        >
          <View style={styles.listModalContainer} onStartShouldSetResponder={() => true}>
            {subjectTitles.map(item => (
              <TouchableOpacity
                key={item}
                style={styles.listModalItem}
                onPress={() => handleSelectSubjectTitle(item)}
              >
                <Text style={styles.listModalItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Subject Modal with Multiple Inputs */}
      <Modal
        transparent={true}
        visible={showAddSubjectModal}
        animationType="fade"
        onRequestClose={() => setShowAddSubjectModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAddSubjectModal(false)}
        >
          <View 
            style={styles.formModalContainer}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.modalTitle}>Subject</Text>
            
            {/* ScrollView for subject inputs */}
            <ScrollView 
              style={styles.inputScrollView}
              contentContainerStyle={styles.inputScrollViewContent}
            >
              {/* Map through all subject inputs */}
              {subjectInputs.map((input, index) => (
                <TextInput
                  key={`subject-${index}`}
                  style={[styles.input, { marginBottom: 10 }]}
                  placeholder={`Enter subject ${index + 1}`}
                  value={input}
                  onChangeText={(text) => updateSubjectInput(text, index)}
                />
              ))}
            </ScrollView>
            
            <TouchableOpacity style={styles.addMoreButton} onPress={addSubjectInput}>
              <Text style={styles.addMoreButtonText}>+ Add more Subject</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.enrollButton}
              onPress={submitSubjects}
            >
              <Text style={styles.enrollButtonText}>Enroll Subject</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Activity Modal with Multiple Inputs */}
      <Modal
        transparent={true}
        visible={showAddActivityModal}
        animationType="fade"
        onRequestClose={() => setShowAddActivityModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAddActivityModal(false)}
        >
          <View 
            style={styles.formModalContainer}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.modalTitle}>Activity</Text>
            
            {/* ScrollView for activity inputs */}
            <ScrollView 
              style={styles.inputScrollView}
              contentContainerStyle={styles.inputScrollViewContent}
            >
              {/* Map through all activity inputs */}
              {activityInputs.map((input, index) => (
                <TextInput
                  key={`activity-${index}`}
                  style={[styles.input, { marginBottom: 10 }]}
                  placeholder={`Enter activity ${index + 1}`}
                  value={input}
                  onChangeText={(text) => updateActivityInput(text, index)}
                />
              ))}
            </ScrollView>
            
            <TouchableOpacity style={styles.addMoreButton} onPress={addActivityInput}>
              <Text style={styles.addMoreButtonText}>+ Add more Activity</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.enrollButton}
              onPress={submitActivities}
            >
              <Text style={styles.enrollButtonText}>Add Activity</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Menu Options when Add Button is clicked */}
      {isAddMenuOpen && (
        <View style={styles.floatingMenu}>
          <Pressable
            style={styles.menuButton}
            onPress={() => setSubjectTitleModal(true)}
          >
            <Text style={styles.menuButtonText}>+ New Subject</Text>
          </Pressable>
          
          <Pressable
            style={styles.menuButton}
            onPress={handleAddMoreSubject}
          >
            <Text style={styles.menuButtonText}>+ Add More Subject</Text>
          </Pressable>
          
          <Pressable
            style={styles.menuButton}
            onPress={handleAddMoreActivity}
          >
            <Text style={styles.menuButtonText}>+ Add More Activity</Text>
          </Pressable>
        </View>
      )}

      {/* Main Add Button (Floating Action Button) */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setIsAddMenuOpen(!isAddMenuOpen)}
      >
        <AddIcon width={20} height={20} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default SubjectAllotment;