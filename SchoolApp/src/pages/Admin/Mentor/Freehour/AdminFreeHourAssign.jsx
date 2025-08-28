import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import BackIcon from '../../../../assets/AdminPage/SubjectMentor/leftarrow.svg';
import styles from './FreeHourAssignStyle';
import staff from '../../../../assets/AdminPage/SubjectMentor/staff.png';
import HomeIcon from '../../../../assets/AdminPage/FreeHour/home.svg';
import { API_URL } from '../../../../utils/env.js';

const AdminFreeHourAssign = ({ navigation, route }) => {
  const { faculty } = route.params;
  const [description, setDescription] = useState('');
  const [activity, setActivity] = useState('');
  const [activities, setActivities] = useState([]);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch activities on component mount
  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/getActivity`);
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  // Only minor updates needed to match the backend:

  const handleConfirm = async () => {
    if (!activity) {
      setError('Please select an activity');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/admin/assignFreeHour`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ds_id: faculty.ds_id,
          mentorId: faculty.mentorId,
          description,
          activity,
          startTime: faculty.rawStartTime,
          endTime: faculty.rawEndTime,
          date: new Date().toISOString().split('T')[0] // Today's date
        })
      });

      if (response.ok) {
        navigation.goBack();
      } else {
        setError('Failed to assign task');
      }
    } catch (error) {
      console.error('Error assigning task:', error);
      setError('An error occurred while assigning the task');
    }
  };
  const [displayActivity, setDisplayActivity] = useState('');
  const selectActivity = (selectedActivity) => {
    setActivity(selectedActivity.id);
    setDisplayActivity(selectedActivity.activity_type);
    setShowActivityModal(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  const getProfileImageSource = (profilePath) => {
    if (profilePath) {
      // 1. Replace backslashes with forward slashes
      const normalizedPath = profilePath.replace(/\\/g, '/');
      // 2. Construct the full URL
      const fullImageUrl = `${API_URL}/${normalizedPath}`;
      return { uri: fullImageUrl };
    } else {
      return staff;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackIcon
          width={styles.BackIcon.width}
          height={styles.BackIcon.height}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTxt}>Free hour</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.blueBorder} />
          {faculty.file_path ? (
            <Image source={getProfileImageSource(faculty.file_path)} style={styles.avatar} />
          ) : (
            <Image source={staff} style={styles.avatar} />
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{faculty.name}</Text>
            <Text style={styles.facultyId}>Faculty ID: {faculty.facultyId}</Text>
            <Text style={styles.timeSlot}>{faculty.timeSlot}</Text>
          </View>
        </View>

        <View style={styles.formSection}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.sectionLabel}>Description <Text style={styles.optionalText}>(optional)</Text></Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Enter description"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={styles.sectionLabel}>Activity</Text>
          <TouchableOpacity
            style={styles.activitySelector}
            onPress={() => setShowActivityModal(true)}
          >
            <Text style={activity ? styles.activityText : styles.placeholderText}>
              {displayActivity || "Select Activity"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.sectionLabel}>Time</Text>
          <View style={styles.timeContainer}>
            <View style={styles.timeField}>
              <Text style={styles.timeLabel}>From :</Text>
              <Text style={styles.timeText}>{faculty.timeSlot.split(' - ')[0]}</Text>
            </View>
            <View style={styles.timeField}>
              <Text style={styles.timeLabel}>To :</Text>
              <Text style={styles.timeText}>{faculty.timeSlot.split(' - ')[1]}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate('AdminPage')}
        >
          <HomeIcon width={22} height={22} />
        </TouchableOpacity>
      </View>

      {/* Activity Selection Modal */}
      <Modal
        transparent={true}
        visible={showActivityModal}
        animationType="fade"
        onRequestClose={() => setShowActivityModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowActivityModal(false)}
        >
          <View style={styles.activityModalContainer}>
            {activities.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.activityModalItem}
                onPress={() => selectActivity(item)}
              >
                <Text style={styles.activityModalText}>{item.activity_type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default AdminFreeHourAssign;