import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList,
  RefreshControl,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as materialApi from '../../../../utils/materialApi/coordinatorMaterialApi.js';
import { Header } from '../../../../components';
import Nodata from '../../../../components/General/Nodata';

const QuestionPaperManagement = ({ route, navigation }) => {
  const {
    userData,
    grades,
    selectedGrade,
    selectedSubjectId,
    selectedSubjectName,
    selectedSectionId,
  } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [questionPapers, setQuestionPapers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPaper, setEditingPaper] = useState(null);

  const [formData, setFormData] = useState({
    topicCode: '',
    title: '',
    totalMarks: '',
    durationMinutes: '',
    examDate: '',
    description: '',
    paperUrl: '',
  });

  useEffect(() => {
    fetchQuestionPapers();
  }, []);

  const fetchQuestionPapers = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true); else setLoading(true);
      const sectionId = selectedSectionId;
      const subjectId = selectedSubjectId;
      if (!sectionId || !subjectId) {
        setQuestionPapers([]);
        return;
      }
      const res = await materialApi.getQuestionPapers(sectionId, subjectId, null, false);
      if (res && res.success) {
        setQuestionPapers(res.questionPapers || []);
      } else {
        setQuestionPapers([]);
        if (!isRefresh) Alert.alert('Error', res?.message || 'Failed to fetch question papers');
      }
    } catch (e) {
      console.error('Error fetching question papers:', e);
      if (!isRefresh) Alert.alert('Error', 'Failed to fetch question papers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      topicCode: '',
      title: '',
      totalMarks: '',
      durationMinutes: '',
      examDate: '',
      description: '',
      paperUrl: '',
    });
    setEditingPaper(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (paper) => {
    setEditingPaper(paper);
    setFormData({
      topicCode: paper.topic_code || '',
      title: paper.title || '',
      totalMarks: String(paper.total_marks || ''),
      durationMinutes: paper.duration_minutes != null ? String(paper.duration_minutes) : '',
      examDate: paper.exam_date ? paper.exam_date.slice(0, 10) : '',
      description: paper.description || '',
      paperUrl: paper.paper_url || '',
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const sectionId = selectedSectionId;
      const subjectId = selectedSubjectId;
      if (!sectionId || !subjectId) {
        Alert.alert('Error', 'Section or subject missing');
        return;
      }

      if (!formData.topicCode.trim() || !formData.title.trim() || !formData.totalMarks.trim() || !formData.examDate.trim()) {
        Alert.alert('Error', 'Topic code, title, total marks and exam date are required');
        return;
      }

      const payload = {
        sectionId,
        subjectId,
        topicCode: formData.topicCode.trim(),
        title: formData.title.trim(),
        totalMarks: parseInt(formData.totalMarks, 10),
        durationMinutes: formData.durationMinutes ? parseInt(formData.durationMinutes, 10) : null,
        examDate: formData.examDate.trim(),
        description: formData.description.trim() || null,
        paperUrl: formData.paperUrl.trim() || null,
      };

      let res;
      if (editingPaper) {
        res = await materialApi.updateQuestionPaper({ id: editingPaper.id, ...payload });
      } else {
        res = await materialApi.addQuestionPaper(payload);
      }

      if (res && res.success) {
        Alert.alert('Success', editingPaper ? 'Question paper updated' : 'Question paper created');
        setModalVisible(false);
        resetForm();
        fetchQuestionPapers();
      } else {
        Alert.alert('Error', res?.message || 'Failed to save question paper');
      }
    } catch (e) {
      console.error('Error saving question paper:', e);
      Alert.alert('Error', 'Failed to save question paper');
    }
  };

  const handleDelete = (paper) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this question paper?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await materialApi.deleteQuestionPaper(paper.id);
              if (res && res.success) {
                Alert.alert('Success', 'Question paper deleted');
                fetchQuestionPapers();
              } else {
                Alert.alert('Error', res?.message || 'Failed to delete question paper');
              }
            } catch (e) {
              console.error('Error deleting question paper:', e);
              Alert.alert('Error', 'Failed to delete question paper');
            }
          },
        },
      ]
    );
  };

  const handleApprove = async (paper) => {
    try {
      const res = await materialApi.approveQuestionPaper(paper.id);
      if (res && res.success) {
        Alert.alert('Success', 'Question paper approved');
        fetchQuestionPapers(true);
      } else {
        Alert.alert('Error', res?.message || 'Failed to approve question paper');
      }
    } catch (e) {
      console.error('Error approving question paper:', e);
      Alert.alert('Error', 'Failed to approve question paper');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setLoading(true);
      const res = await materialApi.downloadQuestionPaperTemplate();
      if (!res || !res.success) {
        Alert.alert('Error', res?.message || 'Failed to download template');
      }
    } catch (e) {
      console.error('Download template error:', e);
      Alert.alert('Error', 'Failed to download template');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadExcel = async () => {
    try {
      const DocumentPicker = require('@react-native-documents/picker');
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.xlsx, DocumentPicker.types.xls],
        copyTo: 'cachesDirectory',
      });
      if (result && result.length > 0) {
        const file = result[0];
        setLoading(true);
        const uploadResult = await materialApi.uploadQuestionPapersExcel(file);
        if (uploadResult && uploadResult.success) {
          Alert.alert('Success', 'Question papers uploaded successfully');
          fetchQuestionPapers(true);
        } else {
          const msg = uploadResult?.message || 'Failed to upload question papers';
          const errs = Array.isArray(uploadResult?.errors) ? `\n${uploadResult.errors.join('\n')}` : '';
          Alert.alert('Upload Failed', msg + errs);
        }
      }
    } catch (error) {
      const DocumentPicker = require('@react-native-documents/picker');
      const pickerIsCancel = (DocumentPicker && typeof DocumentPicker.isCancel === 'function')
        ? DocumentPicker.isCancel(error)
        : (error && (error.code === 'DOCUMENT_PICKER_CANCELED' || error.name === 'AbortError' || (typeof error.message === 'string' && error.message.toLowerCase().includes('cancel'))));
      if (pickerIsCancel) {
        console.log('User cancelled question paper file picker');
      } else {
        console.error('Upload error:', error);
        Alert.alert('Error', 'Failed to upload question papers');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderPaperItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="file-document-outline" size={24} color="#2563EB" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.topic_code} • {item.topic_name}</Text>
            <Text style={styles.cardMeta}>Marks: {item.total_marks} • Date: {item.exam_date ? item.exam_date.slice(0,10) : '-'}</Text>
            <Text style={styles.cardMeta}>Approved: {item.is_approved ? 'Yes' : 'No'}</Text>
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => openEditModal(item)}>
            <MaterialCommunityIcons name="pencil" size={18} color="#4B5563" />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item)}>
            <MaterialCommunityIcons name="trash-can" size={18} color="#DC2626" />
            <Text style={[styles.actionText, { color: '#DC2626' }]}>Delete</Text>
          </TouchableOpacity>
          {!item.is_approved && (
            <TouchableOpacity style={styles.actionButton} onPress={() => handleApprove(item)}>
              <MaterialCommunityIcons name="check-circle" size={18} color="#059669" />
              <Text style={[styles.actionText, { color: '#059669' }]}>Approve</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading && !refreshing && questionPapers.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Header title="Question Papers" navigation={navigation} />
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading question papers...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
      <Header title={`Question Papers - ${selectedSubjectName || ''}`} navigation={navigation} />
      <View style={styles.toolbar}>
        <TouchableOpacity style={[styles.toolbarButton, { backgroundColor: '#3B82F6' }]} onPress={handleDownloadTemplate}>
          <MaterialCommunityIcons name="download" size={18} color="#fff" />
          <Text style={styles.toolbarButtonText}>Template</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toolbarButton, { backgroundColor: '#10B981' }]} onPress={handleUploadExcel}>
          <MaterialCommunityIcons name="upload" size={18} color="#fff" />
          <Text style={styles.toolbarButtonText}>Upload</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toolbarButton, { backgroundColor: '#6366F1' }]} onPress={openCreateModal}>
          <MaterialCommunityIcons name="plus" size={18} color="#fff" />
          <Text style={styles.toolbarButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        refreshControl={
          // eslint-disable-next-line react/jsx-no-undef
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchQuestionPapers(true)} />
        }
      >
        {questionPapers.length === 0 ? (
          <View style={{ marginTop: 40 }}>
            <Nodata message="No question papers found" />
          </View>
        ) : (
          <FlatList
            data={questionPapers}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderPaperItem}
            scrollEnabled={false}
          />
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingPaper ? 'Edit Question Paper' : 'Add Question Paper'}</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Topic Code</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., T001"
                value={formData.topicCode}
                onChangeText={(text) => setFormData({ ...formData, topicCode: text })}
              />

              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Question paper title"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />

              <Text style={styles.label}>Total Marks</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 50"
                keyboardType="numeric"
                value={formData.totalMarks}
                onChangeText={(text) => setFormData({ ...formData, totalMarks: text })}
              />

              <Text style={styles.label}>Duration (minutes)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 60"
                keyboardType="numeric"
                value={formData.durationMinutes}
                onChangeText={(text) => setFormData({ ...formData, durationMinutes: text })}
              />

              <Text style={styles.label}>Exam Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="2025-01-15"
                value={formData.examDate}
                onChangeText={(text) => setFormData({ ...formData, examDate: text })}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Optional description"
                multiline
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
              />

              <Text style={styles.label}>Paper URL</Text>
              <TextInput
                style={styles.input}
                placeholder="https://... (optional)"
                value={formData.paperUrl}
                onChangeText={(text) => setFormData({ ...formData, paperUrl: text })}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#E5E7EB' }]} onPress={() => { setModalVisible(false); }}>
                <Text style={[styles.modalButtonText, { color: '#111827' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#2563EB' }]} onPress={handleSave}>
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>{editingPaper ? 'Update' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = {
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#4B5563',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    elevation: 2,
  },
  toolbarButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  toolbarButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 2,
  },
  cardMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  actionText: {
    fontSize: 13,
    color: '#4B5563',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#F9FAFB',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
};

export default QuestionPaperManagement;
