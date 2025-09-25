import { apiFetch } from "../../../../utils/apiClient.js";
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import styles from './BatchDetailsStyles.jsx';
import { API_URL } from '../../../../utils/env.js';

const MentorBatchDetails = () => {
  const navigation = useNavigation(); 
  const route = useRoute();
  const { batchName, sectionId, subjectId, mentorId, batchId } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState([]);
  const [batchInfo, setBatchInfo] = useState(null);

  useEffect(() => {
    fetchBatchDetails();
  }, []);

  const fetchBatchDetails = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`/mentor/batches/details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batch_name: batchName,
          section_id: sectionId,
          subject_id: subjectId,
        }),
      });

      if (response) {
        const result = response;
        setStudents(result.students || []);
        setBatchInfo(result.batch_info);
      } else { 
        Alert.alert('Error', 'Failed to load batch details');
      }
    } catch (error) {
      console.error('Error fetching batch details:', error);
      Alert.alert('Error', 'Failed to load batch details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBatchDetails();
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
        {/* <TouchableOpacity
          style={styles.moveButton}
          onPress={() => handleMoveStudent(student)}
        >
          <Text style={{ color: "#2196F3", fontSize: 18 }}>⇄</Text>
        </TouchableOpacity> */}
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
          <Text style={{ color: "#666", fontSize: 12, marginRight: 4 }}>🕐</Text>
          <Text style={styles.activityText}>
            Last activity: {new Date(student.last_activity).toLocaleDateString()}
          </Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading batch details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: "white", fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{batchName}</Text>
          <Text style={styles.headerSubtitle}>Batch Details</Text>
        </View>
        <TouchableOpacity onPress={handleRefresh}>
          <Text style={{ color: "white", fontSize: 20 }}>↻</Text>
        </TouchableOpacity>
      </View>

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
            <Text style={{ fontSize: 48, color: "#ccc" }}>👥</Text>
            <Text style={styles.emptyText}>No students in this batch</Text>
          </View>
        )}
      </ScrollView>

    </SafeAreaView>
  );
};

export default MentorBatchDetails;
