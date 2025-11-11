import AsyncStorage from '@react-native-async-storage/async-storage';
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
import DocumentPicker from '@react-native-documents/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import Nodata from '../../../../components/General/Nodata';
import * as materialApi from '../../../../utils/materialApi';
import ApiService from '../../../../utils/ApiService';

const TopicMaterials = ({ route, navigation }) => {
  const { topicId, topicName, selectedSubjectId, selectedSectionId } = route.params;
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBatchId, setSelectedBatchId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    material_type: 'Academic',
    activity_name: '',
    material_url: '', // URL to the material resource
    file_type: 'PDF',
    estimated_duration: 30,
    difficulty_level: 'Medium',
    instructions: '',
    has_assessment: false,
    order_sequence: 1,
  });

  // Batch-wise expected dates state
  const [batches, setBatches] = useState([]);
  const [batchExpectedDates, setBatchExpectedDates] = useState({});
  const [showBatchDatePickers, setShowBatchDatePickers] = useState({});

  useEffect(() => {
    fetchMaterials();
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await ApiService.makeRequest(`/coordinator/topics/batches/${selectedSubjectId}/${selectedSectionId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      if (result.success) {
        const list = result.batches || result.data || [];
        setBatches(list);
        // Initialize batch expected dates as empty strings
        const initialDates = {};
        list.forEach(batch => {
          initialDates[batch.id] = null; // Start with no date set
        });
        setBatchExpectedDates(initialDates);
      } else {
        setBatches([]);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      setBatches([]);
    }
  };

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const result = await materialApi.getTopicMaterials(topicId);
      
      if (result && result.success) {
        // Materials already come with proper structure from backend
        setMaterials(result.materials || []);
        // console.log('Fetched materials:', result.materials);
      } else {
        setMaterials([]);
      }
    } catch (error) {
      console.error('Fetch materials error:', error);
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
      const token = await AsyncStorage.getItem('token');
      const urlWithToken = token ? `${url}${url.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}` : url;
      const response = await fetch(urlWithToken, {
        method: 'HEAD',
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const downloadFile = async (file) => {
    try {
      // Handle both legacy single file format and new multiple file format
      let filename;
      
      if (typeof file.url === 'string' && file.url.startsWith('/uploads/materials/')) {
        // Legacy format: direct URL
        const urlParts = file.url.split('/');
        filename = urlParts[urlParts.length - 1];
      } else if (file.name) {
        // New format: file object with name
        filename = file.name;
      } else {
        // Try to extract from malformed URL
        console.error('Invalid file object:', file);
        Alert.alert('Error', 'Invalid file format');
        return;
      }

  // Construct proper URLs (append token via query so middleware can auth without headers)
  const token = await AsyncStorage.getItem('token');
  const baseDirect = `${API_URL}/uploads/materials/${filename}`;
  const baseDownload = `${API_URL}/api/coordinator/topics/materials/download/${filename}`;
  const directUrl = token ? `${baseDirect}?token=${encodeURIComponent(token)}` : baseDirect;
  const downloadUrl = token ? `${baseDownload}?token=${encodeURIComponent(token)}` : baseDownload;

      // console.log('Downloading file from:', downloadUrl);
      // console.log('Direct URL:', directUrl);
      // console.log('File object:', file);
      // console.log('Extracted filename:', filename);

      // Check if file exists
      const directExists = await checkFileExists(directUrl);
      const downloadExists = await checkFileExists(downloadUrl);

      // console.log('Direct URL exists:', directExists);
      // console.log('Download URL exists:', downloadExists);

      if (!directExists && !downloadExists) {
        Alert.alert(
          'File Not Found',
          `The file "${file.name || filename}" was not found on the server. It may need to be re-uploaded.`
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
      // Handle both legacy single file format and new multiple file format
      let filename;
      
      if (typeof file.url === 'string' && file.url.startsWith('/uploads/materials/')) {
        // Legacy format: direct URL
        const urlParts = file.url.split('/');
        filename = urlParts[urlParts.length - 1];
      } else if (file.name) {
        // New format: file object with name
        filename = file.name;
      } else {
        // Try to extract from malformed URL
        console.error('Invalid file object:', file);
        Alert.alert('Error', 'Invalid file format');
        return;
      }

  // Construct proper URLs (append token via query so middleware can auth without headers)
  const token = await AsyncStorage.getItem('token');
  const baseDirect = `${API_URL}/uploads/materials/${filename}`;
  const baseView = `${API_URL}/api/coordinator/topics/materials/view/${filename}`;
  const directUrl = token ? `${baseDirect}?token=${encodeURIComponent(token)}` : baseDirect;
  const viewUrl = token ? `${baseView}?token=${encodeURIComponent(token)}` : baseView;

      // console.log('Viewing file from:', viewUrl);
      // console.log('Direct URL:', directUrl);
      // console.log('File object:', file);
      // console.log('Extracted filename:', filename);

      // For PDFs and images, try to open in browser/viewer
      if (file.type === 'PDF' || file.type === 'Image') {
        try {
          // Try view endpoint first (token in query)
          await Linking.openURL(viewUrl);
        } catch (error) {
          console.error('Open URL failed, trying direct static URL:', error);
          try {
            await Linking.openURL(directUrl);
          } catch (viewError) {
            console.error('View endpoint also failed:', viewError);
            Alert.alert('Error', `Cannot view this file: ${viewError.message}`);
          }
        }
      } else if (file.type === 'Video') {
        // For videos, also try to open directly
        try {
          await Linking.openURL(viewUrl);
        } catch (error) {
          console.error('Direct video URL failed:', error);
          try {
            await Linking.openURL(directUrl);
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

  const handleBatchDateChange = (batchId, event, selectedDate) => {
    const currentDate = selectedDate || batchExpectedDates[batchId];
    setShowBatchDatePickers(prev => ({
      ...prev,
      [batchId]: Platform.OS === 'ios'
    }));
    setBatchExpectedDates(prev => ({
      ...prev,
      [batchId]: currentDate
    }));
  };

  const showBatchDatePicker = (batchId) => {
    setShowBatchDatePickers(prev => ({
      ...prev,
      [batchId]: true
    }));
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

  // Batch date picker functions
  const showBatchDatePickerModal = (batchId) => {
    const currentDate = batchExpectedDates[batchId] 
      ? new Date(batchExpectedDates[batchId])
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow

    setSelectedBatchId(batchId);
    setSelectedDate(currentDate);
    setShowDatePicker(true);
  };

  const clearBatchDate = (batchId) => {
    setBatchExpectedDates(prev => ({
      ...prev,
      [batchId]: null
    }));
  };

  const loadBatchExpectedDates = async (topicId) => {
    // if(topicId == 30001) return; // Skip loading for demo topic
    // console.log(topicId);
    
    try {
      const response = await ApiService.makeRequest(`/coordinator/topics/materials/${topicId}/batch-dates`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      if (result.success) {
        // Set the batch expected dates from the response
        const dates = {};
        result.batchDates.forEach(item => {
          dates[item.batch_id] = item.expected_completion_date;
        });
        setBatchExpectedDates(dates);
      }
    } catch (error) {
      console.error('Error loading batch expected dates:', error);
      // Initialize with null dates if loading fails
      const dates = {};
      batches.forEach(batch => {
        dates[batch.id] = null;
      });
      setBatchExpectedDates(dates);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    
    if (selectedDate) {
      setSelectedDate(selectedDate);
      
      // If we have a selected batch, update batch expected dates
      if (selectedBatchId) {
        const formattedDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        setBatchExpectedDates(prev => ({
          ...prev,
          [selectedBatchId]: formattedDate
        }));
        setSelectedBatchId(null); // Reset after setting
      } else {
        // Regular date picker for assessment expected date
        const formattedDate = selectedDate.toISOString().split('T')[0];
        setFormData(prev => ({
          ...prev,
          expected_date: formattedDate
        }));
      }
    }
  };

  const saveMaterial = async () => {
    try {
      // Validation
      if (!formData.activity_name.trim()) {
        Alert.alert('Error', 'Material title is required');
        return;
      }

      // For materials, we need material_url instead of file upload
      if (!formData.material_url || !formData.material_url.trim()) {
        Alert.alert('Error', 'Material URL is required');
        return;
      }

      // Validate URL format
      const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlRegex.test(formData.material_url)) {
        Alert.alert('Error', 'Please enter a valid URL');
        return;
      }

      const materialData = {
        topic_id: topicId,
        material_type: formData.material_type || formData.file_type, // PDF, Video, Document, Link
        material_title: formData.activity_name,
        material_url: formData.material_url,
        estimated_duration: formData.estimated_duration,
        difficulty_level: formData.difficulty_level,
        instructions: formData.instructions,
        has_assessment: formData.has_assessment,
        order_number: formData.order_sequence || 1,
      };

      console.log('Saving material:', materialData);

      const result = editingMaterial
        ? await materialApi.updateTopicMaterial(editingMaterial.id, materialData)
        : await materialApi.addTopicMaterial(materialData);

      console.log('Save result:', result);

      if (result && result.success) {
        Alert.alert('Success', `Material ${editingMaterial ? 'updated' : 'created'} successfully`);
        setModalVisible(false);
        resetForm();
        fetchMaterials();
      } else {
        Alert.alert('Error', result?.message || 'Failed to save material');
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
              const result = await materialApi.deleteMaterial(materialId);
              
              if (result && result.success) {
                Alert.alert('Success', 'Material deleted successfully');
                fetchMaterials();
              } else {
                Alert.alert('Error', result?.message || 'Failed to delete material');
              }
            } catch (error) {
              console.error('Delete material error:', error);
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
      material_url: '',
      file_type: 'PDF',
      estimated_duration: 30,
      difficulty_level: 'Medium',
      instructions: '',
      has_assessment: false,
      order_sequence: 1,
    });
    setEditingMaterial(null);
    setShowDatePicker(false);
    setSelectedDate(new Date(Date.now() + 24 * 60 * 60 * 1000)); // Tomorrow

    // Reset batch expected dates
    const resetDates = {};
    batches.forEach(batch => {
      resetDates[batch.id] = null; // Start with no date set
    });
    setBatchExpectedDates(resetDates);
    setShowBatchDatePickers({});
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
      // expected_date: material.expected_date || '',
      has_assessment: material.has_assessment || material.material_type === 'Assessment',
    });

    // Set the date picker's initial date if we have an expected date
    // if (material.expected_date) {
    //   setSelectedDate(new Date(material.expected_date));
    // } else {
    //   setSelectedDate(new Date(Date.now() + 24 * 60 * 60 * 1000)); // Tomorrow
    // }

    // Load batch expected dates for this material
    loadBatchExpectedDates(topicId);

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
            <MaterialIcons name="edit" size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => deleteMaterial(item.id)}
          >
            <MaterialCommunityIcons name="delete-forever" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
      {(item.files && item.files.length > 0) || item.file_name ? (
        <View style={styles.fileInfo}>
          <Entypo name="attachment" size={16} color="#666" />
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
                      <Entypo name="eye" size={18} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.fileActionButton}
                      onPress={() => downloadFile(file)}
                    >
                      <MaterialIcons name="file-download" size={18} color="#007AFF" />
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
          <AntDesign name="arrowleft" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Materials - {topicName}</Text>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <MaterialIcons name="add" size={24} color="#fff" />
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
          ListEmptyComponent={<Nodata message="No materials yet. Tap + to add." />}
        />
      )}

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingMaterial ? 'Edit Material' : 'Add New Material'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <AntDesign name="closecircle" size={24} color="#666" />
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
                  {formData.has_assessment ? (
                    <AntDesign name="check" size={16} color="#fff" />
                  ) : (
                    <AntDesign name="close" size={16} color="#666" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* {formData.has_assessment && (
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
                  <AntDesign name="calendar" size={20} color="#007AFF" />
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
            )} */}

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
                    <Entypo name="attachment" size={20} color="#007AFF" />
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
                            <AntDesign name="close" size={16} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </>
              )}
            </View>

            {/* Batch-wise Expected Completion Dates */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Batch-wise Expected Completion Dates</Text>
              <Text style={styles.helpText}>
                Set different expected completion dates for each batch in this section
              </Text>
              
              {batches.length > 0 ? (
                <View style={styles.batchesContainer}>
                  {batches.map((batch) => (
                    <View key={batch.id} style={styles.batchItem}>
                      <View style={styles.batchHeader}>
                        <Text style={styles.batchName}>{batch.batch_name}</Text>
                        {/* <Text style={styles.batchStudentCount}>
                          ({batch.student_count || 0} students)
                        </Text> */}
                      </View>
                      
                      <TouchableOpacity 
                        style={styles.batchDatePickerButton}
                        onPress={() => showBatchDatePickerModal(batch.id)}
                      >
                        <Text style={styles.batchDatePickerButtonText}>
                          {batchExpectedDates[batch.id] 
                            ? formatDateForDisplay(batchExpectedDates[batch.id])
                            : 'Set Expected Date'
                          }
                        </Text>
                        <AntDesign name="calendar" size={18} color="#007AFF" />
                      </TouchableOpacity>
                      
                      {batchExpectedDates[batch.id] && (
                        <TouchableOpacity
                          style={styles.clearDateButton}
                          onPress={() => clearBatchDate(batch.id)}
                        >
                          <Text style={styles.clearDateText}>Clear</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noBatchesText}>
                  No batches available for this section
                </Text>
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
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
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
    padding: 8,
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
  batchesContainer: {
    marginTop: 8,
  },
  batchItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  batchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  batchName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  batchStudentCount: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  batchDatePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#fff',
  },
  batchDatePickerButtonText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  clearDateButton: {
    marginTop: 6,
    alignSelf: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#ff6b6b',
    borderRadius: 4,
  },
  clearDateText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  noBatchesText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
});

export default TopicMaterials;
