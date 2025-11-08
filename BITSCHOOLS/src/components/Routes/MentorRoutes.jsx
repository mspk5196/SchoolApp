import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MentorHome from '../../pages/Mentor/Home/MentorHome';

const Stack = createNativeStackNavigator();

const MentorRoutes = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MentorHome" component={MentorHome} />
    </Stack.Navigator>
  );
};

export default MentorRoutes;