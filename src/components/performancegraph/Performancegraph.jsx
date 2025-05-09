import React, {useState} from 'react';
import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import styles from './Performancegraphsty';
import {useNavigation} from '@react-navigation/native';

const PerformanceGraph = ({onBarPress, showTitle = true}) => {
  const [activeTab, setActiveTab] = useState('Tamil');
  const navigation = useNavigation();

  const data = {
    Tamil: [
      {
        day: 'Day 8',
        classvalue: 70,
        discipline: 10,
        homework: 10,
        dayNumber: 8,
      },
      {
        day: 'Day 9',
        classvalue: 60,
        discipline: 10,
        homework: 10,
        dayNumber: 9,
      },
      {
        day: 'Day 10',
        classvalue: 55,
        discipline: 10,
        homework: 10,
        dayNumber: 10,
      },
      {
        day: 'Today',
        classvalue: 50,
        discipline: 10,
        homework: 10,
        dayNumber: 11,
      },
      {day: 'Day 12', classvalue: 0, discipline: 0, homework: 0, dayNumber: 12},
      {day: 'Day 13', classvalue: 0, discipline: 0, homework: 0, dayNumber: 13},
      {day: 'Day 14', classvalue: 0, discipline: 0, homework: 0, dayNumber: 14},
    ],
    English: [
      {day: 'Day 8', classvalue: 70, discipline: 8, homework: 9, dayNumber: 8},
      {day: 'Day 9', classvalue: 65, discipline: 10, homework: 8, dayNumber: 9},
      {
        day: 'Day 10',
        classvalue: 60,
        discipline: 9,
        homework: 10,
        dayNumber: 10,
      },
      {
        day: 'Today',
        classvalue: 55,
        discipline: 10,
        homework: 10,
        dayNumber: 11,
      },
      {day: 'Day 12', classvalue: 0, discipline: 0, homework: 0, dayNumber: 12},
      {day: 'Day 13', classvalue: 0, discipline: 0, homework: 0, dayNumber: 13},
      {day: 'Day 14', classvalue: 0, discipline: 0, homework: 0, dayNumber: 14},
    ],
    Math: [
      {day: 'Day 8', classvalue: 75, discipline: 10, homework: 8, dayNumber: 8},
      {day: 'Day 9', classvalue: 70, discipline: 9, homework: 9, dayNumber: 9},
      {
        day: 'Day 10',
        classvalue: 65,
        discipline: 10,
        homework: 9,
        dayNumber: 10,
      },
      {
        day: 'Today',
        classvalue: 60,
        discipline: 10,
        homework: 10,
        dayNumber: 11,
      },
      {day: 'Day 12', classvalue: 0, discipline: 0, homework: 0, dayNumber: 12},
      {day: 'Day 13', classvalue: 0, discipline: 0, homework: 0, dayNumber: 13},
      {day: 'Day 14', classvalue: 0, discipline: 0, homework: 0, dayNumber: 14},
    ],
    Monthly: [
      {
        day: 'Apr',
        classvalue: 68,
        discipline: 20,
        homework: 0,
        dayNumber: 1,
        month: 'Apr',
      },
      {
        day: 'May',
        classvalue: 65,
        discipline: 20,
        homework: 0,
        dayNumber: 2,
        month: 'May',
      },
      {
        day: 'Jun',
        classvalue: 60,
        discipline: 20,
        homework: 0,
        dayNumber: 3,
        month: 'Jun',
      },
      {
        day: 'Jul',
        classvalue: 55,
        discipline: 20,
        homework: 0,
        dayNumber: 4,
        month: 'Jul',
      },
      {
        day: 'Aug',
        classvalue: 0,
        discipline: 0,
        homework: 0,
        dayNumber: 5,
        month: 'Aug',
      },
      {
        day: 'Sep',
        classvalue: 0,
        discipline: 0,
        homework: 0,
        dayNumber: 6,
        month: 'Sep',
      },
      {
        day: 'Oct',
        classvalue: 0,
        discipline: 0,
        homework: 0,
        dayNumber: 7,
        month: 'Oct',
      },
    ],
    Overall: [
      {day: 'Day 8', classvalue: 68, discipline: 10, homework: 9, dayNumber: 8},
      {day: 'Day 9', classvalue: 66, discipline: 9, homework: 10, dayNumber: 9},
      {
        day: 'Day 10',
        classvalue: 63,
        discipline: 10,
        homework: 9,
        dayNumber: 10,
      },
      {
        day: 'Today',
        classvalue: 58,
        discipline: 10,
        homework: 10,
        dayNumber: 11,
      },
      {day: 'Day 12', classvalue: 0, discipline: 0, homework: 0, dayNumber: 12},
      {day: 'Day 13', classvalue: 0, discipline: 0, homework: 0, dayNumber: 13},
      {day: 'Day 14', classvalue: 0, discipline: 0, homework: 0, dayNumber: 14},
    ],
  };

  const tabs = ['Monthly', 'Overall', 'Tamil', 'English', 'Math'];

  const handleBarPress = day => {
    if (onBarPress) {
      onBarPress(day);
    } else {
      // If no custom handler is provided, navigate to details screen
      navigation.navigate('PerformanceDetailsScreen', {
        data: day,
        activeTab: activeTab,
      });
    }
  };

  const getXAxisLabel = day => {
    // For Monthly tab, return the month value
    if (activeTab === 'Monthly') {
      return day.month;
    }
    // For other tabs, return the day value
    return day.day;
  };

  return (
    <View style={styles.container}>
      {showTitle && <Text style={styles.title}>Performance graph</Text>}

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab ? styles.activeTab : styles.inactiveTab,
            ]}
            onPress={() => setActiveTab(tab)}>
            <Text
              style={[
                styles.tabText,
                activeTab === tab
                  ? styles.activeTabText
                  : styles.inactiveTabText,
              ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Graph */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.graphContainer}>
        {data[activeTab].map(day => {
          const totalScore = day.classvalue + day.discipline + day.homework;
          const assignmentHeight = `${day.classvalue}%`;
          const extraHeight = `${day.discipline + day.homework}%`;
          const extraValue = day.discipline + day.homework;

          const hasScore = totalScore > 0;
          // Orange color for current day/month, blue for others
          const assignmentColor =
            (activeTab === 'Monthly' && day.day === 'Jul') ||
            (activeTab !== 'Monthly' && day.day === 'Today')
              ? '#F4A460'
              : '#0C36FF';

          return (
            <TouchableOpacity
              key={day.day}
              style={styles.barContainer}
              onPress={() => hasScore && handleBarPress(day)}
              disabled={!hasScore}>
              <View style={styles.barWrapper}>
                {hasScore ? (
                  <>
                    <Text style={styles.scoreLabel}>{totalScore}%</Text>

                    <View style={styles.barContent}>
                      {/* Assignment Bar */}
                      <View
                        style={[
                          styles.assignmentBar,
                          {
                            height: assignmentHeight,
                            backgroundColor: assignmentColor,
                          },
                        ]}>
                        {/* Assignment Value */}
                        <Text style={styles.barValueText}>
                          {day.classvalue}%
                        </Text>
                      </View>

                      {/* Discipline + Homework Bar */}
                      <View
                        style={[styles.disciplineBar, {height: extraHeight}]}>
                        {/* Discipline + Homework Value */}
                        <Text style={styles.barValueText}>{extraValue}%</Text>
                      </View>
                    </View>
                  </>
                ) : (
                  // Render empty bar
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
          <View style={[styles.legendColor, {backgroundColor: '#E55048'}]} />
          <Text style={styles.legendText}>
            {activeTab === 'Monthly' ? 'Home work' : 'Homework'}
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, {backgroundColor: '#0C36FF'}]} />
          <Text style={styles.legendText}>
            {activeTab === 'Monthly' ? 'Academic' : 'Assignment'}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default PerformanceGraph;
