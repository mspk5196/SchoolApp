import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      width: '100%',
      justifyContent: 'center',
      
    },
    calendarModal: {
      width: '100%',
      backgroundColor: '#ffffff',
      borderRadius: 16,
      padding: 16,
      elevation: 5,
    },
    calendarTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    closeButton: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginBottom: 16,
    },
    searchInput: {
      flex: 1,
      paddingHorizontal: 8,
      paddingVertical: 6,
      fontSize: 14,
    },
    searchResultsContainer: {
      maxHeight: 150,
      borderWidth: 1,
      borderColor: '#eee',
      borderRadius: 8,
      marginBottom: 16,
    },
    searchResultsList: {
      paddingVertical: 4,
    },
    searchResultItem: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    selectedDateContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: '#eee',
      marginTop: 8,
    },
    selectedDateText: {
      fontSize: 14,
      color: '#333',
    },
    confirmButton: {
      backgroundColor: '#4169e1',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    confirmButtonText: {
      color: '#fff',
      fontWeight: '500',
    },
  });
  

export default styles;