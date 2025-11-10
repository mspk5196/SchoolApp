import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Header } from '../../../../../components';
import ApiService from '../../../../../utils/ApiService';
import styles from './sectionStuSty';

const staff = require('../../../../../assets/General/staff.png');
const API_URL = 'http://10.150.255.254:6000';

const CoordinatorSectionStudents = ({ navigation, route }) => {
  const { section, grade } = route.params || {};
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (section) {
      fetchStudents();
    }
  }, [section]);

  const fetchStudents = async () => {
    if (!section?.section_id) return;

    setLoading(true);
    try {
      const response = await ApiService.makeRequest('/coordinator/getStudentsBySection', {
        method: 'POST',
        body: JSON.stringify({ sectionId: section.section_id }),
      });

      const data = await response.json();

      if (data.success) {
        setStudents(data.data);
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      Alert.alert('Error', 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const getProfileImageSource = (photoUrl) => {
    if (photoUrl) {
      const normalizedPath = photoUrl.replace(/\\/g, '/');
      const uri = `${API_URL}/${normalizedPath}`;
      return { uri };
    }
    return staff;
  };

  const renderStudentCard = ({ item }) => (
    <TouchableOpacity style={styles.studentCard} activeOpacity={0.7}>
      <Image 
        source={getProfileImageSource(item.photo_url)} 
        style={styles.studentAvatar} 
      />
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.name}</Text>
        <Text style={styles.studentRoll}>Roll: {item.roll}</Text>
        <View style={styles.studentContactRow}>
          <Icon name="email" size={14} color="#64748B" />
          <Text style={styles.studentContact}>{item.email}</Text>
        </View>
        <View style={styles.studentContactRow}>
          <Icon name="phone" size={14} color="#64748B" />
          <Text style={styles.studentContact}>{item.mobile}</Text>
        </View>
      </View>
      <Icon name="chevron-right" size={24} color="#94A3B8" />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="account-off" size={80} color="#CBD5E1" />
      <Text style={styles.emptyStateTitle}>No Students Found</Text>
      <Text style={styles.emptyStateText}>
        No students are enrolled in this section yet
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title={`${grade?.grade_name} - ${section?.section_name}`}
        navigation={navigation}
        showBackButton={true}
        backgroundColor="#FFFFFF"
      />

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Icon name="google-classroom" size={24} color="#3B82F6" />
            <Text style={styles.infoLabel}>Section</Text>
            <Text style={styles.infoValue}>{section?.section_name}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Icon name="account-multiple" size={24} color="#10B981" />
            <Text style={styles.infoLabel}>Students</Text>
            <Text style={styles.infoValue}>{students.length}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Icon name="account-tie" size={24} color="#F59E0B" />
            <Text style={styles.infoLabel}>Mentor</Text>
            <Text style={styles.infoValueSmall}>{section?.mentor_name || 'N/A'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading students...</Text>
          </View>
        ) : (
          <FlatList
            data={students}
            renderItem={renderStudentCard}
            keyExtractor={(item) => item.student_id.toString()}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmptyState}
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await fetchStudents();
              setRefreshing(false);
            }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

export default CoordinatorSectionStudents;
