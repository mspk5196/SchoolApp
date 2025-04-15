import React from 'react';
import { SafeAreaView, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import BackIcon from '../../assets/Request/Back.svg';
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
      <TouchableOpacity style={styles.addRequestButton} onPress={onAddRequest}>
        <Text style={styles.plusIcon}>+</Text>
        <Text style={styles.addRequestText}>Add request</Text>
      </TouchableOpacity>
    </View>
  );
};

const GeneralActivity = ({navigation}) => {
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
    console.log(`Add request for ${sectionType}`);
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
            onAddRequest={() => handleAddRequest('Request')}
          />
          <View style={styles.divider} />
          <Section 
            title="Purpose" 
            items={purposeTypes} 
            onAddRequest={() => handleAddRequest('Purpose')}
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
    </SafeAreaView>
  );
};

export default GeneralActivity;