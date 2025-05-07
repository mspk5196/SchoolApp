import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Pressable,
  Image,
  TextInput,
} from 'react-native';
import Modal from 'react-native-modal';
import PreviousIcon from '../../../assets/Basicimg/PrevBtn.svg';
import staff from '../../../assets/SubjectMentor/staff.png';
import styles from './SubjectMentorStyles';
import Tickicon from '../../../assets/SubjectMentor/tickicon.svg';
import Tickbox from '../../../assets/SubjectMentor/tickbox.svg';
import Tick from '../../../assets/SubjectMentor/tick.svg';
import Oneperson from '../../../assets/SubjectMentor/oneperson.svg';
import Hat from '../../../assets/SubjectMentor/hat.svg';

const SubjectMentor = ({navigation}) => {
  const [activeSection, setActiveSection] = useState('English');
  const [mentors, setMentors] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFaculties, setSelectedFaculties] = useState([]);
  const [searchText, setSearchText] = useState('');

  const tabs = [
    'Tamil',
    'English',
    'Maths',
    'Science',
    'Computer',
    'History',
    'Geography',
    'Physics',
    'Chemistry',
  ];

  const faculties = Array.from({length: 10}, (_, index) => ({
    id: index + 1,
    name: `Mr. SasiKumar ${index + 1}`,
    specification: `M.E Tamil literature`,
    facultyId: `20338${index + 1}`,
  }));

  const toggleSelection = id => {
    if (selectedFaculties.includes(id)) {
      setSelectedFaculties(selectedFaculties.filter(item => item !== id));
    } else {
      setSelectedFaculties([...selectedFaculties, id]);
    }
  };

  const addSelectedMentors = () => {
    const selectedMentorDetails = faculties.filter(faculty =>
      selectedFaculties.includes(faculty.id),
    );
    setMentors([...mentors, ...selectedMentorDetails]);
    setIsModalVisible(false);
    setSelectedFaculties([]);
  };

  const renderHeader = () => (
    <SafeAreaView style={styles.headerContainer}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation && navigation.goBack()}
        >
          <PreviousIcon  color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subject Mentors</Text>
      </View>

      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.classnavsubject}
        nestedScrollEnabled={true}>
        {[
          'Tamil',
          'English',
          'Maths',
          'Science',
          'Social Science',
          'Physcics',
          'Chemistry',
        ].map((section, index) => (
          <Pressable
            key={index}
            style={[
              styles.subjectselection,
              activeSection === index && styles.activeButton,
            ]}
            onPress={() => setActiveSection(index)}>
            <Text
              style={[
                styles.gradeselectiontext,
                activeSection === index && styles.activeText,
              ]}>
              {section}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );

  // Render the footer with Add button
  const renderFooter = () => (
    <TouchableOpacity
      style={styles.addButton}
      onPress={() => setIsModalVisible(true)}>
      <Text style={styles.addButtonText}>+ Add Subject Mentor</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Remove the outer ScrollView and use FlatList with header/footer */}
      <FlatList
        ListHeaderComponent={renderHeader}
        data={mentors}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <View style={styles.card}>
            <Image source={staff} style={styles.avatar} />
            <View style={styles.cardContent}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.specification}>
                Specification ({item.specification})
              </Text>
              <Text style={styles.facultyId}>Faculty ID: {item.facultyId}</Text>
            </View>
            <TouchableOpacity style={styles.moreIcon}>
              <Text style={styles.moreText}>⋮</Text>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={renderFooter}
        style={styles.mentorList}
        contentContainerStyle={styles.listContent}
      />

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setIsModalVisible(false)}
        backdropOpacity={0.5}
        style={styles.modal}
        swipeDirection="down"
        onSwipeComplete={() => setIsModalVisible(false)}>
        <View style={styles.modalContent}>
          <TextInput
            style={styles.searchBox}
            placeholder="Search faculty"
            value={searchText}
            onChangeText={text => setSearchText(text)}
          />
          <FlatList
            data={faculties.filter(faculty =>
              faculty.name.toLowerCase().includes(searchText.toLowerCase()),
            )}
            keyExtractor={item => item.id.toString()}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.facultyItem,
                  selectedFaculties.includes(item.id) && styles.selectedCard,
                ]}
                onPress={() => toggleSelection(item.id)}>
                <View style={styles.facultyDetails}>
                  <View style={styles.staffName}>
                    <Oneperson />
                    <Text style={styles.facultyName}>{item.name}</Text>
                  </View>
                  <View style={styles.Hat}>
                    <Hat />
                    <Text style={styles.facultySpec}>
                      Specification ({item.specification})
                    </Text>
                  </View>
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
            style={styles.facultyList}
          />

          <TouchableOpacity
            style={styles.selectButton}
            onPress={addSelectedMentors}>
            <Text style={styles.selectButtonText}>
              Select Faculties <Tickicon />
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SubjectMentor;
