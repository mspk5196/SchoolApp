import React from 'react';
import { NavigationContainer, useNavigationState } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// LoginPages
import Welcome from '../../pages/Login/Bit-schl-welcome-page/Welcome'
import Login from '../../pages/Login/Bit-schl-loginpage/Login';
import Redirect from '../Login/Redirect/Redirect';

//CoordinatorPages
import CoordinatorMenu from '../../pages/Coordinator/Menu/CoordinatorMenu';
import { ExamProvider } from '../../pages/Coordinator/Schedule/ExamSchedule/ExamContext';
import CoordinatorProfile from '../../pages/Coordinator/Profile/CoordinatorProfile';
import CoordinatorMentor from '../../pages/Coordinator/Mentor/MentorHome/CoordinatorMentor';
import CoordinatorStudentHome from '../../pages/Coordinator/Student/StudentHome/CoordinatorStudentHome';
import CoordinatorMaterialHome from '../../pages/Coordinator/Material/MaterialHomePage/CoordinatorMaterialHome';
import CoordinatorLogs from '../../pages/Coordinator/Logs/CoordinatorLogs';
import CoordinatorScheduleHome from '../../pages/Coordinator/Schedule/ScheduleHomePage/CoordinatorScheduleHome';
import CoordinatorEvent from '../../pages/Coordinator/Event/CoordinatorEvent';
import CoordinatorCalendar from '../../pages/Coordinator/Calender/CoordinatorCalendar';
import CoordinatorRequest from '../../pages/Coordinator/Request/CoordinatorRequest';
import CoordinatorEnrollmentHome from '../../pages/Coordinator/Enrollment/EnrollmentHome/CoordinatorEnrollmentHome';
import CoordinatorLeaveApply from '../../pages/Coordinator/Profile/CoordinatorLeaveApply';
import CoordinatorDisciplineLog from '../../pages/Coordinator/Mentor/DisciplineLog/CoordinatorDisciplineLog';
import CoordinatorLeaveApproval from '../../pages/Coordinator/Mentor/LeaveApproval/CoordinatorLeaveApproval';
import CoordinatorLeaveDetails from '../../pages/Coordinator/Mentor/LeaveApproval/CoordinatorLeaveDetails';
import CoordinatorMentorList from '../../pages/Coordinator/Mentor/MentorList/CoordinatorMentorList';
import CoordinatorMentorListDetails from '../../pages/Coordinator/Mentor/MentorList/CoordinatorMentorListDetails';
import CoordinatorMentorDetails from '../../pages/Coordinator/Mentor/MentorMapping/CoordinatorMentorDetails';
import CoordinatorMentorMapping from '../../pages/Coordinator/Mentor/MentorMapping/CoordinatorMentorMapping';
import CoordinatorSubjectMentor from '../../pages/Coordinator/Mentor/SubjectMentor/CoordinatorSubjectMentor';
import CoordinatorBackLogs from '../../pages/Coordinator/Student/BackLogs/CoordinatorBackLogs';
import CoordinatorConceptProgress from '../../pages/Coordinator/Student/ConceptGraph/CoordinatorConceptProgress';
import CoordinatorConceptGraph from '../../pages/Coordinator/Student/ConceptGraph/CoordinatorConceptGraph';
import CoordinatorAddConceptGraph from '../../pages/Coordinator/Student/ConceptGraph/CoordinatorAddConceptGraph';
import CoordinatorStudentDisciplineLog from '../../pages/Coordinator/Student/IssueLogs/CoordinatorStudentDisciplineLog';
import CoordinatorStudentProfile from '../../pages/Coordinator/Student/StudentProfile/CoordinatorStudentProfile';
import LevelPromotion from '../../pages/Coordinator/Material/LevelPromotion/LevelPromotion';
import SubjectPage from '../../pages/Coordinator/Material/Subject/SubjectPage';
import CoordinatorAcademicSchedule from '../../pages/Coordinator/Schedule/AcademicSchedule/CoordinatorAcademicSchedule';
import CoordinatorExamSchedule from '../../pages/Coordinator/Schedule/ExamSchedule/CoordinatorExamSchedule';
import CoordinatorInvigilationDuties from '../../pages/Coordinator/Schedule/InvigilationDuties/CoordinatorInvigilationDuties';
import CoordinatorWeeklySchedule from '../../pages/Coordinator/Schedule/WeeklySchedule/CoordinatorWeeklySchedule';
import AddEventForm from '../../pages/Coordinator/Event/AddEventForm';
import CoordinatorGeneralActivity from '../../pages/Coordinator/Request/CoordinatorGeneralActivity';
import CoordinatorRequestUpload from '../../pages/Coordinator/Request/CoordinatorRequestUpload';
import AddInfraEnrollment from '../../pages/Coordinator/Enrollment/InfrastructureEnrollment/AddInfraEnrollment';
import FilterPopup from '../../pages/Coordinator/Enrollment/InfrastructureEnrollment/FilterPopup';
import InfrastructureEnrollment from '../../pages/Coordinator/Enrollment/InfrastructureEnrollment/InfrastructureEnrollment';
import MentorEnrollment from '../../pages/Coordinator/Enrollment/MentorEnrollment/MentorEnrollment';
import StudentEnrollment from '../../pages/Coordinator/Enrollment/StudentEnrollment/StudentEnrollment';
import SubjectAllotment from '../../pages/Coordinator/Enrollment/SubjectActivityEnrollment/SubjectAllotment';
import { MenuProvider } from 'react-native-popup-menu';
import CoordinatorStudentProfileDetail from '../../pages/Coordinator/Student/StudentProfile/CoordinatorStudentProfile';

