// ConceptGraph.jsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  StatusBar,
  SafeAreaView,
  Alert
} from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import BackIcon from '../../../assets/GeneralAssests/backarrow.svg';
import CalenderIcon from '../../../assets/ConceptGraph/Calender.svg';
import SearchIcon from '../../../assets/ConceptGraph/Search.svg';
import AddIcon from '../../../assets/ConceptGraph/Add.svg';
import MenuIcon from '../../../assets/ConceptGraph/Menu.svg';
import styles from './ConceptGraphStyle';

const ConceptCard = ({ concept, onEdit, onToggleStatus, onDelete, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => onPress(concept)}
    >
      <View style={styles.cardContent}>
        <View>
          <Text style={styles.cardTitle}>{concept.title}</Text>
          <View style={styles.monthContainer}>
            <CalenderIcon width={16} height={16} />
            <Text style={styles.monthText}>{concept.month}</Text>
          </View>
        </View>
        
        <View style={styles.cardRight}>
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>{concept.difficulty}</Text>
          </View>
          <Text style={[styles.endsInText, { color: concept.endsInColor }]}>
            Ends in : {concept.endsIn}
          </Text>
        </View>
      </View>
      
      {/* Menu */}
      <Menu style={{zIndex: 1000}}>
        <MenuTrigger customStyles={{
          triggerWrapper: {
            padding: 5,
          },
        }}>
          <MenuIcon width={16} height={16} />
        </MenuTrigger>
        <MenuOptions customStyles={{
          optionsContainer: {
            backgroundColor: 'white',
            padding: 5,
            borderRadius: 5,
            width: 150,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          },
        }}>
          <MenuOption onSelect={() => onEdit(concept)}>
            <Text style={{padding: 10, fontSize: 16, color: '#333333'}}>Edit</Text>
          </MenuOption>
          <MenuOption onSelect={() => onDelete(concept)}>
            <Text style={{padding: 10, fontSize: 16, color: '#F44336', fontWeight: 'bold'}}>Delete</Text>
          </MenuOption>
        </MenuOptions>
      </Menu>
    </TouchableOpacity>
  );
};

const ConceptGraph = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Initial concept data
  const [conceptData, setConceptData] = useState([
    { id: 1, title: 'Fraction', difficulty: 'Easy', month: '3 Month', endsIn: '3 days', endsInColor: 'red', status: 'Active' },
    { id: 2, title: 'Punctuation', difficulty: 'Easy', month: '3 Month', endsIn: '8 days', endsInColor: 'red', status: 'Active' },
    { id: 3, title: 'Addition', difficulty: 'Easy', month: '3 Month', endsIn: '1 week', endsInColor: 'blue', status: 'Active' },
    { id: 4, title: 'Subtraction', difficulty: 'Hard', month: '3 Month', endsIn: '1 week', endsInColor: 'blue', status: 'Inactive' },
    { id: 5, title: 'Multiplication', difficulty: 'Hard', month: '3 Month', endsIn: '1 week', endsInColor: 'blue', status: 'Active' },
  ]);

  // Check if we have a new concept from AddConceptGraph
  useEffect(() => {
    if (route.params?.newConcept) {
      const { newConcept, isEditing } = route.params;
      
      if (isEditing) {
        // Update existing concept
        setConceptData(prevData => 
          prevData.map(concept => 
            concept.id === newConcept.id ? newConcept : concept
          )
        );
      } else {
        // Add new concept
        setConceptData(prevData => [...prevData, newConcept]);
      }
      
      // Clear the params to prevent duplicate updates
      navigation.setParams({ newConcept: null, isEditing: null });
    }
  }, [route.params?.newConcept]);

  const handleCardPress = (concept) => {
    navigation.navigate('ConceptProgress', { concept });
  };

  // Handler function for edit option
  const handleEdit = (concept) => {
    // Navigate to edit screen with the concept data
    navigation.navigate('AddConceptGraph', { concept });
  };

  const handleToggleStatus = (concept) => {
    const newStatus = concept.status === 'Active' ? 'Inactive' : 'Active';
    
    // Update the status in the state
    const updatedConcepts = conceptData.map(c => {
      if (c.id === concept.id) {
        return { ...c, status: newStatus };
      }
      return c;
    });
    
    setConceptData(updatedConcepts);
    
    // Provide user feedback
    Alert.alert(
      "Status Updated", 
      `${concept.title} is now ${newStatus}`
    );
  };

  const handleDelete = (concept) => {
    // Show confirmation before deleting
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete ${concept.title}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => {
            // Remove the concept from the state
            setConceptData(conceptData.filter(c => c.id !== concept.id));
            // Provide feedback
            Alert.alert("Deleted", `${concept.title} has been deleted`);
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleAddConcept = () => {
    // Navigate to add concept screen without any existing concept data
    navigation.navigate('AddConceptGraph');
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <BackIcon 
          width={styles.BackIcon.width} 
          height={styles.BackIcon.height} 
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTxt}>Concept Graph Details</Text>
      </View>
      
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <SearchIcon width={16} height={16} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search concept..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      {/* Concept cards */}
      <ScrollView style={styles.cardsContainer}>
        {/* Filter concepts based on search query only */}
        {conceptData
          .filter(concept => 
            searchQuery === '' || concept.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((concept) => (
            <ConceptCard 
              key={concept.id}
              concept={concept}
              onPress={handleCardPress}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
            />
          ))}
      </ScrollView>
      
      {/* Floating action button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddConcept}>
        <AddIcon width={24} height={24} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ConceptGraph;