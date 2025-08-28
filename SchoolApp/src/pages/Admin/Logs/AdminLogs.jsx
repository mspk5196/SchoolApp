import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, Alert, Linking, ActivityIndicator } from 'react-native';
import styles from './LogsStyles';
import Clock from '../../../assets/AdminPage/Logs/clock2.svg';
import BackIcon from '../../../assets/AdminPage/Logs/Back.svg';
import Bell from '../../../assets/AdminPage/Logs/bell.svg';
import Call from '../../../assets/AdminPage/Logs/callicon.svg';
import Message from '../../../assets/AdminPage/Logs/msgicon.svg';
import Home from '../../../assets/AdminPage/Logs/home.svg';
import { API_URL } from '../../../utils/env.js';
import Nodata from '../../../components/General/Nodata';
const Staff = require('../../../assets/AdminPage/Logs/staff.png');

const AdminLogs = ({ route, navigation }) => {
  const { adminData } = route.params;
  const [venues, setVenues] = useState([]);
  const [classes, setClasses] = useState([]);
  const [assessmentRequests, setAssessmentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [venuesRes, classesRes, assessmentsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/getRequestedVenues`),
        fetch(`${API_URL}/api/admin/getUnstartedClassesAdmin`),
        fetch(`${API_URL}/api/admin/getAssessmentRequestsAdmin`)
      ]);

      const venuesData = await venuesRes.json();
      const classesData = await classesRes.json();
      const assessmentsData = await assessmentsRes.json();

      setVenues(venuesData.venues || []);
      setClasses(classesData.classes || []);
      setAssessmentRequests(assessmentsData.requestedAssessments || []);

    } catch (e) {
      Alert.alert('Error', 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  const handleVenueAction = async (venueId, action) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/updateVenueStatus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venueId, action })
      });

      const data = await res.json();
      if (data.success) {
        fetchLogs(); // Refresh the data
      } else {
        Alert.alert('Error', 'Failed to update venue');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to update venue');
    }
  };

  const handleProcessAssessment = async (requestId, action) => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/processAssessmentRequest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action })
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', data.message);
        fetchLogs(); // Refresh data
      } else {
        Alert.alert('Error', data.message || 'Failed to process request');
      }
    } catch (error) {
      console.error('Error processing assessment:', error);
      Alert.alert('Error', 'Failed to process assessment request');
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour}:${minutes} ${ampm}`;
  };

  const handleCallPress = (phone) => {
    // Open phone dialer with the contact's phone number
    Linking.openURL(`tel:${phone}`);
  };

  const getProfileImageSource = (profilePath) => {
    if (profilePath) {
      // 1. Replace backslashes with forward slashes
      const normalizedPath = profilePath.replace(/\\/g, '/');
      // 2. Construct the full URL
      const fullImageUrl = `${API_URL}/${normalizedPath}`;
      return { uri: fullImageUrl };
    } else {
      return Staff;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <BackIcon width={20} height={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Logs</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='blue' />
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* New Venues Section */}
          {/* {venues.length > 0 && (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>New Venue Requests</Text>
            </View>
          )} */}
          {venues.map((venue) => (
            <View style={styles.labCard} key={venue.id}>
              <View style={styles.userInfoContainer}>
                <View style={styles.avatarContainer}>
                  <Image source={getProfileImageSource(venue.file_path)} style={styles.avatar} />
                  <View>
                    <Text style={styles.teacherName}>{venue.created_by_name || 'Venue'}</Text>
                    <Text style={styles.idText}>{venue.roll}</Text>
                  </View>
                </View>
                <Text style={styles.dateText}>
                  {venue.created_at ? new Date(venue.created_at).toLocaleDateString() : ''}
                </Text>
              </View>
              <View style={styles.labDetails}>
                <Text style={styles.detailText}>{venue.name || ''}</Text>
                <Text style={styles.detailText}>Block {venue.block || ''}</Text>
                <Text style={styles.detailText}>Capacity: {venue.capacity || ''}</Text>
                <Text style={styles.greenText}>New Venue Request</Text>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => handleVenueAction(venue.id, 'reject')}
                >
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={() => handleVenueAction(venue.id, 'approve')}
                >
                  <Text style={styles.approveButtonText}>Approve</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Classes Not Started Section */}
          {/* {classes.length > 0 && (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Classes Not Started</Text>
            </View>
          )} */}
          {classes.map((cls) => (
            <View style={styles.classCard} key={cls.id}>
              <View style={styles.classCardHeader}>
                <View>
                  <Text style={styles.classCardTitle}>{cls.mentor_name}</Text>
                  <Text style={styles.classCardSubtitle}>
                    {cls.grade_name} - {cls.section_name} - {cls.subject_name}
                  </Text>
                  <Text style={styles.notStartedText}>Class not started!</Text>
                </View>
                <View>
                  <View style={styles.bellTimeContainer}>
                    <Bell width={16} height={16} />
                    <Text style={styles.timeText}>
                      {formatTime(cls.start_time)} - {formatTime(cls.end_time)}
                    </Text>
                  </View>
                  <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity style={styles.callButton} onPress={() => handleCallPress(cls.mentor_phone)}>
                      <Call width={16} height={16} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.messageButton}>
                      <Message width={16} height={16} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}

          {/* Assessment Requests Section */}
          {/* {assessmentRequests.length > 0 && (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Assessment Requests</Text>
            </View>
          )} */}
          {assessmentRequests.map((req) => (
            <View style={styles.assessmentCard} key={req.id}>
              <View style={styles.assessmentHeader}>
                <View style={styles.avatarContainer}>
                  <Image source={getProfileImageSource(req.file_path)} style={styles.avatar} />
                  <View>
                    <Text style={styles.teacherName}>{req.mentor_name}</Text>
                    <Text style={styles.idText}>{req.mentor_roll}</Text>
                  </View>
                </View>
                <Text style={styles.requestedText}>Requested</Text>
              </View>
              <View style={styles.assesscontainer}>
                <View style={styles.gradeInfo}>
                  <Text style={styles.detailText}>
                    {req.grade_name} - {req.section_name}
                  </Text>
                  <Text style={styles.detailText}>{req.subject_name}</Text>
                </View>
                <View style={styles.classTimeRow}>
                  <View style={styles.timeWithIconAssessment}>
                    <Clock width={16} height={16} style={{ right: 6 }} />
                    <Text style={styles.timeText}>
                      {formatTime(req.start_time)} - {formatTime(req.end_time)}
                    </Text>
                  </View>
                  <Text style={styles.studentsText}>{req.student_count} Students</Text>
                </View>
              </View>
              <View style={styles.levelContainer}>
                {req.levels && req.levels.split(',').map((level, i) => (
                  <TouchableOpacity style={styles.levelButton} key={i}>
                    <Text style={styles.levelButtonText}>Level {level}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.assessmentRequestText}>Assessment request</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => handleProcessAssessment(req.id, 'cancel')}
                >
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={() => handleProcessAssessment(req.id, 'confirm')}
                >
                  <Text style={styles.approveButtonText}>Approve</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {venues.length === 0 && classes.length === 0 && assessmentRequests.length === 0 && (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 200}}> 
              <Nodata />
            </View>
          )}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.homeButton}>
        <Home width={24} height={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default AdminLogs;