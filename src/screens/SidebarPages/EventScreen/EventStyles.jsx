import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FAFAFA',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      height: 56,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E5E5',
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '600',
      marginLeft: 8,
    },
    categorySection: {
      marginBottom: 24,
    },
    categoryTitle: {
        color: '#000',
      fontSize: 16,
      fontWeight: '600',
      marginVertical: 12,
      marginHorizontal: 16,
    },
    eventList: {
        marginBottom: 16,
      paddingLeft: 16,
      paddingRight: 8,
    },
    card: {
        width: 240,
        marginRight: 12,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 1,
        overflow: 'hidden',
      },
    cardContent: {
      position: 'relative',
    },
    cardImage: {
      width: '100%',
      height: 140,
      backgroundColor: '#FFD7D0',
    },
    dateTag: {
      position: 'absolute',
      top: 8,
      left: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderRadius: 6,
      padding: 4,
      zIndex: 1,
    },
    dateNumber: {
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#FF3B30',
    },
    dateMonth: {
      fontSize: 10,
      textAlign: 'center',
      color: '#FF3B30',
    },
    favoriteButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderRadius: 20,
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
    },
    cardTextContent: {
      padding: 12,
    },
    cardTitle: {
        color: '#000',
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
    },
    participantsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    avatarGroup: {
      flexDirection: 'row',
      marginRight: 8,
    },
    avatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'white',
    },
    avatarOffset: {
      marginLeft: -10,
    },
    avatarOffset2: {
      marginLeft: -10,
    },
    participantsText: {
      fontSize: 12,
      color: '#3F38DD',
      fontWeight: '500',
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    locationText: {
      fontSize: 12,
      color: '#2B2849',
      marginLeft: 4,
    },
  });

  export default styles;