import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import styles from './Messagestyles';
import PreviousIcon from '../../../../assets/ParentPage/LeaveIcon/PrevBtn.svg';
import AttachmentIcon from '../../../../assets/ParentPage/phonebook/attachmentIcon.svg';
import MicIcon from '../../../../assets/ParentPage/phonebook/micIcon.svg';
import SendIcon from '../../../../assets/ParentPage/phonebook/sendIcon.svg';
import DocumentIcon from '../../../../assets/ParentPage/phonebook/documentIcon.svg';
import AudioIcon from '../../../../assets/ParentPage/phonebook/audioIcon.svg';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import { Audio } from 'expo-av';
import { API_URL } from '@env';

const StudentPageMessage = ({ route, navigation }) => {
  const { contact } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastMessageId, setLastMessageId] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const flatListRef = useRef(null);
  const studentData = useRef(null);

  // Fetch student data
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('studentData');
        if (storedData) {
          studentData.current = JSON.parse(storedData)[0];
          fetchMessages();
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
        setIsLoading(false);
      }
    };
    
    fetchStudentData();
    
    // Set up polling for new messages
    const pollInterval = setInterval(fetchMessages, 5000);
    
    return () => clearInterval(pollInterval);
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_URL}/messages/get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender_id: studentData.current.student_id,
          receiver_id: contact.mentor_id,
          sender_type: 'student',
          last_message_id: lastMessageId
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.messages.length > 0) {
        setMessages(prev => [...prev, ...data.messages]);
        setLastMessageId(data.messages[data.messages.length - 1].message_id);
        
        // Scroll to bottom when new messages arrive
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }, 100);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (message.trim() === '') return;

    try {
      const response = await fetch(`${API_URL}/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender_id: studentData.current.student_id,
          receiver_id: contact.mentor_id,
          sender_type: 'student',
          message_text: message
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage('');
      } else {
        Alert.alert('Error', 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const pickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });
      
      if (!result.didCancel && result.assets && result.assets.length > 0) {
        await uploadAttachment(result.assets[0], 'image');
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const takePhoto = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
      });
      
      if (!result.didCancel && result.assets && result.assets.length > 0) {
        await uploadAttachment(result.assets[0], 'image');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.doc, DocumentPicker.types.docx, 
               DocumentPicker.types.xls, DocumentPicker.types.xlsx],
      });
      
      await uploadAttachment(result, result.type);
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        console.error('Error picking document:', error);
      }
    }
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        await uploadAttachment({ uri, name: 'audio.mp4', type: 'audio/mp4' }, 'audio');
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    } finally {
      setRecording(null);
    }
  };

  const uploadAttachment = async (file, fileType) => {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name || 'file',
      type: file.type || `application/${fileType}`
    });
    formData.append('sender_id', studentData.current.student_id);
    formData.append('receiver_id', contact.mentor_id);
    formData.append('sender_type', 'student');
    
    try {
      const response = await fetch(`${API_URL}/messages/send-attachment`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const data = await response.json();
      
      if (!data.success) {
        Alert.alert('Error', 'Failed to send attachment');
      }
    } catch (error) {
      console.error('Error uploading attachment:', error);
      Alert.alert('Error', 'Failed to send attachment');
    }
  };

  const renderMessage = ({ item }) => {
    const isSent = item.sender_type === 'student';
    
    return (
      <View key={item.message_id}>
        {item.time && (
          <View style={{ width: '100%', alignItems: 'center' }}>
            <Text style={styles.timeStamp}>{item.time}</Text>
          </View>
        )}
        
        <View style={[styles.messageContainer, isSent ? styles.sentMessage : styles.receivedMessage]}>
          {!isSent && (
            <Image 
              source={item.sender_profile ? { uri: `${API_URL}/${item.sender_profile}` } : require('../../../../assets/default-profile.png')}
              style={styles.profileImage}
            />
          )}
          
          <View style={[styles.messageBubble, isSent ? styles.sentBubble : styles.receivedBubble]}>
            {item.message_text && (
              <Text style={[styles.messageText, isSent ? styles.sentText : styles.receivedText]}>
                {item.message_text}
              </Text>
            )}
            
            {item.attachment_path && (
              <>
                {item.attachment_type === 'image' ? (
                  <Image 
                    source={{ uri: `${API_URL}${item.attachment_path}` }}
                    style={styles.messageImage}
                    resizeMode="contain"
                  />
                ) : item.attachment_type === 'audio' ? (
                  <TouchableOpacity 
                    style={styles.audioAttachment}
                    onPress={() => playAudio(`${API_URL}${item.attachment_path}`)}
                  >
                    <AudioIcon width={24} height={24} />
                    <Text style={styles.audioText}>Audio Message</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={styles.documentAttachment}
                    onPress={() => downloadAttachment(`${API_URL}${item.attachment_path}`)}
                  >
                    <DocumentIcon width={24} height={24} />
                    <Text style={styles.documentText}>
                      {item.attachment_path.split('/').pop()}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
            
            <Text style={[styles.messageTime, isSent ? styles.sentTime : styles.receivedTime]}>
              {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const playAudio = async (audioUri) => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const downloadAttachment = (attachmentUrl) => {
    // Implement download functionality using expo-file-system or other library
    Alert.alert('Download', 'Attachment download would start here');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <PreviousIcon width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {contact.mentor_name} ({contact.subject_name})
        </Text>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={styles.messagesContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4169E1" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.message_id.toString()}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => 
              flatListRef.current.scrollToEnd({ animated: true })
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No messages yet</Text>
              </View>
            }
          />
        )}

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.attachButton}
            onPress={() => {
              Alert.alert(
                'Send Attachment',
                'Choose an option',
                [
                  { text: 'Photo from Gallery', onPress: pickImage },
                  { text: 'Take Photo', onPress: takePhoto },
                  { text: 'Document', onPress: pickDocument },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          >
            <AttachmentIcon width={24} height={24} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            placeholder="Type a message"
            value={message}
            onChangeText={setMessage}
            placeholderTextColor="#999"
            multiline
          />
          
          {isRecording ? (
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: 'red' }]}
              onPress={stopRecording}
            >
              <Text style={{ color: 'white' }}>Stop</Text>
            </TouchableOpacity>
          ) : message.trim() === '' ? (
            <TouchableOpacity
              style={styles.sendButton}
              onPress={startRecording}
            >
              <MicIcon width={24} height={24} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: '#4169E1' }]}
              onPress={sendMessage}
            >
              <SendIcon width={24} height={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default StudentPageMessage;