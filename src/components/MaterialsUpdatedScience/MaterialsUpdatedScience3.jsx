import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import styles from './MaterialsUpdatedSciencesty';
import PdfIcon from '../../assets/pdf.svg';
import DeleteIcon from '../../assets/trash.svg';
import Home from '../../assets/entypo_home.svg';
import EditIcon from '../../assets/edit.svg';

const MaterialsUpdatedScience3 = ({navigation}) => {
    const [learningData, setLearningData] = useState([
    {
        id: '1',
        level: 'Level 1',
        expectedDate: '23/03/24',
        pdfs: ['Tamil(7)Level1.pdf', 'Tamil(7)Level1.pdf', 'Tamil(7)Level1.pdf', 'Tamil(7)Level1.pdf'],
        videos: [],
      },
      {
        id: '2',
        level: 'Level 2',
        expectedDate: '23/03/24',
        pdfs: ['Tamil(7)Level2.pdf', 'Tamil(7)Level2.pdf', 'Tamil(7)Level2.pdf', 'Tamil(7)Level2.pdf'],
        videos: [],
      },
      {
        id: '3',
        level: 'Level 3',
        expectedDate: '23/03/24',
        pdfs: ['Tamil(7)Level3.pdf', 'Tamil(7)Level3.pdf', 'Tamil(7)Level3.pdf'],
        videos: [],
      },    
  ]);

  const [selectedTab, setSelectedTab] = useState({});
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedLevelId, setSelectedLevelId] = useState(null);

  const handleConfirm = (date) => {
    const formattedDate = date.toLocaleDateString('en-GB'); 
    const updatedData = learningData.map((item) =>
      item.id === selectedLevelId ? { ...item, expectedDate: formattedDate } : item
    );
    setLearningData(updatedData);
    setDatePickerVisible(false);
    setSelectedLevelId(null);
  };

  const renderMaterial = (item, index) => (
    <View key={index} style={styles.materialRow}>
      <PdfIcon width={20} height={20} />
      <Text style={styles.materialText}>{item}</Text>
      <TouchableOpacity>
        <DeleteIcon width={18} height={18} />
      </TouchableOpacity>
    </View>
  );

  const renderLevelItem = ({ item }) => {
    const tab = selectedTab[item.id] || 'PDF';

    return (
      <View style={styles.levelContainer}>
        <View style={styles.levelHeader}>
          <Text style={styles.levelTitle}>{item.level}</Text>
          <Text style={styles.expectedDate}>Expected date: {item.expectedDate}</Text>
          <TouchableOpacity
            style={styles.edit}
            onPress={() => {
              setSelectedLevelId(item.id);
              setDatePickerVisible(true);
            }}
          >
            <EditIcon style={styles.editicon} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, tab === 'PDF' && styles.activeTab]}
            onPress={() => setSelectedTab({ ...selectedTab, [item.id]: 'PDF' })}
          >
            <Text style={tab === 'PDF' ? styles.activeTabText : styles.tabText}>PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, tab === 'Video' && styles.activeTab]}
            onPress={() => setSelectedTab({ ...selectedTab, [item.id]: 'Video' })}
          >
            <Text style={tab === 'Video' ? styles.activeTabText : styles.tabText}>Video</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.materialBox}>
          {tab === 'PDF'
            ? item.pdfs.map(renderMaterial)
            : item.videos.length
              ? item.videos.map(renderMaterial)
              : <Text style={styles.noMaterial}>No videos available</Text>}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.activityHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Home height={28} width={28} style={styles.homeIcon} />
        </TouchableOpacity>
        <Text style={styles.activityText}>Material</Text>
      </View>

      <View style={styles.underline}></View>
      <Text style={styles.heading}>Grade 3 – Science</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {learningData.map((item) => (
          <View key={item.id}>{renderLevelItem({ item })}</View>
        ))}
      </ScrollView>

      <DateTimePickerModal
        isVisible={datePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={() => setDatePickerVisible(false)}
      />
    </View>
  );
};

export default MaterialsUpdatedScience3;
