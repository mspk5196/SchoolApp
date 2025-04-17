import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

// Import screens
import Menu from '../screens/Menu/Menu';
// Uncomment these as you implement each screen
import ExamSchedule from '../screens/Schedule/ExamSchedule/ExamSchedule';
import ScheduleHome from '../screens/Schedule/ScheduleHomePage/ScheduleHome';
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
// import Calendar from '../screens/Calendar/Calendar';
// import Mentor from '../screens/Mentor/Mentor';
// import Student from '../screens/Student/Student';
// import Logs from '../screens/Logs/Logs';
// import Profile from '../screens/Profile/Profile';
// import Login from '../screens/Auth/Login';

const Stack = createStackNavigator();

const AppLayout = () => {
  return (
    <SafeAreaProvider>
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
            {/* <Stack.Screen
              name="Profile"
              component={Profile}
              options={{ headerShown: false }}
            /> */}
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

            {/*Logs*/}
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
          </Stack.Navigator>
        </NavigationContainer>
      </ExamProvider>
    </SafeAreaProvider>
  );
};

export default AppLayout;