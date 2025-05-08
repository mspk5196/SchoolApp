import React from 'react'
import { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text, View, ScrollView, Pressable, SectionList } from 'react-native'
import styles from './MaterialHomeStyle'
import HomeIcon from '../../../assets/GeneralAssests/backarrow.svg'
import LevelPromotionIcon from '../../../assets/MaterialHome/LevelPromotion.svg'

const MaterialHome = ({ navigation }) => {
  const [activeGrade, setActiveGrade] = useState(null);
  const data = [
    {
      data: [
        { id: '1', title: 'Tamil', bgColor: '#C9F7F5', color: '#0FBEB3' },
        { id: '2', title: 'English', bgColor: '#65558F12', iconColor: '#EEAA16', color: '#65558F' },
        { id: '3', title: 'Mathematics', bgColor: '#FFF3DC',  color: '#EEAA16' },
        { id: '4', title: 'Science', bgColor: '#EBEEFF',  color: '#3557FF' },
        { id: '5', title: 'Social Science', bgColor: '#FFD6EE',  color: '#AD5191' },
        { id: '6', title: 'Level Promotion', bgColor: '#EBEEFF', Icon: <LevelPromotionIcon width={50} height={50} />, color: '#3557FF' },
      ],
    },
  ];



  // Conditional Cards component that centers text for subjects but not for Level Promotion
  const Cards = ({ title, Icon, bgColor, color }) => {
    const isLevelPromotion = title === 'Level Promotion';
    
    return (
      <View style={[styles.card, { backgroundColor: bgColor }]}>
        {isLevelPromotion ? (
          <>
            {Icon}
            <Text style={[styles.cardText, { color: color }]}>{title}</Text>
          </>
        ) : (
          // Centered layout for other subjects
          <View style={styles.centeredCardContent}>
            <Text style={[styles.cardText, styles.centeredText, { color: color }]}>{title}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView flexgrow={1} flex={1} style={styles.container}>
      <View style={styles.Header}>
        <HomeIcon width={styles.HomeIcon.width} height={styles.HomeIcon.height} onPress={() => navigation.goBack()}/>
        <Text style={styles.HeaderTxt}>Material</Text>
      </View>

      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent} style={styles.classnavgrade} nestedScrollEnabled={true}>
        {["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"].map((grade, index) => (
          <Pressable
            key={index}
            style={[styles.gradeselection, activeGrade === index && styles.activeButton]}
            onPress={() => setActiveGrade(index)}
          >
            <Text style={[styles.gradeselectiontext, activeGrade === index && styles.activeText]}>{grade}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <SectionList
        vertical={true}
        scrollEnabled={true}
        sections={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
            <Pressable
            onPress={() => {
              const selectedGrade = activeGrade !== null ? `Grade ${activeGrade + 1}` : "No Grade Selected";
          
              if (item.title === 'Tamil') {
                navigation.navigate('Tamil', { grade: selectedGrade });
              } else if (item.title === 'English') {
                navigation.navigate('English', { grade: selectedGrade });
              }
              else if (item.title === 'Mathematics') {
                navigation.navigate('Mathematics', { grade: selectedGrade });
              }
              else if (item.title === 'Science') {
                navigation.navigate('Science', { grade: selectedGrade });
              }
              else if (item.title === 'Social Science') {
                navigation.navigate('SocialScience', { grade: selectedGrade });
              }
              else if (item.title === 'Level Promotion') {
                navigation.navigate('LevelPromotion');
              }
            }}
          >
            <ScrollView nestedScrollEnabled={true}>
              <Cards title={item.title} Icon={item.Icon} bgColor={item.bgColor} color={item.color} />
            </ScrollView>
          </Pressable>
        )}
      />
    </SafeAreaView>
  )
}

export default MaterialHome;