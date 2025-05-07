import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  ScrollView, 
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import PreviousIcon from '../../../assets/Basicimg/PrevBtn.svg';
import AddIcon from '../../../assets/DisciplineLog/Add.svg';
import Phone from '../../../assets/DisciplineLog/Phone.svg';
import MessageSquare from '../../../assets/DisciplineLog/MessageSquare.svg';
import styles from './DisciplineLogStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import Search from '../../../assets/StudentHome/studentprofile/search.svg';

const DisciplineLog = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [reason, setReason] = useState('');
  const [registeredBy, setRegisteredBy] = useState('');
  const [complaintModalVisible, setComplaintModalVisible] = useState(false);
  
  // Add search state
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  
  const [disciplineData, setDisciplineData] = useState([
    {
      id: 1,
      name: 'Admin',
      regNo: '2024VI023',
      reason: 'Student is saying that he came along with parents to school, and he is late to school because of traffic.',
      date: '29/10/23',
      registeredBy: 'SasiKumar',
    },
    {
      id: 2,
      name: 'Faculty',
      regNo: '2024VI024',
      reason: 'Student is saying that he came along with parents to school, and he is late to school because of traffic.',
      date: '29/10/23',
      registeredBy: 'SasiKumar',
    },
    {
      id: 3,
      name: 'Administrator',
      regNo: '2024VI023',
      reason: 'Student is saying that he came along with parents to school, and he is late to school because of traffic.',
      date: '29/10/23',
      registeredBy: 'SasiKumar',
    },
  ]);

  // Filter data when search text changes
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredData(disciplineData);
    } else {
      const filtered = disciplineData.filter(item => {
        const searchLower = searchText.toLowerCase();
        return (
          item.name.toLowerCase().includes(searchLower) ||
          item.regNo.toLowerCase().includes(searchLower)
        );
      });
      setFilteredData(filtered);
    }
  }, [searchText, disciplineData]);

  // Initialize filtered data with all data
  useEffect(() => {
    setFilteredData(disciplineData);
  }, []);

  const formatDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = String(today.getFullYear()).substring(2);
    return `${day}/${month}/${year}`;
  };

  const handleAddComplaint = () => {
    if (reason.trim() && registeredBy.trim()) {
      const newComplaint = {
        id: disciplineData.length + 1,
        name: 'Faculty',
        regNo: '2024VI023',
        reason: reason,
        date: formatDate(),
        registeredBy: registeredBy,
      };
      
      setDisciplineData([newComplaint, ...disciplineData]);
      setReason('');
      setRegisteredBy('');
      setModalVisible(false);
    }
  };

  const handleRegisterComplaint = () => {
    setModalVisible(false);
    setComplaintModalVisible(true);
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation && navigation.goBack()}
        >
          <PreviousIcon  color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discipline Log</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <Search style={styles.searchicon}/>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or ID"
          placeholderTextColor="#767676"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      
      <ScrollView style={styles.cardContainer}>
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Image source={require('../../../assets/DisciplineLog/staff.png')} style={styles.avatar} />
                <View>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardSubtitle}>{item.regNo}</Text>
                </View>
                <Text style={styles.cardDate}>{item.date}</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Reason</Text>
                <View style={styles.cardReasonContainer}>
                  <Text style={styles.cardReason}>{item.reason}</Text>
                </View>
                <View style={styles.regBar}>
                  <Text style={styles.registeredBy}>Registered by {item.registeredBy}</Text>
                  <TouchableOpacity style={styles.actionButtonCall}>
                    <Phone width={20} height={20} /> 
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButtonMsg}>
                    <MessageSquare width={20} height={20} /> 
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No records found</Text>
          </View>
        )}
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.AddButton} 
        onPress={() => navigation.navigate('DisciplineLogDetails')}
      >
        <AddIcon width={styles.AddIcon.width} height={styles.AddIcon.height} />
      </TouchableOpacity>

      
    </SafeAreaView>
  );
};

export default DisciplineLog;