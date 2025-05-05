import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import Grade from     '../../../../../assets/AdminPage/StudentHome/StudentProfileDetails/grade.svg';
import Mentorimg from '../../../../../assets/AdminPage/StudentHome/StudentProfileDetails/mentor2.svg';
import Numdays from   '../../../../../assets/AdminPage/StudentHome/StudentProfileDetails/numdays.svg';
import Clock from     '../../../../../assets/AdminPage/StudentHome/StudentProfileDetails/clock.svg';
import Leaveday from  '../../../../../assets/AdminPage/StudentHome/StudentProfileDetails/leaveday.svg';
import Exchange from  '../../../../../assets/AdminPage/StudentHome/StudentProfileDetails/exchange.svg';
import BackIcon from  '../../../../../assets/AdminPage/StudentHome/StudentProfileDetails/leftarrow.svg';
import styles from './StudentDetailsStyles';
import PerformanceGraph from '../../../../../components/Admin/performancegraph/Performancegraph';
import Homeicon from         '../../../../../assets/AdminPage/Basicimg/Home.svg';

const AdminStudentDetails = ({navigation, route}) => {
  const {student} = route.params || {};

  // Achievement data
  const achievementData = {
    currentPoints: 112,
    nextLevelPoints: 200,
    currentLevel: 0,
    badges: [
      {name: 'Perfect Attendance', earned: true},
      {name: 'Math Master', earned: true},
      {name: 'Science Explorer', earned: false},
    ],
    recentAchievements: [
      {title: 'Completed 5 homework assignments', points: 25, date: '15 Apr'},
      {title: 'Perfect score in Math quiz', points: 40, date: '10 Apr'},
    ],
  };

  // Calculate progress percentage
  const achievementProgress =
    (achievementData.currentPoints / achievementData.nextLevelPoints) * 100;
  const pointsRemaining =
    achievementData.nextLevelPoints - achievementData.currentPoints;

  // Subject mentors data
  const mentors = [
    {subject: 'Tamil', name: 'Ram Kumar'},
    {subject: 'Tamil', name: 'Ram Kumar'},
    {subject: 'English', name: 'Ram Kumar'},
    // Add more mentors as needed
  ];

  const TARGET_LEVEL = 20;
const TODAY = new Date();

const subjectsData = [
  { 
    label: 'Tamil', 
    currentLevel: 22,
    targetDate: new Date('2025-05-15'),
  },
  { 
    label: 'English', 
    currentLevel: 15,
    targetDate: new Date('2025-05-15'),
  },
  { 
    label: 'Maths', 
    currentLevel: 28,
    targetDate: new Date('2025-05-15'),
  },
  { 
    label: 'Science', 
    currentLevel: 25,
    targetDate: new Date('2025-05-15'),
  },
  { 
    label: 'Social', 
    currentLevel: 20,
    targetDate: new Date('2025-05-15'),
  },
  { 
    label: 'History', 
    currentLevel: 8,
    targetDate: new Date('2025-05-15'),
  },
];

  // Y-axis labels
//   const yAxisLabels = [25, 20, 15, 10, 5];

//   // Calculate bar heights - scale factor to convert data values to pixel heights
//   const maxValue = 25; // Maximum value on Y axis
//   const maxHeight = 180; // Maximum height in pixels for the bars
//   const scaleFactor = maxHeight / maxValue;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackIcon
          width={styles.BackIcon.width}
          height={styles.BackIcon.height}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTxt}>Student Profile</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Student Info Card */}
        <View style={styles.card}>
          <View style={styles.Subcard}>
            <View style={styles.profileHeader}>
              <View style={styles.profileInfo}>
                <Image
                  source={require('../../../../../assets/AdminPage/StudentHome/StudentProfileDetails/staff.png')}
                  style={styles.profileImage}
                />
                <View style={styles.nameSection}>
                  <Text style={styles.name}>Ram Kumar</Text>
                  <Text style={styles.id}>7376232206</Text>
                  <Text style={styles.performanceTag}>Good performer</Text>
                </View>
              </View>
              <TouchableOpacity>
                <Text style={styles.moreOptions}>⋮</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Mentorimg width={15} height={15} />
              <Text style={styles.detailText}>Mentor: Sathish</Text>
            </View>
            <View style={styles.detailItem}>
              <Grade width={15} height={15} />
              <Text style={styles.detailText}>Grade: VI - A</Text>
            </View>
          </View>
        </View>

        {/* Achievements Card - Updated */}
        <View style={styles.card}>
          <View style={styles.achievementHeader}>
            <Text style={styles.cardTitle}>Achievements</Text>
            <Text style={styles.achievementLevel}>
              Level {achievementData.currentLevel}
            </Text>
          </View>

          <View style={styles.progressInfoRow}>
            <Text style={styles.progressLeftText}>
              {achievementData.currentPoints} Rp
            </Text>
            <Text style={styles.progressRightText}>
              {achievementData.nextLevelPoints} Rp
            </Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFilled,
                  {width: `${achievementProgress}%`},
                ]}
              />
            </View>
          </View>

          <Text style={styles.progressText}>
            Score {pointsRemaining} more Rp to achieve level{' '}
            {achievementData.currentLevel + 1}
          </Text>
        </View>

        {/* Performance Graph Card */}
        <PerformanceGraph
          subjectsData={subjectsData}
          targetLevel={TARGET_LEVEL}
          today={TODAY}
        />

        {/* Attendance Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Attendance</Text>
          <Text style={styles.attendancePercentage}>70%</Text>

          <View style={styles.attendanceDetails}>
            <View style={styles.attendanceItem}>
              <View style={[styles.attendanceIcon, styles.totalIcon]}>
                <Numdays width={40} height={40} color="#fff" />
              </View>
              <View>
                <Text style={styles.attendanceLabel}>Total</Text>
                <Text style={styles.attendanceCount}>56</Text>
              </View>
            </View>

            <View style={styles.attendanceItem}>
              <View style={[styles.attendanceIcon, styles.presentIcon]}>
                <Clock width={40} height={40} />
              </View>
              <View>
                <Text style={styles.attendanceLabel}>Present</Text>
                <Text style={styles.attendanceCount}>53</Text>
              </View>
            </View>

            <View style={styles.attendanceItem}>
              <View style={[styles.attendanceIcon, styles.leaveIcon]}>
                <Leaveday width={40} height={40} color="#fff" />
              </View>
              <View>
                <Text style={styles.attendanceLabel}>Leave</Text>
                <Text style={styles.attendanceCount}>3</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Issue Log Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Issue log count</Text>
          <View style={styles.issueLogItem}>
            <Text style={styles.issueLogText}>Home work : 4</Text>
          </View>
          <View style={styles.issueLogItem}>
            <Text style={styles.issueLogText}>Discipline : 2</Text>
          </View>
        </View>

        {/* Subject Mentors Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Subject Mentors list</Text>

          {mentors.map((mentor, index) => (
            <View key={index} style={styles.mentorItem}>
              <View style={styles.mentorBar} />
              <View style={styles.mentorContent}>
                <Image
                  source={require('../../../../../assets/AdminPage/StudentHome/StudentProfileDetails/staff.png')}
                  style={styles.mentorImage}
                />
                <View style={styles.mentorInfo}>
                  <Text style={styles.mentorSubject}>{mentor.subject}</Text>
                  <Text style={styles.mentorName}>{mentor.name}</Text>
                </View>
                <TouchableOpacity style={styles.refreshButton}>
                  <Exchange width={20} height={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.footer}
      onPress={() => navigation.navigate('AdminMain')}>
        <Homeicon/>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default AdminStudentDetails;
