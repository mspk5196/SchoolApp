import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  TextInput,
  Image,
  ScrollView,
} from 'react-native';
import PreviousIcon from '../../../assets/Basicimg/PrevBtn';
import PhoneIcon from '../../../assets/StudentHome/Issuelog/Phone.svg';
import MessageIcon from '../../../assets/StudentHome/Issuelog/MessageSquare.svg';
import styles from './IssuelogStyls';
import {SafeAreaView} from 'react-native-safe-area-context';
import Search from '../../../assets/StudentHome/studentprofile/search.svg';

const DisciplineLog = ({navigation}) => {
  const [activeSection, setActiveSection] = useState(null);
  const [searchText, setSearchText] = useState('');
  
  const tabs = [
    'Section A',
    'Section B',
    'Section C',
    'Section D',
    'Section E',
    'Section F',
    'Section G',
    'Section H',
    'Section I',
  ];
  
  const [disciplineData] = useState([
    {
      id: 1,
      name: 'John Doe',
      regNo: '2024VI023',
      reason: 'Student is saying that he came along with parents to school, and he is late to school because of traffic.',
      date: '29/10/23',
      registeredBy: 'SasiKumar',
    },
    {
      id: 2,
      name: 'Jane Smith',
      regNo: '2024VI024',
      reason: 'Student was not wearing proper uniform.',
      date: '30/10/23',
      registeredBy: 'SasiKumar',
    },
    {
      id: 3,
      name: 'Robert Johnson',
      regNo: '2024VI025',
      reason: 'Student was using mobile phone during class.',
      date: '31/10/23',
      registeredBy: 'SasiKumar',
    },
  ]);

  // Filter data based on search text (name or regNo)
  const filteredData = disciplineData.filter(item => 
    item.name.toLowerCase().includes(searchText.toLowerCase()) || 
    item.regNo.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSearch = (text) => {
    setSearchText(text);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation && navigation.goBack()}>
          <PreviousIcon color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Student List</Text>
      </View>
      
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.classnavsection}
        nestedScrollEnabled={true}>
        {tabs.map((section, index) => (
          <Pressable
            key={index}
            style={[
              styles.gradeselection,
              activeSection === index && styles.activeButton,
            ]}
            onPress={() => setActiveSection(index)}>
            <Text
              style={[
                styles.gradeselectiontext,
                activeSection === index && styles.activeText,
              ]}>
              {section}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.searchContainer}>
        <Search />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or ID"
          placeholderTextColor="#767676"
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      <ScrollView style={styles.cardContainer}>
        {filteredData.length > 0 ? (
          filteredData.map(item => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Image
                  source={require('../../../assets/StudentHome/Issuelog/staff.png')}
                  style={styles.avatar}
                />
                <View>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardSubtitle}>{item.regNo}</Text>
                </View>
                <Text style={styles.cardDate}>{item.date}</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Reason</Text>
                <View style={styles.cardLine} >
                <Text style={styles.cardReason}>{item.reason}</Text>
                </View>
                <View style={styles.regBar}>
                  <Text style={styles.registeredBy}>
                    Mentor : {item.registeredBy}
                  </Text>
                  <TouchableOpacity style={styles.actionButtonCall}>
                    <PhoneIcon width={20} height={20} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButtonMsg}>
                    <MessageIcon width={20} height={20} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No students found</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DisciplineLog;