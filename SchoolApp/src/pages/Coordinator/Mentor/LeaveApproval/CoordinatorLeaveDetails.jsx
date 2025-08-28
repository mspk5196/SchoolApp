import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView
} from 'react-native';
import BackIcon from "../../../../assets/CoordinatorPage/LeaveApproval/leftarrow.svg";
import DateIcon from '../../../../assets/CoordinatorPage/LeaveApproval/date.svg';
import ReasonIcon from '../../../../assets/CoordinatorPage/LeaveApproval/reason.svg';
import Staff from "../../../../assets/CoordinatorPage/LeaveApproval/staff.png";
import PendingIcon from '../../../../assets/CoordinatorPage/LeaveApproval/pending.svg';
import ApprovedIcon from '../../../../assets/CoordinatorPage/LeaveApproval/approve.svg';
import RejectedIcon from '../../../../assets/CoordinatorPage/LeaveApproval/close.svg';
import styles from './LeaveDetailsStyle';
import { API_URL } from '../../../../utils/env.js';

const CoordinatorLeaveDetails = ({ route, navigation }) => {
  const { leave, history } = route.params;

  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'Approved':
        return <ApprovedIcon height={20} />;
      case 'Rejected':
        return <RejectedIcon height={20} />;
      default:
        return <PendingIcon height={20} />;
    }
  };

  const statusTextStyle = (status) => {
    switch (status) {
      case 'Approved':
        return styles.approvedStatus;
      case 'Rejected':
        return styles.rejectedStatus;
      default:
        return styles.pendingStatus;
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
        <Text style={styles.headerTxt}>Leave Details</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Current Leave Request */}
        <View style={styles.currentLeaveCard}>
          <View style={styles.userInfo}>
            <Image 
              source={leave.file_path ? { uri: `${API_URL}/${leave.file_path}` } : Staff} 
              style={styles.avatar} 
            />
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{leave.name}</Text>
              <Text style={styles.id}>{leave.mentorRoll}</Text>
            </View>
            <View style={styles.statusContainer}>
              <StatusIcon status={leave.status} />
              <Text style={[styles.statusText, statusTextStyle(leave.status)]}>
                {leave.status}
              </Text>
            </View>
          </View>

          <View style={styles.leaveDetails}>
            <View style={styles.detailRow}>
              <DateIcon width={16} height={16} />
              <Text style={styles.detailText}>{leave.leaveDate}</Text>
            </View>
            <View style={styles.detailRow}>
              <ReasonIcon width={16} height={16} />
              <Text style={styles.detailText}>{leave.leaveType}</Text>
            </View>
          </View>

          <View style={styles.reasonContainer}>
            <Text style={styles.reasonTitle}>Reason:</Text>
            <Text style={styles.reasonText}>{leave.leaveReason}</Text>
          </View>

          {leave.status === 'Approved' && leave.substituteName && (
            <View style={styles.substituteContainer}>
              <Text style={styles.substituteTitle}>Substitute:</Text>
              <Text style={styles.substituteText}>
                {leave.substituteName} ({leave.substituteRoll})
              </Text>
            </View>
          )}

          {leave.status === 'Rejected' && leave.rejection_reason && (
            <View style={styles.rejectionContainer}>
              <Text style={styles.rejectionTitle}>Rejection Reason:</Text>
              <Text style={styles.rejectionText}>{leave.rejection_reason}</Text>
            </View>
          )}
        </View>

        {/* Leave History */}
        {history.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Leave History</Text>
            
            {history.map((item, index) => (
              <View key={index} style={styles.historyItem}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyDate}>
                    {new Date(item.requested_at).toLocaleDateString()}
                  </Text>
                  <View style={styles.historyStatus}>
                    <StatusIcon status={item.status} />
                    <Text style={[styles.historyStatusText, statusTextStyle(item.status)]}>
                      {item.status}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.historyDetails}>
                  <View style={styles.detailRow}>
                    <DateIcon width={16} height={16} />
                    <Text style={styles.detailText}>
                      {item.start_date} to {item.end_date}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <ReasonIcon width={16} height={16} />
                    <Text style={styles.detailText}>{item.leave_type}</Text>
                  </View>
                  
                  {item.status === 'Approved' && item.substituteName && (
                    <Text style={styles.substituteText}>
                      Substitute: {item.substituteName} ({item.substituteRoll})
                    </Text>
                  )}
                  
                  {item.status === 'Rejected' && item.rejection_reason && (
                    <Text style={styles.rejectionText}>
                      Reason: {item.rejection_reason}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CoordinatorLeaveDetails;