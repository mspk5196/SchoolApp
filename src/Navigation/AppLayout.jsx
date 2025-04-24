import React from 'react';
import { MenuProvider } from 'react-native-popup-menu';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';


import MentorHomepage from '../../src/components/MentorHomepage/MentorHomepage';
import MentorDetails from '../../src/components/Mentordetailsfolder/mentordetails';

import Dashboard from '../../src/components/Dashboard/Dashboard';
import Academics from '../../src/components/Dashboard/Academics';
import Attentions from '../../src/components/Dashboard/Attentions';

import LeaveApproval from '../../src/components/LeaveApproval/LeaveApproval';
import LeaveApprovals from '../../src/components/LeaveApprovalHistory/LeaveApprovalHistory';

import LeaveApply from '../../src/components/leaveapplyfolder/leaveapply';
import LeaveApprovalHistory from '../../src/components/leaveapplyfolder/leavehistory';

import HomeworkList from '../../src/components/homeworkfolder/homeworklist';
import Homework from '../../src/components/homeworkfolder/homework';

import Message from '../../src/components/Message/Message';
import MessageBox from '../components/MessageBox/MessageBox';
import SendMessage from '../../src/components/SendMessage/SendMessage';

import Activity from '../../src/components/Activity/Activity';

import BufferActivity from '../../src/components/BufferActivity/BufferActivity';
import Buffact from '../../src/components/bufferfolder/bufferfolder';

import GeneralActivity from '../../src/components/GeneralActivity/GeneralActivity';
import Genact from '../../src/components/Genact/Genact';

import DisciplineLog from '../../src/components/DisciplineLog/DisciplineLog';
import DisciplineLogstudents from '../../src/components/DisciplineLogstudents/DisciplineLogstudents';

import EmergencyLeave from '../../src/components/EmergencyLeave/EmergencyLeave';
import EmergencyLeaveHistory from '../../src/components/EmergencyLeaveHistory/EmergencyLeaveHistory';

import Survey from '../../src/components/Survey/Survey';
import surveyfolder from '../../src/components/surveyfolder/surveyfolder';
import OTPVerification from '../../src/components/OTP verification/Verification';


import AssessmentRequest from '../../src/components/AssessmentRequest/AssessmentRequest';
import Assessment from '../../src/components/assessmentfolder/assessmentfolder';

import Materials from '../components/Materials/Materials';

import MaterialsUpdatedTamil1 from '../../src/components/MaterialsUpdatedTamil/MaterialsUpdatedTamil1';
import MaterialsUpdatedTamil2 from '../../src/components/MaterialsUpdatedTamil/MaterialsUpdatedTamil2';
import MaterialsUpdatedTamil3 from '../../src/components/MaterialsUpdatedTamil/MaterialsUpdatedTamil3';
import MaterialsUpdatedTamil4 from '../../src/components/MaterialsUpdatedTamil/MaterialsUpdatedTamil4';

import MaterialsUpdatedEnglish1 from '../../src/components/MaterialsUpdatedEnglish/MaterialsUpdatedEnglish1';
import MaterialsUpdatedEnglish2 from '../../src/components/MaterialsUpdatedEnglish/MaterialsUpdatedEnglish2';
import MaterialsUpdatedEnglish3 from '../../src/components/MaterialsUpdatedEnglish/MaterialsUpdatedEnglish3';
import MaterialsUpdatedEnglish4 from '../../src/components/MaterialsUpdatedEnglish/MaterialsUpdatedEnglish4';

import MaterialsUpdatedMaths1 from '../../src/components/MaterialsUpdatedMaths/MaterialsUpdatedMaths1';
import MaterialsUpdatedMaths2 from '../../src/components/MaterialsUpdatedMaths/MaterialsUpdatedMaths2';
import MaterialsUpdatedMaths3 from '../../src/components/MaterialsUpdatedMaths/MaterialsUpdatedMaths3';
import MaterialsUpdatedMaths4 from '../../src/components/MaterialsUpdatedMaths/MaterialsUpdatedMaths4';

import MaterialsUpdatedScience1 from '../../src/components/MaterialsUpdatedScience/MaterialsUpdatedScience1';
import MaterialsUpdatedScience2 from '../../src/components/MaterialsUpdatedScience/MaterialsUpdatedScience2';
import MaterialsUpdatedScience3 from '../../src/components/MaterialsUpdatedScience/MaterialsUpdatedScience3';
import MaterialsUpdatedScience4 from '../../src/components/MaterialsUpdatedScience/MaterialsUpdatedScience4';

