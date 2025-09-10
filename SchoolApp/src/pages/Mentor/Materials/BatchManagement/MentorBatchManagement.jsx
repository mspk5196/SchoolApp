import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  FlatList,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { API_URL } from '../../../../utils/env.js';
import styles from './BatchManagementStyle.jsx';

const MentorBatchManagement = ({ navigation, route }) => {
  const { mentorData, selectedSubjectId, selectedSectionId, selectedSubjectName } = route.params || {};
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(selectedSubjectId);
  const [batchData, setBatchData] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedBatchDetails, setSelectedBatchDetails] = useState(null);
  const [batchStudents, setBatchStudents] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);

  useEffect(() => {
    if (selectedSectionId) {
      fetchSectionSubjects();
    }
  }, [selectedSectionId]);

  useEffect(() => {
    if (selectedSectionId && selectedSubject) {
      fetchBatchData();
      fetchAnalytics();
    }
  }, [selectedSectionId, selectedSubject]);

  const fetchSectionSubjects = async () => {
    try {
      const response = await fetch(`${API_URL}/api/mentor/batch-subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId: selectedSectionId })
      });

      const result = await response.json();
      if (result.success) {
        setSubjects(result.data);
        // Set default subject if not already set
        if (!selectedSubject && result.data.length > 0) {
          setSelectedSubject(result.data[0].id);
        }
      } else {
        Alert.alert('Error', result.message || 'Failed to fetch subjects');
      }
    } catch (error) {
      console.error('Fetch subjects error:', error);
      Alert.alert('Error', 'Failed to fetch subjects');
    }
  };

  const fetchBatchData = async () => {
    try {
      setLoading(true);
      const subjectId = selectedSubject || selectedSubjectId;
      
      if (!selectedSectionId || !subjectId) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/mentor/batches/${selectedSectionId}/${subjectId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      if (result.success) {
        setBatchData(result.data.batches || []);
      } else {
        setBatchData([]);
        if (result.message !== 'No batches found') {
          Alert.alert('Info', result.message || 'No batches found');
        }
      }
    } catch (error) {
      console.error('Fetch batch data error:', error);
      Alert.alert('Error', 'Failed to fetch batch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const subjectId = selectedSubject || selectedSubjectId;
      
      if (!selectedSectionId || !subjectId) {
        return;
      }

      const response = await fetch(`${API_URL}/api/mentor/batch-analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: selectedSectionId,
          subjectId: subjectId
        })
      });

      const result = await response.json();
      if (result.success) {
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error('Fetch analytics error:', error);
    }
  };

  const fetchBatchDetails = async (batch) => {
    try {
      setBatchLoading(true);
      const response = await fetch(`${API_URL}/api/mentor/batch-details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch_name: batch.batch_name,
          section_id: selectedSectionId,
          subject_id: selectedSubject || selectedSubjectId
        })
      });

      const result = await response.json();
      if (result.success) {
        setSelectedBatchDetails(result.data.batch_info);
        setBatchStudents(result.data.students);
        setShowBatchModal(true);
      } else {
        Alert.alert('Error', result.message || 'Failed to fetch batch details');
      }
    } catch (error) {
      console.error('Fetch batch details error:', error);
      Alert.alert('Error', 'Failed to fetch batch details');
    } finally {
      setBatchLoading(false);
    }
  };

  const getBatchStatusColor = (status) => {
    switch (status) {
      case 'Full': return '#F44336';
      case 'Active': return '#4CAF50';
      case 'Empty': return '#9E9E9E';
      default: return '#FF9800';
    }
  };

  const renderBatchCard = (batch) => (
    <TouchableOpacity
      key={batch.id}
      style={styles.batchCard}
      onPress={() => fetchBatchDetails(batch)}
    >
      <View style={styles.batchHeader}>
        <View style={styles.batchTitle}>
          <Text style={styles.batchName}>{batch.batch_name}</Text>
          <Text style={[
            styles.batchStatus,
            { color: getBatchStatusColor(batch.status) }
          ]}>
            {batch.status}
          </Text>
        </View>
        <Text style={styles.batchLevel}>Level {batch.batch_level}</Text>
      </View>

      <View style={styles.batchStats}>
        <View style={styles.statItem}>
          <Icon name="people" size={16} color="#666" />
          <Text style={styles.statText}>
            {batch.current_students}/{batch.max_students}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Icon name="trending-up" size={16} color="#666" />
          <Text style={styles.statText}>{batch.avg_performance}%</Text>
        </View>
        
        <View style={styles.statItem}>
          <Icon name="donut-small" size={16} color="#666" />
          <Text style={styles.statText}>{batch.utilization_percentage}%</Text>
        </View>
      </View>

      <View style={styles.batchFooter}>
        <Text style={styles.viewDetailsText}>Tap to view details</Text>
        <Icon name="chevron-right" size={20} color="#4CAF50" />
      </View>
    </TouchableOpacity>
  );

  const renderAnalyticsCard = () => {
    if (!analytics) return null;

    return (
      <View style={styles.analyticsCard}>
        <Text style={styles.analyticsTitle}>Overall Statistics</Text>
        
        <View style={styles.analyticsGrid}>
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsValue}>
              {analytics.overall_stats?.total_batches || 0}
            </Text>
            <Text style={styles.analyticsLabel}>Total Batches</Text>
          </View>
          
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsValue}>
              {analytics.overall_stats?.total_students || 0}
            </Text>
            <Text style={styles.analyticsLabel}>Total Students</Text>
          </View>
          
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsValue}>
              {analytics.overall_stats?.overall_utilization || 0}%
            </Text>
            <Text style={styles.analyticsLabel}>Utilization</Text>
          </View>
          
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsValue}>
              {analytics.overall_stats?.overall_performance || 0}%
            </Text>
            <Text style={styles.analyticsLabel}>Performance</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderStudentItem = ({ item }) => (
    <View style={styles.studentItem}>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.student_name}</Text>
        <Text style={styles.studentRoll}>Roll: {item.student_roll}</Text>
        <Text style={styles.studentEmail}>{item.student_email}</Text>
        <Text style={styles.assignedDate}>
          Assigned: {item.assigned_date}
        </Text>
      </View>
      
      <View style={styles.studentStats}>
        <View style={styles.performanceContainer}>
          <Text style={styles.performanceLabel}>Performance</Text>
          <Text style={styles.performanceValue}>
            {item.current_performance}%
          </Text>
          {item.performance_change !== 0 && (
            <Text style={[
              styles.performanceChange,
              { color: item.performance_change > 0 ? '#4CAF50' : '#F44336' }
            ]}>
              {item.performance_change > 0 ? '+' : ''}{item.performance_change}%
            </Text>
          )}
        </View>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>Topics</Text>
          <Text style={styles.progressValue}>{item.completed_topics}</Text>
        </View>
      </View>
    </View>
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchBatchData(), fetchAnalytics()]);
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Batch Management</Text>
      </View>

      {/* Subject Info */}
      <View style={styles.subjectInfo}>
        <Text style={styles.subjectName}>
          {selectedSubjectName || 'Subject Management'}
        </Text>
        <Text style={styles.sectionInfo}>
          Section ID: {selectedSectionId}
        </Text>
      </View>

      {/* Subject Selector */}
      {subjects.length > 1 && (
        <View style={styles.selectorContainer}>
          <Text style={styles.pickerLabel}>Subject</Text>
          <Picker
            selectedValue={selectedSubject}
            style={styles.picker}
            onValueChange={(value) => setSelectedSubject(value)}
          >
            {subjects.map(subject => (
              <Picker.Item 
                key={subject.id} 
                label={`${subject.subject_name} (${subject.batch_count} batches)`} 
                value={subject.id} 
              />
            ))}
          </Picker>
        </View>
      )}

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Analytics Card */}
        {renderAnalyticsCard()}

        {/* Batch Cards */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading batches...</Text>
          </View>
        ) : batchData.length > 0 ? (
          <View style={styles.batchContainer}>
            <Text style={styles.sectionTitle}>Batches</Text>
            {batchData.map(batch => renderBatchCard(batch))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="group-work" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No batches found</Text>
            <Text style={styles.emptySubtext}>
              Batches will appear here once they are configured
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Batch Details Modal */}
      <Modal
        visible={showBatchModal}
        animationType="slide"
        onRequestClose={() => setShowBatchModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowBatchModal(false)}
              style={styles.modalCloseButton}
            >
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedBatchDetails?.batch_name} Details
            </Text>
          </View>

          {batchLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Loading batch details...</Text>
            </View>
          ) : (
            <ScrollView style={styles.modalContent}>
              {/* Batch Info */}
              {selectedBatchDetails && (
                <View style={styles.batchDetailsCard}>
                  <Text style={styles.detailsTitle}>Batch Information</Text>
                  
                  <View style={styles.detailsGrid}>
                    <View style={styles.detailsItem}>
                      <Text style={styles.detailsLabel}>Level</Text>
                      <Text style={styles.detailsValue}>
                        {selectedBatchDetails.batch_level}
                      </Text>
                    </View>
                    
                    <View style={styles.detailsItem}>
                      <Text style={styles.detailsLabel}>Capacity</Text>
                      <Text style={styles.detailsValue}>
                        {selectedBatchDetails.total_students}/{selectedBatchDetails.max_students}
                      </Text>
                    </View>
                    
                    <View style={styles.detailsItem}>
                      <Text style={styles.detailsLabel}>Utilization</Text>
                      <Text style={styles.detailsValue}>
                        {selectedBatchDetails.utilization_percentage}%
                      </Text>
                    </View>
                    
                    <View style={styles.detailsItem}>
                      <Text style={styles.detailsLabel}>Avg Performance</Text>
                      <Text style={styles.detailsValue}>
                        {selectedBatchDetails.avg_performance}%
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Students */}
              <View style={styles.studentsSection}>
                <Text style={styles.sectionTitle}>
                  Students ({batchStudents.length})
                </Text>
                
                {batchStudents.length > 0 ? (
                  <FlatList
                    data={batchStudents}
                    renderItem={renderStudentItem}
                    keyExtractor={(item) => item.student_roll}
                    scrollEnabled={false}
                  />
                ) : (
                  <View style={styles.emptyContainer}>
                    <Icon name="person-outline" size={48} color="#ccc" />
                    <Text style={styles.emptyText}>No students in this batch</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

export default MentorBatchManagement;
