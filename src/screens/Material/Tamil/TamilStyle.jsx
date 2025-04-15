import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    // Header styles
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E3E3E3',
        backgroundColor: 'white',
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
    AddIcon: {
        width: 20,
        height: 20,
    },
    
    // Content styles
    scrollViewContent: {
        flexGrow: 1,
        backgroundColor: '#F5F5F5',
    },
    gradeContainer: {
        margin: 10,
        padding: 10,
        justifyContent: 'flex-start',
    },
    gradeText: {
        fontSize: 20,
        fontWeight: '500',
        color: 'black',
        marginBottom: 10,
    },
    noGradeContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    noGradeText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    noMaterialsContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        marginTop: 20,
    },
    noMaterialsText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    
    // Add button styles
    AddButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        padding: 20,
        backgroundColor: '#0C36FF',
        borderRadius: 50,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    
    // Form styles
    formContainer: {
        flex: 1,
        backgroundColor: 'white',
    },
    formHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E3E3E3',
    },
    formContent: {
        padding: 15,
    },
    inputContainer: {
        marginTop: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        color: '#000000',
    },
    optionalText: {
        color: '#999999',
        fontStyle: 'italic',
        fontWeight: 'normal',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#E3E3E3',
        borderRadius: 5,
        padding: 12,
        fontSize: 14,
        backgroundColor: '#FFFFFF',
    },
    dateInput: {
        borderWidth: 1,
        borderColor: '#E3E3E3',
        borderRadius: 5,
        padding: 12,
        fontSize: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    dateInputText: {
        color: '#999999',
    },
    selectedDateText: {
        color: '#000000',
    },
    datePicker: {
        width: '100%',
        marginTop: 10,
    },
    
    // File upload styles
    fileContainer: {
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#E3E3E3',
        borderRadius: 5,
        padding: 12,
        backgroundColor: '#FAFAFA',
    },
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: '#F0F0F0',
        padding: 8,
        borderRadius: 5,
    },
    fileIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    fileName: {
        flex: 1,
        fontSize: 14,
        color: '#000000',
    },
    removeFileBtn: {
        padding: 5,
    },
    removeFileBtnText: {
        fontSize: 18,
        color: '#999999',
    },
    chooseFileBtn: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    chooseFileBtnText: {
        fontSize: 14,
        color: '#999999',
    },
    hereText: {
        color: '#0C36FF',
        textDecorationLine: 'underline',
    },
    helperText: {
        fontSize: 12,
        color: '#999999',
        marginTop: 5,
        fontStyle: 'italic',
    },
    videoSelectBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E3E3E3',
        borderRadius: 5,
        padding: 12,
        backgroundColor: '#FAFAFA',
    },
    videoIcon: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    saveButton: {
        backgroundColor: '#0C36FF',
        borderRadius: 25,
        padding: 15,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
        elevation: 2,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    
    // Material List styles
    levelContainer: {
        marginTop: 15,
        backgroundColor: 'white',
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
    },
    levelTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: 'black',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    materialTabs: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E3E3E3',
    },
    tab: {
        padding: 12,
        flex: 1,
        alignItems: 'center',
    },
    tabActive: {
        padding: 12,
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#0C36FF',
    },
    tabText: {
        color: '#666',
        fontSize: 14,
    },
    tabActiveText: {
        color: 'white',
        fontWeight: '500',
        fontSize: 14,
    },
    materialFiles: {
        padding: 15,
    },
    fileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: '#F9F9F9',
        padding: 10,
        borderRadius: 5,
    },
    pdfIcon: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    deleteIcon: {
        width: 20,
        height: 20,
        tintColor: 'red',
    },
    noFilesText: {
        textAlign: 'center',
        color: '#888',
        padding: 15,
        fontStyle: 'italic',
    },
    deleteMaterialBtn: {
        alignSelf: 'flex-end',
        marginTop: 15,
        marginRight: 20,
        marginBottom: 20,
        backgroundColor: '#F0F0F0',
        padding: 10,
        borderRadius: 5,
    },
    deleteMaterialBtnText: {
        color: 'red',
        fontWeight: '500',
    }
});

export default styles;