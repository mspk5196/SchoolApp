import React, { useState, useEffect, useRef } from 'react';
import { View,  Text,  Image,  SafeAreaView,  TouchableOpacity,  TextInput,  FlatList,  KeyboardAvoidingView,  Platform,} from 'react-native';
import styles from './MessageBoxsty';
import Home from           "../../../../assets/MentorPage/backarrow.svg";
import AttachmentIcon from '../../../../assets/MentorPage/attachmentIcon.svg';
import MicIcon from        '../../../../assets/MentorPage/micIcon.svg';
import SendIcon from       '../../../../assets/MentorPage/sendIcon.svg';


const MentorMessageBox = ({ route, navigation }) => {
    const contact = route?.params?.contact ?? { name: 'Unknown', subject: 'N/A' };
    const [message, setMessage] = useState('');
    const flatListRef = useRef(null);
  
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Thank you',
      time: 'Today 12:30 PM',
      sent: false,
    },
    {
      id: '2',
      text: 'Good Morning',
      time: '',
      sent: false,
    },
    {
      id: '3',
      text: 'As informed earlier, today we conducted parent-teacher meeting',
      time: '',
      sent: false,
    },
    {
      id: '4',
      text: "Yes ma'am i was unable attend the meeting, can i meet you tomorrow",
      time: '',
      sent: true,
    },
    {
      id: '5',
      text: "Ok ma'am you can meet me by 4:30 tomorrow in school campus",
      time: '',
      sent: false,
    },
    {
      id: '6',
      text: "Ok ma'am will meet tomorrow",
      time: '',
      sent: true,
    },
    {
      id: '7',
      text: 'Sports event 2K24 - 23/02/24',
      time: 'Today 12:30 PM',
      sent: false,
      image: require('../../../../assets/MentorPage/profile.png'), // Add this image to your assets
    },
  ]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages]);

  const renderMessage = ({ item, index }) => {
    return (
      <View key={item.id}>
        {/* Timestamp - rendered as a separate full-width view */}
        {item.time && (
          <View style={{ width: '100%', alignItems: 'center' }}>
            <Text style={styles.timeStamp}>{item.time}</Text>
          </View>
        )}
        
        {/* Message bubble */}
        <View
          style={[
            styles.messageContainer,
            item.sent ? styles.sentMessage : styles.receivedMessage,
          ]}>
          <View
            style={[
              styles.messageBubble,
              item.sent ? styles.sentBubble : styles.receivedBubble,
            ]}>
            <Text
              style={[
                styles.messageText,
                item.sent ? styles.sentText : styles.receivedText,
              ]}>
              {item.text}
            </Text>
            {item.image && (
              <Image source={item.image} style={styles.messageImage} />
            )}
          </View>
        </View>
      </View>
    );
  };

  const sendMessage = () => {
    if (message.trim() === '') return;

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const timeString = `Today ${displayHours}:${minutes} ${ampm}`;

    const newMessage = {
      id: (messages.length + 1).toString(),
      text: message,
      time: '',
      sent: true,
    };

    setMessages([...messages, newMessage]);
    setMessage('');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.activityHeader}>
        <TouchableOpacity onPress={() =>navigation.goBack()}>
            <Home height={24} width={24} style={styles.homeIcon} />
        </TouchableOpacity>
        <Text style={styles.activityText}>
          {contact.name} ({contact.subject})
        </Text>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={styles.messagesContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => 
            flatListRef.current.scrollToEnd({ animated: true })
          }
        />

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <AttachmentIcon width={28} height={28} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type a message"
            value={message}
            onChangeText={setMessage}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              message.trim() === '' ? {} : { backgroundColor: '#4169E1' }
            ]}
            onPress={sendMessage}>
            {message.trim() === '' ? (
              <MicIcon width={24} height={24} />
            ) : (
              <SendIcon width={24} height={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MentorMessageBox;