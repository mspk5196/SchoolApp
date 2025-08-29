// Add this to your CoordinatorScheduleHome.jsx
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Linking } from 'react-native';
import { API_URL } from '../../utils/env';

const SectionSelectionModal = ({ visible, onClose, gradeId, onSectionSelect }) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && gradeId) {
      fetchSections();
    }
  }, [visible, gradeId]);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/coordinator/getGradeSections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gradeID: gradeId }),
      });
      const result = await response.json();
      if (result.success) {
        setSections(result.gradeSections);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionSelect = async (section) => {
    try {
      // Generate download URL
      const downloadUrl = `${API_URL}/api/coordinator/generate-schedule-template/${gradeId}/${section.id}`;

      // Open the download URL (this will trigger file download)
      Linking.openURL(downloadUrl);
      
      onClose();
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Error downloading template: ' + error.message);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%', maxHeight: '60%' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' }}>
            Select Section
          </Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#0C36FF" />
          ) : (
            <FlatList
              data={sections}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                  onPress={() => handleSectionSelect(item)}
                >
                  <Text style={{ fontSize: 16 }}>Section {item.section_name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
          
          <TouchableOpacity
            style={{ marginTop: 15, padding: 10, backgroundColor: '#ff4444', borderRadius: 5 }}
            onPress={onClose}
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SectionSelectionModal;