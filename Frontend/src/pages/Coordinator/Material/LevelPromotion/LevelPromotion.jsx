import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View, ScrollView, Pressable, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import BackIcon from '../../../../assets/CoordinatorPage/Subjects/Back.svg';
import styles from './LevelPromotionStyle';
import { API_URL } from "../../../../utils/env.js";

const LevelPromotion = ({ navigation, route }) => {
  const { gradeID, gradeSubject } = route.params;
  const [activeGrade, setActiveGrade] = useState(gradeID);
  const [subjects, setSubjects] = useState([]);
  const [subjectPercentages, setSubjectPercentages] = useState({}); 
  const [initialPercentages, setInitialPercentages] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchLevelPassPercentages();
  }, [gradeID]);

  const fetchLevelPassPercentages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/coordinator/getLevelPassPercentages?gradeId=${gradeID}`);
      const data = await response.json();
      
      if (data.success) {
        // Initialize with 0% for all subjects
        const initialPercentages = {};
        gradeSubject[0]?.data?.forEach(subject => {
          initialPercentages[subject.subject_id] = 0;
        });
        
        // Override with fetched data
        if (data.data?.percentages) {
          Object.assign(initialPercentages, data.data.percentages);
        }
        
        setSubjectPercentages({...initialPercentages});
        setInitialPercentages({...initialPercentages}); // Store initial values for comparison
      } else {
        // Initialize with 0% if no data
        const initialPercentages = {};
        gradeSubject[0]?.data?.forEach(subject => {
          initialPercentages[subject.subject_id] = 0;
        });
        setSubjectPercentages({...initialPercentages});
        setInitialPercentages({...initialPercentages});
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching percentages:", error);
      Alert.alert("Error", "Failed to fetch level pass percentages");
      setLoading(false);
    }
  };

  const updatePercentages = async () => {
    try {
      setUpdating(true);
      
      // Prepare all updates
      const updates = [];
      Object.keys(subjectPercentages).forEach(subjectId => {
        if (subjectPercentages[subjectId] !== initialPercentages[subjectId]) {
          updates.push({
            grade_id: gradeID,
            subject_id: subjectId,
            percent: subjectPercentages[subjectId]
          });
        }
      });

      if (updates.length === 0) {
        Alert.alert("Info", "No changes to save");
        navigation.goBack();
        return;
      }

      const response = await fetch(`${API_URL}/api/coordinator/updateLevelPassPercentages`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert("Success", "Percentages updated successfully");
        navigation.goBack();
      } else {
        Alert.alert("Error", data.message || "Failed to update percentages");
      }
    } catch (error) {
      console.error("Error updating percentages:", error);
      Alert.alert("Error", "Failed to update percentages");
    } finally {
      setUpdating(false);
    }
  };

  const increasePercentage = (subjectId) => {
    const currentPercent = subjectPercentages[subjectId] || 0;
    const newPercent = Math.min(100, currentPercent + 5);
    
    setSubjectPercentages(prev => ({
      ...prev,
      [subjectId]: newPercent
    }));
  };

  const decreasePercentage = (subjectId) => {
    const currentPercent = subjectPercentages[subjectId] || 0;
    const newPercent = Math.max(0, currentPercent - 5);
    
    setSubjectPercentages(prev => ({
      ...prev,
      [subjectId]: newPercent
    }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading level promotion settings...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <BackIcon
            width={styles.BackIcon.width}
            height={styles.BackIcon.height}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTxt}>Level Promotion Settings</Text>
        </View>

        <Pressable
          style={[styles.activeButton, styles.gradeselection]}
        >
          <Text style={styles.activeText}>
            Grade {activeGrade}
          </Text>
        </Pressable>

        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>
            Set minimum mark percentage for level promotion
          </Text>

          <View style={styles.subjectsContainer}>
            {gradeSubject.length > 0 && gradeSubject[0].data.length > 0 ? (
              gradeSubject[0].data.map((subject) => (
                <View key={subject.subject_id} style={styles.subjectRow}>
                  <Text style={styles.subjectName}>{subject.subject_name}</Text>
                  <View style={styles.percentageSelector}>
                    <TouchableOpacity
                      style={styles.percentageButton}
                      onPress={() => decreasePercentage(subject.subject_id)}
                      disabled={updating}
                    >
                      <Text style={styles.percentageButtonText}>-</Text>
                    </TouchableOpacity>
                    <View style={styles.percentageDisplay}>
                      <Text style={styles.percentageText}>
                        {subjectPercentages[subject.subject_id] || 0}%
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.percentageButton}
                      onPress={() => increasePercentage(subject.subject_id)}
                      disabled={updating}
                    >
                      <Text style={styles.percentageButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noSubjectsText}>No subjects available for this grade</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={updatePercentages}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LevelPromotion;
