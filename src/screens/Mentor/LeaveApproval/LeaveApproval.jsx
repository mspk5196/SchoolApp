import React, { useState, useMemo } from 'react';
import { 
  Text, 
  View, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  SafeAreaView,
  TextInput,
  Modal
} from 'react-native';
import BackIcon from '../../../assets/LeaveApproval/leftarrow.svg';
import Checkmark from '../../../assets/LeaveApproval/checkmark.svg';
import Close from '../../../assets/LeaveApproval/close.svg';
import Staff from "../../../assets/LeaveApproval/staff.png";
import Tickbox from '../../../assets/LeaveApproval/tickbox.svg';
import Tick from '../../../assets/LeaveApproval/tick.svg';
import styles from './LeaveApprovalStyles';
import Dateicon from '../../../assets/LeaveApproval/date.svg';
import Reasonicon from '../../../assets/LeaveApproval/reason.svg';
import History from '../../../assets/LeaveApproval/history.svg';
import Background from '../../../assets/LeaveApproval/background.svg'

// Sample data for available substitutes
const substitutesData = [
  { name: 'Prakash Raj', id: '2024V1023', selected: false },
  { name: 'Prakash Raj', id: '2024V1023', selected: false },
  { name: 'Prakash Raj', id: '2024V1023', selected: false },
];

const studentsData = [
  { 
    name: 'Prakash Raj 1', 
    id: '2024V1023',
    leaveDate: '20/08/2024 - 23/08/2024',
    leaveType: 'Sick Leave',
    leaveReason: 'Due to Heavy fever I\'m unable to attend the class fever I\'m unable to attend the class Due to Heavy fever I\'m unable to attend the class fever',
    status: 'Pending'
  },
  { 
    name: 'Prakash Raj 2', 
    id: '2024V1023',
    leaveDate: '20/08/2024 - 23/08/2024',
    leaveType: 'Sick Leave',
    leaveReason: 'Due to Heavy fever I\'m unable to attend the class fever I\'m unable to attend the class Due to Heavy fever I\'m unable to attend the class fever',
    status: 'Pending'
  },
  { 
    name: 'Prakash Raj 3', 
    id: '2024V1023',
    leaveDate: '20/08/2024 - 23/08/2024',
    leaveType: 'Sick Leave',
    leaveReason: 'Due to Heavy fever I\'m unable to attend the class fever I\'m unable to attend the class Due to Heavy fever I\'m unable to attend the class fever',
    status: 'Pending'
  },
  { 
    name: 'Prakash Raj 4', 
    id: '2024V1023',
    leaveDate: '20/08/2024 - 23/08/2024',
    leaveType: 'Sick Leave',
    leaveReason: 'Due to Heavy fever I\'m unable to attend the class fever I\'m unable to attend the class Due to Heavy fever I\'m unable to attend the class fever',
    status: 'Pending'
  },
  { 
    name: 'Prakash Raj 5', 
    id: '2024V1023',
    leaveDate: '20/08/2024 - 23/08/2024',
    leaveType: 'Sick Leave',
    leaveReason: 'Due to Heavy fever I\'m unable to attend the class fever I\'m unable to attend the class Due to Heavy fever I\'m unable to attend the class fever',
    status: 'Pending'
  },
  { 
    name: 'Prakash Raj 6', 
    id: '2024V1023',
    leaveDate: '20/08/2024 - 23/08/2024',
    leaveType: 'Sick Leave',
    leaveReason: 'Due to Heavy fever I\'m unable to attend the class fever I\'m unable to attend the class Due to Heavy fever I\'m unable to attend the class fever',
    status: 'Pending'
  },
  { 
    name: 'Prakash Raj 7', 
    id: '2024V1023',
    leaveDate: '20/08/2024 - 23/08/2024',
    leaveType: 'Sick Leave',
    leaveReason: 'Due to Heavy fever I\'m unable to attend the class fever I\'m unable to attend the class Due to Heavy fever I\'m unable to attend the class fever',
    status: 'Pending'
  },
];

