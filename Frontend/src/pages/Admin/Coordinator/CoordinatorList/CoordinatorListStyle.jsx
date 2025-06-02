import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f3f3',
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
        fontWeight: '600',
        color: '#000',
    },
    listId:
    {
        fontSize: 14,
        color: '#666',
    },

    searchicon: {
        marginTop: 10
    },
    searchContainer: {
        display: 'flex',
        flexDirection: 'row',
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 8,
        backgroundColor: '#e3e3e3',
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    searchInput: {
        height: 40,
        fontSize: 16,
        color: 'black',
        paddingHorizontal: 8,
    },
});

export default styles;