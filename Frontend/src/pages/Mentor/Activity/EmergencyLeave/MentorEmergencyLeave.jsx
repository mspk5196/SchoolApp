import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Modal, TouchableWithoutFeedback, Image } from 'react-native';
import styles from './EmergencyLeavesty';
import Back from '../../../../assets/MentorPage/backarrow.svg';
import SearchIcon from '../../../../assets/MentorPage/search.svg';
import History from '../../../../assets/MentorPage/history3.svg';
import { API_URL } from '../../../../utils/env.js'

const MentorEmergencyLeave = ({ navigation, route }) => {
  const { mentorData } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [description, setDescription] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch students under this mentor
  useEffect(() => {
    fetch(`${API_URL}/api/mentor/getMentorStudentsForLeave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mentorId: mentorData[0].id }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setStudents(data.students);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching students:', error);
        setLoading(false);
      });
  }, []);

  const handleApplyPress = (student) => {
    setSelectedStudent(student);
    setShowPopup(true);
  };

  const handleCancel = () => {
    setShowPopup(false);
    setSelectedStudent(null);
    setDescription('');
  };

  const handleConfirm = () => {
    if (!description) {
      alert('Please enter a description');
      return;
    }

    fetch(`${API_URL}/api/mentor/createEmergencyLeave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mentor_id: mentorData[0].id,
        student_id: selectedStudent.id,
        student_roll: selectedStudent.roll,
        description: description
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert(`Emergency leave applied successfully for ${selectedStudent.name}`);
          navigation.navigate("MentorEmergencyLeaveHistory", { mentorData });
        } else {
          alert(data.error || 'Failed to apply emergency leave');
        }
        handleCancel();
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Failed to submit emergency leave');
        handleCancel();
      });
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
    <View style={styles.container}>
      <View style={styles.activityHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Back height={30} width={30} style={styles.homeIcon} />
        </TouchableOpacity>
        <Text style={styles.activityText}>Emergency Leave</Text>
      </View>

      <View style={styles.underline} />

      <View style={styles.searchView}>
        <View style={styles.searchBar}>
          <SearchIcon width={20} height={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#767676"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View>
          <TouchableOpacity
            onPress={() => navigation.navigate("MentorEmergencyLeaveHistory", { mentorData })}
          >
            <History style={styles.historyIcon} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading students...</Text>
        </View>
      ) : (
        <FlatList
          data={students.filter(student =>
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.roll.toLowerCase().includes(searchQuery.toLowerCase())
          )}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.leftSection}>
                {item.profile_photo ? (
                  <Image source={getProfileImageSource(item.profile_photo)} style={styles.profilePic} />
                ) : (
                  <View style={styles.profilePic} />
                )}
                <View>
                  <TouchableOpacity>
                    <Text style={styles.name}>{item.name}</Text>
                  </TouchableOpacity>
                  <Text style={styles.studentId}>{item.roll}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => handleApplyPress(item)}
              >
                <Text style={styles.applyText}>Apply</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Popup Overlay Modal */}
      <Modal
        transparent={true}
        visible={showPopup}
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <TouchableWithoutFeedback onPress={handleCancel}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.popupContainer}>
                <Text style={styles.popupTitle}>Emergency Leave for {selectedStudent?.name}</Text>

                <Text style={styles.descriptionLabel}>Reason for Leave</Text>
                <TextInput
                  style={styles.descriptionInput}
                  placeholder="Enter reason..."
                  placeholderTextColor="#767676"
                  multiline
                  value={description}
                  onChangeText={setDescription}
                />

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancel}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleConfirm}
                  >
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default MentorEmergencyLeave;