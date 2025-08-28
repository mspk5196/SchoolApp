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
  PermissionsAndroid,
  Modal,
  Linking
} from 'react-native';
import styles from './Messagestyles';
import PreviousIcon from '../../../../assets/ParentPage/LeaveIcon/PrevBtn.svg';
import AttachmentIcon from '../../../../assets/ParentPage/phonebook/attachmentIcon.svg';
import MicIcon from '../../../../assets/ParentPage/phonebook/micIcon.svg';
import SendIcon from '../../../../assets/ParentPage/phonebook/sendIcon.svg';
import DocumentIcon from '../../../../assets/ParentPage/phonebook/icons8-document.svg';
import AudioIcon from '../../../../assets/ParentPage/phonebook/audio-svgrepo-com.svg';
const Profile = require('../../../../assets/ParentPage/Profilepageicons/profile.png')
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { io } from 'socket.io-client';
import DocumentPicker from 'react-native-document-picker';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { API_URL } from '../../../../utils/env.js';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';
import RNBlobUtil from 'react-native-blob-util';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CheckBox } from 'react-native-elements';
import mime from 'react-native-mime-types';

const StudentPageMessage = ({ route, navigation }) => {
  const { contact } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastMessageId, setLastMessageId] = useState(0);
  const [isRecording, setRecording] = useState(false);
  const flatListRef = useRef(null);
  const studentData = useRef(null);
  const socketRef = useRef(null);
  const sharedSecretRef = useRef(null); // To cache the AES key

  // Custom function to add messages with deduplication
  const addMessages = (newMessages) => {
    setMessages(prev => {
      const combined = [...prev, ...(Array.isArray(newMessages) ? newMessages : [newMessages])];
      // Remove duplicates based on message_id
      const unique = combined.filter((message, index, self) => 
        index === self.findIndex(m => m.message_id === message.message_id)
      );
      
      if (combined.length !== unique.length) {
        console.log('🔄 Prevented', combined.length - unique.length, 'duplicate messages');
      }
      
      const sorted = unique.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      console.log('📊 Total messages after update:', sorted.length);
      return sorted;
    });
  };

  // Debug function to check for duplicates
  const checkForDuplicates = (messageArray) => {
    const ids = messageArray.map(m => m.message_id);
    const uniqueIds = [...new Set(ids)];
    if (ids.length !== uniqueIds.length) {
      console.error('🚨 DUPLICATE MESSAGE IDS DETECTED!', {
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

  const audioRecorderPlayer = useRef(null);
  const manualTimerRef = useRef(null);
  const recorderState = useRef({ isRunning: false });

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


  useEffect(() => {
    console.log("🔄 useEffect triggered - currentUser:", studentData);
    
    const initialize = async () => {
      try {
        console.log("🚀 Initializing student message page...");
        
        const storedData = await AsyncStorage.getItem('studentData');
        console.log("📱 Retrieved stored data:", storedData ? "Found" : "Not found");
        console.log("📱 Raw stored data:", storedData);
        
        if (!storedData) throw new Error('Student data not found');
        const parsedData = JSON.parse(storedData);
        console.log("📱 Parsed data structure:", JSON.stringify(parsedData, null, 2));
        
        const currentUser = parsedData[0];
        
        if (!currentUser) {
          throw new Error('No user data in stored array');
        }
        
        if (!currentUser.student_id && !currentUser.id) {
          console.error("❌ No student_id or id field found in user data");
          throw new Error('Student ID missing from user data');
        }
        
        // Create a function to find the best ID field
        const findStudentId = (user) => {
          const possibleFields = ['student_id', 'id', 'studentId', 'Id', 'roll'];
          for (const field of possibleFields) {
            if (user[field] && typeof user[field] === 'number') {
              console.log(`🔧 Found valid ID in field '${field}':`, user[field]);
              return user[field];
            }
          }
          return null;
        };
        
        const foundId = findStudentId(currentUser);
        if (!foundId) {
          console.error("❌ No valid numeric ID field found in user data");
          throw new Error('No valid student ID found in user data');
        }
        
        // Ensure student_id is set
        if (!currentUser.student_id) {
          console.log("🔧 Setting student_id to:", foundId);
          currentUser.student_id = foundId;
        }
        
        studentData.current = currentUser;
        
        // Final validation before encryption setup
        if (!currentUser.student_id || typeof currentUser.student_id !== 'number') {
          console.error("❌ Cannot proceed: student_id is invalid:", {
            value: currentUser.student_id,
            type: typeof currentUser.student_id
          });
          Alert.alert('Error', 'Student ID is invalid. Please restart the app and try again.');
          setIsLoading(false);
          return;
        }
        
        console.log("✅ Final validation passed - Student ID:", currentUser.student_id);
        
        socketRef.current = io(API_URL, { transports: ['websocket'] });
        if (currentUser.student_id) {
          socketRef.current.emit('join', { userId: currentUser.student_id });
          console.log("🔌 Socket joined with user ID:", currentUser.student_id);
        } else {
          console.error("❌ Cannot join socket - student_id is undefined");
        }

        await fetchMessages();

        socketRef.current.on('receiveMessage', async (data) => {
          const msg = data.message;
          const isCurrentConversation =
            (msg.sender_id === contact.mentor_id && msg.sender_type === 'mentor') ||
            (msg.receiver_id === contact.mentor_id && msg.receiver_type === 'mentor');

          if (!isCurrentConversation) return;

          // Skip if this is our own message (prevent duplicate on sender side)
          if (msg.sender_id === currentUser.student_id && msg.sender_type === 'student') {
            console.log('🔄 Skipping own message to prevent duplicate');
            return;
          }

          const [decryptedMsg] = ([msg]);
          
          addMessages(decryptedMsg);

          if (msg.receiver_id === currentUser.student_id) {
            socketRef.current.emit('markAsRead', {
              messageIds: [msg.message_id],
              receiverId: currentUser.student_id, receiverType: 'student',
              senderId: msg.sender_id, senderType: msg.sender_type
            });
          }
        });

        socketRef.current.on('messagesRead', (data) => {
          setMessages(prev => prev.map(m => data.messageIds.includes(m.message_id) ? { ...m, is_read: 1 } : m));
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Initialization failed:', error);
        setIsLoading(false);
      }
    };

    initialize();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      audioRecorderPlayer.current.stopPlayer().catch(() => { });
    };
  }, [contact]);

  const fetchMessages = async () => {
    if (!studentData.current) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/messages/get`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: studentData.current.student_id,
          sender_type: 'student',
          receiver_id: contact.mentor_id,
          receiver_type: 'mentor',
          last_message_id: 0,
        }),
      });
      const data = await response.json();
      if (data.success) {
        console.log('📥 Raw messages from server:', data.messages.length);
        
        // Log some sample message data for debugging
        if (data.messages.length > 0) {
          data.messages.slice(0, 3).forEach((msg, index) => {
            console.log(`🔍 Sample message ${index + 1}:`, {
              id: msg.message_id,
              hasText: !!msg.message_text,
              textLength: msg.message_text ? msg.message_text.length : 0,
              textStart: msg.message_text ? msg.message_text.substring(0, 50) + '...' : 'null',
              attachment: !!msg.attachment_path
            });
          });
        }
        
        setMessages(data.messages);


        const unreadIds = data.messages
          .filter(m => m.is_read === 0 && m.receiver_id === studentData.current.student_id)
          .map(m => m.message_id);

        if (unreadIds.length > 0 && socketRef.current) {
          socketRef.current.emit('markAsRead', {
            messageIds: unreadIds,
            receiverId: studentData.current?.student_id, 
            receiverType: 'student',
            senderId: contact.mentor_id, 
            senderType: 'mentor'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (studentData.current?.student_id && contact?.id) {
      fetchMessages();
    }
  }, [studentData, contact]);

  // Monitor messages for duplicates
  useEffect(() => {
    if (messages.length > 0) {
      checkForDuplicates(messages);
    }
  }, [messages]);

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
    if (message.trim() === '') return;

    try {
      const response = await fetch(`${API_URL}/api/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: studentData.current.student_id,
          receiver_id: contact.mentor_id,
          sender_type: 'student',
          receiver_type: 'mentor',
          message_text: message,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage('');
        
        // Add optimistic update for sent message (with decrypted text for display)
        const optimisticMsg = { 
          ...data.message, 
          message_text: message,
          created_at: new Date().toISOString(),
          is_read: 0
        };
        
        console.log('✅ Adding optimistic sent message:', optimisticMsg.message_id);
        addMessages(optimisticMsg);
        
        socketRef.current.emit('sendMessage', { to: contact.mentor_id, message: data.message });
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
  const AudioTimer = ({ messageId, audioPositions, audioDurations }) => {
    const position = audioPositions[messageId] || 0;
    const duration = audioDurations[messageId] || 0;

    const formatTime = (seconds) => {
      if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
      <Text style={{ marginLeft: 8, color: '#555', fontSize: 12 }}>
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

  // const uploadAttachment = async (file, fileType) => {
  //   let fileUri = file.uri;

  //   try {
  //     if (Platform.OS === 'android' && fileUri.startsWith('content://')) {
  //       const destPath = `${RNBlobUtil.fs.dirs.CacheDir}/${file.name}`;
  //       await RNBlobUtil.fs.cp(fileUri, destPath);
  //       fileUri = 'file://' + destPath;
  //       console.log('✔ File copied to temp:', fileUri);
  //     }

  //     const res = await RNBlobUtil.fetch(
  //       'POST',
  //       `${API_URL}/api/messages/send-attachment`,
  //       { 'Content-Type': 'multipart/form-data' },
  //       [
  //         {
  //           name: 'file',
  //           filename: file.name || 'file',
  //           type: file.type || `application/${fileType}`,
  //           data: RNBlobUtil.wrap(fileUri.replace('file://', ''))
  //         },
  //         { name: 'sender_id', data: studentData.current.student_id.toString() },
  //         { name: 'receiver_id', data: contact.mentor_id.toString() },
  //         { name: 'sender_type', data: 'student' },
  //         { name: 'receiver_type', data: 'mentor' }
  //       ]
  //     );

  //     const data = JSON.parse(res.data);

  //     if (!data.success) {
  //       Alert.alert('Error', 'Failed to send attachment');
  //     } else if (data.message) {
  //       setMessage('');
  //       setMessages(prev => {
  //         if (prev.some(msg => msg.message_id === data.message.message_id)) return prev;
  //         return [...prev, data.message];
  //       });
  //       setLastMessageId(data.message.message_id);

  //       // Emit socket event if needed
  //       if (socketRef.current) {
  //         socketRef.current.emit('sendMessage', {
  //           to: contact.receiver_id,
  //           message: data.message
  //         });
  //       }

  //       setTimeout(() => {
  //         flatListRef.current?.scrollToEnd({ animated: true });
  //       }, 100);
  //     }
  //   } catch (error) {
  //     console.error('Error uploading attachment:', error);
  //     Alert.alert('Error', 'Failed to send attachment');
  //   }
  // };


  const uploadAttachment = async (file, fileType) => {
    if (!studentData.current) return;
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
          { name: 'sender_id', data: String(studentData.current.student_id) },
          { name: 'receiver_id', data: String(contact.mentor_id) },
          { name: 'sender_type', data: 'student' },
          { name: 'receiver_type', data: 'mentor' }
        ]
      );

      const data = JSON.parse(res.data);
      if (data.success) {
        console.log('✅ Adding attachment message:', data.message.message_id);
        addMessages(data.message);
        socketRef.current.emit('sendMessage', { to: contact.mentor_id, message: data.message });
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

  const renderMessage = ({ item }) => {
    const isSent = item.sender_type === 'student';
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

            {!isSent && (
              <Image
                source={item.sender_profile ? { uri: `${API_URL}/${item.sender_profile}` } : Profile}
                style={styles.profileImage}
              />
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
                      <Text style={styles.audioText}>
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
              {isSent && (
                <Text style={[styles.messageTime, isSent ? styles.sentTime : styles.receivedTime]}>
                  {(item.is_read && item.sender_id == studentData.current?.student_id) ? 'Read' : 'Unread'}
                </Text>
              )}
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
            {contact.mentor_name} ({contact.subject_name})
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

export default StudentPageMessage; 