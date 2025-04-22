import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { MenuProvider } from 'react-native-popup-menu';

// Import screens
import Menu from '../screens/Menu/Menu';
// Uncomment these as you implement each screen
import ExamSchedule from '../screens/Schedule/ExamSchedule/ExamSchedule';
import ScheduleHome from '../screens/Schedule/ScheduleHome/ScheduleHome';
import InvigilationDuties from '../screens/Schedule/InvigilationDuties/InvigilationDuties';
import AcademicSchedule from '../screens/Schedule/AcademicSchedule/AcademicSchedule';
import WeeklySchedule from '../screens/Schedule/WeeklySchedule/WeeklySchedule';
import { ExamProvider } from '../screens/Schedule/ExamSchedule/ExamContext';

import MaterialHome from '../screens/Material/MaterialHomePage/MaterialHome';
import Tamil from '../screens/Material/Tamil/Tamil';
import English from '../screens/Material/English/English';
import Mathematics from '../screens/Material/Mathematics/Mathematics';
import Science from '../screens/Material/Science/Science';
import SocialScience from '../screens/Material/SocialScience/SocialScience';
import LevelPromotion from '../screens/Material/LevelPromotion/LevelPromotion';

import RequestHome from '../screens/Request/Request';
import GeneralActivity from '../screens/Request/GeneralActivity';
import RequestUpload from '../screens/Request/RequestUpload';

import Event from '../screens/Event/Event';
import AddEventForm from '../screens/Event/AddEventForm';

import Logs from '../screens/Logs/Logs';

import EnrollmentHome from '../screens/Enrollment/EnrollmentHome/EnrollmentHome';
import StudentEnrollment from '../screens/Enrollment/StudentEnrollment/StudentEnrollment';
import MentorEnrollment from '../screens/Enrollment/MentorEnrollment/MentorEnrollment';
import SubjectAllotment from '../screens/Enrollment/SubjectActivityEnrollment/SubjectAllotment';
import InfrastructureEnrollment from '../screens/Enrollment/InfrastructureEnrollment/InfrastructureEnrollment';
import AddInfraEnrollment from '../screens/Enrollment/InfrastructureEnrollment/AddInfraEnrollment';


import Calendar from '../screens/Calender/Calendar';

import Mentor from '../screens/Mentor/MentorHome/Mentor';
import SubjectMentor from '../screens/Mentor/SubjectMentor/SubjectMentor';
import MentorMapping from '../screens/Mentor/MentorMapping/MentorMapping';
import MentorDetails from '../screens/Mentor/MentorMapping/MentorDetails';
import MentorList from '../screens/Mentor/MentorList/MentorList';
import MentorListDetails from '../screens/Mentor/MentorList/MentorListDetails';
import DisciplineLog from '../screens/Mentor/DisciplineLog/DisciplineLog';
import LeaveApproval from '../screens/Mentor/LeaveApproval/LeaveApproval';
import LeaveDetails from '../screens/Mentor/LeaveApproval/LeaveDetails';



import Student from '../screens/Student/StudentHome/StudentHome';
import StudentProfile from '../screens/Student/StudentProfile/StudentProfile';
import StudentDetails from '../screens/Student/StudentProfile/StudentProfileDetail';
import IssueLogs from '../screens/Student/IssueLogs/StudentDisciplineLog';
import BackLogs from '../screens/Student/BackLogs/BackLogs';
import ConceptGraph from '../screens/Student/ConceptGraph/ConceptGraph';
import ConceptProgress from '../screens/Student/ConceptGraph/ConceptProgress';
import AddConceptGraph from '../screens/Student/ConceptGraph/AddConceptGraph';


import Profile from '../screens/Profile/Profile';
import LeaveApply from '../screens/Profile/LeaveApply';
// import Login from '../screens/Auth/Login';

const Stack = createStackNavigator();

