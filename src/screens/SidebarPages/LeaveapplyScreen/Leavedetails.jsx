import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import AddIcon from '../../../assets/LeaveIcon/add.svg';
import PrevIcon from '../../../assets/LeaveIcon/PrevBtn.svg';
import ApprovedIcon from '../../../assets/LeaveIcon/approved.svg';
import PendingIcon from '../../../assets/LeaveIcon/pending.svg';
import CancelIcon from '../../../assets/LeaveIcon/cancel.svg';
import LeaveDateIcon from '../../../assets/LeaveIcon/leavedate.svg';
import LeaveTypeIcon from '../../../assets/LeaveIcon/leavetype.svg';
import Profile from '../../../assets/LeaveIcon/profile.png';
import styles from './LeavedetailStyles';
import GroupIcon from '../../../assets/LeaveIcon/Group.svg'
import Calender from '../../../components/Calendermodel/Calendermodel';

const Leavedetails = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  
  // Sample leave data
  const leaveData = [
    {
      id: '1',
      date: '12/08/23',
      name: 'Ram Kumar',
      regno: '7376232206',
      duration: '20/08/2024 - 23/08/2024',
      type: 'Sick Leave',
      reason: "Due to Heavy fever I'm unable to attend the class fever I'm unable to attend the class Due to Heavy fever I'm unable to attend the class fever",
      status: 'pending'
    },
    {
      id: '2',
      date: '10/08/23',
      name: 'Ram Prasath',
      regno: '7376232206',
      duration: '20/08/2024 - 23/08/2024',
      type: 'Sick Leave',
      reason: "Due to Heavy fever I'm unable to attend the class fever I'm unable to attend the class Due to Heavy fever I'm unable to attend the class fever",
      status: 'approved'
    },
    {
      id: '3',
      date: '10/08/23',
      name: 'Ram Kumar',
      regno: '7376232206',
      duration: '20/08/2024 - 23/08/2024',
      type: 'Sick Leave',
      reason: "Due to Heavy fever I'm unable to attend the class fever I'm unable to attend the class Due to Heavy fever I'm unable to attend the class fever",
      status: 'approved'
    }
  ];

  const handleAddLeave = () => {
    navigation.navigate('Leaveapply');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCancelLeave = (id) => {
    console.log('Cancelling leave with ID:', id);
  };

  const toggleCalendar = () => {
    setModalVisible(!modalVisible);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const renderStatus = (status) => {
    switch (status) {
      case 'approved':
        return (
          <View style={styles.statusContainer}>
            <ApprovedIcon width={14} height={14} />
            <Text style={styles.approvedText}>Approved</Text>
          </View>
        );
      case 'pending':
        return (
          <View style={styles.statusContainer}>
            <PendingIcon width={14} height={14} />
            <Text style={styles.pendingText}>Pending</Text>
          </View>
        );
      case 'cancelled':
        return (
          <View style={styles.statusContainer}>
            <CancelIcon width={14} height={14} />
            <Text style={styles.cancelText}>Cancelled</Text>
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

        <Text style={styles.dateHeader}>{item.date}</Text>
      </View>

      <View style={styles.leaveContainer}>
        <View style={styles.userInfoContainer}>
          <Image source={Profile} style={styles.profileImage} />
          <View style={styles.userTextContainer}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userRegno}>{item.regno}</Text>
          </View>
          <View style={styles.statusActions}>
            {renderStatus(item.status)}
            {item.status === 'pending' && (
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
            <Text style={styles.detailText}>{item.duration}</Text>
          </View>
          <View style={styles.detailItem}>
            <LeaveTypeIcon />
            <Text style={styles.detailText}>{item.type}</Text>
          </View>
        </View>

        <View style={styles.reasonContainer}>
          <View style={styles.accentBar} />
          <View style={styles.contentContainer}>
            <Text style={styles.reasonText}>
              Due to Heavy fever I'm unable to attend the class fever I'm unable to attend the class Due to Heavy fever I'm unable to attend the class fever
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
      <FlatList
        data={leaveData}
        renderItem={renderLeaveItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

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
        style={styles.modalContainer}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Calender onClose={closeModal} />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

export default Leavedetails;