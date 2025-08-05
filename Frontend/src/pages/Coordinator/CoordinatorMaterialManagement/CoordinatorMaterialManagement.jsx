import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CoordinatorMaterialManagement = () => {
  const navigation = useNavigation();

  const navigateToScreen = (screenName, title) => {
    navigation.navigate(screenName, { title });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Material Management</Text>
      <Text style={styles.subtitle}>Manage learning materials and assignments</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.uploadButton]}
          onPress={() => navigateToScreen('CoordinatorMaterialUpload', 'Upload Materials')}
        >
          <Text style={styles.buttonText}>📚 Upload Materials</Text>
          <Text style={styles.buttonSubtext}>Add new learning resources</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.assignButton]}
          onPress={() => navigateToScreen('MaterialAssignmentScreen', 'Assign Materials')}
        >
          <Text style={styles.buttonText}>📋 Assign Materials</Text>
          <Text style={styles.buttonSubtext}>Schedule materials for periods</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.configButton]}
          onPress={() => navigateToScreen('ActivityTypeConfiguration', 'Activity Configuration')}
        >
          <Text style={styles.buttonText}>⚙️ Configure Activities</Text>
          <Text style={styles.buttonSubtext}>Manage activity types and settings</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>📌 Note</Text>
        <Text style={styles.infoText}>
          Only coordinators can upload materials. Mentors can view assigned materials during their sessions.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    gap: 20,
  },
  actionButton: {
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  uploadButton: {
    backgroundColor: '#3498db',
  },
  assignButton: {
    backgroundColor: '#2ecc71',
  },
  configButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  buttonSubtext: {
    fontSize: 14,
    color: '#ecf0f1',
    opacity: 0.9,
  },
  infoBox: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginTop: 30,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
});

export default CoordinatorMaterialManagement;
