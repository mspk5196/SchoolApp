import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import styles from './surveysty';
import Datas from '../datas/data';
import BackIcon from '../../assets/basic-img/Backicon';

const SurveyScreen = () => {
  const navigation = useNavigation();
  const dataStore = Datas(); // Initialize Datas
  const { questions, updateAnswer, logFinalResponses } = dataStore; // Get state & functions

  // Initialize responses state safely
  const [responses, setResponses] = useState(() =>
    questions.reduce((acc, question) => {
      acc[question.id] = "";
      return acc;
    }, {})
  );

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showFinalScreen, setShowFinalScreen] = useState(false);
  const [generalComments, setGeneralComments] = useState('');

  const options = [
    'Needs significant improvement',
    'Somewhat effective, but lacks engagement',
    'Clear, but can be improved',
    'Effective and clear.',
    'Excellent and highly beneficial',
  ];

  const getColorStyles = (option) => {
    switch (option) {
      case 'Needs significant improvement':
        return { container: styles.selectedRed, text: styles.redText, radio: '#EB4B42' };
      case 'Somewhat effective, but lacks engagement':
        return { container: styles.selectedOrange, text: styles.orangeText, radio: '#C66034' };
      case 'Clear, but can be improved':
        return { container: styles.selectedYellow, text: styles.yellowText, radio: '#C6B00C' };
      case 'Effective and clear.':
        return { container: styles.selectedLightGreen, text: styles.lightGreenText, radio: '#67C73B' };
      case 'Excellent and highly beneficial':
        return { container: styles.selectedGreen, text: styles.greenText, radio: '#28A53B' };
      default:
        return { container: styles.selectedOption, text: {}, radio: '#000' };
    }
  };

  const handleSelection = (questionId, option) => {
    const updatedResponses = { ...responses, [questionId]: option };
    setResponses(updatedResponses);
    updateAnswer(questionId, option); // Update in Datas state
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Just show the final screen without logging responses yet
      setShowFinalScreen(true);
    }
  };

  const handleBack = () => {
    if (showFinalScreen) {
      setShowFinalScreen(false);
    } else if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = () => {
    // Save comments to responses if needed
    if (generalComments.trim()) {
      updateAnswer('generalComments', generalComments);
    }
    
    // Now log final responses, this is moved from handleNext to here
    logFinalResponses();
    
    console.log('Survey submitted with comments:', generalComments);
    
    // Just mark the survey as complete rather than using navigation directly
    // We'll setup the proper navigation in the parent component or navigator
    if (navigation.getParent()) {
      navigation.goBack(); // Go back to parent screen instead of explicitly navigating
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  // Main content component - we'll switch between question view and final view
  const renderContent = () => {
    if (showFinalScreen) {
      // Final comments screen
      return (
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" />
          
          {/* Header */}
          <View style={styles.header}>
            <BackIcon width={24} height={24} onPress={handleBack} />
            <Text style={styles.headerTxt}>Survey</Text>
          </View>
          
          <ScrollView style={styles.scrollView}>
            <View style={styles.content}>
              <View style={styles.section}>
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>General Comments</Text>
                  <Text style={styles.optional}>(optional)</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter here"
                  placeholderTextColor="#637D92"
                  multiline
                  numberOfLines={5}
                  value={generalComments}
                  onChangeText={setGeneralComments}
                />
              </View>
            </View>
          </ScrollView>
          
          {/* Submit Button */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Complete survey</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    } else {
      // Question screen
      return (
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <BackIcon width={24} height={24} onPress={handleBack} />
            <Text style={styles.headerTxt}>Survey</Text>
          </View>
          
          <View style={styles.surveyContainer}>
            <Text style={styles.question}>{currentQuestion.question}</Text>
            {options.map((item) => {
              const isSelected = responses[currentQuestion.id] === item;
              const { container, text, radio } = getColorStyles(item);

              return (
                <Pressable
                  key={item}
                  style={[styles.radioButtonContainer, isSelected && container]}
                  onPress={() => handleSelection(currentQuestion.id, item)}>
                  <RadioButton
                    value={item}
                    status={isSelected ? 'checked' : 'unchecked'}
                    onPress={() => handleSelection(currentQuestion.id, item)}
                    color={radio}
                  />
                  <Text style={[styles.radioText, isSelected && text]}>
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.buttonContainer}>
            {currentQuestionIndex > 0 && (
              <Pressable style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backText}>{'< Back'}</Text>
              </Pressable>
            )}
            <Pressable
              style={[styles.nextButton, !responses[currentQuestion.id] && styles.disabledButton]}
              disabled={!responses[currentQuestion.id]}
              onPress={handleNext}>
              <Text style={[styles.nextText, !responses[currentQuestion.id] && styles.disabledText]}>
                {'Next >'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      );
    }
  };

  // Render the appropriate content based on current state
  return renderContent();
};



export default SurveyScreen;