//Mentor Pages
import MentorHomepage from '../../pages/Mentor/MentorHomepage/MentorHomepage';
import MentorDashboard from '../../pages/Mentor/Dashboard/DashboardHome/MentorDashboard';
import MentorLeaveApproval from '../../pages/Mentor/LeaveApproval/MentorLeaveApproval';
import MentorHomework from '../../pages/Mentor/Homework/MentorHomework';
import MentorMessage from '../../pages/Mentor/Messages/MessageHome/MentorMessage';
import MentorActivity from '../../pages/Mentor/Activity/ActivityHome/MentorActivity';
import MentorAssesmentRequest from '../../pages/Mentor/AssesmentRequest/MentorAssesmentRequest';
import MentorMaterialHome from '../../pages/Mentor/Materials/MaterialHomePage/MentorMaterialHome';
import MentorDashboardAcademics from '../../pages/Mentor/Dashboard/Acadamics/MentorDashboardAcademics';
import MentorDashboardAssessment from '../../pages/Mentor/Dashboard/Assessment/MentorDashboardAssessment';
import MentorDashboardAttentions from '../../pages/Mentor/Dashboard/Attention/MentorDashboardAttentions';
import MentorStudentLeaveApprovalHistory from '../../pages/Mentor/LeaveApproval/MentorStudentLeaveApprovalHistory';
import MentorHomeworkList from '../../pages/Mentor/Homework/MentorHomeworkList';
import MentorMessageBox from '../../pages/Mentor/Messages/MessageBox/MentorMessageBox';
import MentorSendMessage from '../../pages/Mentor/Messages/SendMessage/MentorSendMessage';
import MentorBufferActivity from '../../pages/Mentor/Activity/BufferActivity/MentorBufferActivity';
import MentorDisciplineLog from '../../pages/Mentor/Activity/DiciplineLog/MentorDisciplineLog';
import MentorEmergencyLeave from '../../pages/Mentor/Activity/EmergencyLeave/MentorEmergencyLeave';
import MentorEmergencyLeaveHistory from '../../pages/Mentor/Activity/EmergencyLeave/MentorEmergencyLeaveHistory';
import MentorDisciplineLogRegister from '../../pages/Mentor/Activity/DiciplineLog/MentorDisciplineLogRegister';
import MentorGeneralActivity from '../../pages/Mentor/Activity/GeneralActivity/MentorGeneralActivity';
import MentorGenrealActivityRegister from '../../pages/Mentor/Activity/GeneralActivity/MentorGenrealActivityRegister';
import MentorSurvey from '../../pages/Mentor/Activity/Survey/MentorSurvey';
import MentorSurveyRegister from '../../pages/Mentor/Activity/Survey/MentorSurveyRegister';
import MentorAssessmentRequestRegister from '../../pages/Mentor/AssesmentRequest/MentorAssessmentRequestRegister';
import MentorSubjectPage from '../../pages/Mentor/Materials/Subject/MentorSubjectPage';
import MentorProfileDetails from '../../pages/Mentor/Profile/ProfileHome/MentorProfileDetails';
import MentorLeaveApply from '../../pages/Mentor/Profile/LeaveApply/MentorLeaveApply';
import MentorLeaveHistory from '../../pages/Mentor/Profile/LeaveApply/MentorLeaveHistory';
import MentorBufferActivityRegister from '../../pages/Mentor/Activity/BufferActivity/MentorBufferActivityRegister';



