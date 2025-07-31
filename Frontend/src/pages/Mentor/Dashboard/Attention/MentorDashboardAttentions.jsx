import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import Arrow from '../../../../assets/MentorPage/arrow.svg';
import styles from './Attentionssty';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Profile from '../../../../assets/MentorPage/User.svg';
import { cleanImageUrl } from '../../../../utils/cleanImageUrl';
import { API_URL } from '../../../../utils/env.js';

const MentorDashboardAttentions = ({ navigation, route }) => {
  const { mentorData } = route.params;
  const [accepted, setAccepted] = useState(false);
  const [hideCard, setHideCard] = useState(false);
  const [overdueStudents, setOverdueStudents] = useState([]);
  const [coordinatorTasks, setCoordinatorTasks] = useState([]);

  const today = new Date();
  const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(
    today.getMonth() + 1
  )
    .toString()
    .padStart(2, '0')}/${today.getFullYear().toString().slice(-2)}`;

  useEffect(() => {
    fetchOverdueStudents();
    fetchCoordinatorTasks();
    fetch(`${API_URL}/api/mentor/checkOverdueLevels`, { method: 'POST' });
  }, []);

  const fetchOverdueStudents = async () => {
    try {
      const response = await fetch(`${API_URL}/api/mentor/getOverdueStudents?mentorId=${mentorData[0].id}`);
      const data = await response.json();
      if (data.success) {
        setOverdueStudents(data.overdueStudents);
        // console.log('Overdue Students:', data.overdueStudents);
      }
    } catch (error) {
      console.error('Error fetching overdue students:', error);
    }
  };

  const fetchCoordinatorTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/mentor/getCoordinatorTasks?mentorId=${mentorData[0].id}`);
      const data = await response.json();
      if (data.success) {
        setCoordinatorTasks(data.tasks);
        console.log('Coordinator Tasks:', data.tasks);

      }
    } catch (error) {
      console.error('Error fetching coordinator tasks:', error);
    }
  };

  const handleAcceptTask = async (taskId) => {
    try {
      const response = await fetch(`${API_URL}/api/mentor/accept-task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          acceptedDate: formattedDate
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAccepted(true);
        fetchCoordinatorTasks(); // Refresh the task list
      }
    } catch (error) {
      console.error('Error accepting task:', error);
    }
  };

  const getProfileImageSource = (profilePath) => {
    if (profilePath) {
      // Clean the URL to fix any malformed issues
      const cleanPath = cleanImageUrl(profilePath);
      
      // Check if it's already a full URL (Cloudinary URL)
      if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
        return { uri: cleanPath };
      }
      // For local paths, normalize and construct URL with API_URL
      const normalizedPath = cleanPath.replace(/\\/g, '/');
      const fullImageUrl = `${API_URL}/${normalizedPath}`;
      return { uri: fullImageUrl };
    } else {
      return Profile;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Arrow width={wp('9%')} height={wp('9%')} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Attentions</Text>
      </View>
      <View style={styles.headerBorder} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.cardSection}>
          {/* Display overdue students (<10 days) */}
          {overdueStudents.length > 0 ? (
            overdueStudents.map((student, index) => (
              <View key={index} style={[styles.card, styles.cardPeach]}>
                {/* <Image source={Profile} style={styles.avatar} /> */}
                {student.profile_photo ? (
                  <Image source={getProfileImageSource(student.profile_photo)} style={styles.avatar} />
                ) : (
                  <Image source={Profile} style={styles.avatar} />
                )}
                <View style={styles.cardContent}>
                  <Text style={styles.name}>{student.student_name}</Text>
                  <Text style={styles.id}>{student.student_roll}</Text>
                  <Text style={styles.assessment}>Level {student.level} Assessment</Text>
                </View>
                <View style={styles.subjectBox}>
                  <Text style={styles.subject}>{student.subject_name}</Text>
                  <Text style={styles.daysOrange}>{student.days_overdue} days</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.subHeading}>No Backlogs for your subject students</Text>
          )}


          {/* Display coordinator tasks (≥10 days overdue) */}
          {coordinatorTasks.length > 0 && !hideCard ? (
            <Text style={styles.subHeading}>Tasks from coordinator</Text>
          ) : (
            <Text style={styles.subHeading}>No tasks from coordinator</Text>
          )}

          {coordinatorTasks.map((task, index) => (
            <View key={index} style={[styles.card, styles.cardPink]}>
              {task.profile_photo ? (
                <Image source={getProfileImageSource(task.profile_photo)} style={styles.avatar} />
              ) : (
                <Image source={Profile} style={styles.avatar} />
              )}
              <View style={styles.cardContent}>
                <Text style={styles.name}>{task.student_name}</Text>
                <Text style={styles.id}>{task.student_roll}</Text>
                <Text style={styles.assessment}>Level {task.level} Assessment</Text>
              </View>
              <View style={styles.subjectBox}>
                <Text style={styles.subject}>{task.subject_name}</Text>
                <Text style={styles.daysRed}>{task.days_overdue} days</Text>
              </View>

              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleAcceptTask(task.id)}>
                <Text style={styles.acceptText}>
                  {task.status === 'Accepted' ? 'Completed' : 'Accept task'}
                </Text>
              </TouchableOpacity>

              {task.status === 'Accepted' && (
                <Text style={styles.acceptedDateText}>
                  Task Accepted on {task.accepted_on}
                </Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default MentorDashboardAttentions;