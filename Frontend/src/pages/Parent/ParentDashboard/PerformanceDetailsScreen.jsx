import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PreviousIcon from '../../../assets/ParentPage/LeaveIcon/PrevBtn.svg';
import { useNavigation, useRoute } from "@react-navigation/native";
import styles from "./ParentDashboardStyles";
import PerformanceGraph from "../../../components/Parent/PerformanceGraph/PerformanceGraph";
import { API_URL } from "@env";
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import mime from 'react-native-mime-types';

const PerformanceDetailsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { data, activeTab, studentData } = route.params;
  // console.log(studentData);

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        let detailsData = {};

        // Only fetch if subject is selected (subject-wise tab)
        if (route.params.subject) {
          // 1. Try to fetch assessment details for this subject and date
          const res = await fetch(`${API_URL}/api/student/getAssessmentDetails`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              studentRoll: studentData.roll,  // Use roll instead of studentId
              sectionId: studentData.section_id,
              subject: route.params.subject,
              date: data.date
            })
          });
          const assessment = await res.json();

          if (assessment && assessment.hasAssessment) {
            // When setting detailsData for Assessment:
            detailsData = {
              type: 'Assessment',
              level: assessment.level,
              rank: assessment.rank,
              highestScore: assessment.highestScore,
              score: assessment.score,
              classAverage: assessment.classAverage,
              disciplinePercent: assessment.disciplinePercent,
              homeworkPercent: assessment.homeworkPercent,
              assessmentPercent: assessment.assessmentPercent,
              materials: assessment.materials || []
            };
          } else {
            // 2. Else, fetch academic details for this subject and date
            const res2 = await fetch(`${API_URL}/api/student/getAcademicDetails`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                studentId: studentData.student_id,
                sectionId: studentData.section_id,
                subject: route.params.subject,
                date: data.date
              })
            });
            const academic = await res2.json();
            // When setting detailsData for Academic:
            detailsData = {
              type: 'Academic',
              attentiveness: academic.attentiveness,
              level: academic.level,
              disciplinePercent: academic.disciplinePercent,
              homeworkPercent: academic.homeworkPercent,
              academicPercent: academic.academicPercent,
              materials: academic.materials || []
            };
            console.log("Performance Details:", academic);
          }
        }
        setDetails(detailsData);

      } catch (error) {
        console.error('Error fetching details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [data, activeTab, route.params.subject, studentData]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  const getPerformanceStatus = (score) => {
    if (score >= 70) return "Highly Attentive";
    if (score >= 40) return "Moderately Attentive";
    return "Not Attentive";
  };

  const openFileLikeWhatsApp = async (fileUrl, fileName) => {
    try {
      const localFile = `${RNFS.DownloadDirectoryPath}/${fileName}`;
      const downloadResult = await RNFS.downloadFile({
        fromUrl: fileUrl,
        toFile: localFile,
      }).promise;

      if (downloadResult.statusCode === 200) {
        // Get MIME type from file extension
        const mimeType = mime.lookup(fileName) || undefined;
        await FileViewer.open(localFile, { showOpenWithDialog: true, mimeType });
      } else {
        Alert.alert('Download failed', 'Could not download the file.');
      }
    } catch (err) {
      if (
        err &&
        (err.message?.includes('No app associated') ||
          err.message?.includes('no activity found to handle Intent'))
      ) {
        Alert.alert(
          'No App Found',
          'No app is installed to open this file type. Would you like to open it in your browser?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open in Browser',
              onPress: () => Linking.openURL(fileUrl),
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Could not open the file.');
      }
      console.error('File open error:', err);
    }
  };

  if (loading || !details) {
    return (
      <SafeAreaView style={styles.detailsContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

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

        <PerformanceGraph
          showTitle={true}
          studentData={studentData}
        />

        <Text style={styles.sectionTitle}>Individual performance</Text>

        <View style={[styles.performanceCard, { padding: 16 }]}>
          <View>
            <Text style={styles.performanceDate}>{data.date}</Text>
          </View>
          <View style={[styles.performanceCardHeader]}>
            <View className={styles.levelBadge}>
              <Text style={styles.levelText}>Level {details.level}</Text>
            </View>
            <View>
              <Text style={styles.ClassTypeText}>
                {details.type === 'Assessment' ? 'Assessment' : 'Academic'}
              </Text>
            </View>
          </View>

          {details.type === 'Assessment' ? (
            <>
              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>Rank:</Text>
                <Text style={styles.statValue}> {details.rank}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>Highest Score:</Text>
                <Text style={styles.statValue}> {details.highestScore} / 100</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>Your Score:</Text>
                <Text style={styles.statValue}>{details.score} / 100</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>Class Average:</Text>
                <Text style={styles.statValue}>{details.classAverage} / 100</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>Discipline:</Text>
                <Text style={styles.statValue}>{details.disciplinePercent}% / 10%</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>Homework:</Text>
                <Text style={styles.statValue}>{details.homeworkPercent}% / 10%</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>Assessment:</Text>
                <Text style={styles.statValue}>{details.assessmentPercent}% / 80%</Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>Attentiveness:</Text>
                <Text style={styles.statValue}> {details.attentiveness}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>Level:</Text>
                <Text style={styles.statValue}> {details.level}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>Discipline:</Text>
                <Text style={styles.statValue}>{details.disciplinePercent}% / 10%</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>Homework:</Text>
                <Text style={styles.statValue}>{details.homeworkPercent}% / 10%</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>Academic:</Text>
                <Text style={styles.statValue}>{details.academicPercent}% / 80%</Text>
              </View>
            </>
          )}
          {Array.isArray(details.materials) && details.materials.length > 0 && details.materials.map((file, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <TouchableOpacity
                onPress={() => openFileLikeWhatsApp(`${API_URL}/${file.file_url}`, file.file_name)}
                style={[styles.pdfButton, { marginRight: 10 }]}
              >
                <Text style={styles.MaterialLink}>{(file.file_name).replace(/%/g, ' ')}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PerformanceDetailsScreen;