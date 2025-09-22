import { apiFetch } from "../../../utils/apiClient.js";
import React, { useState, useEffect, act } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import styles from './PerformanceGraphStyles';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../../../utils/env.js';

const PerformanceGraph = ({ studentData, showTitle = true }) => {
  const [activeTab, setActiveTab] = useState('Overall');
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState(null);
  const [sectionSubjects, setSectionSubjects] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    if (!studentData?.student_id) return;

    const fetchPerformance = async () => {
      const res = await fetch(`${API_URL}/api/student/getStudentPerformance/${studentData.student_id}`);
      const json = await res.json();
      setPerformanceData(json);
    };

    fetchPerformance();
  }, [studentData]);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/student/getStudentPerformance/${studentData.student_id}`);
        const data = response
        setPerformanceData(data);
        if (data.subjectList && (!sectionSubjects || sectionSubjects.length === 0)) {
          setSectionSubjects(data.subjectList.map(s => ({ subject_name: s })));
        }
      } catch (error) {
        console.error('Error fetching performance data:', error);
      } finally {
        setLoading(false);
      }
    };
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const response = await apiFetch(`/student/getSectionSubjects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sectionId: studentData.section_id }),
        });
        const data = response
        setSectionSubjects(data.subjects);
        // console.log('Fetched subjects:', data.subjects);

      } catch (error) {
        console.error('Error fetching performance data:', error);
      } finally {
        setLoading(false);
      }
    };
    // console.log('Student Data:', studentData.student_id);

    if (studentData) {
      fetchPerformanceData();
      fetchSubjects();
    }
  }, [studentData]);

  const handleBarPress = (day) => {
    // console.log(day);

    if (activeTab != 'Overall' && activeTab != 'Monthly') {
      navigation.navigate('StudentPerformanceDetailsScreen', {
        data: day,
        studentData,
        activeTab: activeTab,
        subject: activeTab !== 'Monthly' && activeTab !== 'Overall' ? activeTab : null
      });
    }
  };

  const formatGraphData = () => {
    if (!performanceData) return {};

    // Create array of last 7 days including today
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i)); // Creates days from Day 1 to Today
      return date;
    });

    const data = {
      Overall: [],
      Monthly: [],
      ...Object.fromEntries(sectionSubjects.map(sub => [sub.subject_name, []]))
    };

    // Helper to convert backend date to ISO format
    const toISODate = (dateStr) => {
      if (dateStr.includes(',')) { // If it's in "Fri May 23..." format
        return new Date(dateStr).toISOString().split('T')[0];
      }
      return dateStr; // Assume it's already in YYYY-MM-DD format
    };

    // Process daily data
    last7Days.forEach((dateObj, index) => {
      const dateISO = dateObj.toISOString().split('T')[0];
      const dayLabel = index === 6 ? 'Today' : `Day ${index + 1}`;

      // Find matching backend data
      const backendDateKey = Object.keys(performanceData.daily || {}).find(d =>
        toISODate(d) === dateISO
      );
      const dailyData = backendDateKey ? performanceData.daily[backendDateKey] : null;

      // Process Overall data (80% academic, 20% combined homework/discipline)
      const overallScore = dailyData?.Overall || 0;
      data.Overall.push({
        day: dayLabel,
        classvalue: Math.round(overallScore * 0.8), // Academic (80%)
        homework: Math.round(overallScore * 0.1),   // Homework (10%)
        discipline: Math.round(overallScore * 0.1), // Discipline (10%)
        dayNumber: index + 1,
        date: dateISO
      });

      // Process subject data
      sectionSubjects.forEach(subject => {
        const subjectName = subject.subject_name;
        const subjectScore = dailyData?.[subjectName] || 0;

        data[subjectName].push({
          day: dayLabel,
          classvalue: Math.round(subjectScore * 0.8), // Academic
          homework: Math.round(subjectScore * 0.1),   // Homework
          discipline: Math.round(subjectScore * 0.1), // Discipline
          dayNumber: index + 1,
          date: dateISO
        });
      });
    });

    // Process monthly data
    console.log(performanceData.monthly);
    
    const months = Object.keys(performanceData.monthly || {}).sort();
    const last3Months = months.slice(-3);

    last3Months.forEach((month, index) => {
      const monthName = new Date(month + '-01').toLocaleString('default', { month: 'short' });
      const monthData = performanceData.monthly[month];
      const overallScore = monthData?.Overall || 0;

      data.Monthly.push({
        day: monthName,
        classvalue: Math.round(overallScore * 0.8),
        homework: Math.round(overallScore * 0.1),
        discipline: Math.round(overallScore * 0.1),
        dayNumber: index + 1,
        month: monthName
      });
    });

    return data;
  };

  // useEffect(() => {
  //   console.log("Raw performance data:", performanceData);
  //   const formatted = formatGraphData();
  //   console.log("Formatted graph data:", formatted);

  // }, [performanceData]);

  // const tabs = ['Monthly', 'Overall', ...(performanceData?.subjects ? Object.keys(performanceData.subjects) : [])];

  const graphData = formatGraphData();
  // console.log(sectionSubjects);

  const tabs = ['Monthly', 'Overall', ...sectionSubjects.map(s => s.subject_name)];

  const getXAxisLabel = (day) => {
    return activeTab === 'Monthly' ? day.month : day.day;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!performanceData) {
    return (
      <View style={styles.container}>
        <Text>No performance data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showTitle && <Text style={styles.title}>Performance graph</Text>}

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab ? styles.activeTab : styles.inactiveTab
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab ? styles.activeTabText : styles.inactiveTabText
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Graph */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.graphContainer}>
        {graphData[activeTab]?.map((day) => {
          const totalScore = day.classvalue + day.discipline + day.homework;
          const assignmentHeight = `${day.classvalue}%`;
          const extraHeight = `${day.discipline + day.homework}%`;
          const extraValue = day.discipline + day.homework;

          const hasScore = totalScore > 0;
          const assignmentColor =
            (activeTab === 'Monthly' && day.day === 'Jul') ||
              (activeTab !== 'Monthly' && day.day === 'Today')
              ? '#F4A460' : '#0C36FF';

          return (
            <TouchableOpacity
              key={day.day}
              style={styles.barContainer}
              onPress={() => hasScore && handleBarPress(day)}
              disabled={!hasScore}
            >
              <View style={styles.barWrapper}>
                {hasScore ? (
                  <>
                    <Text style={styles.scoreLabel}>{totalScore}%</Text>

                    <View style={styles.barContent}>
                      <View
                        style={[
                          styles.assignmentBar,
                          { height: assignmentHeight, backgroundColor: assignmentColor }
                        ]}
                      >
                        <Text style={styles.barValueText}>
                          {day.classvalue}%
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.disciplineBar,
                          { height: extraHeight }
                        ]}
                      >
                        <Text style={styles.barValueText}>
                          {extraValue}%
                        </Text>
                      </View>
                    </View>
                  </>
                ) : (
                  <View style={styles.emptyBar}>
                    <Text style={styles.emptyBarText}>-</Text>
                  </View>
                )}
              </View>
              <Text style={styles.dayLabel}>{getXAxisLabel(day)}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#E55048' }]} />
          <Text style={styles.legendText}>
            {activeTab === 'Monthly' ? 'Home work' : 'Homework'}
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#0C36FF' }]} />
          <Text style={styles.legendText}>
            {activeTab === 'Monthly' ? 'Academic' : 'Assignment'}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default PerformanceGraph;