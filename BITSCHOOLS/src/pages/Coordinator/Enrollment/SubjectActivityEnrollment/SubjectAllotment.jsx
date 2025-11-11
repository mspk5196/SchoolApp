import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, Pressable, Alert, RefreshControl } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Nodata from '../../../../components/General/Nodata';
import ApiService from '../../../../utils/ApiService.js';
import { Header, HorizontalChipSelector } from '../../../../components/index.js';
import styles from './SubjectAllotmentStyle.jsx'
import AsyncStorage from '@react-native-async-storage/async-storage';

const SubjectAllotment = ({ navigation, route }) => {
  const params = route.params && route.params.data ? route.params.data : (route.params || {});
  const { userData } = params;

  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(null);

  const [activeSection, setActiveSection] = useState(null);
  const [activeSectionSelection, setActiveSectionSelection] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjectTitleModal, setSubjectTitleModal] = useState(false);
  const [showSubjectTypeModal, setShowSubjectTypeModal] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [subjectTypeOptions, setSubjectTypeOptions] = useState([]);
  const [selectedSubjectSubActivityId, setSelectedSubjectSubActivityId] = useState(null);
  const [showSubjectSubActivityTypeModal, setShowSubjectSubActivityTypeModal] = useState(false);
  const [subActivities, setSubActivities] = useState([]);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [subjectInputs, setSubjectInputs] = useState(['']);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [activityInputs, setActivityInputs] = useState(['']);
  const [showAddSubActivityModal, setShowAddSubActivityModal] = useState(false);
  const [subActivityInputs, setSubActivityInputs] = useState(['']);
  const [subjectTitles, setSubjectTitles] = useState([]);
  // Multi-select for subject allotment
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  // Multi-select for activity allotment
  const [activityMultiSelectMode, setActivityMultiSelectMode] = useState(false);
  const [selectedActivityTypeIds, setSelectedActivityTypeIds] = useState([]);
  // Multi-select for sub-activity allotment
  const [subActivityMultiSelectMode, setSubActivityMultiSelectMode] = useState(false);
  const [selectedSubActivityIds, setSelectedSubActivityIds] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSubjectTitles();
    fetchActivities();
    fetchSubActivities();
  }, [userData]);

  useEffect(() => {
    if (activeSection) {
      fetchSubjectActivities();
    }
  }, [activeSection]);

  useEffect(() => {
    fetchCoordinatorGrades();
  }, []);

  useEffect(() => {
    if (selectedGrade) {
      fetchGradeSections();
    }
  }, [selectedGrade]);

  const handleSectionChange = (sectionId) => {
    console.log(sectionId.id);
    
    setActiveSection(sectionId.id);
    setActiveSectionSelection(sectionId);
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      // Refresh current data for the active section and supportive lists
      await Promise.all([
        fetchSubjectActivities(),
        fetchSubjectTitles(),
        fetchActivities(),
        fetchSubActivities(),
      ]);
    } catch (e) {
      // Any fetch function already alerts on error; keep silent here
    } finally {
      setRefreshing(false);
    }
  };

  const fetchCoordinatorGrades = async () => {
    try {
      const asyncGrades = await AsyncStorage.getItem('coordinatorGrades');
      const parsedGrades = asyncGrades ? JSON.parse(asyncGrades) : [];
      setGrades(parsedGrades);

      if (parsedGrades.length > 0) {
        setSelectedGrade(parsedGrades[0]);
      }
    } catch (error) {
      console.error('Error fetching coordinator grades:', error);
      Alert.alert('Error', 'Failed to load grades');
    }
  };

  const fetchGradeSections = async () => {
    try {
      const response = await ApiService.makeRequest(`/coordinator/getGradeSections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gradeID: selectedGrade.grade_id }),
      });
      const data = await response.json();
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
      const response = await ApiService.makeRequest(`/coordinator/getSubjects`);
      const data = await response.json();
      if (data.success) setSubjectTitles(data.subjects);
    } catch (error) {
      console.error('Error fetching subject titles:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await ApiService.makeRequest(`/coordinator/getActivities`);
      const data = await response.json();
      if (data.success) setSubjectTypeOptions(data.activity_types);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchSubActivities = async () => {
    try {
      const response = await ApiService.makeRequest(`/coordinator/getSubActivities`);
      const data = await response.json();
      if (data.success) {
        setSubActivities(data.sub_activities);
      }
    } catch (error) {
      console.error('Error fetching sub-activities data:', error);
    }
  };

  const fetchSubjectActivities = async () => {
    if (!activeSection) return;
    console.log(activeSection);
    
    try {
      const response = await ApiService.makeRequest(`/coordinator/getSubjectActivities`, {
        method: 'POST',
        body: JSON.stringify({ sectionID: activeSection }),
      });
      const data = await response.json();
      if (data.success) {
        // Recursive function to transform children
        const transformChildren = (children) => {
          if (!children || children.length === 0) return [];
          return children.map(child => ({
            id: child.context_id,
            activity_id: child.activity_id,
            name: child.activity_name,
            level: child.level,
            children: transformChildren(child.children) // Recursive transformation
          }));
        };

        // Transform backend structure to frontend structure (recursive tree)
        const transformedSubjects = data.subjects.map(subject => ({
          id: subject.subject_id,
          name: subject.subject_name,
          activities: transformChildren(subject.activities)
        }));
        setSubjects(transformedSubjects);
      } else {
        setSubjects([]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch subject activities data');
    }
  };

  const handleRemoveCategory = async (activityRecordId) => {
    try {
      const response = await ApiService.makeRequest(`/coordinator/removeSubjectActivity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activityRecordId }),
      });
      const data = await response.json();
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
      const response = await ApiService.makeRequest(`/coordinator/addSubjectActivity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_id: activeSection,
          subject_id: subjectId,
          activity_type: activityTypeId,
        }),
      });
      const data = await response.json();
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

  // Toggle select for activities in multi-select
  const toggleActivityTypePick = (id) => {
    setSelectedActivityTypeIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Submit multiple selected activities
  const handleSubmitMultipleActivityTypes = async () => {
    if (selectedActivityTypeIds.length === 0) {
      return Alert.alert('No selection', 'Please select at least one activity.');
    }
    try {
      const responses = await Promise.all(
        selectedActivityTypeIds.map(id =>
          ApiService.makeRequest(`/coordinator/addSubjectActivity`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              section_id: activeSection,
              subject_id: selectedSubjectId,
              activity_type: id,
            }),
          })
        )
      );
      const results = await Promise.all(responses.map(r => r.json()));
      const anySuccess = results.some(r => r && r.success);
      if (anySuccess) {
        Alert.alert('Success', 'Selected activities added');
        fetchSubjectActivities();
      } else {
        Alert.alert('Error', 'Failed to add selected activities');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to add selected activities');
    } finally {
      setActivityMultiSelectMode(false);
      setSelectedActivityTypeIds([]);
      setShowSubjectTypeModal(false);
    }
  };

  const handleAddSubCategory = async (sectionSubjectActivityId, subActivityId) => {
    try {
      const response = await ApiService.makeRequest(`/coordinator/addSubjectSubActivity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ssaID: sectionSubjectActivityId,
          subActivityId: subActivityId,
        }),
      });
      const data = await response.json();
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

  // Toggle select for sub-activities in multi-select
  const toggleSubActivityPick = (id) => {
    setSelectedSubActivityIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Submit multiple selected sub-activities
  const handleSubmitMultipleSubActivities = async () => {
    if (selectedSubActivityIds.length === 0) {
      return Alert.alert('No selection', 'Please select at least one sub-activity.');
    }
    try {
      const responses = await Promise.all(
        selectedSubActivityIds.map(id =>
          ApiService.makeRequest(`/coordinator/addSubjectSubActivity`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ssaID: selectedSubjectSubActivityId,
              subActivityId: id,
            }),
          })
        )
      );
      const results = await Promise.all(responses.map(r => r.json()));
      const anySuccess = results.some(r => r && r.success);
      if (anySuccess) {
        Alert.alert('Success', 'Selected sub-activities added');
        fetchSubjectActivities();
      } else {
        Alert.alert('Error', 'Failed to add selected sub-activities');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to add selected sub-activities');
    } finally {
      setSubActivityMultiSelectMode(false);
      setSelectedSubActivityIds([]);
      setShowSubjectSubActivityTypeModal(false);
    }
  };

  const handleRemoveSubject = async (subjectId) => {
    try {
      const response = await ApiService.makeRequest(`/coordinator/removeSubject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section_id: activeSection, subject_id: subjectId }),
      });
      const data = await response.json();
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
      const response = await ApiService.makeRequest(`/coordinator/addSubjectToSection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section_id: activeSection, subject_id: subjectId }),
      });
      const data = await response.json();
      if (data.success) {
        fetchSubjectActivities();
      } else {
        Alert.alert('Error', data.message || 'Failed to add subject');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add subject to section');
    }
    setSubjectTitleModal(false);
  };

  // Toggle selection in multi-select mode
  const toggleSubjectPick = (subjectId) => {
    setSelectedSubjectIds(prev =>
      prev.includes(subjectId) ? prev.filter(id => id !== subjectId) : [...prev, subjectId]
    );
  };

  // Submit multiple selected subjects
  const handleSubmitMultipleSubjects = async () => {
    if (selectedSubjectIds.length === 0) {
      return Alert.alert('No selection', 'Please select at least one subject.');
    }
    try {
      const responses = await Promise.all(
        selectedSubjectIds.map(id =>
          ApiService.makeRequest(`/coordinator/addSubjectToSection`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ section_id: activeSection, subject_id: id }),
          })
        )
      );
      const results = await Promise.all(responses.map(r => r.json()));
      const anySuccess = results.some(r => r && r.success);
      if (anySuccess) {
        Alert.alert('Success', 'Selected subjects added');
        fetchSubjectActivities();
      } else {
        Alert.alert('Error', 'Failed to add selected subjects');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to add selected subjects');
    } finally {
      setMultiSelectMode(false);
      setSelectedSubjectIds([]);
      setSubjectTitleModal(false);
      setIsAddMenuOpen(false);
    }
  };

  const handleRemoveSubActivity = async (subject_sub_activity_id) => {
    // This removes just the sub-activity link by setting it to null
    try {
      const response = await ApiService.makeRequest(`/coordinator/removeSubjectSubActivity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject_sub_activity_id: subject_sub_activity_id }),
      });
      const data = await response.json();
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
  const handleAddMoreSubject = () => { setSubjectInputs(['']); setShowAddSubjectModal(true); };
  const handleAddMoreActivity = () => { setActivityInputs(['']); setShowAddActivityModal(true); };
  const handleAddMoreSubActivity = () => { setSubActivityInputs(['']); setShowAddSubActivityModal(true); };
  const addSubjectInput = () => setSubjectInputs([...subjectInputs, '']);
  const updateSubjectInput = (text, index) => { const newInputs = [...subjectInputs]; newInputs[index] = text; setSubjectInputs(newInputs); };

  const submitSubjects = async () => {
    const validSubjects = subjectInputs.filter(input => input.trim() !== '');
    if (validSubjects.length === 0) return Alert.alert('Error', 'Please enter at least one subject');
    try {
      const response = await ApiService.makeRequest(`/coordinator/addSubjects`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjects: validSubjects.map(name => ({ name: name.trim() })) }),
      });
      const data = await response.json();
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
      const response = await ApiService.makeRequest(`/coordinator/addActivities`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities: validActivities.map(name => ({ name: name.trim() })) }),
      });
      const data = await response.json();
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
      const response = await ApiService.makeRequest(`/coordinator/addSubActivities`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities: validSubActivities.map(name => ({ name: name.trim() })) }),
      });
      const data = await response.json();
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

  // Recursive rendering function for nested activities
  const renderActivity = (activity, depth = 0) => {
    const hasChildren = activity.children && activity.children.length > 0;
    const indent = depth * 20; // Increase indent for each level
    
    return (
      <View key={activity.id} style={styles.categoryItemWrapper}>
        <View style={[styles.categoryItem, { paddingLeft: 14 + indent }]}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            {depth > 0 && (
              <Ionicons 
                name="return-down-forward-outline" 
                size={16} 
                color="#94A3B8" 
                style={{ marginRight: 8 }} 
              />
            )}
            <Text style={[styles.categoryName, depth > 0 && { fontSize: 14, fontWeight: '600' }]}>
              {activity.name}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity 
              onPress={() => { 
                setSelectedSubjectSubActivityId(activity.id); 
                setShowSubjectSubActivityTypeModal(true); 
              }} 
              style={styles.addSubCategory}
            >
              <Ionicons name="add" size={16} color="#4361EE" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleRemoveCategory(activity.id)} 
              style={styles.removeCategory}
            >
              <Ionicons name="close" size={15} color="#E53E3E" />
            </TouchableOpacity>
          </View>
        </View>
        {/* Recursively render children */}
        {hasChildren && (
          <View style={styles.nestedContainer}>
            {activity.children.map(child => renderActivity(child, depth + 1))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Subject Enrollment" navigation={navigation} />

      <HorizontalChipSelector
        data={grades} 
        selectedItem={selectedGrade}
        onSelectItem={setSelectedGrade}
        idKey="grade_id"
        nameKey="grade_name" />
      {selectedGrade && sections.length > 0 &&
        <HorizontalChipSelector
          data={sections}
          selectedItem={activeSectionSelection}
          onSelectItem={handleSectionChange}
          idKey="id"
          nameKey="section_name" />
      }

      {/* Action Menu Bar */}
      {activeSection && (
        <View style={styles.actionMenuBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionMenuContent}>
            <TouchableOpacity 
              style={[styles.actionMenuItem, { backgroundColor: '#4361EE' }]} 
              onPress={() => setSubjectTitleModal(true)}
            >
              <Ionicons name="school-outline" size={18} color="#FFF" />
              <Text style={styles.actionMenuItemText}>Allot Subject</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionMenuItem, { backgroundColor: '#7209B7' }]} 
              onPress={handleAddMoreSubject}
            >
              <Ionicons name="add-circle-outline" size={18} color="#FFF" />
              <Text style={styles.actionMenuItemText}>New Subject</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionMenuItem, { backgroundColor: '#F72585' }]} 
              onPress={handleAddMoreActivity}
            >
              <Ionicons name="list-outline" size={18} color="#FFF" />
              <Text style={styles.actionMenuItemText}>New Activity</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionMenuItem, { backgroundColor: '#3A0CA3' }]} 
              onPress={handleAddMoreSubActivity}
            >
              <Ionicons name="git-branch-outline" size={18} color="#FFF" />
              <Text style={styles.actionMenuItemText}>New Sub-Activity</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      <ScrollView
        style={styles.subjectList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {subjects.length > 0 ? subjects.map(subject => (
          <View key={subject.id} style={styles.subjectCard}>
            <View style={styles.subjectHeader}>
              <Text style={styles.subjectName}>{subject.name}</Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity onPress={() => openSubjectTypeModal(subject.id)} style={styles.actionButton}>
                  <Ionicons name="add" size={18} color="#4361EE" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleRemoveSubject(subject.id)} style={styles.actionButton}>
                  <Ionicons name="trash-outline" size={20} color="#E53E3E" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.categoryContainer}>
              {(subject.activities || []).map((activity) => renderActivity(activity, 0))}
            </View>
          </View>
        )) : (
          <Nodata message="No subjects found" style={{ marginTop: 24 }} />
        )}
        <View style={{ height: 150 }} />
      </ScrollView>

      {/* MODALS */}
      <Modal transparent={true} visible={showSubjectTypeModal} animationType="fade" onRequestClose={() => { setShowSubjectTypeModal(false); setActivityMultiSelectMode(false); setSelectedActivityTypeIds([]); }}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => { setShowSubjectTypeModal(false); setActivityMultiSelectMode(false); setSelectedActivityTypeIds([]); }}>
          <View style={styles.listModalContainer} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Select Activity</Text>
              <Text style={styles.modalHeaderSubtitle}>Long press to multi-select</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={true} persistentScrollbar={true} contentContainerStyle={{ paddingBottom: 56 }}>
              {subjectTypeOptions.map(activity => {
                const selected = selectedActivityTypeIds.includes(activity.id);
                return (
                  <TouchableOpacity
                    key={activity.id}
                    style={[styles.listModalItem, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (activityMultiSelectMode) {
                        toggleActivityTypePick(activity.id);
                      } else {
                        handleAddCategory(selectedSubjectId, activity.id);
                      }
                    }}
                    onLongPress={() => {
                      if (!activityMultiSelectMode) {
                        setActivityMultiSelectMode(true);
                        setSelectedActivityTypeIds([activity.id]);
                      }
                    }}
                  >
                    {activityMultiSelectMode && (
                      <View style={{
                        width: 18,
                        height: 18,
                        borderRadius: 3,
                        borderWidth: 1.5,
                        borderColor: selected ? '#0066CC' : '#999',
                        backgroundColor: selected ? '#0066CC' : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {selected && <Text style={{ color: 'white', fontSize: 12, lineHeight: 12 }}>✓</Text>}
                      </View>
                    )}
                    <Text style={styles.listModalItemText}>{activity.activity_type}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            {activityMultiSelectMode && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingHorizontal: 10 }}>
                <TouchableOpacity
                  style={[styles.selectButton, { flex: 1, backgroundColor: '#eee' }]}
                  onPress={() => { setActivityMultiSelectMode(false); setSelectedActivityTypeIds([]); }}
                >
                  <Text style={[styles.selectButtonText, { color: '#333' }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.selectButton, { flex: 1 }]}
                  onPress={handleSubmitMultipleActivityTypes}
                >
                  <Text style={styles.selectButtonText}>Allot Selected</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal transparent={true} visible={showSubjectSubActivityTypeModal} animationType="fade" onRequestClose={() => { setShowSubjectSubActivityTypeModal(false); setSubActivityMultiSelectMode(false); setSelectedSubActivityIds([]); }}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => { setShowSubjectSubActivityTypeModal(false); setSubActivityMultiSelectMode(false); setSelectedSubActivityIds([]); }}>
          <View style={styles.listModalContainer} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Select Sub-Activity</Text>
              <Text style={styles.modalHeaderSubtitle}>Long press to multi-select</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={true} persistentScrollbar={true} contentContainerStyle={{ paddingBottom: 56 }}>
              {subActivities.map(sub => {
                const selected = selectedSubActivityIds.includes(sub.id);
                return (
                  <TouchableOpacity
                    key={sub.id}
                    style={[styles.listModalItem, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (subActivityMultiSelectMode) {
                        toggleSubActivityPick(sub.id);
                      } else {
                        handleAddSubCategory(selectedSubjectSubActivityId, sub.id);
                      }
                    }}
                    onLongPress={() => {
                      if (!subActivityMultiSelectMode) {
                        setSubActivityMultiSelectMode(true);
                        setSelectedSubActivityIds([sub.id]);
                      }
                    }}
                  >
                    {subActivityMultiSelectMode && (
                      <View style={{
                        width: 18,
                        height: 18,
                        borderRadius: 3,
                        borderWidth: 1.5,
                        borderColor: selected ? '#0066CC' : '#999',
                        backgroundColor: selected ? '#0066CC' : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {selected && <Text style={{ color: 'white', fontSize: 12, lineHeight: 12 }}>✓</Text>}
                      </View>
                    )}
                    <Text style={styles.listModalItemText}>{sub.sub_act_name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            {subActivityMultiSelectMode && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingHorizontal: 10 }}>
                <TouchableOpacity
                  style={[styles.selectButton, { flex: 1, backgroundColor: '#eee' }]}
                  onPress={() => { setSubActivityMultiSelectMode(false); setSelectedSubActivityIds([]); }}
                >
                  <Text style={[styles.selectButtonText, { color: '#333' }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.selectButton, { flex: 1 }]}
                  onPress={handleSubmitMultipleSubActivities}
                >
                  <Text style={styles.selectButtonText}>Allot Selected</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal transparent={true} visible={subjectTitleModal} animationType="fade" onRequestClose={() => { setSubjectTitleModal(false); setMultiSelectMode(false); setSelectedSubjectIds([]); }}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => { setSubjectTitleModal(false); setMultiSelectMode(false); setSelectedSubjectIds([]); }}>
          <View style={styles.listModalContainer} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Select Subject</Text>
              <Text style={styles.modalHeaderSubtitle}>Long press to multi-select</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={true} persistentScrollbar={true} contentContainerStyle={{ paddingBottom: 56 }}>
              {subjectTitles.map(subject => {
                const selected = selectedSubjectIds.includes(subject.id);
                return (
                  <TouchableOpacity
                    key={subject.id}
                    style={[styles.listModalItem, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (multiSelectMode) {
                        toggleSubjectPick(subject.id);
                      } else {
                        handleSelectSubjectTitle(subject.id);
                      }
                    }}
                    onLongPress={() => {
                      if (!multiSelectMode) {
                        setMultiSelectMode(true);
                        setSelectedSubjectIds([subject.id]);
                      }
                    }}
                  >
                    {multiSelectMode && (
                      <View style={{
                        width: 18,
                        height: 18,
                        borderRadius: 3,
                        borderWidth: 1.5,
                        borderColor: selected ? '#0066CC' : '#999',
                        backgroundColor: selected ? '#0066CC' : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {selected && <Text style={{ color: 'white', fontSize: 12, lineHeight: 12 }}>✓</Text>}
                      </View>
                    )}
                    <Text style={styles.listModalItemText}>{subject.subject_name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {multiSelectMode && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingHorizontal: 10 }}>
                <TouchableOpacity
                  style={[styles.selectButton, { flex: 1, backgroundColor: '#eee' }]}
                  onPress={() => { setMultiSelectMode(false); setSelectedSubjectIds([]); }}
                >
                  <Text style={[styles.selectButtonText, { color: '#333' }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.selectButton, { flex: 1 }]}
                  onPress={handleSubmitMultipleSubjects}
                >
                  <Text style={styles.selectButtonText}>Allot Selected</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal transparent={true} visible={showAddSubjectModal} animationType="fade" onRequestClose={() => setShowAddSubjectModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowAddSubjectModal(false)}>
          <Pressable style={styles.formModalContainer} onPress={() => { }}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Add New Subjects</Text>
              <Text style={styles.modalHeaderSubtitle}>Enter one or more subject names to create</Text>
            </View>
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Add New Activities</Text>
              <Text style={styles.modalHeaderSubtitle}>Create activity types to assign to subjects</Text>
            </View>
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Add New Sub Activities</Text>
              <Text style={styles.modalHeaderSubtitle}>You can assign parent activities later when needed</Text>
            </View>
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
    </View>
  );
};

export default SubjectAllotment; 