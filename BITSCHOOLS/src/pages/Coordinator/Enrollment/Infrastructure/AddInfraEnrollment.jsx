import ApiService from '../../../../utils/ApiService';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Alert, ActivityIndicator } from 'react-native';
import styles from './AddInfraEnrollmentStyle';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const AddInfraEnrollment = ({ navigation, route }) => {
  const editVenue = route.params?.venue;
  const isEdit = route.params?.isEdit;
  const phoneNo = route.params?.phone;
  const isEditing = isEdit || !!editVenue;
  const [loading, setLoading] = useState(false);

  const [blocks, setBlocks] = useState([]);
  const types = ['Academic class', 'Laboratory', 'Library', 'Auditorium', 'Sports', 'Other'];

  const [blockModalVisible, setBlockModalVisible] = useState(false);
  const [typeModalVisible, setTypeModalVisible] = useState(false);

  // Block selection initialization
  const [selectedBlock, setSelectedBlock] = useState(() => {
    if (isEditing && editVenue) {
      // If block_id exists, use it; otherwise try to find block by name
      return editVenue.block_id || null;
    }
    return null;
  });

  const [formData, setFormData] = useState({
    name: isEditing && editVenue ? editVenue.name : '',
    floor: isEditing && editVenue ? editVenue.floor.toString() : '',
    capacity: isEditing && editVenue ? editVenue.capacity.toString() : '',
    type: isEditing && editVenue ? editVenue.type : 'Academic class',
    status: isEditing && editVenue ? editVenue.status : 'Active'
  });

  const [showFormData, setShowFormData] = useState({
    name: isEditing && editVenue ? editVenue.name : '',
    blockName: isEditing && editVenue ? editVenue.block : '',
    floor: isEditing && editVenue ? editVenue.floor.toString() : '',
    capacity: isEditing && editVenue ? editVenue.capacity.toString() : '',
    type: isEditing && editVenue ? editVenue.type : 'Academic class',
    status: isEditing && editVenue ? editVenue.status : 'Active'
  });

  useEffect(() => {
    const loadData = async () => {
      await fetchBlock();
      
      // After loading options, set edit data if editing
      if (isEditing && editVenue) {
        loadEditData();
      }
    };
    
    loadData();
  }, []);

  // Load edit data after options are fetched
  const loadEditData = () => {
    // Set block name for display
    if (selectedBlock && blocks.length > 0) {
      const block = blocks.find(b => b.id === selectedBlock);
      if (block) {
        handleChangeDisplay('blockName', block.block_name);
      }
    } else if (isEditing && editVenue && editVenue.block && blocks.length > 0) {
      // Try to find block by name if block_id not available
      const block = blocks.find(b => b.block_name === editVenue.block);
      if (block) {
        setSelectedBlock(block.id);
        handleChangeDisplay('blockName', block.block_name);
      }
    }
  };

  // Re-run loadEditData when blocks are loaded
  useEffect(() => {
    if (isEditing && editVenue && blocks.length > 0) {
      loadEditData();
    }
  }, [blocks, isEditing]);

  const fetchBlock = async () => {
    try {
      const resp = await ApiService.makeRequest(`/coordinator/enrollment/getBlocks`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await resp.json();
      if (data && data.success) {
        setBlocks(data.blocks || data.data || []);
      } else if (resp.ok && Array.isArray(data)) {
        setBlocks(data);
      }
    } catch (error) {
      console.error('Error fetching blocks:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleChangeDisplay = (field, value) => {
    setShowFormData({
      ...showFormData,
      [field]: value
    });
  };

  const handleNavigateToMapping = () => {
    if (!isEditing || !editVenue?.id) {
      Alert.alert('Error', 'Please save the venue first before mapping it to grades/sections');
      return;
    }
    // Navigate to mapping screen with venue details
    navigation.navigate('VenueMapping', { venueId: editVenue.id, venueName: editVenue.name });
  };

  const handleSubmit = async () => {
    // Better validation
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Venue name is required');
      return;
    }
    
    if (!selectedBlock) {
      Alert.alert('Error', 'Block is required');
      return;
    }
    
    if (!formData.floor || isNaN(parseInt(formData.floor))) {
      Alert.alert('Error', 'Valid floor number is required');
      return;
    }
    
    if (!formData.capacity || isNaN(parseInt(formData.capacity))) {
      Alert.alert('Error', 'Valid capacity is required');
      return;
    }

    // Prepare data differently for create vs update
    const venueData = {
      name: formData.name.trim(),
      block_id: selectedBlock,
      floor: parseInt(formData.floor, 10),
      capacity: parseInt(formData.capacity, 10),
      type: formData.type,
      status: formData.status,
      created_by: phoneNo || '9876543201'
    };

    console.log('Submitting venue data:', venueData); // Debug log

    try {
      setLoading(true);
      let response;

      let resp;
      if (isEditing) {
        resp = await ApiService.makeRequest(`/coordinator/enrollment/updateVenue/${editVenue.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(venueData)
        });
      } else {
        resp = await ApiService.makeRequest(`/coordinator/enrollment/createVenue`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(venueData)
        });
      }

      const responseData = await resp.json();
      console.log('Server response:', responseData); // Debug log

      if (resp.ok || (responseData && responseData.success)) {
        Alert.alert('Success', isEditing ? 'Venue updated successfully' : 'Venue added successfully');
        navigation.goBack();
      } else {
        throw new Error(responseData.message || 'Failed to save venue');
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Selection Modals
  const BlockSelectionModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={blockModalVisible}
      onRequestClose={() => setBlockModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Block</Text>
          <ScrollView style={styles.modalScrollView}>
            {blocks.map((block) => (
              <TouchableOpacity
                key={block.id}
                style={[
                  styles.modalItem,
                  selectedBlock === block.id && styles.modalItemSelected
                ]}
                onPress={() => {
                  setSelectedBlock(block.id);
                  handleChangeDisplay('blockName', block.block_name);
                  setBlockModalVisible(false);
                }}
              >
                <Text style={[
                  styles.modalItemText,
                  selectedBlock === block.id && { color: '#3557FF', fontWeight: '600' }
                ]}>
                  Block {block.block_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setBlockModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const TypeSelectionModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={typeModalVisible}
      onRequestClose={() => setTypeModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Type</Text>
          <ScrollView style={styles.modalScrollView}>
            {types.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.modalItem}
                onPress={() => {
                  handleChange('type', type);
                  handleChangeDisplay('type', type);
                  setTypeModalVisible(false);
                }}
              >
                <Text style={styles.modalItemText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setTypeModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>
          {isEditing ? 'Edit Venue' : 'Add New Venue'}
        </Text>
        {isEditing && editVenue?.id && (
          <TouchableOpacity 
            onPress={handleNavigateToMapping}
            style={{ paddingRight: 16 }}
          >
            <MaterialCommunityIcons name="plus-circle" size={24} color="#3557FF" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formContainer}>
          {/* Venue Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Venue name*</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Science Lab"
              value={formData.name}
              placeholderTextColor='grey'
              onChangeText={(text) => handleChange('name', text)}
            />
          </View>

          {/* Block */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Block*</Text>
            <TouchableOpacity
              style={[styles.input, styles.pickerInput]}
              onPress={() => setBlockModalVisible(true)}
            >
              <Text style={selectedBlock ? styles.inputText : styles.placeholderText}>
                {showFormData.blockName ? `Block ${showFormData.blockName}` : 'Select block'}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
            <BlockSelectionModal />
          </View>

          {/* Floor */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Floor*</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 1"
              value={formData.floor}
              placeholderTextColor='grey'
              keyboardType="numeric"
              onChangeText={(text) => handleChange('floor', text)}
            />
          </View>

          {/* Capacity */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Capacity*</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 30"
              value={formData.capacity}
              placeholderTextColor='grey'
              keyboardType="numeric"
              onChangeText={(text) => handleChange('capacity', text)}
            />
          </View>

          {/* Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Type*</Text>
            <TouchableOpacity
              style={[styles.input, styles.pickerInput]}
              onPress={() => setTypeModalVisible(true)}
            >
              <Text style={styles.inputText}>
                {showFormData.type}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
            <TypeSelectionModal />
          </View>

          {/* Status - only show when editing */}
          {isEditing && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Status</Text>
              <TouchableOpacity
                style={[styles.input, styles.pickerInput]}
                onPress={() => {
                  const newStatus = formData.status === 'Active' ? 'InActive' : 'Active';
                  handleChange('status', newStatus);
                }}
              >
                <Text style={[
                  styles.inputText,
                  { color: formData.status === 'Active' ? '#34C300' : '#F44336' }
                ]}>
                  {formData.status}
                </Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {isEditing ? 'Update Venue' : 'Add Venue'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddInfraEnrollment;