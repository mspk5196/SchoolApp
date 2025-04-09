import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, ScrollView } from 'react-native';
import { API_URL } from '@env';

const Coordinator = ({ route }) => {
  const [coordinatorData, setCoordinatorData] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (route.params?.coordinatorData) {
      setCoordinatorData(route.params.coordinatorData);
    }
  }, [route.params?.coordinatorData]);

  useEffect(() => {
    if (coordinatorData?.grade_id) {
      fetchCoordinatorMentorsData(coordinatorData.grade_id);
      fetchCoordinatorStudentsData(coordinatorData.grade_id);
    }
  }, [coordinatorData]);

  const fetchCoordinatorMentorsData = async (gradeId) => {
    try {
      const response = await fetch(`${API_URL}/api/coordinatorMentors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gradeId }),
      });

      const data = await response.json();
      console.log('Coordinator Mentor Data API Response:', data);

      if (data.success) {
        setMentors(data.mentors);
      } else {
        Alert.alert('No mentors found', 'No mentors are assigned to this coordinator.');
      }
    } catch (error) {
      console.error("Error fetching coordinator's mentor data:", error);
      Alert.alert('Error', "Failed to fetch coordinator's mentor data");
    }
  };

  const fetchCoordinatorStudentsData = async (gradeId) => {
    try {
      const response = await fetch(`${API_URL}/api/coordinatorStudents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gradeId }),
      });

      const data = await response.json();
      console.log('Coordinator Students Data API Response:', data);

      if (data.success) {
        setStudents(data.coordinatorStudents);
      } else {
        Alert.alert('No Students found', 'No Students are assigned to this coordinator.');
      }
    } catch (error) {
      console.error("Error fetching coordinator's Students data:", error);
      Alert.alert('Error', "Failed to fetch coordinator's Students data");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {coordinatorData ? (
        <>
          <View style={styles.section}>
            <Text style={styles.title}>Coordinator Details</Text>
            <Text>Name: {coordinatorData.name}</Text>
            <Text>Roll: {coordinatorData.roll}</Text>
            <Text>Phone: {coordinatorData.phone}</Text>
            <Text>Grade: {coordinatorData.grade_name}</Text>
            <Text>Section: {coordinatorData.section_name}</Text>
            <Text>Subject: {coordinatorData.subject_name}</Text>
          </View>
          
        </>
      ) : (
        <Text>Loading coordinator data...</Text>
      )}
      {mentors ? (
        <>
          <View style={styles.section}>
            <Text style={styles.title}>Mentors</Text>
            <FlatList
              data={mentors}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.item}>
                  <Text>Name: {item.mentor_name}</Text>
                  <Text>Roll: {item.mentor_roll}</Text>
                  <Text>Section: {item.section_name}</Text>
                  <Text>Subject: {item.subject_name}</Text>
                </View>
              )}
            />
          </View>
        </>
      ) : (
        <Text>Loading mentors data...</Text>
      )}
      {students ? (
        <>
          <View style={styles.section}>
            <Text style={styles.title}>Students</Text>
            <FlatList
              data={students}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.item}>
                  <Text>Name: {item.student_name}</Text>
                  <Text>Roll: {item.roll}</Text>
                  <Text>Section: {item.section_name}</Text>
                  <Text>Grade: {item.grade_name}</Text>
                  <Text>Mentor: {item.mentor_name}</Text>
                </View>
              )}
            />
          </View>
        </>
      ) : (
        <Text>Loading students data...</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  section: { marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  item: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
});

export default Coordinator;
