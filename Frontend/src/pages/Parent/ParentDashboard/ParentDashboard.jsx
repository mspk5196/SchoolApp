import React, { useState, useRef, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, Dimensions, Alert, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Progress from "react-native-progress";
import { useNavigation } from "@react-navigation/native";
import styles from "./ParentDashboardStyles";
// Import PerformanceGraph component
import PerformanceGraph from "../../../components/Parent/PerformanceGraph/PerformanceGraph";
//Icons
import ClockIcon from '../../../assets/ParentPage/DashboardIcons/clock.svg';
import StudentPageSurvey from "../../../components/Parent/Survey/StudentPageSurvey";
const Profile = require("../../../assets/ParentPage/LeaveIcon/profile.png")
import AsyncStorage from "@react-native-async-storage/async-storage";
import EventBus from "../../../utils/EventBus";
import { API_URL } from '@env'
import { format } from 'date-fns';


const ParentDashboard = () => {
  const navigation = useNavigation();
  const [currentSurveyIndex, setCurrentSurveyIndex] = useState(0);
  const scrollViewRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState([]);
  const [phoneNumber, setPhone] = useState(null);
  const [selectedStudentData, setSelectedStudent] = useState([])
  const [dailyAttendanceState, setDailyAttendance] = useState("0/0");

  const [pendingHomework, setPendingHomework] = useState([]);

  // Fetch phone number from AsyncStorage
  useEffect(() => {
    const fetchPhone = async () => {
      try {
        const storedPhone = await AsyncStorage.getItem("userPhone");
        if (storedPhone) {
          const parsedPhone = JSON.parse(storedPhone);
          setPhone(parsedPhone);
        }
      } catch (error) {
        console.error("Error fetching phone:", error);
      }
    };

    fetchPhone();

    // fetch(`${API_URL}/api/student/attendanceUpdater`, {method: "POST"})

  }, []);

  useEffect(() => {
    const getActiveUser = async () => {
      const savedUser = await AsyncStorage.getItem("activeUser");
      if (savedUser && studentData.length > 0) {
        const active = studentData.find(student => student.name === savedUser);
        if (active) {
          setSelectedStudent(active);
        }
      }
    };

    getActiveUser();

    EventBus.on("userToggled", getActiveUser);

    return () => {
      EventBus.off("userToggled", getActiveUser);
    };
  }, [studentData]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/getStudentData`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();
      // console.log("Student Data API Response:", data);  

      if (data.success && data.student) {
        setStudentData(data.student);
        setSelectedStudent(data.student[0])
        // console.log(selectedStudentData);

        await AsyncStorage.setItem("studentData", JSON.stringify(data.student));
      } else {
        Alert.alert("No Student Found", "No student is associated with this number");
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      Alert.alert("Error", "Failed to fetch student data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!phoneNumber) return;

    fetchStudentData();
  }, [phoneNumber]);

  const fetchDailyAttendance = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const response = await fetch(`${API_URL}/api/student/getSessionAttendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentData.student_id,
          date: today,
          sectionId: selectedStudentData.section_id,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setDailyAttendance(data.attendance || "0/0");
        // console.log("Daily Attendance API Response:", data);
      }
    } catch (error) {
      console.error("Error fetching daily attendance:", error);
    }
  };

  useEffect(() => {
    if (!selectedStudentData?.roll) return;

    fetchDailyAttendance();
  }, [selectedStudentData]);



  // Default userData structure if studentData is present
  const userData = studentData
    ? {
      name: selectedStudentData.name || "N/A",
      roll: selectedStudentData.roll,
      profile_photo: selectedStudentData.profile_photo || null,
      attendance: selectedStudentData.attendance_percentage,
      dailyAttendance: dailyAttendanceState,
    }
    : {};
  // console.log("User Data:", dailyAttendanceState);


  const surveyData = [
    { id: 1, name: "Ram Kumar", staffid: "7376232206", duration: "45 mins" },
    { id: 2, name: "Ram Kumar", staffid: "7376232206", duration: "30 mins" },
    { id: 3, name: "Ram Kumar", staffid: "7376232206", duration: "20 mins" },
    { id: 4, name: "Ram Kumar", staffid: "7376232206", duration: "15 mins" },
    { id: 5, name: "Ram Kumar", staffid: "7376232206", duration: "10 mins" },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long', 
      year: 'numeric'
    });
  };

  // Fetch pending homework when selectedStudentData changes 
  const fetchPendingHomework = async () => {
    // console.log(selectedStudentData?.roll);

    if (!selectedStudentData?.roll) return;
    try {
      const response = await fetch(`${API_URL}/api/student/getPendingHomework`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_roll: selectedStudentData.roll }),
      });
      const data = await response.json();
      if (data.success) {
        setPendingHomework(data.homework);
      } else {
        setPendingHomework([]);
      }
    } catch (error) {
      setPendingHomework([]);
      console.error("Error fetching pending homework:", error);
    }
  };
  useEffect(() => {
    fetchPendingHomework();
  }, [selectedStudentData]);

  const handleSurveyScroll = event => {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    const pageIndex = Math.floor(contentOffset.x / layoutMeasurement.width);
    setCurrentSurveyIndex(pageIndex);
  };

  // Calculate attendance ratio for circle chart
  const [attendanceRatio, setAttendanceRatio] = useState(0);
  useEffect(() => {
    if (userData.dailyAttendance) {
      const [present, total] = userData.dailyAttendance.split('/').map(Number);

      if (!isNaN(present) && !isNaN(total) && total > 0) {
        setAttendanceRatio(present / total);
      } else {
        setAttendanceRatio(0);
      }
    }
  }, [userData.dailyAttendance]);


  // console.log("Attendance Ratio:", attendanceRatio);


  const getProfileImageSource = (profilePath) => {
    if (profilePath) {
      // 1. Replace backslashes with forward slashes
      const normalizedPath = profilePath.replace(/\\/g, '/');
      // 2. Construct the full URL
      const fullImageUrl = `${API_URL}/${normalizedPath}`;
      return { uri: fullImageUrl };
    } else {
      return Profile;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container} refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={() => {
            setLoading(true);
            fetchStudentData()
            fetchPendingHomework()
          }}
        />
      }>
        <Text style={styles.dashboardTitle}>Dashboard</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : studentData ? (
          <View>
            {/* Profile Section - Updated for overlapping image */}
            <View style={styles.profileCard}>
              {/* Profile Image in absolute position to overlap the card border */}
              <View style={styles.profileDetails}>
                <View style={styles.profileImageWrapper}>
                  <Image source={getProfileImageSource(userData.profile_photo)} style={styles.profileImage} />
                </View>

                <View style={styles.profileInfo}>
                  <Text style={styles.userName}>{userData.name}</Text>
                  <Text style={styles.userroll}>{userData.roll}</Text>
                </View>
              </View>

              {/* Attendance section */}
              <View style={styles.attendanceContainer}>
                <View style={styles.attendanceRow}>
                  <View style={styles.attendanceInfo}>
                    <Text style={styles.attendanceLabel}>Attendance</Text>
                    <Text style={styles.attendancePercentage}>{userData.attendance}%</Text>
                  </View>
                  <Progress.Bar
                    progress={isNaN(parseFloat(userData.attendance)) ? 0 : parseFloat(userData.attendance) / 100}
                    width={150}
                    color="#27AE60"
                    height={8}
                    unfilledColor="#E0E0E0"
                    borderWidth={0}
                  />
                </View>

                <View style={styles.chartContainer}>
                  {/* Daily attendance circle chart */}
                  <Progress.Circle
                    size={41}
                    thickness={5}
                    progress={attendanceRatio}
                    color="#0C36FF"
                    unfilledColor="#FFFFFF"
                    borderWidth={0}
                    showsText={true}
                    formatText={() => userData.dailyAttendance}
                    textStyle={styles.attendanceCircleText}
                  />
                </View>
              </View>
            </View>

            {/* Survey Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Survey</Text>
              <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleSurveyScroll}
                scrollEventThrottle={16}
              >
                {surveyData.map((survey, index) => (
                  <View
                    key={survey.id}
                    style={[styles.surveyCard, { width: Dimensions.get('window').width - 32 }]}
                  >
                    <View style={styles.surveyTopRow}>
                      <Image
                        source={require("../../../assets/ParentPage/LeaveIcon/profile.png")}
                        style={styles.surveyImage}
                      />

                      <View style={styles.surveyInfo}>
                        <View style={styles.feedbackRow}>
                          <Text style={styles.surveyName}>{survey.name}</Text>
                          <Text style={styles.feedbackLabel}>Feedback</Text>
                        </View>

                        <View style={styles.feedbackRow}>
                          <Text>{survey.staffid}</Text>
                          <View style={styles.timeContainer}>
                            <View style={styles.timeIconContainer}>
                              <ClockIcon width={16} height={16} />
                            </View>
                            <Text style={styles.timeText}>{survey.duration}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.startNowButton} onPress={() => navigation.navigate('StudentPageSurvey')}>
                      <Text style={styles.startNowText}>Start now</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>

              {/* Survey Pagination Dots */}
              <View style={styles.paginationContainer}>
                {surveyData.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      index === currentSurveyIndex && styles.activeDot
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* Replace the Performance Graph section with the PerformanceGraph component */}
            <PerformanceGraph studentData={selectedStudentData} />

            {/* Homework Section */}
            <Text style={styles.sectionTitle}>Homework</Text>
            {pendingHomework.length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#888', marginVertical: 12 }}>No pending homework</Text>
            ) : (
              pendingHomework.map((item) => (
                <View key={item.id} style={[styles.homeworkCard, { marginBottom: 12 }]}>
                  <View style={styles.homeworkCardCol1}>
                    <Text style={styles.subject}>{item.subject_name}</Text>
                    <View style={styles.levelBadge}>
                      <Text style={styles.levelText}>Level {item.level}</Text>
                    </View>
                  </View>
                  <View style={styles.homeworkCardCol2}>
                    <Text style={styles.date}>{formatDate(item.date)}</Text>
                  </View>
                  <View style={styles.homeworkCardCol3}>
                    <TouchableOpacity style={styles.viewButtonContainer} onPress={()=>navigation.navigate("Materials")}>
                      <Text style={styles.viewButton}>View</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        ) : (<Text style={styles.errorText}>No student data available</Text>

        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ParentDashboard;