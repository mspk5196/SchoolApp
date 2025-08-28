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
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from './BatchHistoryStyles';
import { API_URL } from '../../../utils/env.js';

const BatchHistory = () => {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [batchHistory, setBatchHistory] = useState([]);
  const [currentBatches, setCurrentBatches] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchBatchHistory();
  }, [selectedSubject]);

  const fetchBatchHistory = async () => {
    try {
      setLoading(true);
      const storedPhone = await AsyncStorage.getItem('userPhone');
      
      if (!storedPhone) {
        Alert.alert('Error', 'Please login again');
        return;
      }

      const phone = JSON.parse(storedPhone);

      const queryParam = selectedSubject !== 'all' ? `?subject_id=${selectedSubject}` : '';
      const response = await fetch(`${API_URL}/student/batch-history${queryParam}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${phone}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setBatchHistory(result.history || []);
        setCurrentBatches(result.currentBatches || []);
        setSubjects(result.subjects || []);
      } else {
        Alert.alert('Error', 'Failed to load batch history');
      }
    } catch (error) {
      console.error('Error fetching batch history:', error);
      Alert.alert('Error', 'Failed to load batch history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBatchHistory();
  };

  const getBatchColor = (level) => {
    switch (level) {
      case 1: return '#4CAF50'; // Green for top batch
      case 2: return '#2196F3'; // Blue for second batch
      case 3: return '#FF9800'; // Orange for third batch
      case 4: return '#F44336'; // Red for bottom batch
      default: return '#9E9E9E';
    }
  };

  const getAllocationType = (reason) => {
    switch (reason) {
      case 'Initial': return { icon: 'start', color: '#9E9E9E' };
      case 'Performance_Upgrade': return { icon: 'trending-up', color: '#4CAF50' };
      case 'Performance_Downgrade': return { icon: 'trending-down', color: '#F44336' };
      case 'Penalty': return { icon: 'warning', color: '#FF5722' };
      case 'Manual': return { icon: 'edit', color: '#2196F3' };
      default: return { icon: 'help', color: '#9E9E9E' };
    }
  };

  const renderCurrentBatch = (batch) => (
    <View key={`${batch.subject_id}_current`} style={styles.currentBatchCard}>
      <View style={styles.batchHeader}>
        <Text style={styles.subjectName}>{batch.subject_name}</Text>
        <View style={[styles.batchIndicator, { backgroundColor: getBatchColor(batch.batch_level) }]}>
          <Text style={styles.batchLevel}>{batch.batch_level}</Text>
        </View>
      </View>
      
      <View style={styles.batchDetails}>
        <Text style={styles.batchName}>{batch.batch_name}</Text>
        <Text style={styles.assignedDate}>
          Assigned: {new Date(batch.assigned_at).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.performanceInfo}>
        <View style={styles.performanceItem}>
          <Text style={styles.performanceLabel}>Performance Score</Text>
          <Text style={styles.performanceValue}>{batch.performance_score?.toFixed(1) || 'N/A'}</Text>
        </View>
        <View style={styles.performanceItem}>
          <Text style={styles.performanceLabel}>Days in Batch</Text>
          <Text style={styles.performanceValue}>{batch.days_in_batch || 0}</Text>
        </View>
      </View>
    </View>
  );

  const renderHistoryItem = (item, index) => {
    const allocationType = getAllocationType(item.allocation_reason);
    const isUpgrade = item.to_batch_level < item.from_batch_level;

    return (
      <View key={`${item.id}_${index}`} style={styles.historyItem}>
        <View style={styles.historyLeft}>
          <View style={[styles.allocationIcon, { backgroundColor: allocationType.color }]}>
            <Icon name={allocationType.icon} size={16} color="white" />
          </View>
          
          <View style={styles.historyContent}>
            <Text style={styles.subjectName}>{item.subject_name}</Text>
            <View style={styles.batchTransition}>
              <View style={[styles.batchChip, { backgroundColor: getBatchColor(item.from_batch_level) }]}>
                <Text style={styles.batchChipText}>Batch {item.from_batch_level}</Text>
              </View>
              <Icon name="arrow-forward" size={16} color="#666" style={styles.arrowIcon} />
              <View style={[styles.batchChip, { backgroundColor: getBatchColor(item.to_batch_level) }]}>
                <Text style={styles.batchChipText}>Batch {item.to_batch_level}</Text>
              </View>
            </View>
            <Text style={styles.allocationReason}>
              {item.allocation_reason.replace('_', ' ')}
            </Text>
          </View>
        </View>

        <View style={styles.historyRight}>
          <Text style={styles.allocationDate}>
            {new Date(item.allocation_date).toLocaleDateString()}
          </Text>
          <View style={[styles.changeIndicator, { 
            backgroundColor: isUpgrade ? '#4CAF50' : '#F44336' 
          }]}>
            <Icon 
              name={isUpgrade ? 'trending-up' : 'trending-down'} 
              size={12} 
              color="white" 
            />
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading batch history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Batch History</Text>
          <Text style={styles.headerSubtitle}>Track your batch movements</Text>
        </View>
      </View>

      {/* Subject Filter */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by Subject:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterChip, selectedSubject === 'all' && styles.activeFilterChip]}
            onPress={() => setSelectedSubject('all')}
          >
            <Text style={[styles.filterChipText, selectedSubject === 'all' && styles.activeFilterChipText]}>
              All Subjects
            </Text>
          </TouchableOpacity>
          {subjects.map(subject => (
            <TouchableOpacity
              key={subject.id}
              style={[styles.filterChip, selectedSubject === subject.id && styles.activeFilterChip]}
              onPress={() => setSelectedSubject(subject.id)}
            >
              <Text style={[styles.filterChipText, selectedSubject === subject.id && styles.activeFilterChipText]}>
                {subject.subject_name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Current Batches */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Batches</Text>
          {currentBatches.length > 0 ? (
            currentBatches.map(batch => renderCurrentBatch(batch))
          ) : (
            <Text style={styles.emptyText}>No current batch assignments found</Text>
          )}
        </View>

        {/* Batch Movement History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Movement History</Text>
          {batchHistory.length > 0 ? (
            batchHistory.map((item, index) => renderHistoryItem(item, index))
          ) : (
            <Text style={styles.emptyText}>No batch movement history found</Text>
          )}
        </View>

        {/* Legend */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Batch Level Legend</Text>
          <View style={styles.legendContainer}>
            {[1, 2, 3, 4].map(level => (
              <View key={level} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: getBatchColor(level) }]} />
                <Text style={styles.legendText}>
                  Batch {level} - {level === 1 ? 'Advanced' : level === 2 ? 'Intermediate' : level === 3 ? 'Basic' : 'Foundation'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BatchHistory;
