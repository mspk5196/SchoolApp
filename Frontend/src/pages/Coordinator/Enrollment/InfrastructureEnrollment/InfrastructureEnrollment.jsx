import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider } from 'react-native-popup-menu';
import BackIcon from '../../../../assets/CoordinatorPage/InfrastructureEnrollment/Back.svg';
import AddIcon from '../../../../assets/CoordinatorPage/InfrastructureEnrollment/Add.svg';
import SearchIcon from '../../../../assets/CoordinatorPage/InfrastructureEnrollment/Search.svg';
import FilterIcon from '../../../../assets/CoordinatorPage/InfrastructureEnrollment/Filter.svg';
import MenuIcon from '../../../../assets/CoordinatorPage/InfrastructureEnrollment/Menu.svg';
import FilterPopup from './FilterPopup';
import styles from './InfrastructureEnrollmentStyle';
import { API_URL } from '@env';

const ClassroomCard = ({ classroom, onEdit, onToggleStatus, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return '#34C300';
      case 'InActive':
        return '#F44336';
      default:
        return '#4CAF50';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View>
          <Text style={styles.cardTitle}>{classroom.name}</Text>
          <Text style={styles.cardSubtitle}>Floor {classroom.floor}</Text>
          <Text style={styles.cardCapacity}>Capacity: {classroom.capacity}</Text>
          {classroom.subject && <Text style={styles.cardSubject}>Subject: {classroom.subject}</Text>}
        </View>
        <View style={styles.cardRight}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(classroom.status) }]} />
            <Text style={styles.statusText}>{classroom.status}</Text>
          </View>
          <Text style={styles.dateText}>{new Date(classroom.created_at).toLocaleDateString()}</Text>
          {classroom.grade && <Text style={styles.gradeText}>Grade: {classroom.grade}</Text>}
        </View>
      </View>

      <Menu style={{ zIndex: 1000 }}>
        <MenuTrigger customStyles={{ triggerWrapper: { padding: 5 } }}>
          <MenuIcon width={20} height={20} />
        </MenuTrigger>
        <MenuOptions customStyles={styles.menuOptions}>
          <MenuOption onSelect={() => onEdit(classroom)}>
            <Text style={styles.menuOptionText}>Edit</Text>
          </MenuOption>
          <MenuOption onSelect={() => onToggleStatus(classroom)}>
            <Text style={styles.menuOptionText}>
              {classroom.status === 'Active' ? 'Set Inactive' : 'Set Active'}
            </Text>
          </MenuOption>
          <MenuOption onSelect={() => onDelete(classroom)}>
            <Text style={[styles.menuOptionText, { color: '#F44336', fontWeight: 'bold' }]}>Delete</Text>
          </MenuOption>
        </MenuOptions>
      </Menu>
    </View>
  );
};

const Block = ({ title, classrooms, onEdit, onToggleStatus, onDelete }) => {
  return (
    <View style={styles.blockContainer}>
      <Text style={styles.blockTitle}>{title}</Text>
      {classrooms.map((classroom) => (
        <ClassroomCard
          key={classroom.id}
          classroom={classroom}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      ))}
    </View>
  ); 
};

const InfrastructureEnrollment = ({ navigation, route }) => {
  const { coordinatorData } = route.params;
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    grades: [],
    types: [],
    statuses: [],
    blocks: []
  });

  // Fetch venues from backend
  const fetchVenues = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/coordinator/enrollment/getAllVenues`);
      const data = await response.json();
      if (response.ok) {
        setVenues(data);
      } else {
        throw new Error(data.message || 'Failed to fetch venues');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  // Apply filters and search
  const filteredVenues = venues.filter(venue => {
    // Search filter
    const matchesSearch =
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (venue.grade && venue.grade.toString().includes(searchQuery)) ||
      (venue.subject && venue.subject.toLowerCase().includes(searchQuery.toLowerCase()));

    // Applied filters
    const matchesGrade = appliedFilters.grades.length === 0 ||
      (venue.grade_id && appliedFilters.grades.includes(venue.grade_id.toString()));
    const matchesType = appliedFilters.types.length === 0 ||
      appliedFilters.types.includes(venue.type);
    const matchesStatus = appliedFilters.statuses.length === 0 ||
      appliedFilters.statuses.includes(venue.status);
    const matchesBlock = appliedFilters.blocks.length === 0 ||
      appliedFilters.blocks.includes(venue.block);

    return matchesSearch && matchesGrade && matchesType && matchesStatus && matchesBlock;
  });

  // Group venues by block
  const venuesByBlock = filteredVenues.reduce((acc, venue) => {
    if (!acc[venue.block]) {
      acc[venue.block] = [];
    }
    acc[venue.block].push(venue);
    return acc;
  }, {});

  // Handle edit
  const handleEdit = (venue) => {
    navigation.navigate('AddInfraEnrollment', { venue });
  };

  // Handle toggle status
  const handleToggleStatus = async (venue) => {
    try {
      const newStatus = venue.status === 'Active' ? 'InActive' : 'Active';
    const response = await fetch(`${API_URL}/api/coordinator/enrollment/updateVenueStatus/${venue.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus })
    });
 
      if (response.ok) {
        fetchVenues(); // Refresh the list
        Alert.alert('Success', `Venue status updated to ${newStatus}`);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update status');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Handle delete
  const handleDelete = (venue) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete ${venue.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/api/coordinator/enrollment/deleteVenue/${venue.id}`, {
                method: 'DELETE'
              });

              if (response.ok) {
                fetchVenues(); // Refresh the list
                Alert.alert('Success', 'Venue deleted successfully');
              } else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete venue');
              }
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  // Handle filter application
  const handleApplyFilters = (filters) => {
    setAppliedFilters(filters);
  };

  // Refresh when returning from Add/Edit screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchVenues();
    });
    return unsubscribe;
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <MenuProvider>
      <View style={styles.container}>
        <View style={styles.header}>
          <BackIcon
            width={styles.BackIcon?.width || 24}
            height={styles.BackIcon?.height || 24}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTxt}>Infrastructure Enrollment</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <SearchIcon width={20} height={20} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor="#9e9e9e"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterVisible(true)}
          >
            <FilterIcon width={20} height={20} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {filteredVenues.length === 0 ? (
          <View style={styles.emptyState}>
            <Text>No venues found. Try adjusting your search or filters.</Text>
          </View>
        ) : (
          <FlatList
            data={Object.entries(venuesByBlock)}
            keyExtractor={([block]) => block}
            renderItem={({ item: [block, blockVenues] }) => (
              <Block
                key={`block-${block}`}
                title={`Block ${block}`}
                classrooms={blockVenues}
                onEdit={handleEdit}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
              />
            )}
          />
        )}

        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => navigation.navigate('AddInfraEnrollment')}
        >
          <AddIcon width={20} height={20} />
        </TouchableOpacity>

        {/* Filter Popup */}
        <FilterPopup
          visible={filterVisible}
          onClose={() => setFilterVisible(false)}
          onApply={handleApplyFilters}
          initialFilters={appliedFilters}
        />
      </View>
    </MenuProvider>
  );
};

export default InfrastructureEnrollment;