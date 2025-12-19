import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MentorHome from '../../pages/Mentor/Home/MentorHome';

import MentorDashHome from '../../pages/Mentor/Dashboard/MentorDashHome';
import MentorPeriodDetails from '../../pages/Mentor/Dashboard/MentorPeriodDetails';
import MentorMaterialHome from '../../pages/Mentor/Materials/MentorMaterialHome';
import MentorTopicHierarchy from '../../pages/Mentor/Materials/MentorTopicHierarchy';
import MentorTopicMaterials from '../../pages/Mentor/Materials/MentorTopicMaterials';
import MentorBatchOverview from '../../pages/Mentor/Materials/MentorBatchOverview';

const Stack = createNativeStackNavigator();

const MentorRoutes = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MentorHome" component={MentorHome} />

      {/* Mentor Dashboard */}
      <Stack.Screen name="MentorDashboard" component={MentorDashHome} />
      <Stack.Screen name="MentorDashboardDetails" component={MentorPeriodDetails} />

      {/* Mentor Materials (view only) */}
      <Stack.Screen name="MentorMaterials" component={MentorMaterialHome} />
      <Stack.Screen name="MentorTopicHierarchy" component={MentorTopicHierarchy} />
      <Stack.Screen name="MentorTopicMaterials" component={MentorTopicMaterials} />
      <Stack.Screen name="MentorBatchOverview" component={MentorBatchOverview} />

    </Stack.Navigator>
  );
};

export default MentorRoutes;