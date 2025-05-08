import React, { useEffect, useState } from 'react';
import { Text, View, SectionList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './MentorStyles';
import SubjectIcon from '../../../../assets/CoordinatorPage/MentorHome/subject.svg';
import MappingIcon from '../../../../assets/CoordinatorPage/MentorHome/mapping.svg';
import LeaveIcon from '../../../../assets/CoordinatorPage/MentorHome/leave.svg';
import MentorListIcon from '../../../../assets/CoordinatorPage/MentorHome/mentorlist.svg';
import DisciplineIcon from '../../../../assets/CoordinatorPage/MentorHome/mapping.svg';
import Home from '../../../../assets/CoordinatorPage/MentorHome/home.svg'
import AsyncStorage from '@react-native-async-storage/async-storage';
const data = [{
    data: [
        { id: '1', title: 'Subject Mentor', bgColor: '#65558F1F', iconColor: '#6A5ACD', Icon: SubjectIcon, color: '#65558F' },
        { id: '2', title: 'Mentor Mapping', bgColor: '#FFF3DC', iconColor: '#FFA000', Icon: MappingIcon, color: '#EEAA16' },
        { id: '3', title: 'Leave Approval', bgColor: '#FFDAF0', iconColor: '#D81B60', Icon: LeaveIcon, color: '#AD5191' },
        { id: '4', title: 'Mentor List', bgColor: '#EBEEFF', iconColor: '#1E40AF', Icon: MentorListIcon, color: '#3557FF' },
        { id: '5', title: 'Discipline log', bgColor: '#FFF3DC', iconColor: '#FFA000', Icon: DisciplineIcon, color: '#EEAA16' },
    ]
}];

const MentorCard = ({ title, Icon, bgColor, color, onPress }) => (
    <TouchableOpacity onPress={onPress} style={[styles.card, { backgroundColor: bgColor }]}>
        <Icon width={40} height={40} style={styles.icon} />
        <Text style={[styles.cardText, { color: color }]}>{title}</Text>
    </TouchableOpacity>
);

const CoordinatorMentor = ({ navigation }) => {
    const [coordinatorData,setCoordinatorData] = useState(coordinatorData);
    const fetchData = async() =>{
        try {
            const data = await AsyncStorage.getItem('coordinatorData');
            if (data) {
              const parsedData = JSON.parse(data);
              setCoordinatorData(parsedData);
            }
          } catch (error) {
            console.error('Error fetching data:', error);
          }
    }
    useEffect(()=>{
        fetchData()
    },[]) 
    

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.Navbar}>
                <Home width={27} height={26} style={styles.homelogo} onPress={() => navigation.navigate('CoordinatorMain')} />
                <Text style={styles.text}>Mentors</Text>
            </View>
            <SectionList 
                sections={data}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <MentorCard
                        title={item.title}
                        Icon={item.Icon}
                        bgColor={item.bgColor}
                        color={item.color}
                        onPress={() => {
                            if (item.title === 'Subject Mentor') {
                                navigation.navigate('CoordinatorSubjectMentor', {coordinatorData});
                            } else if (item.title === 'Mentor Mapping') {
                                navigation.navigate('CoordinatorMentorMapping', {coordinatorData});
                            }
                            else if (item.title === 'Leave Approval') {
                                navigation.navigate('CoordinatorLeaveApproval', {coordinatorData})
                            }
                            else if (item.title === 'Mentor List') {
                                navigation.navigate('CoordinatorMentorList', {coordinatorData})
                            }
                            else if (item.title === 'Discipline log') {
                                navigation.navigate('CoordinatorDisciplineLog', {coordinatorData})
                            }
                        }}
                    />
                )}
            />
        </SafeAreaView>
    );
};

export default CoordinatorMentor;
