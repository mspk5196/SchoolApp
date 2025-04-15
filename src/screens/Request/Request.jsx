import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import BackIcon from '../../assets/Request/Back.svg';
import styles from './RequestStyle';

const RequestItem = ({ title, subtitle, date, status, hasCount, count, onPress }) => {
  return (
    <TouchableOpacity style={styles.requestItem} onPress={onPress}>
      <View style={styles.requestDetails}>
        <View style={styles.requestTitleRow}>
          <Text style={styles.requestTitle}>{title}</Text>
          {hasCount && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{count}</Text>
            </View>
          )}
        </View>
        <Text style={styles.requestSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.requestStatus}>
        <Text style={styles.dateText}>{date}</Text>
        <Text style={[
          styles.statusText, 
          status === 'Completed' ? styles.completedStatus : styles.pendingStatus
        ]}>
          {status}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const Request = ({ navigation }) => {
  const route = useRoute(); // ✅ Get route
  const [requestData, setRequestData] = useState([
    {
      id: 1,
      title: 'Bonafide',
      subtitle: 'Passport purpose',
      date: '23/02/25',
      status: 'Pending',
      hasCount: false
    },
    {
      id: 2,
      title: 'Fees receipt',
      subtitle: 'Income tax',
      date: '23/02/25',
      status: 'Completed',
      hasCount: true,
      count: 1
    },
    {
      id: 3,
      title: 'Fees receipt',
      subtitle: 'Income tax',
      date: '23/02/25',
      status: 'Completed',
      hasCount: true,
      count: 1
    },
    {
      id: 4,
      title: 'Fees receipt',
      subtitle: 'Income tax',
      date: '23/02/25',
      status: 'Completed',
      hasCount: false
    },
    {
      id: 5,
      title: 'Fees receipt',
      subtitle: 'Income tax',
      date: '23/02/25',
      status: 'Completed',
      hasCount: false
    }
  ]);

  // ✅ Update status if coming from RequestUpload
  useEffect(() => {
    if (route.params?.updatedStatus && route.params?.requestId) {
      setRequestData(prev =>
        prev.map(item =>
          item.id === route.params.requestId
            ? { ...item, status: route.params.updatedStatus }
            : item
        )
      );
    }
  }, [route.params]);

  const handleRequestPress = (item) => {
    if (item.status === 'Pending') {
      navigation.navigate('RequestUpload', {
        id: item.id, // pass ID to track it
        title: item.title,
        subtitle: item.subtitle,
        date: item.date,
        status: item.status
      });
    }
  };

  const handleAddRequest = () => {
    navigation.navigate('GeneralActivity');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackIcon 
          width={styles.BackIcon.width} 
          height={styles.BackIcon.height} 
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTxt}>Request</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {requestData.map((item, index) => (
          <RequestItem 
            key={index}
            title={item.title}
            subtitle={item.subtitle}
            date={item.date}
            status={item.status}
            hasCount={item.hasCount}
            count={item.count}
            onPress={() => handleRequestPress(item)}
          />
        ))}
      </ScrollView>
      
      <TouchableOpacity style={styles.floatingButton} onPress={handleAddRequest}>
        <Text style={styles.plusIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Request;
