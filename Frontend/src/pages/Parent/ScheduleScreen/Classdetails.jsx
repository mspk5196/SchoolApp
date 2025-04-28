import { Text, View, TouchableOpacity, FlatList, ScrollView, Image, Modal, SafeAreaView } from 'react-native';
import PreviousIcon from '../../../assets/ParentPage/basic-img/Backicon.svg';
import styles from './ScheduleScreenStyles';
import ProfileImg from '../../../assets/ParentPage/ScheduleSvg/profile.png';

const ClassDetailScreen = ({ selectedClass,
  setSelectedClass,
  activeTab,
  setActiveTab }) => {
  if (!selectedClass) return null;

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
            <Text style={styles.academicItemGrade}>{selectedClass.grade}</Text>
            <Text style={{
              ...styles.academicItemType, color: selectedClass.color === '#E8F5E9' ? '#4CAF50' :
                selectedClass.color === '#FFEBEE' ? '#F44336' :
                  '#FF9800'
            }}>
              {selectedClass.type}
            </Text>
          </View>
          <View style={styles.academicItemTimeContainer}>
            <Text style={styles.academicItemTime}>{selectedClass.time}</Text>
          </View>
        </View>

        {/* Date */}


        {/* Class details */}
        <View style={styles.detailInfoContainer}>
          <Text style={styles.detailDateText}>{selectedClass.date}</Text>
          <View style={styles.detailInfoRow}>
            <View style={styles.detailInfoInside}>
            <View style={styles.levelContainer}>
              <Text style={styles.levelText}>Level {selectedClass.level.split(' ')[1]}</Text>
            </View>

            <View style={styles.rankContainer}>
              <Text style={styles.rankText}>Rank : {selectedClass.rank}</Text>
            </View>
            </View>

            <Text style={styles.assessmentText}>Assessment</Text>
          </View>

          <View style={styles.scoresContainer}>
            <View style={styles.scoreincont}>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>Highest Score :</Text>
                <Text style={styles.scoreValue}>{selectedClass.highestScore}</Text>
              </View>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>Class Average :</Text>
                <Text style={styles.scoreValue}>{selectedClass.classAverage}</Text>
              </View>
            </View>

            <View style={styles.scoreincont}>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Score :</Text>
              <Text style={styles.scoreValue}>{selectedClass.score}</Text>
            </View>
            </View>


          </View>

          <TouchableOpacity style={styles.pdfButton}>
            <Text style={styles.pdfButtonText}>{selectedClass.assessment}.pdf</Text>
          </TouchableOpacity>

          <View style={styles.teacherContainer}>
            <Image source={ProfileImg} style={styles.teacherAvatar} />
            <Text style={styles.teacherName}>{selectedClass.teacher}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ClassDetailScreen;