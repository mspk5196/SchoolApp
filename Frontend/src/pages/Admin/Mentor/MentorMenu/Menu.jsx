import React from 'react';
import {Text, View, SectionList, Image, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import styles from './Menusty';
import SubjectIcon from '../../../assets/MentorHome/subject.svg';
import MentorListIcon from '../../../assets/MentorHome/mentorlist.svg';
import DisciplineIcon from '../../../assets/MentorHome/mapping.svg';
import Freehour from '../../../assets/MentorHome/Freehour.svg';
import HomeIcon from '../../../assets/MentorHome/home.svg';
const data = [
  {
    data: [
      {
        id: '1',
        title: 'Mentor List',
        bgColor: '#EBEEFF',
        iconColor: '#1E40AF',
        Icon: MentorListIcon,
        color: '#3557FF',
      },
      {
        id: '2',
        title: 'Discipline log',
        bgColor: '#FFF3DC',
        iconColor: '#FFA000',
        Icon: DisciplineIcon,
        color: '#EEAA16',
      },
      {
        id: '3',
        title: 'Subject Mentor',
        bgColor: '#65558F1F',
        iconColor: '#6A5ACD',
        Icon: SubjectIcon,
        color: '#65558F',
      },
      {
        id: '4',
        title: 'Free hour',
        bgColor: '#FFD6EE',
        iconColor: '#FFA000',
        Icon: Freehour,
        color: '#AD5191',
      },
    ],
  },
];

const MentorCard = ({title, Icon, bgColor, color, onPress}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.card, {backgroundColor: bgColor}]}>
    <Icon style={styles.icon} />
    <Text style={[styles.cardText, {color: color}]}>{title}</Text>
  </TouchableOpacity>
);

const Mentor = ({navigation}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation && navigation.goBack()}
        >
          <HomeIcon height={25} width={25}/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schools</Text>
      </View>
      <SectionList
        sections={data}
        keyExtractor={item => item.id}
        style={styles.scrollView}
        renderItem={({item}) => (
          <MentorCard
            title={item.title}
            Icon={item.Icon}
            bgColor={item.bgColor}
            color={item.color}
            onPress={() => {
              if (item.title === 'Subject Mentor') {
                navigation.navigate('MentorSubjectMentor');
              } else if (item.title === 'Free hour') {
                navigation.navigate('MentorFreeHour');
              } else if (item.title === 'Mentor List') {
                navigation.navigate('Mentorlist');
              } else if (item.title === 'Discipline log') {
                navigation.navigate('MentorDisciplineLog');
              }
            }}
          />
        )}
      />
    </SafeAreaView>
  );
};

export default Mentor;
