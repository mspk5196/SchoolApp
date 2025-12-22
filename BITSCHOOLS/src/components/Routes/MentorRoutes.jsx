import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MentorHome from '../../pages/Mentor/Home/MentorHome';

import MentorDashHome from '../../pages/Mentor/Dashboard/MentorDashHome';
import MentorPeriodDetails from '../../pages/Mentor/Dashboard/MentorPeriodDetails';
import MentorMaterialHome from '../../pages/Mentor/Materials/MentorMaterialHome';
import TopicHierarchyManagement from '../../pages/Mentor/Materials/TopicHierarchy/TopicHierarchyManagement';
import TopicMaterials from '../../pages/Mentor/Materials/TopicHierarchy/TopicMaterials';
import BatchManagementHome from '../../pages/Mentor/Materials/BatchManagement/BatchManagementHome';
import BatchDetails from '../../pages/Mentor/Materials/BatchManagement/BatchDetails';

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
      <Stack.Screen name="MentorTopicHierarchy" component={TopicHierarchyManagement} />
      <Stack.Screen name="MentorTopicMaterials" component={TopicMaterials} />
      <Stack.Screen name="MentorBatchOverview" component={BatchManagementHome} />
      <Stack.Screen name="MentorBatchDetails" component={BatchDetails} />

    </Stack.Navigator>
  );
};

export default MentorRoutes;