import { Text, View, TouchableOpacity, FlatList, ScrollView, Image, Modal, SafeAreaView, Linking, Alert, Platform } from 'react-native';
import PreviousIcon from '../../../assets/ParentPage/basic-img/Backicon.svg';
import styles from './ScheduleScreenStyles';
import ProfileImg from '../../../assets/ParentPage/ScheduleSvg/profile.png';
import { API_URL } from '@env';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import { useEffect, useState } from 'react';
import Nodata from '../../../components/General/Nodata';
import mime from 'react-native-mime-types';

const ClassDetailScreen = ({ selectedClass,
  setSelectedClass,
  studentData,
  date,
  activeTab,
  setActiveTab }) => {
  if (!selectedClass) return null;
  // console.log(studentData,
  // date,
  // activeTab);


  const isFutureDateTime = () => {
    if (!date || !selectedClass?.time) return false;
    // Combine date and start time
    const dateStr = date; // 'YYYY-MM-DD'
    const timeStr = selectedClass.time.split('-')[0].trim(); // e.g., '9:00 AM'
    const dateTimeStr = `${dateStr} ${timeStr}`;
    const classDateTime = new Date(dateTimeStr);
    const now = new Date();
    return classDateTime > now;
  };

  const [data, setData] = useState([]);


  const fetchAssessmentDetails = async () => {

    try {
      const res = await fetch(`${API_URL}/api/student/getAssessmentDetails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentRoll: studentData.roll,
          sectionId: studentData.section_id,
          subject: selectedClass.subject,
          date: date
        })
      });
      const assessment = await res.json();

      if (assessment) {
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
          materials: assessment.materials,
          students: assessment.students // ✅ add this
        };
        setData(detailsData || []);
      }

      console.log("Assessment Details:", detailsData);
      // if (assessment.score) {
      //   return <Nodata />
      // }
    } catch (error) {
      console.error('Error fetching assessment details:', error);
    }
  };
  const fetchAcademicDetails = async () => {
    try {
      const res2 = await fetch(`${API_URL}/api/student/getAcademicDetails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: studentData.student_id,
          sectionId: studentData.section_id,
          subject: selectedClass.subject,
          date: date
        })
      });
      const academic = await res2.json();
      detailsData = {
        type: 'Academics',
        attentiveness: academic.attentiveness,
        level: academic.level,
        disciplinePercent: academic.disciplinePercent,
        homeworkPercent: academic.homeworkPercent,
        academicPercent: academic.academicPercent,
        materials: academic.materials || []
      };
      setData(detailsData || []);
      // console.log("Academic Details:", detailsData);

    } catch (error) {
      console.error('Error fetching assessment details:', error);
    }
  };

  useEffect(() => {
    console.log(selectedClass.activity);

    if (selectedClass.activity === 'Assessment') {
      fetchAssessmentDetails();
    }
    else if (selectedClass.activity === 'Academics') {
      fetchAcademicDetails();
    }
    else {
      setData([]);
    }
  }, [selectedClass]);

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

  const getProfileImageSource = (profilePath) => {
    if (profilePath) {
      // 1. Replace backslashes with forward slashes
      const normalizedPath = profilePath.replace(/\\/g, '/');
      // 2. Construct the full URL
      const fullImageUrl = `${API_URL}/${normalizedPath}`;
      return { uri: fullImageUrl };
    } else {
      return ProfileImg;
    }
  };
  const getMaterialUrl = (fileUrl) => {
    // console.log("File URL:", `${API_URL}${fileUrl}`);

    if (!fileUrl) return '';
    return `${API_URL}/${fileUrl}`;
  };

  // if (!data) return <Nodata />

  return (
    <SafeAreaView style={styles.detailContainer}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => setSelectedClass(null)} style={styles.backButton}>
          <PreviousIcon width={24} height={24} />
          <Text style={styles.headerText}>Schedule</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'academic' ? styles.activeTabButton : styles.inactiveTabButton
          ]}
          onPress={() => setActiveTab('academic')}
        >
          <Text style={activeTab === 'academic' ? styles.activeTabText : [styles.inactiveTabText, { color: 'black' }]}>
            Academic schedule
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'exam' ? styles.activeTabButton : styles.inactiveTabButton
          ]}
          onPress={() => {
            setActiveTab('exam');
            setSelectedClass(null);
          }}
        >
          <Text style={activeTab === 'exam' ? styles.activeTabText : [styles.inactiveTabText, { color: 'black' }]}>
            Exam schedule
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.detailScrollView}>
        {/* Class preview card */}
        <View style={[styles.academicItemContainer, { backgroundColor: selectedClass.color }]}>
          <View style={styles.academicItemInfoContainer}>
            <Text style={styles.academicItemSubject}>{selectedClass.subject}</Text>
            <Text style={styles.academicItemGrade}>
              Grade {selectedClass.gradeId} - Section {selectedClass.sectionName}
            </Text>
            <Text style={{
              ...styles.academicItemType, color: selectedClass.color === '#E8F5E9' ? '#4CAF50' :
                selectedClass.color === '#FFEBEE' ? '#F44336' :
                  '#FF9800'
            }}>
              {selectedClass.activity}
            </Text>
          </View>
          <View style={styles.academicItemTimeContainer}>
            <Text style={styles.academicItemTime}>{selectedClass.time}</Text>
          </View>
        </View>

        {/* Date and session info */}
        <View style={styles.detailInfoContainer}>
          {(selectedClass.activity === 'Assessment' || selectedClass.activity === 'Academics') && isFutureDateTime() ? (
            <Nodata />
          ) : (
            <>
              <Text style={styles.detailDateText}>{date || ''}</Text>
              <View style={styles.detailInfoRow}>
                <View style={styles.detailInfoInside}>
                  <View style={styles.levelContainer}>
                    <Text style={styles.levelText}>
                      Level {data.level || selectedClass.sessionNo || '-'}
                    </Text>
                  </View>
                  {data.rank && (
                    <View style={styles.rankContainer}>
                      <Text style={styles.rankText}>Rank : {data.rank}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.assessmentText}>
                  {selectedClass.activity === 'Assessment' ? 'Assessment' : 'Academic'}
                </Text>
              </View>

              {/* Assessment details */}
              {selectedClass.activity === 'Assessment' && (
                <View style={styles.scoresContainer}>
                  <View style={styles.scoreincont}>
                    <View style={styles.scoreRow}>
                      <Text style={styles.scoreLabel}>Highest Score :</Text>
                      <Text style={styles.scoreValue}>{data.highestScore || '-'}</Text>
                    </View>
                    <View style={styles.scoreRow}>
                      <Text style={styles.scoreLabel}>Class Average :</Text>
                      <Text style={styles.scoreValue}>{data.classAverage || '-'}</Text>
                    </View>
                  </View>
                  <View style={styles.scoreincont}>
                    <View style={styles.scoreRow}>
                      <Text style={styles.scoreLabel}>Score :</Text>
                      <Text style={styles.scoreValue}>{data.score || '-'}</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Academic details */}
              {selectedClass.activity === 'Academics' && (
                <View style={styles.scoresContainer}>
                  <View style={styles.scoreincont}>
                    <View style={styles.scoreRow}>
                      <Text style={styles.scoreLabel}>Attentiveness :</Text>
                      <Text style={styles.scoreValue}> {data.attentiveness || '-'}</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* PDF download for assessment */}
              {Array.isArray(data.materials) && data.materials.map((file, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <TouchableOpacity
                    onPress={() => openFileLikeWhatsApp(`${API_URL}/${file.file_url}`, file.file_name)}
                    style={[styles.pdfButton, { marginRight: 10 }]}
                  >
                    <Text style={styles.pdfButtonText}>{(file.file_name).replace(/%/g, ' ')}</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {/* Teacher/mentor info */}
              <View style={styles.teacherContainer}>
                <Image source={getProfileImageSource(selectedClass.filePath)} style={styles.teacherAvatar} />
                <Text style={styles.teacherName}>{selectedClass.mentor || 'Mentor'}</Text>
              </View>
            </>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default ClassDetailScreen;