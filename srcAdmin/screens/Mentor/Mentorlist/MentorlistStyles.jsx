import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
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
    
    contentContainer: {
        flexDirection: 'row',  // Make items appear in a row
        flexWrap: 'wrap',      // Wrap items to the next line
        justifyContent: 'space-around', // Space between items
        padding: 8,
    },
    listItem: {
        width: '45%',
        margin: 8,
        alignItems: 'center',
        padding: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
      },
      removeButton: {
        display: 'flex',
        alignItems: 'center',
        marginTop: 12,
        width:74,
        backgroundColor: '#2D50FD',
        paddingVertical: 4, 
        paddingHorizontal: 8,
        borderRadius: 5,
      },
      removeText: {
        color: '#fff',
      },
      listContent: {
        marginLeft: 0,
        alignItems: 'center',
      },
      studentAvatar: {
        width: 65,
        height: 65,
        borderRadius: 30,
        marginBottom: 11,
        borderWidth: 2,
        borderColor: '#FFD700',
      },
      heading: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
      },
      listName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2B2829',
      },
      listId: {
        fontSize: 10,
        marginTop: 3,
        fontWeight: '500',
        color: '#323F49',
      },
    
    // Container for both search bar and filter button
    searchFilterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    
    // Search container that doesn't include filter button
    searchContainer: {
        flexDirection: 'row',
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
        alignItems: 'center',
        backgroundColor: '#EEEFF9',
        borderRadius: 10,
        marginRight: 10,
    },
    
    searchicon: {
        width: 20,
        height: 20,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 14,
        padding: 0,
    },
    filterButton: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterSidebar:
     {
        position: 'absolute',
        right: 0,
        top: 50,
        bottom: 0,
        width: 250,
        backgroundColor: '#F8F8F8',
        zIndex: 100,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        paddingTop: 20,
        paddingHorizontal: 15,
    },
    filterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EAEAEA',
        marginBottom: 15,
    },
    closeButton: {
        width: 25,
        height: 25,
        borderRadius: 14,
        backgroundColor: '#EAEAEA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        lineHeight: 20,
        textAlign: 'center',
        color: '#000',
    },
    applyFiltersButton: {
        backgroundColor: '#2D50FD',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    applyFiltersText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    filterTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    filterSection: {
        marginBottom: 20,
    },
    filterSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    checkboxContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    checkboxColumn: {
        width: '45%',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    checkbox: {
        marginRight: 8,
    },
    checkboxLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
    },
    filterChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8E8E8',
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginRight: 8,
        marginBottom: 8,
    },
    chipText: {
        fontSize: 12,
        marginRight: 5,
    },
    chipClose: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default styles;