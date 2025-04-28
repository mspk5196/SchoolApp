import {  StyleSheet } from 'react-native';


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 15,
      paddingHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#E3E3E3',
      backgroundColor: '#FFFFFF',
    },
    headerTxt: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#000000',
      marginLeft: 10,
    },
    BackIcon: {
      width: 20,
      height: 20,
    },
    scrollContainer: {
      flex: 1,
    },
    leaveCard: {
      backgroundColor: '#fff',
      borderRadius: 8,
      padding: 16,
      marginHorizontal: 16,
      marginTop: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    nameContainer: {
      flex: 1,
    },
    name: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
    },
    id: {
      fontSize: 14,
      color: '#666',
    },
    statusContainer: {
      display:'flex',
      flexDirection:'row',
      
  
    },
    statusText: {
      fontSize: 14,
      fontWeight: '500',
    },
    pendingStatus: {
      color: '#FF9800',
    },
    approvedStatus: {
      color: '#4CAF50',
    },
    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    icon: {
      marginRight: 8,
    },
    dateText: {
      fontSize: 14,
      color: '#333',
    },
    leaveTypeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    leaveTypeIcon: {
      marginRight: 8,
    },
    leaveTypeText: {
      color: '#F44336',
      fontSize: 16,
    },
    leaveType: {
      fontSize: 14,
      color: '#F44336',
      fontWeight: '500',
    },
    reasonContainer: {
      padding: 12,
      backgroundColor: '#F5F5F5',
      borderRadius: 4,
      marginTop: 12,
      borderLeftWidth: 3,
      borderLeftColor: '#2196F3',
    },
    reasonText: {
      fontSize: 14,
      color: '#333',
      lineHeight: 20,
    },
    historySection: {
      paddingHorizontal: 16,
      paddingTop: 24,
      paddingBottom: 100, // Add padding to account for the bottom button
    },
    historyTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
      marginBottom: 16,
    },
    historyDate: {
      fontSize: 14,
      color: '#666',
      marginBottom: 8,
    },
    historyLeaveCard: {
      backgroundColor: '#fff',
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    approveButton: {
      backgroundColor: '#0C36FF',
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 14,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      width: "90%",
      bottom: 20,
      marginHorizontal: 22,
     
    },
    approveButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    leaveDetails: {
      marginBottom: 8,
    },
  });

export default styles;