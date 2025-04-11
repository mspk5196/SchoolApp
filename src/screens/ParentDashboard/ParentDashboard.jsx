import React from "react";
import { View, Text, Image, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProgressChart } from "react-native-chart-kit";
import * as Progress from "react-native-progress";
import { useNavigation } from "@react-navigation/native";
import styles from "./ParentDashboardStyles";

const ParentDashboard = () => {
  const navigation = useNavigation();

  // Sample Data
  const userData = {
    name: "Ram Kumar",
    phone: "7376232206",
    attendance: 50,
    dailyAttendance: "8/8",
  };

  const performanceData = [
    { id: 1, day: "Day 8", academic: 53, homework: 20, dayNumber: 4 },
    { id: 2, day: "Day 9", academic: 55, homework: 20, dayNumber: 5 },
    { id: 3, day: "Day 10", academic: 60, homework: 20, dayNumber: 6 },
    { id: 4, day: "Today", academic: 50, homework: 20, dayNumber: 7 },
    { id: 5, day: "Day 12", academic: 0, homework: 0, dayNumber: 8 },
    { id: 6, day: "Day 13", academic: 0, homework: 0, dayNumber: 9 },
    { id: 7, day: "Day 14", academic: 0, homework: 0, dayNumber: 10 },
  ];

  const homeworkData = [
    { id: 1, subject: "Science", level: "Level 2", date: "22/02/25", duration: "45 mins" },
    { id: 2, subject: "Social", level: "Level 2", date: "23/02/25", duration: "45 mins" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileCard}>
        <Image 
          source={require("../../assets/LeaveIcon/profile.png")} 
          style={styles.profileImage} 
        />
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.userPhone}>{userData.phone}</Text>
          <View style={styles.attendanceRow}>
            <Text style={styles.attendanceLabel}>Attendance</Text>
            <Progress.Bar 
              progress={userData.attendance / 100} 
              width={50} 
              color="#27ae60" 
            />
            <Text style={styles.attendancePercentage}>{userData.attendance}%</Text>
          </View>
        </View>
        <View style={styles.chartContainer}>
          <ProgressChart
            data={{ 
              data: [
                parseInt(userData.dailyAttendance.split('/')[0]) / 
                parseInt(userData.dailyAttendance.split('/')[1])
              ] 
            }}
            width={54}
            height={54}
            strokeWidth={8}
            radius={20}
            chartConfig={{ 
              backgroundGradientFrom: "#fff", 
              backgroundGradientTo: "#fff",
              color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            hideLegend
          />
          <Text style={styles.hourlyAttendance}>{userData.dailyAttendance}</Text>
        </View>
      </View>

      {/* Survey Section */}
      <TouchableOpacity style={styles.surveyCard}>
        <Image 
          source={require("../../assets/LeaveIcon/profile.png")} 
          style={styles.surveyImage} 
        />
        <View style={styles.surveyInfo}>
          <Text style={styles.surveyName}>{userData.name}</Text>
          <Text style={styles.surveyFeedback}>Feedback • 45 mins</Text>
        </View>
        <TouchableOpacity style={styles.startButton}>
          <Text style={styles.startButtonText}>Start Now</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Performance Graph */}
      <Text style={styles.sectionTitle}>Performance Graph</Text>
      <View style={styles.performanceGraphTabs}>
        <TouchableOpacity style={styles.performanceTab}>
          <Text style={styles.performanceTabText}>Monthly</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.performanceTab}>
          <Text style={styles.performanceTabText}>Overall</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.performanceTab, styles.activePerformanceTab]}>
          <Text style={[styles.performanceTabText, styles.activePerformanceTabText]}>Tamil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.performanceTab}>
          <Text style={styles.performanceTabText}>English</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.performanceTab}>
          <Text style={styles.performanceTabText}>Math</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        data={performanceData}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.barContainer}
            onPress={() => navigation.navigate("PerformanceDetailsScreen", { data: item })}
          >
            <View style={[
              styles.bar, 
              { height: `${item.homework}%`, backgroundColor: '#e74c3c' }
            ]} />
            <View style={[
              styles.bar, 
              { height: `${item.academic}%`, backgroundColor: '#3498db' }
            ]} />
            <Text style={styles.barLabel}>{item.day}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Homework Section */}
      <Text style={styles.sectionTitle}>Homework</Text>
      {homeworkData.map((item) => (
        <View key={item.id} style={styles.homeworkCard}>
          <View style={styles.homeworkCardHeader}>
            <Text style={styles.subject}>{item.subject}</Text>
            <Text style={styles.level}>{item.level}</Text>
          </View>
          <View style={styles.homeworkCardFooter}>
            <Text style={styles.date}>{item.date}</Text>
            <View style={styles.homeworkDuration}>
              <Text style={styles.durationText}>{item.duration}</Text>
              <TouchableOpacity style={styles.viewButtonContainer}>
                <Text style={styles.viewButton}>View</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </SafeAreaView>
  );
};

export default ParentDashboard;