import { apiFetch } from "../../../../utils/apiClient.js";
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, TextInput, FlatList, Alert, Linking, RefreshControl } from 'react-native';
import PreviousIcon from '../../../../assets/ParentPage/LeaveIcon/PrevBtn.svg';
import DownloadIcon from '../../../../assets/ParentPage/RequestSvg/downloadicon.svg';
import { styles } from './RequestStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EventBus from "../../../../utils/EventBus";
import { API_URL } from "../../../../utils/env.js";
import { ActivityIndicator } from 'react-native-paper';
import Nodata from '../../../../components/General/Nodata';

const StudentPageRequest = ({ navigation }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState([]);
  const [formData, setFormData] = useState({
    requestTypes: [],
    purpose: '',
    otherPurpose: '',
  });

  const [roll, setRoll] = useState('');
  const [grade, setGrade] = useState(null);
  const [selectedStudentData, setSelectedStudent] = useState(null);
  const [studentData, setStudentData] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [documentPurpose, setDocumentPurpose] = useState([]);
  const [document, setDocument] = useState(null);

  const requestTypes = documentTypes.map(doc => doc.name);
  const purposes = documentPurpose.map(doc => doc.name);

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

  const formatRequestTypes = (types) => {
    if (!types) return '';

    // If it's already an array, return it formatted
    if (Array.isArray(types)) {
      if (types.length === 0) return '';
      if (types.length === 1) return types[0];
      return `${types[0]} +${types.length - 1}`;
    }

    // If it's a string, try to parse it
    if (typeof types === 'string') {
      try {
        const parsed = JSON.parse(types);
        if (Array.isArray(parsed)) {
          if (parsed.length === 0) return '';
          if (parsed.length === 1) return parsed[0];
          return `${parsed[0]} +${parsed.length - 1}`;
        }
        return types; // Return as-is if not an array after parsing
      } catch (e) {
        console.log('Could not parse document_type as JSON, using as-is:', types);
        return types; // Return the string as-is if not valid JSON
      }
    }

    return String(types); // Fallback for other types
  };

  const fetchStudent = async () => {
    try {
      const storedStudents = await AsyncStorage.getItem("studentData");
      if (storedStudents) {
        const parsedStudents = JSON.parse(storedStudents);
        setStudentData(parsedStudents);
        return parsedStudents;
      }
      return [];
    } catch (error) {
      console.error("Error fetching student data:", error);
      return [];
    }
  };

  const getActiveUser = async (students = []) => {
    try {
      const savedUser = await AsyncStorage.getItem("activeUser");
      const studentsToUse = students.length > 0 ? students : studentData;

      if (savedUser && studentsToUse.length > 0) {
        const active = studentsToUse.find(student =>
          student.name === savedUser ||
          student.roll === savedUser
        );

        if (active) {
          console.log("Active student found:", active);
          setSelectedStudent(active);
          setRoll(active.roll);
          setGrade(active.grade_id);
          return active;
        }
      }
      console.log("No active student found");
      return null;
    } catch (error) {
      console.error("Error getting active user:", error);
      return null;
    }
  };

  const fetchDocumnetTypes = async () => {
    try {
      const response = await apiFetch(`fetchDocumentTypes`);
      const data = response
      if (data.success) {
        setDocumentTypes(data.docTypes || []);
      } else {
        console.log("Failed to fetch document types");
      }
    } catch (error) {
      console.error("Error fetching document types:", error);
    }
  };

  const fetchDocumentPurpose = async () => {
    try {
      const response = await apiFetch(`fetchDocumentPurpose`);
      const data = response
      if (data.success) {
        setDocumentPurpose(data.docPurpose || []);
      } else {
        console.log("Failed to fetch document purpose");
      }
    } catch (error) {
      console.error("Error fetching document purpose:", error);
    }
  };

  const fetchStudentRequests = async (isRefreshing = false) => {
    if (!roll) return;

    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await apiFetch(`/fetchStudentRequests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roll }),
      });

      const data = response
      console.log("Student Request Data API Response:", data);

      if (data.success) {
        setRequests(data.studentRequests || []);
      } else {
        console.log("No student request data found");
      }
    } catch (error) {
      console.error("Error fetching student request data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddRequest = async () => {
    if (formData.requestTypes.length > 0 && (formData.purpose || formData.otherPurpose)) {
      const newRequest = {
        requestID: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        types: [...formData.requestTypes],
        purpose: formData.purpose === 'Other' ? formData.otherPurpose : formData.purpose,
        status: 'Requested',
      };

      try {
        const response = await apiFetch(`/createStudentRequest`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roll,
            grade,
            requestID: newRequest.requestID,
            docTypes: newRequest.types,
            purpose: newRequest.purpose,
            status: newRequest.status
          }),
        });

        const data = response

        if (data.success) {
          Alert.alert("Success", "Your request has been submitted.");
          fetchStudentRequests(); // Refresh the requests list
        } else {
          Alert.alert("Error", data.message || "Failed to request documents");
        }
      } catch (error) {
        console.error("Error requesting documents:", error);
        Alert.alert("Error", "Failed to request documents");
      }

      setFormData({
        requestTypes: [],
        purpose: '',
        otherPurpose: '',
      });
      setShowForm(false);
    }
  };

  const toggleCheckbox = (type, field) => {
    if (field === 'requestTypes') {
      setFormData({
        ...formData,
        requestTypes: formData.requestTypes.includes(type)
          ? formData.requestTypes.filter(item => item !== type)
          : [...formData.requestTypes, type],
      });
    } else {
      setFormData({
        ...formData,
        purpose: formData.purpose === type ? '' : type,
        otherPurpose: type === 'Other' ? formData.otherPurpose : '',
      });
    }
  };

  const handleRequestPress = async (request) => {
    if (request.status === 'Received') {
      setSelectedRequest(request);
      setLoading(true);

      try {
        const apiUrl = `${API_URL}/api/fetchStudentDocument`;
        console.log('Fetching documents from:', apiUrl);

        const response = await apiFetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            request_id: request.requestID
          })
        });

        // Check if response is OK (status 200-299)
        if (!response) {
          const errorText = await response.text();
          throw new Error(`Server responded with ${response.status}: ${errorText}`);
        }

        const data = response
        console.log("API Response:", data);

        if (data.success) {
          setDocument(data.documents || data.studentDocument || []); // Handle both response formats
        } else {
          throw new Error(data.message || "No documents found");
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
        Alert.alert(
          "Error",
          error.message || "Could not load documents. Please try again later."
        );
        setDocument([]); // Reset documents on error
      } finally {
        setLoading(false); 
      }
    } 
  };

  const downloadDocument = (filePath) => {
    if (!filePath) {
      Alert.alert("Error", "No file path provided");
      return;
    }

    const fullUrl = `${API_URL}/${filePath}`;
    Linking.openURL(fullUrl).catch(err => {
      console.error("Failed to open URL:", err);
      Alert.alert("Error", "Could not open the document");
    });
  };


  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const students = await fetchStudent();
        await Promise.all([
          fetchDocumnetTypes(),
          fetchDocumentPurpose(),
          getActiveUser(students)
        ]);
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initData();

    const handleUserToggle = async () => {
      const students = await fetchStudent();
      await getActiveUser(students);
    };

    EventBus.on("userToggled", handleUserToggle);

    return () => {
      EventBus.off("userToggled", handleUserToggle);
    };
  }, []);

  const onRefresh = async () => {
    await fetchStudentRequests(true);
  };

  useEffect(() => {
    if (roll) {
      fetchStudentRequests();
    }
  }, [roll]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </SafeAreaView>
    );
  }

  if (!roll) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>No active student selected</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={async () => {
            const students = await fetchStudent();
            await getActiveUser(students);
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const renderDetailView = () => {
    if (!selectedRequest) return null;

    return (
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedRequest(null)}>
            <PreviousIcon width={24} height={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Request</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.detailContainer}>
          <View style={styles.requestItem}>
            <View style={styles.requestInfo}>
              <Text style={styles.requestType}>{formatRequestTypes(selectedRequest.document_type)}</Text>
              <Text style={styles.requestDate}>{convertToIST(selectedRequest.request_date)}</Text>
            </View>
            <View style={styles.statusPurposeRow}>
              <Text style={styles.requestPurpose}>{selectedRequest.purpose}</Text>
              <Text
                style={[
                  styles.requestStatus,
                  selectedRequest.status === 'Received' ? styles.statusReceived : styles.statusRequested
                ]}
              >
                {selectedRequest.status}
              </Text>
            </View>
          </View>

          {document && document.length > 0 ? (
            <View style={styles.requestItem}>
              {document.map((doc, index) => (
                <View key={index} style={styles.documentRow}>
                  <View>
                    <Text style={styles.documentName}>{doc.document_type}</Text>
                    <Text style={styles.fileName}>{doc.file_name}</Text>
                  </View>
                  <TouchableOpacity onPress={() => downloadDocument(doc.file_path)}>
                    <DownloadIcon width={24} height={24} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No documents available</Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  let content;
  if (showForm) {
    content = (
      <View style={styles.container}>
        <ScrollView style={styles.formContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setShowForm(false)}>
              <PreviousIcon width={24} height={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>General Activity</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Request</Text>
            {requestTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.checkboxContainer}
                onPress={() => toggleCheckbox(type, 'requestTypes')}
              >
                <View style={[
                  styles.checkbox,
                  formData.requestTypes.includes(type) ? styles.checkedBox : {}
                ]}>
                  {formData.requestTypes.includes(type) && <Text style={styles.tick}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>{type}</Text>
              </TouchableOpacity>
            ))}

            <Text style={styles.sectionTitle}>Purpose</Text>
            {purposes.map((purpose) => (
              <TouchableOpacity
                key={purpose}
                style={styles.checkboxContainer}
                onPress={() => toggleCheckbox(purpose, 'purpose')}
              >
                <View style={[
                  styles.checkbox,
                  formData.purpose === purpose ? styles.checkedBox : {}
                ]}>
                  {formData.purpose === purpose && <Text style={styles.tick}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>{purpose}</Text>
              </TouchableOpacity>
            ))}

            {formData.purpose === 'Other' && (
              <TextInput
                style={styles.input}
                placeholder="Enter here..."
                placeholderTextColor="#999"
                value={formData.otherPurpose}
                onChangeText={(text) => setFormData({ ...formData, otherPurpose: text })}
              />
            )}
          </View>
        </ScrollView>

        <TouchableOpacity
          style={[
            styles.confirmButton,
            (formData.requestTypes.length === 0 || (!formData.purpose && !formData.otherPurpose)) &&
            styles.disabledButton
          ]}
          onPress={handleAddRequest}
          disabled={formData.requestTypes.length === 0 || (!formData.purpose && !formData.otherPurpose)}
        >
          <Text style={styles.confirmButtonText}>Confirm Request</Text>
        </TouchableOpacity>
      </View>
    );
  } else if (selectedRequest) {
    content = renderDetailView();
  } else {
    content = (
      <>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <PreviousIcon width={24} height={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Request</Text>
          <View style={styles.headerSpacer} />
        </View>

        {requests.length === 0 ? (
          <ScrollView
            contentContainerStyle={styles.emptyContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#0C36FF']}
                tintColor="#0C36FF"
              />
            }
          >
            <Nodata/>
          </ScrollView>
        ) : (
          <FlatList
            data={requests}
            keyExtractor={(item) => item.requestID || String(item.id)}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#0C36FF']}
                tintColor="#0C36FF"
              />
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.requestItem,
                  item.status === 'Received' ? styles.clickableItem : null
                ]}
                onPress={() => handleRequestPress(item)}
                activeOpacity={item.status === 'Received' ? 0.7 : 1}
              >
                <View style={styles.requestInfo}>
                  <Text style={styles.requestType}>{formatRequestTypes(item.document_type)}</Text>
                  <Text style={styles.requestDate}>{convertToIST(item.request_date)}</Text>
                </View>
                <View style={styles.statusPurposeRow}>
                  <Text style={styles.requestPurpose}>{item.purpose}</Text>
                  <Text
                    style={[
                      styles.requestStatus,
                      item.status === 'Received' ? styles.statusReceived : styles.statusRequested
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}

        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => setShowForm(true)}
        >
          <Text style={styles.floatingButtonText}>+</Text>
        </TouchableOpacity>
      </>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {content}
    </SafeAreaView>
  );
};

export default StudentPageRequest;