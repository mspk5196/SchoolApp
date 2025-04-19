// HomeStack.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import ParentDashboard from '../../screens/ParentDashboard/ParentDashboard';
import ProfileScreen from '../../screens/SidebarPages/ProfileScreen/Profile';

const Stack = createStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ParentDashboard" component={ParentDashboard} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

export default HomeStack;
