import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
} from 'react-native';
import styles from './LeaveApprovalsty';
import Back from       '../../../../assets/AdminPage/LeaveApproval/Back.svg';
import SearchIcon from '../../../../assets/AdminPage/LeaveApproval/search.svg';
import History2 from   '../../../../assets/AdminPage/LeaveApproval/history.svg';
import LeaveType from  '../../../../assets/AdminPage/LeaveApproval/leavetype.svg';
import Date from       '../../../../assets/AdminPage/LeaveApproval/date.svg';
import Pending from    '../../../../assets/AdminPage/LeaveApproval/pending.svg';

const AdminLeaveApproval = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const leaveData = [
    {
      id: '1',
      name: 'Ram Kumar',
      phone: '7376232206',
      status: 'Pending',
      leaveType: 'Sick Leave',
      dateRange: '20/08/24 - 23/08/24',
      reason:
        "Due to Heavy fever I'm unable to attend the class. Due to Heavy fever I'm unable to attend the class",
    },
    {
      id: '2',
      name: 'Ram Kumar',
      phone: '7376232206',
      status: 'Pending',
      leaveType: 'Sick Leave',
      dateRange: '20/08/24 - 23/08/24',
      reason:
        "Due to Heavy fever I'm unable to attend the class. Due to Heavy fever I'm unable to attend the class",
    },
    {
      id: '3',
      name: 'Ram Kumar',
      phone: '7376232206',
      status: 'Pending',
      leaveType: 'Sick Leave',
      dateRange: '20/08/24 - 23/08/24',
      reason:
        "Due to Heavy fever I'm unable to attend the class. Due to Heavy fever I'm unable to attend the class",
    },
    {
      id: '4',
      name: 'Ram Kumar',
      phone: '7376232206',
      status: 'Pending',
      leaveType: 'Sick Leave',
      dateRange: '20/08/24 - 23/08/24',
      reason:
        "Due to Heavy fever I'm unable to attend the class. Due to Heavy fever I'm unable to attend the class",
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.activityHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Back height={20} width={20} style={styles.homeIcon} />
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

        <TouchableOpacity
          onPress={() => navigation.navigate('AdminLeaveApprovalHistory')}>
          <History2 style={styles.historyIcon} />
          <Text style={styles.historyText}>History</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={leaveData}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => (
          <View style={styles.inboxItem}>
            <View style={styles.topInfoBox}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View style={styles.profileCircle}></View>
              </View>
              <View style={styles.namePhoneContainer}>
                <Text style={styles.inboxText}>{item.name}</Text>
                <Text style={styles.inboxMsg}>{item.phone}</Text>
              </View>
              <Text style={styles.status}>
                <Pending style={styles.statusicon} /> {item.status}
              </Text>
            </View>

            <View style={styles.infobox}>
              <Text style={styles.leaveType}>
                {' '}
                <LeaveType /> {item.leaveType}
              </Text>
              <View style={styles.date}>
                <Text style={styles.dateRange}>
                  <Date /> {item.dateRange}
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
              <TouchableOpacity style={styles.acceptBtn}>
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
              <Text style={styles.reasonText}>{selectedItem?.reason}</Text>
            </View>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  console.log('Rejected:', selectedItem.name);
                  setModalVisible(false);
                }}>
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
