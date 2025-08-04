import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Linking,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import styles from './MaterialScreenStyles.jsx';
import PDFicon from '../../../assets/ParentPage/Materials-img/pdf.svg';
import VideoIcon from '../../../assets/ParentPage/Materials-img/video-icon.svg'
import Download from '../../../assets/ParentPage/Materials-img/download.svg'
import { API_URL } from '../../../utils/env.js';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import Nodata from '../../../components/General/Nodata';
import mime from 'react-native-mime-types';
import BackIcon from '../../../assets/ParentPage/basic-img/Backicon.svg';
import HomeIcon from '../../../assets/ParentPage/NavImg/home.svg';

const StudentPageMaterialScreen = ({ route, navigation }) => {
  const { subject, subjectID, activity, activityID, section_subject_activity_id, activityData } = route.params || {};

  const [selectedTabs, setSelectedTabs] = useState({});
  const [completedLevels, setCompletedLevels] = useState([]);
  const [currentActiveLevel, setCurrentActiveLevel] = useState(1);
  const [materialsByLevel, setMaterialsByLevel] = useState([]);
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (activityData) {
      // Use the passed activity data
      setCompletedLevels(activityData.completedLevels || []);
      setMaterialsByLevel(groupMaterials(activityData.materials || []));

      // Set current active level to the next incomplete level
      const nextIncompleteLevel = findNextIncompleteLevel(activityData.completedLevels || [], activityData.materials || []);
      setCurrentActiveLevel(nextIncompleteLevel);
    }
  }, [activityData]);

  const findNextIncompleteLevel = (completed, materials) => {
    const allLevels = [...new Set(materials.map(m => m.level))].sort((a, b) => a - b);
    const nextIncomplete = allLevels.find(level => !completed.includes(level));
    return nextIncomplete || (allLevels.length > 0 ? allLevels[allLevels.length - 1] : 1);
  };

  const onRefresh = async () => {
    // For now, just refresh the current activity data
    // In a full implementation, you might want to refetch from the server
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Group materials by level and type
  const groupMaterials = (materials) => {
    const grouped = {};
    materials.forEach(item => {
      if (!grouped[item.level]) {
        grouped[item.level] = { level: item.level, pdfs: [], videos: [] };
      }
      const fileData = {
        name: item.file_name,
        url: item.file_url,
        title: item.title
      };

      if (item.material_type === 'PDF') {
        grouped[item.level].pdfs.push(fileData);
      } else if (item.material_type === 'Video') {
        grouped[item.level].videos.push(fileData);
      }
    });
    // Convert to sorted array by level
    return Object.values(grouped).sort((a, b) => a.level - b.level);
  };

  const openFileLikeWhatsApp = async (fileUrl, fileName) => {
    setDownloadProgress(0);
    const localFile = `${RNFS.DownloadDirectoryPath}/${fileName}`;

    try {
      const downloadResult = await RNFS.downloadFile({
        fromUrl: fileUrl,
        toFile: localFile,
        progress: (res) => {
          const percent = Math.floor((res.bytesWritten / res.contentLength) * 100);
          setDownloadProgress(percent);
        },
        progressDivider: 1,
      }).promise;

      setDownloadProgress(null);

      if (downloadResult.statusCode === 200) {
        const mimeType = mime.lookup(fileName) || undefined;
        await FileViewer.open(localFile, { showOpenWithDialog: true, mimeType });
      } else {
        Alert.alert('Download failed', 'Could not download the file.');
      }
    } catch (err) {
      setDownloadProgress(null);
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

  const renderPdfItem = (item) => {
    // console.log(item);

    return (
      <View style={styles.pdfItem} key={item.name + Math.random()}>
        <View style={styles.pdfIconContainer}>
          <PDFicon />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
          <Text style={styles.pdfName}>{(item.name).replace(/%/g, ' ')}</Text>
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() => openFileLikeWhatsApp(`${API_URL}/${item.url}`, item.name)}
          >
            <Download />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  const renderVideoItem = (item) => {
    return (
      <View style={styles.pdfItem} key={item.name + Math.random()}>
        <View style={styles.pdfIconContainer}>
          <VideoIcon />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
          <Text style={styles.pdfName}>{(item.name).replace(/%/g, ' ')}</Text>
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() => openFileLikeWhatsApp(`${API_URL}/${item.url}`, item.name)}
          >
            <Download />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Update renderLevel to use materialsByLevel
  const renderLevel = (levelData, index) => {
    const isCompleted = completedLevels.includes(levelData.level);
    const isActive = levelData.level === currentActiveLevel;
    const isLastLevel = index === materialsByLevel.length - 1;
    const levelKey = `level-${levelData.level}`;
    const currentTab = selectedTabs[levelKey] || 'PDF';

    return (
      <View style={styles.levelContainer} key={levelKey}>
        <View style={styles.levelHeaderContainer}>
          <View style={styles.timelineLeft}>
            <View
              style={[
                styles.levelBadge,
                isCompleted ? styles.completedLevelBadge :
                  isActive ? styles.activeLevelBadge : styles.inactiveLevelBadge,
              ]}>
              <Text style={styles.levelNumber}>
                {levelData.level}
              </Text>
            </View>
            {!isLastLevel && (
              <View
                style={[
                  styles.timelineLine,
                  isCompleted && styles.completedTimelineLine
                ]}
              />
            )}
          </View>
          <View style={styles.levelContentContainer}>
            <Text style={styles.levelTitle}>Level {levelData.level}</Text>

            <View style={styles.tabsCard}>
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    currentTab === 'PDF' && styles.activeTab,
                  ]}
                  onPress={() => setSelectedTabs({
                    ...selectedTabs,
                    [levelKey]: 'PDF'
                  })}>
                  <Text
                    style={[
                      styles.tabText,
                      currentTab === 'PDF' && styles.activeTabText,
                    ]}>
                    PDF
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    currentTab === 'Video' && styles.activeTab,
                  ]}
                  onPress={() => setSelectedTabs({
                    ...selectedTabs,
                    [levelKey]: 'Video'
                  })}>
                  <Text
                    style={[
                      styles.tabText,
                      currentTab === 'Video' && styles.activeTabText,
                    ]}>
                    Video
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.contentContainer}>
                {currentTab === 'PDF' &&
                  (levelData.pdfs.length > 0
                    ? levelData.pdfs.map(pdf => renderPdfItem(pdf))
                    : <Text style={styles.emptyStateText}>No PDFs available</Text>
                  )}
                {currentTab === 'Video' &&
                  (levelData.videos.length > 0
                    ? levelData.videos.map(video => renderVideoItem(video))
                    : <Text style={styles.emptyStateText}>No videos available</Text>
                  )}
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerText}>{subject} - {activity}</Text>
        {/* <View style={styles.backButton} /> */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('ParentRoute')}
        >
          <HomeIcon />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.mainScrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0C36FF']}
            tintColor="#0C36FF"
          />
        }
      >
        <View style={styles.timeline}>
          {materialsByLevel.length > 0
            ? materialsByLevel.map((level, index) => renderLevel(level, index))
            : <Text style={styles.emptyStateText}>No materials available</Text>
          }
        </View>
      </ScrollView>
      <Modal
        visible={downloadProgress !== null}
        transparent
        animationType="fade"
        onRequestClose={() => { }} // disables Android back button
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: '#fff',
            padding: 30,
            borderRadius: 10,
            alignItems: 'center'
          }}>
            <ActivityIndicator size="large" color="#007bff" style={{ marginBottom: 10 }} />
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5, color: 'black' }}>
              Downloading...
            </Text>
            <Text style={{ fontSize: 16, color: 'black' }}>
              {downloadProgress}%
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default StudentPageMaterialScreen;