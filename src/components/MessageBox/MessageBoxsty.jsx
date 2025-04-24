import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  homeIcon: {
    marginRight: 5,
    marginLeft:10,
    marginTop:30,
  },
  activityText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginTop:30,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 80,
  },
  timeStamp: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginVertical: 8,
    alignSelf: 'center', // This ensures the text is centered
    width: '100%',       // Make it take the full width
    position: 'relative',// Position it relative to its normal position
    left: 0,            // Reset any left positioning
  },
  messageContainer: {
    marginBottom: 8,
    maxWidth: '80%',
  },
  sentMessage: {
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    marginVertical: 2,
    maxWidth: '100%',
  },
  sentBubble: {
    backgroundColor: '#4169E1', // Royal blue for sent messages, matching reference image
    borderTopRightRadius: 2,
  },
  receivedBubble: {
    backgroundColor: '#EFEFEF', // Light gray for received messages
    borderTopLeftRadius: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  sentText: {
    color: '#FFFFFF',
  },
  receivedText: {
    color: '#333333',
  },
  messageImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 8,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  attachButton: {
    marginRight: 8,
    padding: 4,
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4169E1', // Royal blue for send button
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
});

export default styles;