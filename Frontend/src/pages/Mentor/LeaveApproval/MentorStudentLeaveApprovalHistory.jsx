import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, Image } from "react-native";
import styles from "./LeaveApprovalHistorysty";
import SearchIcon from "../../../assets/MentorPage/search.svg";
import Home from "../../../assets/MentorPage/backarrow.svg";
import Approved from "../../../assets/MentorPage/greentick.svg";
import Rejected from "../../../assets/MentorPage/rejected.svg";
import { API_URL } from '@env'
const Staff = require('../../../assets/CoordinatorPage/StudentProfile/staff.png');

const MentorStudentLeaveApprovalHistory = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [leaveData, setLeaveData] = useState([]);
  const { sectionId } = route.params;

  useEffect(() => {
    fetchLeaveRequestHistory();
  }, []);

  const fetchLeaveRequestHistory = () => {
    fetch(`${API_URL}/api/mentor/getLeaveRequestHistory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sectionId }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setLeaveData(data.leaveRequests);
        } else {
          Alert.alert('Error', 'Failed to fetch leave history');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        Alert.alert('Error', 'An error occurred while fetching leave history');
      });
  };

  const filteredData = leaveData.filter(item =>
    item.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.student_roll.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const groupByDate = (data) => {
    const grouped = {};
    data.forEach(item => {
      const date = formatDate(item.requested_at);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });
    return grouped;
  };

  const groupedData = groupByDate(filteredData);
  const sections = Object.keys(groupedData).map(date => ({
    date,
    data: groupedData[date]
  }));

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
          <Home height={30} width={30} style={styles.homeIcon} />
        </TouchableOpacity>
        <Text style={styles.activityText}>Leave Approval History</Text>
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
      </View>

      <FlatList
        data={sections}
        keyExtractor={(item) => item.date}
        renderItem={({ item: section }) => (
          <View>
            <Text style={styles.sectionHeader}>{section.date}</Text>
            {section.data.map(item => (
              <View style={styles.card} key={item.id}>
                <View style={styles.topInfoBox}>
                  <View style={styles.leftBox}>
                    <View>
                      <Image source={getProfileImageSource(item.profile_photo)} style={styles.profileCircle} />
                    </View>
                    <View>
                      <Text style={styles.name}>{item.student_name}</Text>
                      <Text style={styles.phone}>{item.student_roll}</Text>
                    </View>
                  </View>
                  <View style={styles.statusBox}>
                    {item.status === 'Approved' ? (
                      <Approved width={15} height={15} />
                    ) : (
                      <Rejected width={15} height={15} />
                    )}
                    <Text style={[
                      styles.status,
                      item.status === 'Approved' ? styles.approvedStatus : styles.rejectedStatus
                    ]}>
                      {item.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.row}>
                  <Text style={styles.dateText}>
                    {formatDate(item.start_date)} - {formatDate(item.end_date)}
                  </Text>
                  <Text style={styles.leaveType}>{item.leave_type}</Text>
                </View>
                <View style={styles.reasonBox}>
                  <Text style={styles.reasonText}>{item.reason}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      />
    </View>
  );
};

export default MentorStudentLeaveApprovalHistory;