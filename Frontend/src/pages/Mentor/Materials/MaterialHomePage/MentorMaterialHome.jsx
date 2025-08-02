import React, { useEffect, useState } from 'react';
import { Text, View, Pressable, SectionList, Alert, FlatList, ActivityIndicator } from 'react-native';
import styles from './MaterialHomeStyle';
import HomeIcon from '../../../../assets/CoordinatorPage/MaterialHome/Home.svg';
import { API_URL } from "../../../../utils/env.js";
import Nodata from '../../../../components/General/Nodata.jsx';

const MentorMaterialHome = ({ navigation, route }) => {
  const { mentorData } = route.params || {};
  const [gradeSubject, setGradeSubject] = useState([]);
  const [grades, setGrades] = useState([]);
  const [activeGrade, setActiveGrade] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   fetchGradeSubjects();
  // }, [activeGrade]);

  useEffect(()=>{
    fetchGrade();
  },[])

  const fetchGradeSubjects = async (gradeID) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/mentor/getGradeSubject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gradeID }),
      });
      const data = await response.json();
      if (data.success) {
        // Ensure each item has a unique key
        const subjectsWithKeys = data.gradeSubjects.map((subject, index) => ({
          ...subject,
          key: `${subject.subject_id}-${index}` // Create a unique key
        }));

        setGradeSubject([{
          title: 'Subjects',
          data: subjectsWithKeys
        }]);
      } else {
        setGradeSubject([]);
        // Don't show an alert, we'll display the NoData component instead
      }
    } catch (error) {
      console.error("Error:", error);
      setGradeSubject([]);
      Alert.alert("Error", "Failed to fetch subjects");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchGrade = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/mentor/getGrades`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.success && data.grades.length > 0) {
        setGrades(data.grades);
        
        setActiveGrade(data.grades[0].id);
        await fetchGradeSubjects(data.grades[0].id);
      } else {
        setGrades([]);
        setGradeSubject([]);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setGrades([]);
      setGradeSubject([]);
      Alert.alert("Error", "Failed to fetch grades");
      setIsLoading(false);
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    if (activeGrade) {
      fetchGradeSubjects(activeGrade);
    } else if (grades.length > 0) {
      fetchGradeSubjects(grades[0].id);
    } else {
      fetchGrade();
    }
  };

  const handleGradePress = (gradeID) => {
    setActiveGrade(gradeID);
    fetchGradeSubjects(gradeID)
  };

  const Cards = ({ title, Icon, bgColor, color }) => {
    const isLevelPromotion = title === 'Level Promotion';

    return (
      <View style={[styles.card, { backgroundColor: bgColor }]}>
        {isLevelPromotion ? (
          <>
            {Icon}
            <Text style={[styles.cardText, { color: color }]}>{title}</Text>
          </>
        ) : (
          <View style={styles.centeredCardContent}>
            <Text style={[styles.cardText, styles.centeredText, { color: color }]}>{title}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View flexgrow={1} flex={1}>
      <View style={styles.Header}>
        <HomeIcon
          width={styles.HomeIcon.width}
          height={styles.HomeIcon.height}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.HeaderTxt}>Material</Text>
      </View>

      <FlatList
        data={grades}
        horizontal
        style={styles.gradeList}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.gradeItem, activeGrade === item.id && styles.selectedGrade]}
            onPress={() => handleGradePress(item.id)}
          >
            <Text
              style={[styles.gradeText, activeGrade === item.id && styles.selectedGradeText]}
            >
              {item.grade_name}
            </Text>
          </Pressable>
        )}
      />

      <SectionList
        sections={gradeSubject}
        style={styles.subjectListContainer}
        contentContainerStyle={gradeSubject.length === 0 || gradeSubject[0]?.data.length === 0 ? styles.emptyContainer : null}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.noDataContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#2563EB" />
            ) : (
              <Nodata />
            )}
          </View>
        }
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              navigation.navigate('MentorSubjectPage', {
                grade: `Grade ${activeGrade}`,
                gradeID: activeGrade,
                subject: item.subject_name,
                subjectID: item.subject_id
              });
            }}
          >
            <Cards
              title={item.subject_name}
              bgColor={(item.subject_id % 2) ? '#C9F7F5' : '#65558F12'}
              color={(item.subject_id % 2) ? '#0FBEB3' : '#65558F'}
            />
          </Pressable>
        )}
        renderSectionHeader={() => null}
      />

      <Pressable
        onPress={() => {
          navigation.navigate('LevelPromotion', {
            grade: `Grade ${coordinatorData.grade_id}`,
            gradeID: coordinatorData.grade_id,
            gradeSubject: gradeSubject
          });
        }}
      >
      </Pressable>
    </View>
  );
}

export default MentorMaterialHome;