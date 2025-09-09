import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, Alert, TextInput } from 'react-native';
import styles from './Assessmentsty';
import { API_URL } from '../../../../utils/env';

const MentorDashboardAssessment = ({ navigation, route }) => {
  const { activityId, subject, grade, section_name, startTime, endTime } = route.params;
  const [activity, setActivity] = useState(null);
  const [students, setStudents] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivityDetails();
  }, [activityId]);

  useEffect(() => {
    if (students.length > 0) {
      const initialSubs = students.reduce((acc, student) => {
        acc[student.roll] = {
          marks_obtained: '',
          total_marks: activity?.total_marks || '100',
          is_absent: student.has_approved_leave,
        };
        return acc;
      }, {});
      setSubmissions(initialSubs);
    }
  }, [students, activity]);

  const fetchActivityDetails = async () => {
    const response = await fetch(`${API_URL}/api/mentor/activity/${activityId}/assessment`);
    const data = await response.json();
    if (data.success) {
      setActivity(data.activity);
      setStudents(data.students);
      const initialSubs = data.students.reduce((acc, s) => {
        acc[s.roll] = { marks_obtained: '', total_marks: '100' }; // Default total marks
        return acc;
      }, {});
      setSubmissions(initialSubs);
    } else {
      Alert.alert('Error', 'Failed to load session details.');
    }
  };

  const handleStartSession = async () => {
    const response = await fetch(`${API_URL}/api/mentor/activity/${activityId}/start`, { method: 'POST' });
    const data = await response.json();
    if (data.success) {
      setActivity(prev => ({ ...prev, status: 'In Progress' }));
    } else {
      Alert.alert('Error', data.message);
    }
  };

  const handleMarkChange = (roll, marks) => {
    setSubmissions(s => ({
      ...s,
      [roll]: { ...s[roll], marks_obtained: marks, is_absent: false }
    }));
  };

  const handleToggleAbsent = (roll) => {
    const isCurrentlyAbsent = submissions[roll].is_absent;
    setSubmissions(s => ({
      ...s,
      [roll]: { ...s[roll], is_absent: !isCurrentlyAbsent, marks_obtained: '' }
    }));
  };

  const handleCompleteSession = async () => {
    const studentSubmissions = Object.keys(submissions).map(roll => ({
      student_roll: roll,
      ...submissions[roll]
    }));

    if (studentSubmissions.some(s => !s.is_absent && s.marks_obtained === '')) {
      Alert.alert('Incomplete', 'Please enter marks for all present students.');
      return;
    }

    const response = await fetch(`${API_URL}/api/mentor/activity/${activityId}/assessment/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentSubmissions }),
    });
    const data = await response.json();

    if (data.success) {
      Alert.alert('Success', 'Assessment marks saved.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } else {
      Alert.alert('Error', 'Failed to save marks.');
    }
  };

  if (isLoading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.sessionBox}>
        <Text style={styles.subject}>{subject} ({startTime} - {endTime})</Text>
        <Text style={styles.gradeText}>Grade {grade} - {section_name} | Assessment</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {students.map(student => (
          <View key={student.roll} style={[styles.profileCard, submissions[student.roll]?.is_absent && { backgroundColor: '#f0f0f0' }]}>
            <Image source={{ uri: `${API_URL}/${student.profile_photo}`.replace(/\\/g, '/') }} style={styles.profileImg} />
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{student.name}</Text>
              <Text style={styles.profileId}>{student.roll}</Text>
            </View>
            <TextInput
              style={[styles.markInput, submissions[student.roll]?.is_absent && styles.disabledInput]}
              placeholder="Marks"
              keyboardType="numeric"
              value={submissions[student.roll]?.marks_obtained}
              editable={!submissions[student.roll]?.is_absent}
              onChangeText={text => handleMarkChange(student.roll, text)}
            />
            <TouchableOpacity style={styles.absentToggle} onPress={() => handleToggleAbsent(student.roll)}>
              <Text style={{ color: submissions[student.roll]?.is_absent ? 'red' : 'grey' }}>Absent</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {activity?.status === 'Not Started' && <TouchableOpacity style={styles.completeBtn} onPress={handleStartSession}><Text style={styles.completeText}>Start Session</Text></TouchableOpacity>}
      {activity?.status === 'In Progress' && <TouchableOpacity style={styles.completeBtn} onPress={handleCompleteSession}><Text style={styles.completeText}>Complete & Save</Text></TouchableOpacity>}
      {activity?.status === 'Completed' && <View style={styles.disabledBtn}><Text style={styles.completeText}>Session Completed</Text></View>}

    </SafeAreaView>
  );
};

export default MentorDashboardAssessment;