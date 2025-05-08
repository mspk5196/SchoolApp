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
import Grade from     '../../../../assets/CoordinatorPage/StudentProfileDetails/grade.svg';
import Mentorimg from '../../../../assets/CoordinatorPage/StudentProfileDetails/mentor2.svg';
import Numdays from   '../../../../assets/CoordinatorPage/StudentProfileDetails/numdays.svg';
import Clock from     '../../../../assets/CoordinatorPage/StudentProfileDetails/clock.svg';
import Leaveday from  '../../../../assets/CoordinatorPage/StudentProfileDetails/leaveday.svg';
import Exchange from  '../../../../assets/CoordinatorPage/StudentProfileDetails/exchange.svg';
import BackIcon from  '../../../../assets/CoordinatorPage/StudentProfileDetails/leftarrow.svg';
import styles from './StudentProfileDetailStyle'; 
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useState } from 'react';

const CoordinatorStudentProfileDetails = ({ navigation, route }) => {
    const { student } = route.params || {};

  // Achievement data
  const achievementData = {
    currentPoints: 112,
    nextLevelPoints: 200,
    currentLevel: 0,
    badges: [
      { name: 'Perfect Attendance', earned: true },
      { name: 'Math Master', earned: true },
      { name: 'Science Explorer', earned: false },
    ],
    recentAchievements: [
      { title: 'Completed 5 homework assignments', points: 25, date: '15 Apr' },
      { title: 'Perfect score in Math quiz', points: 40, date: '10 Apr' },
    ]
  };

  // Calculate progress percentage
  const achievementProgress = (achievementData.currentPoints / achievementData.nextLevelPoints) * 100;
  const pointsRemaining = achievementData.nextLevelPoints - achievementData.currentPoints;

  // Performance data for the bar chart
  // Data for concept progress chart
  const progressData = [
    { month: '02 M', value: 0 },
    { month: '03 M', value: 0.2 },
    { month: '04 M', value: 1 },
    { month: '05 M', value: 1.5 },
    { month: '06 M', value: 2 },
    { month: '07 M', value: 3.5 },
  ];

  // Subject mentors data
  const mentors = [
    { subject: 'Tamil', name: 'Ram Kumar' },
    { subject: 'Tamil', name: 'Ram Kumar' },
    { subject: 'English', name: 'Ram Kumar' },
    // Add more mentors as needed
  ];
  const subjects = ['English', 'Maths', 'Science', 'Computer', 'Tamil'];
  const [activeSubject, setActiveSubject] = useState('English');

  // Sample progress data for each subject
  const subjectData = {
    English: [
      { month: '02 M', value: 0.6 },
      { month: '03 M', value: 0.5 },
      { month: '04 M', value: 1.0 },
      { month: '05 M', value: 1.0 },
      { month: '06 M', value: 2.0 },
      { month: '07 M', value: 3.5 },
    ],
    Maths: [
      { month: '02 M', value: 0.3 },
      { month: '03 M', value: 1.2 },
      { month: '04 M', value: 1.8 },
      { month: '05 M', value: 2.2 },
      { month: '06 M', value: 2.8 },
      { month: '07 M', value: 3.2 },
    ],
    Science: [
      { month: '02 M', value: 0.1 },
      { month: '03 M', value: 0.4 },
      { month: '04 M', value: 1.3 },
      { month: '05 M', value: 2.4 },
      { month: '06 M', value: 3.0 },
      { month: '07 M', value: 9.7 },
    ],
    Computer: [
      { month: '02 M', value: 0.9 },
      { month: '03 M', value: 1.0 },
      { month: '04 M', value: 1.5 },
      { month: '05 M', value: 2.0 },
      { month: '06 M', value: 2.5 },
      { month: '07 M', value: 3.0 },
    ],
    Tamil: [
      { month: '02 M', value: 0.4 },
      { month: '03 M', value: 0.8 },
      { month: '04 M', value: 1.2 },
      { month: '05 M', value: 2.0 },
      { month: '06 M', value: 2.5 },
      { month: '07 M', value: 2.8 },
    ],
  };

  // Get current data based on active subject
  const currentData = subjectData[activeSubject];
  
  // Chart dimensions
  const CHART_WIDTH = Dimensions.get('window').width - 100;
  const CHART_HEIGHT = 180;
  const MAX_VALUE = 4; // Maximum value on Y-axis
  
  // Calculate positions for line segments and points
  const getPointCoordinates = (data) => {
    const pointsCoordinates = [];
    const segmentWidth = CHART_WIDTH / (data.length - 1);
    
    data.forEach((point, index) => {
      const x = index * segmentWidth;
      const y = CHART_HEIGHT - (point.value / MAX_VALUE) * CHART_HEIGHT;
      pointsCoordinates.push({ x, y, value: point.value });
    });
    
    return pointsCoordinates;
  };
  
  const coordinates = getPointCoordinates(currentData);
  
  // Generate SVG path for the line
  const generatePath = (points) => {
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      // Create a smooth curve between points
      if (i < points.length - 1) {
        const controlPointX1 = (points[i].x + points[i-1].x) / 2;
        const controlPointX2 = (points[i].x + points[i+1].x) / 2;
        path += ` C ${controlPointX1} ${points[i-1].y}, ${controlPointX2} ${points[i].y}, ${points[i].x} ${points[i].y}`;
      } else {
        path += ` L ${points[i].x} ${points[i].y}`;
      }
    }
    
    return path;
  };
  const subjectsData = [
    { 
      label: 'Tamil', 
      segments: [
        { value: 20, color: '#0C36FF', gradient: ['#4dabf7', '#0C36FF'] }  // Blue segment
      ],
      totalHeight: 20
    },
    { 
      label: 'English', 
      segments: [
        { value: 10, color: '#27AE60', gradient: ['#6dd36f', '#27AE60'] },  // Green segment
        { value: 8, color: '#0C36FF', gradient: ['#4dabf7', '#0C36FF'] }   // Blue segment
      ],
      totalHeight: 23
    },
    { 
      label: 'Maths', 
      segments: [
        { value: 4, color: '#27AE60', gradient: ['#6dd36f', '#27AE60'] },  // Green segment
        { value: 18, color: '#0C36FF', gradient: ['#4dabf7', '#0C36FF'] }   // Blue segment
      ],
      totalHeight: 22
    },
    { 
      label: 'Science', 
      segments: [
        { value: 20, color: '#0C36FF', gradient: ['#4dabf7', '#0C36FF'] }   // Blue segment
      ],
      totalHeight: 20
    },
    { 
      label: 'Social', 
      segments: [
        { value: 4, color: '#EB4B42', gradient: ['#f77066', '#EB4B42'] },  // Red segment
        { value: 16, color: '#0C36FF', gradient: ['#4dabf7', '#0C36FF'] }   // Blue segment
      ],
      totalHeight: 20
    },
    { 
      label: 'History', 
      segments: [
        { value: 5, color: '#27AE60', gradient: ['#6dd36f', '#27AE60'] },  // Green segment
        { value: 18, color: '#0C36FF', gradient: ['#4dabf7', '#0C36FF'] }   // Blue segment
      ],
      totalHeight: 23
    },
  ];

  // Y-axis labels
  const yAxisLabels = [25, 20, 15, 10, 5];
  
  // Calculate bar heights - scale factor to convert data values to pixel heights
  const maxValue = 25; // Maximum value on Y axis
  const maxHeight = 180; // Maximum height in pixels for the bars
  const scaleFactor = maxHeight / maxValue;

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
                  source={require('../../../../assets/CoordinatorPage/StudentProfileDetails/staff.png')} 
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
        {/* <View style={styles.card}>
          <View style={styles.achievementHeader}>
            <Text style={styles.cardTitle}>Achievements</Text>
            <Text style={styles.achievementLevel}>Level {achievementData.currentLevel}</Text>
          </View>
          
          <View style={styles.progressInfoRow}>
            <Text style={styles.progressLeftText}>{achievementData.currentPoints} Rp</Text>
            <Text style={styles.progressRightText}>{achievementData.nextLevelPoints} Rp</Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFilled, { width: `${achievementProgress}%` }]} />
            </View>
          </View>
          
          <Text style={styles.progressText}>
            Score {pointsRemaining} more Rp to achieve level {achievementData.currentLevel + 1}
          </Text>
        </View> */}

        {/* Performance Graph Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Performance graph</Text>
          
          <View style={styles.graphContainer}>
            {/* Y-axis labels */}
            <View style={styles.yAxisLabels}>
              {yAxisLabels.map((label, index) => (
                <Text key={index} style={styles.yAxisLabel}>{label}</Text>
              ))}
            </View>
            
            {/* Bars container */}
            <View style={styles.barsContainer}>
              {subjectsData.map((subject, index) => (
                <View key={index} style={styles.barColumn}>
                  <View style={styles.barWrapper}>
                    {/* Calculate cumulative height for positioning segments */}
                    {subject.segments.map((segment, segIndex) => {
                      // Calculate position from bottom (for stacking)
                      const segmentsBelow = subject.segments.slice(segIndex + 1);
                      const heightBelow = segmentsBelow.reduce((total, seg) => total + seg.value * scaleFactor, 0);
                      
                      return(
                        <View 
                          key={segIndex} 
                          style={[
                            styles.barSegment, 
                            { 
                              height: segment.value * scaleFactor,
                              backgroundColor: segment.color,
                              bottom: heightBelow,
                              // Only round top corners for the topmost segment
                              borderTopLeftRadius: segIndex === 0 ? 5 : 0,
                              borderTopRightRadius: segIndex === 0 ? 5 : 0,
                              // Show shadow only for the top segment
                              ...((segIndex === 0) && {
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.2,
                                shadowRadius: 2,
                                elevation: 2,
                              })
                            }
                          ]} 
                        />
                      );
                    })}
                  </View>
                  <Text style={styles.barLabel}>{subject.label}</Text>
                </View>
              ))}
            </View>
          </View>
          
          {/* Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#0C36FF' }]} />
              <Text style={styles.legendText}>Correct</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#27AE60' }]} />
              <Text style={styles.legendText}>Partial</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#EB4B42' }]} />
              <Text style={styles.legendText}>Wrong</Text>
            </View>
          </View>
        </View>

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
                  source={require('../../../../assets/CoordinatorPage/StudentProfileDetails/staff.png')} 
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
    </SafeAreaView>
  );
};

export default CoordinatorStudentProfileDetails;