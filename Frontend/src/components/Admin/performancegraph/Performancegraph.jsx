import React from 'react';
import {  
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { StyleSheet } from 'react-native';
// import Leftarrow from '../../../assets/leftarrow.svg';

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  graphSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  graphContainer: {
    flexDirection: 'row',
    height: 220,
    marginTop: 10,
    paddingBottom: 20,
  },
  yAxisLabels: {
    width: 30,
    height: '90%',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 5,
    paddingVertical: 10,
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#666',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: 5,
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
    paddingLeft: 10,
    height: '90%',
  },
  barColumn: {
    alignItems: 'center',
    width: '16%',
    height: '100%',
  },
  barWrapper: {
    width: '70%',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  barSegment: {
    width: '100%',
    position: 'absolute',
    left: 0,
    right: 0
  },
  barLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  levelIndicator: {
    position: 'absolute',
    top: -25,
    backgroundColor: '#333',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  levelText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: 'bold',
  },
  deadlineIndicator: {
    position: 'absolute',
    top: -25,
    right: -5,
    backgroundColor: '#EB4B42',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deadlineText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  summaryContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default PerformanceScreen;