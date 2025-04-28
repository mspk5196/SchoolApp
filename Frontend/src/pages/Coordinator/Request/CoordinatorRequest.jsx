import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import BackIcon from '../../../assets/CoordinatorPage/Request/Back.svg';
import styles from './RequestStyle';
import { API_URL } from "@env";
import AsyncStorage from '@react-native-async-storage/async-storage';

const RequestItem = ({ title, subtitle, date, status, onPress }) => {
  return (
    <TouchableOpacity style={styles.requestItem} onPress={onPress}>
      <View style={styles.requestDetails}> 
        <View style={styles.requestTitleRow}>
          <Text style={styles.requestTitle}>{title}</Text>
        </View>
        <Text style={styles.requestSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.requestStatus}>
        <Text style={styles.dateText}>{date}</Text>
        <Text style={[
          styles.statusText,
          status === 'Received' ? styles.completedStatus : styles.pendingStatus
        ]}>
          {status === 'Received' ? ('Completed') : ('Requested')}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const CoordinatorRequest = ({ navigation }) => {
  const route = useRoute();
  

  const [coordinatorData, setCoordinatorData] = useState([]);
  const [requests, setRequests] = useState([]);

  const convertToIST = (utcDate) => {
    if (!utcDate) return '';
    return new Date(utcDate).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour12: true,
      day: '2-digit',
      month: 'numeric',
      year: 'numeric',
      // hour: '2-digit', 
      // minute: '2-digit',
    });
  };

  const formatRequestTypes = (types) => {
    let parsedTypes = [];

    try {
      parsedTypes = typeof types === 'string' ? JSON.parse(types) : types;
    } catch (err) {
      console.error('Invalid document_type JSON:', types);
      return '';
    }

    if (!Array.isArray(parsedTypes) || parsedTypes.length === 0) return '';
    if (parsedTypes.length === 1) return parsedTypes[0];
    return `${parsedTypes[0]} +${parsedTypes.length - 1}`;
  };

  useEffect(() => {
    if (route.params?.updatedStatus && route.params?.requestId) {
      setRequests(prev =>
        prev.map(item =>
          item.id === route.params.requestId
            ? { ...item, status: route.params.updatedStatus }
            : item
        )
      );
    }
  }, [route.params]);

  useEffect(() => {
    const fetchCoordinatorData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('coordinatorData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setCoordinatorData(parsedData);
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };
    fetchCoordinatorData();
  }, [])

  useEffect(() => {
    fetchStudentRequests();
  }, [coordinatorData])

  const handleRequestPress = (item) => {
    if (item.status === 'Requested') {
      console.log(item);

      navigation.navigate('CoordinatorRequestUpload', {
        reqData: item
      });
    }
  }; 

  // {"document_type": ["Bonofide", "Fee Receipt"], "grade_id": 2, "id": 1, "purpose": "Income Tax", "requestID": "1744774325056yx2jv0bep", "request_date": "2025-04-16T03:32:05.000Z", "status": "Requested", "student_roll": "S103"}

  const handleAddRequest = () => {
    navigation.navigate('CoordinatorGeneralActivity');
  };

  const fetchStudentRequests = async () => {
    console.log(coordinatorData.grade_id);

    try {
      const response = await fetch(`${API_URL}/api/coordinator/getStudentCoordinatorRequests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gradeID: coordinatorData.grade_id }),
      });

      const data = await response.json();
      console.log("Student Request Data API Response:", data);

      if (data.success) {
        setRequests(data.coordinatorStuRequest);
      } else {
        Alert.alert("No Student Document Request data Found", "No student request data associated with this roll");
      }
    } catch (error) {
      console.error("Error fetching student request data:", error);
      Alert.alert("Error", "Failed to fetch student request data");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackIcon
          width={styles.BackIcon.width}
          height={styles.BackIcon.height}
          onPress={() => navigation.navigate('CoordinatorMain')}
        />
        <Text style={styles.headerTxt}>Request</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {requests.length > 0 ? (
          requests.map((item, index) => (
            <RequestItem
              key={index}
              title={formatRequestTypes(item.document_type)}
              subtitle={(item.purpose)}
              date={convertToIST(item.request_date)}
              status={item.status}
              hasCount={item.hasCount}
              count={item.count}
              requestID={item.requestID}
              onPress={() => handleRequestPress(item)}
            />
          ))
        ) : (
          <View style={styles.noRequests}>
            <Text style={{color:'grey', justifyContent:'center'}}>No Requests</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.floatingButton} onPress={handleAddRequest}>
        <Text style={styles.plusIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default CoordinatorRequest;
