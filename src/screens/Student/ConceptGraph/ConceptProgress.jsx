import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import BackIcon from '../../../assets/ConceptGraph/Back.svg';
import CalenderIcon from '../../../assets/ConceptGraph/Calender.svg';
import styles from './ConceptProgressStyle';

const ConceptProgress = ({ navigation, route }) => {
  const { concept } = route.params || {
    title: 'Fraction',
    difficulty: 'Easy',
    month: '03 Month',
    endsIn: '3 days'
  };

  // Progress data with count values
  const progressData = [
    { grade: 'G 01', count: 6 },
    { grade: 'G 02', count: 8 },
    { grade: 'G 03', count: 48 },
    { grade: 'G 04', count: 124 },
    { grade: 'G 05', count: 130 },
    { grade: 'G 06', count: 110 },
    { grade: 'G 07', count: 15 },
    { grade: 'G 08', count: 90 },
    { grade: 'G 09', count: 75 },
  ];

  // Find the maximum count for normalization
  const maxCount = Math.max(...progressData.map(item => item.count));
  
  // Calculate width percentages and determine which item has the highest count
  const processedData = progressData.map(item => ({
    ...item,
    width: `${Math.max(5, Math.round((item.count / maxCount) * 100))}%`, // Min 5% for visibility
    isHighlighted: item.count === maxCount // Highlight the highest count
  }));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackIcon
          width={styles.BackIcon.width}
          height={styles.BackIcon.height}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTxt}>Concept Graph Progress</Text>
      </View>
      
      {/* Concept card */}
      <View style={styles.conceptCard}>
        <View style={styles.cardContent}>
          <View>
            <Text style={styles.cardTitle}>{concept.title}</Text>
            <View style={styles.monthContainer}>
              <CalenderIcon width={16} height={16} />
              <Text style={styles.monthText}>{concept.month}</Text>
            </View>
          </View>
          
          <View style={styles.cardRight}>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>{concept.difficulty}</Text>
            </View>
            <Text style={[styles.endsInText, { color: concept.endsInColor || 'red' }]}>
              Ends in : {concept.endsIn}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Grade-wise progress */}
      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>Grade-wise progress</Text>
        
        <ScrollView style={styles.progressList}>
          {processedData.map((item, index) => (
            <View key={index} style={styles.progressItem}>
              <Text style={styles.gradeLabel}>{item.grade}</Text>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: item.width },
                    item.isHighlighted && styles.highlightedProgressBar
                  ]} 
                />
              </View>
              <Text style={styles.progressCount}>{item.count}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ConceptProgress;