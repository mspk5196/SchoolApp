import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import BackIcon from '../../../assets/Subjects/Back.svg';
import styles from './LevelPromotionStyle';

const LevelPromotion = ({ navigation }) => {
  const [activeGrade, setActiveGrade] = useState(1); // Default to Grade 2 (index 1)
  
  // Initialize subject percentages for all grades
  const [subjectPercentages, setSubjectPercentages] = useState({
    0: { // Grade 1
      Tamil: 20,
      English: 10,
      Maths: 10,
      Science: 10,
      Social: 10
    },
    1: { // Grade 2
      Tamil: 20,
      English: 10,
      Maths: 10,
      Science: 10,
      Social: 10
    },
    2: { // Grade 3
      Tamil: 20,
      English: 10,
      Maths: 10,
      Science: 10,
      Social: 10
    },
    3: { // Grade 4
      Tamil: 20,
      English: 10,
      Maths: 10,
      Science: 10,
      Social: 10
    },
    4: { // Grade 5
      Tamil: 20,
      English: 10,
      Maths: 10, 
      Science: 10,
      Social: 10
    },
    5: { // Grade 6
      Tamil: 20,
      English: 10,
      Maths: 10,
      Science: 10,
      Social: 10
    },
    6: { // Grade 7
      Tamil: 20,
      English: 10,
      Maths: 10,
      Science: 10,
      Social: 10
    }
  });

  // Function to increase percentage for a subject in active grade
  const increasePercentage = (subject) => {
    setSubjectPercentages(prev => {
      const updatedGrade = { ...prev[activeGrade] };
      updatedGrade[subject] = Math.min(100, updatedGrade[subject] + 5); // Max 100%
      return {
        ...prev,
        [activeGrade]: updatedGrade
      };
    });
  };

  // Function to decrease percentage for a subject in active grade
  const decreasePercentage = (subject) => {
    setSubjectPercentages(prev => {
      const updatedGrade = { ...prev[activeGrade] };
      updatedGrade[subject] = Math.max(0, updatedGrade[subject] - 5); // Min 0%
      return {
        ...prev,
        [activeGrade]: updatedGrade
      };
    });
  };

  // Save function
  const handleSave = () => {
    // Here you would typically save the percentages to your backend or local storage
    // For now, we'll just navigate back
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <BackIcon 
          width={styles.BackIcon.width} 
          height={styles.BackIcon.height} 
          onPress={() => navigation.goBack()} 
        />
        <Text style={styles.headerTxt}>Settings</Text>
      </View>
      
      <ScrollView 
        horizontal={true} 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent} 
        style={styles.classnavgrade}
      >
        {["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"].map((grade, index) => (
          <Pressable
            key={index}
            style={[styles.gradeselection, activeGrade === index && styles.activeButton]}
            onPress={() => setActiveGrade(index)}
          >
            <Text style={[styles.gradeselectiontext, activeGrade === index && styles.activeText]}>
              {grade}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>
          Set minimum mark percentage for level promotion
        </Text>
        
        <ScrollView showsHorizontalScrollIndicator={false}>
        <View style={styles.subjectsContainer}>
          {/* Tamil */}
          <View style={styles.subjectRow}>
            <Text style={styles.subjectName}>Tamil</Text>
            <View style={styles.percentageSelector}>
              <TouchableOpacity 
                style={styles.percentageButton}
                onPress={() => decreasePercentage('Tamil')}
              >
                <Text style={styles.percentageButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.percentageDisplay}>
                <Text style={styles.percentageText}>
                  {subjectPercentages[activeGrade].Tamil} %
                </Text>
              </View>
              <TouchableOpacity
                style={styles.percentageButton}
                onPress={() => increasePercentage('Tamil')}
              >
                <Text style={styles.percentageButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* English */}
          <View style={styles.subjectRow}>
            <Text style={styles.subjectName}>English</Text>
            <View style={styles.percentageSelector}>
              <TouchableOpacity 
                style={styles.percentageButton}
                onPress={() => decreasePercentage('English')}
              >
                <Text style={styles.percentageButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.percentageDisplay}>
                <Text style={styles.percentageText}>
                  {subjectPercentages[activeGrade].English} %
                </Text>
              </View>
              <TouchableOpacity
                style={styles.percentageButton}
                onPress={() => increasePercentage('English')}
              >
                <Text style={styles.percentageButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Maths */}
          <View style={styles.subjectRow}>
            <Text style={styles.subjectName}>Maths</Text>
            <View style={styles.percentageSelector}>
              <TouchableOpacity 
                style={styles.percentageButton}
                onPress={() => decreasePercentage('Maths')}
              >
                <Text style={styles.percentageButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.percentageDisplay}>
                <Text style={styles.percentageText}>
                  {subjectPercentages[activeGrade].Maths} %
                </Text>
              </View>
              <TouchableOpacity
                style={styles.percentageButton}
                onPress={() => increasePercentage('Maths')}
              >
                <Text style={styles.percentageButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Science */}
          <View style={styles.subjectRow}>
            <Text style={styles.subjectName}>Science</Text>
            <View style={styles.percentageSelector}>
              <TouchableOpacity 
                style={styles.percentageButton}
                onPress={() => decreasePercentage('Science')}
              >
                <Text style={styles.percentageButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.percentageDisplay}>
                <Text style={styles.percentageText}>
                  {subjectPercentages[activeGrade].Science} %
                </Text>
              </View>
              <TouchableOpacity
                style={styles.percentageButton}
                onPress={() => increasePercentage('Science')}
              >
                <Text style={styles.percentageButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Social */}
          <View style={styles.subjectRow}>
            <Text style={styles.subjectName}>Social</Text>
            <View style={styles.percentageSelector}>
              <TouchableOpacity 
                style={styles.percentageButton}
                onPress={() => decreasePercentage('Social')}
              >
                <Text style={styles.percentageButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.percentageDisplay}>
                <Text style={styles.percentageText}>
                  {subjectPercentages[activeGrade].Social} %
                </Text>
              </View>
              <TouchableOpacity
                style={styles.percentageButton}
                onPress={() => increasePercentage('Social')}
              >
                <Text style={styles.percentageButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </ScrollView>
      </View>
      <TouchableOpacity 
        style={styles.saveButton}
        onPress={handleSave}
      > 
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default LevelPromotion;