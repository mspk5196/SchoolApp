import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  SafeAreaView,
  StatusBar
} from 'react-native';
import styles from './LogsStyles'; // Assuming you have a separate file for styles
import Clock from    '../../../assets/AdminPage//Logs/clock2.svg';
import BackIcon from '../../../assets/AdminPage//Logs/Back.svg';
import Bell from     '../../../assets/AdminPage//Logs/bell.svg';
import Call from     '../../../assets/AdminPage//Logs/callicon.svg';
import Message from  '../../../assets/AdminPage//Logs/msgicon.svg';
import Home from     '../../../assets/AdminPage//Logs/home.svg';

const AdminLogs = () => {
  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackIcon width={20} height={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Logs</Text>
      </View>

      {/* Log Items */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Games Card */}
        <View style={styles.gameCard}>
          <View style={styles.gameCardHeader}>
            <View>
              <Text style={styles.gameCardTitle}>Games</Text>
              <Text style={styles.gameCardSubtitle}>Grade 6</Text>
              <Text style={styles.gameCardSubtitle}>Section - A,B</Text>
            </View>
            <View style={styles.statusContainer}>
              <View style={styles.activeStatus}>
                <View style={styles.activeDot} />
                <Text style={styles.activeText}>Active</Text>
              </View>
              <Text style={styles.endsInText}>Ends in : 30min</Text>
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.rejectButton}>
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.approveButton}>
              <Text style={styles.approveButtonText}>Approve</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Class Not Started Card */}
        <View style={styles.classCard}>
          <View style={styles.classCardHeader}>
            <View>
              <Text style={styles.classCardTitle}>Mr.Prakash Raj</Text>
              <Text style={styles.classCardSubtitle}>Grade 6 - Maths</Text>
              <Text style={styles.notStartedText}>Class not started !</Text>
            </View>
            <View>
              <View style={styles.bellTimeContainer}>
                <Bell width={16} height={16} />
                <Text style={styles.timeText}>9:16 AM</Text>
              </View>
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity style={styles.callButton}>
                  <Call width={16} height={16} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.messageButton}>
                  <Message width={16} height={16} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Biology Lab Card */}
        <View style={styles.labCard}>
          <View style={styles.userInfoContainer}>
            <View style={styles.avatarContainer}>
              <Image 
                source={require('../../../assets/AdminPage/Logs/staff.png')} 
                style={styles.avatar} 
              />
              <View>
                <Text style={styles.teacherName}>John Philips</Text>
                <Text style={styles.idText}>22MAD10</Text>
              </View>
            </View>
            <Text style={styles.dateText}>22/12/24</Text>
          </View>
          <View style={styles.labDetails}>
            <Text style={styles.detailText}>Biology Lab-2(AS block)</Text>
            <Text style={styles.detailText}>Grade 11,12</Text>
            <Text style={styles.detailText}>30 Students</Text>
            <Text style={styles.greenText}>New Infrastructure Added</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.rejectButton}>
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.approveButton}>
              <Text style={styles.approveButtonText}>Approve</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Leave Application Card */}
        <View style={styles.leaveCard}>
          <View style={styles.leaveCardHeader}>
            <View style={styles.avatarContainer}>
              <Image 
                source={require('../../../assets/AdminPage/Logs/staff.png')} 
                style={styles.avatar} 
              />
              <View>
                <Text style={styles.teacherName}>Prakash Raj</Text>
                <Text style={styles.idText}>2024VI023</Text>
              </View>
            </View>
            <View style={styles.leaveTimeContainer}>
              <View style={styles.timeWithIcon}>
                <Clock width={16} height={16} style={{marginRight: 4}} />
                <Text style={{fontWeight: '600'}}>01:00 PM</Text>
              </View>
              <Text style={styles.leaveText}>Sick leave</Text>
            </View>
          </View>
          <Text style={styles.appliedByText}>Applied by Ram Kumar</Text>
          <Text style={styles.descriptionTitle}>Description</Text>
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>
              Due to high fever and cold, student is willing to go home.
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.callButton, {backgroundColor: '#E3F2FD', marginRight: 8}]}>
              <Call width={20} height={20} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.messageButton, {backgroundColor: '#E8F5E9', marginRight: 8}]}>
              <Message width={20} height={20} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, {backgroundColor: '#3557FF', flex: 1}]}>
              <Text style={[styles.actionButtonText, {color: '#FFFFFF'}]}>Approve</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Assessment Request Card */}
        <View style={styles.assessmentCard}>
          <View style={styles.assessmentHeader}>
            <View style={styles.avatarContainer}>
              <Image 
                source={require('../../../assets/AdminPage/Logs/staff.png')} 
                style={styles.avatar} 
              />
              <View>
                <Text style={styles.teacherName}>Prakash Raj</Text>
                <Text style={styles.idText}>2024VI023</Text>
              </View>
            </View>
            <Text style={styles.requestedText}>Requested</Text>
          </View>
          <View style={styles.assesscontainer}>
          <View style={styles.gradeInfo}>
            <Text style={styles.detailText}>Grade 6 - A</Text>
            <Text style={styles.detailText}>Mathematics</Text>
            </View>
            <View style={styles.classTimeRow}>
              <View style={styles.timeWithIconAssessment}>
                <Clock width={16} height={16} style={{marginRight: 4}} />
                <Text style={styles.timeText}>9:00 AM - 12:00 PM</Text>
              </View>
              <Text style={styles.studentsText}>6 Students</Text>
            </View>
          </View>
          
          <View style={styles.levelContainer}>
            <TouchableOpacity style={styles.levelButton}>
              <Text style={styles.levelButtonText}>Level 1</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.levelButton}>
              <Text style={styles.levelButtonText}>Level 2</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.assessmentRequestText}>Assessment request</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.rejectButton}>
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.approveButton}>
              <Text style={styles.approveButtonText}>Approve</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Academic Card */}
        <View style={styles.academicCard}>
          <View style={styles.academicHeader}>
            <View style={styles.avatarContainer}>
              <Image 
                source={require('../../../assets/AdminPage/Logs/staff.png')} 
                style={styles.avatar} 
              />
              <View>
                <Text style={styles.teacherName}>John Philips</Text>
                <Text style={styles.idText}>22MAD10</Text>
                <Text style={styles.subjectText}>Mathematics</Text>
                <View style={styles.gradeWithAcademic}>
                  <Text style={styles.detailText}>Grade VI-A</Text>
                  <View style={styles.dot}></View>
                  <Text style={styles.academicText}>Academic</Text>
                </View>
                <Text style={styles.incompleteText}>Self-Assessment incomplete</Text>
              </View>
            </View>
            <Text style={styles.dateText}>22/12/24</Text>
          </View>
        </View>
      </ScrollView>
      
      <TouchableOpacity style={styles.homeButton}>
        <Home width={24} height={24} color="#FFFFFF" />
      </TouchableOpacity>
      
    </SafeAreaView>
  );
};

export default AdminLogs;