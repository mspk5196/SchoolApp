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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Nodata from '../../../../components/General/Nodata';
import * as materialApi from '../../../../utils/materialApi/mentorMaterialApi.js';

const TopicMaterials = ({ route, navigation }) => {
  const { topicId, topicName, selectedSubjectId, selectedSectionId } = route.params;
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);

  const [formData, setFormData] = useState({
    activity_name: '',
    material_url: '',
    material_type: 'PDF',
    estimated_duration: 30,
    difficulty_level: 'Medium',
    instructions: '',
    has_assessment: false,
    order_sequence: 1,
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const result = await materialApi.getTopicMaterials(topicId);
      if (result && result.success) {
        setMaterials(result.materials || []);
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

  const openMaterialUrl = async (material) => {
    try {
      const url = material.material_url || material.url;
      
      if (!url) {
        Alert.alert('Error', 'No URL available for this material');
        return;
      }

      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        Alert.alert('Invalid URL', 'Material URL must start with http:// or https://');
        return;
      }

      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(url);
        Alert.alert('Error', 'Cannot open this URL on your device');
      }
    } catch (error) {
      console.error('Open URL error:', error);
      Alert.alert('Error', `Failed to open material: ${error.message}`);
    }
  };

  const saveMaterial = async () => {
    try {
      if (!formData.activity_name.trim()) {
        Alert.alert('Error', 'Material title is required');
        return;
      }

      if (!formData.material_url || !formData.material_url.trim()) {
        Alert.alert('Error', 'Material URL is required');
        return;
      }

      const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlRegex.test(formData.material_url)) {
        Alert.alert('Error', 'Please enter a valid URL');
        return;
      }

      const materialData = {
        topic_id: topicId,
        material_type: formData.material_type,
        material_title: formData.activity_name,
        material_url: formData.material_url,
        estimated_duration: formData.estimated_duration,
        difficulty_level: formData.difficulty_level,
        instructions: formData.instructions,
        has_assessment: formData.has_assessment,
        order_number: formData.order_sequence || 1,
      };

      if (editingMaterial) {
        materialData.id = editingMaterial.id;
      }

      const result = editingMaterial
        ? await materialApi.updateTopicMaterial(materialData)
        : await materialApi.addTopicMaterial(materialData);

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
              const result = await materialApi.deleteTopicMaterial(materialId);
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
      material_type: 'PDF',
      activity_name: '',
      material_url: '',
      estimated_duration: 30,
      difficulty_level: 'Medium',
      instructions: '',
      has_assessment: false,
      order_sequence: 1,
    });
    setEditingMaterial(null);
  };

  const openEditModal = (material) => {
    setEditingMaterial(material);
    setFormData({
      material_type: material.material_type,
      activity_name: material.material_title || material.activity_name,
      material_url: material.material_url || '',
      estimated_duration: material.estimated_duration,
      difficulty_level: material.difficulty_level,
      instructions: material.instructions || '',
      has_assessment: material.has_assessment,
      order_sequence: material.order_number || 1,
    });
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

  const getFileTypeIcon = (type) => {
    switch (type) {
      case 'PDF': return 'file-pdf-box';
      case 'Video': return 'video';
      case 'Image': return 'image';
      case 'Text': return 'text-box';
      default: return 'file';
    }
  };

  const renderMaterialItem = ({ item }) => (
    <View style={styles.materialCard}>
      <View style={styles.materialHeader}>
        <View style={styles.materialIconContainer}>
          <MaterialCommunityIcons 
            name={getFileTypeIcon(item.material_type)} 
            size={32} 
            color={getMaterialTypeColor(item.material_type)} 
          />
        </View>
        
        <View style={styles.materialInfo}>
          <Text style={styles.materialTitle} numberOfLines={2}>
            {item.material_title}
          </Text>
          
          <View style={styles.tagsRow}>
            <View style={[styles.tag, { backgroundColor: getMaterialTypeColor(item.material_type) }]}>
              <Text style={styles.tagText}>
                {item.material_type.replace('_', ' ')}
              </Text>
            </View>
            <View style={[styles.tag, { backgroundColor: getDifficultyColor(item.difficulty_level) }]}>
              <Text style={styles.tagText}>{item.difficulty_level}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text style={styles.metaText}>{item.estimated_duration} min</Text>
            </View>
            {item.has_assessment && (
              <View style={styles.metaItem}>
                <MaterialIcons name="assignment" size={14} color="#FF9500" />
                <Text style={[styles.metaText, { color: '#FF9500' }]}>Has Assessment</Text>
              </View>
            )}
          </View>

          {item.instructions && (
            <Text style={styles.instructions} numberOfLines={2}>
              {item.instructions}
            </Text>
          )}
        </View>
      </View>

      {item.material_url && (
        <TouchableOpacity
          style={styles.urlCard}
          onPress={() => openMaterialUrl(item)}
          activeOpacity={0.7}
        >
          <Entypo name="link" size={16} color="#007AFF" />
          <Text style={styles.urlText} numberOfLines={1}>
            {item.material_url}
          </Text>
          <MaterialIcons name="open-in-new" size={18} color="#007AFF" />
        </TouchableOpacity>
      )}

      {/* <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => openEditModal(item)}
        >
          <MaterialIcons name="edit" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteMaterial(item.id)}
        >
          <MaterialCommunityIcons name="delete" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View> */}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {topicName}
          </Text>
          <Text style={styles.headerSubtitle}>Materials</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <AntDesign name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading materials...</Text>
        </View>
      ) : (
        <FlatList
          data={materials}
          renderItem={renderMaterialItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="folder-open-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateTitle}>No Materials Yet</Text>
              <Text style={styles.emptyStateText}>Tap the + button to add your first material</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingMaterial ? 'Edit Material' : 'Add Material'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <AntDesign name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Basic Information</Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Material Title *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.activity_name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, activity_name: text }))}
                  placeholder="Enter material title"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>File Type *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.material_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, material_type: value }))}
                    style={styles.picker}
                  >
                    <Picker.Item label="PDF Document" value="PDF" />
                    <Picker.Item label="Video" value="Video" />
                    <Picker.Item label="Image" value="Image" />
                    <Picker.Item label="Text/Document" value="Text" />
                  </Picker>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Material URL *</Text>
                <TextInput
                  style={[styles.input, styles.urlInput]}
                  value={formData.material_url}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, material_url: text }))}
                  placeholder="https://example.com/material.pdf"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
                <Text style={styles.helpText}>
                  Enter a complete URL to your material (Google Drive, Dropbox, etc.)
                </Text>
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Configuration</Text>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Duration (min)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.estimated_duration.toString()}
                    onChangeText={(text) => setFormData(prev => ({ 
                      ...prev, 
                      estimated_duration: parseInt(text) || 30 
                    }))}
                    keyboardType="numeric"
                    placeholder="30"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Difficulty</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formData.difficulty_level}
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        difficulty_level: value 
                      }))}
                      style={styles.picker}
                    >
                      <Picker.Item label="Easy" value="Easy" />
                      <Picker.Item label="Medium" value="Medium" />
                      <Picker.Item label="Hard" value="Hard" />
                    </Picker>
                  </View>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Instructions</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.instructions}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, instructions: text }))}
                  placeholder="Enter instructions for students..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.switchContainer}>
                <View style={styles.switchLabel}>
                  <MaterialIcons name="assignment" size={20} color="#666" />
                  <Text style={styles.switchText}>Has Assessment</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    formData.has_assessment && styles.toggleButtonActive
                  ]}
                  onPress={() => setFormData(prev => ({ 
                    ...prev, 
                    has_assessment: !prev.has_assessment 
                  }))}
                >
                  <Text style={[
                    styles.toggleButtonText,
                    formData.has_assessment && styles.toggleButtonTextActive
                  ]}>
                    {formData.has_assessment ? 'Yes' : 'No'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={saveMaterial}>
              <Text style={styles.saveButtonText}>
                {editingMaterial ? 'Update Material' : 'Add Material'}
              </Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#666',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  materialCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  materialHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  materialIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  materialInfo: {
    flex: 1,
  },
  materialTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  instructions: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 18,
  },
  urlCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d0e8ff',
  },
  urlText: {
    flex: 1,
    fontSize: 13,
    color: '#007AFF',
    marginHorizontal: 8,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
    borderBottomColor: '#e8e8e8',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
  },
  formSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#fafafa',
    color: '#1a1a1a',
  },
  urlInput: {
    fontFamily: 'monospace',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    fontStyle: 'italic',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  switchText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    minWidth: 60,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  saveButton: {
    margin: 16,
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default TopicMaterials;