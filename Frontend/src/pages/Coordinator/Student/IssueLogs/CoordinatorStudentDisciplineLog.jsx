import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  TextInput,
  Image,
  ScrollView,
  Alert
} from 'react-native';
import { API_URL } from '@env'
import BackIcon from '../../../../assets/CoordinatorPage/IssueLogs/leftarrow.svg';
import PhoneIcon from '../../../../assets/CoordinatorPage/IssueLogs/call.svg';
import MessageIcon from '../../../../assets/CoordinatorPage/IssueLogs/msg.svg';
import styles from './StudentDisciplineLogStyles';
import { SafeAreaView } from 'react-native-safe-area-context';

const CoordinatorStudentDisciplineLog = ({ navigation, route }) => {
  const { coordinatorData } = route.params;
  const [activeSection, setActiveSection] = useState(null);

  const [sections, setSections] = useState([]);

  const [disciplineData] = useState([
    {
      id: 1,
      name: 'Faculty',
      regNo: '2024VI023',
      reason: 'Student is saying that he came along with parents to school, and he is late to school because of traffic.',
      date: '29/10/23',
      registeredBy: 'SasiKumar',
    },
    {
      id: 2,
      name: 'Faculty',
      regNo: '2024VI023',
      reason: 'Student is saying that he came along with parents to school, and he is late to school because of traffic.',
      date: '29/10/23',
      registeredBy: 'SasiKumar',
    },
  ]);

  // Fetch sections for the active grade
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch(`${API_URL}/api/coordinator/getGradeSections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gradeID: coordinatorData.grade_id }),
        });

        const data = await response.json();
        console.log('Grade Sections Data API Response:', data);

        if (data.success) {
          setSections(data.gradeSections);
          if (data.gradeSections.length > 0) {
            setActiveSection(data.gradeSections[0].id);
          }
        } else {
          Alert.alert('No Sections Found', 'No section is associated with this grade');
        }
      } catch (error) {
        console.error('Error fetching sections data:', error);
        Alert.alert('Error', 'Failed to fetch sections data');
      }
    };

    fetchSections();
  }, [coordinatorData]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackIcon
          width={styles.BackIcon.width}
          height={styles.BackIcon.height}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTxt}>Discipline Logs</Text>
      </View>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent} style={styles.classnavsection} nestedScrollEnabled={true}>
        {sections.map((section, index) => (
          <Pressable
            key={section.id}
            style={[styles.gradeselection, activeSection === section.id && styles.activeButton]}
            onPress={() => setActiveSection(section.id)}
          >
            <Text style={[styles.gradeselectiontext, activeSection === section.id && styles.activeText]}>Section {section.section_name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholderTextColor='grey'
          placeholder="Search..."
        />
      </View>

      <ScrollView style={styles.cardContainer}>
        {disciplineData.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Image source={require('../../../../assets/CoordinatorPage/IssueLogs/staff.png')} style={styles.avatar} />
              <View>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSubtitle}>{item.regNo}</Text>
              </View>
              <Text style={styles.cardDate}>{item.date}</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>Reason</Text>
              <Text style={styles.cardReason}>{item.reason}</Text>
              <View style={styles.regBar}>
                <Text style={styles.registeredBy}>Registered by {item.registeredBy}</Text>
                <PhoneIcon style={styles.phoneIcon} />
                <MessageIcon style={styles.messageIcon} />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CoordinatorStudentDisciplineLog;
