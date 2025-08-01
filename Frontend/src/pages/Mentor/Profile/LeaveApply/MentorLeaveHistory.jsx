import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native';
import styles from './leavehistorysty';
import SearchIcon from '../../../../assets/MentorPage/search.svg';
import LeaveType from '../../../../assets/MentorPage/leavetype.svg';
import DateIcon from '../../../../assets/MentorPage/date.svg';
import Home from '../../../../assets/MentorPage/backarrow.svg';
import Approved from '../../../../assets/MentorPage/greentick.svg';
import Rejected from '../../../../assets/MentorPage/rejected.svg';
import Pending from '../../../../assets/MentorPage/pending.svg';
import { fetchWithTimeout } from '../../../utils/fetchWithTimeout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../../../utils/env.js'

const MentorLeaveHistory = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [phone, setPhone] = useState(null)

  const fetchPhone = async () => {
    try {
      const storedPhone = await AsyncStorage.getItem('userPhone');
      if (storedPhone) {
        const parsedPhone = JSON.parse(storedPhone);
        setPhone(parsedPhone);
      }
    } catch (error) {
      console.error('Error fetching phone:', error);
    }
  };

  useEffect(() => {
    fetchPhone();
    const fetchLeaveRequests = async () => {
      try {

        const response = await fetch(`${API_URL}/api/mentor/getLeaveHistory`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phone }),
        });

        if (!response.ok) throw new Error('Failed to fetch leave requests');

        const result = await response.json();

        if (result.success) {
          setLeaveRequests(result.leaveRequests);
        } else {
          throw new Error(result.error || 'Failed to fetch leave requests');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, [phone]);

  const filteredRequests = leaveRequests.filter(request =>
    request.leave_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.start_date.includes(searchQuery) ||
    request.end_date.includes(searchQuery)
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return <Approved width={15} height={15} />;
      case 'Rejected': return <Rejected width={15} height={15} />;
      default: return <Pending width={15} height={15} />;
    }
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


  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.activityHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Home height={30} width={30} style={styles.homeIcon} />
        </TouchableOpacity>
        <Text style={styles.activityText}>Leave History</Text>
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

      {filteredRequests.length === 0 ? (
        <View style={styles.noResults}>
          <Text>No leave requests found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRequests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.topInfoBox}>
                <View style={styles.leftBox}>

                  {item.file_path ? (
                    <Image source={getProfileImageSource(item.file_path)} style={styles.profileCircle} />
                  ) : (
                    <View style={styles.profileCircle} />
                  )}
                  <View>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.phone}>{item.phone}</Text>
                  </View>
                </View>
                <View style={styles.statusBox}>
                  {getStatusIcon(item.status)}
                  <Text style={[styles.status,
                  item.status === 'Approved' ? styles.approved :
                    item.status === 'Rejected' ? styles.rejected : styles.pending
                  ]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={styles.row}>
                <Text style={styles.dateText}>
                  <DateIcon /> {formatDate(item.start_date)} - {formatDate(item.end_date)}
                </Text>
                <Text style={styles.leaveType}>
                  <LeaveType /> {item.leave_type}
                </Text>
              </View>

              {item.description && (
                <View style={styles.reasonBox}>
                  <Text style={styles.reasonText}>{item.description}</Text>
                </View>
              )}

              {item.rejection_reason && item.status === 'Rejected' && (
                <View style={styles.rejectionBox}>
                  <Text style={styles.rejectionText}>
                    <Text style={styles.bold}>Reason: </Text>{item.rejection_reason}
                  </Text>
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
};

export default MentorLeaveHistory;