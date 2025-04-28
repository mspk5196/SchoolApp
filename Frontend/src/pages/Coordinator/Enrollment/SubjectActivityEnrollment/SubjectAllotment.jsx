import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Modal, Pressable, Alert } from 'react-native';
import BackIcon from '../../../../assets/CoordinatorPage/SubjectActivityEnrollment/Back.svg';
import AddIcon from '../../../../assets/CoordinatorPage/SubjectActivityEnrollment/Add.svg';
import DeleteIcon from '../../../../assets/CoordinatorPage/SubjectActivityEnrollment/Delete.svg';
import CancelIcon from '../../../../assets/CoordinatorPage/SubjectActivityEnrollment/Cancel.svg';
import AddIcon2 from '../../../../assets/CoordinatorPage/SubjectActivityEnrollment/Add2.svg';
import { styles } from './SubjectAllotmentStyle';
import { API_URL } from '@env';

const SubjectAllotment = ({ navigation, route }) => { 
  const { coordinatorData } = route.params;

  const [activeSection, setActiveSection] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);

  const [subjectTitleModal, setSubjectTitleModal] = useState(false);

  // State variables for modals
  const [showSubjectTypeModal, setShowSubjectTypeModal] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [subjectTypeOptions, setSubjectTypeOptions] = useState([]);

  // State for the floating action buttons
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  // State for Add Subject modal
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [subjectInputs, setSubjectInputs] = useState(['']);

  // State for Add Activity modal
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [activityInputs, setActivityInputs] = useState(['']);

  // State for subject titles
  const [subjectTitles, setSubjectTitles] = useState([]);

  useEffect(() => {
    fetchGradeSections();
    fetchSubjectTitles();
    fetchActivities();
  }, [coordinatorData]);

  const handleSectionChange = (section) => {
    setActiveSection(section);
    console.log(section);
  };

  useEffect(() => {
    if (activeSection) {
      fetchSubjectActivities();
    }
  }, [activeSection]);

  const fetchGradeSections = async () => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/getGradeSections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gradeID: coordinatorData.grade_id }),
      });

      const data = await response.json();
      console.log('Grade Sections Data API Response:', data);

      if (data.success) {
        setSections(data.gradeSections);
        if (data.gradeSections.length > 0) {
          setActiveSection(data.gradeSections[0].id);
        }
      } else {
        Alert.alert('No Sections Found', 'No section is associated with this grade');
      }
    } catch (error) {
      console.error('Error fetching sections data:', error);
      Alert.alert('Error', 'Failed to fetch sections data');
    }
  };

  const fetchSubjectTitles = async () => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/getSubjects`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json(); 
      if (data.success) {
        setSubjectTitles(data.subjects);
      }
    } catch (error) {
      console.error('Error fetching subject titles:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/getActivities`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (data.success) {
        setSubjectTypeOptions(data.activity_types);
      }
    } catch (error) {
      console.error('Error fetching subject titles:', error);
    }
  };

  const fetchSubjectActivities = async () => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/getSubjectActivities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionID: activeSection }),
      });

      const data = await response.json();
      console.log('Subject Activities Data API Response:', data);

      if (data.success) {
        // Transform the data to group by subject and include activity details
        const groupedData = data.subjectActivities.reduce((acc, item) => {
          const existingSubject = acc.find(subj => subj.id === item.subject_id);
          const activity = subjectTypeOptions.find(a => a.id === item.activity_type);

          if (existingSubject) {
            existingSubject.activities.push({
              id: item.id, // This is the section_subject_activity ID
              activity_id: item.activity_type,
              name: activity ? activity.name : `${item.activity_type}`
            });
          } else {
            acc.push({
              id: item.subject_id,
              name: item.subject_name || `Subject ${item.subject_id}`,
              activities: [{
                id: item.id, // This is the section_subject_activity ID
                activity_id: item.activity_type,
                name: activity ? activity.name : `${item.activity_type}`
              }]
            });
          }
          return acc;
        }, []);

        setSubjects(groupedData);
      } else {
        setSubjects([]);
        Alert.alert('No Activities Found', 'No activities found for this section');
      }
    } catch (error) {
      console.error('Error fetching subject activities data:', error);
      Alert.alert('Error', 'Failed to fetch subject activities data');
    }
  };

  const handleRemoveCategory = async (subjectId, activityRecordId) => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/removeSubjectActivity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activityRecordId // Now sending the section_subject_activity ID
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Refresh the data
        fetchSubjectActivities();
      } else {
        Alert.alert('Error', data.message || 'Failed to remove activity');
      }
    } catch (error) {
      console.error('Error removing activity:', error);
      Alert.alert('Error', 'Failed to remove activity');
    }
  };

  const handleAddCategory = async (subjectId, activityType) => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/addSubjectActivity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_id: activeSection,
          subject_id: subjectId,
          activity_type: activityType
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Refresh the data
        fetchSubjectActivities();
      } else {
        Alert.alert('Error', data.message || 'Failed to add activity');
      }
    } catch (error) {
      console.error('Error adding activity:', error);
      Alert.alert('Error', 'Failed to add activity');
    }
    setShowSubjectTypeModal(false);
  };

  const handleRemoveSubject = async (subjectId) => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/removeSubject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_id: activeSection,
          subject_id: subjectId
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Refresh the data
        fetchSubjectActivities();
      } else {
        Alert.alert('Error', data.message || 'Failed to remove subject');
      }
    } catch (error) {
      console.error('Error removing subject:', error);
      Alert.alert('Error', 'Failed to remove subject');
    }
  };

  const handleSelectSubjectTitle = async (subjectId) => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/addSubjectToSection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_id: activeSection,
          subject_id: subjectId
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Refresh the data
        fetchSubjectActivities();
      } else {
        Alert.alert('Error', data.message || 'Failed to add subject');
      }
    } catch (error) {
      console.error('Error adding subject:', error);
      Alert.alert('Error', 'Failed to add subject');
    }
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
  const submitSubjects = async () => {
    // Filter out empty inputs
    const validSubjects = subjectInputs.filter(input => input.trim() !== '');

    if (validSubjects.length === 0) {
      Alert.alert('Error', 'Please enter at least one subject');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/coordinator/addSubjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: validSubjects.map(name => ({ name: name.trim() }))
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Subjects added successfully');
        // Refresh the subject titles list
        await fetchSubjectTitles();
        setShowAddSubjectModal(false);
        setSubjectInputs(['']); // Reset to one empty input
      } else {
        Alert.alert('Error', data.message || 'Failed to add subjects');
      }
    } catch (error) {
      console.error('Error adding subjects:', error);
      Alert.alert('Error', 'Failed to add subjects');
    }
  };

  // Submit all activity inputs
  const submitActivitie = () => {
    // Filter out empty inputs and inputs already in options
    const validActivities = activityInputs
      .filter(input => input.trim() !== '' && !subjectTypeOptions.includes(input.trim()));

    if (validActivities.length > 0) {
      setSubjectTypeOptions([...subjectTypeOptions, ...validActivities]);
      setShowAddActivityModal(false);
      setActivityInputs(['']); // Reset to one empty input
    }
  };
  const submitActivities = async () => {
    // Filter out empty inputs
    const validActivities = activityInputs.filter(input => input.trim() !== '');

    if (validActivities.length === 0) {
      Alert.alert('Error', 'Please enter at least one subject');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/coordinator/addActivities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activities: validActivities.map(name => ({ name: name.trim() }))
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Activities added successfully');
        // Refresh the subject titles list
        await fetchActivities();
        setShowAddActivityModal(false);
        setActivityInputs(['']); // Reset to one empty input
      } else {
        Alert.alert('Error', data.message || 'Failed to add activities');
      }
    } catch (error) {
      console.error('Error adding subjects:', error);
      Alert.alert('Error', 'Failed to add subjects');
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
        style={{ flexGrow: 0 }}
        nestedScrollEnabled={true}
      >
        {sections.map(section => (
          <TouchableOpacity
            key={section.id}
            style={[styles.sectionTab, activeSection === section.id && styles.activeSectionTab]}
            onPress={() => handleSectionChange(section.id)}
          >
            <Text style={[styles.sectionTabText, activeSection === section.id && styles.activeSectionTabText]}>
              Section {section.section_name}
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
                  onPress={() => {
                    setSelectedSubjectId(subject.id);
                    setShowSubjectTypeModal(true);
                  }}
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
              {subject.activities.map((activity) => (
                <View key={activity.id} style={styles.categoryItem}>
                  <Text style={styles.categoryName}>{activity.name}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveCategory(subject.id, activity.id)}
                    style={styles.removeCategory}
                  >
                    <CancelIcon width={15} height={15} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        ))}
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
            {subjectTypeOptions.map(activity => (
              <TouchableOpacity
                key={activity.id}
                style={styles.listModalItem}
                onPress={() => handleAddCategory(selectedSubjectId, activity.id)}
              >
                <Text style={styles.listModalItemText}>{activity.activity_type}</Text>
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
          <ScrollView style={styles.listModalContainer} onStartShouldSetResponder={() => true}>
            {subjectTitles.map(subject => (
              <TouchableOpacity
                key={subject.id}
                style={styles.listModalItem}
                onPress={() => handleSelectSubjectTitle(subject.id)}
              >
                <Text style={styles.listModalItemText}>{subject.subject_name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </TouchableOpacity>
      </Modal>

      {/* Add Subject Modal with Multiple Inputs */}
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
          onPress={() => setShowAddSubjectModal(true)}
        >
          <View style={styles.formModalContainer}>
            <Text style={styles.modalTitle}>Add New Subjects</Text>

            <ScrollView
              style={styles.modalScrollContainer}
              contentContainerStyle={styles.modalScrollContent}
            >
              {subjectInputs.map((input, index) => (
                <View key={`subject-input-${index}`} style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder={`Enter subject name ${index + 1}`}
                    value={input}
                    placeholderTextColor='gray'
                    onChangeText={(text) => updateSubjectInput(text, index)}
                  />
                  {index > 0 && (
                    <TouchableOpacity
                      style={styles.removeInputButton}
                      onPress={() => {
                        const newInputs = [...subjectInputs];
                        newInputs.splice(index, 1);
                        setSubjectInputs(newInputs);
                      }}
                    >
                      <Text style={styles.removeInputButtonText}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.addMoreButton} onPress={addSubjectInput}>
              <Text style={styles.addMoreButtonText}>+ Add more Subject</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.enrollButton}
              onPress={submitSubjects}
            >
              <Text style={styles.enrollButtonText}>Add Subjects</Text>
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
          onPress={() => setShowAddActivityModal(true)}
        >
          <View style={styles.formModalContainer}>
            <Text style={styles.modalTitle}>Activity</Text>

            <ScrollView
              style={styles.modalScrollContainer}
              contentContainerStyle={styles.modalScrollContent}
            >
              {activityInputs.map((input, index) => (
                <View key={`activity-${index}`} style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder={`Enter activity ${index + 1}`}
                    placeholderTextColor='gray'
                    value={input}
                    onChangeText={(text) => updateActivityInput(text, index)}
                  />
                  {index > 0 && (
                    <TouchableOpacity
                      style={styles.removeInputButton}
                      onPress={() => {
                        const newInputs = [...activityInputs];
                        newInputs.splice(index, 1);
                        setActivityInputs(newInputs);
                      }}
                    >
                      <Text style={styles.removeInputButtonText}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>
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
      {
        isAddMenuOpen && (
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
        )
      }

      {/* Main Add Button (Floating Action Button) */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setIsAddMenuOpen(!isAddMenuOpen)}
      >
        <AddIcon width={20} height={20} />
      </TouchableOpacity>
    </SafeAreaView >
  );
};

export default SubjectAllotment;