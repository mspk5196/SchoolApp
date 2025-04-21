import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
    SubNavbar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBlockColor: '#00000040',
    },
    Leftarrow: {
        marginRight: 10,
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
    },
    removeButton: {
        marginTop: 8,
        backgroundColor: '#2D50FD',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 5,
    },
    removeText: {
        color: '#fff',
    },
    listContent: {
        marginLeft: 0,  // Centered text, so no margin needed
        alignItems: 'center',
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
        fontWeight:'500'
    },
    searchContainer: {
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 8,
        backgroundColor: '#f1f1f1',
        paddingHorizontal: 10,
        paddingVertical: 5,
      },
      searchInput: {
        height: 40,
        fontSize: 16,
        paddingHorizontal: 8,
      },
      searchicon:{
     marginTop:10
      },
      searchContainer: {
        display:'flex',
        flexDirection:'row',
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 8,
        backgroundColor: '#f1f1f1',
        paddingHorizontal: 10,
        paddingVertical: 5,
      },
      searchInput: {
        height: 40,
        fontSize: 16,
        paddingHorizontal: 8,
      },
            
});

export default styles;
