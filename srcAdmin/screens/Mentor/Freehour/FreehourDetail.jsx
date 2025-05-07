import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import BackIcon from '../../../assets/FreeHour/leftarrow.svg';
import TimeIcon from '../../../assets/FreeHour/time.svg';
import styles from './FreehourDetailStyle';
import staff from '../../../assets/SubjectMentor/staff.png';
import Footer from '../../../components/footerhome/footer';

const FreehourDetail = ({navigation, route}) => {
  // Extract faculty data from route params
  const { faculty } = route.params || {
    name: 'Mr.SasiKumar',
    facultyId: '203384',
    timeSlot: '10:40AM - 11:20AM',
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackIcon
          width={styles.BackIcon.width}
          height={styles.BackIcon.height}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTxt}>Free hour</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.profileCard}>
          <Image source={staff} style={styles.avatar} />
          <View style={styles.profileInfo}>
          <Text style={styles.name}>{faculty.name}</Text>
          <Text style={styles.facultyId}>Faculty ID: {faculty.facultyId}</Text>
          <Text style={styles.timeSlot}>{faculty.timeSlot}</Text>
          </View>
        </View>

        <View style={styles.section}>
        <View style={styles.timeSection}>
          <View style={styles.timeIcon}>
            <TimeIcon width={20} height={20}/>
          </View>
          <Text style={styles.timeRange}>9:00 AM to 10:30 PM</Text>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Academic</Text>
          <View style={styles.contentBox}>
            <Text style={styles.contentText}>
              Lorem ipsum se simplemente el texto de relleno de las imprentas y archivos de texto.
              Lorem ipsum ha sido el texto de relleno estándar de las industrias desde el año 1500,
              cuando un impresor (N. del T. persona que se dedica a la imprenta) desconocido usó una
              galería de textos y los mezcló de tal manera que logró hacer un libro de textos especimen.
              No solo sobrevivió 500 años.
            </Text>
          </View>
        </View>
        </View>
      </ScrollView>

      <Footer/>
    
    </SafeAreaView>
  );
};

export default FreehourDetail;