
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

const StudentStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="studenthome" component={StudentHome} />
    <Stack.Screen name="StudentList" component={StudentList} /> 
    <Stack.Screen name="StudentDetails" component={StudentDetails} /> 
    <Stack.Screen name="IssueLogs" component={Issuelog} /> 
    
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

        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default Router;