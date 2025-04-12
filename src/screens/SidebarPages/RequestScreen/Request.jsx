import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, TextInput, FlatList } from 'react-native';
import PreviousIcon from '../../../assets/LeaveIcon/PrevBtn.svg';
import DownloadIcon from '../../../assets/RequestSvg/downloadicon.svg';
import { styles } from './RequestStyles';

const Request = ({ navigation }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requests, setRequests] = useState([
    { 
      id: '1', 
      types: ['Fees receipt', 'Bonafide'], 
      purpose: 'Income tax', 
      status: 'Received', 
      date: '23/02/25', 
      documents: [
        { name: 'Fees receipt.pdf', type: 'Fees receipt' },
        { name: 'Bonafide.pdf', type: 'Bonafide' }
      ] 
    },
    { 
      id: '2', 
      types: ['Bonafide'], 
      purpose: 'Passport', 
      status: 'Received', 
      date: '23/02/25', 
      documents: [
        { name: 'Bonafide.pdf', type: 'Bonafide' }
      ] 
    },
    { 
      id: '3', 
      types: ['Fees receipt'], 
      purpose: 'Income tax', 
      status: 'Received', 
      date: '23/02/25', 
      documents: [] 
    },
  ]);

  const [formData, setFormData] = useState({
    requestTypes: [],
    purpose: '',
    otherPurpose: '',
  });

  const requestTypes = ['Bonofide', 'Marksheet', 'Fees receipt', 'Fees Structure'];
  const purposes = ['Income tax', 'Passport', 'VoterId', 'Pan card', 'Other'];

  const formatRequestTypes = (types) => {
    if (types.length <= 1) return types[0];
    return `${types[0]} +${types.length - 1}`;
  };

  const handleAddRequest = () => {
    if (formData.requestTypes.length > 0 && (formData.purpose || formData.otherPurpose)) {
      const newRequest = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        types: [...formData.requestTypes],
        purpose: formData.purpose === 'Other' ? formData.otherPurpose : formData.purpose,
        status: 'Requested',
        date: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        }),
        documents: [],
      };

      setRequests([newRequest, ...requests]);
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

  const handleRequestPress = (request) => {
    if (request.status === 'Received') {
      setSelectedRequest(request);
    }
  };

  const downloadDocument = (document) => {
    console.log(`Downloading ${document}`);
  };

  const renderDetailView = () => {
    if (!selectedRequest) return null;

    return (
      <>
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
              <Text style={styles.requestType}>{formatRequestTypes(selectedRequest.types)}</Text>
              <Text style={styles.requestDate}>{selectedRequest.date}</Text>
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

          {selectedRequest.documents && selectedRequest.documents.length > 0 && (
            <View style={styles.requestItem}>
              {selectedRequest.documents.map((doc, index) => (
                <View key={index} style={styles.documentRow}>
                  <View>
                    <Text style={styles.documentName}>{doc.type}</Text>
                    <Text style={styles.fileName}>{doc.name}</Text>
                  </View>
                  <TouchableOpacity onPress={() => downloadDocument(doc.name)}>
                    <DownloadIcon width={24} height={24} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </>
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
          style={styles.confirmButton}
          onPress={handleAddRequest}
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

        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
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
                <Text style={styles.requestType}>{formatRequestTypes(item.types)}</Text>
                <Text style={styles.requestDate}>{item.date}</Text>
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

export default Request;