import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminHome from '../../pages/Admin/Home/AdminHome';
import EnrollmentHome from '../../pages/Admin/Enrollment/Home/EnrollmentHome';
import FacultyEnrollment from '../../pages/Admin/Enrollment/FacultyEnrollment/AdminFacultyEnrollment';
import { StatusBar } from 'react-native';

const Stack = createNativeStackNavigator();

const AdminRoutes = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminHome" component={AdminHome}/>

      <Stack.Screen name="EnrollmentHome" component={EnrollmentHome} />
      <Stack.Screen name="FacultyEnrollment" component={FacultyEnrollment} />
    </Stack.Navigator>
  );
};

export default AdminRoutes;