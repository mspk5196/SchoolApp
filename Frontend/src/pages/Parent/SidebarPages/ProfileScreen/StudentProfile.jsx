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
// Import SVG assets
// Note: Keeping your original imports, but they would need to be properly configured
import Grade from     '../../../../assets/ParentPage/Profilepageicons/grade.svg';
import Mentorimg from '../../../../assets/ParentPage/Profilepageicons/mentor2.svg';
import Numdays from   '../../../../assets/ParentPage/Profilepageicons/numdays.svg';
import Clock from     '../../../../assets/ParentPage/Profilepageicons/clock.svg';
import Leaveday from  '../../../../assets/ParentPage/Profilepageicons/leaveday.svg';
import Leftarrow from '../../../../assets/ParentPage/Profilepageicons/leftarrow.svg';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useState } from 'react';
import styles from './ProfileStyles'; // Import your styles

const StudentProfile = ({ navigation }) => {
  // Configuration for target levels and deadlines
  const TARGET_LEVEL = 20;  // Default target level (L20)
  const BEYOND_TARGET_LEVEL = 30;  // Maximum level to display (L30)
  const TARGET_DATE = new Date('2025-05-15');  // Default deadline date (changeable)

  // Current date for comparison
  const TODAY = new Date();

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
        const controlPointX1 = (points[i].x + points[i - 1].x) / 2;
        const controlPointX2 = (points[i].x + points[i + 1].x) / 2;
        path += ` C ${controlPointX1} ${points[i - 1].y}, ${controlPointX2} ${points[i].y}, ${points[i].x} ${points[i].y}`;
      } else {
        path += ` L ${points[i].x} ${points[i].y}`;
      }
    }

    return path;
  };

  // Updated subject data with current levels and deadlines
  const subjectsData = [
    {
      label: 'Tamil',
      currentLevel: 20,  // Student completed L22
      targetDate: new Date('2025-05-15'),  // Deadline
      totalHeight: TARGET_LEVEL,  // Default height is the target level
    },
    {
      label: 'English',
      currentLevel: 15,  // Student only reached L15
      targetDate: new Date('2025-04-10'),  // Deadline passed
      totalHeight: TARGET_LEVEL,
    },
    {
      label: 'Maths',
      currentLevel: 7,  // Student exceeded target (L28)
      targetDate: new Date('2025-05-20'),  // Deadline
      totalHeight: TARGET_LEVEL,
    },
    {
      label: 'Science',
      currentLevel: 25,  // Almost at target (L19)
      targetDate: new Date('2025-05-15'),  // Deadline
      totalHeight: TARGET_LEVEL,
    },
    {
      label: 'Social',
      currentLevel: 10,  // Exactly at target (L20)
      targetDate: new Date('2025-04-30'),  // Deadline
      totalHeight: TARGET_LEVEL,
    },
    {
      label: 'History',
      currentLevel: 8,  // Far behind target (L8)
      targetDate: new Date('2025-03-25'),  // Deadline already passed
      totalHeight: TARGET_LEVEL,
    },
  ];

  // Y-axis labels - Updated to include "L" prefix
  const yAxisLabels = ["L30", "L25", "L20", "L15", "L10", "L5"];

  // Calculate bar heights - scale factor to convert data values to pixel heights
  const maxValue = BEYOND_TARGET_LEVEL; // Maximum value on Y axis (L30)
  const maxHeight = 180; // Maximum height in pixels for the bars
  const scaleFactor = maxHeight / maxValue;

  // Function to determine segment colors based on student progress and deadline
  // Function to determine segment colors based on student progress and deadline
  // Function to determine segment colors based on student progress and deadline
  const getPerformanceSegments = (subject) => {
    const currentDate = new Date();
    const deadlinePassed = currentDate > subject.targetDate;
    const segments = [];

    if (subject.currentLevel >= TARGET_LEVEL) {
      // Case 1: Student exceeded or met target level
      // Add green segment for progress beyond target (if any)
      if (subject.currentLevel > TARGET_LEVEL) {
        segments.push({
          value: subject.currentLevel - TARGET_LEVEL,
          color: '#27AE60',
          gradient: ['#6dd36f', '#27AE60']  // Green segment - will render at bottom
        });
      }

      // Blue segment for target completion (up to TARGET_LEVEL)
      segments.push({
        value: TARGET_LEVEL,
        color: '#0C36FF',
        gradient: ['#4dabf7', '#0C36FF']  // Blue segment - will render above green
      });
    } else {
      // Case 2: Student didn't reach target level
      // Red segment for remaining target (gap to reach target)
      segments.push({
        value: TARGET_LEVEL - subject.currentLevel,
        color: '#EB4B42',
        gradient: ['#f77066', '#EB4B42']  // Red segment - will render at bottom
      });

      // Blue segment for current progress
      segments.push({
        value: subject.currentLevel,
        color: '#0C36FF',
        gradient: ['#4dabf7', '#0C36FF']  // Blue segment - will render above red
      });
    }

    return segments;
  };

  // Then update the bar rendering part:
  {
    subjectsData.map((subject, index) => {
      const segments = getPerformanceSegments(subject);
      const deadlinePassed = TODAY > subject.targetDate;

      return (
        <View key={index} style={styles.barColumn}>
          <View style={styles.barWrapper}>
            {/* Render segments starting from bottom */}
            {segments.map((segment, segIndex) => {
              // Calculate height of all segments below this one
              const heightBelow = segments
                .slice(0, segIndex)
                .reduce((total, seg) => total + seg.value * scaleFactor, 0);

              return (
                <View
                  key={segIndex}
                  style={[
                    styles.barSegment,
                    {
                      height: segment.value * scaleFactor,
                      backgroundColor: segment.color,
                      bottom: heightBelow, // Position from bottom
                      // Only round top corners for the topmost segment
                      borderTopLeftRadius: segIndex === segments.length - 1 ? 5 : 0,
                      borderTopRightRadius: segIndex === segments.length - 1 ? 5 : 0,
                      // Show shadow only for the top segment
                      ...((segIndex === segments.length - 1) && {
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

            {/* Display current level text */}
            <View style={styles.levelIndicator}>
              <Text style={styles.levelText}>L{subject.currentLevel}</Text>
            </View>

            {/* Deadline indicator */}
            {deadlinePassed && subject.currentLevel < TARGET_LEVEL && (
              <View style={styles.deadlineIndicator}>
                <Text style={styles.deadlineText}>!</Text>
              </View>
            )}
          </View>
          <Text style={styles.barLabel}>{subject.label}</Text>
        </View>
      );
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Leftarrow width={16} height={16} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Student Profile</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Student Info Card */}
        <View style={styles.card}>
          <View style={styles.Subcard}>
            <View style={styles.profileHeader}>
              <View style={styles.profileInfo}>
                <Image
                  source={require('../../../../assets/ParentPage/Profilepageicons/profile.png')}
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

        {/* Achievements Card */}
        {/*         <View style={styles.card}>
          <Text style={styles.cardTitle}>Achievements</Text>
          <View style={styles.progressBar}>
            <View style={styles.progressFilled} />
          </View>
          <Text style={styles.progressText}>Score 128Rp to achieve level 1</Text>
        </View>
 */}
        {/* Performance Graph Card - Updated with new functionality */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Performance graph</Text>
          <Text style={styles.graphSubtitle}>Target Level: L{TARGET_LEVEL} by {TARGET_DATE.toLocaleDateString()}</Text>

          <View style={styles.graphContainer}>
            {/* Y-axis labels */}
            <View style={styles.yAxisLabels}>
              {yAxisLabels.map((label, index) => (
                <Text key={index} style={styles.yAxisLabel}>{label}</Text>
              ))}
            </View>

            {/* Bars container */}
            <View style={styles.barsContainer}>
              {subjectsData.map((subject, index) => {
                const segments = getPerformanceSegments(subject);
                const deadlinePassed = TODAY > subject.targetDate;

                return (
                  <View key={index} style={styles.barColumn}>
                    <View style={styles.barWrapper}>
                      {/* Calculate cumulative height for positioning segments */}
                      {segments.map((segment, segIndex) => {
                        // Calculate position from bottom (for stacking)
                        const segmentsBelow = segments.slice(segIndex + 1);
                        const heightBelow = segmentsBelow.reduce((total, seg) => total + seg.value * scaleFactor, 0);

                        return (
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

                      {/* Display current level text */}
                      <View style={styles.levelIndicator}>
                        <Text style={styles.levelText}>L{subject.currentLevel}</Text>
                      </View>

                    </View>
                    <Text style={styles.barLabel}>{subject.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#0C36FF' }]} />
              <Text style={styles.legendText}>Current Level</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#27AE60' }]} />
              <Text style={styles.legendText}>Exceeded Target</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#EB4B42' }]} />
              <Text style={styles.legendText}>Target Gap</Text>
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

        {/* Fees Status Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fees status</Text>

          {(() => {
            // Define state inside this self-executing function
            const [activeTermIndex, setActiveTermIndex] = useState(0);

            // Term data
            const termData = [
              {
                total: 23000,
                paid: 23000,
                pending: 0,
                dueDate: '20/10/2025'
              },
              {
                total: 23000,
                paid: 23000,
                pending: 0,
                dueDate: '15/12/2025'
              },
              {
                total: 23000,
                paid: 10000,
                pending: 13000,
                dueDate: '05/03/2026'
              }
            ];

            // Get active term data
            const activeTerm = termData[activeTermIndex];
            const isPending = activeTerm.pending > 0;

            return (
              <>
                {/* Progress bars */}
                <View style={styles.feesProgressContainer}>
                  {termData.map((term, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.feesProgressBar}
                      onPress={() => setActiveTermIndex(index)}
                    >
                      <View
                        style={[
                          styles.feesProgressFilled,
                          term.pending > 0 ? styles.feesProgressPartial : styles.feesProgressComplete,
                          { width: `${(term.paid / term.total) * 100}%` }
                        ]}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Fees info rows */}
                <View style={styles.feesInfoContainer}>
                  <View style={styles.feesInfoRow}>
                    <Text style={[styles.feesInfoLabel,{color:'#0C36FF'}]}>Total</Text>
                    <Text style={[styles.feesInfoValue, styles.totalFees]}>{activeTerm.total.toLocaleString()}</Text>
                  </View>

                  <View style={styles.feesInfoRow}>
                    <Text style={[styles.feesInfoLabel,{color:'#27AE60'}]}>Paid</Text>
                    <Text style={[styles.feesInfoValue, styles.paidFees]}>{activeTerm.paid.toLocaleString()}</Text>
                  </View>

                  <View style={styles.feesInfoRow}>
                    <Text style={[styles.feesInfoLabel,{color:'#eb4b42'}]}>Pending</Text>
                    <Text style={[styles.feesInfoValue, styles.pendingFees]}>{activeTerm.pending.toLocaleString()}</Text>
                  </View>

                  <View style={styles.feesInfoRow}>
                    <Text style={[styles.feesInfoLabel,{color:'#ff9800'}]}>Due date</Text>
                    <Text style={[styles.feesInfoValue, styles.dueDate]}>{activeTerm.dueDate}</Text>
                  </View>
                </View>
              </>
            );
          })()}
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
            {/* Y-axis labels - Updated to include "L" prefix */}
            <View style={styles.yAxis}>
              {[4, 3, 2, 1, 0].map((value) => (
                <Text key={value} style={styles.axisLabel}>
                  L{value < 10 ? `0${value}` : value}
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
                  d={`${generatePath(coordinates)} L ${coordinates[coordinates.length - 1].x} ${CHART_HEIGHT} L ${coordinates[0].x} ${CHART_HEIGHT} Z`}
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
                        L{point.value.toFixed(1)}
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

      </ScrollView>
    </SafeAreaView>
  );
};

export default StudentProfile;