import { apiFetch } from "../../../utils/apiClient.js";
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, Alert, Image } from "react-native";
import styles from "./LeaveApprovalsty";
import Back from "../../../assets/MentorPage/entypo_home.svg";
import SearchIcon from "../../../assets/MentorPage/search.svg";
import History2 from '../../../assets/MentorPage/history3.svg';
import LeaveType from '../../../assets/MentorPage/leavetype.svg';
import DateIcon from '../../../assets/MentorPage/date.svg';
const Staff = require('../../../assets/CoordinatorPage/StudentProfile/staff.png');
import Pending from '../../../assets/MentorPage/pendingstatus.svg';
import { API_URL } from '../../../utils/env.js'
import Nodata from "../../../components/General/Nodata";

const MentorLeaveApproval = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [leaveData, setLeaveData] = useState([]);
  const { mentorData } = route.params;
  const mentor = mentorData[0];
  useEffect(() => {
    fetchPendingLeaveRequests();
  }, []);

  const fetchPendingLeaveRequests = () => {
    apiFetch(`/mentor/getPendingLeaveRequests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sectionId: mentor.section_id }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log(data.leaveRequests);

          setLeaveData(data.leaveRequests);
        } else {
          Alert.alert('Error', 'Failed to fetch leave requests');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        Alert.alert('Error', 'An error occurred while fetching leave requests');
      });
  };

  const handleApprove = (requestId, roll, noOfDays) => {
    apiFetch(`/mentor/updateLeaveRequestStatus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requestId,
        student_roll: roll,
        noOfDays: noOfDays,
        status: 'Approved'
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          fetchPendingLeaveRequests();
          Alert.alert('Success', 'Leave request approved successfully');
        } else {
          Alert.alert('Error', data.error || 'Failed to approve leave request');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        Alert.alert('Error', 'An error occurred while approving leave request');
      });
  };

  const handleReject = () => {
    if (!rejectionReason) {
      Alert.alert('Error', 'Please enter a reason for rejection');
      return;
    }

    apiFetch(`/mentor/updateLeaveRequestStatus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requestId: selectedItem.id,
        student_roll: selectedItem.student_roll,
        noOfDays: selectedItem.no_of_days,
        status: 'Rejected',
        rejectionReason
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setModalVisible(false);
          setRejectionReason("");
          fetchPendingLeaveRequests();
          Alert.alert('Success', 'Leave request rejected successfully');
        } else {
          Alert.alert('Error', data.error || 'Failed to reject leave request');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        Alert.alert('Error', 'An error occurred while rejecting leave request');
      });
  };

  const filteredData = leaveData.filter(item =>
    item.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.student_roll.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (sqlDate) => {
    console.log(sqlDate);

    const dateObj = new Date(sqlDate);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
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
        <Text style={styles.activityText}>Leave Approval</Text>
      </View>

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
        <TouchableOpacity onPress={() => navigation.navigate('MentorStudentLeaveApprovalHistory', { sectionId: mentor.section_id })}>
          <History2 style={styles.historyIcon} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <View style={{height:350}}>
            <Nodata/>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.inboxItem}>
            <View style={styles.topInfoBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.profileCircle}>
                  <Image source={getProfileImageSource(item.profile_photo)} style={styles.profileCircle} />
                </View>
              </View>
              <View style={styles.namePhoneContainer}>
                <Text style={styles.inboxText}>{item.student_name}</Text>
                <Text style={styles.inboxMsg}>{item.student_roll}</Text>
              </View>
              <Text style={styles.status}><Pending style={styles.statusicon} /> {item.status}</Text>
            </View>

            <View style={styles.infobox}>
              <Text style={styles.leaveType}><LeaveType /> {item.leave_type}</Text>
              <View style={styles.date}>
                <Text style={styles.dateRange}>
                  <DateIcon /> {formatDate(item.start_date)} - {formatDate(item.end_date)}
                </Text>
              </View>
            </View>

            <View style={styles.reasonBox}>
              <Text style={styles.reasonText}>{item.reason}</Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.rejectBtn}
                onPress={() => {
                  setSelectedItem(item);
                  setModalVisible(true);
                }}>
                <Text style={styles.rejectText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={() => handleApprove(item.id, item.student_roll, item.no_of_days)}>
                <Text style={styles.acceptText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Reason for rejection</Text>

            <View style={styles.reasonCard}>
              <Text style={styles.reasonText}>
                {selectedItem?.reason}
              </Text>
            </View>

            <TextInput
              style={styles.reasonInput}
              placeholder="Enter rejection reason"
              placeholderTextColor="#767676"
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setModalVisible(false);
                  setRejectionReason("");
                }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleReject}>
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MentorLeaveApproval;