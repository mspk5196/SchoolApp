import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
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
        fontWeight: '600',
        color: '#000000',
        marginLeft: 10,
      },
      BackIcon: {
        width: 19,
        height: 17,
      },
    contentContainer: {
        flexDirection: 'row',  // Make items appear in a row
        flexWrap: 'wrap',      // Wrap items to the next line
        justifyContent: 'space-around', // Space between items
        padding: 8,
    },
    listItem: {
        width: '45%',          // Make each item take half the width (with margin)
        margin: 8,             // Space between items
        alignItems: 'center',
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#fff',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    removeButton: {
        marginTop: 8,
        backgroundColor: '#2D50FD',
        paddingVertical: 8,
        paddingHorizontal: 13,
        borderRadius: 5,
    },
    removeText: {
        color: '#fff',
    },
    listContent: {
        marginLeft: 0,  // Centered text, so no margin needed
        alignItems: 'center',
    },
    homeButtonContainer: {
      position: 'absolute',
      bottom: 30,
      right: 25,
    },
    studentAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: '#FFD700',
    },
    heading: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    listName:
    {
        fontWeight:'600',
        color:'#000',
    },
    listId:
    {
        fontSize: 14,
        color: '#666',
    },
     
      searchicon:{
     marginTop:10
      },
      searchContainer: {
        display:'flex',
        flexDirection:'row',
        backgroundColor: '#EEEFF9',
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        paddingHorizontal: 10,
        paddingVertical: 5,
      },
      searchInput: {
        paddingLeft: 14, 
        height: 40,
        fontSize: 16,
        paddingHorizontal: 8,
      },
            
});

export default styles;
