// Router.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Welcome from '../screens/Bit-schl-welcome-page/Welcome';
import Login from '../screens/Bit-schl-loginpage/login';
import Survey from '../components/Survey/Survey';
import Calendermodel from '../components/Calendermodel/Calendermodel';
import PerformanceDetailsScreen from '../screens/ParentDashboard/PerformanceDetailsScreen';
import ProfileScreen from '../screens/SidebarPages/ProfileScreen/Profile';
import CalendarScreen from '../screens/SidebarPages/CalendarScreen/Calendar';
import EventsScreen from '../screens/SidebarPages/EventScreen/eventmain/Event';
import LikedEventsScreen from '../screens/SidebarPages/EventScreen/LikedEvents/Likedevents';
import EventsDetails from '../screens/SidebarPages/EventScreen/EventDetails/EventDetails';
import EventsRegister from '../screens/SidebarPages/EventScreen/eventRegisterform/EventRegister';
import RegisteredEvents from '../screens/SidebarPages/EventScreen/RegisteredEvents/Registeredevents';
import PhonebookScreen from '../screens/SidebarPages/PhonebookScreen/Phonebook';
import Message from '../screens/SidebarPages/PhonebookScreen/Message';
import RequestScreen from '../screens/SidebarPages/RequestScreen/Request';
import SettingsScreen from '../screens/SidebarPages/SettingScreen/Setting';
import LeaveApplyScreen from '../screens/SidebarPages/LeaveapplyScreen/Leaveapply';
import LeaveDetailsScreen from '../screens/SidebarPages/LeaveapplyScreen/Leavedetails';

import TabNavigator from '../components/Navbar/TabNavigator';

const LeaveStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="LeaveDetails" component={LeaveDetailsScreen} />
    <Stack.Screen name="Leaveapply" component={LeaveApplyScreen} />
  </Stack.Navigator>
);

const PhonebookStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PhonebookList" component={PhonebookScreen} />
    <Stack.Screen name="Message" component={Message} />
  </Stack.Navigator>
);

const EventStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Event" component={EventsScreen} />
    <Stack.Screen name="LikedEvents" component={LikedEventsScreen} />
    <Stack.Screen name="EventRequset" component={EventsRegister} />
    <Stack.Screen name="EventDetails" component={EventsDetails} />  
    <Stack.Screen name="RegisteredEvents" component={RegisteredEvents} />  
  </Stack.Navigator>
);

const Stack = createStackNavigator();

const Router = () => {
  return (
    <SafeAreaProvider style={{ backgroundColor: '#000000' }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName='MainTabs' screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="PerformanceDetailsScreen" component={PerformanceDetailsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Calendar" component={CalendarScreen} />
          <Stack.Screen name="Events" component={EventStackNavigator} />
          <Stack.Screen name="LeaveApply" component={LeaveStackNavigator} />
          <Stack.Screen name="Phonebook" component={PhonebookStackNavigator} />
          <Stack.Screen name="Request" component={RequestScreen} />
          <Stack.Screen name="Survey" component={Survey} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Calender" component={Calendermodel} />
          <Stack.Screen name="Welcome" component={Welcome} />
          <Stack.Screen name="Login" component={Login} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default Router;