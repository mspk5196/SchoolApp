import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Header, HorizontalChipSelector } from '../../../../components';
import ApiService from '../../../../utils/ApiService';
import { SafeAreaView } from 'react-native-safe-area-context';

const CoordinatorSectionEnrollment = ({ navigation }) => {
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [sectionName, setSectionName] = useState('');
  const [createdBy, setCreatedBy] = useState(null);

  useEffect(() => {
    fetchCoordinatorGrades();
  }, []);

  useEffect(() => {
    if (selectedGrade) {
      fetchSections();
    }
  }, [selectedGrade]);

  const fetchCoordinatorGrades = async () => {
    try {
      const asyncUserData = await AsyncStorage.getItem('userData');
      const parsedUserData = asyncUserData ? JSON.parse(asyncUserData) : null;
      setCreatedBy(parsedUserData?.id);

      const asyncGrades = await AsyncStorage.getItem('coordinatorGrades');
      const parsedGrades = asyncGrades ? JSON.parse(asyncGrades) : [];
      setGrades(parsedGrades);

      if (parsedGrades.length > 0) {
        setSelectedGrade(parsedGrades[0]);
      }
    } catch (error) {
      console.error('Error fetching coordinator grades:', error);
      Alert.alert('Error', 'Failed to load grades');
    }
  };

  const fetchSections = async () => {
    if (!selectedGrade) return;

    setLoading(true);
    try {
      const response = await ApiService.makeRequest('/coordinator/enrollment/getSectionsByGrade', {
        method: 'POST',
        body: JSON.stringify({ gradeId: selectedGrade.grade_id }),
      });
    
      const data = await response.json();
      if (data.success) {
        setSections(data.data);
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      Alert.alert('Error', 'Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSections();
    setRefreshing(false);
  }, [selectedGrade]);

  const handleCreateSection = async () => {
    if (!sectionName.trim()) {
      Alert.alert('Validation Error', 'Please enter a section name');
      return;
    }

    if (!selectedGrade) {
      Alert.alert('Error', 'Please select a grade first');
      return;
    }

    try {
      const response = await ApiService.makeRequest('/coordinator/enrollment/createSection', {
        method: 'POST',
        body: JSON.stringify({
          gradeId: selectedGrade.grade_id,
          sectionName: sectionName.trim(),
          createdBy: createdBy,
        }),
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Section created successfully');
        setSectionName('');
        setIsModalVisible(false);
        fetchSections();
      } else {
        Alert.alert('Error', data.message || 'Failed to create section');
      }
    } catch (error) {
      console.error('Error creating section:', error);
      Alert.alert('Error', 'Failed to create section');
    }
  };

  const handleDeleteSection = (section) => {
    Alert.alert(
      'Delete Section',
      `Are you sure you want to delete "${section.section_name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await ApiService.makeRequest('/coordinator/enrollment/deleteSection', {
                method: 'POST',
                body: JSON.stringify({ sectionId: section.section_id }),
              });
                const data = await response.json();
              if (data.success) {
                Alert.alert('Success', 'Section deleted successfully');
                fetchSections();
              } else {
                Alert.alert('Error', data.message || 'Failed to delete section');
              }
            } catch (error) {
              console.error('Error deleting section:', error);
              Alert.alert('Error', 'Failed to delete section');
            }
          },
        },
      ]
    );
  };

  const renderSectionItem = ({ item }) => (
    <View style={styles.sectionCard}>
      <View style={styles.sectionIconContainer}>
        <Icon name="google-classroom" size={32} color="#3B82F6" />
      </View>
      
      <View style={styles.sectionInfo}>
        <Text style={styles.sectionName}>{item.section_name}</Text>
        <Text style={styles.studentCount}>
          {item.student_count} {item.student_count === 1 ? 'Student' : 'Students'}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteSection(item)}
        activeOpacity={0.7}
      >
        <Icon name="delete" size={24} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="folder-open" size={80} color="#CBD5E1" />
      <Text style={styles.emptyStateTitle}>No Sections Found</Text>
      <Text style={styles.emptyStateText}>
        {selectedGrade
          ? `Create your first section for ${selectedGrade.grade_name}`
          : 'Please select a grade to view sections'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Section Enrollment"
        navigation={navigation}
        showBackButton={true}
        backgroundColor="#FFFFFF"
      />

      <HorizontalChipSelector
        data={grades}
        selectedItem={selectedGrade}
        onSelectItem={setSelectedGrade}
        idKey="grade_id"
        nameKey="grade_name"
      />

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading sections...</Text>
          </View>
        ) : (
          <FlatList
            data={sections}
            renderItem={renderSectionItem}
            keyExtractor={(item) => item.section_id.toString()}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmptyState}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.8}
      >
        <Icon name="plus" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setIsModalVisible(false)}
        onBackButtonPress={() => setIsModalVisible(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.5}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Section</Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Icon name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.selectedGradeText}>
              Grade: <Text style={styles.selectedGradeValue}>{selectedGrade?.grade_name}</Text>
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Section Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter section name (e.g., A, B, C)"
                value={sectionName}
                onChangeText={setSectionName}
                autoCapitalize="characters"
                maxLength={20}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setSectionName('');
                  setIsModalVisible(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateSection}
                activeOpacity={0.7}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sectionInfo: {
    flex: 1,
  },
  sectionName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  studentCount: {
    fontSize: 14,
    color: '#64748B',
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#475569',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#3B82F6',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  modalBody: {
    padding: 20,
  },
  selectedGradeText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 20,
  },
  selectedGradeValue: {
    fontWeight: '600',
    color: '#3B82F6',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  createButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CoordinatorSectionEnrollment;
