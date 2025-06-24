import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import BackIcon from '../../../assets/CoordinatorPage/Request/Back.svg';
import PdfIcon from '../../../assets/CoordinatorPage/Request/pdf-icon.svg';
import TickIcon from '../../../assets/CoordinatorPage/Request/tick.svg';
import styles from './RequestUploadStyle';
import { API_URL } from '../../../utils/env.js';

const CoordinatorRequestUpload = ({ route, navigation }) => {
  const { reqData } = route.params || {};
  
  // Parse document types from the request data
  const documentTypes = Array.isArray(reqData?.document_type) 
    ? reqData.document_type 
    : typeof reqData?.document_type === 'string' 
      ? JSON.parse(reqData.document_type) 
      : [];

  // Initialize files state based on document types
  const initialFilesState = documentTypes.reduce((acc, docType) => {
    // Create a key by converting to lowercase and replacing spaces with underscores
    const key = docType.toLowerCase().replace(/\s+/g, '_');
    acc[key] = { 
      name: '', 
      uploaded: false, 
      uri: '', 
      type: '', 
      size: 0,
      documentTitle: docType // Store the original document title
    };
    return acc;
  }, {});

  const [files, setFiles] = useState(initialFilesState);

  // Function to handle file removal
  const handleRemoveFile = (fileType) => {
    setFiles({
      ...files,
      [fileType]: { 
        ...initialFilesState[fileType], 
        uploaded: false 
      }
    });
  };

  // Function to pick PDF files
  const pickPDF = async (fileType) => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
        allowMultiSelection: false,
      });
      
      const file = result[0];
      
      setFiles({
        ...files,
        [fileType]: {
          name: file.name,
          uri: file.uri,
          type: file.type,
          size: file.size,
          uploaded: true,
          documentTitle: files[fileType].documentTitle // Preserve the document title
        }
      });
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        Alert.alert('Error', 'Something went wrong while picking the file');
        console.error(err);
      }
    }
  }; 

  // Function to handle document submission
  const handleSubmit = async () => {
    // Check if all required files are uploaded
    const allUploaded = Object.values(files).every(file => file.uploaded);
    
    if (!allUploaded) {
      Alert.alert('Error', 'Please upload all required documents');
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append('request_id', reqData.requestID);
      
      // Get document titles in the same order as files
      const documentTitles = Object.values(files).map(file => file.documentTitle);
      formData.append('document_titles', JSON.stringify(documentTitles));
  
      // Append files with proper field name (must be 'files' to match multer config)
      Object.values(files).forEach((file) => { 
        formData.append('files', {
          uri: `${file.uri}`,
          name: file.name || `${file.documentTitle.replace(/\s+/g, '_')}.pdf`,
          type: 'application/pdf',
        });
      }); 
  
      
      const response = await fetch(`${API_URL}/api/coordinator/uploadRequestDocuments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      }); 
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
  
      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', `${documentTitles.length} documents uploaded successfully!`);
        navigation.navigate('CoordinatorRequest', {
          updatedStatus: 'Completed', 
          requestId: reqData.requestID,
        });
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(
        'Upload Failed', 
        error.message || 'Failed to upload documents. Please try again.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon 
            width={styles.BackIcon.width} 
            height={styles.BackIcon.height} 
          />
        </TouchableOpacity>
        <Text style={styles.headerTxt}>Request</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Request Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.cardTitle}>
              {documentTypes.join(' + ')}
            </Text>
            <Text style={styles.dateText}>
              {new Date(reqData?.request_date).toLocaleDateString('en-IN') || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.cardSubtitle}>{reqData?.purpose || 'N/A'}</Text>
            <Text style={styles.statusText}>{reqData?.status || 'Pending'}</Text>
          </View>
        </View>

        {/* Upload Section */}
        <View style={styles.uploadSection}>
          {/* Dynamically render upload boxes based on document types */}
          {Object.entries(files).map(([fileType, fileData]) => (
            <View key={fileType}>
              <Text style={styles.uploadTitle}>{fileData.documentTitle}</Text>
              <View style={styles.uploadBox}>
                {fileData.uploaded ? (
                  <View style={styles.fileRow}>
                    <View style={styles.fileInfo}>
                      <PdfIcon style={styles.fileIcon} />
                      <Text style={styles.fileName}>{fileData.name}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.removeFileBtn}
                      onPress={() => handleRemoveFile(fileType)}
                    >
                      <Text style={styles.removeFileBtnText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.dropArea}>
                    <Text style={styles.dropText}>Drag and drop files here or</Text>
                    <TouchableOpacity 
                      style={styles.chooseFileBtn}
                      onPress={() => pickPDF(fileType)}
                    >
                      <Text style={styles.chooseFileBtnText}>
                        Click <Text style={styles.hereText}>here</Text> to choose PDF file
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.dropText}>to upload</Text>
                    <Text style={styles.limitText}>*max 10MB limit</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSubmit}
          disabled={!Object.values(files).every(file => file.uploaded)}
        >
          <Text style={styles.submitText}>Submit documents</Text>
          <TickIcon style={styles.tickIcon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CoordinatorRequestUpload;