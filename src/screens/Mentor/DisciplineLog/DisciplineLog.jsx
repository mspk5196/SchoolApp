import React, { useState } from 'react';
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
import BackIcon from '../../../assets/DisciplineLog/leftarrow.svg';
import AddIcon from '../../../assets/DisciplineLog/Add.svg';
import Phone from '../../../assets/DisciplineLog/Phone.svg';
import MessageSquare from '../../../assets/DisciplineLog/MessageSquare.svg';
import styles from './DisciplineLogStyles';
import { SafeAreaView } from 'react-native-safe-area-context';

const DisciplineLog = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [reason, setReason] = useState('');
  const [registeredBy, setRegisteredBy] = useState('');
  const [complaintModalVisible, setComplaintModalVisible] = useState(false);
  const [disciplineData, setDisciplineData] = useState([
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
        <BackIcon 
          width={styles.BackIcon.width} 
          height={styles.BackIcon.height} 
          onPress={() => navigation.navigate('Mentor')}
        />
        <Text style={styles.headerTxt}>Leave Approval</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
        />
      </View>
      
      <ScrollView style={styles.cardContainer}>
        {disciplineData.map((item) => (
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
              <Text style={styles.cardReason}>{item.reason}</Text>
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
        ))}
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.AddButton} 
        onPress={() => setModalVisible(true)}
      >
        <AddIcon width={styles.AddIcon.width} height={styles.AddIcon.height} />
      </TouchableOpacity>

      {/* Add Complaint Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.modalContainer}
              >
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Add Discipline Record</Text>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Reason</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter reason"
                      value={reason}
                      onChangeText={setReason}
                      multiline
                      numberOfLines={4}
                    />
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Registered By</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Your name"
                      value={registeredBy}
                      onChangeText={setRegisteredBy}
                    />
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Date</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formatDate()}
                      editable={false}
                    />
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.registerButton}
                    onPress={handleRegisterComplaint}
                  >
                    <Text style={styles.registerButtonText}>Register Complaint</Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Complaint Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={complaintModalVisible}
        onRequestClose={() => setComplaintModalVisible(false)}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContent}>
            <Image source={require('../../../assets/DisciplineLog/staff.png')} style={styles.confirmAvatar} />
            <Text style={styles.confirmTitle}>Prakash Raj</Text>
            <Text style={styles.confirmSubtitle}>2024VI023</Text>
            <Text style={styles.confirmLabel}>Student Mentor: Vishal</Text>
            
            <View style={styles.confirmReasonContainer}>
              <Text style={styles.confirmReasonTitle}>Reason</Text>
              <Text style={styles.confirmReasonText}>{reason}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={() => {
                handleAddComplaint();
                setComplaintModalVisible(false);
              }}
            >
              <Text style={styles.confirmButtonText}>Register Complaint</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DisciplineLog;