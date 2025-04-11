import React, { useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';


import Welcome from '../screens/Bit-schl-welcome-page/Welcome';
import Login from '../screens/Bit-schl-loginpage/login';
import Survey from '../components/Survey/Survey';

import ParentDashboard from '../screens/ParentDashboard/ParentDashboard';
import PerformanceDetailsScreen from '../screens/ParentDashboard/PerformanceDetailsScreen';
import MaterialScreen from '../screens/MaterialScreen/MaterialScreen';
import ScheduleScreen from '../screens/ScheduleScreen/ScheduleScreen';
import ProfileScreen from '../screens/SidebarPages/ProfileScreen/Profile';
import CalendarScreen from '../screens/SidebarPages/CalendarScreen/Calendar';
import EventsScreen from '../screens/SidebarPages/EventScreen/Event';
import LeaveApplyScreen from '../screens/SidebarPages/LeaveapplyScreen/Leaveapply';
import LeaveDetailsScreen from '../screens/SidebarPages/LeaveapplyScreen/Leavedetails';
import PhonebookScreen from '../screens/SidebarPages/PhonebookScreen/Phonebook';
import RequestScreen from '../screens/SidebarPages/RequestScreen/Request';
import SettingsScreen from '../screens/SidebarPages/SettingScreen/Setting';

// Components
import SidebarOverlay from '../components/Sidebar/SidebarOverlay';

// Icons
import HomeIcon from '../assets/NavImg/home.svg';
import MaterialsIcon from '../assets/NavImg/materials.svg';
import ScheduleIcon from '../assets/NavImg/shedule.svg';
import MoreIcon from '../assets/NavImg/more.svg';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Leave Stack
const LeaveStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="LeaveDetails" component={LeaveDetailsScreen} />
    <Stack.Screen name="Leaveapply" component={LeaveApplyScreen} />
  </Stack.Navigator>
);

// Bottom Tab Navigator
const TabNavigator = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused }) => {
            let Icon;
            let color = focused ? 'blue' : 'gray';

            switch (route.name) {
              case 'Home':
                Icon = HomeIcon;
                break;
              case 'Materials':
                Icon = MaterialsIcon;
                break;
              case 'Schedule':
                Icon = ScheduleIcon;
                break;
              case 'MoreTab':
                Icon = MoreIcon;
                break;
              default:
                return null;
            }
            return <Icon width={22} height={22} color={color} />;
          },
          tabBarActiveTintColor: 'blue',
          tabBarInactiveTintColor: 'gray',
          tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold' },
          tabBarStyle: {
            paddingBottom: 15,
            height: 65,
            backgroundColor: 'white',
          },
        })}
      >
        <Tab.Screen name="Home" component={ParentDashboard} />
        <Tab.Screen name="Schedule" component={ScheduleScreen} />
        <Tab.Screen name="Materials" component={MaterialScreen} />
        <Tab.Screen
          name="MoreTab"
          component={ParentDashboard}
          options={{
            tabBarLabel: 'More',
            tabBarButton: (props) => (
              <TouchableOpacity
                {...props}
                onPress={toggleSidebar}
                style={[props.style, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}
              >
                <MoreIcon
                  width={22}
                  height={22}
                  color={props.accessibilityState?.selected ? 'blue' : 'gray'}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: 'bold',
                    color: props.accessibilityState?.selected ? 'blue' : 'gray',
                    marginTop: 4,
                  }}
                >
                  More
                </Text>
              </TouchableOpacity>
            ),
          }}
        />
      </Tab.Navigator>

      {/* Sidebar Overlay */}
      <SidebarOverlay visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
    </>
  );
};

// App Layout Stack (after login)
// const AppLayout = () => (
//   <Stack.Navigator screenOptions={{ headerShown: false }}>
//     <Stack.Screen name="MainTabs" component={TabNavigator} />
//     <Stack.Screen name="PerformanceDetailsScreen" component={PerformanceDetailsScreen} />
//     <Stack.Screen name="Profile" component={ProfileScreen} />
//     <Stack.Screen name="Calendar" component={CalendarScreen} />
//     <Stack.Screen name="Events" component={EventsScreen} />
//     <Stack.Screen name="LeaveApply" component={LeaveStackNavigator} />
//     <Stack.Screen name="Phonebook" component={PhonebookScreen} />
//     <Stack.Screen name="Request" component={RequestScreen} />
//     <Stack.Screen name="Survey" component={Survey} />
//     <Stack.Screen name="Settings" component={SettingsScreen} />
//   </Stack.Navigator>
// );


const Router = () => {
  return (
    <SafeAreaProvider style={{ backgroundColor: '#000000' }}>
      <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={TabNavigator} />
    <Stack.Screen name="PerformanceDetailsScreen" component={PerformanceDetailsScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="Calendar" component={CalendarScreen} />
    <Stack.Screen name="Events" component={EventsScreen} />
    <Stack.Screen name="LeaveApply" component={LeaveStackNavigator} />
    <Stack.Screen name="Phonebook" component={PhonebookScreen} />
    <Stack.Screen name="Request" component={RequestScreen} />
    <Stack.Screen name="Survey" component={Survey} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default Router;
