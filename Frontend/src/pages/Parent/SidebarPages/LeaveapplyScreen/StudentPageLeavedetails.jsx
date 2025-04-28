import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  TouchableWithoutFeedback, 
  Alert,
  ScrollView
} from 'react-native';
import AddIcon from '../../../../assets/ParentPage/LeaveIcon/add.svg';
import PrevIcon from '../../../../assets/ParentPage/LeaveIcon/PrevBtn.svg';
import ApprovedIcon from '../../../../assets/ParentPage/LeaveIcon/approved.svg';
import PendingIcon from '../../../../assets/ParentPage/LeaveIcon/pending.svg';
import CancelIcon from '../../../../assets/ParentPage/LeaveIcon/cancel.svg';
import LeaveDateIcon from '../../../../assets/ParentPage/LeaveIcon/leavedate.svg';
import LeaveTypeIcon from '../../../../assets/ParentPage/LeaveIcon/leavetype.svg';
import Profile from '../../../../assets/ParentPage/LeaveIcon/profile.png';
import styles from './LeavedetailStyles';
import GroupIcon from '../../../../assets/ParentPage/LeaveIcon/Group.svg'
import Calender from '../../../../components/Calendermodel/Calendermodel';

import EventBus from "../../../../utils/EventBus";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from "@env";

const StudentPageLeavedetails = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleAddLeave = () => {
    navigation.navigate('StudentPageLeaveApply');
  };

  const handleBack = () => {
    navigation.goBack();
  };



  const handleCancelLeave = async (id) => {
    console.log('Cancelling leave with ID:', id);

    try {
      const response = await fetch(`${API_URL}/api/cancelStudentLeave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaveId: id }),
      });

      const data = await response.json();
      console.log("Cancel Response:", data);

      if (data.success) {
        Alert.alert("Success", "Leave cancelled successfully");
        fetchStudentLeaves(); // Refresh the leave list
      } else {
        Alert.alert("Error", data.message || "Failed to cancel leave");
      }
    } catch (error) {
      console.error("Cancel Leave Error:", error);
      Alert.alert("Error", "Something went wrong while cancelling leave");
    }
  };

  const toggleCalendar = () => {
    setModalVisible(!modalVisible);
  };

  const closeModal = () => {
    setModalVisible(false);
  };


  const [selectedStudentData, setSelectedStudent] = useState([])
  const [studentData, setStudentData] = useState([])
  const [roll, setRoll] = useState('')

  const [leavesTaken, setLeaves] = useState([])

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const storedStudents = await AsyncStorage.getItem("studentData");
        if (storedStudents) {
          const parsedStudents = JSON.parse(storedStudents);
          setStudentData(parsedStudents);
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    fetchStudent();

  }, []);

  useEffect(() => {
    const getActiveUser = async () => {
      const savedUser = await AsyncStorage.getItem("activeUser");
      if (savedUser && studentData.length > 0) {
        const active = studentData.find(student => student.name === savedUser);
        if (active) {
          setSelectedStudent(active);
          setRoll(active.roll);
          console.log(active.roll);
        }
      }
    };

    getActiveUser();

    EventBus.on("userToggled", getActiveUser);

    return () => {
      EventBus.off("userToggled", getActiveUser);
    };
  }, [studentData]);

  useEffect(() => {
    if (roll) {
      fetchStudentLeaves();
    }
  }, [roll]);

  const fetchStudentLeaves = async () => {
    try {
      const response = await fetch(`${API_URL}/api/getStudentLeaves`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roll }),
      });

      const data = await response.json();
      console.log("Student Leave Data API Response:", data);

      if (data.success) {
        setLeaves(data.leaves);
        // await AsyncStorage.setItem("studentData", JSON.stringify(data.student));
      } else {
        Alert.alert("No Student Leave data Found", "No student leave data associated with this roll");
      }
    } catch (error) {
      console.error("Error fetching student leave data:", error);
      Alert.alert("Error", "Failed to fetch student leave data");
    }
  };

  const getLocalDateString = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;  // Format: YYYY-MM-DD
  };

  const approvedDates = useMemo(() => {
    const dates = {};
    leavesTaken.forEach((leave) => {
      if (leave.status === "Approved") {
        const start = new Date(leave.start_date);
        const end = new Date(leave.end_date);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const localDateStr = getLocalDateString(d);
          dates[localDateStr] = { marked: true, dotColor: 'red' };
        }
      }
    });
    return dates;
  }, [leavesTaken]);

  const formatDate = (sqlDate) => {
    const dateObj = new Date(sqlDate);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const renderStatus = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <View style={styles.statusContainer}>
            <ApprovedIcon width={14} height={14} />
            <Text style={styles.approvedText}>Approved</Text>
          </View>
        );
      case 'Pending':
        return (
          <View style={styles.statusContainer}>
            <PendingIcon width={14} height={14} />
            <Text style={styles.pendingText}>Pending</Text>
          </View>
        );
      case 'Cancelled':
        return (
          <View style={styles.statusContainer}>
            <CancelIcon width={14} height={14} />
            <Text style={styles.cancelText}>Cancelled</Text>
          </View>
        );
      case 'Rejected':
        return (
          <View style={styles.statusContainer}>
            <CancelIcon width={14} height={14} />
            <Text style={styles.cancelText}>Rejected</Text>
          </View>
        );
      default:
        return null;
    }
  };

  const renderLeaveItem = ({ item }) => (
    <View style={styles.leaveCard}>
      <View style={styles.leaveHeader}>
        <TouchableOpacity onPress={toggleCalendar}>
          <GroupIcon />
        </TouchableOpacity>
        {/* {formatDate(item.requested_at)}*/}
        <Text style={styles.dateHeader}>{formatDate(item.requested_at)}</Text>
      </View>

      <View style={styles.leaveContainer}>
        <View style={styles.userInfoContainer}>
          <Image source={Profile} style={styles.profileImage} />
          <View style={styles.userTextContainer}>
            <Text style={styles.userName}>{item.student_name}</Text>
            <Text style={styles.userRegno}>{item.student_roll}</Text>
          </View>
          <View style={styles.statusActions}>
            {renderStatus(item.status)}
            {item.status === 'Pending' && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancelLeave(item.id)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <LeaveDateIcon />
            <Text style={styles.detailText}>{formatDate(item.start_date)} - {formatDate(item.end_date)}</Text>
          </View>
          <View style={styles.detailItem}>
            <LeaveTypeIcon />
            <Text style={styles.detailText}>{item.leave_type}</Text>
          </View>
        </View>

        <View style={styles.reasonContainer}>
          <View style={styles.accentBar} />
          <View style={styles.contentContainer}>
            <Text style={styles.reasonText}>
              {item.reason}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <PrevIcon width={24} height={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Leave Details</Text>
        </View>
      </View>

      {/* Leave List */}
      {leavesTaken.length > 0 ? (<FlatList
        data={leavesTaken}
        renderItem={renderLeaveItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />) : (
        <View style={styles.leaveCard}>
          <Text style={styles.noLeaveTaken}>No leaves taken</Text>
        </View>
      )}


      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleAddLeave}
      >
        <AddIcon width={24} height={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Calendar Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Calender onClose={closeModal} markedDates={approvedDates} />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

export default StudentPageLeavedetails;