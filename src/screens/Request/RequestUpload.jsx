import React, { useState } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import BackIcon from '../../assets/Request/Back.svg';
import PdfIcon from '../../assets/Request/pdf-icon.svg';
import TickIcon from '../../assets/Request/tick.svg';
import styles from './RequestUploadStyle';

const RequestUpload = ({ route, navigation }) => {
  const { title, subtitle, date, status } = route.params || {};
  
  // State to track uploaded files
  const [files, setFiles] = useState({
    fees: { name: '', uploaded: false, uri: '', type: '', size: 0 },
    bonafide: { name: '', uploaded: false, uri: '', type: '', size: 0 }
  });

  // Function to handle file removal
  const handleRemoveFile = (fileType) => {
    setFiles({
      ...files,
      [fileType]: { name: '', uploaded: false, uri: '', type: '', size: 0 }
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
          uploaded: true
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
  const handleSubmit = () => {
    // Check if all required files are uploaded
    if (files.fees.uploaded && files.bonafide.uploaded) {
      Alert.alert('Success', 'Documents submitted successfully!');
      navigation.navigate('RequestHome', {
        updatedStatus: 'Completed',
        requestId: route.params?.id, // optional, if you are tracking specific request
      });
     
    } else {
      Alert.alert('Error', 'Please upload all required documents');
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
            <Text style={styles.cardTitle}>{title || 'Fees receipt'}</Text>
            <Text style={styles.dateText}>{date || '23/02/25'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.cardSubtitle}>{subtitle || 'Income tax'}</Text>
            <Text style={styles.statusText}>{status || 'Pending'}</Text>
          </View>
        </View>

        {/* Upload Section */}
        <View style={styles.uploadSection}>
          {/* Fees Receipt Upload */}
          <Text style={styles.uploadTitle}>Fees receipt</Text>
          <View style={styles.uploadBox}>
            {files.fees.uploaded ? (
              <View style={styles.fileRow}>
                <View style={styles.fileInfo}>
                  <PdfIcon style={styles.fileIcon} />
                  <Text style={styles.fileName}>{files.fees.name}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.removeFileBtn}
                  onPress={() => handleRemoveFile('fees')}
                >
                  <Text style={styles.removeFileBtnText}>×</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.dropArea}>
                <Text style={styles.dropText}>Drag and drop files here or</Text>
                <TouchableOpacity 
                  style={styles.chooseFileBtn}
                  onPress={() => pickPDF('fees')}
                >
                  <Text style={styles.chooseFileBtnText}>
                    Click <Text style={styles.hereText}>here</Text> to choose PDF file
                  </Text>
                </TouchableOpacity>
                <Text style={styles.dropText}>to upload</Text>
              </View>
            )}
          </View>

          {/* Bonafide Upload */}
          <Text style={styles.uploadTitle}>Bonafide</Text>
          <View style={styles.uploadBox}>
            {files.bonafide.uploaded ? (
              <View style={styles.fileRow}>
                <View style={styles.fileInfo}>
                  <PdfIcon style={styles.fileIcon} />
                  <Text style={styles.fileName}>{files.bonafide.name}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.removeFileBtn}
                  onPress={() => handleRemoveFile('bonafide')}
                >
                  <Text style={styles.removeFileBtnText}>×</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.dropArea}>
                <Text style={styles.dropText}>Drag and drop files here or</Text>
                <TouchableOpacity 
                  style={styles.chooseFileBtn}
                  onPress={() => pickPDF('bonafide')}
                >
                  <Text style={styles.chooseFileBtnText}>
                    Click <Text style={styles.hereText}>here</Text> to choose PDF file
                  </Text>
                </TouchableOpacity>
                <Text style={styles.dropText}>to upload</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit documents</Text><TickIcon style={styles.tickIcon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default RequestUpload;