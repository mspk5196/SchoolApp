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
  ActivityIndicator,
  Modal,
  Linking,
  PermissionsAndroid,
} from 'react-native';
import styles from './MessageBoxsty';
import AttachmentIcon from '../../../../assets/Genreal/messages/attachmentIcon.svg';
import MicIcon from '../../../../assets/Genreal/messages/micIcon.svg';
import SendIcon from '../../../../assets/Genreal/messages/sendIcon.svg';
import DocumentIcon from '../../../../assets/Genreal/messages/icons8-document.svg';
import PreviousIcon from '../../../../assets/Genreal/messages/PrevBtn.svg';
import AudioIcon from '../../../../assets/Genreal/messages/audio-svgrepo-com.svg';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { API_URL } from '../../../../utils/env.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import RNBlobUtil from 'react-native-blob-util';
import FileViewer from 'react-native-file-viewer';
import mime from 'react-native-mime-types';
import io from 'socket.io-client';

const MentorMessageBox = ({ route, navigation }) => {
  const { contact } = route.params;
  
  // Helper functions to normalize contact field access across different naming conventions
  const getContactId = () => contact.receiver_id || contact.contact_id || contact.user_id;
  const getContactType = () => contact.receiver_type || contact.contact_type || contact.user_type || 'student';
  const getContactName = () => contact.receiver_name || contact.contact_name || contact.name || 'Unknown';

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [lastMessageId, setLastMessageId] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlayingId, setCurrentPlayingId] = useState(null);
  const [isRecording, setRecording] = useState(false);
  const [isAttachmentModalVisible, setAttachmentModalVisible] = useState(false);
  
  const flatListRef = useRef(null);
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer());
  const socketRef = useRef(null);
  const mentorData = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io(API_URL);
    
    const socket = socketRef.current;

    socket.on('receiveMessage', (data) => {
      console.log('📨 Received new message:', data);
      setMessages(prevMessages => [...prevMessages, data.message]);
      scrollToBottom();
    });

    socket.on('messagesRead', (data) => {
      console.log('✅ Messages marked as read:', data);
      if (data.messageIds) {
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            data.messageIds.includes(msg.message_id)
              ? { ...msg, is_read: 1 }
              : msg
          )
        );
      }
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Load mentor data and initialize
  useEffect(() => {
    const initializeMentor = async () => {
      try {
        console.log('🚀 Initializing mentor message page...');
        const storedData = await AsyncStorage.getItem('mentorData');
        
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            const currentMentor = parsedData[0];
            console.log('👤 Current mentor loaded:', currentMentor);
            mentorData.current = currentMentor;
            
            // Join socket room with mentor ID
            if (socketRef.current && currentMentor.id) {
              socketRef.current.emit('join', currentMentor.id);
              console.log('🔌 Socket joined with mentor ID:', currentMentor.id);
            }
            
            // Fetch messages
            await fetchMessages();
          }
        }
      } catch (error) {
        console.error('❌ Error initializing mentor:', error);
        Alert.alert('Error', 'Failed to load mentor data');
      }
    };

    initializeMentor();
  }, []);

  const fetchMessages = async () => {
    try {
      console.log('📥 Fetching messages...');
      const currentMentor = mentorData.current;
      const contactId = getContactId();
      const contactType = getContactType();
      
      if (!currentMentor?.id || !contactId) {
        console.error('❌ Missing mentor or contact data');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/messages/get`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: currentMentor.id,
          receiver_id: contactId,
          sender_type: 'mentor',
          receiver_type: contactType,
          last_message_id: lastMessageId
        })
      });

      const data = await response.json();
      if (data.success) {
        console.log('📥 Raw messages from server:', data.messages.length);
        setMessages(data.messages);
        
        if (data.messages.length > 0) {
          setLastMessageId(Math.max(...data.messages.map(m => m.message_id)));
        }
        
        scrollToBottom();
      } else {
        console.error('❌ Failed to fetch messages:', data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    const currentMentor = mentorData.current;
    const contactId = getContactId();
    const contactType = getContactType();
    
    if (!currentMentor?.id || !contactId) {
      Alert.alert('Error', 'Missing mentor or contact data');
      return;
    }

    const messageData = {
      sender_id: currentMentor.id,
      receiver_id: contactId,
      sender_type: 'mentor',
      receiver_type: contactType,
      message_text: message.trim()
    };

    try {
      // Add optimistic message to UI
      const optimisticMessage = {
        message_id: Date.now(),
        ...messageData,
        created_at: new Date().toISOString(),
        is_read: 0
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      setMessage('');
      scrollToBottom();

      // Send to server
      const response = await fetch(`${API_URL}/api/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });

      const data = await response.json();
      if (data.success) {
        // Update with server response
        setMessages(prev => 
          prev.map(msg => 
            msg.message_id === optimisticMessage.message_id 
              ? data.message 
              : msg
          )
        );
        
        // Emit via socket for real-time delivery
        if (socketRef.current) {
          socketRef.current.emit('sendMessage', { 
            to: contactId, 
            message: data.message 
          });
        }
      } else {
        // Remove optimistic message on failure
        setMessages(prev => 
          prev.filter(msg => msg.message_id !== optimisticMessage.message_id)
        );
        Alert.alert('Error', 'Failed to send message');
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const sendAttachment = async (fileUri, fileName, fileType) => {
    const currentMentor = mentorData.current;
    const contactId = getContactId();
    const contactType = getContactType();
    
    if (!currentMentor?.id || !contactId) {
      Alert.alert('Error', 'Missing mentor or contact data');
      return;
    }

    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: mime.lookup(fileName) || 'application/octet-stream',
      name: fileName,
    });
    formData.append('sender_id', currentMentor.id);
    formData.append('receiver_id', contactId);
    formData.append('sender_type', 'mentor');
    formData.append('receiver_type', contactType);

    try {
      const response = await fetch(`${API_URL}/api/messages/send-attachment`, {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
        
        // Emit via socket for real-time delivery
        if (socketRef.current) {
          socketRef.current.emit('sendMessage', { 
            to: contactId, 
            message: data.message 
          });
        }
      } else {
        Alert.alert('Error', 'Failed to send attachment');
      }
    } catch (error) {
      console.error('❌ Error sending attachment:', error);
      Alert.alert('Error', 'Failed to send attachment');
    }
  };

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays <= 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderMessage = ({ item, index }) => {
    const isMe = item.sender_type === 'mentor';
    const showTime = index === 0 || 
      (messages[index - 1] && 
       new Date(item.created_at).getMinutes() !== new Date(messages[index - 1].created_at).getMinutes());

    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.theirMessage]}>
        {item.message_text && (
          <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
            {item.message_text}
          </Text>
        )}
        
        {item.attachment_path && (
          <TouchableOpacity
            style={styles.attachmentContainer}
            onPress={() => handleAttachmentPress(item)}
          >
            {item.attachment_type === 'image' && (
              <Image 
                source={{ uri: `${API_URL}${item.attachment_path}` }} 
                style={styles.attachmentImage} 
              />
            )}
            {item.attachment_type === 'audio' && (
              <View style={styles.audioContainer}>
                <AudioIcon width={24} height={24} />
                <Text style={styles.audioText}>Audio Message</Text>
              </View>
            )}
            {item.attachment_type === 'pdf' && (
              <View style={styles.documentContainer}>
                <DocumentIcon width={24} height={24} />
                <Text style={styles.documentText}>Document</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        
        {showTime && (
          <Text style={[styles.messageTime, isMe ? styles.myMessageTime : styles.theirMessageTime]}>
            {formatDate(item.created_at)}
          </Text>
        )}
      </View>
    );
  };

  const handleAttachmentPress = async (message) => {
    if (message.attachment_type === 'image') {
      Linking.openURL(`${API_URL}${message.attachment_path}`);
    } else if (message.attachment_type === 'pdf') {
      try {
        const localFile = `${RNFS.DocumentDirectoryPath}/temp_document.pdf`;
        const download = await RNBlobUtil.config({
          fileCache: true,
          path: localFile
        }).fetch('GET', `${API_URL}${message.attachment_path}`);
        
        await FileViewer.open(download.path());
      } catch (error) {
        Alert.alert('Error', 'Could not open document');
      }
    } else if (message.attachment_type === 'audio') {
      handleAudioPlayback(message);
    }
  };

  const handleAudioPlayback = async (message) => {
    try {
      if (currentPlayingId === message.message_id) {
        await audioRecorderPlayer.current.stopPlayer();
        setCurrentPlayingId(null);
      } else {
        await audioRecorderPlayer.current.stopPlayer();
        await audioRecorderPlayer.current.startPlayer(`${API_URL}${message.attachment_path}`);
        setCurrentPlayingId(message.message_id);
        
        audioRecorderPlayer.current.addPlayBackListener((e) => {
          if (e.currentPosition === e.duration) {
            setCurrentPlayingId(null);
          }
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Could not play audio');
    }
  };

  const selectImage = () => {
    setAttachmentModalVisible(false);
    Alert.alert(
      "Select Image",
      "Choose from where you want to select an image",
      [
        { text: "Camera", onPress: openCamera },
        { text: "Gallery", onPress: openGallery },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const openCamera = () => {
    launchCamera({ mediaType: 'photo', quality: 0.7 }, (response) => {
      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        sendAttachment(asset.uri, asset.fileName, 'image');
      }
    });
  };

  const openGallery = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, (response) => {
      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        sendAttachment(asset.uri, asset.fileName, 'image');
      }
    });
  };

  const selectDocument = async () => {
    setAttachmentModalVisible(false);
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.doc, DocumentPicker.types.docx]
      });
      
      if (result[0]) {
        sendAttachment(result[0].uri, result[0].name, 'pdf');
      }
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        Alert.alert('Error', 'Failed to select document');
      }
    }
  };

  const startRecording = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        const path = `${RNFS.DocumentDirectoryPath}/audio_${Date.now()}.mp4`;
        await audioRecorderPlayer.current.startRecorder(path);
        setRecording(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.current.stopRecorder();
      setRecording(false);
      
      if (result) {
        const fileName = `audio_${Date.now()}.mp4`;
        sendAttachment(result, fileName, 'audio');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <PreviousIcon width={24} height={24} />
        </TouchableOpacity>
        
        <View style={styles.contactInfo}>
          <Image 
            source={
              contact.profile 
                ? { uri: `${API_URL}/${contact.profile}` }
                : require('../../../../assets/MentorPage/profile.png')
            } 
            style={styles.profileImage} 
          />
          <Text style={styles.contactName}>{getContactName()}</Text>
        </View>
        
        <View style={styles.headerRight} />
      </View>

      {/* Messages List */}
      <KeyboardAvoidingView 
        style={styles.messagesContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.message_id.toString()}
          style={styles.messagesList}
          onContentSizeChange={scrollToBottom}
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.attachmentButton}
            onPress={() => setAttachmentModalVisible(true)}
          >
            <AttachmentIcon width={24} height={24} />
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            multiline
            maxLength={1000}
          />

          {message.trim() ? (
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <SendIcon width={24} height={24} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.micButton}
              onPressIn={startRecording}
              onPressOut={stopRecording}
            >
              <MicIcon width={24} height={24} />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Attachment Modal */}
      <Modal
        visible={isAttachmentModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAttachmentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.attachmentModal}>
            <TouchableOpacity style={styles.attachmentOption} onPress={selectImage}>
              <Text style={styles.attachmentOptionText}>📷 Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachmentOption} onPress={selectDocument}>
              <Text style={styles.attachmentOptionText}>📄 Document</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.attachmentOption} 
              onPress={() => setAttachmentModalVisible(false)}
            >
              <Text style={styles.attachmentOptionText}>❌ Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MentorMessageBox;