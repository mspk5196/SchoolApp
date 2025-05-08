import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f7fa',
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
    headerText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#000000',
      marginLeft: 10,
    },
    content: {
      flex: 1,
    },
    formContainer: {
      backgroundColor: '#FFFFFF',
      margin: 16,
      borderRadius: 8,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      color: '#333',
      marginBottom: 6,
      fontWeight: '500',
    },
    input: {
      height: 48,
      borderWidth: 1,
      borderColor: '#E3E3E3',
      color:'black',
      borderRadius: 8,
      paddingHorizontal: 12,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
    },
    inputText: {
      color: '#333',
      fontSize: 14,
    },
    placeholderText: {
      color: '#9e9e9e',
      fontSize: 14,
    },
    pickerInput: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dropdownIcon: {
      fontSize: 12,
      color: '#9e9e9e',
    },
    footer: {
      padding: 16,
    },
    submitButton: {
      backgroundColor: '#3557FF',
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    submitButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    blockSelection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    blockOption: {
      flex: 1,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
      marginHorizontal: 4,
      borderRadius: 8,
    },
    blockOptionSelected: {
      backgroundColor: '#3557FF',
    },
    blockOptionText: {
      color: '#666',
      fontWeight: '500',
    },
    blockOptionTextSelected: {
      color: '#fff',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '80%',
      backgroundColor: '#fff',
      borderRadius: 8,
      paddingVertical: 20,
      paddingHorizontal: 10,
      maxHeight: '70%',
    },
    modalTitle: {
      fontSize: 18,
      color: '#000000',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 15,
    },
    modalScrollView: {
      maxHeight: 300,
    },
    modalItem: {
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    modalItemText: {
      fontSize: 16,
      color: '#000',
      fontWeight: '500',
    },
    closeButton: {
      marginTop: 15,
      alignSelf: 'center',
      paddingVertical: 8,
      paddingHorizontal: 20,
      backgroundColor: '#f0f0f0',
      borderRadius: 15,
    },
    closeButtonText: {
      fontSize: 16,
      color: '#000',
      fontWeight: '500',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f7fa',
    },
    // New styles for checkbox items
    checkboxItem: {
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    selectedGradeTag: {
      backgroundColor: '#E8EEFF',
      borderRadius: 4,
      paddingVertical: 4,
      paddingHorizontal: 8,
      marginRight: 6,
      marginBottom: 6,
      flexDirection: 'row',
      alignItems: 'center',
    },
    selectedGradeText: {
      color: '#3557FF',
      fontSize: 12,
      fontWeight: '500',
    },
    selectedGradesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
    },
  });
  
  export default styles;