import React from 'react';
import {  View,  Text,  TouchableOpacity,  SafeAreaView,  ScrollView,} from 'react-native';
import Arrow from '../../assets/arrow.svg';
import Book from '../../assets/book.svg';
import Plus from '../../assets/plus.svg';
import styles from './homeworkliststy';


const mockData = [
  {
    date: '20/10/2024',
    grades: [
      {
        title: 'Grade 1',
        subjects: [
          {name: 'Science', level: 'Level 1', status: 'Evaluated'},
          {name: 'Social', level: 'Level 1', status: 'Evaluate'},
        ],
      },
      {
        title: 'Grade 2',
        subjects: [
          {name: 'Science', level: 'Level 1', status: 'Evaluated'},
          {name: 'Social', level: 'Level 1', status: 'Evaluate'},
        ],
      },
      {
        title: 'Grade 1',
        subjects: [
          {name: 'Science', level: 'Level 1', status: 'Evaluated'},
          {name: 'Social', level: 'Level 1', status: 'Evaluate'},
        ],
      },
      {
        title: 'Grade 1',
        subjects: [
          {name: 'Science', level: 'Level 1', status: 'Evaluated'},
          {name: 'Social', level: 'Level 1', status: 'Evaluate'},
        ],
      },
    ],
  },
  {
    date: '21/10/2024',
    grades: [
      {
        title: 'Grade 1',
        subjects: [
          {name: 'Math', level: 'Level 2', status: 'Evaluate'},
          {name: 'English', level: 'Level 1', status: 'Evaluated'},
        ],
      },
      {
        title: 'Grade 1',
        subjects: [
          {name: 'Math', level: 'Level 2', status: 'Evaluate'},
          {name: 'English', level: 'Level 1', status: 'Evaluated'},
        ],
      },
      {
        title: 'Grade 1',
        subjects: [
          {name: 'Math', level: 'Level 2', status: 'Evaluate'},
          {name: 'English', level: 'Level 1', status: 'Evaluated'},
        ],
      },
      {
        title: 'Grade 1',
        subjects: [
          {name: 'Math', level: 'Level 2', status: 'Evaluate'},
          {name: 'English', level: 'Level 1', status: 'Evaluated'},
        ],
      },
      {
        title: 'Grade 1',
        subjects: [
          {name: 'Math', level: 'Level 2', status: 'Evaluate'},
          {name: 'English', level: 'Level 1', status: 'Evaluated'},
        ],
      },
    ],
  },
  {
    date: '21/10/2024',
    grades: [
      {
        title: 'Grade 1',
        subjects: [
          {name: 'Math', level: 'Level 2', status: 'Evaluate'},
          {name: 'English', level: 'Level 1', status: 'Evaluated'},
        ],
      },
      {
        title: 'Grade 1',
        subjects: [
          {name: 'Math', level: 'Level 2', status: 'Evaluate'},
          {name: 'English', level: 'Level 1', status: 'Evaluated'},
        ],
      },
      {
        title: 'Grade 1',
        subjects: [
          {name: 'Math', level: 'Level 2', status: 'Evaluate'},
          {name: 'English', level: 'Level 1', status: 'Evaluated'},
        ],
      },
      {
        title: 'Grade 1',
        subjects: [
          {name: 'Math', level: 'Level 2', status: 'Evaluate'},
          {name: 'English', level: 'Level 1', status: 'Evaluated'},
        ],
      },
      {
        title: 'Grade 1',
        subjects: [
          {name: 'Math', level: 'Level 2', status: 'Evaluate'},
          {name: 'English', level: 'Level 1', status: 'Evaluated'},
        ],
      },
    ],
  },
];

const HomeworkList = ({navigation}) => {
  return (
    <SafeAreaView style={{height: '100%'}}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Arrow width={35} height={35} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Homework</Text>
      </View>
      <View style={styles.headerBorder} />

      <ScrollView contentContainerStyle={{paddingBottom: 50}}>
        <View style={styles.container}>
          {mockData.map((entry, idx) => (
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
                    <View style={{flex: 1}}>
                      <Text style={styles.gradeText}>{grade.title}</Text>
                      {grade.subjects.map((subject, sIdx) => (
                        <View key={sIdx} style={styles.subjectRow}>
                          <Book width={20} height={20} />
                          <Text style={styles.subjectText}>
                            {subject.name} – {subject.level}
                          </Text>
                          <Text
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
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Homework')}>
        <Plus width={28} height={28} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default HomeworkList;