//ParentPages

import ParentRoute from './ParentRoute'
import StudentProfile from '../../pages/Parent/SidebarPages/ProfileScreen/StudentProfile';
import StudentPageEvent from '../../pages/Parent/SidebarPages/EventScreen/eventmain/StudentPageEvent';
import StudentPagePhonebook from '../../pages/Parent/SidebarPages/PhonebookScreen/StudentPagePhonebook';
import StudentPageRequest from '../../pages/Parent/SidebarPages/RequestScreen/StudentPageRequest';
import StudentPageSurvey from '../Parent/Survey/StudentPageSurvey';
import Setting from '../../pages/Parent/SidebarPages/SettingScreen/Setting';
import StudentLeaveapply from '../../pages/Parent/SidebarPages/LeaveapplyScreen/StudentLeaveapply';
import PerformanceDetailsScreen from '../../pages/Parent/ParentDashboard/PerformanceDetailsScreen';
import StudentCalendar from '../../pages/Parent/SidebarPages/CalendarScreen/StudentCalendar';
import StudentPageLeavedetails from '../../pages/Parent/SidebarPages/LeaveapplyScreen/StudentPageLeavedetails';
import StudentPageMessage from '../../pages/Parent/SidebarPages/PhonebookScreen/StudentPageMessage';
import StudentPageLikedEvents from '../../pages/Parent/SidebarPages/EventScreen/LikedEvents/StudentPageLikedEvents';
import CoordinatorStudentProfileDetails from '../../pages/Coordinator/Student/StudentProfile/CoordinatorStudentProfileDetails';

//AdminPages
import AdminMenu from '../../pages/Admin/Menu/AdminHomePage';
import AdminSchools from '../../pages/Admin/Schools/AdminSchools';
import AdminMentorMenu from '../../pages/Admin/Mentor/MentorMenu/AdminMentorMenu';
import AdminStudentHome from '../../pages/Admin/Student/Studenthome/AdminStudentHome';
import AdminLogs from '../../pages/Admin/Logs/AdminLogs';
import AdminScheduleHome from '../../pages/Admin/Schedule/ScheduleMenu/AdminScheduleHome';
import AdminEvent from '../../pages/Admin/Events/eventmain/AdminEvent';
import AdminCalendar from '../../pages/Admin/Calendar/AdminCalendar';
import AdminCoordinatorHome from '../../pages/Admin/Coordinator/CoordinatorHome/AdminCoordinatorHome';
import AdminSubjectMentor from '../../pages/Admin/Mentor/SubjectMentor/AdminSubjectMentor';
import AdminFreehour from '../../pages/Admin/Mentor/Freehour/AdminFreehour';
import AdminFreeHourAssign from '../../pages/Admin/Mentor/Freehour/AdminFreeHourAssign';
import AdminMentorlist from '../../pages/Admin/Mentor/Mentorlist/AdminMentorlist';
import AdminMentorlistDetail from '../../pages/Admin/Mentor/Mentorlist/AdminMentorlistDetail';
import AdminMentorDisciplineLog from '../../pages/Admin/Mentor/DisciplineLog/AdminMentorDisciplineLog';
import AdminFreehourDetail from '../../pages/Admin/Mentor/Freehour/AdminFreehourDetail';
import AdminStudentList from '../../pages/Admin/Student/StudentList/StudentList/AdminStudentList';
import AdminStudentDetails from '../../pages/Admin/Student/StudentList/StudentDetails/AdminStudentDetails';
import AdminStudentBacklogs from '../../pages/Admin/Student/Backlogs/AdminStudentBacklogs';
import AdminStudentIssuelog from '../../pages/Admin/Student/IssueLog/AdminStudentIssuelog';
import AdminScheduleDetails from '../../pages/Admin/Schedule/ScheduleDetails/AdminScheduleDetails';
import AdminCoordinatorList from '../../pages/Admin/Coordinator/CoordinatorList/AdminCoordinatorList';
import AdminCoordinatorlistDetails from '../../pages/Admin/Coordinator/CoordinatorList/AdminCoordinatorlistDetails';
import AdminCoordinatorEnrollment from '../../pages/Admin/Coordinator/CoordinatorEnrollment/AdminCoordinatorEnrollment';
import AdminLeaveApproval from '../../pages/Admin/Coordinator/CoordinatorLeaveApproval/AdminLeaveApproval';
import AdminLeaveApprovalHistory from '../../pages/Admin/Coordinator/CoordinatorLeaveApproval/AdminLeaveApprovalHistory';

