import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View, ScrollView, Pressable, SectionList, Alert, TouchableOpacity } from 'react-native';
import styles from './MaterialHomeStyle';
import HomeIcon from '../../../../assets/CoordinatorPage/MaterialHome/Home.svg';
import LevelPromotionIcon from '../../../../assets/CoordinatorPage/MaterialHome/LevelPromotion.svg';
import { API_URL } from "@env";

const CoordinatorMaterialHome = ({ navigation, route }) => {
  const { coordinatorData, coordinatorGrades } = route.params || {};
  const [gradeSubject, setGradeSubject] = useState([]);
  const [activeGrade, setActiveGrade] = useState();

  useEffect(() => {
    fetchGradeSubjects();
  }, [activeGrade]);
  useEffect(() => {
    if (coordinatorGrades) {
      setActiveGrade(coordinatorGrades[0].grade_id)
    }
  }, [coordinatorGrades])

  const fetchGradeSubjects = async () => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/getGradeSubject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gradeID: activeGrade }),
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
        Alert.alert("No Subjects", "No subjects for this section");
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Failed to fetch subjects");
    }
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
    <ScrollView flexgrow={1} flex={1}>
      <View style={styles.Header}>
        <HomeIcon
          width={styles.HomeIcon.width}
          height={styles.HomeIcon.height}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.HeaderTxt}>Material</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sectionTabsContainer}
      >
        {coordinatorGrades?.map(grade => (
          <TouchableOpacity
            key={grade.grade_id}
            style={[styles.sectionTab, activeGrade === grade.grade_id && styles.activeSectionTab]}
            onPress={() => setActiveGrade(grade.grade_id)}
          >
            <Text style={[styles.sectionTabText, activeGrade === grade.grade_id && styles.activeSectionTabText]}>
              Grade {grade.grade_id}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <SectionList
        sections={gradeSubject}
        keyExtractor={(item) => item.key} // Use the unique key we created
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              navigation.navigate('SubjectPage', {
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
            grade: `Grade ${activeGrade}`,
            gradeID: activeGrade,
            gradeSubject: gradeSubject
          });
        }}
      >
        <Cards
          title="Level Promotion"
          Icon={<LevelPromotionIcon width={50} height={50} />}
          bgColor='#EBEEFF'
          color='#3557FF'
        />
      </Pressable>
    </ScrollView>
  );
}

export default CoordinatorMaterialHome;