import MaterialsUpdatedSocial1 from '../../src/components/MaterialsUpdatedSocial/MaterialsUpdatedSocial1';
import MaterialsUpdatedSocial2 from '../../src/components/MaterialsUpdatedSocial/MaterialsUpdatedSocial2';
import MaterialsUpdatedSocial3 from '../../src/components/MaterialsUpdatedSocial/MaterialsUpdatedSocial3';
import MaterialsUpdatedSocial4 from '../../src/components/MaterialsUpdatedSocial/MaterialsUpdatedSocial4';



const Stack = createStackNavigator();

const AppLayout = () => {
    return(
        <SafeAreaProvider>
            <MenuProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName="MentorHomepage">
                        
                        <Stack.Screen
                            name="MentorHomepage"
                            component={MentorHomepage}
                            options={{ headerShown: false }}
                        />

                        <Stack.Screen
                            name="MentorDetails"
                            component={MentorDetails}
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="Dashboard"
                            component={Dashboard}
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="Academics"
                            component={Academics}
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="Attentions"
                            component={Attentions}
                            options={{headerShown:false}}
                        />                        

                        <Stack.Screen
                            name="LeaveApproval"
                            component={LeaveApproval}
                            options={{headerShown:false}}
                        />         

                        <Stack.Screen 
                            name="LeaveApprovals"
                            component={LeaveApprovals}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen 
                            name="LeaveApply"
                            component={LeaveApply}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen 
                            name="LeaveApprovalHistory"
                            component={LeaveApprovalHistory}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="HomeworkList"
                            component={HomeworkList}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="Homework"
                            component={Homework}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="Message"
                            component={Message}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="SendMessage"
                            component={SendMessage}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="MessageBox"
                            component={MessageBox}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="Activity"
                            component={Activity}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="BufferActivity"
                            component={BufferActivity}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="Buffact"
                            component={Buffact}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="GeneralActivity"
                            component={GeneralActivity}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="Genact"
                            component={Genact}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="DisciplineLog"
                            component={DisciplineLog}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="DisciplineLogstudents"
                            component={DisciplineLogstudents}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="EmergencyLeave"
                            component={EmergencyLeave}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="EmergencyLeaveHistory"
                            component={EmergencyLeaveHistory}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="Survey"
                            component={Survey}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="surveyfolder"
                            component={surveyfolder}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="OTPVerification"
                            component={OTPVerification}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="AssessmentRequest"
                            component={AssessmentRequest}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="Assessment"
                            component={Assessment}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="Materials"
                            component={Materials}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="MaterialsUpdatedTamil1"
                            component={MaterialsUpdatedTamil1}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="MaterialsUpdatedTamil2"
                            component={MaterialsUpdatedTamil2}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen   
                            name="MaterialsUpdatedTamil3"
                            component={MaterialsUpdatedTamil3}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="MaterialsUpdatedTamil4"
                            component={MaterialsUpdatedTamil4}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="MaterialsUpdatedEnglish1"
                            component={MaterialsUpdatedEnglish1}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="MaterialsUpdatedEnglish2"
                            component={MaterialsUpdatedEnglish2}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen   
                            name="MaterialsUpdatedEnglish3"
                            component={MaterialsUpdatedEnglish3}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="MaterialsUpdatedEnglish4"
                            component={MaterialsUpdatedEnglish4}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="MaterialsUpdatedMaths1"
                            component={MaterialsUpdatedMaths1}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="MaterialsUpdatedMaths2"
                            component={MaterialsUpdatedMaths2}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen   
                            name="MaterialsUpdatedMaths3"
                            component={MaterialsUpdatedMaths3}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="MaterialsUpdatedMaths4"
                            component={MaterialsUpdatedMaths4}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="MaterialsUpdatedScience1"
                            component={MaterialsUpdatedScience1}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="MaterialsUpdatedScience2"
                            component={MaterialsUpdatedScience2}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen   
                            name="MaterialsUpdatedScience3"
                            component={MaterialsUpdatedScience3}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="MaterialsUpdatedScience4"
                            component={MaterialsUpdatedScience4}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="MaterialsUpdatedSocial1"
                            component={MaterialsUpdatedSocial1}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="MaterialsUpdatedSocial2"
                            component={MaterialsUpdatedSocial2}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen   
                            name="MaterialsUpdatedSocial3"
                            component={MaterialsUpdatedSocial3}   
                            options={{headerShown:false}}
                        />

                        <Stack.Screen
                            name="MaterialsUpdatedSocial4"
                            component={MaterialsUpdatedSocial4}   
                            options={{headerShown:false}}
                        />

                    </Stack.Navigator>
                </NavigationContainer>
            </MenuProvider>
        </SafeAreaProvider>
    )
}

export default AppLayout;