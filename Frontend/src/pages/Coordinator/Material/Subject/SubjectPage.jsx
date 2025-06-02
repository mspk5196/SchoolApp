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
    Linking
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DocumentPicker from 'react-native-document-picker';
import styles from './SubjectStyle';
import { ActivityIndicator } from 'react-native';
import BackIcon from '../../../../assets/CoordinatorPage/Subjects/Back.svg';
import AddIcon from '../../../../assets/CoordinatorPage/Subjects/Add.svg';
import CalendarIcon from '../../../../assets/CoordinatorPage/Subjects/Calendar.svg';
import PdfIcon from '../../../../assets/CoordinatorPage/Subjects/pdf-icon.svg';
import VideoIcon from '../../../../assets/CoordinatorPage/Subjects/video-icon.svg';
import DeleteIcon from '../../../../assets/CoordinatorPage/Subjects/delete-icon.svg';
import EditIcon from '../../../../assets/CoordinatorPage/Subjects/Edit.svg';
import { API_URL } from "@env";
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import Nodata from '../../../../components/General/Nodata';
import mime from 'react-native-mime-types';
import { Link } from '@react-navigation/native';

const SubjectPage = ({ route, navigation }) => {
    const { grade, subject, subjectID, gradeID } = route.params || {};
    const [isAddMode, setIsAddMode] = useState(false);
    const [level, setLevel] = useState('');
    const [loading, setLoading] = useState(false);

    // Date picker states
    const [selectedDate, setSelectedDate] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [date, setDate] = useState(new Date());

    const [selectedPDFs, setSelectedPDFs] = useState([]);
    const [selectedVideos, setSelectedVideos] = useState([]);

    const [editingLevelId, setEditingLevelId] = useState(null);
    const [editingDate, setEditingDate] = useState(new Date());
    const [showEditDatePicker, setShowEditDatePicker] = useState(false);

    // State to store saved materials
    const [materials, setMaterials] = useState([]);

    const [downloadProgress, setDownloadProgress] = useState(null);

    // Track active tab per material using material ID
    const [activeTabs, setActiveTabs] = useState({});

    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const convertToIST = (utcDate) => {
        if (!utcDate) return '';
        return new Date(utcDate).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour12: true,
            day: '2-digit',
            month: 'numeric',
            year: 'numeric',
            // hour: '2-digit',
            // minute: '2-digit',
        });
    };

    const formatDateToLocalYYYYMMDD = (date) => {
        const year = date.getFullYear();
        const month = (`0${date.getMonth() + 1}`).slice(-2);
        const day = (`0${date.getDate()}`).slice(-2);
        return `${year}-${month}-${day}`;
    };

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
        setSelectedDate(formatDate(currentDate));
    };

    const showDatepicker = () => {
        setShowDatePicker(true);
    };
    const fetchMaterials = async () => {
        console.log("Fetching materials for:", { gradeID, subjectID });

        try {
            const response = await fetch(`${API_URL}/api/coordinator/getMaterials?gradeID=${gradeID}&subjectID=${subjectID}`);
            const data = await response.json();
            console.log("🧾 Full response from backend:", data);

            if (response.ok && data.success) {
                const grouped = {};

                data.materials.forEach(item => {
                    const level = item.level;
                    const expectedDate = item.expected_date

                    if (!grouped[level]) {
                        grouped[level] = {
                            id: level, // using level as group id
                            level: level,
                            pdfs: [],
                            videos: [],
                            expectedDate: expectedDate,
                        };
                    }

                    const fileObj = {
                        id: item.id, // Include the unique file ID from database
                        name: item.file_name,
                        uri: `${API_URL}/${item.file_url}`,
                        type: item.material_type // 'PDF' or 'Video'
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

    useEffect(() => {
        console.log("✅ Materials updated:", materials);
    }, [materials]);


    const handleSave = async () => {
        setLoading(true);
        if (!level.trim()) {
            Alert.alert("Required Field", "Please enter a level");
            return;
        }

        const formData = new FormData();
        formData.append('grade_id', gradeID);  // Assuming grade is an object
        formData.append('subject_id', subjectID);  // Assuming subject is an object
        formData.append('level', level);
        formData.append('expected_date', selectedDate ? date.toISOString().split('T')[0] : '');

        selectedPDFs.forEach((pdf, index) => {
            formData.append('files', {
                uri: pdf.uri,
                type: pdf.type || 'application/pdf',
                name: pdf.name || `file${index}.pdf`,
            });
        });

        selectedVideos.forEach((video, index) => {
            formData.append('files', {
                uri: video.uri,
                type: video.type || 'video/mp4',
                name: video.name || `video${index}.mp4`,
            });
        });

        try {
            const response = await fetch(`${API_URL}/api/coordinator/uploadStudyMaterial`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                    // Do NOT set 'Content-Type' manually here in some cases; RN will handle it automatically
                },
            });

            if (response.ok) {
                Alert.alert('Success', 'Material uploaded successfully');
                const newMaterialId = Date.now().toString();
                setMaterials([
                    ...materials,
                    {
                        id: newMaterialId,
                        level,
                        completionDate: selectedDate || 'Not set',
                        pdfs: [...selectedPDFs],
                        videos: [...selectedVideos],
                        hasVideo: selectedVideos.length > 0,
                        expectedDate: selectedDate || 'Not set',
                    }
                ]);
                setActiveTabs(prev => ({
                    ...prev,
                    [newMaterialId]: 'PDF'
                }));
                setLevel('');
                setSelectedDate('');
                setSelectedPDFs([]);
                setSelectedVideos([]);
                setIsAddMode(false);
            } else {
                Alert.alert('Upload Failed', 'Server responded with error.');
            }
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Upload Failed', 'An error occurred during upload.');
        }
        finally {
            setLoading(false); // hide loader
        }
    };

    // Function to change active tab for a specific material
    const changeActiveTab = (materialId, tabName) => {
        setActiveTabs(prev => ({
            ...prev,
            [materialId]: tabName
        }));
    };

    // Function to pick PDF files 
    const pickPDFs = async () => {
        try {
            const results = await DocumentPicker.pick({
                type: [DocumentPicker.types.pdf],
                allowMultiSelection: true,
            });

            const newFiles = results.map(file => ({
                name: file.name,
                uri: file.uri,
                type: file.type,
                size: file.size
            }));

            setSelectedPDFs([...selectedPDFs, ...newFiles]);
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                // User cancelled the picker
            } else {
                Alert.alert('Error', 'Something went wrong while picking the file');
                console.error(err);
            }
        }
    };

    // Function to pick video files
    const pickVideos = async () => {
        try {
            const results = await DocumentPicker.pick({
                type: [DocumentPicker.types.video],
                allowMultiSelection: true,
            });

            const newFiles = results.map(file => ({
                name: file.name,
                uri: file.uri,
                type: file.type,
                size: file.size
            }));

            setSelectedVideos([...selectedVideos, ...newFiles]);
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                // User cancelled the picker
            } else {
                Alert.alert('Error', 'Something went wrong while picking the file');
                console.error(err);
            }
        }
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
            const response = await fetch(`${API_URL}/api/coordinator/updateExpectedDate`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    level: editingLevelId,
                    grade_id: gradeID,
                    subject_id: subjectID,
                    expected_date: formatDateToLocalYYYYMMDD(newDate), // Format: YYYY-MM-DD
                }),
            });

            const data = await response.json();
            if (data.success) {
                Alert.alert('Success', 'Expected date updated');
                fetchMaterials(); // Refresh materials
            } else {
                Alert.alert('Error', data.message || 'Failed to update date');
            }
        } catch (err) {
            console.error("Update error:", err);
            Alert.alert('Error', 'Something went wrong while updating date');
        }
    };

    const handleDeleteLevel = async (level) => {
        try {
            const response = await fetch(`${API_URL}/api/coordinator/deleteLevel`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ level, gradeID, subjectID }),
            });

            const data = await response.json();
            if (data.success) {
                Alert.alert('Success', 'Level deleted');
                fetchMaterials(); // refresh
            } else {
                Alert.alert('Error', data.message || 'Could not delete level');
            }
        } catch (error) {
            console.error('Delete level error:', error);
            Alert.alert('Error', 'Failed to delete level');
        }
    };
    // Function to delete a material
    const deleteMaterial = (level) => {
        Alert.alert(
            "Delete Material",
            "Are you sure you want to delete this material?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        handleDeleteLevel(level)
                    }
                }
            ]
        );
    };

    const handleDeleteFile = async (fileId, fileType, level) => {
        try {
            const response = await fetch(`${API_URL}/api/coordinator/deleteMaterial`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileId
                }),
            });

            const data = await response.json();
            if (data.success) {
                Alert.alert('Success', 'File deleted');
                fetchMaterials(); // refresh the list
            } else {
                Alert.alert('Error', data.message || 'Could not delete file');
            }
        } catch (error) {
            console.error('Delete error:', error);
            Alert.alert('Error', 'Failed to delete file');
        }
    };

    const deleteFile = (fileId, fileType, level) => {
        Alert.alert(
            "Delete File",
            "Are you sure you want to delete this file?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => handleDeleteFile(fileId, fileType, level)
                }
            ]
        );
    };

    const openFileLikeWhatsApp = async (fileUrl, fileName) => {

        const localFile = `${RNFS.DownloadDirectoryPath}/${fileName}`;

        try {
            Alert.alert('Choice', 'Do you want to open this file in the app or download it?', [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Just View',
                    onPress: async () => {
                        try {
                            await Linking.openURL(fileUrl);
                        } catch (err) {
                            console.error('File open error:', err);
                            Alert.alert('Error', 'Could not open the file in the app.');
                        }
                    },
                },
                {
                    text: 'Download',
                    onPress: async () => {
                        setDownloadProgress(0);
                        const downloadResult = await RNFS.downloadFile({
                            fromUrl: fileUrl,
                            toFile: localFile,
                            progress: (res) => {
                                const percent = Math.floor((res.bytesWritten / res.contentLength) * 100);
                                setDownloadProgress(percent);
                            },
                            progressDivider: 1,
                        }).promise;

                        setDownloadProgress(null);

                        if (downloadResult.statusCode === 200) {
                            const mimeType = mime.lookup(fileName) || undefined;
                            await FileViewer.open(localFile, { showOpenWithDialog: true, mimeType });
                        } else {
                            Alert.alert('Download failed', 'Could not download the file.');
                        }
                    },
                }

            ]
            )
        } catch (err) {
            setDownloadProgress(null);
            if (
                err &&
                (err.message?.includes('No app associated') ||
                    err.message?.includes('no activity found to handle Intent'))
            ) {
                Alert.alert(
                    'No App Found',
                    'No app is installed to open this file type. Would you like to open it in your browser?',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Open in Browser',
                            onPress: () => Linking.openURL(fileUrl),
                        },
                    ]
                );
            } else {
                Alert.alert('Error', 'Could not open the file.');
            }
            console.error('File open error:', err);
        }
    };

    const renderAddMaterialForm = () => {
        return (
            <Modal
                visible={isAddMode}
                animationType="slide"
                transparent={false}
                onRequestClose={() => setIsAddMode(false)}
            >
                <SafeAreaView style={styles.formContainer}>
                    <StatusBar barStyle="dark-content" />
                    <View style={styles.formHeader}>
                        <TouchableOpacity onPress={() => setIsAddMode(false)}>
                            <BackIcon
                                width={styles.BackIcon.width}
                                height={styles.BackIcon.height}
                            />
                        </TouchableOpacity>
                        <Text style={styles.headerTxt}>Material</Text>
                    </View>

                    <ScrollView contentContainerStyle={styles.formContent}>
                        <Text style={styles.gradeText}>{grade} - {subject}</Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Level</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter Level"
                                value={level}
                                onChangeText={setLevel}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Expected date to complete the level</Text>
                            <TouchableOpacity
                                style={styles.dateInput}
                                onPress={showDatepicker}
                            >
                                <Text style={[styles.dateInputText, selectedDate ? styles.selectedDateText : null]}>
                                    {selectedDate || "Select date"}
                                </Text>
                                <CalendarIcon width={20} height={20} />
                            </TouchableOpacity>

                            {showDatePicker && (
                                <DateTimePicker
                                    testID="dateTimePicker"
                                    value={date}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={onDateChange}
                                    minimumDate={new Date()}
                                    style={styles.datePicker}
                                />
                            )}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Lecture Material <Text style={styles.optionalText}>(optional)</Text></Text>
                            <View style={styles.fileContainer}>
                                {selectedPDFs.map((pdf, index) => (
                                    <View key={index} style={styles.fileItem}>
                                        <PdfIcon style={styles.fileIcon} />
                                        <Text style={styles.fileName}>{pdf.name}</Text>
                                        <TouchableOpacity
                                            style={styles.removeFileBtn}
                                            onPress={() => {
                                                const newPDFs = [...selectedPDFs];
                                                newPDFs.splice(index, 1);
                                                setSelectedPDFs(newPDFs);
                                            }}
                                        >
                                            <Text style={styles.removeFileBtnText}>×</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                <TouchableOpacity
                                    style={styles.chooseFileBtn}
                                    onPress={pickPDFs}
                                >
                                    <Text style={styles.chooseFileBtnText}>Click <Text style={styles.hereText}>here</Text> to choose PDF files</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.helperText}>Add the document in pdf format.</Text>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Reference Video <Text style={styles.optionalText}>(optional)</Text></Text>
                            <View style={styles.fileContainer}>
                                {selectedVideos.map((video, index) => (
                                    <View key={index} style={styles.fileItem}>
                                        <VideoIcon style={styles.fileIcon} />
                                        <Text style={styles.fileName}>{video.name}</Text>
                                        <TouchableOpacity
                                            style={styles.removeFileBtn}
                                            onPress={() => {
                                                const newVideos = [...selectedVideos];
                                                newVideos.splice(index, 1);
                                                setSelectedVideos(newVideos);
                                            }}
                                        >
                                            <Text style={styles.removeFileBtnText}>×</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                <TouchableOpacity
                                    style={styles.videoSelectBtn}
                                    onPress={pickVideos}
                                >
                                    <VideoIcon style={styles.videoIcon} />
                                    <Text style={styles.chooseFileBtnText}>Click <Text style={styles.hereText}>here</Text> to choose video files</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.saveButtonText}>Save</Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        );
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

                        {/* Display added materials */}
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
                                                        {/* {  console.log("Active tab for material", pdf, "is PDF")} */}
                                                        <TouchableOpacity onPress={() => openFileLikeWhatsApp(`${pdf.uri}`, pdf.name)} style={{ flex: 1 }}>
                                                            <Text style={styles.fileName}>{(pdf.name).replace(/%/g, ' ')}</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity onPress={() => deleteFile(pdf.id, 'PDF', material.level)}>
                                                            <DeleteIcon style={styles.deleteIcon} />
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
                                                        <TouchableOpacity onPress={() => openFileLikeWhatsApp(`${video.uri}`, video.name)} style={{ flex: 1 }}>
                                                            <Text style={styles.fileName}>{video.name}</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity onPress={() => deleteFile(video.id, 'Video', material.level)}>
                                                            <DeleteIcon style={styles.deleteIcon} />
                                                        </TouchableOpacity>
                                                    </View>
                                                ))
                                            ) : (
                                                <Text style={styles.noFilesText}>No video files added</Text>
                                            )}
                                        </View>
                                    )}

                                    <TouchableOpacity
                                        style={styles.deleteMaterialBtn}
                                        onPress={() => deleteMaterial(material.level)}
                                    >
                                        <Text style={styles.deleteMaterialBtnText}>Delete Level</Text>
                                    </TouchableOpacity>
                                </View>
                            ))
                        ) : (
                            <View style={styles.noMaterialsContainer}>
                                <Text style={styles.noMaterialsText}>No materials added yet. Click the + button to add.</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={styles.noGradeContainer}>
                        <Text style={styles.noGradeText}>Please select a grade from the home screen</Text>
                    </View>
                )}
            </ScrollView>

            <TouchableOpacity
                style={styles.AddButton}
                onPress={() => setIsAddMode(true)}
            >
                <AddIcon width={styles.AddIcon.width} height={styles.AddIcon.height} />
            </TouchableOpacity>

            {renderAddMaterialForm()}

            <Modal
                visible={downloadProgress !== null}
                transparent
                animationType="fade"
                onRequestClose={() => { }} // disables Android back button
            >
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <View style={{
                        backgroundColor: '#fff',
                        padding: 30,
                        borderRadius: 10,
                        alignItems: 'center'
                    }}>
                        <ActivityIndicator size="large" color="#007bff" style={{ marginBottom: 10 }} />
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5, color: 'black' }}>
                            Downloading...
                        </Text>
                        <Text style={{ fontSize: 16, color: 'black' }}>
                            {downloadProgress}%
                        </Text>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default SubjectPage;