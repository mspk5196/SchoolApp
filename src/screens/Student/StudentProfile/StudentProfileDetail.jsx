import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import Grade from '../../../assets/StudentProfileDetails/grade.svg';
import Mentorimg from '../../../assets/StudentProfileDetails/mentor2.svg';
import Numdays from '../../../assets/StudentProfileDetails/numdays.svg';
import PenIcon from '../../../assets/StudentProfileDetails/pen.svg';
import Clock from '../../../assets/StudentProfileDetails/clock.svg';
import Leaveday from '../../../assets/StudentProfileDetails/leaveday.svg';
import Exchange from '../../../assets/StudentProfileDetails/exchange.svg';
import BackIcon from '../../../assets/GeneralAssests/backarrow.svg';
import styles from './StudentProfileDetailStyle'; 
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const StudentProfileDetail = ({ navigation, route }) => {
    const { student } = route.params || {};
    // Add state for modal visibility and mentor name
    const [modalVisible, setModalVisible] = useState(false);
    const [mentorName, setMentorName] = useState('Sathish');
    const [newMentorName, setNewMentorName] = useState('');

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

  // Function to handle saving the new mentor name
  const handleSaveMentor = () => {
    if (newMentorName.trim() !== '') {
      setMentorName(newMentorName);
      setNewMentorName('');
    }
    setModalVisible(false);
  };

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

      {/* Mentor Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Mentor</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mentor Name:</Text>
              <TextInput
                style={styles.textInput}
                value={newMentorName}
                onChangeText={setNewMentorName}
                placeholder="Enter mentor name"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleSaveMentor}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.scrollView}>
        {/* Student Info Card */}
        <View style={styles.card}>
          <View style={styles.Subcard}>
            <View style={styles.profileHeader}>
              <View style={styles.profileInfo}>
                <Image 
                  source={require('../../../assets/StudentProfileDetails/staff.png')} 
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
              <Text style={styles.detailText}>Mentor: {mentorName}</Text>
              <TouchableOpacity style={styles.editButton}>
                <PenIcon width={15} height={15} style={styles.editIcon} />
              </TouchableOpacity>
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
        </View>

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

        {/* Concept Progress Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Concept progress</Text>
          
          <View style={styles.subjectTabs}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
              {subjects.map((subject) => (
                <TouchableOpacity
                  key={subject}
                  onPress={() => setActiveSubject(subject)}
                  style={[
                    styles.subjectTab,
                    activeSubject === subject && styles.activeSubjectTab
                  ]}
                >
                  <Text 
                    style={[
                      styles.subjectTabText,
                      activeSubject === subject && styles.activeSubjectTabText
                    ]}
                  >
                    {subject}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.chartContainer}>
            {/* Y-axis labels */}
            <View style={styles.yAxis}>
              {[4, 3, 2, 1, 0].map((value) => (
                <Text key={value} style={styles.axisLabel}>
                  {value < 10 ? `0${value}` : value}
                </Text>
              ))}
            </View>
            
            {/* Chart area */}
            <View style={styles.chart}>
              {/* Horizontal grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <View key={i} style={[styles.gridLine, { top: i * (CHART_HEIGHT / 4) }]} />
              ))}
              
              {/* Chart line */}
              <Svg height={CHART_HEIGHT} width={CHART_WIDTH} style={styles.chartSvg}>
                {/* Line path */}
                <Path
                  d={generatePath(coordinates)}
                  stroke="#2D68FF"
                  strokeWidth={2}
                  fill="none"
                />
                
                {/* Gradient under the line */}
                <Defs>
                  <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#2D68FF" stopOpacity={0.2} />
                    <Stop offset="1" stopColor="#2D68FF" stopOpacity={0.05} />
                  </LinearGradient>
                </Defs>
                
                <Path
                  d={`${generatePath(coordinates)} L ${coordinates[coordinates.length-1].x} ${CHART_HEIGHT} L ${coordinates[0].x} ${CHART_HEIGHT} Z`}
                  fill="url(#gradient)"
                />
                
                {/* Data points */}
                {coordinates.map((point, index) => (
                  <React.Fragment key={index}>
                    <Circle
                      cx={point.x}
                      cy={point.y}
                      r={index === Math.floor(coordinates.length / 2) ? 6 : 4}
                      fill={index === Math.floor(coordinates.length / 2) ? "#2D68FF" : "transparent"}
                      stroke="#2D68FF"
                      strokeWidth={2}
                    />
                    
                    {/* Value tooltip for middle point */}
                    {index === Math.floor(coordinates.length / 2) && (
                      <Text
                        x={point.x}
                        y={point.y - 15}
                        textAnchor="middle"
                        stroke="none"
                        fill="#2D68FF"
                        fontSize={10}
                        fontWeight="bold"
                      >
                        {point.value.toFixed(1)}
                      </Text>
                    )}
                  </React.Fragment>
                ))}
              </Svg>
              
              {/* X-axis labels */}
              <View style={styles.xAxis}>
                {currentData.map((point, index) => (
                  <Text key={index} style={[styles.axisLabel, { width: CHART_WIDTH / currentData.length }]}>
                    {point.month}
                  </Text>
                ))}
              </View>
            </View>
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
                  source={require('../../../assets/StudentProfileDetails/staff.png')} 
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

export default StudentProfileDetail;