import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header, HomePageList } from '../../../../components';

const EnrollmentHome = ({ navigation }) => {
  const menuItems = [
    {
      id: '1',
      title: 'Student Enrollment',
      iconName: 'account-plus',
      iconType: 'MaterialCommunityIcons',
      color: '#7C3AED',
      bgColor: '#E9D5FF',
      route: 'CoordinatorStudentEnrollment',
    },
    {
      id: '2',
      title: 'Section Enrollment',
      iconName: 'google-classroom',
      iconType: 'MaterialCommunityIcons',
      color: '#3B82F6',
      bgColor: '#DBEAFE',
      route: 'CoordinatorSectionEnrollment',
    },
    {
      id: '3',
      title: 'Subject Enrollment',
      iconName: 'google-classroom',
      iconType: 'MaterialCommunityIcons',
      color: '#3B82F6',
      bgColor: '#DBEAFE',
      route: 'CoordinatorSubjectEnrollment',
    },
    {
      id: '4',
      title: 'Infrastructure Management',
      iconName: 'calendar-check',
      iconType: 'MaterialCommunityIcons',
      color: '#059669',
      bgColor: '#A7F3D0',
      route: 'CoordinatorInfrastructureManagement',
    }
  ];

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'left', 'right']}>
      <Header
        title="Enrollment Home" 
        navigation={navigation}
      />
      <HomePageList 
        menuItems={menuItems} 
        navigation={navigation}
        homeRoute="AdminMain"
      />
    </SafeAreaView>
  );
};

export default EnrollmentHome;