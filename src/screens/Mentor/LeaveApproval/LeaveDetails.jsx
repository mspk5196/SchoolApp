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
import BackIcon from "../../../assets/LeaveApproval/leftarrow.svg";
import Dateicon from '../../../assets/LeaveApproval/date.svg';
import Reasonicon from '../../../assets/LeaveApproval/reason.svg';
import Staff from "../../../assets/LeaveApproval/staff.png";
import Pending from '../../../assets/LeaveApproval/pending.svg'
import Approve from '../../../assets/LeaveApproval/approve.svg'
import styles from './LeaveDetailsStyle';

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
        <BackIcon 
          width={styles.BackIcon.width} 
          height={styles.BackIcon.height} 
          onPress={() => navigation.navigate('LeaveApproval')}
        />
        <Text style={styles.headerTxt}>Leave Approval</Text>
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


export default LeaveDetails;