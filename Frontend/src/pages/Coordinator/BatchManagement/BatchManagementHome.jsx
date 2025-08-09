import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import styles from './BatchManagementStyles';
import { API_URL } from '../../../utils/env.js';

const BatchManagementHome = ({route}) => {
  const navigation = useNavigation();
  const {activeGrade} = route.params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [batchData, setBatchData] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    if (selectedSection) {
      fetchSubjects();
    }
  }, [selectedSection]);

  useEffect(() => {
    if (selectedSection && selectedSubject) {
      fetchBatchData();
      fetchAnalytics();
    }
  }, [selectedSection, selectedSubject]);

  const fetchSections = async () => {
    try {
      const storedData = await AsyncStorage.getItem('coordinatorData');
      if (storedData) {
        const coordinatorData = JSON.parse(storedData);
        // console.log('Coordinator Data:', coordinatorData);

        const response = await fetch(`${API_URL}/api/coordinator/getGradeSections`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            gradeID: activeGrade,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          setSections(result.gradeSections || []);
          // console.log('Fetched Grade Sections:', result.gradeSections);
        }
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      if (!selectedSection) return;
      console.log('Selected Section:', selectedSection);

      const response = await fetch(`${API_URL}/api/batches/getSectionSubjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionId: selectedSection,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSubjects(result.sectionSubjects || []);
        console.log('Fetched Section Subjects:', result.sectionSubjects);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchBatchData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/batches/${selectedSection}/${selectedSubject}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setBatchData(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching batch data:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/batches/analytics/${selectedSection}/${selectedSubject}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    if (selectedSection && selectedSubject) {
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
      'This will reallocate all students based on their current performance. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await fetch(`${API_URL}/api/batches/reallocate`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  sectionId: selectedSection,
                  subjectId: selectedSubject,
                }),
              });

              const result = await response.json();
              
              if (response.ok) {
                Alert.alert('Success', 'Batch reallocation completed successfully');
                fetchBatchData();
                fetchAnalytics();
              } else {
                Alert.alert('Error', result.message || 'Failed to run reallocation');
              }
            } catch (error) {
              console.error('Error running reallocation:', error);
              Alert.alert('Error', 'Failed to run reallocation');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleInitializeBatches = async () => {
    Alert.alert(
      'Initialize Batches',
      'This will create initial batch assignments for all students. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Initialize',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await fetch(`${API_URL}/api/batches/initialize`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  sectionId: selectedSection,
                  subjectId: selectedSubject,
                }),
              });

              const result = await response.json();
              
              if (response.ok) {
                Alert.alert('Success', 'Batch initialization completed successfully');
                fetchBatchData();
                fetchAnalytics();
              } else {
                Alert.alert('Error', result.message || 'Failed to initialize batches');
              }
            } catch (error) {
              console.error('Error initializing batches:', error);
              Alert.alert('Error', 'Failed to initialize batches');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderBatchCard = (batch) => (
    <TouchableOpacity
      key={batch.batch_name}
      style={styles.batchCard}
      onPress={() => navigation.navigate('BatchDetails', { 
        batchName: batch.batch_name,
        sectionId: selectedSection,
        subjectId: selectedSubject
      })}
    >
      <View style={styles.batchHeader}>
        <Text style={styles.batchName}>{batch.batch_name}</Text>
        <View style={styles.studentCount}>
          <Text style={{ fontSize: 16, color: '#666' }}>👥</Text>
          <Text style={styles.countText}>{batch.student_count}</Text>
        </View>
      </View>
      
      <View style={styles.batchStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{batch.avg_performance?.toFixed(1) || 'N/A'}%</Text>
          <Text style={styles.statLabel}>Avg Performance</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{batch.active_topics || 0}</Text>
          <Text style={styles.statLabel}>Active Topics</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{batch.pending_assessments || 0}</Text>
          <Text style={styles.statLabel}>Pending Tests</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading batch management...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 24, color: 'white' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Batch Management</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Text style={{ fontSize: 24, color: 'white' }}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Selection Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Section</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedSection}
                onValueChange={setSelectedSection}
                style={styles.picker}
              >
                <Picker.Item label="Select Section" value="" />
                {sections.map((section) => (
                  <Picker.Item
                    key={section.id}
                    label={section.section_name}
                    value={section.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Subject</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedSubject}
                onValueChange={setSelectedSubject}
                style={styles.picker}
                enabled={!!selectedSection}
              >
                <Picker.Item label="Select Subject" value="" />
                {subjects.map((subject) => (
                  <Picker.Item
                    key={subject.id}
                    label={subject.subject_name}
                    value={subject.id}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* Analytics Summary */}
        {analytics && (
          <View style={styles.analyticsCard}>
            <Text style={styles.cardTitle}>Analytics Overview</Text>
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
                <Text style={styles.analyticsValue}>{analytics.avg_performance?.toFixed(1)}%</Text>
                <Text style={styles.analyticsLabel}>Avg Performance</Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {selectedSection && selectedSubject && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.reallocateButton]}
              onPress={handleRunReallocation}
            >
              <Text style={{ fontSize: 20, color: 'white' }}>🔀</Text>
              <Text style={styles.actionButtonText}>Run Reallocation</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.initializeButton]}
              onPress={handleInitializeBatches}
            >
              <Text style={{ fontSize: 20, color: 'white' }}>👥➕</Text>
              <Text style={styles.actionButtonText}>Initialize Batches</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Batch List */}
        {batchData.length > 0 && (
          <View style={styles.batchesContainer}>
            <Text style={styles.sectionTitle}>Current Batches</Text>
            {batchData.map(renderBatchCard)}
          </View>
        )}

        {/* Empty State */}
        {selectedSection && selectedSubject && batchData.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 64, color: '#ccc' }}>👥</Text>
            <Text style={styles.emptyText}>No batches found</Text>
            <Text style={styles.emptySubtext}>Initialize batches to get started</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default BatchManagementHome;
