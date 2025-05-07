import React from 'react';
import {Text, View, SectionList, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import styles from './CoordinatorHomeStyle';
import HomeIcon from '../../../assets/CoordinatorHome/home.svg'; // Reusing existing icon
import CoordinatorListIcon from '../../../assets/CoordinatorHome/coordinatorlist.svg'; // You'll need to create this icon
import EnrollmentIcon from '../../../assets/CoordinatorHome/enrollment.svg'; // You'll need to create this icon
import LeaveApprovalIcon from '../../../assets/CoordinatorHome/leaveapproval.svg'; // You'll need to create this icon
import BackIcon from '../../../assets/CoordinatorHome/Back.svg'; // You'll need to create this icon
import Footer from '../../../components/footerhome/footer';

const data = [
  {
    data: [
      {
        id: '1',
        title: 'Coordinator List',
        bgColor: '#EBEEFF',
        iconColor: '#1E40AF',
        Icon: CoordinatorListIcon,
        color: '#3557FF',
      },
      {
        id: '2',
        title: 'Coordinator Enrollment',
        bgColor: '#FFD6EE',
        iconColor: '#AD5191',
        Icon: EnrollmentIcon,
        color: '#AD5191',
      },
      {
        id: '3',
        title: 'Leave Approval',
        bgColor: '#FFD6EE',
        iconColor: '#AD5191',
        Icon: LeaveApprovalIcon,
        color: '#AD5191',
      },
    ],
  },
];

const CoordinatorCard = ({title, Icon, bgColor, color, onPress}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.card, {backgroundColor: bgColor}]}>
    <Icon style={styles.icon} />
    <Text style={[styles.cardText, {color: color}]}>{title}</Text>
  </TouchableOpacity>
);

const CoordinatorHome = ({navigation}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation && navigation.goBack()}
        >
            <BackIcon width={20} height={20} />  
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Coordinator</Text>
      </View>
      <SectionList
        sections={data}
        keyExtractor={item => item.id}
        style={styles.scrollView}
        renderItem={({item}) => (
          <CoordinatorCard
            title={item.title}
            Icon={item.Icon}
            bgColor={item.bgColor}
            color={item.color}
            onPress={() => {
              if (item.title === 'Coordinator List') {
                navigation.navigate('CoordinatorList');
              } else if (item.title === 'Coordinator Enrollment') {
                navigation.navigate('CoordinatorEnrollment');
              } else if (item.title === 'Leave Approval') {
                navigation.navigate('CoordinatorLeaveApproval');
              }
            }}
          />
        )}
      />
      <Footer/>
    </SafeAreaView>
  );
};

export default CoordinatorHome;