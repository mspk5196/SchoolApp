import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../../../utils/env.js';

const AssessmentMaterialView = ({ navigation, route }) => {
  const { sessionId, sessionData } = route.params;
  
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [sessionInfo, setSessionInfo] = useState(sessionData || {});

  useEffect(() => {
    fetchAvailableMaterials();
    if (!sessionData) {
      fetchSessionInfo();
    }
  }, [sessionId]);

  const fetchSessionInfo = async () => {
    try {
      const response = await fetch(`${API_URL}/mentor/getAssessmentSessionInfo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: sessionId }),
      });

      const result = await response.json();
      if (result.success) {
        setSessionInfo(result.session);
      }
    } catch (error) {
      console.error('Error fetching session info:', error);
    }
  };

  const fetchAvailableMaterials = async () => {
    try {
      const response = await fetch(`${API_URL}/mentor/getAssessmentMaterials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          assessmentSessionId: sessionId,
          subjectId: sessionInfo.subject_id,
          sectionId: sessionInfo.section_id 
        }),
      });

      const result = await response.json();
      if (result.success) {
        setAvailableMaterials(result.materials || []);
      }
    } catch (error) {
      console.error('Error fetching available materials:', error);
    }
  };

  const openMaterial = (material) => {
    // Implement file viewing functionality
    Alert.alert('Open Material', `Opening ${material.file_name || material.title}`);
  };

  const renderMaterialItem = ({ item }) => (
    <View style={styles.materialItem}>
      <View style={styles.materialHeader}>
        <Text style={styles.materialTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.materialBadge}>
          <Text style={styles.badgeText}>
            {item.material_type || 'Material'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.fileName}>📄 {item.file_name || item.title}</Text>
      {item.topic_title && (
        <Text style={styles.topicTitle}>🎯 Topic: {item.topic_title}</Text>
      )}
      {item.level && (
        <Text style={styles.levelText}>� Level: {item.level}</Text>
      )}
      <Text style={styles.uploadDate}>
        Available for assessment use
      </Text>
      
      <TouchableOpacity
        style={styles.openButton}
        onPress={() => openMaterial(item)}
      >
        <Text style={styles.openButtonText}>📖 View Material</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assessment Materials</Text>
      </View>

      {/* Session Info */}
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionTitle}>
          📊 Assessment Session
        </Text>
        <Text style={styles.sessionDetails}>
          Subject: {sessionInfo.subject_name} • Section: {sessionInfo.section_name}
        </Text>
        <Text style={styles.sessionDetails}>
          Date: {sessionInfo.date} • Period: {sessionInfo.session_no}
        </Text>
        {sessionInfo.assessment_topic && (
          <Text style={styles.sessionDetails}>
            Topic: {sessionInfo.assessment_topic}
          </Text>
        )}
      </View>

      {/* Info Notice */}
      <View style={styles.infoNotice}>
        <Text style={styles.infoTitle}>ℹ️ Material Management</Text>
        <Text style={styles.infoText}>
          Assessment materials are managed by coordinators. Contact your coordinator to upload new materials for this subject.
        </Text>
      </View>

      {/* Available Materials List */}
      <View style={styles.materialsContainer}>
        <Text style={styles.sectionTitle}>
          📚 Available Materials ({availableMaterials.length})
        </Text>
        
        {availableMaterials.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No materials available for this assessment.{'\n'}
              Contact your coordinator to add materials for this subject.
            </Text>
          </View>
        ) : (
          <FlatList
            data={availableMaterials}
            renderItem={renderMaterialItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            style={styles.materialsList}
          />
        )}
      </View>
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
  sessionInfo: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 8,
  },
  sessionDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoNotice: {
    backgroundColor: '#e8f4f8',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bee5eb',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0c5460',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#0c5460',
    lineHeight: 20,
  },
  materialsContainer: {
    flex: 1,
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
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
  materialBadge: {
    backgroundColor: '#6f42c1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  fileName: {
    fontSize: 14,
    color: '#007bff',
    marginBottom: 4,
  },
  topicTitle: {
    fontSize: 12,
    color: '#6f42c1',
    marginBottom: 4,
  },
  levelText: {
    fontSize: 12,
    color: '#28a745',
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
};

export default AssessmentMaterialView;
