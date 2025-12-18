import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MentorHome from '../../pages/Mentor/Home/MentorHome';

import MentorDashHome from '../../pages/Mentor/Dashboard/MentorDashHome';
import MentorPeriodDetails from '../../pages/Mentor/Dashboard/MentorPeriodDetails';

const Stack = createNativeStackNavigator();

const MentorRoutes = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MentorHome" component={MentorHome} />

      {/* Mentor Dashboard */}
      <Stack.Screen name="MentorDashboard" component={MentorDashHome} />
      <Stack.Screen name="MentorDashboardDetails" component={MentorPeriodDetails} />

    </Stack.Navigator>
  );
};

export default MentorRoutes;