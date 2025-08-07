import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';

const ConflictResolutionModal = ({ 
  visible, 
  conflicts, 
  sessionData, 
  onCancel, 
  onDeleteAndCreate
}) => {
  const formatTime = (time) => {
    return new Date(`2000-01-01 ${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleDeleteAndCreate = () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete the conflicting schedules and create the exam? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete & Create',
          style: 'destructive',
          onPress: onDeleteAndCreate
        }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Schedule Conflict Detected</Text>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.message}>
              The exam schedule you're trying to create conflicts with existing class schedules:
            </Text>

            <View style={styles.examDetails}>
              <Text style={styles.sectionTitle}>Exam Details:</Text>
              <Text style={styles.detail}>Subject: {sessionData?.subject}</Text>
              <Text style={styles.detail}>Date: {sessionData?.date}</Text>
              <Text style={styles.detail}>Time: {sessionData?.time}</Text>
              <Text style={styles.detail}>Frequency: {sessionData?.frequency}</Text>
            </View>

            <View style={styles.conflictsContainer}>
              <Text style={styles.sectionTitle}>Conflicting Classes:</Text>
              {conflicts.map((conflict, index) => (
                <View key={index} style={styles.conflictItem}>
                  <Text style={styles.conflictText}>
                    {conflict.section_name} - {conflict.subject_name}
                  </Text>
                  <Text style={styles.conflictTime}>
                    {formatTime(conflict.start_time)} - {formatTime(conflict.end_time)}
                  </Text>
                  <Text style={styles.conflictActivity}>
                    Activity: {conflict.activity_type || 'Regular Class'}
                  </Text>
                </View>
              ))}
            </View>

            <Text style={styles.warningText}>
              If you proceed, these conflicting class schedules will be permanently deleted.
            </Text>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.deleteButton]} 
              onPress={handleDeleteAndCreate}
            >
              <Text style={styles.deleteButtonText}>Delete & Create Exam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 15,
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    lineHeight: 22,
  },
  examDetails: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  detail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  conflictsContainer: {
    marginBottom: 20,
  },
  conflictItem: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
  },
  conflictText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  conflictTime: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  conflictActivity: {
    fontSize: 12,
    color: '#888',
  },
  warningText: {
    fontSize: 14,
    color: '#d32f2f',
    fontWeight: '500',
    textAlign: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  deleteButton: {
    backgroundColor: '#d32f2f',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ConflictResolutionModal;
