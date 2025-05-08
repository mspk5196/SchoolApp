import React, { useState } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  TextInput
} from 'react-native';
import BackIcon from '../../assets/GeneralAssests/backarrow.svg';
import styles from './GeneralActivityStyle';

const SectionItem = ({title}) => {
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

const GeneralActivity = ({navigation}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentSection, setCurrentSection] = useState('');
  const [newItemText, setNewItemText] = useState('');

  const requestTypes = [
    'Bonafide',
    'Marksheet',
    'Fees receipt',
    'Fees Structure'
  ];

  const purposeTypes = [
    'Income tax',
    'Passport',
    'VoterId',
    'Pan card',
    'Other'
  ];

  const handleAddRequest = (sectionType) => {
    setCurrentSection(sectionType);
    setNewItemText('');
    setModalVisible(true);
  };

  const handleConfirmModal = () => {
    console.log(`Adding new item "${newItemText}" to ${currentSection}`);
    // Here you would add the new item to your list
    setModalVisible(false);
  };

  const handleCancelModal = () => {
    setModalVisible(false);
  };

  const handleConfirmChanges = () => {
    console.log('Confirm changes');
    navigation.navigate('RequestHome');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackIcon 
          width={styles.BackIcon.width} 
          height={styles.BackIcon.height} 
          onPress={() => navigation.goBack()}
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

export default GeneralActivity;