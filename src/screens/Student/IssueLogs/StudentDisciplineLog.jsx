import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Pressable,
  TextInput, 
  Image, 
  ScrollView
} from 'react-native';
import BackIcon from '../../../assets/GeneralAssests/backarrow.svg';
import PhoneIcon from '../../../assets/IssueLogs/call.svg';
import MessageIcon from '../../../assets/IssueLogs/msg.svg';
import styles from './StudentDisciplineLogStyles';
import { SafeAreaView } from 'react-native-safe-area-context';

const DisciplineLog = ({ navigation }) => {
  const [activeSection, setActiveSection] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  
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
      name: 'Faculty',
      regNo: '2024VI023',
      reason: 'Student is saying that he came along with parents to school, and he is late to school because of traffic.',
      date: '29/10/23',
      registeredBy: 'SasiKumar',
    },
    {
      id: 2,
      name: 'Admin',
      regNo: '2024VI023',
      reason: 'Student is saying that he came along with parents to school, and he is late to school because of traffic.',
      date: '29/10/23',
      registeredBy: 'SasiKumar',
    },
  ]);

  // Filter data based on search query and active section
  useEffect(() => {
    let result = disciplineData;
    
    // Filter by search query - ONLY for name and regNo
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.regNo.toLowerCase().includes(query)
        // Removed filtering by reason and registeredBy as requested
      );
    }
    
    // If a section is selected, we could filter by section
    // This would need actual section data in the disciplineData objects
    
    setFilteredData(result);
  }, [searchQuery, activeSection, disciplineData]);

  // Initialize filtered data on component mount
  useEffect(() => {
    setFilteredData(disciplineData);
  }, [disciplineData]);

  // Handle search input change
  const handleSearch = (text) => {
    setSearchQuery(text);
  };

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
      
      <ScrollView 
        horizontal={true} 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent} 
        style={styles.classnavsection} 
        nestedScrollEnabled={true}
      >
        {tabs.slice(0, 7).map((section, index) => (
          <Pressable
            key={index}
            style={[styles.gradeselection, activeSection === index && styles.activeButton]}
            onPress={() => setActiveSection(index)}
          >
            <Text style={[styles.gradeselectiontext, activeSection === index && styles.activeText]}>
              {section}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or registration number..."
          value={searchQuery}
          onChangeText={handleSearch}
          clearButtonMode="while-editing"
        />
      </View>
      
      <ScrollView style={styles.cardContainer}>
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Image source={require('../../../assets/IssueLogs/staff.png')} style={styles.avatar} />
                <View>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardSubtitle}>{item.regNo}</Text>
                </View>
                <Text style={styles.cardDate}>{item.date}</Text>
              </View>
              <View style={styles.cardContent}>
                
                <Text style={styles.cardLabel}>Reason</Text>
                <View style={styles.cardInfo}>
                <Text style={styles.cardReason}>{item.reason}</Text>
                </View>
                <View style={styles.regBar}>
                  <Text style={styles.registeredBy}>Registered by {item.registeredBy}</Text>
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
            <Text style={styles.noResultsText}>No matching records found</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DisciplineLog;