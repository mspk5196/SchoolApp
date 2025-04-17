import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import BackIcon from '../../assets/Logs/Back.svg';
import Phone from '../../assets/Logs/Phone.svg';
import MessageSquare from '../../assets/Logs/MessageSquare.svg';
import Clock from '../../assets/Logs/Clock.svg';
import styles from './LogsStyle';

const Logs = ({ navigation }) => {
  return (
    <View style={styles.container}>
       <View style={styles.header}>
        <BackIcon 
          width={styles.BackIcon.width} 
          height={styles.BackIcon.height} 
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTxt}>Alerts</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Class not started alert */}
        <View style={styles.alertCard}>
          <View style={styles.alertCardContent}>
            <View>
              <Text style={styles.teacherName}>Mr.Prakash Raj</Text>
              <Text style={styles.subjectText}>Grade 6 - Maths</Text>
              <Text style={styles.warningText}>Class not started !</Text>
            </View>
            <View style={styles.alertActions}>
              <View style={styles.timeDisplay}>
                <Clock width={16} height={16} style={styles.timeIcon} /> 
                <Text style={styles.timeText}>9:16 AM</Text>
              </View>
              <View style={styles.actionButtons1}>
                <TouchableOpacity style={styles.actionButtonCall}>
                  <Phone width={20} height={20} /> 
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButtonMsg}>
                <MessageSquare width={20} height={20} /> 
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Student/Mentor Card */}
        <View style={styles.studentCard}>
          <View style={styles.studentCardContent}>
            <View style={styles.studentInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>👤</Text>
              </View>
              <View>
                <Text style={styles.studentLabel}>Student</Text>
                <Text style={styles.studentId}>2024VI023</Text>
                <Text style={styles.assessmentText}>Level 2 Assessment</Text>
              </View>
            </View>
            <View style={styles.subjectInfo}>
              <Text style={styles.subjectName}>Science</Text>
              <Text style={styles.daysRemaining}>12 days</Text>
            </View>
          </View>
          <View style={styles.mentorSection}>
            <View style={styles.mentorDetails}>
            <Text style={styles.mentorLabel}>Mentor</Text>
            <Text style={styles.mentorId}>2024VI023</Text>
            </View>
          <View style={styles.actionButtons2}>
                <TouchableOpacity style={styles.actionButtonCall}>
                  <Phone width={20} height={20} /> 
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButtonMsg}>
                <MessageSquare width={20} height={20} /> 
                </TouchableOpacity>
              </View>
              </View>
          <TouchableOpacity style={styles.assignTaskButton}>
            <Text style={styles.buttonText}>Assign task</Text>
          </TouchableOpacity>
        </View>

        {/* Assessment Request Card */}
        <View style={styles.requestCard}>
          <View style={styles.requestHeader}>
            <View style={styles.teacherInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>👤</Text>
              </View>
              <View>
                <Text style={styles.teacherName}>Prakash Raj</Text>
                <Text style={styles.teacherId}>2024VI023</Text>
              </View>
            </View>
            <View style={styles.requestBadge}>
              <Text style={styles.requestBadgeText}>Requested</Text>
            </View>
          </View>
          <View style={styles.classDetails}>
            <Text style={styles.className}>Grade 6 - A</Text>
            <Text style={styles.classSubject}>Mathematics</Text>
            <View style={styles.timeAndStudents}>
              <View style={styles.sessionTime}>
                <Clock width={16} height={16} style={styles.timeIconSmall} /> 
                <Text style={styles.sessionTimeText}>9:00 AM - 12:00 PM</Text>
              </View>
              <Text style={styles.studentCount}>6 Students</Text>
            </View>
          </View>
          <View style={styles.levelTags}>
            <View style={styles.levelTag}>
              <Text style={styles.levelTagText}>Level 1</Text>
            </View>
            <View style={styles.levelTag}>
              <Text style={styles.levelTagText}>Level 2</Text>
            </View>
          </View>
          <Text style={styles.assessmentRequestText}>Assessment request</Text>
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Past Assessment Card */}
        <View style={styles.pastCard}>
          <View style={styles.pastCardHeader}>
            <Text style={styles.teacherName}>Prakash Raj</Text>
            <Text style={styles.dateText}>20/10/2024</Text>
          </View>
          <View style={styles.pastCardContent}>
            <Text style={styles.subjectLevel}>Science - Level 1</Text>
            <Text style={styles.gradeText}>Grade 1</Text>
          </View>
          <View style={styles.issueContent}>
            <Text style={styles.issueText}>HomeWork Not Evaluated</Text>
          </View>
        <TouchableOpacity style={styles.issueTaskButton}>
            <Text style={styles.buttonText}>Create Issue</Text>
          </TouchableOpacity>
          </View>
      </ScrollView>
    </View>
  );
};

export default Logs;