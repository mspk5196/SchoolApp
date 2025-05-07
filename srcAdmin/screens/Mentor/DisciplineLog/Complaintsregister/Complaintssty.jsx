import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fafafa',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      paddingBottom: 10,
      paddingTop: 32,
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
      backgroundColor: '#FAFAFA',
      flexDirection: 'row',
      alignItems: 'flex-end',
      borderColor: '#00000080',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#333333',
    },
    backButton: {
      paddingRight: 10,
      paddingTop: 10,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      margin: 10,
      paddingHorizontal: 15,
      backgroundColor: '#f0f2fa',
      borderRadius: 8,
      height: 44,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: '#333',
      paddingHorizontal: 8,
    },
    resultsList: {
    height:'auto',
      backgroundColor: '#fff',
      borderRadius: 8,
      marginHorizontal: 10,
      elevation: 2,
      shadowColor: '#999',
    },
    cardContainer: {
      backgroundColor: '#000',
    },
    userItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 20,
    },
    userImage: {
      width: 36,
      height: 36,
      borderRadius: 18,
      marginRight: 12,
    },
    userName: {
      color: '#333',
      fontSize: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 15,
      paddingBottom: 5,
      backgroundColor: '#fff',
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#000',
    },
    clearButton: {
      fontSize: 12,
      color: '#007AFF',
    },
  });

export default styles