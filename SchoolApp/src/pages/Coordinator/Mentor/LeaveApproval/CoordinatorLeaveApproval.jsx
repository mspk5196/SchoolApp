import { apiFetch } from "../../../../utils/apiClient.js";
import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import BackIcon from '../../../../assets/CoordinatorPage/LeaveApproval/leftarrow.svg';
import Checkmark from '../../../../assets/CoordinatorPage/LeaveApproval/checkmark.svg';
import Close from '../../../../assets/CoordinatorPage/LeaveApproval/close.svg';
import Staff from '../../../../assets/CoordinatorPage/LeaveApproval/staff.png';
import HistoryIcon from '../../../../assets/CoordinatorPage/LeaveApproval/history.svg';
import DateIcon from '../../../../assets/CoordinatorPage/LeaveApproval/date.svg';
import ReasonIcon from '../../../../assets/CoordinatorPage/LeaveApproval/reason.svg';
import styles from './LeaveApprovalStyles';
import { API_URL } from '../../../../utils/env.js';

const CoordinatorLeaveApproval = ({ navigation, route }) => {
  const { activeGrade } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [historyRecords, setHistoryRecords] = useState([]);

  // Modal states
  const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
  const [substitutesModalVisible, setSubstitutesModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  // Selected items
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [availableSubstitutes, setAvailableSubstitutes] = useState([]);
  const [selectedSubstitute, setSelectedSubstitute] = useState(null);

  // Fetch leave requests on mount
  useEffect(() => {
    fetchLeaveRequests();
  }, [activeGrade]);

  // Filter leave requests when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRequests(leaveRequests);
    } else {
      const filtered = leaveRequests.filter(request =>
        request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.mentorRoll.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRequests(filtered);
    }
  }, [searchQuery, leaveRequests]);

  function parseSQLDateToLocal(sqlDate) {
    // sqlDate: 'YYYY-MM-DD'
    const [year, month, day] = sqlDate.split('-');
    return new Date(year, month - 1, day); // JS months are 0-based
  }

  const fetchLeaveRequests = async () => {
    try {
      const response = await apiFetch(`/coordinator/getMentorLeaveRequests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gradeId: activeGrade })
      });
      const data = response
      setLeaveRequests(data.leaveRequests || []);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      Alert.alert('Error', 'Failed to fetch leave requests');
    }
  };

  const fetchMentorLeaveHistory = async (phone) => {
    try {
      const response = await apiFetch(`/coordinator/getMentorLeaveHistory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = response
      return data.history || [];
    } catch (error) {
      console.error('Error fetching mentor leave history:', error);
      return [];
    }
  };

  const fetchAllLeaveHistory = async () => {
    try {
      const response = await apiFetch(`/coordinator/getAllMentorLeaveHistory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gradeId: activeGrade })
      });
      const data = response
      setHistoryRecords(data.history || []);
    } catch (error) {
      console.error('Error fetching all leave history:', error);
      Alert.alert('Error', 'Failed to fetch leave history');
    }
  };

  const handleLeavePress = async (leave) => {
    const history = await fetchMentorLeaveHistory(leave.phone);
    navigation.navigate('CoordinatorLeaveDetails', {
      leave,
      history
    });
  };

  const handleApprove = async (leave) => {
    setSelectedLeave(leave);
    try {
      const response = await apiFetch(`/coordinator/getAvailableMentorsForDate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: leave.leaveDate,
          excludeMentorId: leave.mentor_id,
          gradeId: activeGrade
        })
      });
      const data = response
      setAvailableSubstitutes(data.mentors || []);
      setSubstitutesModalVisible(true);
    } catch (error) {
      console.error('Error fetching available mentors:', error);
      Alert.alert('Error', 'Failed to fetch available substitutes');
    }
  };

  const handleReject = (leave) => {
    setSelectedLeave(leave);
    setRejectionModalVisible(true);
  };

  const confirmRejection = async () => {
    if (!selectedLeave || !rejectionReason) return;

    try {
      await apiFetch(`/coordinator/rejectMentorLeave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaveId: selectedLeave.id,
          rejectionReason
        })
      });

      // Refresh leave requests
      fetchLeaveRequests();
      setRejectionModalVisible(false);
      setRejectionReason('');
      setSelectedLeave(null);
      Alert.alert('Success', 'Leave request rejected successfully');
    } catch (error) {
      console.error('Error rejecting leave:', error);
      Alert.alert('Error', 'Failed to reject leave request');
    }
  };

  const confirmSubstitute = async () => {
    if (!selectedLeave || !selectedSubstitute) return;

    try {
      await apiFetch(`/coordinator/approveMentorLeave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaveId: selectedLeave.id,
          substituteMentorId: selectedSubstitute.id
        })
      });

      // Refresh leave requests
      fetchLeaveRequests();
      setSubstitutesModalVisible(false);
      setSelectedLeave(null);
      setSelectedSubstitute(null);
      Alert.alert('Success', 'Leave approved and substitute assigned');
    } catch (error) {
      console.error('Error approving leave:', error);
      Alert.alert('Error', 'Failed to approve leave request');
    }
  };

  const openHistoryModal = async () => {
    await fetchAllLeaveHistory();
    setHistoryModalVisible(true);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackIcon
          width={styles.BackIcon.width}
          height={styles.BackIcon.height}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTxt}>Leave Approval</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          style={styles.historyButton}
          onPress={openHistoryModal}
        >
          <HistoryIcon width={18} height={18} />
          <Text style={styles.historyButtonText}>History</Text>
        </TouchableOpacity>
      </View>

      {/* Leave Requests List */}
      <ScrollView style={styles.scrollContainer}>
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request, index) => (
            <TouchableOpacity
              key={index}
              style={styles.leaveCard}
              onPress={() => handleLeavePress(request)}
            >
              <View style={styles.leaveContent}>
                <Image
                  source={request.file_path ? getProfileImageSource(request.file_path) : Staff}
                  style={styles.avatar}
                />
                <View style={styles.leaveInfo}>
                  <Text style={styles.mentorName}>{request.name}</Text>
                  <Text style={styles.mentorId}>{request.mentorRoll}</Text>
                  <View style={styles.leaveDetails}>
                    <View style={styles.detailRow}>
                      <DateIcon width={14} height={14} />
                      <Text style={styles.detailText}>{formatDate(request.start_date)} - {formatDate(request.end_date)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <ReasonIcon width={14} height={14} />
                      <Text style={styles.detailText}>{request.leaveType}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleApprove(request);
                  }}
                >
                  <Checkmark width={18} height={18} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleReject(request);
                  }}
                >
                  <Close width={18} height={18} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No pending leave requests</Text>
          </View>
        )}
      </ScrollView>

      {/* Rejection Reason Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={rejectionModalVisible}
        onRequestClose={() => setRejectionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Reason for Rejection</Text>
            <TextInput
              style={styles.reasonInput}
              multiline
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChangeText={setRejectionReason}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setRejectionModalVisible(false);
                  setRejectionReason('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmRejection}
                disabled={!rejectionReason}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Substitutes Selection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={substitutesModalVisible}
        onRequestClose={() => setSubstitutesModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Substitute</Text>
            <ScrollView style={styles.substitutesList}>
              {availableSubstitutes.length > 0 ? (
                availableSubstitutes.map((substitute, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.substituteItem,
                      selectedSubstitute?.id === substitute.id && styles.selectedSubstitute
                    ]}
                    onPress={() => setSelectedSubstitute(substitute)}
                  >
                    <Image
                      source={substitute.profilePhoto ? getProfileImageSource(substitute.profilePhoto) : Staff}
                      style={styles.substituteAvatar}
                    />
                    <View style={styles.substituteInfo}>
                      <Text style={styles.substituteName}>{substitute.name}</Text>
                      <Text style={styles.substituteId}>{substitute.roll}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noSubstitutesText}>No available substitutes</Text>
              )}
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setSubstitutesModalVisible(false);
                  setSelectedSubstitute(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  !selectedSubstitute && styles.disabledButton
                ]}
                onPress={confirmSubstitute}
                disabled={!selectedSubstitute}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* History Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={historyModalVisible}
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, styles.historyModal]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Leave History</Text>
              <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
                <Close width={20} height={20} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.historyList}>
              {historyRecords.length > 0 ? (
                historyRecords.map((record, index) => (
                  <View key={index} style={styles.historyItem}>
                    <View style={styles.historyHeader}>
                      <Image
                        source={record.file_path ? getProfileImageSource(record.file_path) : Staff}
                        style={styles.historyAvatar}
                      />
                      <View style={styles.historyInfo}>
                        <Text style={styles.historyName}>{record.name}</Text>
                        <Text style={styles.historyId}>{record.mentorRoll}</Text>
                      </View>
                      <View style={[
                        styles.statusBadge,
                        record.status === 'Approved' ? styles.approvedBadge : styles.rejectedBadge
                      ]}>
                        <Text style={[
                          styles.statusText,
                          { color: record.status === 'Approved' ? '#28a745' : '#dc3545' }
                        ]}>
                          {record.status}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.historyDetails}>
                      <View style={styles.detailRow}>
                        <DateIcon width={16} height={16} />
                        <Text style={styles.detailText}>{record.start_date} to {record.end_date}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <ReasonIcon width={16} height={16} />
                        <Text style={styles.detailText}>{record.leave_type}</Text>
                      </View>
                      {record.status === 'Approved' && record.substituteName && (
                        <Text style={styles.substituteText}>
                          Substitute: {record.substituteName} ({record.substituteRoll})
                        </Text>
                      )}
                      {record.status === 'Rejected' && record.rejection_reason && (
                        <Text style={styles.rejectionText}>
                          Reason: {record.rejection_reason}
                        </Text>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyHistoryText}>No leave history found</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CoordinatorLeaveApproval;