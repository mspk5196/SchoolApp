import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Linking, StyleSheet } from 'react-native';
import { API_URL } from '../../utils/env';

const SectionSelectionModal = ({ 
  visible, 
  onClose, 
  gradeId, 
  sections, 
  modalMode, 
  onSectionSelect 
}) => {
  const [loading, setLoading] = useState(false);

  const getModalTitle = () => {
    switch (modalMode) {
      case 'template':
        return 'Select Section for Template Generation';
      case 'upload':
        return 'Select Section for Schedule Upload';
      default:
        return 'Select Section';
    }
  };

  const getModalDescription = () => {
    switch (modalMode) {
      case 'template':
        return 'Choose a section to generate an Excel template with dropdown validations';
      case 'upload':
        return 'Choose a section to upload the filled schedule sheet';
      default:
        return 'Select a section to continue';
    }
  };

  const handleSectionPress = async (section) => {
    setLoading(true);
    try {
      await onSectionSelect(section);
    } catch (error) {
      console.error('Error handling section selection:', error);
      Alert.alert('Error', 'Failed to process section selection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {getModalTitle()}
          </Text>
          
          <Text style={styles.modalDescription}>
            {getModalDescription()}
          </Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0C36FF" />
              <Text style={styles.loadingText}>
                {modalMode === 'template' ? 'Generating template...' : 'Processing upload...'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={sections}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.sectionItem}
                  onPress={() => handleSectionPress(item)}
                  disabled={loading}
                >
                  <View style={styles.sectionContent}>
                    <Text style={styles.sectionName}>Section {item.section_name}</Text>
                    {item.total_students && (
                      <Text style={styles.studentCount}>
                        {item.total_students} students
                      </Text>
                    )}
                  </View>
                  <Text style={styles.arrowIcon}>→</Text>
                </TouchableOpacity>
              )}
              style={styles.sectionList}
              showsVerticalScrollIndicator={false}
            />
          )}
          
          {!loading && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    width: '85%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  sectionList: {
    maxHeight: 300,
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
    borderRadius: 8,
  },
  sectionContent: {
    flex: 1,
  },
  sectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  studentCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  arrowIcon: {
    fontSize: 18,
    color: '#0C36FF',
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#ff4444',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SectionSelectionModal;