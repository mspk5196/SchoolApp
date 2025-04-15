import React, { useState } from 'react';
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
  Alert
} from 'react-native';
import { SafeAreaView as SafeAreaContext } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import DocumentPicker from 'react-native-document-picker';
import styles from './EnglishStyle';
import BackIcon from '../../../assets/Subjects/Back.svg';
import AddIcon from '../../../assets/Subjects/Add.svg';
import CalendarIcon from '../../../assets/Subjects/Calendar.svg';
import PdfIcon from '../../../assets/Subjects/pdf-icon.svg';
import VideoIcon from '../../../assets/Subjects/video-icon.svg';
import DeleteIcon from '../../../assets/Subjects/delete-icon.svg';

const English = ({ route, navigation }) => {
  const { grade } = route.params || {};
  const [isAddMode, setIsAddMode] = useState(false);
  const [level, setLevel] = useState('');
  
  // Date picker states
  const [selectedDate, setSelectedDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  
  const [selectedPDFs, setSelectedPDFs] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  
  // State to store saved materials
  const [materials, setMaterials] = useState([]);
  
  // Track active tab per material using material ID
  const [activeTabs, setActiveTabs] = useState({});
  
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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
  
  const handleSave = () => {
    if (level.trim()) {
      const newMaterialId = Date.now().toString();
      
      // Add new material to the list
      setMaterials([
        ...materials,
        {
          id: newMaterialId,
          level: level,
          completionDate: selectedDate || 'Not set',
          pdfs: [...selectedPDFs],
          videos: [...selectedVideos],
          hasVideo: selectedVideos.length > 0
        }
      ]);
      
      // Set default tab to PDF for the new material
      setActiveTabs(prev => ({
        ...prev,
        [newMaterialId]: 'PDF'
      }));
      
      // Reset form fields
      setLevel('');
      setSelectedDate('');
      setSelectedPDFs([]);
      setSelectedVideos([]);
      
      // Close modal
      setIsAddMode(false);
    } else {
      // Show alert for validation
      Alert.alert("Required Field", "Please enter a level");
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
  
  // Function to delete a material
  const deleteMaterial = (materialId) => {
    Alert.alert(
      "Delete Material",
      "Are you sure you want to delete this material?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            const updatedMaterials = materials.filter(item => item.id !== materialId);
            setMaterials(updatedMaterials);
            
            // Also remove the tab state for this material
            setActiveTabs(prev => {
              const newTabs = {...prev};
              delete newTabs[materialId];
              return newTabs;
            });
          }
        }
      ]
    );
  };
  
  // Function to delete a file from a material
  const deleteFile = (materialId, fileIndex, fileType) => {
    Alert.alert(
      "Delete File",
      "Are you sure you want to delete this file?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            const updatedMaterials = materials.map(material => {
              if (material.id === materialId) {
                if (fileType === 'pdf') {
                  const updatedPDFs = [...material.pdfs];
                  updatedPDFs.splice(fileIndex, 1);
                  return { ...material, pdfs: updatedPDFs };
                } else if (fileType === 'video') {
                  const updatedVideos = [...material.videos];
                  updatedVideos.splice(fileIndex, 1);
                  return { 
                    ...material, 
                    videos: updatedVideos,
                    hasVideo: updatedVideos.length > 0
                  };
                }
              }
              return material;
            });
            setMaterials(updatedMaterials);
          }
        }
      ]
    );
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
            <Text style={styles.gradeText}>Grade {grade} - English</Text>
            
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
            >
              <Text style={styles.saveButtonText}>Save</Text>
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
        <Text style={styles.headerTxt}>English Material</Text>
      </View>
      
      <ScrollView nestedScrollEnabled={true} contentContainerStyle={styles.scrollViewContent}>
        {grade ? (
          <View style={styles.gradeContainer}>
            <Text style={styles.gradeText}>{grade} - English</Text>
            
            {/* Display added materials */}
            {materials.length > 0 ? (
              materials.map((material, index) => (
                <View key={material.id} style={styles.levelContainer}>
                  <Text style={styles.levelTitle}>Level {material.level}</Text>
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
                        material.pdfs.map((pdf, pdfIndex) => (
                          <View key={pdfIndex} style={styles.fileRow}>
                            <PdfIcon style={styles.pdfIcon} />
                            <Text style={styles.fileName}>{pdf.name}</Text>
                            <TouchableOpacity onPress={() => deleteFile(material.id, pdfIndex, 'pdf')}>
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
                        material.videos.map((video, videoIndex) => (
                          <View key={videoIndex} style={styles.fileRow}>
                            <VideoIcon style={styles.videoIcon} />
                            <Text style={styles.fileName}>{video.name}</Text>
                            <TouchableOpacity onPress={() => deleteFile(material.id, videoIndex, 'video')}>
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
                    onPress={() => deleteMaterial(material.id)}
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
    </SafeAreaView>
  );
};

export default English;