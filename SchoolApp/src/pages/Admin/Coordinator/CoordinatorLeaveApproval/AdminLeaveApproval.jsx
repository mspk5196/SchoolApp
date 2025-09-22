import { apiFetch } from "../../../../utils/apiClient.js";
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  Image,
} from 'react-native';
import styles from './LeaveApprovalsty';
import Back from '../../../../assets/AdminPage/LeaveApproval/Back.svg';
import SearchIcon from '../../../../assets/AdminPage/LeaveApproval/search.svg';
import History2 from '../../../../assets/AdminPage/LeaveApproval/history.svg';
import LeaveType from '../../../../assets/AdminPage/LeaveApproval/leavetype.svg';
import Date from '../../../../assets/AdminPage/LeaveApproval/date.svg';
import DateIcon from '../../../../assets/AdminPage/LeaveApproval/date.svg';
import Pending from '../../../../assets/AdminPage/LeaveApproval/pending.svg';
const Staff = require('../../../../assets/AdminPage/Basicimg/staff.png');
import { API_URL } from '../../../../utils/env.js';
import Nodata from '../../../../components/General/Nodata';

const AdminLeaveApproval = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [leaveData, setLeaveData] = useState([]);

  useEffect(() => {
    fetchPendingLeaveRequests();
  }, []);

  const fetchPendingLeaveRequests = () => {
    apiFetch(`/admin/getPendingLeaveRequests`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
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

  const handleApprove = (requestId, phone, noOfDays) => {
    console.log(requestId, phone, noOfDays);
    
    apiFetch(`/admin/updateLeaveRequestStatus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requestId,
        phone: phone,
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

    apiFetch(`/admin/updateLeaveRequestStatus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requestId: selectedItem.id,
        phone: selectedItem.phone,
        noOfDays: selectedItem.total_leave_days,
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
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.roll.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (sqlDate) => {
    if (!sqlDate || typeof sqlDate !== 'string') return 'Invalid date';
    const dateOnly = sqlDate.split('T')[0]; // gets '2025-05-21'
    const [year, month, day] = dateOnly.split('-');
    return `${day}/${month}/${year}`; // returns '21/05/2025'
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
        <TouchableOpacity onPress={() => navigation.navigate('AdminLeaveApprovalHistory')}>
          <History2 style={styles.historyIcon} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={() => (
          <Nodata />
        )}
        renderItem={({ item }) => (

          item.length === 0 ? (
            <Nodata />
          ) : (
            <View style={styles.inboxItem}>
              <View style={styles.topInfoBox}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.profileCircle}>
                    <Image source={getProfileImageSource(item.file_path)} style={styles.profileCircle} />
                  </View>
                </View>
                <View style={styles.namePhoneContainer}>
                  <Text style={styles.inboxText}>{item.name}</Text>
                  <Text style={styles.inboxMsg}>{item.roll}</Text>
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
                <Text style={styles.reasonText}>{item.description}</Text>
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
                  onPress={() => handleApprove(item.id, item.phone, item.total_leave_days)}>
                  <Text style={styles.acceptText}>Accept</Text>
                </TouchableOpacity>
              </View>
            </View>
          )

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

export default AdminLeaveApproval;
