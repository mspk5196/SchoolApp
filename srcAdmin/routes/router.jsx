
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Schools from '../screens/Schools/Schools';
import Menu from '../screens/Menu/menu';
import StudentHome from '../screens/Student/Studenthome/StudentHome';
import StudentList from '../screens/Student/StudentList/StuddentList';
import StudentDetails from '../screens/Student/StudentList/StudentDetails/StudentDetails';
import Issuelog from '../screens/Student/IssueLog/Issuelog';    
import BackLogs from '../screens/Student/Backlogs/Backlogs';

import MentorMenu from '../screens/Mentor/MentorMenu/Menu'

const StudentStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="studenthome" component={StudentHome} />
    <Stack.Screen name="StudentList" component={StudentList} /> 
    <Stack.Screen name="StudentDetails" component={StudentDetails} /> 
    <Stack.Screen name="IssueLogs" component={Issuelog} /> 
    <Stack.Screen name="BackLogs" component={BackLogs} /> 
  </Stack.Navigator>)

const MentorStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Mentormenu" component={MentorMenu} />
    <Stack.Screen name="Mentorlist" component={MentorMenu} />
  </Stack.Navigator>)

const Stack = createStackNavigator();

const Router = () => {
  return (
    <SafeAreaProvider style={{ backgroundColor: '#fafafa' }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName='menu' screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Schools" component={Schools} />
        <Stack.Screen name="menu" component={Menu} />
        <Stack.Screen name="Student" component={StudentStackNavigator} />
        <Stack.Screen name="Mentor" component={MentorStackNavigator} />

        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default Router;