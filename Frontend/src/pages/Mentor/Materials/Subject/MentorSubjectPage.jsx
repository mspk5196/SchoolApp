import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Image,
    StatusBar,
    Platform,
    Alert,
    PermissionsAndroid
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNFetchBlob from 'rn-fetch-blob';
import styles from './SubjectStyle';
import BackIcon from '../../../../assets/CoordinatorPage/Subjects/Back.svg';
import PdfIcon from '../../../../assets/CoordinatorPage/Subjects/pdf-icon.svg';
import VideoIcon from '../../../../assets/CoordinatorPage/Subjects/video-icon.svg';
import DownloadIcon from '../../../../assets/MentorPage/download.svg';
import EditIcon from '../../../../assets/CoordinatorPage/Subjects/Edit.svg';
import { API_URL } from "@env";
import { requestStoragePermission } from '../../../../components/StoragePermission/requestStoragePermission';

const MentorSubjectPage = ({ route, navigation }) => {
    const { grade, subject, subjectID, gradeID } = route.params || {};

    const [editingLevelId, setEditingLevelId] = useState(null);
    const [editingDate, setEditingDate] = useState(new Date());
    const [showEditDatePicker, setShowEditDatePicker] = useState(false);
    const [materials, setMaterials] = useState([]);
    const [activeTabs, setActiveTabs] = useState({});

    // Function to check and request storage permission

    useEffect(() => {
        let isMounted = true;
        
        const fetchData = async () => {
            try {
                await fetchMaterials();
            } catch (error) {
                if (isMounted) {
                    Alert.alert('Error', 'Failed to load materials');
                }
            }
        };
    
        fetchData();
    
        return () => {
            isMounted = false;
        };
    }, [gradeID, subjectID]);
    
    // Function to download file
    const downloadFile = async (fileUri, fileName) => {
        try {
            const hasPermission = await requestStoragePermission();
            if (!hasPermission) {
                Alert.alert('Permission Denied', 'Storage permission required');
                return;
            }
    
            const fileExt = fileName.split('.').pop().toLowerCase();
            const mimeType = fileExt === 'pdf' ? 'application/pdf' : 
                             fileExt === 'mp4' ? 'video/mp4' : 
                             'application/octet-stream';
    
            const dirs = RNFetchBlob.fs.dirs;
            const downloadDir = dirs.DownloadDir;
            const filePath = `${downloadDir}/${fileName}`;
    
            // Show progress alert
            const progressAlert = Alert.alert(
                'Downloading', 
                `Downloading ${fileName}...`,
                [{ text: 'OK', onPress: () => {} }],
                { cancelable: false }
            );
    
            const configOptions = {
                fileCache: true,
                addAndroidDownloads: {
                    useDownloadManager: true,
                    notification: true,
                    path: filePath,
                    description: 'File download',
                    mime: mimeType,
                    title: fileName,
                },
                timeout: 30000 // 30 seconds timeout
            };
    
            const res = await RNFetchBlob.config(configOptions)
                .fetch('GET', fileUri)
                .progress((received, total) => {
                    console.log(`Progress: ${received}/${total}`);
                });
    
            Alert.alert('Success', `Downloaded to ${filePath}`);
            
            if (Platform.OS === 'android') {
                try {
                    RNFetchBlob.android.actionViewIntent(res.path(), mimeType);
                } catch (viewError) {
                    console.log('Cannot open file:', viewError);
                }
            }
    
        } catch (error) {
            console.error('Download failed:', error);
            Alert.alert(
                'Download Failed', 
                error.message || 'Failed to download file',
                [{ text: 'OK', onPress: () => {} }]
            );
        }
    };

    const convertToIST = (utcDate) => {
        if (!utcDate) return '';
        return new Date(utcDate).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour12: true,
            day: '2-digit',
            month: 'numeric',
            year: 'numeric',
        });
    };

    const formatDateToLocalYYYYMMDD = (date) => {
        const year = date.getFullYear();
        const month = (`0${date.getMonth() + 1}`).slice(-2);
        const day = (`0${date.getDate()}`).slice(-2);
        return `${year}-${month}-${day}`;
    };

    const fetchMaterials = async () => {
        console.log("Fetching materials for:", { gradeID, subjectID });

        try {
            const response = await fetch(`${API_URL}/api/mentor/getMaterials?gradeID=${gradeID}&subjectID=${subjectID}`);
            const data = await response.json();

            if (response.ok && data.success) {
                const grouped = {};

                data.materials.forEach(item => {
                    const level = item.level;
                    const expectedDate = item.expected_date

                    if (!grouped[level]) {
                        grouped[level] = {
                            id: level,
                            level: level,
                            pdfs: [],
                            videos: [],
                            expectedDate: expectedDate,
                        };
                    }

                    const fileObj = {
                        id: item.id,
                        name: item.file_name,
                        uri: `${API_URL}/${item.file_url}`,
                        type: item.material_type
                    };

                    if (item.material_type === 'PDF') {
                        grouped[level].pdfs.push(fileObj);
                    } else if (item.material_type === 'Video') {
                        grouped[level].videos.push(fileObj);
                    }
                });

                const groupedMaterials = Object.values(grouped);
                const defaultTabs = {};
                groupedMaterials.forEach(mat => {
                    defaultTabs[mat.id] = 'PDF';
                });

                setActiveTabs(defaultTabs);
                setMaterials(groupedMaterials);
            }
            else {
                console.error("Backend error:", data.message);
                Alert.alert('Error', data.message || 'Failed to fetch materials');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            Alert.alert('Error', 'Something went wrong while fetching materials');
        }
    };

    useEffect(() => {
        fetchMaterials();
    }, [gradeID, subjectID]);

    const changeActiveTab = (materialId, tabName) => {
        setActiveTabs(prev => ({
            ...prev,
            [materialId]: tabName
        }));
    };

    const handleEditDateChange = async (event, selectedDate) => {
        if (event.type === 'dismissed') {
            setShowEditDatePicker(false);
            return;
        }
        console.log(selectedDate);

        setShowEditDatePicker(false);
        const newDate = selectedDate || editingDate;

        try {
            const response = await fetch(`${API_URL}/api/mentor/updateExpectedDate`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    level: editingLevelId,
                    grade_id: gradeID,
                    subject_id: subjectID,
                    expected_date: formatDateToLocalYYYYMMDD(newDate),
                }),
            });

            const data = await response.json();
            if (data.success) {
                Alert.alert('Success', 'Expected date updated');
                fetchMaterials();
            } else {
                Alert.alert('Error', data.message || 'Failed to update date');
            }
        } catch (err) {
            console.error("Update error:", err);
            Alert.alert('Error', 'Something went wrong while updating date');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <BackIcon
                        width={styles.BackIcon.width}
                        height={styles.BackIcon.height}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTxt}>{subject} Material</Text>
            </View>

            <ScrollView nestedScrollEnabled={true} contentContainerStyle={styles.scrollViewContent}>
                {grade ? (
                    <View style={styles.gradeContainer}>
                        <Text style={styles.gradeText}>{grade} - {subject}</Text>

                        {materials.length > 0 ? (
                            materials.map((material, index) => (
                                <View key={material.id} style={styles.levelContainer}>
                                    <View style={styles.levelHeader}>
                                        <Text style={styles.levelTitle}>Level {material.level}</Text>
                                        <View style={styles.levelHeaderRight}>
                                            <Text style={styles.expectedDate}>Expected date: {convertToIST(material.expectedDate)}</Text>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setEditingLevelId(material.level);
                                                    setEditingDate(new Date(material.expectedDate));
                                                    setShowEditDatePicker(true);
                                                }}
                                            >
                                                <EditIcon style={styles.editIcon} />
                                                {showEditDatePicker && (
                                                    <DateTimePicker
                                                        value={editingDate}
                                                        mode="date"
                                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                                        onChange={handleEditDateChange}
                                                        minimumDate={new Date()}
                                                    />
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <View style={styles.materialTabs}>
                                        <TouchableOpacity
                                            style={activeTabs[material.id] === 'PDF' ? styles.tabActive : styles.tab}
                                            onPress={() => changeActiveTab(material.id, 'PDF')}
                                        >
                                            <Text style={activeTabs[material.id] === 'PDF' ? styles.tabActiveText : styles.tabText}>PDF</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={activeTabs[material.id] === 'Video' ? styles.tabActive : styles.tab}
                                            onPress={() => changeActiveTab(material.id, 'Video')}
                                        >
                                            <Text style={activeTabs[material.id] === 'Video' ? styles.tabActiveText : styles.tabText}>Video</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {activeTabs[material.id] === 'PDF' ? (
                                        <View style={styles.materialFiles}>
                                            {material.pdfs.length > 0 ? (
                                                material.pdfs.map((pdf, idx) => (
                                                    <View key={`pdf-${pdf.id || pdf.name || idx}`} style={styles.fileRow}>
                                                        <PdfIcon style={styles.pdfIcon} />
                                                        <Text style={styles.fileName}>{pdf.name}</Text>
                                                        <TouchableOpacity
                                                            onPress={() => downloadFile(pdf.uri, pdf.name)}
                                                        >
                                                            <DownloadIcon />
                                                        </TouchableOpacity>
                                                    </View>
                                                ))
                                            ) : (
                                                <Text style={styles.noFilesText}>No PDF files added</Text>
                                            )}
                                        </View>
                                    ) : (
                                        <View style={styles.materialFiles}>
                                            {material.videos && material.videos.length > 0 ? (
                                                material.videos.map((video, idx) => (
                                                    <View key={`video-${video.id || video.name || idx}`} style={styles.fileRow}>
                                                        <VideoIcon style={styles.videoIcon} />
                                                        <Text style={styles.fileName}>{video.name}</Text>
                                                        <TouchableOpacity
                                                            onPress={() => downloadFile(video.uri, video.name)}
                                                        >
                                                            <DownloadIcon />
                                                        </TouchableOpacity>
                                                    </View>
                                                ))
                                            ) : (
                                                <Text style={styles.noFilesText}>No video files added</Text>
                                            )}
                                        </View>
                                    )}
                                </View>
                            ))
                        ) : (
                            <View style={styles.noMaterialsContainer}>
                                <Text style={styles.noMaterialsText}>No materials added yet.</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={styles.noGradeContainer}>
                        <Text style={styles.noGradeText}>Please select a grade from the home screen</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default MentorSubjectPage;