import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DocumentPicker from 'react-native-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_URL } from '../../../../utils/env.js';

const TopicMaterials = ({ route, navigation }) => {
  const { topicId, topicName } = route.params;
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Form state
  const [formData, setFormData] = useState({
    material_type: 'Academic',
    activity_name: '',
    files: [], // Changed to support multiple files
    file_type: 'PDF',
    estimated_duration: 30,
    difficulty_level: 'Medium',
    instructions: '',
    expected_date: '', // New field for expected completion date
    has_assessment: false, // Track if this material has assessment
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/coordinator/topics/${topicId}/materials`,
        { 
          method: 'GET',
          headers: { 'Content-Type': 'application/json' } 
        }
      );
      const result = await response.json();
      if (result.success) {
        setMaterials(result.data);
        console.log('Fetched materials:', result.data);
        
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch materials');
    } finally {
      setLoading(false);
    }
  };

  const selectFile = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: true, // Allow multiple file selection
      });
      
      // Process multiple files
      const newFiles = result.map(file => ({
        name: file.name,
        uri: file.uri,
        type: getFileType(file.name),
        size: file.size || 0
      }));

      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...newFiles],
      }));
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        Alert.alert('Error', 'Failed to select file');
      }
    }
  };

  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'PDF';
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'mkv':
      case 'webm': return 'Video';
      case 'doc':
      case 'docx':
      case 'txt': return 'Text';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'Image';
      case 'mp3':
      case 'wav':
      case 'aac': return 'Audio';
      default: return 'PDF';
    }
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const checkFileExists = async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const downloadFile = async (file) => {
    try {
      // Extract filename from the URL path
      const urlParts = file.url.split('/');
      const filename = urlParts[urlParts.length - 1];
      
      // Try direct static file serving first (Railway serves static files)
      const directUrl = `${API_URL}/api/coordinator/uploads/materials/${filename}`;
      const downloadUrl = `${API_URL}/api/coordinator/topics/materials/download/${filename}`;
      
      console.log('Downloading file from:', downloadUrl);
      console.log('Direct URL:', directUrl);
      console.log('File object:', file);
      
      // Check if file exists
      const directExists = await checkFileExists(directUrl);
      const downloadExists = await checkFileExists(downloadUrl);
      
      console.log('Direct URL exists:', directExists);
      console.log('Download URL exists:', downloadExists);
      
      if (!directExists && !downloadExists) {
        Alert.alert(
          'File Not Found', 
          `The file "${file.name}" was not found on the server. It may need to be re-uploaded.`
        );
        return;
      }
      
      // For web browsers or simulators, open in new tab
      if (Platform.OS === 'web') {
        const urlToUse = directExists ? directUrl : downloadUrl;
        window.open(urlToUse, '_blank');
        return;
      }

      // For mobile devices, try to open with system app
      Alert.alert(
        'Download File',
        `Download ${file.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Download', 
            onPress: async () => {
              try {
                // First try the download endpoint
                if (downloadExists) {
                  await Linking.openURL(downloadUrl);
                } else if (directExists) {
                  await Linking.openURL(directUrl);
                } else {
                  throw new Error('File not found on server');
                }
              } catch (error) {
                console.error('Download failed:', error);
                Alert.alert('Error', `Failed to download file: ${error.message}`);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download file');
    }
  };

  const viewFile = async (file) => {
    try {
      // Extract filename from the URL path
      const urlParts = file.url.split('/');
      const filename = urlParts[urlParts.length - 1];
      
      // Try direct static file serving first (Railway serves static files)
      const directUrl = `${API_URL}/api/coordinator/uploads/materials/${filename}`;
      const viewUrl = `${API_URL}/api/coordinator/topics/materials/view/${filename}`;
      
      console.log('Viewing file from:', viewUrl);
      console.log('Direct URL:', directUrl);
      console.log('File object:', file);
      
      // For PDFs and images, try to open in browser/viewer
      if (file.type === 'PDF' || file.type === 'Image') {
        try {
          // Try direct static file serving first for better compatibility
          await Linking.openURL(directUrl);
        } catch (error) {
          console.error('Direct URL failed, trying view endpoint:', error);
          try {
            await Linking.openURL(viewUrl);
          } catch (viewError) {
            console.error('View endpoint also failed:', viewError);
            Alert.alert('Error', `Cannot view this file: ${viewError.message}`);
          }
        }
      } else if (file.type === 'Video') {
        // For videos, also try to open directly
        try {
          await Linking.openURL(directUrl);
        } catch (error) {
          console.error('Direct video URL failed:', error);
          try {
            await Linking.openURL(viewUrl);
          } catch (viewError) {
            console.error('Video view endpoint failed:', viewError);
            downloadFile(file);
          }
        }
      } else {
        // For other file types, download them
        downloadFile(file);
      }
    } catch (error) {
      console.error('View file error:', error);
      Alert.alert('Error', 'Failed to view file');
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS, close on Android
    setSelectedDate(currentDate);
    
    // Format date as YYYY-MM-DD
    const formattedDate = currentDate.toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, expected_date: formattedDate }));
  };

  const showDatePickerModal = () => {
    // Set initial date from formData or default to tomorrow
    const initialDate = formData.expected_date 
      ? new Date(formData.expected_date) 
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
    
    setSelectedDate(initialDate);
    setShowDatePicker(true);
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const saveMaterial = async () => {
    try {
      // Validation
      if (!formData.activity_name.trim()) {
        Alert.alert('Error', 'Activity name is required');
        return;
      }

      // Validate expected date if assessment is enabled
      if (formData.has_assessment) {
        if (!formData.expected_date.trim()) {
          Alert.alert('Error', 'Expected completion date is required for materials with assessment');
          return;
        }
        
        // Basic date format validation
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(formData.expected_date)) {
          Alert.alert('Error', 'Please enter expected date in YYYY-MM-DD format');
          return;
        }
        
        // Check if the date is in the future
        const expectedDate = new Date(formData.expected_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (expectedDate < today) {
          Alert.alert('Error', 'Expected completion date must be today or in the future');
          return;
        }
      }

      if (editingMaterial) {
        // For editing, only update the text fields (not files)
        const updateData = {
          materialType: formData.material_type,
          activityName: formData.activity_name,
          estimatedDuration: formData.estimated_duration,
          difficultyLevel: formData.difficulty_level,
          instructions: formData.instructions,
          expectedDate: formData.expected_date,
          hasAssessment: formData.has_assessment,
        };

        const response = await fetch(
          `${API_URL}/api/coordinator/topics/materials/update/${editingMaterial.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
          }
        );

        const result = await response.json();
        console.log('Update result:', result);

        if (result.success) {
          Alert.alert('Success', 'Material updated successfully');
          setModalVisible(false);
          resetForm();
          fetchMaterials();
        } else {
          Alert.alert('Error', result.message || 'Failed to update material');
        }
      } else {
        // For new materials, require files
        if (formData.files.length === 0) {
          Alert.alert('Error', 'Please select at least one file');
          return;
        }

        const formDataToSend = new FormData();
        
        // Add form fields
        formDataToSend.append('topicId', topicId);
        formDataToSend.append('materialType', formData.material_type);
        formDataToSend.append('activityName', formData.activity_name);
        formDataToSend.append('estimatedDuration', formData.estimated_duration.toString());
        formDataToSend.append('difficultyLevel', formData.difficulty_level);
        formDataToSend.append('instructions', formData.instructions);
        formDataToSend.append('expectedDate', formData.expected_date);
        formDataToSend.append('hasAssessment', formData.has_assessment.toString());

        // Add files
        formData.files.forEach((file, index) => {
          formDataToSend.append('files', {
            uri: file.uri,
            type: file.type === 'PDF' ? 'application/pdf' : 
                  file.type === 'Video' ? 'video/mp4' :
                  file.type === 'Image' ? 'image/jpeg' :
                  file.type === 'Audio' ? 'audio/mpeg' : 'application/octet-stream',
            name: file.name
          });
        });

        const response = await fetch(`${API_URL}/api/coordinator/topics/materials/upload`, {
          method: 'POST',
          body: formDataToSend,
        });

        const result = await response.json();

        if (result.success) {
          Alert.alert('Success', 'Material uploaded successfully');
          setModalVisible(false);
          resetForm();
          fetchMaterials();
        } else {
          Alert.alert('Error', result.message || 'Failed to save material');
        }
      }
    } catch (error) {
      console.error('Save material error:', error);
      Alert.alert('Error', `Failed to save material: ${error.message}`);
    }
  };

  const deleteMaterial = async (materialId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this material?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `${API_URL}/api/coordinator/topics/materials/delete/${materialId}`,
                {
                  method: 'DELETE',
                  headers: { 'Content-Type': 'application/json' },
                }
              );
              const result = await response.json();
              if (result.success) {
                Alert.alert('Success', 'Material deleted successfully');
                fetchMaterials();
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete material');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      material_type: 'Academic',
      activity_name: '',
      files: [],
      file_type: 'PDF',
      estimated_duration: 30,
      difficulty_level: 'Medium',
      instructions: '',
      expected_date: '',
      has_assessment: false,
    });
    setEditingMaterial(null);
    setShowDatePicker(false);
    setSelectedDate(new Date(Date.now() + 24 * 60 * 60 * 1000)); // Tomorrow
  };

  const openEditModal = (material) => {
    setEditingMaterial(material);
    setFormData({
      material_type: material.material_type,
      activity_name: material.activity_name,
      files: material.files || [], // Handle existing files
      file_type: material.file_type,
      estimated_duration: material.estimated_duration,
      difficulty_level: material.difficulty_level,
      instructions: material.instructions || '',
      expected_date: material.expected_date || '',
      has_assessment: material.has_assessment || material.material_type === 'Assessment',
    });
    
    // Set the date picker's initial date if we have an expected date
    if (material.expected_date) {
      setSelectedDate(new Date(material.expected_date));
    } else {
      setSelectedDate(new Date(Date.now() + 24 * 60 * 60 * 1000)); // Tomorrow
    }
    
    setModalVisible(true);
  };

  const openCreateModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const getMaterialTypeColor = (type) => {
    switch (type) {
      case 'Academic': return '#007AFF';
      case 'Classwork_Period': return '#34C759';
      case 'Assessment': return '#FF9500';
      default: return '#8E8E93';
    }
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'Easy': return '#34C759';
      case 'Medium': return '#FF9500';
      case 'Hard': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const renderMaterialItem = ({ item }) => (
    <View style={styles.materialItem}>
      <View style={styles.materialHeader}>
        <View style={styles.materialInfo}>
          <Text style={styles.activityName}>{item.activity_name}</Text>
          <View style={styles.tagsContainer}>
            <View style={[styles.tag, { backgroundColor: getMaterialTypeColor(item.material_type) }]}>
              <Text style={styles.tagText}>{item.material_type.replace('_', ' ')}</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: getDifficultyColor(item.difficulty_level) }]}>
              <Text style={styles.tagText}>{item.difficulty_level}</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: '#8E8E93' }]}>
              <Text style={styles.tagText}>
                {item.files ? `${item.files.length} files` : item.file_type}
              </Text>
            </View>
          </View>
          <Text style={styles.duration}>Duration: {item.estimated_duration} minutes</Text>
          {item.instructions && (
            <Text style={styles.instructions} numberOfLines={2}>
              {item.instructions}
            </Text>
          )}
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openEditModal(item)}
          >
            <Text style={styles.actionButtonText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => deleteMaterial(item.id)}
          >
            <Text style={styles.actionButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
      {(item.files && item.files.length > 0) || item.file_name ? (
        <View style={styles.fileInfo}>
          <Text style={styles.fileIcon}>📎</Text>
          {item.files && item.files.length > 0 ? (
            <View style={styles.filesList}>
              {item.files.map((file, index) => (
                <View key={index} style={styles.fileItem}>
                  <TouchableOpacity 
                    style={styles.fileNameContainer}
                    onPress={() => viewFile(file)}
                  >
                    <Text style={styles.fileName}>
                      {file.name} ({file.type})
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.fileActions}>
                    <TouchableOpacity 
                      style={styles.fileActionButton}
                      onPress={() => viewFile(file)}
                    >
                      <Text style={styles.fileActionText}>👁️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.fileActionButton}
                      onPress={() => downloadFile(file)}
                    >
                      <Text style={styles.fileActionText}>📥</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <TouchableOpacity onPress={() => {
              // Handle legacy single file format
              const legacyFile = {
                name: item.file_name,
                url: item.file_url,
                type: item.file_type
              };
              viewFile(legacyFile);
            }}>
              <Text style={styles.fileName}>{item.file_name}</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>🔙</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Materials - {topicName}</Text>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <FlatList
          data={materials}
          renderItem={renderMaterialItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.materialsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingMaterial ? 'Edit Material' : 'Add New Material'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Material Type *</Text>
              <Picker
                selectedValue={formData.material_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, material_type: value }))}
                style={styles.picker}
              >
                <Picker.Item label="Academic" value="Academic" />
                <Picker.Item label="Classwork Period" value="Classwork_Period" />
                <Picker.Item label="Assessment" value="Assessment" />
              </Picker>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Activity Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.activity_name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, activity_name: text }))}
                placeholder="Enter activity name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>File Type</Text>
              <Picker
                selectedValue={formData.file_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, file_type: value }))}
                style={styles.picker}
              >
                <Picker.Item label="PDF" value="PDF" />
                <Picker.Item label="Video" value="Video" />
                <Picker.Item label="Interactive" value="Interactive" />
                <Picker.Item label="Exercise" value="Exercise" />
                <Picker.Item label="Text" value="Text" />
              </Picker>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Difficulty Level</Text>
              <Picker
                selectedValue={formData.difficulty_level}
                onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty_level: value }))}
                style={styles.picker}
              >
                <Picker.Item label="Easy" value="Easy" />
                <Picker.Item label="Medium" value="Medium" />
                <Picker.Item label="Hard" value="Hard" />
              </Picker>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Estimated Duration (minutes)</Text>
              <TextInput
                style={styles.input}
                value={formData.estimated_duration.toString()}
                onChangeText={(text) => setFormData(prev => ({ ...prev, estimated_duration: parseInt(text) || 30 }))}
                keyboardType="numeric"
                placeholder="Estimated duration"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Instructions</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.instructions}
                onChangeText={(text) => setFormData(prev => ({ ...prev, instructions: text }))}
                placeholder="Enter activity instructions"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Has Assessment</Text>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>
                  {formData.has_assessment ? 'Yes' : 'No'}
                </Text>
                <TouchableOpacity
                  style={[styles.switchButton, formData.has_assessment && styles.switchButtonActive]}
                  onPress={() => setFormData(prev => ({ ...prev, has_assessment: !prev.has_assessment }))}
                >
                  <Text style={[styles.switchButtonText, formData.has_assessment && styles.switchButtonTextActive]}>
                    {formData.has_assessment ? '✓' : '✗'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {formData.has_assessment && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Expected Completion Date *</Text>
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={showDatePickerModal}
                >
                  <Text style={styles.datePickerButtonText}>
                    {formData.expected_date 
                      ? formatDateForDisplay(formData.expected_date)
                      : 'Select Expected Date'
                    }
                  </Text>
                  <Text style={styles.datePickerIcon}>📅</Text>
                </TouchableOpacity>
                
                {Platform.OS === 'android' && (
                  <TextInput
                    style={[styles.input, styles.dateInput]}
                    value={formData.expected_date}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, expected_date: text }))}
                    placeholder="YYYY-MM-DD (or use date picker above)"
                    keyboardType="numeric"
                  />
                )}
                
                <Text style={styles.helpText}>
                  Students must complete this assessment by this date or they will be moved to a lower batch
                </Text>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Files *</Text>
              {editingMaterial ? (
                <View style={styles.editFileMessage}>
                  <Text style={styles.editFileText}>
                    📝 Note: File editing is not supported. To change files, please create a new material and delete this one.
                  </Text>
                  {editingMaterial.files && editingMaterial.files.length > 0 && (
                    <View style={styles.currentFiles}>
                      <Text style={styles.currentFilesLabel}>Current Files:</Text>
                      {editingMaterial.files.map((file, index) => (
                        <Text key={index} style={styles.currentFileName}>
                          • {file.name} ({file.type})
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ) : (
                <>
                  <Text style={styles.helpText}>
                    Select multiple files (PDF, Video, Images, etc.) for this learning material
                  </Text>
                  <TouchableOpacity style={styles.fileButton} onPress={selectFile}>
                    <Text style={styles.fileIcon}>📎</Text>
                    <Text style={styles.fileButtonText}>Select Files (PDF, Video, etc.)</Text>
                  </TouchableOpacity>
                  
                  {formData.files.length > 0 && (
                    <View style={styles.selectedFiles}>
                      {formData.files.map((file, index) => (
                        <View key={index} style={styles.selectedFile}>
                          <View style={styles.fileDetails}>
                            <Text style={styles.selectedFileName}>{file.name}</Text>
                            <Text style={styles.selectedFileType}>{file.type}</Text>
                          </View>
                          <TouchableOpacity 
                            style={styles.removeFileButton}
                            onPress={() => removeFile(index)}
                          >
                            <Text style={styles.removeFileText}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </>
              )}
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={saveMaterial}>
              <Text style={styles.saveButtonText}>
                {editingMaterial ? 'Update Material' : 'Add Material'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        
        {/* Native Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()} // Prevent selecting past dates
            style={styles.datePicker}
          />
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginLeft: 16,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: '600',
    // borderWidth:1
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  materialsList: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  materialItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  materialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  materialInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  duration: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  actionButtonText: {
    fontSize: 18,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  fileName: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  filesList: {
    flex: 1,
    marginLeft: 4,
  },
  fileItem: {
    backgroundColor: '#f0f8ff',
    padding: 6,
    borderRadius: 4,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileNameContainer: {
    flex: 1,
  },
  fileActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileActionButton: {
    padding: 4,
    marginLeft: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 4,
  },
  fileActionText: {
    fontSize: 14,
  },
  fileIcon: {
    fontSize: 16,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
  },
  form: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  picker: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  fileButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
  },
  selectedFiles: {
    marginTop: 12,
  },
  selectedFile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  fileDetails: {
    flex: 1,
  },
  selectedFileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  selectedFileType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  removeFileButton: {
    padding: 4,
    backgroundColor: '#ff3b30',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeFileText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  editFileMessage: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  editFileText: {
    fontSize: 14,
    color: '#856404',
    fontStyle: 'italic',
  },
  currentFiles: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ffeaa7',
  },
  currentFilesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 4,
  },
  currentFileName: {
    fontSize: 13,
    color: '#856404',
    marginLeft: 8,
    marginBottom: 2,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  switchButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 50,
    alignItems: 'center',
  },
  switchButtonActive: {
    backgroundColor: '#007AFF',
  },
  switchButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  switchButtonTextActive: {
    color: '#fff',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
    marginBottom: 8,
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  datePickerIcon: {
    fontSize: 18,
    color: '#007AFF',
  },
  dateInput: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  datePicker: {
    backgroundColor: '#fff',
  },
});

export default TopicMaterials;
