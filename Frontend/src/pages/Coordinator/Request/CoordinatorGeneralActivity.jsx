import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput
} from 'react-native';
import BackIcon from '../../../assets/CoordinatorPage/Request/Back.svg';
import styles from './GeneralActivityStyle';
import { API_URL } from "@env";

const SectionItem = ({ title }) => {
  return (
    <View style={styles.sectionItem}>
      <Text style={styles.itemText}>{title}</Text>
    </View>
  );
};

const Section = ({ title, items, onAddRequest }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item, index) => (
        <SectionItem key={index} title={item} />
      ))}
      <TouchableOpacity style={styles.addRequestButton} onPress={() => onAddRequest(title)}>
        <Text style={styles.plusIcon}>+</Text>
        <Text style={styles.addRequestText}>Add request</Text>
      </TouchableOpacity>
    </View>
  );
};

const CoordinatorGeneralActivity = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentSection, setCurrentSection] = useState('');
  const [newItemText, setNewItemText] = useState('');

  const [documentTypes, setDocumentTypes] = useState([])
  const [documentPurpose, setDocumentPurpose] = useState([])

  const [newRequests, setNewRequests] = useState([]);
  const [newPurposes, setNewPurposes] = useState([]);

  const requestTypes = [...documentTypes.map(doc => doc.name), ...newRequests];
  const purposeTypes = [...documentPurpose.map(doc => doc.name), ...newPurposes];

  const handleAddRequest = (sectionType) => {
    setCurrentSection(sectionType);
    setNewItemText('');
    setModalVisible(true);
  };

  const handleConfirmModal = () => {
    if (newItemText.trim() === '') {
      setModalVisible(false);
      return;
    }

    if (currentSection === 'Request') {
      setNewRequests(prev => [...prev, newItemText.trim()]);
    } else if (currentSection === 'Purpose') {
      setNewPurposes(prev => [...prev, newItemText.trim()]);
    }

    setModalVisible(false);
  };

  const handleCancelModal = () => {
    setModalVisible(false);
  };

  // const handleConfirmChanges = () => {
  //   console.log('Confirm changes');
  //   navigation.navigate('RequestHome');
  // };

  useEffect(() => {
    fetchDocumnetTypes();
    fetchDocumentPurpose();
  }, [])

  const fetchDocumnetTypes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/fetchDocumentTypes`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.success) {
        setDocumentTypes(data.docTypes);
        // console.log(data.docTypes);   
      } else {
        Alert.alert("Error", "Failed to fetch document types");
      }
    } catch (error) {
      console.error("Error fetching document types:", error);
      Alert.alert("Error", "Failed to fetch document types");
    }
  };
  const fetchDocumentPurpose = async () => {
    try {
      const response = await fetch(`${API_URL}/api/fetchDocumentPurpose`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.success) {
        setDocumentPurpose(data.docPurpose);
        // console.log(data.docTypes);  
      } else {
        Alert.alert("Error", "Failed to fetch document purpose");
      }
    } catch (error) {
      console.error("Error fetching document purpose:", error);
      Alert.alert("Error", "Failed to fetch document purpose");
    }
  };

  const handleConfirmChanges = async () => {
    try {
      if (newRequests.length > 0) {
        await fetch(`${API_URL}/api/coordinator/insertDocType`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ names: newRequests })
        });
      }
  
      if (newPurposes.length > 0) {
        await fetch(`${API_URL}/api/coordinator/insertDocType`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ names: newPurposes })
        });
      }
  
      // Optionally refresh after adding
      await fetchDocumnetTypes();
      await fetchDocumentPurpose();
  
      // Clear added items
      setNewRequests([]);
      setNewPurposes([]);
  
      navigation.navigate('RequestHome');
    } catch (error) {
      console.error('Error adding new items:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackIcon
          width={styles.BackIcon.width}
          height={styles.BackIcon.height}
          onPress={() => navigation.navigate('RequestHome')}
        />
        <Text style={styles.headerTxt}>General Activity</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.card}>
          <Section
            title="Request"
            items={requestTypes}
            onAddRequest={handleAddRequest}
          />
          <View style={styles.divider} />
          <Section
            title="Purpose"
            items={purposeTypes}
            onAddRequest={handleAddRequest}
          />
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmChanges}
        >
          <Text style={styles.confirmButtonText}>Confirm changes</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Popup */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancelModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New {currentSection}</Text>

            <TextInput
              style={styles.modalInput}
              placeholder={`Enter new ${currentSection} name`}
              value={newItemText}
              onChangeText={setNewItemText}
            />

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelModal}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.okButton]}
                onPress={handleConfirmModal}
              >
                <Text style={[styles.modalButtonText, styles.okButtonText]}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CoordinatorGeneralActivity;