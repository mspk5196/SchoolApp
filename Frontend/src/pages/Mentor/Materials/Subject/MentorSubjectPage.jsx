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
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import styles from './SubjectStyle';
import BackIcon from '../../../../assets/CoordinatorPage/Subjects/Back.svg';
import PdfIcon from '../../../../assets/CoordinatorPage/Subjects/pdf-icon.svg';
import VideoIcon from '../../../../assets/CoordinatorPage/Subjects/video-icon.svg';
import DownloadIcon from '../../../../assets/MentorPage/download.svg';
import EditIcon from '../../../../assets/CoordinatorPage/Subjects/Edit.svg';
import { API_URL } from "@env";
import { requestStoragePermission } from '../../../../components/StoragePermission/requestStoragePermission';
import { getType } from 'mime';

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

    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);

    const downloadFile = async (url, fileName) => {
        try {
            // 1. Use your existing requestStoragePermission() function
            const hasPermission = await requestStoragePermission();
            if (!hasPermission) {
                Alert.alert('Permission Denied', 'Storage permission required');
                return;
            }

            // 2. Define Download Path
            const downloadDir = Platform.OS === 'android'
                ? RNFS.DownloadDirectoryPath
                : RNFS.DocumentDirectoryPath;
            const filePath = `${downloadDir}/${fileName.replace(/%20/g, ' ')}`;

            // 3. Show download progress alert
            const progressAlert = Alert.alert(
                'Downloading, Please Wait',
                `Downloading ${fileName}...`,
                [],
                { cancelable: false }
            );

            // 4. Download File
            const options = {
                fromUrl: url,
                toFile: filePath,
                notification: true,
                progress: (res) => {
                    const progress = (res.bytesWritten / res.contentLength) * 100;
                    console.log(`Download Progress: ${progress.toFixed(2)}%`);
                },
            };

            const download = RNFS.downloadFile(options);
            const { statusCode } = await download.promise;

            // Close progress alert
            Alert.alert('Success', `Downloaded to ${filePath}`);

            // 5. Open File (optional)
            try {
                console.log(filePath);

                await openRemoteFile(filePath);

            } catch (openError) {
                console.log('Could not open file:', openError);
            }

        } catch (error) {
            Alert.alert('Error', `Failed to download file: ${error.message}`);
            console.error('Download error:', error);
        }


        return (
            <>
                <Modal visible={visible} transparent animationType="fade">
                    <View style={styles.modalContainer}>
                        <View style={styles.dialog}>
                            <Text style={styles.title}>Downloading...</Text>
                            <Text style={styles.percent}>{progress}%</Text>
                        </View>
                    </View>
                </Modal>

                {/* You can call this manually or wrap in a button */}
                <Text onPress={downloadFile} style={styles.downloadBtn}>
                    Download & Open
                </Text>
            </>
        );

    };

    const getMimeType = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        switch (ext) {
            case 'pdf': return 'application/pdf';
            case 'mp4': return 'video/mp4';
            case 'jpg': case 'jpeg': return 'image/jpeg';
            case 'png': return 'image/png';
            default: return 'application/octet-stream';
        }
    };

    const openRemoteFile = async (filePath) => {
        try {
            const mimeType = getMimeType(filePath);

            if (Platform.OS === 'Android') {
                await RNFetchBlob.android.actionViewIntent(filePath, mimeType);
            } else {
                await FileViewer.open(filePath, { showOpenWithDialog: true });
            }
        } catch (err) {
            console.error('❌ Could not open file:', err);
            Alert.alert(
                'Cannot Open File',
                'Please make sure a compatible app (like Adobe PDF Reader) is installed.'
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