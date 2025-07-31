import React, { useState, useRef, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, Dimensions, Alert, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Progress from "react-native-progress";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import styles from "./ParentDashboardStyles";
import PerformanceGraph from "../../../components/Parent/PerformanceGraph/PerformanceGraph";
import ClockIcon from '../../../assets/ParentPage/DashboardIcons/clock.svg';
const Profile = require("../../../assets/ParentPage/LeaveIcon/profile.png");
import AsyncStorage from "@react-native-async-storage/async-storage";
import EventBus from "../../../utils/EventBus";
import { API_URL } from '../../../utils/env.js';
import { format } from 'date-fns';
import robustProfileImageHandler from '../../../utils/robustProfileImageHandler';

const ParentDashboard = () => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [currentSurveyIndex, setCurrentSurveyIndex] = useState(0);
    const scrollViewRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [studentData, setStudentData] = useState([]);
    const [phoneNumber, setPhone] = useState(null);
    const [selectedStudentData, setSelectedStudent] = useState(null);
    const [dailyAttendanceState, setDailyAttendance] = useState("0/0");

    const [pendingHomework, setPendingHomework] = useState([]);
    const [surveys, setSurveys] = useState([]);
    const [surveysLoading, setSurveysLoading] = useState(false);

    useEffect(() => {
        const fetchPhone = async () => {
            try {
                const storedPhone = await AsyncStorage.getItem("userPhone");
                if (storedPhone) setPhone(JSON.parse(storedPhone));
            } catch (error) {
                console.error("Error fetching phone:", error);
            }
        };
        fetchPhone();
    }, []);

    useEffect(() => {
        const getActiveUser = async () => {
            const savedUser = await AsyncStorage.getItem("activeUser");
            if (savedUser && studentData.length > 0) {
                const active = studentData.find(student => student.name === savedUser);
                setSelectedStudent(active || studentData[0]);
            } else if (studentData.length > 0) {
                setSelectedStudent(studentData[0]);
            }
        };

        getActiveUser();
        EventBus.on("userToggled", getActiveUser);
        return () => EventBus.off("userToggled", getActiveUser);
    }, [studentData]);

    const fetchStudentData = async () => {
        if (!phoneNumber) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/getStudentData`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phoneNumber }),
            });
            const data = await response.json();
            if (data.success && data.student) {
                setStudentData(data.student);
                await AsyncStorage.setItem("studentData", JSON.stringify(data.student));
            } else {
                Alert.alert("No Student Found", "No student is associated with this number");
            }
        } catch (error) {
            console.error("Error fetching student data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentData();
    }, [phoneNumber]);

    useEffect(() => {
        if (isFocused && selectedStudentData?.student_id) {
            fetchDailyAttendance();
            fetchPendingHomework();
            fetchSurveys();
        }
    }, [selectedStudentData, isFocused]);

    const fetchDailyAttendance = async () => {
        try {
            const today = format(new Date(), 'yyyy-MM-dd');
            const response = await fetch(`${API_URL}/api/student/getSessionAttendance`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId: selectedStudentData.student_id, date: today, sectionId: selectedStudentData.section_id }),
            });
            const data = await response.json();
            if (data.success) setDailyAttendance(data.attendance || "0/0");
        } catch (error) {
            console.error("Error fetching daily attendance:", error);
        }
    };

    const fetchPendingHomework = async () => {
        try {
            const response = await fetch(`${API_URL}/api/student/getPendingHomework`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ student_roll: selectedStudentData.roll }),
            });
            const data = await response.json();
            setPendingHomework(data.success ? data.homework : []);
        } catch (error) {
            console.error("Error fetching pending homework:", error);
        }
    };

    const fetchSurveys = async () => {
        if (!selectedStudentData?.student_id) return;
        setSurveysLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/student/getStudentSurveys?studentId=${selectedStudentData.student_id}`);
            const data = await response.json();
            if (data.success) {
                setSurveys(data.surveys);
            }
        } catch (error) {
            console.error("Error fetching surveys:", error);
        } finally {
            setSurveysLoading(false);
        }
    };

    const handleMarkAsRead = async (surveyId) => {
        try {
            const response = await fetch(`${API_URL}/api/student/markSurveyAsRead`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ surveyId: surveyId, studentId: selectedStudentData.student_id }),
            });
            const data = await response.json();
            if (data.success) {
                Alert.alert("Success", "Marked as read.");
                fetchSurveys(); // Refresh the list
            } else {
                throw new Error(data.message || "Failed to mark as read.");
            }
        } catch (error) {
            Alert.alert("Error", error.message);
        }
    };

    const onRefresh = () => {
        if (selectedStudentData?.student_id) {
            setLoading(true);
            Promise.all([fetchStudentData(), fetchDailyAttendance(), fetchPendingHomework(), fetchSurveys()]).finally(() => setLoading(false));
        }
    };

    const handleSurveyScroll = event => {
        const pageIndex = Math.floor(event.nativeEvent.contentOffset.x / (Dimensions.get('window').width - 32));
        setCurrentSurveyIndex(pageIndex);
    };

    const attendanceRatio = (() => {
        if (!dailyAttendanceState) return 0;
        const [present, total] = dailyAttendanceState.split('/').map(Number);
        return (!isNaN(present) && !isNaN(total) && total > 0) ? (present / total) : 0;
    })();

    // Use the robust profile image handler
    const getProfileImageSource = (profilePath) => {
        return robustProfileImageHandler(profilePath, Profile, API_URL);
    };

    if (loading) {
        return <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#0000ff" /></SafeAreaView>;
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}>
                <Text style={styles.dashboardTitle}>Dashboard</Text>
                {selectedStudentData ? (
                    <View>
                        <View style={styles.profileCard}>
                            <View style={styles.profileDetails}>
                                <View style={styles.profileImageWrapper}><Image source={getProfileImageSource(selectedStudentData.profile_photo)} style={styles.profileImage} /></View>
                                <View style={styles.profileInfo}>
                                    <Text style={styles.userName}>{selectedStudentData.name}</Text>
                                    <Text style={styles.userroll}>{selectedStudentData.roll}</Text>
                                </View>
                            </View>
                            <View style={styles.attendanceContainer}>
                                <View style={styles.attendanceRow}>
                                    <View style={styles.attendanceInfo}>
                                        <Text style={styles.attendanceLabel}>Attendance</Text>
                                        <Text style={styles.attendancePercentage}>{selectedStudentData.attendance_percentage || 0}%</Text>
                                    </View>
                                    <Progress.Bar progress={(selectedStudentData.attendance_percentage || 0) / 100} width={150} color="#27AE60" height={8} unfilledColor="#E0E0E0" borderWidth={0} />
                                </View>
                                <View style={styles.chartContainer}>
                                    <Progress.Circle size={41} thickness={5} progress={attendanceRatio} color="#0C36FF" unfilledColor="#FFFFFF" borderWidth={0} showsText={true} formatText={() => dailyAttendanceState} textStyle={styles.attendanceCircleText} />
                                </View>
                            </View>
                        </View>

                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>Survey</Text>
                            {surveysLoading ? <ActivityIndicator /> : surveys.length > 0 ? (
                                <>
                                    <ScrollView ref={scrollViewRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onScroll={handleSurveyScroll} scrollEventThrottle={16}>
                                        {surveys.map((survey) => (
                                                <View key={survey.id} style={[styles.surveyCard, { width: Dimensions.get('window').width - 32 }]}>
                                                    <View style={styles.surveyTopRow}>
                                                        <Image source={getProfileImageSource(survey.mentor_photo)} style={styles.surveyImage} />
                                                        <View style={styles.surveyInfo}>
                                                            <View style={styles.feedbackRow}><Text style={styles.surveyName}>{survey.mentor_name}</Text><Text style={styles.feedbackLabel}>{survey.task_type}</Text></View>
                                                            <View style={styles.feedbackRow}><Text>{survey.title}</Text></View>
                                                        </View>
                                                    </View>
                                                    <TouchableOpacity
                                                        style={[styles.startNowButton, (survey.completed) && styles.completedButton]}
                                                        disabled={survey.completed === 1}
                                                        onPress={() => {
                                                            if (survey.task_type === 'Feedback') navigation.navigate('StudentPageSurvey', { survey, studentId: selectedStudentData.student_id });
                                                            else handleMarkAsRead(survey.id);
                                                        }}>
                                                        <Text style={styles.startNowText}>
                                                            {survey.completed ? "Completed" : (survey.task_type === 'Feedback' ? "Start Feedback" : "Read")}
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                        ))}
                                    </ScrollView>
                                    <View style={styles.paginationContainer}>
                                        {surveys.map((_, index) => <View key={index} style={[styles.paginationDot, index === currentSurveyIndex && styles.activeDot]} />)}
                                    </View>
                                </>
                            ) : (
                                <Text style={styles.noDataText}>No active surveys available.</Text>
                            )}
                        </View>

                        <PerformanceGraph studentData={selectedStudentData} />

                        <Text style={styles.sectionTitle}>Homework</Text>
                        {pendingHomework.length > 0 ? pendingHomework.map((item) => (
                            <View key={item.id} style={[styles.homeworkCard, { marginBottom: 12 }]}>
                                <View style={styles.homeworkCardCol1}><Text style={styles.subject}>{item.subject_name}</Text><View style={styles.levelBadge}><Text style={styles.levelText}>Level {item.level}</Text></View></View>
                                <View style={styles.homeworkCardCol2}><Text style={styles.date}>{format(new Date(item.date), 'dd MMMM yyyy')}</Text></View>
                                <View style={styles.homeworkCardCol3}><TouchableOpacity style={styles.viewButtonContainer} onPress={() => navigation.navigate("Materials")}><Text style={styles.viewButton}>View</Text></TouchableOpacity></View>
                            </View>
                        )) : (
                            <Text style={{ textAlign: 'center', marginBottom: 20 }}>No pending homework.</Text>
                        )}
                    </View>
                ) : (
                    <Text style={styles.errorText}>Please select a student.</Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default ParentDashboard;