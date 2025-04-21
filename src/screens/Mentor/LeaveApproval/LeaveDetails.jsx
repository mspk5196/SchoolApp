import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  StyleSheet
} from 'react-native';
import Leftarrow from "../../../assets/LeaveApproval/leftarrow.svg";
import Dateicon from '../../../assets/LeaveApproval/date.svg';
import Reasonicon from '../../../assets/LeaveApproval/reason.svg';
import Staff from "../../../assets/LeaveApproval/staff.png";
import Pending from '../../../assets/LeaveApproval/pending.svg'
import Approve from '../../../assets/LeaveApproval/approve.svg'

const LeaveDetails = ({ route, navigation }) => {
  const { student } = route.params;
  
  // Mock leave history data
  const leaveHistory = [
    {
      date: '12/08/23',
      status: 'Approved',
      leaveDate: student.leaveDate,
      leaveType: student.leaveType,
      leaveReason: student.leaveReason
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Leftarrow width={20} height={20} />
        </TouchableOpacity>
        <Text style={styles.heading}>Leave Approval</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Current Leave Request */}
        <View style={styles.leaveCard}>
          <View style={styles.userInfo}>
            <Image source={Staff} style={styles.avatar} />
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{student.name}</Text>
              <Text style={styles.id}>{student.id}</Text>
            </View>
            <View style={styles.statusContainer}>
                <Pending height={20} />
              <Text style={[styles.statusText, styles.pendingStatus]}> Pending</Text>
            </View>
          </View>

          <View style={styles.leaveDetails}>
            <View style={styles.dateContainer}>
              <Dateicon width={16} height={16} style={styles.icon} />
              <Text style={styles.dateText}>{student.leaveDate}</Text>
            </View>
            <View style={styles.leaveTypeContainer}>
              <View style={styles.leaveTypeIcon}>
                <Reasonicon  style={styles.leaveTypeText}/>
              
              </View>
              <Text style={styles.leaveType}>{student.leaveType}</Text>
            </View>
          </View>

          <View style={styles.reasonContainer}>
            <Text style={styles.reasonText}>{student.leaveReason}</Text>
          </View>
        </View>

        {/* Leave History */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Leave history</Text>
          
          {leaveHistory.map((item, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={styles.historyDate}>{item.date}</Text>
              
              <View style={styles.historyLeaveCard}>
                <View style={styles.userInfo}>
                  <Image source={Staff} style={styles.avatar} />
                  <View style={styles.nameContainer}>
                    <Text style={styles.name}>{student.name}</Text>
                    <Text style={styles.id}>{student.id}</Text>
                  </View>
                  <View style={styles.statusContainer}>
                    <Approve height={20}/>
                    <Text style={[styles.statusText, styles.approvedStatus]}> Approved</Text>
                  </View>
                </View>

                <View style={styles.leaveDetails}>
                  <View style={styles.dateContainer}>
                    <Dateicon width={16} height={16} style={styles.icon} />
                    <Text style={styles.dateText}>{item.leaveDate}</Text>
                  </View>
                  <View style={styles.leaveTypeContainer}>
                    <View style={styles.leaveTypeIcon}>
                        <Reasonicon style={styles.leaveTypeText}/>
                     
                    </View>
                    <Text style={styles.leaveType}>{item.leaveType}</Text>
                  </View>
                </View>

                <View style={styles.reasonContainer}>
                  <Text style={styles.reasonText}>{item.leaveReason}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.approveButton}>
        <Text style={styles.approveButtonText}>Approve and allot</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  scrollContainer: {
    flex: 1,
  },
  leaveCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  id: {
    fontSize: 14,
    color: '#666',
  },
  statusContainer: {
    display:'flex',
    flexDirection:'row',
    

  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  pendingStatus: {
    color: '#FF9800',
  },
  approvedStatus: {
    color: '#4CAF50',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#333',
  },
  leaveTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaveTypeIcon: {
    marginRight: 8,
  },
  leaveTypeText: {
    color: '#F44336',
    fontSize: 16,
  },
  leaveType: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '500',
  },
  reasonContainer: {
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  reasonText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  historySection: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 100, // Add padding to account for the bottom button
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  historyDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  historyLeaveCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  approveButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#4361EE',
    padding: 16,
    alignItems: 'center',
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  leaveDetails: {
    marginBottom: 8,
  },
});

export default LeaveDetails;