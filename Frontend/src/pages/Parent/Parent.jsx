import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';

const Parent = ({ route }) => {

  const [loading, setLoading] = useState(false);

  const [studentData, setStudentData] = useState(null);


  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      try {
        const routeParams = route.params;
        setStudentData(routeParams?.studentData);

      }
      catch (error) {
        console.error('Error fetching student data:', error);
        Alert.alert('Error', 'Failed to fetch student data');
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, []);


  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" />
      ) : studentData ? (
        <View style={styles.studentContainer}>
          <Text style={styles.studentTitle}>Student Details</Text>
          <Text>Name: {studentData.name}</Text>
          <Text>Roll Number: {studentData.roll}</Text>
          <Text>Grade: {studentData.grade_name}</Text>
          <Text>Section: {studentData.section_name}</Text>
          <Text>Blood Group: {studentData.blood_grp}</Text>
          <Text>EMIS Number: {studentData.emis_no}</Text>
          <Text>Aadhar Number: {studentData.aadhar_no}</Text>
          <Text>Father Name: {studentData.father_name}</Text>
          <Text>Mother Name: {studentData.father_name}</Text>
          <Text>Father Phone: {studentData.father_mob}</Text>
          <Text>Mother Phone: {studentData.mother_mob}</Text>
          <Text>Address: {studentData.address}</Text>
          <Text>PIN code: {studentData.pincode}</Text>
        </View>
      ) : (
        <Text style={styles.errorText}>No student data available</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#F9FAFB' },
  studentContainer: { padding: 15, backgroundColor: '#E5E7EB', borderRadius: 5 },
  studentTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center' },
});

export default Parent;
