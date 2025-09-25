import { apiFetch } from "../../../../utils/apiClient.js";
import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { API_URL } from '../../../../utils/env.js';
import styles from "./Surveysty";
import Back from "../../../../assets/MentorPage/backarrow.svg";
import Add from "../../../../assets/MentorPage/plus.svg";
import Home from "../../../../assets/MentorPage/Home2.svg";
import { widthPercentageToDP } from "react-native-responsive-screen";

const MentorSurvey = ({ navigation, route }) => {
  const { mentorData } = route.params;
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMentorSurveys();

    const unsubscribe = navigation.addListener('focus', () => {
      fetchMentorSurveys();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchMentorSurveys = () => {
    setRefreshing(true);
    apiFetch(`/mentor/survey/mentor/${mentorData[0].id}`)
      .then(response => {
        if (!response) {
          throw new Error('Failed to fetch surveys');
        }
        return response;
      })
      .then(data => {
        const formattedSurveys = data.map(survey => ({
          ...survey,
          time: `${new Date(survey.start_date).toLocaleDateString()} - ${new Date(survey.end_date).toLocaleDateString()}`
        }));
        setSurveys(formattedSurveys);
        console.log(formattedSurveys);
        
      })
      .catch(error => {
        console.error('Error fetching surveys:', error);
        Alert.alert('Error', error.message || 'Failed to load surveys');
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  const handleEndSurvey = (surveyId) => {
    Alert.alert(
      "End Survey",
      "Are you sure you want to end this survey now?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End Survey",
          style: "destructive",
          onPress: () => {
            apiFetch(`/mentor/survey/end/${surveyId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              }
            })
              .then(response => {
                if (!response) {
                  throw new Error('Failed to end survey');
                }
                fetchMentorSurveys();
                Alert.alert('Success', 'Survey ended successfully');
              })
              .catch(error => {
                console.error('Error ending survey:', error);
                Alert.alert('Error', error.message || 'Failed to end survey');
              });
          }
        }
      ]
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No surveys found</Text>
      <Text style={styles.emptySubText}>Tap the + button to create a new survey</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.activityHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Back height={30} width={30} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.activityText}>Surveys</Text>
      </View>
      <View style={styles.underline} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading surveys...</Text>
        </View>
      ) : (
        <FlatList
          data={surveys}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity
                onPress={() => navigation.navigate("MentorSurveyDetails", { item, mentorData })}>

                <View style={styles.header}>
                  <Text style={styles.title}>{item.title}</Text>
                  <View style={styles.statusContainer}>
                    <View style={[styles.statusDot, {
                      backgroundColor: item.status === "Active" ? "#34C300" : "#EB4B42"
                    }]} />
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>

                <View style={styles.info}>
                  <Text style={styles.gradeText}>
                    {item.grade_name ? `${item.grade_name}` : 'All Grades'}
                    {item.section_name ? ` • Section ${item.section_name}` : ''}
                  </Text>

                  {/* <Text style={styles.taskType}>
                  {item.task_type === 'Collect Fee' ? '💰 Fee Collection' : 
                   item.task_type === 'Feedback' ? '📝 Feedback' : '📌 Other'}
                </Text> */}

                  {/* {item.amount && (
                  <Text style={styles.amount}>Amount: ₹{parseFloat(item.amount).toFixed(2)}</Text>
                )} */}

                  <Text style={[
                    styles.time,
                    item.status === "Active" ? styles.activeTime : styles.inactiveTime
                  ]}>
                    {item.time}
                  </Text>
                </View>

                <Text style={styles.studentCount}>{item.student_count || 0} Students</Text>

                {item.status === "Active" && (
                  <TouchableOpacity
                    style={styles.surveyButton}
                    onPress={() => handleEndSurvey(item.id)}>
                    <Text style={styles.surveyButtonText}>End Survey Now</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            </View>

          )}
          refreshing={refreshing}
          onRefresh={fetchMentorSurveys}
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={surveys.length === 0 ? { flex: 1 } : {}}
        />
      )}

      <View style={styles.activityIcons}>
        <TouchableOpacity
          style={styles.addIcon}
          onPress={() => navigation.navigate("MentorSurveyRegister", { mentorData })}>
          <Add width={widthPercentageToDP('8.5%')} height={widthPercentageToDP('8.5%')} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.homeIcon}
          onPress={() => navigation.navigate("MentorMain", { mentorData })}>
          <Home />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MentorSurvey;