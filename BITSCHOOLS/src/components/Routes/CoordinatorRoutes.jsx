import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CoordinatorHome from '../../pages/Coordinator/Home/CoordinatorHome';
import CoordinatorEnrollmentHome from '../../pages/Coordinator/Enrollment/Home/EnrollmentHome';
import CoordinatorMentorHome from '../../pages/Coordinator/Mentor/Home/CoordinatorMentorHome';
import CoordinatorStudentEnrollment from '../../pages/Coordinator/Enrollment/StudentEnrollment/StudentEnrollment';
import CoordinatorSectionEnrollment from '../../pages/Coordinator/Enrollment/SectionEnrollment/CoordinatorSectionEnrollment';
import CoordinatorSubjectMentor from '../../pages/Coordinator/Mentor/SubjectMapping/CoordinatorSubjectMentor';
import CoordinatorMentorMapping from '../../pages/Coordinator/Mentor/SectionMapping/CoordinatorMentorMapping';
import CoordinatorSectionStudents from '../../pages/Coordinator/Mentor/SectionMapping/SectionStudents/CoordinatorSectionStudents';
import SubjectAllotment from '../../pages/Coordinator/Enrollment/SubjectActivityEnrollment/SubjectAllotment';

// Material Management Imports
import CoordinatorMaterialHome from '../../pages/Coordinator/Materials/MaterialHomePage/CoordinatorMaterialHome';
import BatchManagementHome from '../../pages/Coordinator/Materials/BatchManagement/BatchManagementHome';
import BatchDetails from '../../pages/Coordinator/Materials/BatchManagement/BatchDetails';
import TopicHierarchyManagement from '../../pages/Coordinator/Materials/TopicHierarchy/TopicHierarchyManagement';
import TopicMaterials from '../../pages/Coordinator/Materials/TopicHierarchy/TopicMaterials';

const Stack = createNativeStackNavigator();

const CoordinatorRoutes = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CoordinatorHome" component={CoordinatorHome} />

      <Stack.Screen name="CoordinatorEnrollmentHome" component={CoordinatorEnrollmentHome} />
      <Stack.Screen name="CoordinatorStudentEnrollment" component={CoordinatorStudentEnrollment} />
      <Stack.Screen name="CoordinatorSectionEnrollment" component={CoordinatorSectionEnrollment} />
      <Stack.Screen name="CoordinatorSubjectEnrollment" component={SubjectAllotment} />

      <Stack.Screen name="CoordinatorMentorHome" component={CoordinatorMentorHome} />
      <Stack.Screen name="CoordinatorSubjectMentor" component={CoordinatorSubjectMentor} />
      <Stack.Screen name="CoordinatorMentorMapping" component={CoordinatorMentorMapping} />
      <Stack.Screen name="CoordinatorSectionStudents" component={CoordinatorSectionStudents} />

      {/* Material Management Routes */}
      <Stack.Screen name="CoordinatorMaterialHome" component={CoordinatorMaterialHome} />
      <Stack.Screen name="BatchManagementHome" component={BatchManagementHome} />
      <Stack.Screen name="BatchDetails" component={BatchDetails} />
      <Stack.Screen name="TopicHierarchyManagement" component={TopicHierarchyManagement} />
      <Stack.Screen name="TopicMaterials" component={TopicMaterials} />
    </Stack.Navigator>
  );
};

export default CoordinatorRoutes;