const LeaveApproval = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStudents, setActiveStudents] = useState(studentsData);
  const [filteredStudents, setFilteredStudents] = useState(activeStudents);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Rejection modal states
  const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Substitutes modal states
  const [substitutesModalVisible, setSubstitutesModalVisible] = useState(false);
  const [availableSubstitutes, setAvailableSubstitutes] = useState(substitutesData);
  
  // History modal state
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  
  // Use useMemo to only filter when searchQuery or activeStudents changes
  useMemo(() => {
    if (searchQuery.trim() === '') {
      setFilteredStudents(activeStudents);
    } else {
      const filtered = activeStudents.filter(
        student => 
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, activeStudents, showHistory]);

  // Navigate to leave details page with student data
  const handleStudentPress = (student) => {
    navigation.navigate('LeaveDetails', { student });
  };

  // Function to handle approving all students' leave requests
  const handleApproveAll = () => {
    // Add all students to history with approved status
    const approvedStudents = activeStudents.map(student => ({
      ...student,
      status: 'Approved',
      actionDate: new Date().toLocaleDateString(),
      substitutes: []
    }));
    
    setHistoryRecords([...historyRecords, ...approvedStudents]);
    setActiveStudents([]);
    setFilteredStudents([]);
    
  };

  // Function to show the rejection modal
  const handleReject = (student) => {
    setSelectedStudent(student);
    setRejectionReason('Due to unavailability of faculties and substitutes your leave is being rejected. Sorry for the inconvenience caused if any.');
    setRejectionModalVisible(true);
  };

  // Function to confirm rejection with reason
  const confirmRejection = () => {
    if (selectedStudent) {
      // Add to history with rejected status
      const rejectedStudent = {
        ...selectedStudent,
        status: 'Rejected',
        actionDate: new Date().toLocaleDateString(),
        rejectionReason: rejectionReason
      };
      
      setHistoryRecords([...historyRecords, rejectedStudent]);
      
      // Remove from active list
      const updatedActiveStudents = activeStudents.filter(
        student => student.name !== selectedStudent.name || student.id !== selectedStudent.id
      );
      setActiveStudents(updatedActiveStudents);
      
      // Close the modal after confirming
      setRejectionModalVisible(false);
      setRejectionReason('');
      setSelectedStudent(null);
    }
  };

  // Function to show the substitutes modal
  const handleApprove = (student) => {
    setSelectedStudent(student);
    setSubstitutesModalVisible(true);
  };

  // Function to toggle substitute selection
  const toggleSubstituteSelection = (index) => {
    const updatedSubstitutes = [...availableSubstitutes];
    updatedSubstitutes[index].selected = !updatedSubstitutes[index].selected;
    setAvailableSubstitutes(updatedSubstitutes);
  };

  // Function to confirm substitute selection
  const confirmSubstituteSelection = () => {
    const selectedSubstitutes = availableSubstitutes.filter(sub => sub.selected);
    
    // Add to history with approved status
    const approvedStudent = {
      ...selectedStudent,
      status: 'Approved',
      actionDate: new Date().toLocaleDateString(),
      substitutes: selectedSubstitutes
    };
    
    setHistoryRecords([...historyRecords, approvedStudent]);
    
    // Remove from active list
    const updatedActiveStudents = activeStudents.filter(
      student => student.name !== selectedStudent.name || student.id !== selectedStudent.id
    );
    setActiveStudents(updatedActiveStudents);
    
    // Reset selections and close modal
    setAvailableSubstitutes(availableSubstitutes.map(sub => ({...sub, selected: false})));
    setSubstitutesModalVisible(false);
    setSelectedStudent(null);
  };

  // Toggle history view
  const toggleHistoryView = () => {
    setHistoryModalVisible(true);
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
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.historyIconContainer}>
        <TouchableOpacity onPress={toggleHistoryView}>
          <History height={20} style={styles.historyIcon}/>
        
             <Text style={styles.historyText}>History</Text>
             </TouchableOpacity>
             </View>
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        {filteredStudents.map((student, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.listItem}
            onPress={() => handleStudentPress(student)}
          >
            <Image source={Staff} style={styles.studentAvatar} />
            <View style={styles.listContent}>
              <Text style={styles.listName}>{student.name}</Text>
              <Text style={styles.listId}>{student.id}</Text>
            </View>
            
            <View style={styles.approveBtns}>
              <TouchableOpacity 
                style={styles.approveButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleApprove(student);
                }}
              >
                <Checkmark width={20} height={20} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.rejectButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleReject(student);
                }}
              >
                <Close width={20} height={20} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
        
        {filteredStudents.length === 0 && (
          <View style={styles.noResultsContainer}>
            <Background width={300} height={300}/>
            <Text style={styles.noResultsText}>No pending leave requests</Text>
          </View>
        )}
      </ScrollView>

      {/* Approve All Button */}
      {filteredStudents.length > 0 && (
        <TouchableOpacity 
          style={styles.approveAllButton}
          onPress={handleApproveAll}
        >
          <Text style={styles.approveAllButtonText}>
            Approve all ({filteredStudents.length}) and allot
          </Text>
        </TouchableOpacity>
      )}

      {/* Rejection Reason Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={rejectionModalVisible}
        onRequestClose={() => setRejectionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reason for rejection</Text>
            
            <TextInput
              style={styles.rejectionInput}
              multiline
              value={rejectionReason}
              onChangeText={setRejectionReason}
              numberOfLines={4}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setRejectionModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={confirmRejection}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Available Substitutes Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={substitutesModalVisible}
        onRequestClose={() => setSubstitutesModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Available Substitutes</Text>
            
            <View style={styles.substitutesContainer}>
              {availableSubstitutes.map((substitute, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.substituteItem}
                  onPress={() => toggleSubstituteSelection(index)}
                >
                  <View style={styles.substituteInfo}>
                    <Image source={Staff} style={styles.substituteAvatar} />
                    <View>
                      <Text style={styles.substituteName}>{substitute.name}</Text>
                      <Text style={styles.substituteId}>{substitute.id}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.checkboxContainer}>
                    {substitute.selected ? 
                      <Tick width={20} height={20} /> : 
                      <Tickbox width={20} height={20} />
                    }
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.substituteConfirmButton}
              onPress={confirmSubstituteSelection}
            >
              <Text style={styles.substituteConfirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* History Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={historyModalVisible}
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.historyModalContent]}>
            <View style={styles.historyHeader}>
              <Text style={styles.modalTitle}>Leave History</Text>
              <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
                <Close width={20} height={20} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.historyScrollContainer}>
              {historyRecords.length > 0 ? (
                historyRecords.map((record, index) => (
                  <View key={index} style={styles.historyItem}>
                    <View style={styles.historyItemHeader}>
                      <View style={styles.historyItemLeft}>
                        <Image source={Staff} style={styles.historyAvatar} />
                        <View>
                          <Text style={styles.historyName}>{record.name}</Text>
                          <Text style={styles.historyId}>{record.id}</Text>
                        </View>
                      </View>
                      <View style={[
                        styles.statusBadge, 
                        record.status === 'Approved' ? styles.approvedBadge : styles.rejectedBadge
                      ]}>
                        <Text style={styles.statusText}>{record.status}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.historyDetails}>
                      <View style={styles.detailRow}>
                        <Dateicon width={16} height={16} />
                        <Text style={styles.detailText}>{record.leaveDate}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Reasonicon width={16} height={16} />
                        <Text style={styles.detailText}>{record.leaveType}</Text>
                      </View>
                      
                      {record.status === 'Approved' && record.substitutes && record.substitutes.length > 0 && (
                        <View style={styles.substitutesSection}>
                          <Text style={styles.substitutesTitle}>Assigned Substitutes:</Text>
                          {record.substitutes.map((sub, i) => (
                            <Text key={i} style={styles.substituteHistoryItem}>
                              • {sub.name} ({sub.id})
                            </Text>
                          ))}
                        </View>
                      )}
                      
                      {record.status === 'Rejected' && record.rejectionReason && (
                        <View style={styles.rejectionSection}>
                          <Text style={styles.rejectionTitle}>Rejection Reason:</Text>
                          <Text style={styles.rejectionHistoryText}>{record.rejectionReason}</Text>
                        </View>
                      )}
                      
                      <Text style={styles.actionDateText}>
                        Action Date: {record.actionDate}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.noHistoryContainer}>
              
                  <Text style={styles.noHistoryText}>No history records available</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default LeaveApproval;