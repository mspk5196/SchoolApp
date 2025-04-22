import React from 'react';
import { Text, View, SectionList, Image,TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './MentorStyles';
import SubjectIcon from '../../../assets/MentorHome/subject.svg';
import MappingIcon from '../../../assets/MentorHome/mapping.svg';
import LeaveIcon from '../../../assets/MentorHome/leave.svg';
import MentorListIcon from '../../../assets/MentorHome/mentorlist.svg';
import DisciplineIcon from '../../../assets/MentorHome/mapping.svg';
import Home from '../../../assets/MentorHome/home.svg'
const data = [{
    data: [
        { id: '1', title: 'Subject Mentor', bgColor: '#65558F1F', iconColor: '#6A5ACD', Icon: SubjectIcon,color:'#65558F' },
        { id: '2', title: 'Mentor Mapping', bgColor: '#FFF3DC', iconColor: '#FFA000', Icon: MappingIcon,color:'#EEAA16' },
        { id: '3', title: 'Leave Approval', bgColor: '#FFDAF0', iconColor: '#D81B60', Icon: LeaveIcon,color:'#AD5191' },
        { id: '4', title: 'Mentor List', bgColor: '#EBEEFF', iconColor: '#1E40AF', Icon: MentorListIcon,color:'#3557FF' },
        { id: '5', title: 'Discipline log', bgColor: '#FFF3DC', iconColor: '#FFA000', Icon: DisciplineIcon,color:'#EEAA16' },
    ]
}];

const MentorCard = ({ title, Icon, bgColor, color, onPress }) => (
    <TouchableOpacity onPress={onPress} style={[styles.card, { backgroundColor: bgColor }]}>
        <Icon width={40} height={40} style={styles.icon} />
        <Text style={[styles.cardText, { color: color }]}>{title}</Text>
    </TouchableOpacity>
);

const Mentor = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.Header}>
        <Home width={styles.HomeIcon.width} height={styles.HomeIcon.height} onPress={() => navigation.navigate('Menu')}/>
        <Text style={styles.HeaderTxt}>Mentor</Text>
      </View>
            <SectionList
                sections={data}
                keyExtractor={(item) => item.id}
                style={styles.scrollView}
                renderItem={({ item }) => (
                    <MentorCard
                        title={item.title}
                        Icon={item.Icon}
                        bgColor={item.bgColor}
                        color={item.color}
                        onPress={() => {
                            if (item.title === 'Subject Mentor') {
                                navigation.navigate('SubjectMentor');
                            } else if (item.title === 'Mentor Mapping') {
                                navigation.navigate('MentorMapping');
                            }
                            else if (item.title === 'Leave Approval')

                                {
                                    navigation.navigate('LeaveApproval')
                            }
                            else if (item.title === 'Mentor List')

                                {
                                    navigation.navigate('MentorList')
                            } 
                            else if (item.title === 'Discipline log')

                                {
                                    navigation.navigate('DisciplineLog')
                            }
                        }}
                    />
                )}
            />
        </SafeAreaView>
    );
};

export default Mentor;
