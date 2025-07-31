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
} from 'react-native';
import styles from './MaterialScreenStyles';
import PDFicon from '../../../assets/ParentPage/Materials-img/pdf.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import VideoIcon from '../../../assets/ParentPage/Materials-img/video-icon.svg'
import Download from '../../../assets/ParentPage/Materials-img/download.svg'
import { API_URL } from '../../../utils/env.js';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import { cleanImageUrl, getFileNameFromUrl } from '../../../utils/cleanImageUrl';
import Nodata from '../../../components/General/Nodata';
import mime from 'react-native-mime-types';

const StudentPageMaterialScreen = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('Tamil');
  const [selectedTabs, setSelectedTabs] = useState({});
  const [completedLevels, setCompletedLevels] = useState([1, 2]);
  const [currentActiveLevel, setCurrentActiveLevel] = useState(3);

  const [sectionSubjects, setSectionSubjects] = useState([]);
  const [studentData, setStudentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [materialsByLevel, setMaterialsByLevel] = useState({});
  const [downloadProgress, setDownloadProgress] = useState(null);

  const fetchStudentData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('studentData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setStudentData(parsedData[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/student/getSectionSubjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sectionId: studentData.section_id }),
      });
      const data = await response.json();
      setSectionSubjects(data.subjects);
      if (data.subjects.length > 0) {
        setSelectedLanguage(data.subjects[0].subject_id);
      }
      // console.log('Fetched subjects:', data.subjects);

    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentData.section_id) {
      fetchSubjects();
    }
  }, [studentData.section_id]);


  const fetchMaterialsAndLevels = async () => {
    try {
      const response = await fetch(`${API_URL}/api/student/getMaterialsAndCompletedLevels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_id: studentData.section_id,
          subject_id: selectedLanguage,
          student_roll: studentData.roll
        })
      });
      const data = await response.json();
      setCompletedLevels(data.completedLevels || []);
      setMaterialsByLevel(groupMaterials(data.materials || []));
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLanguage && studentData.section_id) {
      fetchMaterialsAndLevels();
    }
  }, [selectedLanguage, studentData.section_id]);

  // Group materials by level and type
  const groupMaterials = (materials) => {
    const grouped = {};
    materials.forEach(item => {
      if (!grouped[item.level]) {
        grouped[item.level] = { level: item.level, pdfs: [], videos: [] };
      }
      if (item.material_type === 'PDF') {
        grouped[item.level].pdfs.push({ 
          name: item.file_name, 
          url: item.file_url, 
          type: 'PDF' 
        });
      } else if (item.material_type === 'Video') {
        grouped[item.level].videos.push({ 
          name: item.file_name, 
          url: item.file_url, 
          type: 'Video' 
        });
      }
    });
    // Convert to sorted array by level
    return Object.values(grouped).sort((a, b) => a.level - b.level);
  };

  const openFileLikeWhatsApp = async (fileUrl, fileName) => {
    setDownloadProgress(0);
    
    // Clean the URL first to fix any /https:// issues
    const cleanUrl = cleanImageUrl(fileUrl);
    
    // For Cloudinary raw files, use the provided fileName with proper extension
    // If fileName doesn't have an extension, extract it from the URL or add default
    let properFileName = fileName;
    if (cleanUrl.includes('cloudinary.com') && cleanUrl.includes('/raw/')) {
      // For raw files from Cloudinary, ensure proper filename with extension
      if (!properFileName.includes('.')) {
        // Try to get extension from URL, default to pdf if not found
        const urlExtension = cleanUrl.split('.').pop();
        if (urlExtension && urlExtension.length <= 4) {
          properFileName = `${properFileName}.${urlExtension}`;
        } else {
          properFileName = `${properFileName}.pdf`; // Default for raw files
        }
      }
    } else {
      // For other URLs, use the getFileNameFromUrl utility
      properFileName = getFileNameFromUrl(cleanUrl, fileName);
    }
    
    const localFile = `${RNFS.DownloadDirectoryPath}/${properFileName}`;

    try {
      const downloadResult = await RNFS.downloadFile({
        fromUrl: cleanUrl,
        toFile: localFile,
        progress: (res) => {
          const percent = Math.floor((res.bytesWritten / res.contentLength) * 100);
          setDownloadProgress(percent);
        },
        progressDivider: 1,
      }).promise;

      setDownloadProgress(null);

      if (downloadResult.statusCode === 200) {
        const mimeType = mime.lookup(properFileName) || undefined;
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
              onPress: () => Linking.openURL(cleanUrl),
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
          <TouchableOpacity onPress={() => {
            // Clean the URL first to fix any /https:// issues
            const cleanUrl = cleanImageUrl(item.url);
            const fileUrl = cleanUrl.startsWith('http') ? cleanUrl : `${API_URL}/${cleanUrl}`;
            
            // Create proper filename with PDF extension
            let fileName = item.name;
            if (!fileName.toLowerCase().endsWith('.pdf')) {
              fileName = fileName + '.pdf';
            }
            
            openFileLikeWhatsApp(fileUrl, fileName);
          }}>
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
          <TouchableOpacity onPress={() => {
            // Clean the URL first to fix any /https:// issues
            const cleanUrl = cleanImageUrl(item.url);
            const fileUrl = cleanUrl.startsWith('http') ? cleanUrl : `${API_URL}/${cleanUrl}`;
            
            // Create proper filename with video extension
            let fileName = item.name;
            const hasVideoExt = /\.(mp4|avi|mov|wmv|flv|webm)$/i.test(fileName);
            if (!hasVideoExt) {
              fileName = fileName + '.mp4'; // Default to mp4 if no extension
            }
            
            openFileLikeWhatsApp(fileUrl, fileName);
          }}>
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
        <Text style={styles.headerText}>Materials</Text>
      </View>

      <ScrollView
        style={styles.languageScrollContainer}
        horizontal
        showsHorizontalScrollIndicator={false}>
        {sectionSubjects.map(language => (
          <TouchableOpacity
            key={language.subject_id}
            style={[
              styles.languageButton,
              selectedLanguage === language.subject_id ? styles.selectedLanguage : null,
            ]}
            onPress={() => setSelectedLanguage(language.subject_id)}>
            <Text
              style={[
                styles.languageText,
                selectedLanguage === language.subject_id
                  ? styles.selectedLanguageText
                  : null,
              ]}>
              {language.subject_name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.mainScrollView}>
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
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5, color:'black' }}>
              Downloading...
            </Text>
            <Text style={{ fontSize: 16, color:'black' }}>
              {downloadProgress}%
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default StudentPageMaterialScreen;