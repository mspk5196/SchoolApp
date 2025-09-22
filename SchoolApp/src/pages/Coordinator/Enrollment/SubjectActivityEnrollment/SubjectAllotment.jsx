import { apiFetch } from "../../../../utils/apiClient.js";
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Modal, Pressable, Alert } from 'react-native';
import BackIcon from '../../../../assets/CoordinatorPage/SubjectActivityEnrollment/Back.svg';
import AddIcon from '../../../../assets/CoordinatorPage/SubjectActivityEnrollment/Add.svg';
import DeleteIcon from '../../../../assets/CoordinatorPage/SubjectActivityEnrollment/Delete.svg';
import CancelIcon from '../../../../assets/CoordinatorPage/SubjectActivityEnrollment/Cancel.svg';
import AddIcon2 from '../../../../assets/CoordinatorPage/SubjectActivityEnrollment/Add2.svg';
import { styles } from './SubjectAllotmentStyle';
import { API_URL } from '../../../../utils/env.js';

const SubjectAllotment = ({ navigation, route }) => {
  const { coordinatorData, activeGrade } = route.params;

  const [activeSection, setActiveSection] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjectTitleModal, setSubjectTitleModal] = useState(false);
  const [showSubjectTypeModal, setShowSubjectTypeModal] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [subjectTypeOptions, setSubjectTypeOptions] = useState([]);
  const [selectedSubjectSubActivityId, setSelectedSubjectSubActivityId] = useState(null);
  const [showSubjectSubActivityTypeModal, setShowSubjectSubActivityTypeModal] = useState(false);
  const [subActivities, setSubActivities] = useState([]);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [subjectInputs, setSubjectInputs] = useState(['']);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [activityInputs, setActivityInputs] = useState(['']);
  const [showAddSubActivityModal, setShowAddSubActivityModal] = useState(false);
  const [subActivityInputs, setSubActivityInputs] = useState(['']);
  const [subjectTitles, setSubjectTitles] = useState([]);

  useEffect(() => {
    fetchGradeSections();
    fetchSubjectTitles();
    fetchActivities();
    fetchSubActivities();
  }, [coordinatorData]);

  useEffect(() => {
    if (activeSection) {
      fetchSubjectActivities();
    }
  }, [activeSection]);

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
  };

  const fetchGradeSections = async () => {
    try {
      const response = await apiFetch(`/coordinator/getGradeSections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gradeID: activeGrade }),
      });
      const data = response
      if (data.success && data.gradeSections.length > 0) {
        setSections(data.gradeSections);
        setActiveSection(data.gradeSections[0].id);
      } else {
        Alert.alert('No Sections Found', 'No section is associated with this grade');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch sections data');
    }
  };

  const fetchSubjectTitles = async () => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/getSubjects`);
      const data = response
      if (data.success) setSubjectTitles(data.subjects);
    } catch (error) {
      console.error('Error fetching subject titles:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/getActivities`);
      const data = response
      if (data.success) setSubjectTypeOptions(data.activity_types);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchSubActivities = async () => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/getSubActivities`);
      const data = response
      if (data.success) {
        setSubActivities(data.sub_activities);
      }
    } catch (error) {
      console.error('Error fetching sub-activities data:', error);
    }
  };

  const fetchSubjectActivities = async () => {
    if (!activeSection) return;
    try {
      const response = await apiFetch(`/coordinator/getSubjectActivities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionID: activeSection }),
      });
      const data = response
      if (data.success) {
        // Group by subject, then by activity_id, collect sub activities
        const groupedData = [];
        data.subjectActivities.forEach(item => {
          let subject = groupedData.find(subj => subj.id === item.subject_id);
          if (!subject) {
            subject = {
              id: item.subject_id,
              name: item.subject_name || `Subject ${item.subject_id}`,
              activities: [],
            };
            groupedData.push(subject);
          }
          let activity = subject.activities.find(act => act.activity_id === item.activity_type_id);
          if (!activity) {
            activity = {
              id: item.id, // Use first occurrence's id
              activity_id: item.activity_type_id,
              name: item.activity_type,
              sub_activities: [],
            };
            subject.activities.push(activity);
          }
          // Add sub activity if present
          if (item.subject_sub_activity_id && item.subject_sub_activity_name) {
            // Prevent duplicates
            if (!activity.sub_activities.some(sa => sa.id === item.subject_sub_activity_id)) {
              activity.sub_activities.push({
                id: item.subject_sub_activity_id,
                name: item.subject_sub_activity_name,
                parent_ssa_id: item.id
              });
            }
          }
        });
        setSubjects(groupedData);
        // console.log(groupedData);
      } else {
        setSubjects([]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch subject activities data');
    }
  };

  const handleRemoveCategory = async (activityRecordId) => {
    try {
      const response = await apiFetch(`/coordinator/removeSubjectActivity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activityRecordId }),
      });
      const data = response
      if (data.success) {
        fetchSubjectActivities();
      } else {
        Alert.alert('Error', data.message || 'Failed to remove activity');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to remove activity');
    }
  };

  const handleAddCategory = async (subjectId, activityTypeId) => {
    try {
      const response = await apiFetch(`/coordinator/addSubjectActivity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_id: activeSection,
          subject_id: subjectId,
          activity_type: activityTypeId,
        }),
      });
      const data = response
      if (data.success) {
        fetchSubjectActivities();
      } else {
        Alert.alert('Error', data.message || 'Failed to add activity');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add activity');
    }
    setShowSubjectTypeModal(false);
  };

  const handleAddSubCategory = async (sectionSubjectActivityId, subActivityId) => {
    try {
      const response = await apiFetch(`/coordinator/addSubjectSubActivity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ssaID: sectionSubjectActivityId,
          subActivityId: subActivityId,
        }),
      });
      const data = response
      if (data.success) {
        fetchSubjectActivities();
      } else {
        Alert.alert('Error', data.message || 'Failed to add sub-activity');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add sub-activity');
    }
    setShowSubjectSubActivityTypeModal(false);
  };

  const handleRemoveSubject = async (subjectId) => {
    try {
      const response = await apiFetch(`/coordinator/removeSubject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section_id: activeSection, subject_id: subjectId }),
      });
      const data = response
      if (data.success) {
        fetchSubjectActivities();
      } else {
        Alert.alert('Error', data.message || 'Failed to remove subject');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to remove subject');
    }
  };

  const handleSelectSubjectTitle = async (subjectId) => {
    try {
      const response = await apiFetch(`/coordinator/addSubjectToSection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section_id: activeSection, subject_id: subjectId }),
      });
      const data = response
      if (data.success) {
        fetchSubjectActivities();
      } else {
        Alert.alert('Error', data.message || 'Failed to add subject');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add subject');
    }
    setSubjectTitleModal(false);
    setIsAddMenuOpen(false);
  };

  const handleRemoveSubActivity = async (subject_sub_activity_id) => {
    // This removes just the sub-activity link by setting it to null
    try {
      const response = await apiFetch(`/coordinator/removeSubjectSubActivity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject_sub_activity_id: subject_sub_activity_id}),
      });
      const data = response
      if (data.success) {
        fetchSubjectActivities();
      } else {
        Alert.alert('Error', data.message || 'Failed to remove sub-activity');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to remove sub-activity');
    }
  };

  const addActivityInput = () => setActivityInputs([...activityInputs, '']);
  const addSubActivityInput = () => setSubActivityInputs([...subActivityInputs, '']);

  const updateActivityInput = (text, index) => { const newInputs = [...activityInputs]; newInputs[index] = text; setActivityInputs(newInputs); };
  const updateSubActivityInput = (text, index) => { const newInputs = [...subActivityInputs]; newInputs[index] = text; setSubActivityInputs(newInputs); };


  const openSubjectTypeModal = (subjectId) => { setSelectedSubjectId(subjectId); setShowSubjectTypeModal(true); };
  const handleAddMoreSubject = () => { setSubjectInputs(['']); setShowAddSubjectModal(true); setIsAddMenuOpen(false); };
  const handleAddMoreActivity = () => { setActivityInputs(['']); setShowAddActivityModal(true); setIsAddMenuOpen(false); };
  const handleAddMoreSubActivity = () => { setSubActivityInputs(['']); setShowAddSubActivityModal(true); setIsAddMenuOpen(false); };
  const addSubjectInput = () => setSubjectInputs([...subjectInputs, '']);
  const updateSubjectInput = (text, index) => { const newInputs = [...subjectInputs]; newInputs[index] = text; setSubjectInputs(newInputs); };

  const submitSubjects = async () => {
    const validSubjects = subjectInputs.filter(input => input.trim() !== '');
    if (validSubjects.length === 0) return Alert.alert('Error', 'Please enter at least one subject');
    try {
      const response = await apiFetch(`/coordinator/addSubjects`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjects: validSubjects.map(name => ({ name: name.trim() })) }),
      });
      const data = response
      if (data.success) {
        Alert.alert('Success', 'Subjects added');
        fetchSubjectTitles();
        setShowAddSubjectModal(false);
        setSubjectInputs(['']);
      } else {
        Alert.alert('Error', data.message || 'Failed to add subjects');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add subjects');
    }
  };

  const submitActivities = async () => {
    const validActivities = activityInputs.filter(input => input.trim() !== '');
    if (validActivities.length === 0) return Alert.alert('Error', 'Please enter at least one activity');
    try {
      const response = await apiFetch(`/coordinator/addActivities`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities: validActivities.map(name => ({ name: name.trim() })) }),
      });
      const data = response
      if (data.success) {
        Alert.alert('Success', 'Activities added');
        fetchActivities();
        setShowAddActivityModal(false);
        setActivityInputs(['']);
      } else {
        Alert.alert('Error', data.message || 'Failed to add activities');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add activities');
    }
  };

  const submitSubActivities = async () => {
    const validSubActivities = subActivityInputs.filter(input => input.trim() !== '');
    if (validSubActivities.length === 0) return Alert.alert('Error', 'Please enter at least one sub-activity');
    try {
      const response = await apiFetch(`/coordinator/addSubActivities`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities: validSubActivities.map(name => ({ name: name.trim() })) }),
      });
      const data = response
      if (data.success) {
        Alert.alert('Success', 'Sub-activities added');
        fetchSubActivities();
        setShowAddSubActivityModal(false);
        setSubActivityInputs(['']);
      } else {
        Alert.alert('Error', data.message || 'Failed to add sub-activities');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add sub-activities');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon width={styles.BackIcon.width} height={styles.BackIcon.height} />
        </TouchableOpacity>
        <Text style={styles.headerTxt}>Subject Enrollment</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sectionTabsContainer} style={{ flexGrow: 0 }}>
        {sections.map(section => (
          <TouchableOpacity key={section.id} style={[styles.sectionTab, activeSection === section.id && styles.activeSectionTab]} onPress={() => handleSectionChange(section.id)}>
            <Text style={[styles.sectionTabText, activeSection === section.id && styles.activeSectionTabText]}>Section {section.section_name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.subjectList}>
        {subjects.map(subject => (
          <View key={subject.id} style={styles.subjectCard}>
            <View style={styles.subjectHeader}>
              <Text style={styles.subjectName}>{subject.name}</Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity onPress={() => openSubjectTypeModal(subject.id)} style={styles.actionButton}>
                  <AddIcon2 width={18} height={18} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleRemoveSubject(subject.id)} style={styles.actionButton}>
                  <DeleteIcon width={20} height={20} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.categoryContainer}>
              {(subject.activities || []).map((activity) => (
                <View key={activity.activity_id} style={styles.categoryItemWrapper}>
                  <View style={styles.categoryItem}>
                    <Text style={styles.categoryName}>{activity.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <TouchableOpacity onPress={() => { setSelectedSubjectSubActivityId(activity.id); setShowSubjectSubActivityTypeModal(true); }} style={styles.addSubCategory}>
                        <AddIcon2 width={18} height={18} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleRemoveCategory(activity.id)} style={styles.removeCategory}>
                        <CancelIcon width={15} height={15} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {/* Render all sub activities for this activity */}
                  {(activity.sub_activities || []).map(sub => (
                    <View key={sub.id} style={styles.subActivityContainer}>
                      <Text style={styles.subActivityText}>{sub.name}</Text>
                      <TouchableOpacity onPress={() => handleRemoveSubActivity(sub.id)} style={styles.removeSubCategory}>
                        <CancelIcon width={14} height={14} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        ))}
        <View style={{ height: 150 }} />
      </ScrollView>

      {/* MODALS */}
      <Modal transparent={true} visible={showSubjectTypeModal} animationType="fade" onRequestClose={() => setShowSubjectTypeModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSubjectTypeModal(false)}>
          <View style={styles.listModalContainer} onStartShouldSetResponder={() => true}>
            <View style={styles.scrollIndicator} />
            <ScrollView showsVerticalScrollIndicator={true} persistentScrollbar={true}>
              {subjectTypeOptions.map(activity => (
                <TouchableOpacity key={activity.id} style={styles.listModalItem} onPress={() => handleAddCategory(selectedSubjectId, activity.id)} activeOpacity={0.7}>
                  <Text style={styles.listModalItemText}>{activity.activity_type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal transparent={true} visible={showSubjectSubActivityTypeModal} animationType="fade" onRequestClose={() => setShowSubjectSubActivityTypeModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSubjectSubActivityTypeModal(false)}>
          <View style={styles.listModalContainer} onStartShouldSetResponder={() => true}>
            <View style={styles.scrollIndicator} />
            <ScrollView showsVerticalScrollIndicator={true} persistentScrollbar={true}>
              {subActivities.map(sub => (
                <TouchableOpacity key={sub.id} style={styles.listModalItem} onPress={() => handleAddSubCategory(selectedSubjectSubActivityId, sub.id)} activeOpacity={0.7}>
                  <Text style={styles.listModalItemText}>{sub.sub_act_name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal transparent={true} visible={subjectTitleModal} animationType="fade" onRequestClose={() => setSubjectTitleModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSubjectTitleModal(false)}>
          <View style={styles.listModalContainer} onStartShouldSetResponder={() => true}>
            <View style={styles.scrollIndicator} />
            <Text style={[styles.modalTitle, { textAlign: 'center', alignSelf: 'center', marginBottom: 10 }]}>Select Subject</Text>
            <ScrollView showsVerticalScrollIndicator={true} persistentScrollbar={true} contentContainerStyle={{ paddingBottom: 8 }}>
              {subjectTitles.map(subject => (
                <TouchableOpacity key={subject.id} style={styles.listModalItem} onPress={() => handleSelectSubjectTitle(subject.id)} activeOpacity={0.7}>
                  <Text style={styles.listModalItemText}>{subject.subject_name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal transparent={true} visible={showAddSubjectModal} animationType="fade" onRequestClose={() => setShowAddSubjectModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowAddSubjectModal(false)}>
          <Pressable style={styles.formModalContainer} onPress={() => { }}>
            <View style={styles.scrollIndicator} />
            <Text style={styles.modalTitle}>Add New Subjects</Text>
            <ScrollView style={styles.modalScrollContainer} contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={true}>
              {subjectInputs.map((input, index) => (
                <View key={`subject-input-${index}`} style={styles.inputContainer}>
                  <TextInput style={styles.input} placeholder={`Enter subject name ${index + 1}`} value={input} onChangeText={(text) => updateSubjectInput(text, index)} />
                  {index > 0 && (
                    <TouchableOpacity style={styles.removeInputButton} onPress={() => setSubjectInputs(inputs => inputs.filter((_, i) => i !== index))}>
                      <Text style={styles.removeInputButtonText}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.addMoreButton} onPress={addSubjectInput}><Text style={styles.addMoreButtonText}>+ Add more Subject</Text></TouchableOpacity>
            <TouchableOpacity style={styles.enrollButton} onPress={submitSubjects}><Text style={styles.enrollButtonText}>Add Subjects</Text></TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent={true} visible={showAddActivityModal} animationType="fade" onRequestClose={() => setShowAddActivityModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowAddActivityModal(false)}>
          <Pressable style={styles.formModalContainer} onPress={() => { }}>
            <View style={styles.scrollIndicator} />
            <Text style={styles.modalTitle}>Add New Activities</Text>
            <ScrollView style={styles.modalScrollContainer} contentContainerStyle={styles.modalScrollContent}>
              {activityInputs.map((input, index) => (
                <View key={`activity-${index}`} style={styles.inputContainer}>
                  <TextInput style={styles.input} placeholder={`Enter activity ${index + 1}`} value={input} onChangeText={(text) => updateActivityInput(text, index)} />
                  {index > 0 && (
                    <TouchableOpacity style={styles.removeInputButton} onPress={() => setActivityInputs(inputs => inputs.filter((_, i) => i !== index))}>
                      <Text style={styles.removeInputButtonText}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.addMoreButton} onPress={addActivityInput}><Text style={styles.addMoreButtonText}>+ Add more Activity</Text></TouchableOpacity>
            <TouchableOpacity style={styles.enrollButton} onPress={submitActivities}><Text style={styles.enrollButtonText}>Add Activity</Text></TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent={true} visible={showAddSubActivityModal} animationType="fade" onRequestClose={() => setShowAddSubActivityModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowAddSubActivityModal(false)}>
          <Pressable style={styles.formModalContainer} onPress={() => { }}>
            <View style={styles.scrollIndicator} />
            <Text style={styles.modalTitle}>Add New Sub Activities</Text>
            <ScrollView style={styles.modalScrollContainer} contentContainerStyle={styles.modalScrollContent}>
              {subActivityInputs.map((input, index) => (
                <View key={`sub-activity-${index}`} style={styles.inputContainer}>
                  <TextInput style={styles.input} placeholder={`Enter sub activity ${index + 1}`} value={input} onChangeText={(text) => updateSubActivityInput(text, index)} />
                  {index > 0 && (
                    <TouchableOpacity style={styles.removeInputButton} onPress={() => setSubActivityInputs(inputs => inputs.filter((_, i) => i !== index))}>
                      <Text style={styles.removeInputButtonText}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.addMoreButton} onPress={addSubActivityInput}><Text style={styles.addMoreButtonText}>+ Add more Sub Activity</Text></TouchableOpacity>
            <TouchableOpacity style={styles.enrollButton} onPress={submitSubActivities}><Text style={styles.enrollButtonText}>Add Sub Activity</Text></TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {isAddMenuOpen && (
        <View style={styles.floatingMenu}>
          <Pressable style={styles.menuButton} onPress={() => { setSubjectTitleModal(true); setIsAddMenuOpen(false); }}>
            <Text style={styles.menuButtonText}>Allot Subject</Text>
          </Pressable>
          <Pressable style={styles.menuButton} onPress={handleAddMoreSubject}>
            <Text style={styles.menuButtonText}>Create New Subject</Text>
          </Pressable>
          <Pressable style={styles.menuButton} onPress={handleAddMoreActivity}>
            <Text style={styles.menuButtonText}>Create New Activity</Text>
          </Pressable>
          <Pressable style={styles.menuButton} onPress={handleAddMoreSubActivity}>
            <Text style={styles.menuButtonText}>Create New Sub Activity</Text>
          </Pressable>
        </View>
      )}

      <TouchableOpacity style={styles.floatingButton} onPress={() => setIsAddMenuOpen(!isAddMenuOpen)}>
        <AddIcon width={20} height={20} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default SubjectAllotment; 