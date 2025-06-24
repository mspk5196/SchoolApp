import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, RefreshControl } from 'react-native';
import Arrow from '../../../assets/MentorPage/arrow.svg';
import Book from '../../../assets/MentorPage/book.svg';
import Plus from '../../../assets/MentorPage/plus.svg';
import styles from './homeworkliststy';
import { API_URL } from '../../../utils/env.js';

const MentorHomeworkList = ({ navigation, route }) => {
  const { mentorData } = route.params;
  const [homeworkData, setHomeworkData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchHomeworkData();
    setRefreshing(true);
   
  }, []);

  const fetchHomeworkData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/mentor/getHomeworkList?mentorId=${mentorData[0].id}`);
      const data = await response.json();

      if (data.success) {
        // Group by date
        const groupedData = data.homeworkList.reduce((acc, item) => {
          const date = item.formatted_date;
          if (!acc[date]) {
            acc[date] = [];
          }

          acc[date].push({
            title: item.grade_name,
            subject: {
              name: item.subject_name,
              level: `Level ${item.level}`,
              status: item.notCom_count != 0 ||item.redo_count != 0 ? 'Evaluate' : 'Evaluated',
              homeworkId: item.id
            }
          });

          return acc;
        }, {});

        // Convert to array format
        const formattedData = Object.entries(groupedData).map(([date, grades]) => ({
          date,
          grades: grades.reduce((acc, grade) => {
            const existingGrade = acc.find(g => g.title === grade.title);
            if (existingGrade) {
              existingGrade.subjects.push(grade.subject);
            } else {
              acc.push({
                title: grade.title,
                subjects: [grade.subject]
              });
            }
            return acc;
          }, [])
        }));
        
        setHomeworkData(formattedData);
        setRefreshing(false);
      }
    } catch (error) {
      console.error('Error fetching homework data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectPress = (homeworkId, status) => {
    if (status === 'Evaluate') {
      navigation.navigate('MentorHomeWorkDetail', { homeworkId });
    }
  };

  return (
    <SafeAreaView style={{ height: '100%' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Arrow width={35} height={35} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Homework</Text>
      </View>
      <View style={styles.headerBorder} />

      <ScrollView contentContainerStyle={{ paddingBottom: 50 }} refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await fetchHomeworkData();
            setRefreshing(false);
          }}
          colors={['#3557FF']}
          tintColor="#3557FF"
        />
      }>
        <View style={styles.container}>
          {loading ? (
            <Text>Loading...</Text>
          ) : homeworkData.length > 0 ? (
            homeworkData.map((entry, idx) => (
              <View key={idx} style={styles.dateGroup}>
                <Text style={styles.dateText}>{entry.date}</Text>
                <View style={styles.card}>
                  {entry.grades.map((grade, gIdx) => (
                    <View key={gIdx} style={styles.gradeBlock}>
                      <View style={styles.circleLine}>
                        <View style={styles.circle} />
                        {gIdx < entry.grades.length - 1 && (
                          <View style={styles.verticalLine} />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.gradeText}>{grade.title}</Text>
                        {grade.subjects.map((subject, sIdx) => (
                          <View key={sIdx} style={styles.subjectRow}>
                            <Book width={20} height={20} />
                            <Text style={styles.subjectText}>
                              {subject.name} – {subject.level}
                            </Text>
                            <Text
                              onPress={() => handleSubjectPress(subject.homeworkId, subject.status)}
                              style={[
                                styles.statusText,
                                subject.status === 'Evaluated'
                                  ? styles.greenStatus
                                  : styles.blueStatus,
                              ]}>
                              {subject.status}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))
          ) : (
            <Text>No homework assignments found</Text>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => navigation.navigate('MentorHomework', { mentorId: mentorData[0].id })}>
        <Plus width={28} height={28} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default MentorHomeworkList;