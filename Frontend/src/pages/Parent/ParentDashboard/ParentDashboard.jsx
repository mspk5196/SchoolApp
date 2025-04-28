import React, { useState, useRef, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, Dimensions, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Progress from "react-native-progress";
import { useNavigation } from "@react-navigation/native";
import styles from "./ParentDashboardStyles";
// Import PerformanceGraph component
import PerformanceGraph from "../../../components/Parent/PerformanceGraph/PerformanceGraph";
//Icons
import ClockIcon from '../../../assets/ParentPage/DashboardIcons/clock.svg';
import StudentPageSurvey from "../../../components/Parent/Survey/StudentPageSurvey";
import AsyncStorage from "@react-native-async-storage/async-storage";
import EventBus from "../../../utils/EventBus";
import { API_URL } from '@env'

const ParentDashboard = () => {
  const navigation = useNavigation();
  const [currentSurveyIndex, setCurrentSurveyIndex] = useState(0);
  const scrollViewRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState([]);
  const [phoneNumber, setPhone] = useState(null);
  const [selectedStudentData, setSelectedStudent] = useState([])

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


  useEffect(() => {
    if (!phoneNumber) return;

    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/getStudentData`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber }),
        });

        const data = await response.json();
        console.log("Student Data API Response:", data);

        if (data.success && data.student) {
          setStudentData(data.student);
          setSelectedStudent(data.student[0])
          console.log(selectedStudentData);

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

    fetchStudentData();
  }, [phoneNumber]);

  // Default userData structure if studentData is present
  const userData = studentData
    ? {
      name: selectedStudentData.name || "N/A",
      roll: selectedStudentData.roll,
      attendance: 50,
      dailyAttendance: "8/8",
    }
    : {};


  const surveyData = [
    { id: 1, name: "Ram Kumar", staffid: "7376232206", duration: "45 mins" },
    { id: 2, name: "Ram Kumar", staffid: "7376232206", duration: "30 mins" },
    { id: 3, name: "Ram Kumar", staffid: "7376232206", duration: "20 mins" },
    { id: 4, name: "Ram Kumar", staffid: "7376232206", duration: "15 mins" },
    { id: 5, name: "Ram Kumar", staffid: "7376232206", duration: "10 mins" },
  ];

  const homeworkData = [
    { id: 1, subject: "Science", level: "Level 2", date: "22/02/25", duration: "45 mins", details: "Complete exercises 1-5 from Chapter 3" },
    { id: 2, subject: "Social", level: "Level 2", date: "23/02/25", duration: "45 mins", details: "Read Chapter 4 and answer the questions" },
  ];

  const handleSurveyScroll = event => {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    const pageIndex = Math.floor(contentOffset.x / layoutMeasurement.width);
    setCurrentSurveyIndex(pageIndex);
  };

  // Calculate attendance ratio for circle chart
  const attendanceParts = userData.dailyAttendance.split('/');
  const attendanceRatio = parseInt(attendanceParts[0]) / parseInt(attendanceParts[1]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
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
                  <Image
                    source={require("../../../assets/ParentPage/LeaveIcon/profile.png")}
                    style={styles.profileImage}
                  />
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
                    progress={userData.attendance / 100}
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
            <PerformanceGraph />

            {/* Homework Section */}
            <Text style={styles.sectionTitle}>Homework</Text>
            {homeworkData.map((item) => (
              <View key={item.id} style={[styles.homeworkCard, { marginBottom: 12 }]}>
                <View style={styles.homeworkCardCol1}>
                  <Text style={styles.subject}>{item.subject}</Text>
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>{item.level}</Text>
                  </View>
                </View>

                <View style={styles.homeworkCardCol2}>
                  <Text style={styles.date}>{item.date}</Text>
                  <View style={styles.homeworkActions}>
                    <View style={styles.homeworkDuration}>
                      <View style={styles.durationIconContainer}>
                        <ClockIcon width={16} height={16} />
                      </View>
                      <Text style={styles.timeText}>{item.duration}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.homeworkCardCol3}>
                  <TouchableOpacity
                    style={styles.viewButtonContainer}
                  >
                    <Text style={styles.viewButton}>View</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (<Text style={styles.errorText}>No student data available</Text>

        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ParentDashboard;