const AppLayout = () => {
  return (
    <SafeAreaProvider>
      <MenuProvider>
        <ExamProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Menu">
              {/* Auth screens */}
              {/* <Stack.Screen
                name="Login"
                component={Login}
                options={{ headerShown: false }}
              /> */}
            
              {/* Main Menu */}
              <Stack.Screen
                name="Menu"
                component={Menu}
                options={{ headerShown: false }}
              />
              
              {/* Profile */}
               <Stack.Screen
                name="Profile"
                component={Profile}
                options={{ headerShown: false }}
              /> 
              
              <Stack.Screen
                name="LeaveApply"
                component={LeaveApply}
                options={{ headerShown: false }}
               />
              
              {/* Schedule screens */}
              <Stack.Screen
                name="ScheduleHome"
                component={ScheduleHome}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ExamSchedule"
                component={ExamSchedule}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="InvigilationDuties"
                component={InvigilationDuties}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="AcademicSchedule"
                component={AcademicSchedule}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="WeeklySchedule"
                component={WeeklySchedule}
                options={{ headerShown: false }}
              />
              
              {/* Material screens */}
              <Stack.Screen
                name="MaterialHome"
                component={MaterialHome}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Tamil" 
                component={Tamil} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="English" 
                component={English} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Mathematics" 
                component={Mathematics} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Science" 
                component={Science} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="SocialScience" 
                component={SocialScience} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="LevelPromotion" 
                component={LevelPromotion} 
                options={{ headerShown: false }}
              />
              
              {/* Request screens */}
              <Stack.Screen
                name="RequestHome"
                component={RequestHome}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="GeneralActivity"
                component={GeneralActivity}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="RequestUpload"
                component={RequestUpload}
                options={{ headerShown: false }}
              />
              
              {/* Events and Calendar */}
              <Stack.Screen
                name="Event"
                component={Event}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="AddEventForm"
                component={AddEventForm}
                options={{ headerShown: false }}
              />

              {/* Logs */}
              <Stack.Screen
                name="Logs"
                component={Logs}
                options={{ headerShown: false }}
              />

              {/* Enrollment */}
              <Stack.Screen
                name="EnrollmentHome"
                component={EnrollmentHome}
                options={{ headerShown: false }}
              /> 
              <Stack.Screen
                name="StudentEnrollment"
                component={StudentEnrollment}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="MentorEnrollment"
                component={MentorEnrollment}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="SubjectAllotment"
                component={SubjectAllotment}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="InfrastructureEnrollment"
                component={InfrastructureEnrollment}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="AddInfraEnrollment"
                component={AddInfraEnrollment}
                options={{ headerShown: false }}
              />

              {/* Student */}
              <Stack.Screen
                name="Student"
                component={Student}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="StudentProfile"
                component={StudentProfile}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="StudentDetails"
                component={StudentDetails}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="IssueLogs"
                component={IssueLogs}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="BackLogs"
                component={BackLogs}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ConceptGraph"
                component={ConceptGraph}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ConceptProgress"
                component={ConceptProgress}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="AddConceptGraph"
                component={AddConceptGraph}
                options={{ headerShown: false }}
              />

              {/* Mentor */}
              <Stack.Screen
                name="Mentor"
                component={Mentor}
                options={{ headerShown: false }}
              />
              <Stack.Screen name="SubjectMentor" component={SubjectMentor}  options={{headerShown:false}}/>
          <Stack.Screen name="MentorMapping" component={MentorMapping} options={{headerShown:false}}/>
          <Stack.Screen name="MentorDetails" component={MentorDetails} options={{headerShown:false}} />
          <Stack.Screen name="MentorList" component={MentorList} options={{headerShown:false}} />
          <Stack.Screen name="MentorListDetails" component={MentorListDetails} options={{headerShown:false}} />
          <Stack.Screen name="DisciplineLog" component={DisciplineLog} options={{headerShown:false}} />
          <Stack.Screen name="LeaveApproval" component={LeaveApproval} options={{headerShown:false}} />
          <Stack.Screen name="LeaveDetails" component={LeaveDetails} options={{headerShown:false}} />


              {/* Calendar */}
              <Stack.Screen
                name="Calendar"
                component={Calendar}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </ExamProvider>
      </MenuProvider>
    </SafeAreaProvider>
  );
};

export default AppLayout;