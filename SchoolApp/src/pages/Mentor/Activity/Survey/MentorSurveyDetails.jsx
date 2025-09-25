import { apiFetch } from "../../../../utils/apiClient.js";
import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, StatusBar, Modal, ActivityIndicator,
} from 'react-native';
import { API_URL } from '../../../../utils/env.js';
import BackArrow from '../../../../assets/MentorPage/backarrow.svg';
import Home from '../../../../assets/MentorPage/Home2.svg';
import Profile from '../../../../assets/MentorPage/userlogo.svg';
import AsyncStorage from "@react-native-async-storage/async-storage";

const MentorSurveyDetails = ({ navigation, route }) => {
  const { mentorData, item } = route.params;
  const [students, setStudents] = useState([]);
  const [isResponseModalVisible, setResponseModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentResponses, setStudentResponses] = useState([]);
  const [loadingResponses, setLoadingResponses] = useState(false);

  useEffect(() => {
    fetchSurveyStudents();
  }, [item]);

  const fetchSurveyStudents = () => {
    apiFetch(`/mentor/survey/${item.id}/students`)
      .then((response) => response)
      .then((data) => setStudents(data))
      .catch((error) => console.error('Error fetching students:', error));
  };

  const handleStudentPress = (student) => {
    if (item.task_type === 'Feedback' && student.completed) {
      setSelectedStudent(student);
      setLoadingResponses(true);
      setResponseModalVisible(true);
      apiFetch(`/mentor/survey/response/${item.id}/${student.id}`)
        .then(res => res)
        .then(data => {
          if (data.success) {
            setStudentResponses(data.responses);
          } else {
            throw new Error(data.message || "Failed to fetch responses");
          }
        })
        .catch(err => {
          console.error(err);
          Alert.alert("Error", "Could not load student responses.");
          setResponseModalVisible(false);
        })
        .finally(() => setLoadingResponses(false));
    }
  };

 const authTokenRef = useRef(null);
  useEffect(() => {
    // Load token once (used for protected images if needed)
    AsyncStorage.getItem('token').then(t => { authTokenRef.current = t; });
  }, []);

  const getProfileImageSource = (profilePath) => {
    // console.log(authTokenRef.current);
    
    // console.log('Profile Path:', profilePath);
    if (profilePath) {
      // 1. Replace backslashes with forward slashes
      const normalizedPath = profilePath.replace(/\\/g, '/');
      // 2. Construct the full URL
      const uri = `${API_URL}/${normalizedPath}`;
      // return { uri: fullImageUrl };
      if (authTokenRef.current) {
        return { uri, headers: { Authorization: `Bearer ${authTokenRef.current}` } };
      }
      return { uri };
    } else {
      return Staff;
    }
  };

  const renderResponseModal = () => (
    <Modal
      transparent
      visible={isResponseModalVisible}
      animationType="slide"
      onRequestClose={() => setResponseModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Feedback from {selectedStudent?.name}</Text>
          {loadingResponses ? (
            <ActivityIndicator size="large" color="#4A54F8" style={{ marginVertical: 20 }} />
          ) : (
            <ScrollView>
              {studentResponses.map((response, index) => (
                <View key={index} style={styles.responseItem}>
                  <Text style={styles.responseQuestion}>{index + 1}. {response.question_text}</Text>
                  
                  {/* CORRECTED LOGIC: All answers now come from `text_answer` */}
                  <Text style={response.answer_type === 'Text' ? styles.responseTextAnswer : styles.responseOptionAnswer}>
                    {response.answer_type === 'Options' && <Text>Answer: </Text>}
                    <Text style={{ fontWeight: response.answer_type === 'Options' ? 'bold' : 'normal' }}>
                      {response.text_answer || 'No answer'}
                    </Text>
                  </Text>

                </View>
              ))}
            </ScrollView>
          )}
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setResponseModalVisible(false)}>
            <Text style={styles.modalCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const handleEndSurvey = () => {
    apiFetch(`/mentor/survey/end/${item.id}`, { method: 'PUT' })
      .then(res => res)
      .then(data => {
        if (data.message) {
          Alert.alert('Success', 'Survey has been ended.');
          navigation.goBack();
        } else {
          throw new Error(data.error || "Failed to end survey");
        }
      })
      .catch(err => Alert.alert('Error', err.message));
  }


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <BackArrow width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Survey Details</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.surveyCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.grade_name} • {item.section_name}</Text>
              <Text style={styles.studentsText}>{item.student_count} Students</Text>
            </View>
            <View style={styles.statusContainer}>
              <View style={styles.statusIndicator}>
                <View style={[styles.dot, item.status !== 'Active' && { backgroundColor: 'red' }]} />
                <Text style={[styles.statusText, item.status !== 'Active' && { color: 'red' }]}>{item.status}</Text>
              </View>
              <Text style={[styles.time, item.status === "Active" ? styles.activeTime : styles.inactiveTime]}>
                {item.time}
              </Text>
            </View>
          </View>
          {item.description && (
            <>
              <View style={styles.divider} />
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionTitle}>Description</Text>
                <Text style={styles.descriptionText}>{item.description}</Text>
              </View>
            </>
          )}
        </View>

        <Text style={styles.studentListHeader}>
          {item.task_type === 'Feedback' ? "Students (Tap completed to view responses)" : "Students"}
        </Text>
        {students.map((student, index) => (
          <TouchableOpacity
            key={index}
            style={styles.studentCard}
            onPress={() => handleStudentPress(student)}
            disabled={!(item.task_type === 'Feedback' && student.completed)}
          >
            <View style={styles.studentInfo}>
              <Image source={getProfileImageSource(student.profile_photo)} style={styles.avatar} />
              <View style={styles.studentDetails}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentId}>{student.roll}</Text>
              </View>
            </View>
            {item.task_type === 'Feedback' && (
              <View style={[styles.completionStatus, student.completed && styles.completedStatus]}>
                <Text style={[styles.completionText, student.completed && styles.completedText]}>
                  {student.completed ? 'Completed' : 'Pending'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {renderResponseModal()}

      <View style={styles.actionContainer}>
        <TouchableOpacity style={[styles.endButton, item.status !== 'Active' && { backgroundColor: 'rgb(200, 200, 200)', shadowColor: 'rgb(200, 200, 200)' }]} disabled={item.status !== 'Active'} onPress={handleEndSurvey}>
          <Text style={styles.endButtonText}>End Survey Now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('MentorMain', { mentorData })}>
          <Home width={43} height={34} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  backButton: { marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#212121' },
  scrollView: { flex: 1, padding: 16 },
  surveyCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardTitleContainer: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#212121', marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: '#616161', marginBottom: 6 },
  studentsText: { fontSize: 14, color: '#00C853', fontWeight: '500' },
  statusContainer: { alignItems: 'flex-end' },
  statusIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00C853', marginRight: 4 },
  statusText: { fontSize: 12, color: '#757575' },
  activeTime: { fontSize: 12, color: "#EB4B42" },
  inactiveTime: { fontSize: 12, color: "#7991A4" },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 12 },
  descriptionContainer: { paddingTop: 4 },
  descriptionTitle: { fontSize: 14, fontWeight: '600', color: '#212121', marginBottom: 6 },
  descriptionText: { fontSize: 14, color: '#616161', lineHeight: 20 },
  studentListHeader: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  studentCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  studentInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E0E0E0' },
  studentDetails: { marginLeft: 12 },
  studentName: { fontSize: 15, fontWeight: '600', color: '#212121' },
  studentId: { fontSize: 13, color: '#757575' },
  completionStatus: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12, backgroundColor: '#FFFBE6' },
  completedStatus: { backgroundColor: '#E8F5E9' },
  completionText: { color: '#FBC02D', fontSize: 12, fontWeight: '500' },
  completedText: { color: '#388E3C' },
  bottomSpace: { height: 80 },
  actionContainer: { flexDirection: 'row', padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E0E0E0', position: 'absolute', bottom: 0, left: 0, right: 0 },
  endButton: { flex: 1, backgroundColor: '#4A54F8', borderRadius: 8, paddingVertical: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12, height: 48, shadowColor: '#4A54F8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  endButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  homeButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#AEBCFF', alignItems: 'center', justifyContent: 'center' },
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', maxHeight: '70%', backgroundColor: 'white', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  responseItem: { marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 10 },
  responseQuestion: { fontSize: 15, fontWeight: '600', color: '#333' },
  responseTextAnswer: { fontSize: 14, color: '#555', marginTop: 5, fontStyle: 'italic', backgroundColor: '#f9f9f9', padding: 8, borderRadius: 4 },
  responseOptionAnswer: { fontSize: 14, color: '#555', marginTop: 5 },
  modalCloseButton: { backgroundColor: '#4A54F8', padding: 12, borderRadius: 8, marginTop: 15, alignItems: 'center' },
  modalCloseButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default MentorSurveyDetails;