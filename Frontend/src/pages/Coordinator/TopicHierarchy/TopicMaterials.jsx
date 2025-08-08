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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DocumentPicker from 'react-native-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../../utils/env.js';

const TopicMaterials = ({ route, navigation }) => {
  const { topicId, topicName } = route.params;
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    material_type: 'Academic',
    activity_name: '',
    file_name: '',
    file_url: '',
    file_type: 'PDF',
    estimated_duration: 30,
    difficulty_level: 'Medium',
    instructions: '',
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('coordinatorToken');
      const response = await fetch(
        `${API_URL}/coordinator/hierarchy/materials/${topicId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await response.json();
      if (result.success) {
        setMaterials(result.data);
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
      });
      
      const file = result[0];
      setFormData(prev => ({
        ...prev,
        file_name: file.name,
        file_url: file.uri,
        file_type: getFileType(file.name),
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
      case 'mov': return 'Video';
      case 'doc':
      case 'docx':
      case 'txt': return 'Text';
      default: return 'PDF';
    }
  };

  const saveMaterial = async () => {
    try {
      const token = await AsyncStorage.getItem('coordinatorToken');
      const payload = {
        ...formData,
        topic_id: topicId,
      };

      const url = editingMaterial 
        ? `${API_URL}/coordinator/hierarchy/materials/${editingMaterial.id}`
        : `${API_URL}/coordinator/hierarchy/materials`;      const response = await fetch(url, {
        method: editingMaterial ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        Alert.alert('Success', `Material ${editingMaterial ? 'updated' : 'created'} successfully`);
        setModalVisible(false);
        resetForm();
        fetchMaterials();
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save material');
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
              const token = await AsyncStorage.getItem('coordinatorToken');
              const response = await fetch(
                `${API_URL}/coordinator/hierarchy/materials/${materialId}`,
                {
                  method: 'DELETE',
                  headers: { Authorization: `Bearer ${token}` },
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
      file_name: '',
      file_url: '',
      file_type: 'PDF',
      estimated_duration: 30,
      difficulty_level: 'Medium',
      instructions: '',
    });
    setEditingMaterial(null);
  };

  const openEditModal = (material) => {
    setEditingMaterial(material);
    setFormData({
      material_type: material.material_type,
      activity_name: material.activity_name,
      file_name: material.file_name || '',
      file_url: material.file_url || '',
      file_type: material.file_type,
      estimated_duration: material.estimated_duration,
      difficulty_level: material.difficulty_level,
      instructions: material.instructions || '',
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
              <Text style={styles.tagText}>{item.file_type}</Text>
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
            <Icon name="edit" size={20} color="#FF9500" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => deleteMaterial(item.id)}
          >
            <Icon name="delete" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
      {item.file_name && (
        <View style={styles.fileInfo}>
          <Icon name="attach-file" size={16} color="#666" />
          <Text style={styles.fileName}>{item.file_name}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Materials - {topicName}</Text>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Icon name="add" size={24} color="#fff" />
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
              <Icon name="close" size={24} color="#333" />
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

            <TouchableOpacity style={styles.fileButton} onPress={selectFile}>
              <Icon name="attach-file" size={20} color="#007AFF" />
              <Text style={styles.fileButtonText}>
                {formData.file_name || 'Select File'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={saveMaterial}>
              <Text style={styles.saveButtonText}>
                {editingMaterial ? 'Update Material' : 'Add Material'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    padding: 8,
    borderRadius: 8,
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
});

export default TopicMaterials;
