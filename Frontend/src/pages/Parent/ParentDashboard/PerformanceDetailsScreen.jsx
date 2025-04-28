import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PreviousIcon from '../../../assets/ParentPage/LeaveIcon/PrevBtn.svg';
import { useNavigation } from "@react-navigation/native";
import styles from "./ParentDashboardStyles";
// Import PerformanceGraph component
import PerformanceGraph from "../../../components/Parent/PerformanceGraph/PerformanceGraph";

const PerformanceDetailsScreen = ({ route }) => {
  const { data, activeTab } = route.params;
  const navigation = useNavigation();

  const individualPerformanceData = {
    date: "23/02/25",
    level: "Level 2",
    rank: "3rd",
    highestScore: 99,
    score: "90/100",
    classAverage: 70,
    ClassType: "Assessment",  //if academic or assessment it will show the assessment score and if it is academic it will show the academic score
    MaterialLink: "Assessment.pdf",
    disciplineScore: 10,
    disciplineTotal: 10,
    homeworkScore: 10,
    homeworkTotal: 10,
    assessmentScore: 70,
    assessmentTotal: 80,
    academicScore: 70,
    academicTotal: 80,
    ClassStatus: "Attentive",
  };

  return (
    <SafeAreaView style={styles.detailsContainer}>
      <ScrollView style={styles.detailsScrollView}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <PreviousIcon width={24} height={24} />
          <Text style={styles.backButtonText}>Dashboard</Text>
        </TouchableOpacity>

        {/* Use the PerformanceGraph component */}
        <PerformanceGraph 
          showTitle={true}
          // Pass an empty function to disable navigation since we're already on the details screen
          onBarPress={() => {}} 
        />

        {/* Individual Performance */}
        <Text style={styles.sectionTitle}>Individual performance</Text>

        <View style={[styles.performanceCard, { padding: 16 }]}>
          <View>
            <Text style={styles.performanceDate}>{individualPerformanceData.date}</Text>
          </View>

          <View style={[styles.performanceCardHeader]}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{individualPerformanceData.level}</Text>
            </View>

            <View>
              {individualPerformanceData.ClassType === "Academic" ? (
                <Text style={[styles.rankText, { color: '#27AE60' }]}>{individualPerformanceData.ClassStatus}</Text>
              ) : (
                <Text style={[styles.rankText, { color: '#F7A325' }]}>Rank: {individualPerformanceData.rank}</Text>
              )}
            </View>

            <View>
              <Text style={styles.ClassTypeText}>{individualPerformanceData.ClassType}</Text>
            </View>
          </View>

          {/* Performance Details */}
          {individualPerformanceData.ClassType === "Assessment" && (
            <View style={[styles.performanceStats, { marginBottom: 12 }]}>
              <View style={{justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row'}}>
                <View style={[styles.statsRow, { marginBottom: 4 }]}>
                  <Text style={styles.statLabel}>Highest Score:</Text>
                  <Text style={[styles.statValue, { color: '#333' }]}>{individualPerformanceData.highestScore}</Text>
                </View>

                <View style={[styles.statsRow, { marginBottom: 4 }]}>
                  <Text style={styles.statLabel}>Score:</Text>
                  <Text style={[styles.statValue, { color: '#333' }]}>{individualPerformanceData.score}</Text>
                </View>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>Class Average:</Text>
                <Text style={[styles.statValue, { color: '#333' }]}>{individualPerformanceData.classAverage}</Text>
              </View>
            </View>
          )}

          <View style={styles.assessmentDetails}>
            <TouchableOpacity>
              <Text style={[styles.MaterialLink, { color: '#0C36FF', marginBottom: 8 }]}>
                {individualPerformanceData.MaterialLink}
              </Text>
            </TouchableOpacity>

            <View style={[styles.assessmentItem, { marginBottom: 6 }]}>
              <View style={[styles.assessmentDot, { backgroundColor: '#AEBCFF' }]} />
              <Text style={styles.assessmentLabel}>Discipline: </Text>
              <Text style={styles.assessmentValue}>
                {individualPerformanceData.disciplineScore} <Text style={styles.assessmentTotal}>/{individualPerformanceData.disciplineTotal}%</Text>
              </Text>
            </View>

            <View style={[styles.assessmentItem, { marginBottom: 6 }]}>
              <View style={[styles.assessmentDot, { backgroundColor: '#5D79FF' }]} />
              <Text style={styles.assessmentLabel}>Home work:</Text>
              <Text style={styles.assessmentValue}>
                {individualPerformanceData.homeworkScore} <Text style={styles.assessmentTotal}>/{individualPerformanceData.homeworkTotal}%</Text>
              </Text>
            </View>

            <View style={styles.assessmentItem}>
              <View style={[styles.assessmentDot, { backgroundColor: '#0027E3' }]} />
              <Text style={styles.assessmentLabel}>{individualPerformanceData.ClassType}:</Text>

              {individualPerformanceData.ClassType === "Academic" ? (
                <Text style={styles.assessmentValue}>
                  {individualPerformanceData.academicScore}
                  <Text style={styles.assessmentTotal}>/{individualPerformanceData.academicTotal}%</Text>
                </Text>
              ) : (
                <Text style={styles.assessmentValue}>
                  {individualPerformanceData.assessmentScore}
                  <Text style={styles.assessmentTotal}>/{individualPerformanceData.assessmentTotal}%</Text>
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PerformanceDetailsScreen;