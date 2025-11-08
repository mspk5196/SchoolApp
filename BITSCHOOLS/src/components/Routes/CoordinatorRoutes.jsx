import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CoordinatorHome from '../../pages/Coordinator/Home/CoordinatorHome';

const Stack = createNativeStackNavigator();

const CoordinatorRoutes = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CoordinatorHome" component={CoordinatorHome} />
    </Stack.Navigator>
  );
};

export default CoordinatorRoutes;