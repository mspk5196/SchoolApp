import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Modal,
    FlatList,
    RefreshControl,
    Linking,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { API_URL } from '../../../../utils/env.js';
import styles from './TopicHierarchyStyle.jsx';

const MentorTopicHierarchy = ({ navigation, route }) => {
    const { mentorData, selectedSubjectId, selectedSectionId, selectedSubjectName, selectedGradeId } = route.params || {};

    const [topicHierarchy, setTopicHierarchy] = useState([]);
    const [activities, setActivities] = useState([]);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [subActivities, setSubActivities] = useState([]);
    const [selectedSubActivity, setSelectedSubActivity] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedTopics, setExpandedTopics] = useState(new Set());
    const [materialsModal, setMaterialsModal] = useState(false);
    const [selectedTopicMaterials, setSelectedTopicMaterials] = useState([]);
    const [selectedTopicInfo, setSelectedTopicInfo] = useState(null);
    const [materialsLoading, setMaterialsLoading] = useState(false);

    useEffect(() => {
        if (selectedSubjectId && selectedSectionId) {
            fetchActivitiesForSubject();
        }
    }, [selectedSubjectId, selectedSectionId]);

    useEffect(() => {
        if (selectedActivity && selectedSubActivity) {
            fetchTopicHierarchy();
        }
    }, [selectedActivity, selectedSubActivity]);

    const fetchActivitiesForSubject = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/mentor/topic-hierarchy/activities`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sectionId: selectedSectionId,
                    subjectId: selectedSubjectId
                })
            });

            const result = await response.json();
            if (result.success) {
                setActivities(result.data);
                // console.log('Fetched activities:', result.data);

                if (result.data.length > 0) {
                    setSelectedActivity(result.data[0].id);
                }
            } else {
                Alert.alert('Error', result.message || 'Failed to fetch activities');
            }
        } catch (error) {
            console.error('Fetch activities error:', error);
            Alert.alert('Error', 'Failed to fetch activities');
        } finally {
            setLoading(false);
        }
    };

    const fetchSubActivitiesForActivity = async (activityId) => {
        try {
            const response = await fetch(`${API_URL}/api/mentor/topic-hierarchy/sub-activities`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sectionId: selectedSectionId,
                    subjectId: selectedSubjectId,
                    activityId: activityId
                })
            });

            const result = await response.json();
            if (result.success) {
                setSubActivities(result.data);
                console.log('Fetched sub-activities:', result.data);

                if (result.data.length > 0) {
                    setSelectedSubActivity(result.data[0].id);
                }
            } else {
                Alert.alert('Error', result.message || 'Failed to fetch sub-activities');
            }
        } catch (error) {
            console.error('Fetch sub-activities error:', error);
            Alert.alert('Error', 'Failed to fetch sub-activities');
        }
    };

    useEffect(() => {
        if (selectedActivity) {
            fetchSubActivitiesForActivity(selectedActivity);
        }
    }, [selectedActivity]);

    const fetchTopicHierarchy = async () => {
        setTopicHierarchy([]);
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/mentor/topic-hierarchy/getByActivityId`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // subjectId: selectedSubjectId,
                    // gradeId: selectedGradeId,
                    activityId: selectedActivity,
                    subActivityId: selectedSubActivity,
                    // sectionId: selectedSectionId,
                })
            });

            const result = await response.json();
            if (result.success) {
                setTopicHierarchy(result.data.hierarchy);
            } else {
                setTopicHierarchy([]);
                if (result.message !== 'No topics found for the specified criteria') {
                    Alert.alert('Info', result.message || 'No topics found');
                }
            }
        } catch (error) {
            console.error('Fetch topic hierarchy error:', error);
            Alert.alert('Error', 'Failed to fetch topic hierarchy');
        } finally {
            setLoading(false);
        }
    };

    const fetchTopicMaterials = async (topicId, topicInfo) => {
        try {
            setMaterialsLoading(true);
            setSelectedTopicInfo(topicInfo);

            const response = await fetch(`${API_URL}/api/mentor/topic-hierarchy/materials/${topicId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            const result = await response.json();
            if (result.success) {
                // console.log('Fetched topic materials:', result.data.materials);
                setSelectedTopicMaterials(result.data.materials);
                setMaterialsModal(true);
            } else {
                Alert.alert('Info', result.message || 'No materials found for this topic');
            }
        } catch (error) {
            console.error('Fetch materials error:', error);
            Alert.alert('Error', 'Failed to fetch materials');
        } finally {
            setMaterialsLoading(false);
        }
    };

    const downloadMaterial = async (fileUrl, fileName) => {
        console.log('Attempting to download file:', fileUrl, fileName);

        try {
            if (!fileUrl) {
                Alert.alert('Error', 'File URL not available');
                return;
            }

            // Construct full URL
            let fullUrl = fileUrl;
            if (!fileUrl.startsWith('http')) {
                fullUrl = `${API_URL}${fileUrl}`;
            }
            console.log('Constructed full URL for download:', fullUrl);

            const supported = true;
            // const supported = await Linking.canOpenURL(fullUrl);
            if (supported) {
                await Linking.openURL(fullUrl);
            } else {
                await Linking.openURL(fullUrl);
                Alert.alert('Error', 'Cannot open this file type');
            }
        } catch (error) {
            console.error('Download error:', error);
            Alert.alert('Error', 'Failed to download file');
        }
    };

    const toggleTopicExpansion = (topicId) => {
        const newExpanded = new Set(expandedTopics);
        if (newExpanded.has(topicId)) {
            newExpanded.delete(topicId);
        } else {
            newExpanded.add(topicId);
        }
        setExpandedTopics(newExpanded);
    };

    const renderTopic = ({ item, level = 0 }) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedTopics.has(item.id);

        return (
            <View style={[styles.topicItem, { marginLeft: level * 20 }]}>
                <View style={styles.topicHeader}>
                    <TouchableOpacity
                        style={styles.expandButton}
                        onPress={() => toggleTopicExpansion(item.id)}
                        disabled={!hasChildren}
                    >
                        <Text style={[styles.expandIcon, { color: hasChildren ? '#007AFF' : '#ccc' }]}>
                            {hasChildren ? (isExpanded ? '▼' : '▶') : '●'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.topicInfo}>
                        <Text style={styles.topicName}>{item.topic_name}</Text>
                        <Text style={styles.topicCode}>{item.topic_code}</Text>
                        <View style={styles.topicFlags}>
                            {item.has_assessment ? <Text style={styles.flag}>Assessment</Text> : null}
                            {item.has_homework ? <Text style={styles.flag}>Homework</Text> : null}
                            {item.is_bottom_level ? <Text style={styles.flag}>Bottom Level</Text> : null}
                        </View>
                    </View>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => fetchTopicMaterials(item.id, item)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.actionButtonText}>📁</Text>
                            <Text style={[styles.actionButtonText, { fontSize: 10, marginLeft: 4 }]}>View</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {isExpanded && hasChildren && (
                    <FlatList
                        data={item.children}
                        renderItem={({ item: child }) => renderTopic({ item: child, level: level + 1 })}
                        keyExtractor={(child) => child.id.toString()}
                    />
                )}
            </View>
        );
    };

    const formatTimeToIST = (utcTime) => {
        const date = new Date(utcTime);
        return date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
    }

    const renderMaterialItem = ({ item }) => (
        <View style={styles.materialItem}>
            <View style={styles.materialInfo}>
                <Text style={styles.materialName}>{item.activity_name}</Text>
                <Text style={styles.materialType}>{item.file_type}</Text>
                {item.material_type && (
                    <Text style={styles.materialDescription}>{item.material_type}</Text>
                )}
                <View style={styles.materialMeta}>
                    {item.has_assessment && (
                        <Text style={styles.mandatoryTag}>Has Assessment</Text>
                    )}
                    {item.estimated_duration && (
                        <Text style={styles.completionTime}>
                            Est. {item.estimated_duration} min
                        </Text>
                    )}
                    {item.expected_date && (
                        <Text style={styles.completionTime}>
                            Expected date: {formatTimeToIST(item.expected_date)}
                        </Text>
                    )}
                </View>
            </View>

            <View style={styles.materialActions}>
                {item.file_urls && item.file_urls.map((fileUrl, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.downloadButton}
                        onPress={() => downloadMaterial(fileUrl.url, fileUrl.name)}
                    >
                        {/* <Icon name="download" size={16} color="#fff" /> */}
                        <Text style={{ color: '#fff', fontSize: 16, marginRight: 4 }}>📥</Text>
                        <Text style={styles.downloadButtonText}>
                            {fileUrl.name || `Download ${index + 1}`}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const onRefresh = async () => {
        setRefreshing(true);
        if (selectedActivity && selectedSubActivity) {
            await fetchTopicHierarchy();
        }
        setRefreshing(false);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    {/* <Icon name="arrow-back" size={24} color="#fff" /> */}
                    <Text style={{ color: '#fff', fontSize: 24 }}>⬅️</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Topic Hierarchy</Text>
            </View>

            {/* Subject Info */}
            <View style={styles.subjectInfo}>
                <Text style={styles.subjectName}>{selectedSubjectName}</Text>
                <Text style={styles.sectionInfo}>
                    Section ID: {selectedSectionId}
                </Text>
            </View>

            {/* Activity Selectors */}
            <View style={styles.selectorContainer}>
                <View style={styles.pickerContainer}>
                    <Text style={styles.pickerLabel}>Activity</Text>
                    <Picker
                        selectedValue={selectedActivity}
                        style={styles.picker}
                        onValueChange={(value) => {
                            setSelectedActivity(value);
                            if (value) {
                                fetchSubActivitiesForActivity(value);
                            }
                        }}
                    >
                        <Picker.Item label="Select Activity" value={null} />
                        {activities.map(activity => (
                            <Picker.Item
                                key={activity.id}
                                label={activity.activity_name}
                                value={activity.id}
                            />
                        ))}
                    </Picker>
                </View>

                <View style={styles.pickerContainer}>
                    <Text style={styles.pickerLabel}>Sub-Activity</Text>
                    <Picker
                        selectedValue={selectedSubActivity}
                        style={styles.picker}
                        onValueChange={(value) => setSelectedSubActivity(value)}
                    >
                        <Picker.Item label="Select Sub-Activity" value={null} />
                        {subActivities.map(subActivity => (
                            <Picker.Item
                                key={subActivity.id}
                                label={subActivity.sub_act_name}
                                value={subActivity.id}
                            />
                        ))}
                    </Picker>
                </View>
            </View>

            {/* Topic Hierarchy */}
            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#4CAF50" />
                        <Text style={styles.loadingText}>Loading topics...</Text>
                    </View>
                ) : topicHierarchy.length > 0 ? (
                    <FlatList
                        data={topicHierarchy}
                        renderItem={renderTopic}
                        keyExtractor={(item) => item.id.toString()}
                        style={styles.hierarchyContainer}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={{ fontSize: 64, marginBottom: 16 }}>📚</Text>
                        <Text style={styles.emptyText}>
                            {selectedActivity && selectedSubActivity
                                ? 'No topics found for selected criteria'
                                : 'Please select activity and sub-activity to view topics'
                            }
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Materials Modal */}
            <Modal
                visible={materialsModal}
                animationType="slide"
                onRequestClose={() => setMaterialsModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity
                            onPress={() => setMaterialsModal(false)}
                            style={styles.modalCloseButton}
                        >
                            {/* <Icon name="close" size={24} color="#fff" /> */}

                            <Text style={{ color: '#fff', fontSize: 24 }}>⬅️</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>
                            {selectedTopicInfo?.topic_name} - Materials
                        </Text>
                    </View>

                    {materialsLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#4CAF50" />
                            <Text style={styles.loadingText}>Loading materials...</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={selectedTopicMaterials}
                            renderItem={renderMaterialItem}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={styles.materialsList}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    {/* <Icon name="library-books" size={64} color="#ccc" /> */}
                                    <Text style={{ color: '#ccc', fontSize: 64 }}>📚</Text>
                                    <Text style={styles.emptyText}>No materials available</Text>
                                </View>
                            }
                        />
                    )}
                </View>
            </Modal>
        </View>
    );
};

export default MentorTopicHierarchy;
