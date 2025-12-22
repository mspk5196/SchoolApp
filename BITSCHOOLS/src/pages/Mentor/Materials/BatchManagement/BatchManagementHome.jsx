import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './BatchManagementStyles.jsx';
import * as materialApi from '../../../../utils/materialApi/mentorMaterialApi.js';
import ApiService from '../../../../utils/ApiService';
import { Nodata } from '../../../../components/index.js';

const BatchManagementHome = ({route}) => {
  const navigation = useNavigation();
  const { userData, grades, selectedGrade, selectedSubjectId, selectedSectionId, selectedSubjectName } = route.params || {};
  const activeGradeId = selectedGrade?.grade_id;
  const activeGradeName = selectedGrade?.grade_name;
  console.log('BatchManagementHome mounted with params:', { userData, grades, selectedGrade, selectedSubjectId, selectedSectionId, selectedSubjectName });

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false); 
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(selectedSectionId);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(selectedSubjectId);
  const [batchData, setBatchData] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchInput, setBatchInput] = useState('3');
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [processingAction, setProcessingAction] = useState('');
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showBatchSizeModal, setShowBatchSizeModal] = useState(false);
  const [selectedBatchForResize, setSelectedBatchForResize] = useState(null);
  const [newBatchSize, setNewBatchSize] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [activeAssignBatchId, setActiveAssignBatchId] = useState(null);
  const [studentAssignments, setStudentAssignments] = useState({}); // studentId -> batchId

  // Overflow resolution state
  const [showResolveOverflowModal, setShowResolveOverflowModal] = useState(false);
  const [overflowBatch, setOverflowBatch] = useState(null);
  const [overflowCount, setOverflowCount] = useState(0);
  const [showMoveStudentsModal, setShowMoveStudentsModal] = useState(false);
  const [studentsInOverflowBatch, setStudentsInOverflowBatch] = useState([]);
  const [selectedStudentRolls, setSelectedStudentRolls] = useState([]);
  const [targetBatchId, setTargetBatchId] = useState('');


  useEffect(() => {
    // console.log('useEffect triggered - selectedSection:', selectedSection, 'selectedSubject:', selectedSubject);
    if (selectedSection && selectedSubject) {
      fetchBatchData();
      fetchAnalytics();
    }
  }, [selectedSection, selectedSubject]);

  useEffect(() => {
    // Initialize data immediately if we have the values from route params
    // console.log('Component mounted with:', { selectedSectionId, selectedSubjectId });
    if (selectedSectionId && selectedSubjectId) {
      setLoading(true);
      fetchBatchData();
      fetchAnalytics();
    }
  }, []);

  useEffect(() => {
    // Auto-refresh every 30 seconds when data exists
    let interval;
    if (batchData.length > 0) {
      interval = setInterval(() => {
        if (!loading && !refreshing) {
          fetchAnalytics(); // Light refresh of analytics only
        }
      }, 30000);
    }
    return () => clearInterval(interval); 
  }, [batchData.length, loading, refreshing]);

  const showSuccessMessage = (message) => {
    setLastUpdateTime(new Date().toLocaleTimeString());
    Alert.alert('Success', message);
  };

  const showErrorMessage = (message) => {
    Alert.alert('Error', message);
  };

  const fetchBatchData = async () => {
    try {
      const sectionId = selectedSection || selectedSectionId;
      const subjectId = selectedSubject || selectedSubjectId;
      
      // console.log('fetchBatchData called with:', { sectionId, subjectId });
      
      if (!sectionId || !subjectId) {
        console.log('Missing sectionId or subjectId, skipping fetch');
        setLoading(false);
        return null;
      }

      const result = await materialApi.getBatches(sectionId, subjectId);
   
      if (result && result.success) {
        // console.log('Batch data response:', result);
        const batches = result.batches || [];
        
        // Add calculated fields for better display
        const enhancedBatches = batches.map(batch => ({
          ...batch,
          student_count: batch.current_students_count || 0,
          capacity_utilization: batch.capacity_utilization || 0,
          performance_grade: batch.performance_grade || getPerformanceGrade(batch.avg_performance_score)
        }));
        
        setBatchData(enhancedBatches);
        setLastUpdateTime(new Date().toLocaleTimeString());
        // console.log('Enhanced batches set:', enhancedBatches);
        
        // Check for overflow
        checkForOverflowAndPrompt(enhancedBatches);
        
        return enhancedBatches;
      } else {
        console.log('Failed to fetch batch data');
        showErrorMessage(result?.message || 'Failed to fetch batch data');
        return null;
      }
    } catch (error) {
      console.error('Error fetching batch data:', error);
      showErrorMessage('Network error while fetching batch data');
      return null;
    }
    finally{
      setLoading(false);
    }
  };

  const checkForOverflowAndPrompt = (batches) => {
    if (!Array.isArray(batches)) return;
    const over = batches.find(b => (b.current_students_count || 0) > (b.max_students || 0));
    if (over) {
      setOverflowBatch(over);
      setOverflowCount((over.current_students_count || 0) - (over.max_students || 0));
      setShowResolveOverflowModal(true);
    }
  };

  const openResizeForOverflow = () => {
    if (!overflowBatch) return;
    setSelectedBatchForResize(overflowBatch);
    setNewBatchSize(String(overflowBatch.current_students_count || overflowCount));
    setShowResolveOverflowModal(false);
    setShowBatchSizeModal(true);
  };

  const fetchStudentsForOverflowBatch = async () => {
    if (!overflowBatch) return;
    try {
      const result = await materialApi.getBatchStudents(overflowBatch.id);
      if (result && result.success) {
        setStudentsInOverflowBatch(result.students || []);
      } else {
        setStudentsInOverflowBatch([]);
      }
    } catch (e) {
      console.error('Failed to fetch students for overflow batch', e);
      setStudentsInOverflowBatch([]);
    }
  };

  const openMoveStudentsForOverflow = async () => {
    setShowResolveOverflowModal(false);
    setSelectedStudentRolls([]);
    setTargetBatchId('');
    await fetchStudentsForOverflowBatch();
    setShowMoveStudentsModal(true);
  };

  const toggleStudentSelection = (roll) => {
    setSelectedStudentRolls(prev => {
      const exists = prev.includes(roll);
      if (exists) return prev.filter(r => r !== roll);
      // limit to overflowCount
      if (prev.length >= overflowCount) return prev; 
      return [...prev, roll];
    });
  };

  const moveSelectedStudents = async () => {
    if (!overflowBatch) return;
    if (!targetBatchId) {
      Alert.alert('Select Target', 'Please select a target batch');
      return;
    }
    if (selectedStudentRolls.length !== overflowCount) {
      Alert.alert('Select Students', `Please select exactly ${overflowCount} student(s) to move`);
      return;
    }
    try {
      setLoading(true);
      
      // Get student IDs from rolls
      const studentIds = studentsInOverflowBatch
        .filter(s => selectedStudentRolls.includes(s.roll))
        .map(s => s.student_id);
      
      // Move students in batch
      const result = await materialApi.moveMultipleStudents(
        overflowBatch.id,
        targetBatchId,
        studentIds
      );
      
      if (result && result.success) {
        setShowMoveStudentsModal(false);
        const updated = await fetchBatchData();
        await fetchAnalytics();
        checkForOverflowAndPrompt(updated);
        showSuccessMessage(result.message || 'Selected students moved successfully');
      } else {
        showErrorMessage(result?.message || 'Failed to move students');
      }
    } catch (e) {
      console.error('Failed to move selected students', e);
      showErrorMessage('Failed to move selected students');
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceGrade = (performance) => {
    if (!performance || performance === 0) return 'Not Available';
    if (performance >= 90) return 'Excellent';
    if (performance >= 80) return 'Good';
    if (performance >= 70) return 'Average';
    if (performance >= 60) return 'Below Average';
    return 'Needs Attention';
  };

  const fetchAnalytics = async () => {
    try {
      const sectionId = selectedSection || selectedSectionId;
      const subjectId = selectedSubject || selectedSubjectId;
      
      // console.log('fetchAnalytics called with:', { sectionId, subjectId });
      
      if (!sectionId || !subjectId) {
        console.log('Missing sectionId or subjectId for analytics, skipping fetch');
        return; 
      }

      const result = await materialApi.getBatchAnalytics(sectionId, subjectId);
      console.log(result);
      
      if (result && result.success) {
        // console.log('Analytics response:', result);
        const analyticsData = result.analytics;
        
        // Enhance analytics with calculated metrics
        const enhancedAnalytics = {
          ...analyticsData,
          overall_grade: getPerformanceGrade(analyticsData.avg_performance || 0),
          students_per_batch: analyticsData.total_batches > 0 
            ? (analyticsData.total_students / analyticsData.total_batches).toFixed(1)
            : 0,
          batch_efficiency: analyticsData.total_batches > 0 && analyticsData.total_students > 0
            ? ((analyticsData.total_students / (analyticsData.total_batches * 15)) * 100).toFixed(1) // Assuming 15 as ideal batch size
            : 0
        };
        
        setAnalytics(enhancedAnalytics);
        // console.log('Enhanced analytics set:', enhancedAnalytics);
      } else {
        console.log('Failed to fetch analytics, response not ok');
        showErrorMessage(result?.message || 'Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      showErrorMessage('Network error while fetching analytics');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    const sectionId = selectedSection || selectedSectionId;
    const subjectId = selectedSubject || selectedSubjectId;
    
    if (sectionId && subjectId) {
      Promise.all([fetchBatchData(), fetchAnalytics()]).finally(() => {
        setRefreshing(false);
      });
    } else {
      setRefreshing(false);
    }
  };

  const handleRunReallocation = async () => {
    Alert.alert(
      'Confirm Reallocation',
      'This will reallocate all students based on their current performance. This action cannot be undone. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              setProcessingAction('Reallocating students...');
              
              const result = await materialApi.reallocateBatches(
                selectedSection || selectedSectionId,
                selectedSubject || selectedSubjectId
              );
              
              if (result && result.success) {
                showSuccessMessage(`Reallocation completed successfully! ${result.moved_students || 0} students were moved.`);
                fetchBatchData();
                fetchAnalytics();
              } else {
                showErrorMessage(result?.message || 'Failed to run reallocation');
              }
            } catch (error) {
              console.error('Error running reallocation:', error);
              showErrorMessage('Network error during reallocation');
            } finally {
              setLoading(false);
              setProcessingAction('');
            }
          },
        },
      ]
    );
  };

  const handleConfigureBatches = async () => {
    // Show custom modal for input
    setShowBatchModal(true);
  };

  const createBatches = async (numberOfBatches) => {
    try {
      // Validate input
      const numBatches = parseInt(numberOfBatches);
      if (isNaN(numBatches) || numBatches < 1 || numBatches > 10) {
        Alert.alert('Error', 'Please enter a valid number between 1 and 10');
        return;
      }

      setLoading(true);
      setShowBatchModal(false); // Close modal 
      setProcessingAction('Configuring batches...');
      
      // Treat input as "extra" to add on top of current
      const currentCount = batchData.length || 0;
      const desiredTotal = currentCount + numBatches;
      console.log('Configuring batches (add extra):', {
        subjectId: selectedSubject || selectedSubjectId,
        gradeId: activeGradeId,
        sectionId: selectedSection || selectedSectionId,
        addExtra: numBatches,
        desiredTotal,
        coordinatorId: userData?.id
      });

      const response = await ApiService.makeRequest(`/coordinator/batches/configure`, {
        method: 'POST',
        body: JSON.stringify({
          subjectId: selectedSubject || selectedSubjectId,
          gradeId: activeGradeId,
          sectionId: selectedSection || selectedSectionId,
          maxBatches: desiredTotal,
          batchSizeLimit: 30, 
          autoAllocation: true,
          coordinatorId: userData?.id
        }),
      });

      const result = await response.json();
      // console.log('Configure batches response:', result);
      
      if (response) {
        showSuccessMessage(`Added ${numBatches} extra batch(es). Total now: ${desiredTotal}.`);
        fetchBatchData();
        fetchAnalytics();
      } else {
        showErrorMessage(result.message || 'Failed to configure batches');
      }
    } catch (error) {
      console.error('Error configuring batches:', error);
      showErrorMessage('Network error while configuring batches');
    } finally {
      setLoading(false);
      setProcessingAction('');
    }  
  };

  const handleInitializeBatches = async () => {
    if (batchData.length === 0) {
      Alert.alert('No Batches', 'Please configure batches first before initializing students.');
      return;
    }

    // Open assignment modal to manually assign students to batches
    setShowAssignModal(true);
    setActiveAssignBatchId(batchData[0]?.id || null);
    // fetch students in section
    try {
      setLoading(true);
      const sectionId = selectedSection || selectedSectionId;
      const res = await ApiService.makeRequest('/coordinator/getStudentsBySection', {
        method: 'POST',
        body: JSON.stringify({ sectionId }),
      });
      const data = await res.json();
      if (data && data.success) {
        // Only include students who are not yet assigned to THIS subject
        const subjectIdForFilter = selectedSubject || selectedSubjectId;
        const unassigned = (data.data || []).filter(s => {
          // backend returns JSON_ARRAYAGG as either an array or a JSON string depending on driver
          let pairs = s.batch_subject_pairs || [];
          if (typeof pairs === 'string') {
            try {
              pairs = JSON.parse(pairs);
            } catch (e) {
              pairs = [];
            }
          }
          if (!Array.isArray(pairs)) pairs = [];

          // If any pair has the same subject_id, consider the student already assigned for that subject
          return !pairs.some(p => p && Number(p.subject_id) === Number(subjectIdForFilter));
        });

        setAllStudents(unassigned);
        const initMap = {};
        unassigned.forEach(s => { initMap[s.student_id] = null; });
        setStudentAssignments(initMap);
      } else {
        showErrorMessage(data?.message || 'Failed to load students');
      }
    } catch (e) {
      console.error('Error fetching students for assignment', e);
      showErrorMessage('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeBatchSize = (batch) => {
    setSelectedBatchForResize(batch);
    setNewBatchSize(batch.max_students?.toString() || '30');
    setShowBatchSizeModal(true);
  };

  const updateBatchSize = async () => {
    try {
      const size = parseInt(newBatchSize);
      if (isNaN(size) || size < 5 || size > 50) {
        Alert.alert('Error', 'Please enter a valid batch size between 5 and 50');
        return;
      }

      if (size < selectedBatchForResize.current_students) {
        Alert.alert(
          'Warning', 
          `Current batch has ${selectedBatchForResize.current_students} students but you're setting size to ${size}. This may cause issues. Continue?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Continue', onPress: () => proceedWithBatchSizeUpdate(size) }
          ]
        );
        return;
      }

      await proceedWithBatchSizeUpdate(size);
    } catch (error) {
      console.error('Error updating batch size:', error);
      showErrorMessage('Network error while updating batch size');
    }
  };

  const proceedWithBatchSizeUpdate = async (size) => {
    try {
      setLoading(true);
      setShowBatchSizeModal(false);
      setProcessingAction('Updating batch size...');

      const result = await materialApi.updateBatchSize(
        selectedBatchForResize.id,
        size
      );
      
      if (result && result.success) {
        showSuccessMessage(`Batch size updated successfully to ${size} students!`);
        fetchBatchData();
        fetchAnalytics();
      } else {
        showErrorMessage(result?.message || 'Failed to update batch size');
      }
    } catch (error) {
      console.error('Error updating batch size:', error);
      showErrorMessage('Network error while updating batch size');
    } finally {
      setLoading(false);
      setProcessingAction('');
      setSelectedBatchForResize(null);
    }
  };

  const renderBatchCard = (batch) => (
    <TouchableOpacity
      key={batch.batch_name}
      style={[
        styles.batchCard,
        { 
          borderLeftColor: getBatchStatusColor(batch),
          borderLeftWidth: 4 
        }
      ]}
      onPress={() => navigation.navigate('MentorBatchDetails', { 
        batchName: batch.batch_name,
        batchId: batch.id,
        sectionId: selectedSection || selectedSectionId,
        subjectId: selectedSubject || selectedSubjectId,
        coordinatorId: userData?.id
      })}
    >
      <View style={styles.batchHeader}>
        <View style={styles.batchNameContainer}>
          <Text style={styles.batchName}>{batch.batch_name}</Text>
          <Text style={styles.batchLevel}>Level {batch.batch_level || 1}</Text>
        </View>
        <View style={styles.studentCount}>
          <Icon name="account-group-outline" size={18} color="#64748B" />
          <Text style={styles.countText}>
            {batch.student_count}/{batch.max_students || 30}
          </Text>
        </View>
      </View>
      
      <View style={styles.batchStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: getPerformanceColor(batch.avg_performance) }]}>
            {batch.avg_performance && typeof batch.avg_performance === 'number' 
              ? batch.avg_performance.toFixed(1) + '%' 
              : 'N/A'
            }
          </Text>
          <Text style={styles.statLabel}>Performance</Text>
          <Text style={styles.statSubLabel}>{batch.performance_grade}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{batch.active_topics || 0}</Text>
          <Text style={styles.statLabel}>Topics</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{batch.capacity_utilization}%</Text>
          <Text style={styles.statLabel}>Capacity</Text>
        </View>
      </View>

      {/* Quick Action Buttons */} 
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={(e) => {
            e.stopPropagation();
            // Quick view analytics for this batch
            Alert.alert(
              `${batch.batch_name} Details`,
              `Students: ${batch.student_count}/${batch.max_students}\n` +
              `Performance: ${batch.avg_performance && typeof batch.avg_performance === 'number' ? batch.avg_performance.toFixed(1) + '%' : 'N/A'}\n` +
              `Grade: ${batch.performance_grade}\n` +
              `Created: ${new Date(batch.created_at).toLocaleDateString()}`
            );
          }}
        >
          <Icon name="information-outline" size={18} color="#3B82F6" />
          <Text style={styles.quickActionText}>Info</Text>
        </TouchableOpacity>
        
        {/* <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={(e) => {
            e.stopPropagation();
            handleChangeBatchSize(batch);
          }}
        >
          <Icon name="resize" size={18} color="#3B82F6" />
          <Text style={styles.quickActionText}>Resize</Text>
        </TouchableOpacity> */}
      </View>
    </TouchableOpacity>
  );

  // Assignment modal controls
  const toggleStudentAssign = (studentId, batchId) => {
    // Require a batch to be active for assignment
    if (!batchId) {
      Alert.alert('Select Batch', 'Please select a batch on the left before assigning students.');
      return;
    }

    setStudentAssignments(prev => {
      const next = { ...prev };
      const currentAssignment = prev[studentId];
      
      // If student currently assigned to this batch, unassign; else assign to this batch
      if (currentAssignment === batchId) {
        next[studentId] = null;
      } else {
        next[studentId] = batchId;
      }
      
      return next;
    });
  };

  const confirmAssignments = async () => {
    // Build assignments array [{ studentId, batchId }]
    const assignments = Object.entries(studentAssignments)
      .filter(([sid, bid]) => bid)
      .map(([sid, bid]) => ({ studentId: parseInt(sid, 10), batchId: bid }));

    if (assignments.length === 0) {
      Alert.alert('No assignments', 'Please assign at least one student to a batch before confirming');
      return;
    }

    try {
      setLoading(true);
      const result = await materialApi.assignStudentsToBatches(assignments);
      if (result && result.success) {
        showSuccessMessage(result.message || 'Students assigned successfully');
        setShowAssignModal(false);
        // refresh data
        await fetchBatchData();
        await fetchAnalytics();
      } else {
        showErrorMessage(result?.message || 'Failed to assign students');
      }
    } catch (e) {
      console.error('Error confirming assignments', e);
      showErrorMessage('Failed to assign students');
    } finally {
      setLoading(false);
    }
  };

  const getBatchStatusColor = (batch) => {
    if (!batch.avg_performance) return '#ccc';
    if (batch.avg_performance >= 80) return '#4CAF50';
    if (batch.avg_performance >= 60) return '#FF9800';
    return '#F44336';
  };

  const getPerformanceColor = (performance) => {
    if (!performance) return '#999';
    if (performance >= 80) return '#4CAF50';
    if (performance >= 60) return '#FF9800';
    return '#F44336';
  };

  // console.log('Render - selectedSection:', selectedSection, 'selectedSubject:', selectedSubject, 'batchData length:', batchData.length, 'analytics:', !!analytics);

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
        <LinearGradient
          colors={['#3B82F6', '#2563EB']}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Batch Management</Text>
            {selectedSubjectName && (
              <Text style={styles.headerSubtitle}>
                {selectedSubjectName} - Grade {activeGradeName || activeGradeId}
              </Text>
            )}
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>
            {processingAction || 'Loading batch management...'}
          </Text>
          {processingAction && (
            <Text style={styles.loadingSubtext}>
              Please wait, this may take a few moments
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#3B82F6" />
      {/* Header */}
      <LinearGradient
        colors={['#3B82F6', '#2563EB']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Batch Management</Text>
          {selectedSubjectName && (
            <Text style={styles.headerSubtitle}>
              {selectedSubjectName} - Grade {activeGradeName || activeGradeId}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={handleRefresh}>
          <Icon name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >

        {/* Assign Students Modal */}
        <Modal
          visible={showAssignModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowAssignModal(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 }}>
            <View style={{ backgroundColor: 'white', borderRadius: 8, maxHeight: '90%', padding: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>Assign Students to Batches</Text>
              <View style={{ flexDirection: 'row', height: 360 }}>
                <View style={{ width: 140, borderRightWidth: 1, borderColor: '#eee' }}>
                  <ScrollView>
                    {batchData.map(b => (
                      <TouchableOpacity key={b.id} onPress={() => setActiveAssignBatchId(b.id)} style={{ padding: 10, backgroundColor: activeAssignBatchId === b.id ? '#eef2ff' : 'transparent' }}>
                        <Text style={{ fontWeight: '600' }}>{b.batch_name}</Text>
                        <Text style={{ fontSize: 12, color: '#666' }}>{b.current_students_count}/{b.max_students || 30}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                <View style={{ flex: 1, paddingLeft: 12 }}>
                  <Text style={{ marginBottom: 6 }}>Select students for <Text style={{ fontWeight: '700' }}>{batchData.find(b => b.id === activeAssignBatchId)?.batch_name || '...'}</Text></Text>

                  {allStudents.length === 0 ? (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>
                      <Nodata message='No students available/All students already mapped...' />
                    </View>
                  ) : (
                    <ScrollView>
                      {allStudents.map(s => {
                        // Get the batch ID this student is currently assigned to (in this session)
                        const assignedBatchId = studentAssignments[s.student_id];
                        // Check if assigned to the currently active/selected batch
                        const isAssignedToActive = assignedBatchId !== null && assignedBatchId !== undefined && assignedBatchId === activeAssignBatchId;
                        // Get batch name if assigned to a different batch
                        const assignedBatchName = (assignedBatchId && assignedBatchId !== activeAssignBatchId) 
                          ? batchData.find(b => b.id === assignedBatchId)?.batch_name 
                          : null;
                        
                        return (
                          <TouchableOpacity
                            key={s.student_id}
                            onPress={() => toggleStudentAssign(s.student_id, activeAssignBatchId)}
                            style={{ 
                              flexDirection: 'row', 
                              alignItems: 'center', 
                              paddingVertical: 6,
                              paddingHorizontal: 8,
                              borderRadius: 4,
                              backgroundColor: assignedBatchName ? '#f9fafb' : 'transparent'
                            }}
                          >
                            <View style={{ 
                              width: 22, 
                              height: 22, 
                              borderRadius: 4, 
                              borderWidth: 2, 
                              borderColor: isAssignedToActive ? '#3B82F6' : '#ccc', 
                              marginRight: 10, 
                              backgroundColor: isAssignedToActive ? '#3B82F6' : 'white',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {isAssignedToActive && (
                                <Icon name="check" size={16} color="white" />
                              )}
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontSize: 15, color: '#111' }}>{s.name}</Text>
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ fontSize: 12, color: '#666' }}>Roll: {s.roll}</Text>
                                {assignedBatchName && (
                                  <Text style={{ fontSize: 11, color: '#3B82F6', marginLeft: 8 }}>
                                    → {assignedBatchName}
                                  </Text>
                                )}
                              </View>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  )}
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                <TouchableOpacity onPress={() => setShowAssignModal(false)} style={{ padding: 10, marginRight: 8 }}>
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmAssignments} style={{ backgroundColor: '#3B82F6', padding: 10, borderRadius: 6 }}>
                  <Text style={{ color: 'white' }}>Confirm Assignments</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Analytics Summary */}
        {analytics && (
          <TouchableOpacity 
            style={styles.analyticsCard}
            onPress={() => setShowAnalyticsModal(true)}
          >
            <View style={styles.analyticsHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="chart-box-outline" size={24} color="#3B82F6" style={{ marginRight: 8 }} />
                <Text style={styles.cardTitle}>Analytics Overview</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.analyticsSubtitle}>Tap for details</Text>
                <Icon name="chevron-right" size={20} color="#64748B" style={{ marginLeft: 4 }} />
              </View>
            </View>
            <View style={styles.analyticsRow}>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsValue}>{analytics.total_students}</Text>
                <Text style={styles.analyticsLabel}>Total Students</Text>
              </View>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsValue}>{analytics.total_batches}</Text>
                <Text style={styles.analyticsLabel}>Active Batches</Text>
              </View>
              <View style={styles.analyticsItem}>
                <Text style={[styles.analyticsValue, { color: getPerformanceColor(analytics.avg_performance) }]}>
                  {analytics.avg_performance && typeof analytics.avg_performance === 'number' 
                    ? analytics.avg_performance.toFixed(1) + '%' 
                    : 'N/A'
                  }
                </Text>
                <Text style={styles.analyticsLabel}>Avg Performance</Text>
                <Text style={styles.analyticsSubLabel}>{analytics.overall_grade}</Text>
              </View>
            </View>
            {lastUpdateTime && (
              <Text style={styles.lastUpdateText}>
                Last updated: {lastUpdateTime}
              </Text>
            )}
          </TouchableOpacity> 
        )}

        {/* Action Buttons */}
        {/* {((selectedSection && selectedSubject) || (selectedSectionId && selectedSubjectId)) && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.configureButton]}
              onPress={handleConfigureBatches}
            >
              <Icon name="cog-outline" size={22} color="white" />
              <Text style={styles.actionButtonText}>Configure Batches</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.initializeButton]}
              onPress={handleInitializeBatches}
            >
              <Icon name="account-multiple-plus-outline" size={22} color="white" />
              <Text style={styles.actionButtonText}>Initialize Batches</Text>
            </TouchableOpacity>
          </View>
        )} */}

        {/* Batch List */}
        {batchData.length > 0 && (
          <View style={styles.batchesContainer}>
            <Text style={styles.sectionTitle}>Current Batches</Text>
            {batchData.map(renderBatchCard)}
          </View>
        )}

        {/* Empty State */}
        {((selectedSection && selectedSubject) || (selectedSectionId && selectedSubjectId)) && batchData.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Icon name="account-group-outline" size={80} color="#CBD5E1" />
            <Text style={styles.emptyText}>No batches found</Text>
            <Text style={styles.emptySubtext}>First configure batches, then initialize students</Text>
          </View>
        )}
      </ScrollView>

      {/* Resolve Overflow Modal */}
      <Modal
        visible={showResolveOverflowModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowResolveOverflowModal(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 12,
            width: '85%',
            maxWidth: 360
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Batch Overflow Detected</Text>
            {overflowBatch && (
              <Text style={{ color: '#555', marginBottom: 16 }}>
                {overflowBatch.batch_name} has {overflowBatch.current_students}/{overflowBatch.max_students} students. Overflow: {overflowCount}.
              </Text>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                style={{ backgroundColor: '#2196F3', padding: 12, borderRadius: 8, flex: 0.48 }}
                onPress={openResizeForOverflow}
              >
                <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>Resize Batch</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ backgroundColor: '#10B981', padding: 12, borderRadius: 8, flex: 0.48 }}
                onPress={openMoveStudentsForOverflow}
              >
                <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>Move Students</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


      {/* Move Students Modal */}
      <Modal
        visible={showMoveStudentsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMoveStudentsModal(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 12,
            width: '90%',
            maxWidth: 400,
            maxHeight: '80%'
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Move {overflowCount} Student(s)</Text>
              <TouchableOpacity onPress={() => setShowMoveStudentsModal(false)}>
                <Icon name="close" size={22} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={{ marginBottom: 8, color: '#555' }}>Select exactly {overflowCount} student(s) from {overflowBatch?.batch_name} to move:</Text>
            <ScrollView style={{ maxHeight: 260 }}>
              {studentsInOverflowBatch.map(st => (
                <TouchableOpacity
                  key={st.student_roll}
                  onPress={() => toggleStudentSelection(st.student_roll)}
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}
                >
                  <Icon
                    name={selectedStudentRolls.includes(st.student_roll) ? 'checkbox-marked' : 'checkbox-blank-outline'}
                    size={22}
                    color={selectedStudentRolls.includes(st.student_roll) ? '#3B82F6' : '#9CA3AF'}
                    style={{ marginRight: 10 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, color: '#111827' }}>{st.student_name}</Text>
                    <Text style={{ fontSize: 12, color: '#6B7280' }}>Roll: {st.student_roll}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={{ marginTop: 12 }}>
              <Text style={{ marginBottom: 6, color: '#555' }}>Target Batch</Text>
              <View style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8 }}>
                <ScrollView>
                  {batchData
                    .filter(b => b.id !== overflowBatch?.id)
                    .map(b => (
                      <TouchableOpacity
                        key={b.id}
                        style={{ padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                        onPress={() => setTargetBatchId(b.id)}
                      >
                        <Text style={{ fontSize: 15 }}>{b.batch_name}</Text>
                        <Text style={{ fontSize: 12, color: '#6B7280' }}>{b.current_students}/{b.max_students}</Text>
                        <Icon name={targetBatchId === b.id ? 'radiobox-marked' : 'radiobox-blank'} size={20} color={targetBatchId === b.id ? '#3B82F6' : '#9CA3AF'} />
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              <TouchableOpacity
                style={{ backgroundColor: '#ccc', padding: 12, borderRadius: 8, flex: 0.48 }}
                onPress={() => setShowMoveStudentsModal(false)}
              >
                <Text style={{ textAlign: 'center', color: '#555' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ backgroundColor: selectedStudentRolls.length === overflowCount && targetBatchId ? '#3B82F6' : '#93C5FD', padding: 12, borderRadius: 8, flex: 0.48 }}
                onPress={moveSelectedStudents}
                disabled={!(selectedStudentRolls.length === overflowCount && targetBatchId)}
              >
                <Text style={{ textAlign: 'center', color: 'white', fontWeight: '600' }}>Move Selected</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Configure Batches Modal */}
      <Modal
        visible={showBatchModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBatchModal(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 10,
            width: '80%',
            maxWidth: 300
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              marginBottom: 10,
              textAlign: 'center'
            }}>Configure Batches</Text>
            
            <Text style={{
              fontSize: 14,
              marginBottom: 15,
              textAlign: 'center',
              color: '#666'
            }}>Enter extra batches to add (1-10). Current: {batchData.length}</Text>
            
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 5,
                padding: 10,
                fontSize: 16,
                textAlign: 'center',
                marginBottom: 20
              }}
              value={batchInput}
              onChangeText={setBatchInput}
              keyboardType="numeric"
              placeholder="Enter number (1-10)"
              maxLength={2}
              autoFocus={true}
            />
            
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between'
            }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#ccc',
                  padding: 10,
                  borderRadius: 5,
                  flex: 0.45
                }}
                onPress={() => {
                  setShowBatchModal(false);
                  setBatchInput('1'); // Reset to default
                }}
              >
                <Text style={{
                  textAlign: 'center',
                  fontSize: 16,
                  color: '#666'
                }}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  backgroundColor: '#2196F3',
                  padding: 10,
                  borderRadius: 5,
                  flex: 0.45
                }}
                onPress={() => createBatches(batchInput)}
              >
                <Text style={{
                  textAlign: 'center',
                  fontSize: 16,
                  color: 'white',
                  fontWeight: 'bold'
                }}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Batch Size Modal */}
      <Modal
        visible={showBatchSizeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBatchSizeModal(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 10,
            width: '80%',
            maxWidth: 300
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              marginBottom: 10,
              textAlign: 'center'
            }}>Change Batch Size</Text>
            
            {selectedBatchForResize && (
              <>
                <Text style={{
                  fontSize: 16,
                  marginBottom: 5,
                  textAlign: 'center',
                  color: '#333'
                }}>{selectedBatchForResize.batch_name}</Text>
                
                <Text style={{
                  fontSize: 14,
                  marginBottom: 15,
                  textAlign: 'center',
                  color: '#666'
                }}>
                  Current: {selectedBatchForResize.current_students}/{selectedBatchForResize.max_students} students{'\n'}
                  Enter new maximum batch size (5-50):
                </Text>
              </>
            )}
            
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 5,
                padding: 10,
                fontSize: 16,
                textAlign: 'center',
                marginBottom: 20
              }}
              value={newBatchSize}
              onChangeText={setNewBatchSize}
              keyboardType="numeric"
              placeholder="Enter batch size (5-50)"
              maxLength={2}
              autoFocus={true}
            />
            
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between'
            }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#ccc',
                  padding: 10,
                  borderRadius: 5,
                  flex: 0.45
                }}
                onPress={() => {
                  setShowBatchSizeModal(false);
                  setSelectedBatchForResize(null);
                  setNewBatchSize('');
                }}
              >
                <Text style={{
                  textAlign: 'center',
                  fontSize: 16,
                  color: '#666'
                }}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  backgroundColor: '#2196F3',
                  padding: 10,
                  borderRadius: 5,
                  flex: 0.45
                }}
                onPress={updateBatchSize}
              >
                <Text style={{
                  textAlign: 'center',
                  fontSize: 16,
                  color: 'white',
                  fontWeight: 'bold'
                }}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Detailed Analytics Modal */}
      <Modal
        visible={showAnalyticsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAnalyticsModal(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 15,
            width: '90%',
            maxWidth: 400,
            maxHeight: '80%'
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20
            }}>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#333'
              }}>Detailed Analytics</Text>
              <TouchableOpacity
                onPress={() => setShowAnalyticsModal(false)}
                style={{
                  padding: 5,
                  borderRadius: 15,
                  backgroundColor: '#f5f5f5'
                }}
              >
                <Icon name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {analytics && (
                <View>
                  <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10, color: '#333' }}>
                      Student Distribution
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                      <Text>Total Students:</Text>
                      <Text style={{ fontWeight: 'bold' }}>{analytics.total_students}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                      <Text>Students per Batch:</Text>
                      <Text style={{ fontWeight: 'bold' }}>{analytics.students_per_batch}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                      <Text>Batch Efficiency:</Text>
                      <Text style={{ fontWeight: 'bold' }}>{analytics.batch_efficiency}%</Text>
                    </View>
                  </View>

                  <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10, color: '#333' }}>
                      Performance Overview
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                      <Text>Overall Performance:</Text>
                      <Text style={{ 
                        fontWeight: 'bold',
                        color: getPerformanceColor(analytics.avg_performance)
                      }}>
                        {analytics.avg_performance && typeof analytics.avg_performance === 'number' 
                          ? analytics.avg_performance.toFixed(1) + '%' 
                          : 'N/A'
                        }
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                      <Text>Performance Grade:</Text>
                      <Text style={{ fontWeight: 'bold' }}>{analytics.overall_grade}</Text>
                    </View>
                  </View>

                  <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10, color: '#333' }}>
                      Batch Summary
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                      <Text>Active Batches:</Text>
                      <Text style={{ fontWeight: 'bold' }}>{analytics.total_batches}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                      <Text>Subject:</Text>
                      <Text style={{ fontWeight: 'bold' }}>{selectedSubjectName || 'N/A'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                      <Text>Grade:</Text>
                      <Text style={{ fontWeight: 'bold' }}>{activeGradeName || activeGradeId}</Text>
                    </View>
                  </View>

                  {lastUpdateTime && (
                    <Text style={{
                      textAlign: 'center',
                      fontSize: 12,
                      color: '#666',
                      fontStyle: 'italic'
                    }}>
                      Last updated: {lastUpdateTime}
                    </Text>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default BatchManagementHome;
