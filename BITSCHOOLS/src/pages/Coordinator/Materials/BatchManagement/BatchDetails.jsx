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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './BatchDetailsStyles.jsx';
import * as materialApi from '../../../../utils/materialApi';

const BatchDetails = () => {
  const navigation = useNavigation(); 
  const route = useRoute();
  const { batchName, sectionId, subjectId, coordinatorId, batchId } = route.params;
  // console.log('Batch Details Params:', { batchName, sectionId, subjectId, coordinatorId, batchId });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState([]);
  const [batchInfo, setBatchInfo] = useState(null);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [targetBatch, setTargetBatch] = useState('');

  useEffect(() => {
    fetchBatchDetails();
    fetchAvailableBatches();
  }, []);

  const fetchBatchDetails = async () => {
    // console.log('Fetching batch details...', { batchName, sectionId, subjectId });

    try {
      setLoading(true);
      const result = await materialApi.getBatchDetails(batchId);

      if (result && result.success) {
        setStudents(result.students || []);
        setBatchInfo(result.batch_info);
      } else {
        Alert.alert('Error', result?.message || 'Failed to load batch details');
      }
    } catch (error) {
      console.error('Error fetching batch details:', error);
      Alert.alert('Error', 'Failed to load batch details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAvailableBatches = async () => {
    // console.log('Fetching available batches for section:', sectionId, 'subject:', subjectId);
    try {
      const result = await materialApi.getBatches(sectionId, subjectId);

      if (result && result.success) {
        // console.log('Backend response:', result);
        setAvailableBatches(result.batches || []);
        // console.log('Available batches set:', result.batches || []);
      }
    } catch (error) { 
      console.error('Error fetching available batches:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBatchDetails();
  };

  const handleMoveStudent = (student) => {
    setSelectedStudent(student);
    setTargetBatch('');
    setMoveModalVisible(true);
  };

  const confirmMoveStudent = async () => {
    if (!targetBatch) {
      Alert.alert('Error', 'Please select a target batch');
      return;
    }
    console.log('Moving student:', {
      studentRoll: selectedStudent.student_roll,
      fromBatchId: batchId,
      toBatchId: targetBatch,
      subjectId: subjectId,
      reason: 'Manual_Transfer',
      coordinatorId: coordinatorId
    });

    try {
      setLoading(true);
      const result = await materialApi.moveStudentBatch(
        selectedStudent.student_roll,
        batchId,
        targetBatch,
        subjectId,
        'Manual_Transfer'
      );
      
      if (result && result.success) {
        Alert.alert('Success', result.message || 'Student moved successfully');
        setMoveModalVisible(false);
        fetchBatchDetails();
      } else {
        Alert.alert('Error', result?.message || 'Failed to move student');
      }
    } catch (error) {
      console.error('Error moving student:', error);
      Alert.alert('Error', 'Failed to move student');
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (performance) => {
    if (performance >= 80) return '#4CAF50';
    if (performance >= 60) return '#FF9800';
    return '#F44336';
  };

  const renderStudentCard = (student) => (
    <View key={student.student_roll} style={styles.studentCard}>
      <View style={styles.studentHeader}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{student.student_name}</Text>
          <Text style={styles.studentRoll}>Roll: {student.student_roll}</Text>
        </View>
        <TouchableOpacity
          style={styles.moveButton}
          onPress={() => handleMoveStudent(student)}
        >
          <Icon name="swap-horizontal" size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <View style={styles.studentStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: getPerformanceColor(student.current_performance) }]}>
            {student.current_performance && typeof student.current_performance === 'number' ? student.current_performance.toFixed(1) + '%' : 'N/A'}
          </Text>
          <Text style={styles.statLabel}>Performance</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{student.topics_completed || 0}</Text>
          <Text style={styles.statLabel}>Topics Done</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{student.pending_homework || 0}</Text>
          <Text style={styles.statLabel}>Pending HW</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{student.penalty_count || 0}</Text>
          <Text style={styles.statLabel}>Penalties</Text>
        </View>
      </View>

      {student.last_activity && (
        <View style={styles.lastActivity}>
          <Icon name="clock-outline" size={14} color="#64748B" style={{ marginRight: 4 }} />
          <Text style={styles.activityText}>
            Last activity: {new Date(student.last_activity).toLocaleDateString()}
          </Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading batch details...</Text>
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
          <Text style={styles.headerTitle}>{batchName}</Text>
          <Text style={styles.headerSubtitle}>Batch Details</Text>
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
        {/* Batch Summary */}
        {batchInfo && (
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>Batch Summary</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{students.length}</Text>
                <Text style={styles.summaryLabel}>Total Students</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {batchInfo.avg_performance && typeof batchInfo.avg_performance === 'number' ? batchInfo.avg_performance.toFixed(1) + '%' : 'N/A'}
                </Text>
                <Text style={styles.summaryLabel}>Avg Performance</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{batchInfo.active_topics || 0}</Text>
                <Text style={styles.summaryLabel}>Active Topics</Text>
              </View>
            </View>
          </View>
        )}

        {/* Students List */}
        <View style={styles.studentsContainer}>
          <Text style={styles.sectionTitle}>Students ({students.length})</Text>
          {students.map(renderStudentCard)}
        </View>

        {/* Empty State */}
        {students.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="account-group-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>No students in this batch</Text>
          </View>
        )}
      </ScrollView>

      {/* Move Student Modal */}
      <Modal
        visible={moveModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setMoveModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Move Student</Text>
              <TouchableOpacity
                onPress={() => setMoveModalVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={22} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedStudent && (
              <View style={styles.modalContent}>
                <Text style={styles.modalSubtitle}>
                  Moving: {selectedStudent.student_name} ({selectedStudent.student_roll})
                </Text>
                <Text style={styles.modalSubtitle}>From: {batchName}</Text>

                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Target Batch</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={targetBatch}
                      onValueChange={setTargetBatch}
                      style={styles.picker}
                    >
                      <Picker.Item label="Select Target Batch" value="" />
                      {availableBatches
                        .filter(batch => batch.batch_name !== batchName)
                        .map((batch) => (
                          <Picker.Item
                            key={batch.id}
                            label={batch.batch_name}
                            value={batch.id}
                          /> 
                        ))}
                    </Picker>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setMoveModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={confirmMoveStudent}
                  >
                    <Text style={styles.confirmButtonText}>Move Student</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default BatchDetails;
