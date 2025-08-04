import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import styles from '../Subject/SubjectStyle';
import BackIcon from '../../../../assets/CoordinatorPage/MaterialHome/Back.svg';

const SubjectActivityPage = ({ navigation, route }) => {
  const { grade, subject, subjectID, gradeID, activities } = route.params || {};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <View style={styles.header}>
        <BackIcon
          width={styles.BackIcon.width}
          height={styles.BackIcon.height}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTxt}>{subject} - {grade}</Text>
      </View>

      <ScrollView style={styles.scrollViewContent}>
        <View style={styles.gradeContainer}>
          <Text style={styles.gradeText}>Select Activity Type</Text>
          
          {activities && activities.length > 0 ? (
            activities.map((activity, index) => (
              <TouchableOpacity
                key={activity.section_subject_activity_id}
                style={[styles.levelContainer, { marginTop: 15 }]}
                onPress={() => {
                  navigation.navigate('SubjectPage', {
                    grade,
                    gradeID,
                    subject,
                    subjectID,
                    activity_name: activity.activity_name,
                    section_subject_activity_id: activity.section_subject_activity_id
                  });
                }}
              >
                <View style={styles.levelHeader}>
                  <Text style={styles.levelTitle}>{activity.activity_name}</Text>
                  <Text style={styles.expectedDate}>Tap to view materials</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noMaterialsContainer}>
              <Text style={styles.noMaterialsText}>No activities found for this subject</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SubjectActivityPage;