const Stack = createStackNavigator();

const Routes = () => {

    return (
        <MenuProvider>
            <ExamProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>

                        {/* Login */}
                        <Stack.Screen name="Login" component={Login} options={{ headerLeft: () => null, headerShown: false }} />
                        <Stack.Screen name="Welcome" component={Welcome} options={{ headerLeft: () => null, headerShown: false }} />
                        <Stack.Screen name="Redirect" component={Redirect} options={{ headerLeft: () => null }} />
                        <Stack.Screen name="AdminMain" component={AdminMenu} />
                        <Stack.Screen name="CoordinatorMain" component={CoordinatorMenu} />
                        <Stack.Screen name="MentorMain" component={MentorHomepage} />
                        <Stack.Screen name="ParentRoute" component={ParentRoute} />


                        {/* Coordinator Page */}

                        {/* Coordinator Menus */}
                        <Stack.Screen name="CoordinatorProfile" component={CoordinatorProfile} />
                        <Stack.Screen name="CoordinatorMentor" component={CoordinatorMentor} />
                        <Stack.Screen name="CoordinatorStudent" component={CoordinatorStudentHome} />
                        <Stack.Screen name="CoordinatorMaterialHome" component={CoordinatorMaterialHome} />
                        <Stack.Screen name="CoordinatorLogs" component={CoordinatorLogs} />
                        <Stack.Screen name="CoordinatorScheduleHome" component={CoordinatorScheduleHome} />
                        <Stack.Screen name="CoordinatorEvent" component={CoordinatorEvent} />
                        <Stack.Screen name="CoordinatorCalendar" component={CoordinatorCalendar} />
                        <Stack.Screen name="CoordinatorRequest" component={CoordinatorRequest} />
                        <Stack.Screen name="CoordinatorEnrollmentHome" component={CoordinatorEnrollmentHome} />

                        {/* CoordinatorProfile */}
                        <Stack.Screen name="CoordinatorLeaveApply" component={CoordinatorLeaveApply} />
                        {/* CoordinatorMentor */}
                        <Stack.Screen name="CoordinatorDisciplineLog" component={CoordinatorDisciplineLog} />
                        <Stack.Screen name="CoordinatorLeaveApproval" component={CoordinatorLeaveApproval} />
                        <Stack.Screen name="CoordinatorLeaveDetails" component={CoordinatorLeaveDetails} />
                        <Stack.Screen name="CoordinatorMentorList" component={CoordinatorMentorList} />
                        <Stack.Screen name="CoordinatorMentorListDetails" component={CoordinatorMentorListDetails} />
                        <Stack.Screen name="CoordinatorMentorDetails" component={CoordinatorMentorDetails} />
                        <Stack.Screen name="CoordinatorMentorMapping" component={CoordinatorMentorMapping} />
                        <Stack.Screen name="CoordinatorSubjectMentor" component={CoordinatorSubjectMentor} />
                        {/* CoordinatorStudent */}
                        <Stack.Screen name="CoordinatorBackLogs" component={CoordinatorBackLogs} />
                        <Stack.Screen name="CoordinatorConceptProgress" component={CoordinatorConceptProgress} />
                        <Stack.Screen name="CoordinatorConceptGraph" component={CoordinatorConceptGraph} />
                        <Stack.Screen name="CoordinatorAddConceptGraph" component={CoordinatorAddConceptGraph} />
                        <Stack.Screen name="CoordinatorStudentDisciplineLog" component={CoordinatorStudentDisciplineLog} />
                        <Stack.Screen name="CoordinatorStudentProfile" component={CoordinatorStudentProfile} />
                        <Stack.Screen name="CoordinatorStudentProfileDetails" component={CoordinatorStudentProfileDetails} />
                        {/* CoordinatorMaterialHome */}
                        <Stack.Screen name="LevelPromotion" component={LevelPromotion} />
                        <Stack.Screen name="SubjectPage" component={SubjectPage} />
                        {/* CoordinatorLogs - Only one page*/}
                        {/* CoordinatorScheduleHome */}
                        <Stack.Screen name="CoordinatorAcademicSchedule" component={CoordinatorAcademicSchedule} />
                        <Stack.Screen name="CoordinatorExamSchedule" component={CoordinatorExamSchedule} />
                        <Stack.Screen name="CoordinatorInvigilationDuties" component={CoordinatorInvigilationDuties} />
                        <Stack.Screen name="CoordinatorWeeklySchedule" component={CoordinatorWeeklySchedule} />
                        {/* CoordinatorEvent */}
                        <Stack.Screen name="AddEventForm" component={AddEventForm} />
                        {/* CoordinatorRequest */}
                        <Stack.Screen name="CoordinatorGeneralActivity" component={CoordinatorGeneralActivity} />
                        <Stack.Screen name="CoordinatorRequestUpload" component={CoordinatorRequestUpload} />
                        {/* CoordinatorEnrollmentHome */}
                        <Stack.Screen name="AddInfraEnrollment" component={AddInfraEnrollment} />
                        <Stack.Screen name="FilterPopup" component={FilterPopup} />
                        <Stack.Screen name="InfrastructureEnrollment" component={InfrastructureEnrollment} />
                        <Stack.Screen name="MentorEnrollment" component={MentorEnrollment} />
                        <Stack.Screen name="StudentEnrollment" component={StudentEnrollment} />
                        <Stack.Screen name="SubjectAllotment" component={SubjectAllotment} />

                        {/* Mentor Pages */}
                        <Stack.Screen name="MentorDashboard" component={MentorDashboard} />
                        <Stack.Screen name="MentorStudentLeaveApproval" component={MentorLeaveApproval} />
                        <Stack.Screen name="MentorHomeworkList" component={MentorHomeworkList} />
                        <Stack.Screen name="MentorMessages" component={MentorMessage} />
                        <Stack.Screen name="MentorActivity" component={MentorActivity} />
                        <Stack.Screen name="MentorAssesmentRequest" component={MentorAssesmentRequest} />
                        <Stack.Screen name="MentorMaterialHome" component={MentorMaterialHome} />
                        <Stack.Screen name="MentorProfileDetails" component={MentorProfileDetails} />

                        {/* Mentor - Dashboard */}
                        <Stack.Screen name="MentorDashboardAcadamics" component={MentorDashboardAcademics} />
                        <Stack.Screen name="MentorDashboardAttentions" component={MentorDashboardAttentions} />
                        <Stack.Screen name="MentorDashboardAssessment" component={MentorDashboardAssessment} />
                        {/* Menntor Leave Approval - History */}
                        <Stack.Screen name="MentorStudentLeaveApprovalHistory" component={MentorStudentLeaveApprovalHistory} />
                        {/* Mentor  HomeWork*/}
                        <Stack.Screen name="MentorHomework" component={MentorHomework} />
                        {/* Mentor Messages */}
                        <Stack.Screen name="MentorMessageBox" component={MentorMessageBox} />
                        <Stack.Screen name="MentorSendMessage" component={MentorSendMessage} />
                        {/* Mentor Activity */}
                        <Stack.Screen name="MentorBufferActivity" component={MentorBufferActivity} />
                        <Stack.Screen name="MentorBufferActivityRegister" component={MentorBufferActivityRegister} />
                        <Stack.Screen name="MentorDisciplineLog" component={MentorDisciplineLog} />
                        <Stack.Screen name="MentorDisciplineLogRegister" component={MentorDisciplineLogRegister} />
                        <Stack.Screen name="MentorEmergencyLeave" component={MentorEmergencyLeave} />
                        <Stack.Screen name="MentorEmergencyLeaveHistory" component={MentorEmergencyLeaveHistory} />
                        <Stack.Screen name="MentorGeneralActivity" component={MentorGeneralActivity} />
                        <Stack.Screen name="MentorGenrealActivityRegister" component={MentorGenrealActivityRegister} />
                        <Stack.Screen name="MentorSurvey" component={MentorSurvey} />
                        <Stack.Screen name="MentorSurveyRegister" component={MentorSurveyRegister} />
                        {/* Mentor  Assessment*/}
                        <Stack.Screen name="MentorAssessmentRequestRegister" component={MentorAssessmentRequestRegister} />
                        {/* Mentor Materials */}
                        <Stack.Screen name="MentorSubjectPage" component={MentorSubjectPage} />
                        {/* Mentor Profile */}
                        <Stack.Screen name="MentorLeaveApply" component={MentorLeaveApply} />
                        <Stack.Screen name="MentorLeaveHistory" component={MentorLeaveHistory} />


                        {/* Parent Pages */}

                        {/* DashboardPages */}
                        {/* Performance */}
                        <Stack.Screen name="StudentPerformanceDetailsScreen" component={PerformanceDetailsScreen} />
                        {/* Survey */}
                        <Stack.Screen name="StudentPageSurvey" component={StudentPageSurvey} />

                        {/* SideBar Pages */}
                        {/* Profile */}
                        <Stack.Screen name="StudentPageProfile" component={StudentProfile} />
                        {/* Calendar */}
                        <Stack.Screen name="StudentPageCalendar" component={StudentCalendar} />
                        {/* Events */}
                        <Stack.Screen name="StudentPageEvents" component={StudentPageEvent} />
                        <Stack.Screen name="StudentPageLikedEvents" component={StudentPageLikedEvents} />
                        {/* Leave */}
                        <Stack.Screen name="StudentPageLeaveDetails" component={StudentPageLeavedetails} />
                        <Stack.Screen name="StudentPageLeaveApply" component={StudentLeaveapply} />
                        {/* PhoneBook */}
                        <Stack.Screen name="StudentPagePhonebook" component={StudentPagePhonebook} />
                        <Stack.Screen name="StudentPageMessage" component={StudentPageMessage} />
                        {/* Request */}
                        <Stack.Screen name="StudentPageRequest" component={StudentPageRequest} />
                        {/* Settings */}
                        <Stack.Screen name="StudentPageSettings" component={Setting} />
                        <Stack.Screen name="StudentPageEditProfile" component={Setting} />
                        <Stack.Screen name="StudentPageSecurity" component={Setting} />
                        <Stack.Screen name="StudentPageNotifications" component={Setting} />
                        <Stack.Screen name="StudentPagePrivacy" component={Setting} />
                        <Stack.Screen name="StudentPageHelp" component={Setting} />
                        <Stack.Screen name="StudentPageTerms" component={Setting} />
                        <Stack.Screen name="StudentPageReport" component={Setting} />
                        <Stack.Screen name="StudentPageAddAccount" component={Setting} />
                        

                        {/* AdminPages */}
                        <Stack.Screen name="AdminSchools" component={AdminSchools} />
                        <Stack.Screen name="AdminMentorHome" component={AdminMentorMenu} />
                        <Stack.Screen name="AdminStudentHome" component={AdminStudentHome} />
                        <Stack.Screen name="AdminLogs" component={AdminLogs} />
                        <Stack.Screen name="AdminScheduleHome" component={AdminScheduleHome} />
                        <Stack.Screen name="AdminEvent" component={AdminEvent} />
                        <Stack.Screen name="AdminCalendar" component={AdminCalendar} />
                        <Stack.Screen name="AdminCoordinatorHome" component={AdminCoordinatorHome} />

                        {/* Admin - Mentor */}
                        <Stack.Screen name="AdminSubjectMentor" component={AdminSubjectMentor} />
                        <Stack.Screen name="AdminFreeHour" component={AdminFreehour} />
                        <Stack.Screen name="AdminFreeHourAssign" component={AdminFreeHourAssign} />
                        <Stack.Screen name="AdminFreeHourDetail" component={AdminFreehourDetail} />
                        <Stack.Screen name="AdminMentorList" component={AdminMentorlist} />
                        <Stack.Screen name="AdminMentorListDetails" component={AdminMentorlistDetail} />
                        <Stack.Screen name="AdminMentorDisciplineLog" component={AdminMentorDisciplineLog} />
                        {/* Admin - Student */}
                        <Stack.Screen name="AdminStudentList" component={AdminStudentList} />
                        <Stack.Screen name="AdminStudentDetails" component={AdminStudentDetails} />
                        <Stack.Screen name="AdminStudentBacklogs" component={AdminStudentBacklogs} />
                        <Stack.Screen name="AdminStudentIssuelogs" component={AdminStudentIssuelog} />
                        {/* Admin - Schedule */}
                        <Stack.Screen name="AdminScheduleDetails" component={AdminScheduleDetails} />
                        {/* Admin - Coordinator */}
                        <Stack.Screen name="AdminCoordinatorList" component={AdminCoordinatorList} />
                        <Stack.Screen name="AdminCoordinatorlistDetails" component={AdminCoordinatorlistDetails} />
                        <Stack.Screen name="AdminCoordinatorEnrollment" component={AdminCoordinatorEnrollment} />
                        <Stack.Screen name="AdminLeaveApproval" component={AdminLeaveApproval} />
                        <Stack.Screen name="AdminLeaveApprovalHistory" component={AdminLeaveApprovalHistory} />

                    </Stack.Navigator>
                </NavigationContainer>
            </ExamProvider>
        </MenuProvider>
    )

}

export default Routes

