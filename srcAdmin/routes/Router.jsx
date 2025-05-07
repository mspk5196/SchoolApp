import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Schools from '../screens/Schools/Schools';
import Menu from '../screens/Menu/menu';

import StudentHome from '../screens/Student/Studenthome/StudentHome';
import StudentList from '../screens/Student/StudentList/StuddentList';
import StudentDetails from '../screens/Student/StudentList/StudentDetails/StudentDetails';
import Issuelog from '../screens/Student/IssueLog/Issuelog';    
import BackLogs from '../screens/Student/Backlogs/Backlogs';

import MentorMenu from '../screens/Mentor/MentorMenu/Menu';
import MentorList from '../screens/Mentor/Mentorlist/Mentorlist';
import MentorlistDetails from '../screens/Mentor/Mentorlist/MentorlistDetail';
import MentorDisciplineLog from '../screens/Mentor/DisciplineLog/DisciplineLog';
import MentorSubjectMentor from '../screens/Mentor/SubjectMentor/SubjectMentor';
import MentorFreeHour from '../screens/Mentor/Freehour/Freehour';
import FreeHourDetail from '../screens/Mentor/Freehour/FreehourDetail';
import FreeHourAssign from '../screens/Mentor/Freehour/FreeHourAssign';

import ScheduleHome from '../screens/Schedule/ScheduleMenu/ScheduleHome';
import ScheduleDetails from '../screens/Schedule/ScheduleDetails/ScheduleDetails';

import CoordinatorHome from '../screens/Coordinator/CoordinatorHome/CoordinatorHome';
import CoordinatorList from '../screens/Coordinator/CoordinatorList/CoordinatorList';
import CoordinatorlistDetails from '../screens/Coordinator/CoordinatorList/CoordinatorlistDetails';
import CoordinatorEnrollment from '../screens/Coordinator/CoordinatorEnrollment/CoordinatorEnrollment';
import CoordinatorLeaveApproval from '../screens/Coordinator/CoordinatorLeaveApproval/LeaveApproval';
import LeaveApprovalHistory from '../screens/Coordinator/CoordinatorLeaveApproval/LeaveApprovalHistory';

import Logs from '../screens/Logs/Logs';

import Calendar from '../screens/Calendar/Calendar';

import Events from '../screens/Events/eventmain/Event'
import EventDetails from '../screens/Events/EventDetails/EventDetails';

import Test from '../screens/Mentor/DisciplineLog/Complaintsregister/Complaints'



const Stack = createStackNavigator();

const StudentStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="studenthome" component={StudentHome} />
    <Stack.Screen name="StudentList" component={StudentList} /> 
    <Stack.Screen name="StudentDetails" component={StudentDetails} /> 
    <Stack.Screen name="IssueLogs" component={Issuelog} /> 
    <Stack.Screen name="BackLogs" component={BackLogs} /> 
  </Stack.Navigator>
);

const MentorStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Mentormenu" component={MentorMenu} />
    <Stack.Screen name="Mentorlist" component={MentorList} />
    <Stack.Screen name="MentorlistDetails" component={MentorlistDetails} />
    <Stack.Screen name="MentorDisciplineLog" component={MentorDisciplineLog} />
    <Stack.Screen name="MentorSubjectMentor" component={MentorSubjectMentor} />
    <Stack.Screen name="MentorFreeHour" component={MentorFreeHour} />
    <Stack.Screen name="FreeHourDetail" component={FreeHourDetail} />
    <Stack.Screen name="FreeHourAssign" component={FreeHourAssign} />
  </Stack.Navigator>
);

const ScheduleStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ScheduleHome" component={ScheduleHome} />
    <Stack.Screen name="ScheduleDetails" component={ScheduleDetails} />
  </Stack.Navigator>
);

const CoordinatorStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CoordinatorHome" component={CoordinatorHome} />
    <Stack.Screen name="CoordinatorList" component={CoordinatorList} />
    <Stack.Screen name="CoordinatorlistDetails" component={CoordinatorlistDetails} />
    <Stack.Screen name="CoordinatorEnrollment" component={CoordinatorEnrollment} />
    <Stack.Screen name="CoordinatorLeaveApproval" component={CoordinatorLeaveApproval} />
    <Stack.Screen name="LeaveApprovalHistory" component={LeaveApprovalHistory} />
    {/* Add other screens here */}

  </Stack.Navigator>
);

const LogsStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Log" component={Logs} />
  </Stack.Navigator>)

const EventStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Eventmain" component={Events} />
    <Stack.Screen name="EventDetails" component={EventDetails} />
  </Stack.Navigator>
);

const Router = () => {
  return (
    <SafeAreaProvider style={{ backgroundColor: '#fafafa' }}>
      <Stack.Navigator initialRouteName='menu' screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Schools" component={Schools} />
        <Stack.Screen name="menu" component={Menu} />
        <Stack.Screen name="Student" component={StudentStackNavigator} />
        <Stack.Screen name="Mentor" component={MentorStackNavigator} />
        <Stack.Screen name="Schedule" component={ScheduleStackNavigator} />
        <Stack.Screen name="Coordinator" component={CoordinatorStackNavigator} />
        <Stack.Screen name="Logs" component={LogsStackNavigator} />
        <Stack.Screen name="Calendar" component={Calendar} />
        <Stack.Screen name="Event" component={EventStackNavigator} />
        <Stack.Screen name="test" component={Test} />
        

      </Stack.Navigator>
    </SafeAreaProvider>
  );
};

export default Router;
