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
// import Home from "../../../../assets/MentorPage/backarrow.svg";
import AttachmentIcon from '../../../../assets/Genreal/messages/attachmentIcon.svg';
import MicIcon from '../../../../assets/Genreal/messages/micIcon.svg';
import SendIcon from '../../../../assets/Genreal/messages/sendIcon.svg';
import DocumentIcon from '../../../../assets/Genreal/messages/icons8-document.svg';
import PreviousIcon from '../../../../assets/Genreal/messages/PrevBtn.svg';
import AudioIcon from '../../../../assets/Genreal/messages/audio-svgrepo-com.svg';
// const Profile = require('../../../../assets/MentorPage/profile.png')
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { API_URL } from '../../../../utils/env.js';
import RNFS from 'react-native-fs';
import RNBlobUtil from 'react-native-blob-util';
import FileViewer from 'react-native-file-viewer';
import mime from 'react-native-mime-types';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { generateAndStoreKeys, getPrivateKey, getPublicKey, deletePrivateKey, clearAllEncryptionKeys } from '../../../../utils/keyManager';
import { getSharedSecretAESKey, encryptText, decryptText } from '../../../../utils/messageEncryption';

const AdminMessageBox = ({ route, navigation }) => {
  const { contact } = route.params;
  // console.log("hi",contact);

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [lastMessageId, setLastMessageId] = useState(0);
  const [isRecording, setRecording] = useState(false);
  const flatListRef = useRef(null);
  const socketRef = useRef(null);
  const sharedSecretRef = useRef(null);

  // Custom function to add messages with deduplication
  const addMessages = (newMessages) => {
    setMessages(prev => {
      const combined = [...prev, ...(Array.isArray(newMessages) ? newMessages : [newMessages])];
      // Remove duplicates based on message_id
      const unique = combined.filter((message, index, self) => 
        index === self.findIndex(m => m.message_id === message.message_id)
      );
      
      if (combined.length !== unique.length) {
        console.log('🔄 Admin - Prevented', combined.length - unique.length, 'duplicate messages');
      }
      
      const sorted = unique.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      console.log('📊 Admin - Total messages after update:', sorted.length);
      return sorted;
    });
  };

  // Debug function to check for duplicates
  const checkForDuplicates = (messageArray) => {
    const ids = messageArray.map(m => m.message_id);
    const uniqueIds = [...new Set(ids)];
    if (ids.length !== uniqueIds.length) {
      console.error('🚨 ADMIN DUPLICATE MESSAGE IDS DETECTED!', {
        total: ids.length,
        unique: uniqueIds.length,
        duplicates: ids.length - uniqueIds.length
      });
    }
    return ids.length === uniqueIds.length;
  };

  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentImageUri, setCurrentImageUri] = useState('');
  const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);
  const [audioPaused, setAudioPaused] = useState(false);
  const [audioDurations, setAudioDurations] = useState({});
  const [audioPositions, setAudioPositions] = useState({});
  const [downloadProgress, setDownloadProgress] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);

  const audioRecorderPlayer = useRef(null);
  const manualTimerRef = useRef(null);
  const recorderState = useRef({ isRunning: false });

  const currentUserRef = useRef(null);


  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('adminData');
        if (storedData) {
          const adminData = JSON.parse(storedData);
          setCurrentUser({ ...adminData, type: 'admin' }); // Add type for consistency
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setIsLoading(false);
      }
    };
    fetchAdminData();

    // Cleanup audio player
    return () => {
      audioRecorderPlayer.current.stopPlayer().catch(() => { });
      audioRecorderPlayer.current.removePlayBackListener();
    };
  }, []);

  // Monitor messages for duplicates
  useEffect(() => {
    if (messages.length > 0) {
      checkForDuplicates(messages);
    }
  }, [messages]);

  // Initialize audio recorder
  useEffect(() => {
    audioRecorderPlayer.current = new AudioRecorderPlayer();

    // Cleanup function
    return () => {
      if (audioRecorderPlayer.current) {
        audioRecorderPlayer.current.stopPlayer().catch(() => { });
        audioRecorderPlayer.current.stopRecorder().catch(() => { });
        audioRecorderPlayer.current.removePlayBackListener();
        audioRecorderPlayer.current.removeRecordBackListener();
      }
      if (manualTimerRef.current) {
        clearInterval(manualTimerRef.current);
      }
    };
  }, []);

  // Fetch all messages between this mentor and student

  const setupEncryption = async (currentUser, otherUser) => {
    try {
      let myPrivateKey = await getPrivateKey(currentUser.id, 'admin');
      if (!myPrivateKey) {
        const { privateKeyHex, publicKeyHex } = await generateAndStoreKeys(currentUser.id, 'admin');
        myPrivateKey = privateKeyHex;
        await fetch(`${API_URL}/api/messages/keys/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: currentUser.id,
            user_type: 'admin',
            public_key: publicKeyHex,
          }),
        });
      }

      const res = await fetch(`${API_URL}/api/keys/${otherUser.receiver_type}/${otherUser.receiver_id}`);
      if (!res.ok) {
        Alert.alert('Encryption Error', "Could not get recipient's key. They may need to open the app once to generate it.");
        return false;
      }
      const theirKeyData = await res.json();
      const theirPublicKey = theirKeyData.public_key;

      const aesKey = getSharedSecretAESKey(myPrivateKey, theirPublicKey);
      sharedSecretRef.current = aesKey;
      return true;
    } catch (error) {
      console.error('Encryption setup failed:', error);
      Alert.alert('Error', 'Could not establish a secure connection.');
      return false;
    }
  };

  const decryptMessages = async (messageList) => {
    if (!sharedSecretRef.current) {
      return messageList.map(msg => ({ ...msg, message_text: msg.message_text ? "[Decryption Key Error]" : null }));
    }
    return messageList.map(msg => {
      if (msg.message_text) {
        return { ...msg, message_text: decryptText(msg.message_text, sharedSecretRef.current) };
      }
      return msg;
    });
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const storedData = await AsyncStorage.getItem('adminData');
        if (!storedData) throw new Error('Admin data not found');
        const adminData = JSON.parse(storedData);
        setCurrentUser(adminData);

        const encryptionReady = await setupEncryption(adminData, contact);
        if (!encryptionReady) {
          setIsLoading(false);
          return;
        }

        socketRef.current = io(API_URL, { transports: ['websocket'] });
        socketRef.current.emit('join', { userId: adminData.id });
        await fetchMessages(adminData);


        socketRef.current.on('receiveMessage', async (data) => {
          const msg = data.message;
          const isCurrentConversation =
            (msg.sender_id === contact.receiver_id && msg.sender_type === contact.receiver_type && msg.receiver_id === adminData.id && msg.receiver_type === 'admin') ||
            (msg.sender_id === adminData.id && msg.sender_type === 'admin' && msg.receiver_id === contact.receiver_id && msg.receiver_type === contact.receiver_type);

          if (!isCurrentConversation) return;

          // Skip if this is our own message (prevent duplicate on sender side)
          if (msg.sender_id === adminData.id && msg.sender_type === 'admin') {
            console.log('🔄 Admin - Skipping own message to prevent duplicate');
            return;
          }

          const [decryptedMsg] = await decryptMessages([msg]);
          console.log('✅ Admin - Adding new received message:', decryptedMsg.message_id);
          addMessages(decryptedMsg);

          if (msg.receiver_id === adminData.id) {
            socketRef.current.emit('markAsRead', {
              messageIds: [msg.message_id],
              receiverId: adminData.id, receiverType: 'admin',
              senderId: msg.sender_id, senderType: msg.sender_type
            });
          }
        });

        socketRef.current.on('messagesRead', (data) => {
          setMessages(prev => prev.map(m => data.messageIds.includes(m.message_id) ? { ...m, is_read: 1 } : m));
        });

      } catch (error) {
        console.error('Initialization failed:', error);
        setIsLoading(false);
      }
    };

    initialize();
    return () => socketRef.current?.disconnect();
  }, [contact]);

  const fetchMessages = async (adminData) => {
    if (!adminData || !sharedSecretRef.current) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/messages/get`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: adminData.id,
          sender_type: 'admin',
          receiver_id: contact.receiver_id,
          receiver_type: contact.receiver_type,
          last_message_id: 0,
        }),
      });
      const data = await response.json();
      if (data.success) {
        const decrypted = await decryptMessages(data.messages);
        console.log('📥 Admin - Fetched messages count:', decrypted.length);
        
        // Use setMessages directly for initial fetch (replace all messages) and sort them
        setMessages(decrypted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));

        const unreadIds = data.messages
          .filter(m => m.is_read === 0 && m.receiver_id === adminData.id)
          .map(m => m.message_id);

        if (unreadIds.length > 0 && socketRef.current) {
          socketRef.current.emit('markAsRead', {
            messageIds: unreadIds,
            receiverId: adminData.id, receiverType: 'admin',
            senderId: contact.receiver_id, senderType: contact.receiver_type
          });
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const [selectedMessages, setSelectedMessages] = useState([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Toggle message selection
  const toggleMessageSelection = (messageId) => {
    setSelectedMessages(prev => {
      if (prev.includes(messageId)) {
        return prev.filter(id => id !== messageId);
      } else {
        return [...prev, messageId];
      }
    });
  };

  // Enter selection mode
  const handleLongPress = (messageId) => {
    setIsSelectMode(true);
    toggleMessageSelection(messageId);
  };

  // Exit selection mode
  const cancelSelection = () => {
    setIsSelectMode(false);
    setSelectedMessages([]);
  };

  // Delete selected messages
  const deleteSelectedMessages = async () => {
    try {
      const response = await fetch(`${API_URL}/api/messages/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message_ids: selectedMessages,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => prev.filter(msg => !selectedMessages.includes(msg.message_id)));
        cancelSelection();
      } else {
        Alert.alert('Error', 'Failed to delete messages');
      }
    } catch (error) {
      console.error('Error deleting messages:', error);
      Alert.alert('Error', 'Failed to delete messages');
    }
  };

  const sendMessage = async () => {
    if (message.trim() === '' || !sharedSecretRef.current || !currentUser) return;

    const encryptedMessage = encryptText(message, sharedSecretRef.current);

    try {
      const response = await fetch(`${API_URL}/api/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: currentUser.id,
          receiver_id: contact.receiver_id,
          sender_type: 'admin',
          receiver_type: contact.receiver_type,
          message_text: encryptedMessage,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage('');
        
        // Add optimistic update for sent message (with decrypted text for display)
        const optimisticMsg = { 
          ...data.message, 
          message_text: message, // Show decrypted version locally
          created_at: new Date().toISOString(),
          is_read: 0
        };
        
        console.log('✅ Admin - Adding optimistic sent message:', optimisticMsg.message_id);
        addMessages(optimisticMsg);
        
        socketRef.current.emit('sendMessage', { to: contact.receiver_id, message: data.message });
      } else {
        Alert.alert('Error', 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const startRecording = async () => {
    if (recorderState.current.isRunning || isRecording) {
      console.warn('⚠️ Recording already in progress. Ignored.');
      return;
    }

    try {
      console.log('🎙️ Starting recording...');
      const result = await audioRecorderPlayer.current.startRecorder();
      recorderState.current.isRunning = true;
      setRecording(true);

      audioRecorderPlayer.current.addRecordBackListener(() => { });
    } catch (error) {
      console.error('❌ Error starting recording:', error);

      try {
        await audioRecorderPlayer.current.stopRecorder();
        audioRecorderPlayer.current.removeRecordBackListener();
      } catch (cleanupError) {
        console.warn('⚠️ Cleanup failed:', cleanupError);
      }

      recorderState.current.isRunning = false;
      setRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!recorderState.current.isRunning) return;

    try {
      console.log('⏹️ Stopping recording...');
      const uri = await audioRecorderPlayer.current.stopRecorder();
      audioRecorderPlayer.current.removeRecordBackListener();

      recorderState.current.isRunning = false;
      setRecording(false);

      await uploadAttachment(
        { uri, name: 'audio.mp3', type: 'audio/mp3' },
        'audio'
      );
    } catch (error) {
      console.error('❌ Error stopping recording:', error);
      recorderState.current.isRunning = false;
      setRecording(false);
    }
  };

  // Fixed audio playback with proper timer updates
  const playAudio = async (audioUri, messageId) => {
    try {
      if (playingAudioId && playingAudioId !== messageId) {
        await stopCurrentAudio();
      }

      if (playingAudioId === messageId && audioPaused) {
        await audioRecorderPlayer.current.resumePlayer();
        setAudioPaused(false);
        return;
      }

      if (playingAudioId === messageId && !audioPaused) {
        await pauseAudio();
        return;
      }

      const localPath = `${RNFS.CachesDirectoryPath}/audio-${messageId}.mp3`;
      const exists = await RNFS.exists(localPath);

      if (!exists) {
        const download = await RNFS.downloadFile({
          fromUrl: audioUri,
          toFile: localPath,
        }).promise;

        if (download.statusCode !== 200) {
          Alert.alert('Error', 'Audio download failed');
          return;
        }
      }

      await audioRecorderPlayer.current.stopPlayer(); // reset any previous playback
      audioRecorderPlayer.current.removePlayBackListener(); // clear old listeners
      const msgId = messageId;

      await audioRecorderPlayer.current.startPlayer(localPath);
      await audioRecorderPlayer.current.setVolume(1.0);

      setPlayingAudioId(msgId);
      setAudioPaused(false);

      console.log(audioRecorderPlayer.current.addPlayBackListener);


      audioRecorderPlayer.current.addPlayBackListener((e) => {
        const current = Math.floor((e.currentPosition ?? e.position ?? 0) / 1000);
        const total = Math.floor(e.duration / 1000);

        // console.log('⏱️ Playing:', current, total);
        // console.log("duration: ",e.duration,"position : ", e.currentPosition);


        if (current !== audioPositions[msgId]) {
          setAudioPositions((prev) => ({ ...prev, [msgId]: current }));
        }

        if (!audioDurations[msgId] && total > 0) {
          setAudioDurations((prev) => ({ ...prev, [msgId]: total }));
        }
        // console.log('⏱️ Playing:', e.current_position, e.duration);
        if (e.currentPosition !== 0 && e.duration !== 0 && e.currentPosition >= e.duration - 200) {
          // Let player stop before UI reset
          setTimeout(async () => {
            await audioRecorderPlayer.current.stopPlayer();
            audioRecorderPlayer.current.removePlayBackListener();
            setPlayingAudioId(null);
            setAudioPaused(false);
            setAudioPositions((prev) => ({ ...prev, [msgId]: 0 }));
          }, 100);
        }
      });
    } catch (error) {
      console.error('Audio play error:', error);
      await stopCurrentAudio();
    }
  };


  const stopCurrentAudio = async () => {
    try {
      await audioRecorderPlayer.current.stopPlayer();
      audioRecorderPlayer.current.removePlayBackListener();
      setPlayingAudioId(null);
      setAudioPaused(false);
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };


  const pauseAudio = async () => {
    try {
      await audioRecorderPlayer.current.pausePlayer();
      setAudioPaused(true);
      if (manualTimerRef.current) {
        clearInterval(manualTimerRef.current);
      }
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  };

  // Improved AudioTimer component
  const AudioTimer = ({ messageId, audioPositions, audioDurations, isSent }) => {
    const position = audioPositions[messageId] || 0;
    const duration = audioDurations[messageId] || 0;

    const formatTime = (seconds) => {
      if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
      <Text style={[{ marginLeft: 8, color: '#555', fontSize: 12 }, isSent ? styles.sentText : styles.receivedText]}>
        {`${formatTime(position)} / ${formatTime(duration)}`}
      </Text>
    );
  };

  // Rest of your existing functions (permissions, file handling, etc.)
  const requestSaveImagePermission = async () => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          {
            title: 'Permission Required',
            message: 'App needs access to your images to save photos.',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Permission Required',
            message: 'App needs access to your storage to save photos.',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
    return true;
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

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'App needs camera access to take photos',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
      return;
    }
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: true,
      });

      if (result.didCancel) return;
      if (result.errorCode) {
        console.error('Camera error:', result.errorMessage);
        Alert.alert('Camera Error', result.errorMessage || 'Could not open camera');
        return;
      }
      if (result.assets && result.assets.length > 0) {
        await uploadAttachment(result.assets[0], 'image');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Could not open camera');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.doc, DocumentPicker.types.docx,
        DocumentPicker.types.xls, DocumentPicker.types.xlsx],
      });

      const file = {
        name: result.name,
        uri: result.uri,
        type: result.type
      };

      console.log('📄 Picked doc:', file);
      await uploadAttachment(file, 'document');

    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error('Error picking document:', err);
        Alert.alert('Error', 'Could not select document');
      }
    }
  };

  const uploadAttachment = async (file, fileType) => {
    if (!currentUser) return;
    let fileUri = file.uri;
    try {
      if (Platform.OS === 'android' && fileUri.startsWith('content://')) {
        const destPath = `${RNBlobUtil.fs.dirs.CacheDir}/${file.name || 'tempfile'}`;
        await RNBlobUtil.fs.cp(fileUri, destPath);
        fileUri = 'file://' + destPath;
      }

      const res = await RNBlobUtil.fetch(
        'POST',
        `${API_URL}/api/messages/send-attachment`,
        { 'Content-Type': 'multipart/form-data' },
        [
          { name: 'file', filename: file.name || 'attachment', type: file.type, data: RNBlobUtil.wrap(fileUri.replace('file://', '')) },
          { name: 'sender_id', data: String(currentUser.id) },
          { name: 'receiver_id', data: String(contact.receiver_id) },
          { name: 'sender_type', data: 'admin' },
          { name: 'receiver_type', data: String(contact.receiver_type) }
        ]
      );

      const data = JSON.parse(res.data);
      if (data.success) {
        setMessage('');
        
        console.log('✅ Admin - Adding attachment message:', data.message.message_id);
        addMessages(data.message);
        
        socketRef.current.emit('sendMessage', { to: contact.receiver_id, message: data.message });
      } else {
        Alert.alert('Error', 'Failed to send attachment');
      }
    } catch (error) {
      console.error('Error uploading attachment:', error);
    }
  };

  const CustomCheckBox = ({ checked, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: checked ? '#4169E1' : '#ccc',
        backgroundColor: checked ? '#4169E1' : 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
      }}
    >
      {checked && (
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>✓</Text>
      )}
    </TouchableOpacity>
  );

  useEffect(() => {
    AsyncStorage.getItem('adminData').then(data => {
      if (data) {
        setCurrentUser(JSON.parse(data));
      }
    });
  }, []);

  const renderMessage = ({ item }) => {
    const isSent = currentUser && item.sender_id === currentUser.id && item.sender_type === 'admin';
    const isSelected = selectedMessages.includes(item.message_id);

    return (
      <TouchableOpacity
        onLongPress={() => handleLongPress(item.message_id)}
        onPress={() => {
          if (isSelectMode) {
            toggleMessageSelection(item.message_id);
          }
        }}
        activeOpacity={0.7}
      >
        <View style={[
          styles.messageWrapper,
          isSelected && styles.selectedMessageWrapper
        ]}>
          {item.time && (
            <View style={{ width: '100%', alignItems: 'center' }}>
              <Text style={styles.timeStamp}>{item.time}</Text>
            </View>
          )}

          <View style={[styles.messageContainer, isSent ? styles.sentMessage : styles.receivedMessage]}>
            {/* Selection Mode Checkbox */}
            {isSelectMode && (
              <View style={[
                styles.checkboxContainer,
                isSent ? styles.checkboxRight : styles.checkboxLeft
              ]}>
                <CustomCheckBox
                  checked={isSelected}
                  onPress={() => toggleMessageSelection(item.message_id)}
                />
              </View>
            )}

            <View style={[
              styles.messageBubble,
              isSent ? styles.sentBubble : styles.receivedBubble,
              isSelected && styles.selectedMessageBubble
            ]}>
              {item.message_text && (
                <Text style={[styles.messageText, isSent ? styles.sentText : styles.receivedText]}>
                  {item.message_text}
                </Text>
              )}

              {item.attachment_path && (
                <>
                  {item.attachment_type === 'image' ? (
                    <TouchableOpacity
                      onPress={async () => {
                        const uri = `${API_URL}/uploads${item.attachment_path}`;
                        const hasPermission = await requestSaveImagePermission();
                        if (!hasPermission) {
                          Alert.alert('Permission Denied', 'Cannot save image without permission.');
                          return;
                        }
                        setCurrentImageUri(uri);
                        setImageViewerVisible(true);
                      }}
                    >
                      <Image
                        source={{ uri: `${API_URL}/uploads${item.attachment_path}` }}
                        style={styles.messageImage}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  ) : item.attachment_type === 'audio' ? (
                    <TouchableOpacity
                      style={[
                        styles.audioAttachment,
                        playingAudioId === item.message_id && !audioPaused && { backgroundColor: '#e0f7fa' }
                      ]}
                      activeOpacity={0.7}
                      onPress={() => playAudio(`${API_URL}/uploads${item.attachment_path}`, item.message_id)}
                    >
                      {playingAudioId === item.message_id ? (
                        audioPaused ? (
                          <Text style={{ marginRight: 8 }}>▶️</Text>
                        ) : (
                          <Text style={{ marginRight: 8 }}>⏸️</Text>
                        )
                      ) : (
                        <Text style={{ marginRight: 8 }}>▶️</Text>
                      )}
                      <AudioIcon width={24} height={24} />
                      <Text style={[styles.audioText, isSent ? styles.sentText : styles.receivedText]}>
                        {playingAudioId === item.message_id
                          ? audioPaused
                            ? 'Paused'
                            : 'Playing...'
                          : 'Audio Message'}
                      </Text>
                      <AudioTimer
                        messageId={item.message_id}
                        audioPositions={audioPositions}
                        audioDurations={audioDurations}
                        isSent={isSent}
                      />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.documentAttachment}
                      onPress={() => downloadAndOpenDocument(
                        `${API_URL}/uploads${item.attachment_path}`,
                        item.attachment_path.split('/').pop()
                      )}
                    >
                      <DocumentIcon width={24} height={24} />
                      <Text style={[styles.documentText, isSent ? styles.sentText : styles.receivedText]}>
                        {item.attachment_path.split('/').pop()}
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              <View>
                {/* The important part to check is the read receipt */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 9 }}>
                  <Text style={[styles.messageTime, isSent ? styles.sentTime : styles.receivedTime]}>
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  {isSent && (
                    <Text style={[styles.messageTime, isSent ? styles.sentTime : styles.receivedTime]}>
                      {item.is_read ? 'Read' : 'Unread'}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };


  // Add your existing document and image download functions here...
  const requestStoragePermission = async (fileType = 'other') => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        if (fileType === 'image') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            {
              title: 'Permission Required',
              message: 'App needs access to your images to save photos.',
              buttonPositive: 'OK',
            }
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to your storage to save files.',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
    return true;
  };

  const downloadAndOpenDocument = async (fileUrl, fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const isPdf = ext === 'pdf';
    const localFile = `${RNFS.DocumentDirectoryPath}/${fileName}`;

    const downloadAndOpen = async () => {
      const hasPermission = await requestStoragePermission('other');
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Cannot save file without permission.');
        return;
      }
      setDownloadProgress(0);
      try {
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
      } catch (err) {
        setDownloadProgress(null);
        Linking.openURL(fileUrl);
        console.error('File open error:', err);
      }
    };

    if (isPdf) {
      Alert.alert('PDF Options', 'What do you want to do?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Just View',
          onPress: async () => {
            Linking.openURL(fileUrl);
          }
        },
        {
          text: 'Download',
          onPress: downloadAndOpen
        }
      ]);
    } else {
      Alert.alert('Download', 'Do you want to download and open this file?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: downloadAndOpen
        }
      ]);
    }
  };

  const downloadAndOpenImage = async (fileUrl, fileName) => {
    const localFile = `${RNFS.DownloadDirectoryPath}/${fileName}`;

    try {
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      {isSelectMode ? (
        <View style={styles.selectionHeader}>
          <TouchableOpacity onPress={cancelSelection}>
            <Text style={{ color: 'white' }}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.selectionText}>
            {selectedMessages.length} selected
          </Text>
          <TouchableOpacity
            style={styles.selectionButton}
            onPress={deleteSelectedMessages}
          >
            <Text style={styles.selectionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <PreviousIcon width={24} height={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {contact.receiver_name}
          </Text>
        </View>
      )}

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
            keyExtractor={(item, index) => {
              // Double-check for unique keys
              const key = `${item.message_id}-${index}`;
              return key;
            }}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => {
              // Check for duplicates before scrolling
              checkForDuplicates(messages);
              flatListRef.current?.scrollToEnd({ animated: true });
            }}
            extraData={{ audioPositions, audioDurations, selectedMessages }}
            removeClippedSubviews={false}
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
            onPress={() => setAttachmentModalVisible(true)}
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
      <Modal
        visible={attachmentModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAttachmentModalVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'flex-end',
          }}
          activeOpacity={1}
          onPressOut={() => setAttachmentModalVisible(false)}
        >
          <View style={{
            backgroundColor: '#fff',
            padding: 20,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}>
            <TouchableOpacity style={{ padding: 12 }} onPress={() => { setAttachmentModalVisible(false); pickImage(); }}>
              <Text style={{ fontSize: 16 }}>Photo from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 12 }} onPress={() => { setAttachmentModalVisible(false); takePhoto(); }}>
              <Text style={{ fontSize: 16 }}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 12 }} onPress={() => { setAttachmentModalVisible(false); pickDocument(); }}>
              <Text style={{ fontSize: 16 }}>Document</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 12 }} onPress={() => setAttachmentModalVisible(false)}>
              <Text style={{ fontSize: 16, color: 'red' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={imageViewerVisible} transparent={true} onRequestClose={() => setImageViewerVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 40, right: 20, zIndex: 2, backgroundColor: '#fff', padding: 8, borderRadius: 20 }}
            onPress={async () => {
              // console.log(currentImageUri);
              try {
                const filename = currentImageUri.split('/').pop();
                downloadAndOpenImage(currentImageUri, filename)
              } catch (error) {
                Alert.alert('Error', 'Could not save image');
                console.error('Image download error:', error);
              }
            }}
          >
            <Text style={{ color: '#4169E1', fontWeight: 'bold' }}>Download</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity style={{ flex: 2 }} onPress={() => setImageViewerVisible(false)}> */}
          <Image
            source={{ uri: currentImageUri }}
            style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
          />
          {/* </TouchableOpacity> */}
        </View>
      </Modal>

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

export default AdminMessageBox;