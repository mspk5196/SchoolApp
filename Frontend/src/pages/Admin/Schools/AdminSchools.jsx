import {
  Text,
  View,
  Pressable,
  ScrollView,
  SectionList,
  Modal,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import HomeIcon from '../../assets/School/Home.svg';
import Schimg1 from '../../assets/School/schoolimg1.svg';
import Schimg2 from '../../assets/School/schoolimg2.svg';
import Schimg3 from '../../assets/School/schoolimg3.svg';
import styles from './SchoolSty';
import {useState} from 'react';

const AdminSchools = ({ navigation }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [schoolName, setSchoolName] = useState('');
  
    const handleCancel = () => {
      setSchoolName('');
      setIsModalVisible(false);
    };
  
    const handleConfirm = () => {
      // Here you would typically handle the submission
      console.log('New school:', schoolName);
      setSchoolName('');
      setIsModalVisible(false);
    };
  
    const data = [
      {
        data: [
          {
            id: '1',
            title: 'Bannari amman public schools',
            bgColor: '#C9F7F5',
            iconColor: '#6A5ACD',
            Icon: <Schimg1 />,
            color: '#0FBEB3',
          },
          {
            id: '2',
            title: 'Student Special Schools BIT',
            bgColor: '#FFF3DC',
            iconColor: '#EEAA16',
            Icon: <Schimg2 />,
            color: '#EEAA16',
          },
          {
            id: '3',
            title: 'Add school',
            bgColor: '#FFD6EE',
            iconColor: '#D81B60',
            Icon: <Schimg3 />,
            color: '#AD5191',
          },
        ],
      },
    ];
  
    const Cards = ({ title, Icon, bgColor, color }) => (
      <View style={[styles.card, { backgroundColor: bgColor }]}>
        {Icon}
        <Text style={[styles.cardText, { color: color }]}>{title}</Text>
      </View>
    );
  
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation && navigation.goBack()}
        >
          <HomeIcon height={25} width={25}/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schools</Text>
      </View>
  
        <SectionList
          sections={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                if (item.title === 'Add school') {
                  setIsModalVisible(true);
                }
              }}
            >
              <Cards
                title={item.title}
                Icon={item.Icon}
                bgColor={item.bgColor}
                color={item.color}
              />
            </Pressable>
          )}
        />
  
        {/* Modal for Add School */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={handleCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Add New School</Text>
              
              <Text style={styles.label}>School Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter school name"
                value={schoolName}
                onChangeText={setSchoolName}
              />
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={handleConfirm}
                  disabled={!schoolName.trim()}
                >
                  <Text style={styles.buttonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  };

export default AdminSchools;
