import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Header, HomePageList, HorizontalChipSelector } from '../../../../components';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CoordinatorMentorHome = ({ navigation }) => {
  const menuItems = [
    {
      id: '1',
      title: 'Mentor List',
      iconName: 'calendar-check',
      iconType: 'material-community',
      color: '#10B981',
      bgColor: '#FFFFFF',
      route: 'CoordinatorMentorList',
    },
    {
      id: '2',
      title: 'Subject Mentor',
      iconName: 'account-group',
      iconType: 'material-community',
      color: '#3B82F6',
      bgColor: '#FFFFFF',
      route: 'CoordinatorSubjectMentor',
    },
    {
      id: '3',
      title: 'Section Mentor',
      iconName: 'google-classroom',
      iconType: 'material-community',
      color: '#F59E0B',
      bgColor: '#FFFFFF',
      route: 'CoordinatorMentorMapping',
    },
    {
      id: '4',
      title: 'Mentor IssueLog',
      iconName: 'bullhorn',
      iconType: 'material-community',
      color: '#8B5CF6',
      bgColor: '#FFFFFF',
      route: 'CoordinatorMentorIssueLog',
    },
  ];

  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [userData, setUserData] = useState(null);

  const fetchCoordinatorGrades = async () => {
    const asyncUserData = await AsyncStorage.getItem('userData');
    const parsedUserData = asyncUserData ? JSON.parse(asyncUserData) : null;
    setUserData(parsedUserData);

    const asyncGrades = await AsyncStorage.getItem('coordinatorGrades');
    const parsedGrades = asyncGrades ? JSON.parse(asyncGrades) : [];
    setGrades(parsedGrades);
    
    if (parsedGrades.length > 0 && !selectedGrade) {
      setSelectedGrade(parsedGrades[0]);
    }
  }

  useEffect(() => {
    fetchCoordinatorGrades();
  }, []);

  const handleGradeSelect = (grade) => {
    setSelectedGrade(grade);
  };

  return (
    <View style={{ flex: 1 }}>
      <Header
        title="Mentor Dashboard"
        navigation={navigation}
        showBackButton={true}
        backgroundColor="#FFFFFF"
      />
      
      <HorizontalChipSelector
        data={grades}
        selectedItem={selectedGrade}
        onSelectItem={handleGradeSelect}
        idKey="grade_id"
        nameKey="grade_name"
      />
      
      <HomePageList 
        menuItems={menuItems} 
        navigation={navigation}
        homeRoute="Home"
        data={{ selectedGrade, userData }}
      />
    </View>
  );
};

export default CoordinatorMentorHome;
