import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { API_URL } from '@env';
import BackArrow from '../../../../assets/MentorPage/backarrow.svg';
import Home from '../../../../assets/MentorPage/Home2.svg';
const Staff = '../../../../assets/MentorPage/User.svg';

const MentorSurveyDetails = ({ navigation, route }) => {
  // Mock data for students
  const { mentorData, item } = route.params;
  const [students, setStudents] = useState([])

  useEffect(() => {
    // Fetch students for the survey
    fetchSurveyStudents();
  }, [item]);

  const fetchSurveyStudents = () => {
    // Fetch students for the survey
    fetch(`${API_URL}/api/mentor/survey/${item.id}/students`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }
        return response.json();
      })
      .then((data) => {
        setStudents(data);
        console.log('Fetched students:', data);
      })
      .catch((error) => {
        console.error('Error fetching students:', error);
      });
  }

  const getProfileImageSource = (profilePath) => {
    if (profilePath) {
      // 1. Replace backslashes with forward slashes
      const normalizedPath = profilePath.replace(/\\/g, '/');
      // 2. Construct the full URL
      const fullImageUrl = `${API_URL}/${normalizedPath}`;
      return { uri: fullImageUrl };
    } else {
      return Profile;
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <BackArrow width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Survey</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Survey Details Card */}
        <View style={styles.surveyCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.grade_name}</Text>
              {/* <View style={styles.studentsContainer}> */}
              <Text style={styles.studentsText}>{item.student_count} Students</Text>
              {/* </View> */}
            </View>

            <View style={styles.statusContainer}>
              <View style={styles.statusIndicator}>
                <View style={[styles.dot, item.status !== 'Active' && { backgroundColor: 'red' }]} />
                <Text style={[styles.statusText, item.status !== 'Active' && { color: 'red' }]}>{item.status}</Text>
              </View>
              <Text style={[
                styles.time,
                item.status === "Active" ? styles.activeTime : styles.inactiveTime
              ]}>
                {item.time}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {item.description}
            </Text>
          </View>
        </View>

        {/* Student List */}
        {students.map((student, index) => (
          <View key={index} style={styles.studentCard}>
            <View style={styles.studentInfo}>
              {student.profile_photo ? (
                <Image source={getProfileImageSource(student.profile_photo)} style={styles.avatar} />
              ) : (
                <Image source={Staff} style={styles.avatar} />
              )}
              <View style={styles.studentDetails}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentId}>{student.roll}</Text>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={[
          styles.endButton,
          item.status !== 'Active' && { backgroundColor: 'rgb(200, 200, 200)', shadowColor: 'rgb(200, 200, 200)', },
        ]} disabled={item.status !== 'Active'} onPress={() => navigation.navigate('EndSurvey', { item })}>
          <Text style={styles.endButtonText}>End Survey now</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('MentorMain', { mentorData })}>
          <Home width={43} height={34} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  surveyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 6,
  },
  studentsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentsText: {
    fontSize: 14,
    color: '#00C853',
    // marginLeft: 4,
    fontWeight: '500',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00C853',
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#757575',
  },
  timerText: {
    fontSize: 12,
    color: '#F44336',
  },
  activeTime: {
    fontSize: 14,
    color: "#EB4B42",
  },
  inactiveTime: {
    fontSize: 14,
    color: "#7991A4",
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  descriptionContainer: {
    paddingTop: 4,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 14,
    color: '#616161',
    lineHeight: 20,
  },
  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  studentDetails: {
    marginLeft: 12,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
  },
  studentId: {
    fontSize: 13,
    color: '#757575',
  },
  bottomSpace: {
    height: 80,
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  endButton: {
    flex: 1,
    backgroundColor: '#4A54F8',
    borderRadius: 8,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    height: 48,
    shadowColor: '#4A54F8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  endButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  homeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#AEBCFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MentorSurveyDetails;