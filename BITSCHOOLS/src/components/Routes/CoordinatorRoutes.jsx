import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CoordinatorHome from '../../pages/Coordinator/Home/CoordinatorHome';
import CoordinatorEnrollmentHome from '../../pages/Coordinator/Enrollment/Home/EnrollmentHome';
import CoordinatorMentorHome from '../../pages/Coordinator/Mentor/Home/CoordinatorMentorHome';
import CoordinatorStudentEnrollment from '../../pages/Coordinator/Enrollment/StudentEnrollment/StudentEnrollment';
import CoordinatorSectionEnrollment from '../../pages/Coordinator/Enrollment/SectionEnrollment/CoordinatorSectionEnrollment';
import InfrastructureEnrollment from '../../pages/Coordinator/Enrollment/Infrastructure/InfrastructureEnrollment';
import AddInfraEnrollment from '../../pages/Coordinator/Enrollment/Infrastructure/AddInfraEnrollment';
import VenueMapping from '../../pages/Coordinator/Enrollment/Infrastructure/VenueMapping';
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

import CoordinatorScheduleHome from '../../pages/Coordinator/Schedule/ScheduleHome/CoordinatorScheduleHome';
import FacultyScheduleUpload from '../../pages/Coordinator/Schedule/FacultySchedule/FacultyScheduleUpload';
import AcademicCalendar from '../../pages/Coordinator/Schedule/AcademicCalendar/AcademicCalendar';
import FacultySessionTypes from '../../pages/Coordinator/Schedule/FacultySessionTypes/FacultySessionTypes';
import AssessmentCycles from '../../pages/Coordinator/Schedule/AssessmentCycles/AssessmentCycles';

import CoordinatorMentorList from '../../pages/Coordinator/Mentor/MentorList/CoordinatorMentorList';
import CoordinatorMentorListDetails from '../../pages/Coordinator/Mentor/MentorList/CoordinatorMentorListDetails';
import CoordinatorMentorIssueLog from '../../pages/Coordinator/Mentor/IssueLog/CoordinatorMentorIssueLog';
import StudentScheduleView from '../../pages/Coordinator/Schedule/StudentSchedule/StudentScheduleView';

const Stack = createNativeStackNavigator();

const CoordinatorRoutes = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CoordinatorHome" component={CoordinatorHome} />

      {/* Enrollment Management Routes */}
      <Stack.Screen name="CoordinatorEnrollmentHome" component={CoordinatorEnrollmentHome} />
      <Stack.Screen name="CoordinatorStudentEnrollment" component={CoordinatorStudentEnrollment} />
      <Stack.Screen name="CoordinatorSectionEnrollment" component={CoordinatorSectionEnrollment} />
      <Stack.Screen name="CoordinatorSubjectEnrollment" component={SubjectAllotment} />
      <Stack.Screen name="CoordinatorInfrastructureEnrollment" component={InfrastructureEnrollment} />
      <Stack.Screen name="CoordinatorAddInfraEnrollment" component={AddInfraEnrollment} />
      <Stack.Screen name="VenueMapping" component={VenueMapping} />

      {/* Mentor Management Routes */}
      <Stack.Screen name="CoordinatorMentorHome" component={CoordinatorMentorHome} />
      <Stack.Screen name="CoordinatorSubjectMentor" component={CoordinatorSubjectMentor} />
      <Stack.Screen name="CoordinatorMentorMapping" component={CoordinatorMentorMapping} />
      <Stack.Screen name="CoordinatorSectionStudents" component={CoordinatorSectionStudents} />
      <Stack.Screen name="CoordinatorMentorList" component={CoordinatorMentorList} />
      <Stack.Screen name="CoordinatorMentorListDetails" component={CoordinatorMentorListDetails} />
      <Stack.Screen name="CoordinatorMentorIssueLog" component={CoordinatorMentorIssueLog} />

      {/* Material Management Routes */}
      <Stack.Screen name="CoordinatorMaterialHome" component={CoordinatorMaterialHome} />
      <Stack.Screen name="BatchManagementHome" component={BatchManagementHome} />
      <Stack.Screen name="BatchDetails" component={BatchDetails} />
      <Stack.Screen name="TopicHierarchyManagement" component={TopicHierarchyManagement} />
      <Stack.Screen name="TopicMaterials" component={TopicMaterials} />

      {/* Schedule */}
      <Stack.Screen name="CoordinatorScheduleHome" component={CoordinatorScheduleHome} />
      <Stack.Screen name="CoordinatorFacultyScheduleUpload" component={FacultyScheduleUpload} />
      <Stack.Screen name="CoordinatorAcademicCalendar" component={AcademicCalendar} />
      <Stack.Screen name="CoordinatorFacultySessionTypes" component={FacultySessionTypes} />
      <Stack.Screen name="CoordinatorAssessmentCycles" component={AssessmentCycles} />
      <Stack.Screen name="CoordinatorStudentScheduleView" component={StudentScheduleView} />
    </Stack.Navigator>
  );
};

export default CoordinatorRoutes;