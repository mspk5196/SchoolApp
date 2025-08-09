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
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import styles from './BatchManagementStyles';
import { API_URL } from '../../../utils/env.js';

const BatchManagementHome = ({route}) => {
  const navigation = useNavigation();
  const {activeGrade, coordinatorData, selectedSubjectId, selectedSectionId, selectedSubjectName} = route.params;
  console.log('BatchManagementHome mounted with params:', route.params);

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


  useEffect(() => {
    console.log('useEffect triggered - selectedSection:', selectedSection, 'selectedSubject:', selectedSubject);
    if (selectedSection && selectedSubject) {
      fetchBatchData();
      fetchAnalytics();
    }
  }, [selectedSection, selectedSubject]);

  useEffect(() => {
    // Initialize data immediately if we have the values from route params
    console.log('Component mounted with:', { selectedSectionId, selectedSubjectId });
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
      
      console.log('fetchBatchData called with:', { sectionId, subjectId });
      
      if (!sectionId || !subjectId) {
        console.log('Missing sectionId or subjectId, skipping fetch');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/batches/${sectionId}/${subjectId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
   
      if (response.ok) {
        const result = await response.json();
        console.log('Batch data response:', result);
        const batches = result.data || [];
        
        // Add calculated fields for better display
        const enhancedBatches = batches.map(batch => ({
          ...batch,
          student_count: batch.current_students || 0,
          capacity_utilization: batch.max_students > 0 
            ? ((batch.current_students / batch.max_students) * 100).toFixed(1)
            : 0,
          performance_grade: getPerformanceGrade(batch.avg_performance)
        }));
        
        setBatchData(enhancedBatches);
        setLastUpdateTime(new Date().toLocaleTimeString());
        console.log('Enhanced batches set:', enhancedBatches);
      } else {
        console.log('Failed to fetch batch data, response not ok');
        showErrorMessage('Failed to fetch batch data');
      }
    } catch (error) {
      console.error('Error fetching batch data:', error);
      showErrorMessage('Network error while fetching batch data');
    }
    finally{
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
      
      console.log('fetchAnalytics called with:', { sectionId, subjectId });
      
      if (!sectionId || !subjectId) {
        console.log('Missing sectionId or subjectId for analytics, skipping fetch');
        return;
      }

      const response = await fetch(`${API_URL}/api/batches/analytics/${sectionId}/${subjectId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Analytics response:', result);
        const analyticsData = result.data;
        
        // Enhance analytics with calculated metrics
        const enhancedAnalytics = {
          ...analyticsData,
          overall_grade: getPerformanceGrade(analyticsData.avg_performance),
          students_per_batch: analyticsData.total_batches > 0 
            ? (analyticsData.total_students / analyticsData.total_batches).toFixed(1)
            : 0,
          batch_efficiency: analyticsData.total_batches > 0 && analyticsData.total_students > 0
            ? ((analyticsData.total_students / (analyticsData.total_batches * 15)) * 100).toFixed(1) // Assuming 15 as ideal batch size
            : 0
        };
        
        setAnalytics(enhancedAnalytics);
        console.log('Enhanced analytics set:', enhancedAnalytics);
      } else {
        console.log('Failed to fetch analytics, response not ok');
        showErrorMessage('Failed to fetch analytics');
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
              
              const response = await fetch(`${API_URL}/api/batches/reallocate`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  sectionId: selectedSection || selectedSectionId,
                  subjectId: selectedSubject || selectedSubjectId,
                  coordinatorId: coordinatorData.id
                }),
              });

              const result = await response.json();
              
              if (response.ok) {
                showSuccessMessage(`Reallocation completed successfully! ${result.moved_students || 0} students were moved.`);
                fetchBatchData();
                fetchAnalytics();
              } else {
                showErrorMessage(result.message || 'Failed to run reallocation');
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
      
      console.log('Creating batches:', {
        subjectId: selectedSubject || selectedSubjectId,
        gradeId: activeGrade,
        sectionId: selectedSection || selectedSectionId,
        maxBatches: numBatches,
        coordinatorData: coordinatorData.id
      });

      const response = await fetch(`${API_URL}/api/batches/configure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjectId: selectedSubject || selectedSubjectId,
          gradeId: activeGrade,
          sectionId: selectedSection || selectedSectionId,
          maxBatches: numBatches,
          batchSizeLimit: 30, 
          autoAllocation: true,
          coordinatorId: coordinatorData.id
        }),
      });

      const result = await response.json();
      console.log('Configure batches response:', result);
      
      if (response.ok) {
        showSuccessMessage(`${numBatches} batches configured successfully! You can now initialize students.`);
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

    Alert.alert(
      'Initialize Batches',
      'This will create initial batch assignments for all students based on their performance. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Initialize',
          onPress: async () => {
            try {
              setLoading(true);
              setProcessingAction('Initializing student assignments...');
              
              const response = await fetch(`${API_URL}/api/batches/initialize`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  sectionId: selectedSection || selectedSectionId,
                  subjectId: selectedSubject || selectedSubjectId,
                  coordinatorId: coordinatorData.id
                }),
              });

              const result = await response.json();
              
              if (response.ok) {
                showSuccessMessage(`Initialization completed! ${result.assigned_students || 0} students were assigned to batches.`);
                fetchBatchData();
                fetchAnalytics();
              } else {
                showErrorMessage(result.message || 'Failed to initialize batches');
              }
            } catch (error) {
              console.error('Error initializing batches:', error);
              showErrorMessage('Network error during initialization');
            } finally {
              setLoading(false);
              setProcessingAction('');
            }
          },
        },
      ]
    );
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

      const response = await fetch(`${API_URL}/api/batches/update-size`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batchId: selectedBatchForResize.id,
          newMaxStudents: size,
          coordinatorId: coordinatorData.id
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        showSuccessMessage(`Batch size updated successfully to ${size} students!`);
        fetchBatchData();
        fetchAnalytics();
      } else {
        showErrorMessage(result.message || 'Failed to update batch size');
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
      onPress={() => navigation.navigate('BatchDetails', { 
        batchName: batch.batch_name,
        batchId: batch.id,
        sectionId: selectedSection || selectedSectionId,
        subjectId: selectedSubject || selectedSubjectId,
        coordinatorId: coordinatorData.id
      })}
    >
      <View style={styles.batchHeader}>
        <View style={styles.batchNameContainer}>
          <Text style={styles.batchName}>{batch.batch_name}</Text>
          <Text style={styles.batchLevel}>Level {batch.batch_level || 1}</Text>
        </View>
        <View style={styles.studentCount}>
          <Text style={{ fontSize: 16, color: '#666' }}>👥</Text>
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
          <Text style={styles.quickActionText}>📊 Info</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={(e) => {
            e.stopPropagation();
            handleChangeBatchSize(batch);
          }}
        >
          <Text style={styles.quickActionText}>👥 Resize</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

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

  console.log('Render - selectedSection:', selectedSection, 'selectedSubject:', selectedSubject, 'batchData length:', batchData.length, 'analytics:', !!analytics);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ fontSize: 24, color: 'white' }}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Batch Management</Text>
            {selectedSubjectName && (
              <Text style={styles.headerSubtitle}>
                {selectedSubjectName} - Grade {activeGrade}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>
            {processingAction || 'Loading batch management...'}
          </Text>
          {processingAction && (
            <Text style={styles.loadingSubtext}>
              Please wait, this may take a few moments
            </Text>
          )}
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
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Batch Management</Text>
          {selectedSubjectName && (
            <Text style={styles.headerSubtitle}>
              {selectedSubjectName} - Grade {activeGrade}
            </Text>
          )}
        </View>
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

        {/* Analytics Summary */}
        {analytics && (
          <TouchableOpacity 
            style={styles.analyticsCard}
            onPress={() => setShowAnalyticsModal(true)}
          >
            <View style={styles.analyticsHeader}>
              <Text style={styles.cardTitle}>Analytics Overview</Text>
              <Text style={styles.analyticsSubtitle}>Tap for details 📊</Text>
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
        {((selectedSection && selectedSubject) || (selectedSectionId && selectedSubjectId)) && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.configureButton]}
              onPress={handleConfigureBatches}
            >
              <Text style={{ fontSize: 20, color: 'white' }}>⚙️</Text>
              <Text style={styles.actionButtonText}>Configure Batches</Text>
            </TouchableOpacity>

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
        {((selectedSection && selectedSubject) || (selectedSectionId && selectedSubjectId)) && batchData.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 64, color: '#ccc' }}>👥</Text>
            <Text style={styles.emptyText}>No batches found</Text>
            <Text style={styles.emptySubtext}>First configure batches, then initialize students</Text>
          </View>
        )}
      </ScrollView>

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
            }}>Enter the number of batches to create (1-10):</Text>
            
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
                  setBatchInput('3'); // Reset to default
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
                }}>Create</Text>
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
                <Text style={{ fontSize: 18, color: '#666' }}>✕</Text>
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
                      <Text style={{ fontWeight: 'bold' }}>{activeGrade}</Text>
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
    </SafeAreaView>
  );
};

export default BatchManagementHome;
