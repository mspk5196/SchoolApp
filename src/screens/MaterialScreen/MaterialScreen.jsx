import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import styles from './MaterialScreenStyles';
import PDFicon from '../../assets/Materials-img/pdf';
import Deleteicon from '../../assets/Materials-img/delete';

const MaterialsScreen = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('Tamil');
  const [selectedTabs, setSelectedTabs] = useState({});
  const [completedLevels, setCompletedLevels] = useState([1,2]); 
  const [currentActiveLevel, setCurrentActiveLevel] = useState(3); 

  const languages = ['Tamil', 'English', 'Maths', 'Science', 'Computer'];

  const levels = [
    {
      level: 1,
      pdfs: [
        {name: 'Tamil(7)Level1.pdf'},
        {name: 'Tamil(7)Level1.pdf'},
        {name: 'Tamil(7)Level1.pdf'},
      ],
      videos: [
        {name: 'Tamil-Level1-Video1.mp4'},
        {name: 'Tamil-Level1-Video2.mp4'},
      ],
    },
    {
      level: 2,
      pdfs: [
        {name: 'Tamil(7)Level2.pdf'},
        {name: 'Tamil(7)Level2.pdf'},
        {name: 'Tamil(7)Level2.pdf'},
        {name: 'Tamil(7)Level2.pdf'},
      ],
      videos: [
        {name: 'Tamil-Level2-Video1.mp4'},
      ],
    },
    {
      level: 3,
      pdfs: [
        {name: 'Tamil(7)Level3.pdf'},
        {name: 'Tamil(7)Level3.pdf'},
        {name: 'Tamil(7)Level3.pdf'},
      ],
      videos: [],
    },
    {
      level: 4,
      pdfs: [
        {name: 'Tamil(7)Level4.pdf'},
        {name: 'Tamil(7)Level4.pdf'},
        {name: 'Tamil(7)Level4.pdf'},
        {name: 'Tamil(7)Level4.pdf'},
      ],
      videos: [
        {name: 'Tamil-Level4-Video1.mp4'},
        {name: 'Tamil-Level4-Video2.mp4'},
        {name: 'Tamil-Level4-Video3.mp4'},
      ],
    },
  ];

  const renderPdfItem = (item) => {
    return (
      <View style={styles.pdfItem} key={item.name + Math.random()}>
        <View style={styles.pdfIconContainer}>
          <PDFicon />
        </View>
        <Text style={styles.pdfName}>{item.name}</Text>
      </View>
    );
  };

  const renderLevel = (levelData, index) => {
    const isCompleted = completedLevels.includes(levelData.level);
    const isActive = levelData.level === currentActiveLevel;
    const isLastLevel = index === levels.length - 1;
    const levelKey = `level-${levelData.level}`;
    const currentTab = selectedTabs[levelKey] || 'PDF'; // Default to PDF if not set

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
                  levelData.pdfs.map(pdf => renderPdfItem(pdf))}
                {currentTab === 'Video' &&
                  levelData.videos.map(video => renderPdfItem(video))}
                {currentTab === 'Video' && levelData.videos.length === 0 && (
                  <Text style={styles.emptyStateText}>No videos available</Text>
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
        {languages.map(language => (
          <TouchableOpacity
            key={language}
            style={[
              styles.languageButton,
              selectedLanguage === language ? styles.selectedLanguage : null,
            ]}
            onPress={() => setSelectedLanguage(language)}>
            <Text
              style={[
                styles.languageText,
                selectedLanguage === language
                  ? styles.selectedLanguageText
                  : null,
              ]}>
              {language}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.mainScrollView}>
        <View style={styles.timeline}>
          {levels.map((level, index) => renderLevel(level, index))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MaterialsScreen;