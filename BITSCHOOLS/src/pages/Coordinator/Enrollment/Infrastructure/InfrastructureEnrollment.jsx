import { apiFetch } from "../../../../utils/apiClient.js";
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, ActivityIndicator, RefreshControl, TouchableWithoutFeedback } from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider } from 'react-native-popup-menu';
import FilterPopup from './FilterPopup';
import styles from './InfrastructureEnrollmentStyle';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const ClassroomCard = ({ classroom, onEdit, onToggleStatus, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return '#10b981';
      case 'InActive':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getApprovalStatusColor = (venueStatus) => {
    switch (venueStatus) {
      case 'Approved':
        return '#10b981';
      case 'Rejected':
        return '#ef4444';
      case 'Requested':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getApprovalStatusText = (venueStatus, isAccepted) => {
    if (isAccepted === 1) return 'Approved';
    return venueStatus || 'Requested';
  };

  const getApprovalStatusStyle = (venueStatus, isAccepted) => {
    const status = getApprovalStatusText(venueStatus, isAccepted);
    switch (status) {
      case 'Approved':
        return styles.approvalStatusApproved;
      case 'Rejected':
        return styles.approvalStatusRejected;
      default:
        return styles.approvalStatusPending;
    }
  };

  const isPending = classroom.is_accepted === 0;

  return (
    <View style={[
      styles.card,
      isPending && styles.cardPending
    ]}>
      {/* Menu Button */}
      <Menu>
        <MenuTrigger style={styles.menuButton}>
          <MaterialCommunityIcons name="dots-vertical" size={16} color="#000" />
        </MenuTrigger>
        <MenuOptions customStyles={{
          optionsContainer: {
            ...styles.menuOptions.optionsContainer,
            right: 0,
            left: 'auto',
          }
        }}>
          <MenuOption onSelect={() => onEdit(classroom)}>
            <Text style={styles.menuOptionText}>Edit</Text>
          </MenuOption>
          <MenuOption onSelect={() => onToggleStatus(classroom)}>
            <Text style={styles.menuOptionText}>
              {classroom.status === 'Active' ? 'Set Inactive' : 'Set Active'}
            </Text>
          </MenuOption>
          <MenuOption onSelect={() => onDelete(classroom)}>
            <Text style={[styles.menuOptionText, styles.menuOptionDelete]}>Delete</Text>
          </MenuOption>
        </MenuOptions>
      </Menu>

      {/* Card Content */}
      <View style={styles.cardContent}>
        {/* Header Section */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{classroom.name}</Text>

          <View style={styles.cardLocationRow}>
            <Text style={styles.cardSubtitle}>Floor {classroom.floor}</Text>
            <Text style={styles.cardCapacity}>Capacity: {classroom.capacity}</Text>
          </View>

          {classroom.subject_names && (
            <Text style={styles.cardSubject}>Subjects: {classroom.subject_names}</Text>
          )}
        </View>

        {/* Metadata Section */}
        <View style={styles.cardMetadata}>
          <View style={styles.leftMetadata}>
            {/* Approval Status */}
            <View style={[
              styles.approvalStatusContainer,
              getApprovalStatusStyle(classroom.venue_status, classroom.is_accepted)
            ]}>
              <View style={[
                styles.approvalStatusDot,
                { backgroundColor: getApprovalStatusColor(classroom.venue_status) }
              ]} />
              <Text style={[
                styles.approvalStatusText,
                { color: getApprovalStatusColor(classroom.venue_status) }
              ]}>
                {getApprovalStatusText(classroom.venue_status, classroom.is_accepted)}
              </Text>
            </View>

            <Text style={styles.dateText}>
              Created {new Date(classroom.created_at).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.rightMetadata}>
            {/* Status */}
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(classroom.status) }]} />
              <Text style={styles.statusText}>{classroom.status}</Text>
            </View>

            {classroom.grade && (
              <Text style={styles.gradeText}>Grade: {classroom.grade}</Text>
            )}
          </View>
        </View>
      </View>
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
  const params = route.params && route.params.data ? route.params.data : (route.params || {});
  const { userData } = params;

  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    grades: [],
    types: [],
    statuses: [],
    blocks: []
  });

  // Fetch venues from backend
  const fetchVenues = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await apiFetch(`/coordinator/enrollment/getAllVenues`);
      const data = response
      if (response) {
        setVenues(data);
      } else {
        throw new Error(data.message || 'Failed to fetch venues');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      if (isRefreshing) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchVenues(false);
  }, []);

  // Handle pull to refresh
  const onRefresh = () => {
    fetchVenues(true);
  };

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
  // const handleEdit = (venue) => {
  //   navigation.navigate('AddInfraEnrollment', { venue });
  // };

  const handleEdit = (venue) => {
    try {
      // Clean the venue data - remove any frontend-only properties
      const cleanVenue = {
        id: venue.id,
        name: venue.name,
        block: venue.block,
        floor: venue.floor,
        capacity: venue.capacity,
        grade_id: venue.grade_id,
        subject_id: venue.subject_id,
        type: venue.type,
        status: venue.status,
        created_by: venue.created_by
      };

      navigation.navigate('AddInfraEnrollment', {
        venue: cleanVenue,
        isEdit: true, // Pass isEdit as a separate parameter
        phone: userData.phone
      });
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Failed to navigate to edit screen');
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (venue) => {
    try {
      const newStatus = venue.status === 'Active' ? 'InActive' : 'Active';
      const response = await apiFetch(`/coordinator/enrollment/updateVenueStatus/${venue.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response) {
        fetchVenues(false); // Refresh the list
        Alert.alert('Success', `Venue status updated to ${newStatus}`);
      } else {
        const error = response;
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
              // Add timeout to prevent hanging requests
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased to 15 seconds

              const response = await apiFetch(`/coordinator/enrollment/deleteVenue/${venue.id}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                },
                signal: controller.signal
              });

              clearTimeout(timeoutId);

              // Check if response is ok (status 200-299)
              if (response) {
                try {
                  const responseData = response;
                  console.log('Delete response:', responseData);

                  // Refresh the list immediately
                  await fetchVenues(false);
                  Alert.alert('Success', 'Venue deleted successfully');
                } catch (jsonError) {
                  // If JSON parsing fails but status was ok, deletion likely succeeded
                  console.log('Response ok but no JSON - deletion likely successful');
                  await fetchVenues(false);
                  Alert.alert('Success', 'Venue deleted successfully');
                }
              } else {
                // If response is not ok, try to get error message
                let errorMessage = `Failed to delete venue (Status: ${response.status})`;
                try {
                  const errorData = response;
                  errorMessage = errorData.message || errorMessage;
                } catch (jsonError) {
                  // Keep the default error message with status code
                }
                throw new Error(errorMessage);
              }
            } catch (error) {
              console.error('Delete error:', error);

              if (error.name === 'AbortError') {
                // Check if deletion actually succeeded despite timeout
                Alert.alert(
                  'Request Timeout',
                  'The request timed out, but the venue might have been deleted. Refreshing the list to check.',
                  [
                    {
                      text: 'OK',
                      onPress: () => fetchVenues(false)
                    }
                  ]
                );
              } else if (error.message.includes('Network request failed')) {
                // Network error - also refresh to check if deletion succeeded
                Alert.alert(
                  'Network Error',
                  'Network error occurred. Refreshing the list to check if deletion was successful.',
                  [
                    {
                      text: 'OK',
                      onPress: () => fetchVenues(false)
                    }
                  ]
                );
              } else if (error.message.includes('Application failed to respond')) {
                // This specific error - likely deletion succeeded but response failed
                Alert.alert(
                  'Response Error',
                  'The application failed to respond, but deletion might have succeeded. Refreshing the list to check.',
                  [
                    {
                      text: 'OK',
                      onPress: () => fetchVenues(false)
                    }
                  ]
                );
              } else {
                Alert.alert('Error', error.message);
              }
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
      fetchVenues(false);
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
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTxt}>Infrastructure Enrollment</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MaterialCommunityIcons name="magnify" size={20} color="#9e9e9e" />
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
            <MaterialCommunityIcons name="filter" size={20} color="#000" />
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
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#3557FF']} // Android
                tintColor="#3557FF" // iOS
                title="Pull to refresh..." // iOS
                titleColor="#3557FF" // iOS
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => navigation.navigate('AddInfraEnrollment', { phone: userData.phone })}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
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