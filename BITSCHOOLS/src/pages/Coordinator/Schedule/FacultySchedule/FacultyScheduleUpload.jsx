import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../../../components';
import ApiService from '../../../../utils/ApiService';
import * as DocumentPicker from '@react-native-documents/picker';

const FacultyScheduleUpload = ({ navigation }) => {
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDownloadTemplate = async () => {
    try {
      setLoadingTemplate(true);
      const result = await ApiService.downloadFile(
        '/coordinator/schedule/mentor/generate-template',
        'mentor_schedule_template.xlsx',
        {
          mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          title: 'Mentor Schedule Template',
          description: 'Template to upload mentor schedules',
        },
      );
      Alert.alert('Success', result.message || 'Template downloaded successfully.');
    } catch (error) {
      console.error('Template download error:', error);
      Alert.alert('Error', error.message || 'Failed to download template.');
    } finally {
      setLoadingTemplate(false);
    }
  };

  const handleUploadSchedule = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.xlsx, DocumentPicker.types.allFiles],
        copyTo: 'cachesDirectory',
      });

      const picked = result[0];
      setUploading(true);

      const uploadResult = await ApiService.uploadFile(
        '/coordinator/schedule/mentor/upload',
        picked,
      );

      const { processed, succeeded, failed } = uploadResult.data.data || uploadResult.data;
      let message = `Processed: ${processed}\nSucceeded: ${succeeded}`;
      if (failed && failed.length) {
        message += `\nFailed: ${failed.length}`;
      }
      Alert.alert('Upload result', message);
    } catch (err) {
      if (DocumentPicker.isCancel && DocumentPicker.isCancel(err)) {
        return;
      }
      console.error('Schedule upload error:', err);
      Alert.alert('Error', err.message || 'Failed to upload schedule file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'left', 'right']}>
      <Header title="Faculty Schedule Upload" navigation={navigation} />
      <View style={styles.container}>
        <Text style={styles.description}>
          Download the Excel template, fill in the faculty schedules, and upload the file to create faculty and student schedules.
        </Text>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleDownloadTemplate}
          disabled={loadingTemplate}
        >
          {loadingTemplate ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Download Template</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleUploadSchedule}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#1F2933" />
          ) : (
            <Text style={styles.secondaryButtonText}>Upload Filled Schedule</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 24,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
  },
  secondaryButton: {
    backgroundColor: '#E5E7EB',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FacultyScheduleUpload;
