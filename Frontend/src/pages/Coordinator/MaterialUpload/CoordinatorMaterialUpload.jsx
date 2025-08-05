import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Alert, FlatList, TextInput, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DocumentPicker from 'react-native-document-picker';
import { API_URL } from '@env';

const CoordinatorMaterialUpload = ({ navigation, route }) => {
  const { coordinatorId, gradeId, sectionId } = route.params;
  
  const [subjects, setSubjects] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialTopic, setMaterialTopic] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [materialLevel, setMaterialLevel] = useState('1');
  const [isTopicBased, setIsTopicBased] = useState(false);
  const [canBeContinued, setCanBeContinued] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [activeTab, setActiveTab] = useState('materials');
 
  useEffect(() => {
    fetchSubjects();
    fetchMaterials();
  }, [sectionId]);

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`${API_URL}/coordinator/getSectionSubjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sectionId: sectionId }),
      });

      const result = await response.json();
      if (result.success) {
        setSubjects(result.subjects || []);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await fetch(`${API_URL}/coordinator/getMaterialsForSection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          sectionId: sectionId,
          gradeId: gradeId 
        }),
      });

      const result = await response.json();
      if (result.success) {
        setMaterials(result.materials || []);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const pickDocuments = async () => {
    try {
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images, DocumentPicker.types.doc, DocumentPicker.types.docx],
        allowMultiSelection: true,
      });
      
      setSelectedFiles(results);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled document picker');
      } else {
        console.error('Error picking documents:', err);
        Alert.alert('Error', 'Failed to pick documents');
      }
    }
  };

  const uploadMaterials = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('Error', 'Please select files to upload');
      return;
    }

    if (!materialTitle.trim()) {
      Alert.alert('Error', 'Please enter a title for the materials');
      return;
    }

    if (!selectedSubject) {
      Alert.alert('Error', 'Please select a subject');
      return;
    }

    if (isTopicBased && !materialTopic.trim()) {
      Alert.alert('Error', 'Please enter a topic title for topic-based materials');
      return;
    }

    try {
      setUploadProgress(true);
      
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', {
          uri: file.uri,
          type: file.type,
          name: file.name,
        });
        formData.append('title', materialTitle);
        formData.append('subjectId', selectedSubject.id);
        formData.append('gradeId', gradeId);
        formData.append('level', materialLevel);
        formData.append('isTopicBased', isTopicBased ? '1' : '0');
        formData.append('topicTitle', materialTopic);
        formData.append('canBeContinued', canBeContinued ? '1' : '0');
        formData.append('uploadedBy', coordinatorId);

        const response = await fetch(`${API_URL}/coordinator/uploadMaterial`, {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message || 'Upload failed');
        }
      }

      Alert.alert('Success', 'Materials uploaded successfully!');
      setShowUploadModal(false);
      resetForm();
      fetchMaterials();
      
    } catch (error) {
      console.error('Error uploading materials:', error);
      Alert.alert('Error', error.message || 'Failed to upload materials');
    } finally {
      setUploadProgress(false);
    }
  };

  const resetForm = () => {
    setSelectedFiles([]);
    setMaterialTitle('');
    setMaterialTopic('');
    setSelectedSubject(null);
    setMaterialLevel('1');
    setIsTopicBased(false);
    setCanBeContinued(true);
  };

  const deleteMaterial = async (materialId) => {
    Alert.alert(
      'Delete Material',
      'Are you sure you want to delete this material?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/coordinator/deleteMaterial`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ materialId: materialId }),
              });

              const result = await response.json();
              if (result.success) {
                Alert.alert('Success', 'Material deleted successfully');
                fetchMaterials();
              } else {
                Alert.alert('Error', result.message || 'Failed to delete material');
              }
            } catch (error) {
              console.error('Error deleting material:', error);
              Alert.alert('Error', 'Failed to delete material');
            }
          }
        }
      ]
    );
  };

  const openMaterial = (material) => {
    Alert.alert('Open Material', `Opening ${material.file_name}`);
  };

  const renderMaterialItem = ({ item }) => (
    <View style={styles.materialItem}>
      <View style={styles.materialHeader}>
        <Text style={styles.materialTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.materialBadges}>
          {item.is_topic_based ? (
            <View style={styles.topicBadge}>
              <Text style={styles.badgeText}>Topic</Text>
            </View>
          ) : (
            <View style={styles.levelBadge}>
              <Text style={styles.badgeText}>Level {item.level}</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteMaterial(item.id)}
          >
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.subjectName}>📚 {item.subject_name}</Text>
      {item.topic_title && (
        <Text style={styles.topicTitle}>🎯 {item.topic_title}</Text>
      )}
      <Text style={styles.fileName}>📄 {item.file_name}</Text>
      <Text style={styles.uploadDate}>
        Uploaded: {new Date(item.upload_date).toLocaleDateString()}
      </Text>
      
      <TouchableOpacity
        style={styles.openButton}
        onPress={() => openMaterial(item)}
      >
        <Text style={styles.openButtonText}>📖 View Material</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSelectedFile = ({ item, index }) => (
    <View style={styles.selectedFileItem}>
      <Text style={styles.selectedFileName} numberOfLines={1}>
        📎 {item.name}
      </Text>
      <TouchableOpacity
        style={styles.removeFileButton}
        onPress={() => {
          const newFiles = selectedFiles.filter((_, i) => i !== index);
          setSelectedFiles(newFiles);
        }}
      >
        <Text style={styles.removeFileText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSubjectOption = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.subjectOption,
        selectedSubject?.id === item.id && styles.selectedSubjectOption
      ]}
      onPress={() => setSelectedSubject(item)}
    >
      <Text style={[
        styles.subjectOptionText,
        selectedSubject?.id === item.id && styles.selectedSubjectOptionText
      ]}>
        {item.subject_name}
      </Text>
    </TouchableOpacity>
  );

  const groupedMaterials = materials.reduce((acc, material) => {
    const subject = material.subject_name;
    if (!acc[subject]) {
      acc[subject] = [];
    }
    acc[subject].push(material);
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Material Management</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'materials' && styles.activeTab]}
          onPress={() => setActiveTab('materials')}
        >
          <Text style={[styles.tabText, activeTab === 'materials' && styles.activeTabText]}>
            📚 Materials
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upload' && styles.activeTab]}
          onPress={() => setActiveTab('upload')}
        >
          <Text style={[styles.tabText, activeTab === 'upload' && styles.activeTabText]}>
            📤 Upload
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'materials' ? (
        // Materials List Tab
        <View style={styles.materialsContainer}>
          <Text style={styles.sectionTitle}>
            📚 Uploaded Materials ({materials.length})
          </Text>
          
          {materials.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No materials uploaded yet.{'\n'}
                Switch to "Upload" tab to add new materials.
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.materialsList} showsVerticalScrollIndicator={false}>
              {Object.keys(groupedMaterials).map(subject => (
                <View key={subject} style={styles.subjectGroup}>
                  <Text style={styles.subjectGroupTitle}>{subject}</Text>
                  {groupedMaterials[subject].map(material => (
                    <View key={material.id} style={styles.materialItem}>
                      <View style={styles.materialHeader}>
                        <Text style={styles.materialTitle} numberOfLines={2}>
                          {material.title}
                        </Text>
                        <View style={styles.materialBadges}>
                          {material.is_topic_based ? (
                            <View style={styles.topicBadge}>
                              <Text style={styles.badgeText}>Topic</Text>
                            </View>
                          ) : (
                            <View style={styles.levelBadge}>
                              <Text style={styles.badgeText}>Level {material.level}</Text>
                            </View>
                          )}
                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => deleteMaterial(material.id)}
                          >
                            <Text style={styles.deleteButtonText}>🗑️</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      
                      {material.topic_title && (
                        <Text style={styles.topicTitle}>🎯 {material.topic_title}</Text>
                      )}
                      <Text style={styles.fileName}>📄 {material.file_name}</Text>
                      <Text style={styles.uploadDate}>
                        Uploaded: {new Date(material.upload_date).toLocaleDateString()}
                      </Text>
                      
                      <TouchableOpacity
                        style={styles.openButton}
                        onPress={() => openMaterial(material)}
                      >
                        <Text style={styles.openButtonText}>📖 View Material</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      ) : (
        // Upload Tab
        <ScrollView style={styles.uploadContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.uploadForm}>
            <Text style={styles.formTitle}>📤 Upload New Material</Text>
            
            {/* Subject Selection */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Subject *</Text>
              <FlatList
                data={subjects}
                renderItem={renderSubjectOption}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.subjectsList}
              />
            </View>

            {/* Material Title */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Material Title *</Text>
              <TextInput
                style={styles.textInput}
                value={materialTitle}
                onChangeText={setMaterialTitle}
                placeholder="Enter material title..."
                multiline={false}
              />
            </View>

            {/* Topic-based Toggle */}
            <View style={styles.formSection}>
              <View style={styles.switchRow}>
                <Text style={styles.formLabel}>Topic-based Material</Text>
                <Switch
                  value={isTopicBased}
                  onValueChange={setIsTopicBased}
                  trackColor={{ false: '#ccc', true: '#007bff' }}
                  thumbColor={isTopicBased ? '#fff' : '#f4f3f4'}
                />
              </View>
              <Text style={styles.helperText}>
                Topic-based materials are assigned by coordinators for specific lessons
              </Text>
            </View>

            {/* Topic Title (conditional) */}
            {isTopicBased && (
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Topic Title *</Text>
                <TextInput
                  style={styles.textInput}
                  value={materialTopic}
                  onChangeText={setMaterialTopic}
                  placeholder="Enter topic title..."
                  multiline={false}
                />
              </View>
            )}

            {/* Level Selection (for non-topic materials) */}
            {!isTopicBased && (
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Material Level</Text>
                <View style={styles.levelContainer}>
                  {[1, 2, 3, 4, 5].map(level => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.levelOption,
                        materialLevel === level.toString() && styles.selectedLevelOption
                      ]}
                      onPress={() => setMaterialLevel(level.toString())}
                    >
                      <Text style={[
                        styles.levelOptionText,
                        materialLevel === level.toString() && styles.selectedLevelOptionText
                      ]}>
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Can be continued toggle */}
            <View style={styles.formSection}>
              <View style={styles.switchRow}>
                <Text style={styles.formLabel}>Allow Continuation</Text>
                <Switch
                  value={canBeContinued}
                  onValueChange={setCanBeContinued}
                  trackColor={{ false: '#ccc', true: '#28a745' }}
                  thumbColor={canBeContinued ? '#fff' : '#f4f3f4'}
                />
              </View>
              <Text style={styles.helperText}>
                Allow mentors to mark this material as "continue in next session"
              </Text>
            </View>

            {/* File Selection */}
            <View style={styles.formSection}>
              <TouchableOpacity
                style={styles.filePickerButton}
                onPress={pickDocuments}
              >
                <Text style={styles.filePickerText}>
                  📎 Select Files (PDF, DOC, Images)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>
                  Selected Files ({selectedFiles.length}):
                </Text>
                <FlatList
                  data={selectedFiles}
                  renderItem={renderSelectedFile}
                  keyExtractor={(item, index) => index.toString()}
                  style={styles.selectedFilesList}
                />
              </View>
            )}

            {/* Upload Button */}
            <TouchableOpacity
              style={[
                styles.uploadButton,
                (uploadProgress || selectedFiles.length === 0 || !materialTitle.trim() || !selectedSubject || (isTopicBased && !materialTopic.trim())) && styles.disabledButton
              ]}
              onPress={uploadMaterials}
              disabled={uploadProgress || selectedFiles.length === 0 || !materialTitle.trim() || !selectedSubject || (isTopicBased && !materialTopic.trim())}
            >
              <Text style={styles.uploadButtonText}>
                {uploadProgress ? '⏳ Uploading...' : '📤 Upload Materials'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    fontSize: 16,
    color: '#007bff',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007bff',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  materialsContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  emptyContainer: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  materialsList: {
    flex: 1,
  },
  subjectGroup: {
    marginBottom: 24,
  },
  subjectGroupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  materialItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  materialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  materialTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  materialBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topicBadge: {
    backgroundColor: '#6f42c1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  levelBadge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  topicTitle: {
    fontSize: 14,
    color: '#6f42c1',
    marginBottom: 4,
  },
  fileName: {
    fontSize: 14,
    color: '#007bff',
    marginBottom: 4,
  },
  uploadDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  openButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  openButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  uploadContainer: {
    flex: 1,
  },
  uploadForm: {
    padding: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  subjectsList: {
    maxHeight: 60,
  },
  subjectOption: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  selectedSubjectOption: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  subjectOptionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedSubjectOptionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  levelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  levelOption: {
    width: 50,
    height: 50,
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  selectedLevelOption: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  levelOptionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedLevelOptionText: {
    color: '#fff',
  },
  filePickerButton: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  filePickerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  selectedFilesList: {
    maxHeight: 120,
  },
  selectedFileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedFileName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  removeFileButton: {
    padding: 4,
  },
  removeFileText: {
    fontSize: 16,
    color: '#dc3545',
  },
  uploadButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
};

export default CoordinatorMaterialUpload;
