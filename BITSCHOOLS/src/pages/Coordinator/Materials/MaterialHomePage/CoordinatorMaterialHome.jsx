import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View, Pressable, SectionList, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import styles from './MaterialHomeStyle';
import Nodata from '../../../../components/General/Nodata';
import LottieView from 'lottie-react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as DocumentPicker from '@react-native-documents/picker';
import * as materialApi from '../../../../utils/materialApi';
import ApiService from '../../../../utils/ApiService';
import { Header, HorizontalChipSelector } from '../../../../components';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CoordinatorMaterialHome = ({ navigation, route }) => {
  const params = route.params && route.params.data ? route.params.data : (route.params || {});
  const { userData } = params;

  const [grades, setGrades] = useState([]);
  const [gradeSubject, setGradeSubject] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState();

  const [activeSectionSelection, setActiveSectionSelection] = useState(null);

  useEffect(() => {
    fetchgrades()
  }, [])
  useEffect(() => {
    if (selectedGrade) {
      fetchGradeSubjects();
    }
  }, [selectedGrade]);

  const fetchgrades = async () => {
    try {
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

  const fetchGradeSubjects = async (isRefreshing = false) => {
    // Guard: don't call API if selectedGrade is not set
    if (!selectedGrade || !selectedGrade.grade_id) return;

    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const result = await materialApi.getGradeSubjects(selectedGrade.grade_id);
      
      if (result && result.success) {

        const subjectsWithActivities = result.gradeSubjects.map((subject, index) => ({
          ...subject,
          key: `${subject.subject_id}-${index}` // Create a unique key
        }));

        setGradeSubject([{
          title: 'Subjects',
          data: subjectsWithActivities
        }]);
      } else {
        setGradeSubject([]);
        if (!isRefreshing) {
          Alert.alert("No Subjects", result?.message || "No subjects for this section");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      if (!isRefreshing) {
        Alert.alert("Error", "Failed to fetch subjects");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const fetchSections = async () => {
    // Guard: ensure selectedGrade exists before requesting sections
    if (!selectedGrade || !selectedGrade.grade_id) return;

    try {
      const response = await ApiService.makeRequest(`/coordinator/getGradeSections`, {
        method: 'POST',
        body: JSON.stringify({ gradeID: selectedGrade.grade_id }),
      });
      const data = await response.json();
      
      if (data.success && data.gradeSections.length > 0) {
        setSections(data.gradeSections);
        setSelectedSection(data.gradeSections[0].id);
        setActiveSectionSelection(data.gradeSections[0]);
        
      } else {
        Alert.alert('No Sections Found', 'No section is associated with this grade');
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      Alert.alert('Error', 'Failed to fetch sections data');
    }
  };

  const handleSectionChange = (sectionId) => {
    console.log(sectionId.id);

    setSelectedSection(sectionId.id);
    setActiveSectionSelection(sectionId);
  };

  useEffect(() => {
    if (selectedGrade) {
      fetchSections();
    }
  }, [selectedGrade]);
  useEffect(() => {
    if (sections.length > 0) {
      setSelectedSection(sections[0].id);
    }
  }, [sections]);

  const onRefresh = () => {
    if (selectedGrade) {
      fetchGradeSubjects(true);
    }
  };

  const showSuccessMessage = (message) => {
    Alert.alert('Success', message);
  };

  const showErrorMessage = (message) => {
    Alert.alert('Error', message);
  };

  const showUploadSummary = (uploadResult) => {
    const created = uploadResult?.batchesCreated ?? uploadResult?.created ?? 0;
    const assigned = uploadResult?.studentsAssigned ?? uploadResult?.updated ?? 0;
    const errors = Array.isArray(uploadResult?.errors) ? uploadResult.errors : [];

    if (errors.length === 0) {
      Alert.alert(
        'Upload Complete',
        `Batches uploaded successfully!\nBatches Created: ${created}\nStudents Assigned: ${assigned}`
      );
      return;
    }

    const maxToShow = 10;
    const visible = errors.slice(0, maxToShow).join('\n');
    const moreCount = errors.length - maxToShow;
    const suffix = moreCount > 0 ? `\n...and ${moreCount} more` : '';
    Alert.alert(
      'Upload Completed With Errors',
      `Batches Created: ${created}\nStudents Assigned: ${assigned}\nErrors (${errors.length}):\n${visible}${suffix}`
    );
  };

  const showAcademicYearUploadSummary = (res) => {
    const topics = res?.topicsCreated || 0;
    const materials = res?.materialsCreated || 0;
    const batchDates = res?.batchDatesSet || 0;
    const errors = Array.isArray(res?.errors) ? res.errors : [];
    if (!errors.length) {
      Alert.alert('Upload Complete', `Academic year data imported.\nTopics: ${topics}\nMaterials: ${materials}\nBatch Dates: ${batchDates}`);
      return;
    }
    const maxToShow = 10;
    const visible = errors.slice(0, maxToShow).join('\n');
    const more = errors.length - maxToShow;
    Alert.alert('Upload Completed With Errors', `Topics: ${topics}\nMaterials: ${materials}\nBatch Dates: ${batchDates}\nErrors (${errors.length}):\n${visible}${more>0?`\n...and ${more} more`:''}`);
  };

  const handleDownloadBatchTemplate = async () => {
    try {
      setLoading(true);
      const result = await materialApi.downloadBatchTemplate();
      if (result && result.success) {
        showSuccessMessage('Batch template downloaded successfully!');
      } else {
        showErrorMessage(result?.message || 'Failed to download template');
      }
    } catch (error) {
      console.error('Download template error:', error);
      showErrorMessage('Failed to download template');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadBatchesExcel = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.xlsx, DocumentPicker.types.xls],
        copyTo: 'cachesDirectory',
      });

      if (result && result.length > 0) {
        const file = result[0];
        
        setLoading(true);
        const uploadResult = await materialApi.uploadBatchesExcel(file);
        
        if (uploadResult && uploadResult.success) {
          showUploadSummary(uploadResult);
          // Refresh the data
          if (selectedGrade) {
            fetchGradeSubjects(true);
          }
        } else {
          showErrorMessage(uploadResult?.message || 'Failed to upload batches');
        }
      }
    } catch (error) {
      // Some DocumentPicker builds don't expose `isCancel`. Fall back to a safe check.
      const pickerIsCancel = (DocumentPicker && typeof DocumentPicker.isCancel === 'function')
        ? DocumentPicker.isCancel(error)
        : (error && (error.code === 'DOCUMENT_PICKER_CANCELED' || error.name === 'AbortError' || (typeof error.message === 'string' && error.message.toLowerCase().includes('cancel'))));

      if (pickerIsCancel) {
        console.log('User cancelled file picker');
      } else {
        console.error('Upload error:', error);
        showErrorMessage('Failed to upload batches');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAcademicYearTemplate = async () => {
    try {
      setLoading(true);
      const result = await materialApi.downloadAcademicYearTemplate(selectedGrade?.grade_id);
      if (result && result.success) {
        showSuccessMessage('Academic year template downloaded successfully!');
      } else {
        showErrorMessage(result?.message || 'Failed to download academic year template');
      }
    } catch (e) {
      console.error('Download academic year template error:', e);
      showErrorMessage('Failed to download academic year template');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAcademicYearExcel = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.xlsx, DocumentPicker.types.xls],
        copyTo: 'cachesDirectory',
      });
      if (result && result.length > 0) {
        const file = result[0];
        setLoading(true);
        const uploadResult = await materialApi.uploadAcademicYearExcel(file);
        if (uploadResult && uploadResult.success) {
          showAcademicYearUploadSummary(uploadResult);
          // Refresh subjects (new topics/materials won't change subjects but safe to refresh)
          if (selectedGrade) fetchGradeSubjects(true);
        } else {
          showErrorMessage(uploadResult?.message || 'Failed to upload academic year data');
        }
      }
    } catch (error) {
      const pickerIsCancel = (DocumentPicker && typeof DocumentPicker.isCancel === 'function')
        ? DocumentPicker.isCancel(error)
        : (error && (error.code === 'DOCUMENT_PICKER_CANCELED' || error.name === 'AbortError' || (typeof error.message === 'string' && error.message.toLowerCase().includes('cancel'))));
      if (pickerIsCancel) {
        console.log('User cancelled academic year file picker');
      } else {
        console.error('Academic year upload error:', error);
        showErrorMessage('Failed to upload academic year data');
      }
    } finally {
      setLoading(false);
    }
  };

  const Cards = ({ title, Icon, bgColor, color }) => {
    // Only used for Level Promotion now
    return (
      <View style={[styles.card, { backgroundColor: bgColor }]}>
        {Icon}
        <Text style={[styles.cardText, { color: color }]}>{title}</Text>
      </View>
    );
  };

  // Loading component
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Header title="Loading..." />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#0C36FF" />
          <Text style={styles.loadingText}>Loading subjects...</Text>
          <LottieView
            source={require('../../../../assets/General/lottie_loading.json')}
            autoPlay
            loop
            speed={0.5}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SectionList
      sections={gradeSubject}
      keyExtractor={(item) => item.key}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListHeaderComponent={(
        <View>
          <Header title="Enrollment Home" navigation={navigation} />

          <HorizontalChipSelector
            data={grades}
            selectedItem={selectedGrade}
            onSelectItem={setSelectedGrade}
            idKey="grade_id"
            nameKey="grade_name"
          />
          {selectedGrade && sections.length > 0 && (
            <HorizontalChipSelector
              data={sections}
              selectedItem={activeSectionSelection}
              onSelectItem={handleSectionChange}
              idKey="id"
              nameKey="section_name"
            />
          )}

          {selectedGrade && selectedSection && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 12, elevation: 2 }}>
              <TouchableOpacity
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3B82F6', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, marginRight: 8 }}
                onPress={handleDownloadBatchTemplate}
                disabled={loading}
              >
                <MaterialCommunityIcons name="download" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Download Template</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#10B981', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, marginLeft: 8 }}
                onPress={handleUploadBatchesExcel}
                disabled={loading}
              >
                <MaterialCommunityIcons name="upload" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Upload Batches</Text>
              </TouchableOpacity>
            </View>
          )}
          {selectedGrade && selectedSection && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', marginHorizontal: 16, marginTop: 8, borderRadius: 12, elevation: 2 }}>
              <TouchableOpacity
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#6366F1', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, marginRight: 8 }}
                onPress={handleDownloadAcademicYearTemplate}
                disabled={loading}
              >
                <MaterialCommunityIcons name="download" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Academic Year Template</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#D97706', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, marginLeft: 8 }}
                onPress={handleUploadAcademicYearExcel}
                disabled={loading}
              >
                <MaterialCommunityIcons name="upload" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Upload Academic Year</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      renderItem={({ item }) => (
        <View style={[styles.card, { backgroundColor: (item.subject_id % 2) ? '#C9F7F5' : '#65558F12' }]}>
          <Pressable style={styles.centeredCardContent}>
            <Text style={[styles.cardText, styles.centeredText, { color: (item.subject_id % 2) ? '#0FBEB3' : '#65558F' }]}>
              {item.subject_name}
            </Text>
            <View style={styles.cardManagementOptions}>
              <TouchableOpacity
                style={[styles.managementButton, { borderColor: (item.subject_id % 2) ? '#0FBEB3' : '#65558F' }]}
                onPress={() => navigation.navigate('TopicHierarchyManagement', {
                  userData,
                  grades,
                  selectedGrade,
                  selectedSubjectId: item.subject_id,
                  selectedSubjectName: item.subject_name,
                  selectedSectionId: selectedSection
                })}
              >
                <Text style={[styles.managementButtonText, { color: (item.subject_id % 2) ? '#0FBEB3' : '#65558F' }]}>📚 Topic Hierarchy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.managementButton, { borderColor: (item.subject_id % 2) ? '#0FBEB3' : '#65558F' }]}
                onPress={() => {
                  navigation.navigate('BatchManagementHome', {
                    userData,
                    grades,
                    selectedGrade,
                    selectedSubjectId: item.subject_id,
                    selectedSubjectName: item.subject_name,
                    selectedSectionId: selectedSection
                  });
                  console.log('Navigated to BatchManagementHome with:', {
                    userData,
                    grades,
                    selectedGrade,
                    selectedSubjectId: item.subject_id,
                    selectedSubjectName: item.subject_name,
                    selectedSectionId: selectedSection
                  });
                }}
              >
                <Text style={[styles.managementButtonText, { color: (item.subject_id % 2) ? '#0FBEB3' : '#65558F' }]}>👥 Batches</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </View>
      )}
      renderSectionHeader={() => null}
      ListEmptyComponent={(
        <View style={styles.noDataContainer}>
          <Nodata message="No subjects found for this grade" style={styles.noDataContent} />
        </View>
      )}
    />
  );
}

export default CoordinatorMaterialHome;