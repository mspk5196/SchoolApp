import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../../components';
import * as materialApi from '../../../utils/materialApi';

const MentorTopicHierarchy = ({ navigation, route }) => {
  const {
    userData,
    grades,
    selectedGrade,
    selectedSubjectId,
    selectedSubjectName,
    selectedSectionId,
  } = route.params || {};

  const [selectedSection] = useState(selectedSectionId);
  const [selectedSubject] = useState(selectedSubjectId);

  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [subActivities, setSubActivities] = useState([]);
  const [selectedSubActivity, setSelectedSubActivity] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedSubject && selectedSection) {
      fetchActivitiesForSubject();
    }
  }, [selectedSubject, selectedSection]);

  useEffect(() => {
    if (selectedActivity) {
      fetchTopicHierarchy();
    }
  }, [selectedActivity, selectedSubActivity]);

  const fetchActivitiesForSubject = async () => {
    try {
      setLoading(true);
      const result = await materialApi.mentorGetActivitiesForSubject(selectedSection, selectedSubject);
      if (result && result.success) {
        const list = result.activities || [];
        setActivities(list);
        if (list.length > 0) {
          setSelectedActivity(list[0].context_activity_id);
        }
      } else {
        Alert.alert('Error', result?.message || 'Failed to fetch activities');
      }
    } catch (error) {
      console.error('Fetch activities error:', error);
      Alert.alert('Error', 'Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubActivitiesForSubject = async (baseContextId) => {
    try {
      const contextId = baseContextId || selectedActivity;
      if (!contextId) {
        setSubActivities([]);
        setSelectedSubActivity(null);
        return;
      }

      const result = await materialApi.mentorGetSubActivitiesForActivity(
        selectedSection,
        selectedSubject,
        contextId,
      );

      if (result && result.success) {
        const list = result.subActivities || [];
        setSubActivities(list);
        setSelectedSubActivity((prev) => {
          if (prev && list.some((a) => a.context_activity_id === prev)) return prev;
          return list.length > 0 ? list[0].context_activity_id : null;
        });
      } else {
        setSubActivities([]);
        setSelectedSubActivity(null);
      }
    } catch (error) {
      console.error('Fetch sub-activities error:', error);
    }
  };

  const fetchTopicHierarchy = async () => {
    if (!selectedSubject || !selectedSection) return;
    setLoading(true);
    setTopics([]);

    try {
      const contextActivityId = selectedSubActivity || selectedActivity;
      const result = await materialApi.mentorGetTopicHierarchy(
        selectedSection,
        selectedSubject,
        contextActivityId,
      );

      if (result && result.success) {
        setTopics(result.topics || []);
      } else {
        Alert.alert('Error', result?.message || 'Failed to fetch topic hierarchy');
        setTopics([]);
      }
    } catch (error) {
      console.error('Fetch topic hierarchy error:', error);
      Alert.alert('Error', 'Failed to fetch topic hierarchy');
    } finally {
      setLoading(false);
    }
  };

  const handleActivityChange = async (value) => {
    setSelectedActivity(value);
    setSelectedSubActivity(null);
    await fetchSubActivitiesForSubject(value);
  };

  const handleSubActivityChange = (value) => {
    setSelectedSubActivity(value);
  };

  const renderTopicRow = (topic) => {
    const level = topic.level || 1;
    const indent = (level - 1) * 16;

    return (
      <View
        key={topic.id}
        style={{
          marginLeft: indent,
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 8,
          backgroundColor: '#FFFFFF',
          marginBottom: 6,
          elevation: 1,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }} numberOfLines={2}>
              {topic.topic_name}
            </Text>
            {topic.topic_code ? (
              <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                Code: {topic.topic_code}
              </Text>
            ) : null}
          </View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('MentorTopicMaterials', {
                topicId: topic.id,
                topicName: topic.topic_name,
                selectedSubjectId,
                selectedSectionId,
              })
            }
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: '#3B82F6',
            }}
          >
            <Text style={{ fontSize: 12, color: '#3B82F6', fontWeight: '600' }}>View Materials</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <Header title="Topic Hierarchy" navigation={navigation} />

      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
          {selectedGrade?.grade_name} - Section {selectedSectionId}
        </Text>
        <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>
          Subject: {selectedSubjectName}
        </Text>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8 }}>
        {/* Activity selector */}
        {activities.length > 0 && (
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 13, color: '#4B5563', marginBottom: 4 }}>Activity</Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRadius: 8,
                backgroundColor: '#FFFFFF',
              }}
            >
              <Picker
                selectedValue={selectedActivity}
                onValueChange={handleActivityChange}
              >
                {activities.map((a) => (
                  <Picker.Item
                    key={a.context_activity_id}
                    label={a.activity_name}
                    value={a.context_activity_id}
                  />
                ))}
              </Picker>
            </View>
          </View>
        )}

        {/* Sub-activity selector (optional) */}
        {subActivities.length > 0 && (
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 13, color: '#4B5563', marginBottom: 4 }}>Sub-Activity</Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRadius: 8,
                backgroundColor: '#FFFFFF',
              }}
            >
              <Picker
                selectedValue={selectedSubActivity}
                onValueChange={handleSubActivityChange}
              >
                {subActivities.map((a) => (
                  <Picker.Item
                    key={a.context_activity_id}
                    label={a.activity_name}
                    value={a.context_activity_id}
                  />
                ))}
              </Picker>
            </View>
          </View>
        )}

        {loading && topics.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 24 }}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={{ marginTop: 8, color: '#6B7280' }}>Loading topics...</Text>
          </View>
        ) : topics.length > 0 ? (
          <View style={{ marginTop: 8, paddingBottom: 24 }}>
            {topics.map(renderTopicRow)}
          </View>
        ) : (
          <View style={{ alignItems: 'center', marginTop: 24 }}>
            <Text style={{ color: '#9CA3AF' }}>No topics found for this selection.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MentorTopicHierarchy;
