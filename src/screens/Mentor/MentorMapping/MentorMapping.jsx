import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
} from 'react-native';
import Modal from 'react-native-modal';
import Leftarrow from '../../../assets/MentorMapping/leftarrow.svg';
import staff from '../../../assets/MentorMapping/staff.png';
import styles from './MentorMappingStyles';
import Tickicon from '../../../assets/MentorMapping/tickicon.svg';
import Tickbox from '../../../assets/MentorMapping/tickbox.svg';
import Tick from '../../../assets/MentorMapping/tick.svg';
import Person from '../../../assets/MentorMapping/person.svg';
import OnePerson from '../../../assets/MentorMapping/oneperson.svg';
import Hat from '../../../assets/MentorMapping/hat.svg';

const SubjectMentor = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Grade 2');
  const [mentors, setMentors] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFaculties, setSelectedFaculties] = useState([]);
  const [searchText, setSearchText] = useState('');

  
  const faculties = Array.from({ length: 10 }, (_, index) => ({
    id: index + 1,
    name: `Mr. SasiKumar ${index + 1}`,
    facultyId: `20338${index + 1}`,
  }));

  const getNextSection = () => {
    if (mentors.length === 0) return 'A';
    const lastSection = mentors[mentors.length - 1].specification;
    return String.fromCharCode(lastSection.charCodeAt(0) + 1);
  };

  const toggleSelection = (id) => {
    if (selectedFaculties.includes(id)) {
      setSelectedFaculties(selectedFaculties.filter((item) => item !== id));
    } else {
      setSelectedFaculties([...selectedFaculties, id]);
    }
  };

  const addSelectedMentors = () => {
    let lastSection = getNextSection();
    const selectedMentorDetails = faculties
      .filter((faculty) => selectedFaculties.includes(faculty.id))
      .map((faculty, index) => ({
        ...faculty,
        specification: String.fromCharCode(lastSection.charCodeAt(0) + index),
      }));

    setMentors([...mentors, ...selectedMentorDetails]);
    setIsModalVisible(false);
    setSelectedFaculties([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.SubNavbar}>
          <TouchableOpacity>
            <Leftarrow width={20} height={20} style={styles.Leftarrow} onPress={() => navigation.goBack()} />
          </TouchableOpacity>
          <Text style={styles.heading}>Mentor Mapping</Text>
        </View>

        

        <FlatList
          data={mentors}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('MentorDetails', { mentor: item })}
            >
              <Image source={staff} style={styles.avatar} />
              <View style={styles.cardContent}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.specification}>Section - {item.specification}</Text>
                <Text style={styles.facultyId}>Faculty ID: {item.facultyId}</Text>
              </View>
              <TouchableOpacity style={styles.moreIcon}>
                <Text style={styles.moreText}>10 </Text>
                <Person height={20} width={20} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          style={styles.mentorList}
        />

        <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Add Mentor</Text>
        </TouchableOpacity>

        <Modal
          isVisible={isModalVisible}
          onBackdropPress={() => setIsModalVisible(false)}
          backdropOpacity={0.5}
          style={styles.modal}
        >
          <View style={styles.modalContent}>
            <TextInput
              style={styles.searchBox}
              placeholder="Search faculty"
              value={searchText}
              onChangeText={(text) => setSearchText(text)}
            />

            <FlatList
              data={faculties.filter((faculty) =>
                faculty.name.toLowerCase().includes(searchText.toLowerCase())
              )}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.facultyItem,
                    selectedFaculties.includes(item.id) && styles.selectedCard,
                  ]}
                  onPress={() => toggleSelection(item.id)}
                >
                  <View>
                  <View style={styles.staffName}>     
                   <OnePerson/>
           <Text style={styles.facultyName}>{item.name}</Text>
        </View>
        <View style={styles.Hat}>       
      <Hat/>
       <Text style={styles.facultySpec}>
          Specification (M.E Tamil literature)
        </Text>
        </View>
                <Text style={styles.facultyId}>Faculty ID: {item.facultyId}</Text>
                </View>
                <View style={styles.checkboxContainer}>
        {selectedFaculties.includes(item.id) ? (
          <Tickbox width={30} />
        ) : (
          <Tick width={30} />
        )}
      </View>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity style={styles.selectButton} onPress={addSelectedMentors}>
              <Text style={styles.selectButtonText}>Select Faculties</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SubjectMentor;
