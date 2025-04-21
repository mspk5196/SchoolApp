import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
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
      BackIcon: {
        width: 20,
        height: 20,
      },
    formContainer: {
      flex: 1,
      padding: 20,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '500',
      color: '#333',
      marginBottom: 8,
    },
    textInput: {
      height: 50,
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 5,
      paddingHorizontal: 15,
      fontSize: 16,
      backgroundColor: '#FFFFFF',
    },
    pickerButton: {
      height: 50,
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 5,
      paddingHorizontal: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#FFFFFF',
    },
    pickerSelectedText: {
      fontSize: 16,
      color: '#333',
    },
    placeholderText: {
      fontSize: 16,
      color: '#9E9E9E',
    },
    dropdownArrow: {
      fontSize: 14,
      color: '#9E9E9E',
    },
    dropdownContainer: {
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 5,
      backgroundColor: '#F5F5F5',
      marginTop: 2,
      zIndex: 1000,
    },
    dropdownItem: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
    },
    dropdownItemText: {
      fontSize: 16,
      color: '#333',
    },
    addButton: {
      backgroundColor: '#3557FF',
      height: 50,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 20,
      marginBottom: 20,
    },
    addButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    // Modal styles from AddInfraEnrollmentStyle
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
    }
  });

export default styles;