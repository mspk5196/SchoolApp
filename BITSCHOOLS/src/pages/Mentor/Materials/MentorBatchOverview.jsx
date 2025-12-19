import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../../components';
import * as materialApi from '../../../utils/materialApi';

const MentorBatchOverview = ({ navigation, route }) => {
  const {
    userData,
    grades,
    selectedGrade,
    selectedSubjectId,
    selectedSubjectName,
    selectedSectionId,
  } = route.params || {};

  const [batches, setBatches] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [batchRes, analyticsRes] = await Promise.all([
        materialApi.mentorGetBatches(selectedSectionId, selectedSubjectId),
        materialApi.mentorGetBatchAnalytics(selectedSectionId, selectedSubjectId),
      ]);

      if (batchRes && batchRes.success) {
        setBatches(batchRes.batches || []);
      } else {
        setBatches([]);
      }

      if (analyticsRes && analyticsRes.success) {
        setAnalytics(analyticsRes.analytics || null);
      } else {
        setAnalytics(null);
      }
    } catch (error) {
      console.error('Error fetching batch overview:', error);
      Alert.alert('Error', 'Failed to load batch information');
    } finally {
      setLoading(false);
    }
  };

  const renderAnalytics = () => {
    if (!analytics) return null;
    return (
      <View
        style={{
          backgroundColor: '#EEF2FF',
          marginHorizontal: 16,
          marginTop: 12,
          borderRadius: 12,
          padding: 12,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 6 }}>
          Batch Summary
        </Text>
        <Text style={{ fontSize: 13, color: '#4B5563' }}>
          Total Batches: {analytics.total_batches}
        </Text>
        <Text style={{ fontSize: 13, color: '#4B5563' }}>
          Total Students: {analytics.total_students}
        </Text>
        {analytics.avg_performance != null && (
          <Text style={{ fontSize: 13, color: '#4B5563' }}>
            Average Performance: {analytics.avg_performance.toFixed(1)}%
          </Text>
        )}
      </View>
    );
  };

  const renderBatchCard = (batch) => (
    <View
      key={batch.id}
      style={{
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: 10,
        borderRadius: 12,
        padding: 12,
        elevation: 1,
      }}
    >
      <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827' }}>
        {batch.batch_name}
      </Text>
      <Text style={{ fontSize: 13, color: '#4B5563', marginTop: 4 }}>
        Students: {batch.current_students_count} / {batch.max_students}
      </Text>
      {batch.avg_performance_score != null && (
        <Text style={{ fontSize: 13, color: '#4B5563', marginTop: 2 }}>
          Avg Performance: {batch.avg_performance_score.toFixed(1)}%
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <Header title="Batches" navigation={navigation} />

      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
          {selectedGrade?.grade_name} - Section {selectedSectionId}
        </Text>
        <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>
          Subject: {selectedSubjectName}
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={{ marginTop: 8, color: '#6B7280' }}>Loading batches...</Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1, paddingTop: 4 }}>
          {renderAnalytics()}

          {batches.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 24 }}>
              <Text style={{ color: '#9CA3AF' }}>No batches configured for this subject.</Text>
            </View>
          ) : (
            <View style={{ paddingBottom: 24 }}>
              {batches.map(renderBatchCard)}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default MentorBatchOverview;
