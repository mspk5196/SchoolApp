import React from 'react';
import {  
  SafeAreaView,
  View,
  Text,
  ScrollView,
} from 'react-native';
import styles from './Performancegraphsty';


const PerformanceScreen = ({ navigation }) => {
  const TARGET_LEVEL = 20;  
  const BEYOND_TARGET_LEVEL = 30; 
  const TODAY = new Date();

  
  const subjectsData = [
    { 
      label: 'Tamil', 
      currentLevel: 20,
      targetDate: new Date('2025-05-15'),
      totalHeight: TARGET_LEVEL,
    },
    { 
      label: 'English', 
      currentLevel: 15,
      targetDate: new Date('2025-04-10'),
      totalHeight: TARGET_LEVEL,
    },
    { 
      label: 'Maths', 
      currentLevel: 7,
      targetDate: new Date('2025-05-20'),
      totalHeight: TARGET_LEVEL,
    },
    { 
      label: 'Science', 
      currentLevel: 25,
      targetDate: new Date('2025-05-15'),
      totalHeight: TARGET_LEVEL,
    },
    { 
      label: 'Social', 
      currentLevel: 10,
      targetDate: new Date('2025-04-30'),
      totalHeight: TARGET_LEVEL,
    },
    { 
      label: 'History', 
      currentLevel: 8,
      targetDate: new Date('2025-03-25'),
      totalHeight: TARGET_LEVEL,
    },
  ];

  // Y-axis labels
  const yAxisLabels = ["L30", "L25", "L20", "L15", "L10", "L5"];
  
  // Calculate bar heights
  const maxValue = BEYOND_TARGET_LEVEL;
  const maxHeight = 180;
  const scaleFactor = maxHeight / maxValue;
  
  // Function to determine segment colors
  const getPerformanceSegments = (subject) => {
    const currentDate = new Date();
    const deadlinePassed = currentDate > subject.targetDate;
    const segments = [];
    
    if (subject.currentLevel >= TARGET_LEVEL) {
      if (subject.currentLevel > TARGET_LEVEL) {
        segments.push({ 
          value: subject.currentLevel - TARGET_LEVEL, 
          color: '#27AE60',
          gradient: ['#6dd36f', '#27AE60']
        });
      }
      segments.push({ 
        value: TARGET_LEVEL, 
        color: '#0C36FF',
        gradient: ['#4dabf7', '#0C36FF']
      });
    } else {
      segments.push({ 
        value: TARGET_LEVEL - subject.currentLevel,  
        color: '#EB4B42',
        gradient: ['#f77066', '#EB4B42']
      });
      segments.push({ 
        value: subject.currentLevel, 
        color: '#0C36FF',
        gradient: ['#4dabf7', '#0C36FF']
      });
    }
    
    return segments;
  };

  return (
    <SafeAreaView style={styles.container}>
      

      <ScrollView style={styles.scrollView}>
        {/* Performance Graph Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Performance Graph</Text>
          <Text style={styles.graphSubtitle}>Target Level: L{TARGET_LEVEL}</Text>
          
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
                      {segments.map((segment, segIndex) => {
                        const segmentsBelow = segments.slice(segIndex + 1);
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
                                borderTopLeftRadius: segIndex === 0 ? 5 : 0,
                                borderTopRightRadius: segIndex === 0 ? 5 : 0,
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
      </ScrollView>
    </SafeAreaView>
  );
};


  
export default PerformanceScreen;