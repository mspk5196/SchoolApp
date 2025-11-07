import { apiFetch } from '../../../../utils/apiClient.js';
import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { API_URL } from '../../../../utils/env.js';
import { set } from 'date-fns';
const Staff = require('../../../../assets/Genreal/staff.png');

const MentorSelectModal = ({ visible, onClose, onSelect, gradeId, studentId }) => {
    const [allMentors, setAllMentors] = useState([]);
    const [filteredMentors, setFilteredMentors] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    // console.log("👀 useEffect: visible =", visible, "| gradeId =", gradeId);

    useEffect(() => {
        if (visible && gradeId && allMentors.length === 0) {
            console.log("Fetching mentors...");
            fetchMentors();
        }
    }, [visible, gradeId]);

    const fetchMentors = async () => {
        setLoading(true);
        try {
            const res = await apiFetch(`/admin/students/mentors?gradeId=${gradeId}`,{
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = res;
            if (data.success) {
                setAllMentors(data.mentors);
                setFilteredMentors(data.mentors);
            }
        } catch (err) {
            console.error('Failed to fetch mentors:', err);
        } finally {
            setLoading(false);
        }
    };

    // Update the handleSaveMentor function
    const handleSaveMentor = async (mentorId, name) => {

        Alert.alert(
            'Confirm Mentor Change',
            `Are you sure you want to change the mentor for this student to ${name}?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Yes',
                    onPress: () => updateMentor(mentorId),
                },
            ]
        );

    };

    const updateMentor = async (mentorId) => {
        setLoading(true);
        try {
            const response = await apiFetch(`/admin/students/updateMentor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    studentId: studentId,
                    mentorId: mentorId
                }),
            });

            const data = response
            if (data.success) {
                setLoading(false);
                onSelect();
                Alert.alert('Success', 'Mentor updated successfully');
            } else {
                Alert.alert('Error', data.message || 'Failed to update mentor');
            }
        } catch (error) {
            console.error('Error updating mentor:', error);
            Alert.alert('Error', 'Failed to update mentor');
        }
    }

    const handleSearch = (text) => {
        setSearchQuery(text);
        const lowerText = text.toLowerCase();
        const filtered = allMentors.filter((mentor) =>
            mentor.name.toLowerCase().includes(lowerText) ||
            mentor.roll.toLowerCase().includes(lowerText)
        );
        setFilteredMentors(filtered);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.mentorItem} onPress={() => handleSaveMentor(item.id, item.name)}>
            <Image
                source={item.profile_photo ? { uri: `${API_URL}/${item.profile_photo.replace(/\\/g, '/')}` } : Staff}
                style={styles.mentorImage}
            />
            <View>
                <Text style={styles.mentorName}>{item.name}</Text>
                <Text style={styles.mentorRoll}>{item.roll}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>Select Mentor</Text>
                    <TextInput
                        placeholder="Search by name or roll"
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                    {loading ? (
                        <ActivityIndicator size="large" color="blue" style={{ marginTop: 20 }} />
                    ) : (
                        <FlatList
                            data={filteredMentors}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderItem}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    )}
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default MentorSelectModal;

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
    },
    modalContainer: {
        backgroundColor: 'white',
        margin: 20,
        padding: 20,
        borderRadius: 10,
        maxHeight: '80%',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        padding: 10,
        marginBottom: 10,
    },
    mentorItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 0.5,
        borderColor: '#eee',
    },
    mentorImage: {
        width: 40,
        height: 40,
        marginRight: 12,
        borderRadius: 20,
        backgroundColor: '#ccc',
    },
    mentorName: {
        fontWeight: '600',
    },
    mentorRoll: {
        color: '#666',
        fontSize: 12,
    },
    closeButton: {
        marginTop: 10,
        alignSelf: 'flex-end',
    },
    closeButtonText: {
        color: 'red',
        fontWeight: '600',
    },
});
