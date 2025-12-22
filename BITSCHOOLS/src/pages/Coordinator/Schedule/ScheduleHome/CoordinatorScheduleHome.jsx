import React, { use, useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header, HomePageList } from '../../../../components';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CoordinatorScheduleHome = ({ navigation }) => {
  const menuItems = [
    {
      id: '1',
      title: 'Faculty Schedule Upload',
      iconName: 'account-plus',
      iconType: 'MaterialCommunityIcons',
      color: '#7C3AED',
      bgColor: '#E9D5FF',
      route: 'CoordinatorFacultyScheduleUpload',
    },
    {
      id: '2',
      title: 'Academic Calendar',
      iconName: 'calendar',
      iconType: 'MaterialCommunityIcons',
      color: '#10B981',
      bgColor: '#D1FAE5',
      route: 'CoordinatorAcademicCalendar',
    },
    {
      id: '3',
      title: 'Faculty Session Types',
      iconName: 'book-open-variant',
      iconType: 'MaterialCommunityIcons',
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      route: 'CoordinatorFacultySessionTypes',
    },
    {
      id: '4',
      title: 'Assessment Cycles',
      iconName: 'calendar-multiselect',
      iconType: 'MaterialCommunityIcons',
      color: '#3B82F6',
      bgColor: '#DBEAFE',
      route: 'CoordinatorAssessmentCycles',
    },
    {
      id: '5',
      title: 'Student Schedule View',
      iconName: 'calendar-multiselect',
      iconType: 'MaterialCommunityIcons',
      color: '#3B82F6',
      bgColor: '#DBEAFE',
      route: 'CoordinatorStudentScheduleView',
    },
  ];

  const [userData, setUserData] = useState(null);

  const fetchUserData = async () => {
    try{
      const userData = await AsyncStorage.getItem('userData');
      const parsedData = JSON.parse(userData);
      if(parsedData){
        setUserData(parsedData);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  }

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'left', 'right']}>
      <Header
        title="Schedule Home" 
        navigation={navigation}
      />
      <HomePageList 
        menuItems={menuItems} 
        navigation={navigation}
        homeRoute="CoordinatorMain"
        data={{ userData }}
      />
    </SafeAreaView>
  );
};

export default CoordinatorScheduleHome;