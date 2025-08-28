import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  sentMessage: {
    justifyContent: 'flex-end',
  },
  receivedMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginLeft: 8,
  },
  sentBubble: {
    backgroundColor: '#4169E1',
    borderBottomRightRadius: 0,
  },
  receivedBubble: {
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
  },
  sentText: {
    color: '#fff',
  },
  receivedText: {
    color: '#333',
  },
  timeStamp: {
    fontSize: 12,
    color: '#999',
    marginVertical: 8,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    marginHorizontal: 8,
    fontSize: 16,
  },
  attachButton: {
    padding: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  audioAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
  },
  audioText: {
    marginLeft: 8,
    fontSize: 14,
  },
  documentAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
  },
  documentText: {
    marginLeft: 8,
    fontSize: 14,
    flexShrink: 1,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  sentTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  receivedTime: {
    color: 'rgba(0,0,0,0.5)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  selectedMessage: {
    backgroundColor: 'rgba(65, 105, 225, 0.2)',
    borderRadius: 8,
    margin: 4,
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#4169E1',
  },
  selectionText: {
    color: 'white',
    fontSize: 16,
  },
  selectionButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  selectionButtonText: {
    color: '#4169E1',
    fontWeight: 'bold',
  },
  // Add the new styles here:
  messageWrapper: {
    marginBottom: 4,
  },
  selectedMessageWrapper: {
    backgroundColor: 'rgba(65, 105, 225, 0.1)',
    borderRadius: 8,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(65, 105, 225, 0.3)',
  },
  checkboxContainer: {
    position: 'absolute',
    zIndex: 10,
    top: 8,
  },
  checkboxLeft: {
    right: 0,
  },
  checkboxRight: {
    left: 0,
  },
  selectedMessageBubble: {
    shadowColor: '#4169E1',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // Update selectedMessage style (you can remove the old one):
  selectedMessage: {
    backgroundColor: 'rgba(65, 105, 225, 0.2)',
    borderRadius: 8,
    margin: 4,
  },
});


export default styles;