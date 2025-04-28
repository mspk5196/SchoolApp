import React, {useState} from 'react';
import {
  View,
  Image,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Linking,
} from 'react-native';
import styles from './PhonebookStyles';
import Profile from  '../../../../assets/ParentPage/LeaveIcon/profile.png';
import CallIcon from '../../../../assets/ParentPage/phonebook/call';
import MsgIcon from  '../../../../assets/ParentPage/phonebook/msg';

const ContactCard = ({name, facultyId, subject, phoneNumber, onMessagePress}) => {
  const handleCallPress = () => {
    // Open phone dialer with the contact's phone number
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <View style={styles.card}>
      <View style={styles.accentBar} />
      <View style={styles.contentContainer}>
        <View style={styles.leftContent}>
          <View style={styles.avatarContainer}>
            <Image source={Profile} style={styles.avatar} resizeMode="cover" />
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.facultyId}>Faculty ID: {facultyId}</Text>
            <Text style={styles.subject}>{subject}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleCallPress}>
            <CallIcon height={35} width={35} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onMessagePress}>
            <MsgIcon height={35} width={35} />
            <View style={styles.notification} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const StudentPagePhonebook = ({navigation}) => {
  const [contacts, setContacts] = useState([
    {id: '1', name: 'Mr.SasiKumar', facultyId: '203384', subject: 'Tamil', phoneNumber: '9876543210'},
    {id: '2', name: 'Mr.SasiKumar', facultyId: '203384', subject: 'English', phoneNumber: '9876543210'},
    {id: '3', name: 'Mr.SasiKumar', facultyId: '203384', subject: 'Maths', phoneNumber: '9876543210'},
    {id: '4', name: 'Mr.SasiKumar', facultyId: '203384', subject: 'Science', phoneNumber: '9876543210'},
    {id: '5', name: 'Mr.SasiKumar', facultyId: '203384', subject: 'Social', phoneNumber: '9876543210'},
    {
      id: '6',
      name: 'Ms.Priya',
      facultyId: '203385',
      subject: 'Computer Science',
      phoneNumber: '9876543211',
    },
    {id: '7', name: 'Mr.Rajesh', facultyId: '203386', subject: 'Physics', phoneNumber: '9876543212'},
    {id: '8', name: 'Mrs.Lakshmi', facultyId: '203387', subject: 'Chemistry', phoneNumber: '9876543213'},
  ]);

  const handleMessagePress = (contact) => {
    navigation.navigate('StudentPageMessage', { contact });
  };

  const renderItem = ({item}) => (
    <ContactCard
      name={item.name}
      facultyId={item.facultyId}
      subject={item.subject}
      phoneNumber={item.phoneNumber}
      onMessagePress={() => handleMessagePress(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Phonebook</Text>
      </View>
      <FlatList
        data={contacts}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

export default StudentPagePhonebook;