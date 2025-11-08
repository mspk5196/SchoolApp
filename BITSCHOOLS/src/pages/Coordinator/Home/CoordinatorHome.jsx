import React, { useEffect } from 'react';
import RoleHomePage from '../../../components/HomePage/RoleHomePage';
import { coordinatorMenuConfig } from '../../../config/coordinatorMenuConfig';
import ApiService from '../../../utils/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CoordinatorHome = ({ navigation }) => {

  const fetchCoordinatorGrades = async () => {
    try {
      const asyncData = await AsyncStorage.getItem('userData');
      const parsedData = JSON.parse(asyncData);
      if (parsedData) {
        const response = await ApiService.makeRequest('/general/getCoordinatorGrades', {
          method: 'POST',
          body: JSON.stringify({facultyId: parsedData.id}),
        });
        const data = await response.json();
        
        if(data.success) {
          AsyncStorage.setItem('coordinatorGrades', JSON.stringify(data.data));
        } else {
          console.error('Failed to fetch coordinator grades:', data.message); 
        }
      }
    } catch (error) {
      console.error('Error fetching coordinator grades:', error);
    }
  }

  useEffect(() => {
    fetchCoordinatorGrades();
  }, []);

  return <RoleHomePage navigation={navigation} roleConfig={coordinatorMenuConfig} />;
};

export default CoordinatorHome;
