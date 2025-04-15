import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
      },
      scrollViewContent: {
        paddingBottom: 80, // Space for the floating add button
      },
    
      // Header
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
      },
      headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
        marginLeft: 10,
      },
    
      // Section Tabs
      sectionTabsContainer: {
        paddingVertical: 10,
        paddingHorizontal: 15,
      },
      sectionTab: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: '#F5F5F5',
      },
      activeSectionTab: {
        backgroundColor: '#0C36FF',
      },
      sectionTabText: {
        fontSize: 14,
        color: '#333333',
      },
      activeSectionTabText: {
        color: '#FFFFFF',
      },
    
      // Days Navigation
      daysContainer: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 15,
      },
      dayItem: {
        alignItems: 'center',
        marginRight: 20,
        width: 40,
      },
      activeDayItem: {
        borderWidth: 1,
        borderColor: '#0C36FF',
        borderRadius: 20,
        paddingVertical: 5,
      },
      dateText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333333',
      },
      dayText: {
        fontSize: 12,
        color: '#666666',
        marginTop: 4,
      },
    
      // Schedule Container
      scheduleContainer: {
        paddingHorizontal: 90,
        paddingTop: 10,
      },
      scheduleItem: {
        flexDirection: 'row',
        marginBottom: 5,
      },
    
      // Time Section
      timeContainer: {
        width: 120,
        flexDirection: 'row',
        alignItems: 'flex-start',
      },
      timeText: {
        fontSize: 12,
        color: '#666666',
        width: 110,
      },
      timeIndicator: {
        alignItems: 'center',
        marginLeft: 5,
      },
      timeCircle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#0C36FF',
        marginTop: 5,
      },
      timeLine: {
        width: 2,
        height: 100,
        backgroundColor: '#7991A4',
        marginTop: 8,
      },
      // Add these styles if they don't exist
periodPickerItem: {
  padding: 10,
  borderRadius: 5,
  marginVertical: 5,
  alignItems: 'center',
  width: 50,
},
selectedPeriodPickerItem: {
  backgroundColor: '#0C36FF',
},
periodPickerText: {
  fontSize: 16,
  fontWeight: 'bold',
},
selectedPeriodPickerText: {
  color: '#FFFFFF',
},
unselectedPeriodPickerText: {
  color: '#333333',
},
    
      // Details Section
      detailsContainer: {
        flex: 1,
        borderLeftWidth: 0,
        paddingLeft: 15,
        marginBottom: 10,
      },
      detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
      },
      detailIcon: {
        marginRight: 8,
        color: '#666666',
      },
      detailText: {
        fontSize: 14,
        color: '#333333',
      },
    
      // Add Button
      addButton: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#0C36FF',
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      addButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
        marginRight: 8,
      },
      addButtonIcon: {
        color: '#FFFFFF',
      },
    
      // Modal Styles
      modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
      },
      modalContainer: {
        width: '85%',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 20,
        maxHeight: '80%',
      },
      modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
      },
      modalSection: {
        marginBottom: 16,
      },
      modalSectionTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
        color: '#333333',
      },
      timeInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
      },
      timeLabel: {
        width: 50,
        fontSize: 14,
        color: '#666666',
      },
      timeInput: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: '#DDDDDD',
        borderRadius: 5,
        paddingHorizontal: 10,
        justifyContent: 'center',
      },
      timeInputText: {
        fontSize: 14,
        color: '#333333',
      },
      selectionInput: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
        borderWidth: 1,
        borderColor: '#DDDDDD',
        borderRadius: 5,
        paddingHorizontal: 10,
      },
      selectionIcon: {
        marginRight: 10,
        color: '#666666',
      },
      selectionText: {
        fontSize: 14,
        color: '#333333',
      },
      modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
      },
      cancelButton: {
        flex: 1,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        borderRadius: 5,
        marginRight: 8,
      },
      cancelButtonText: {
        fontSize: 14,
        color: '#333333',
      },
      saveButton: {
        flex: 1,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0C36FF',
        borderRadius: 5,
        marginLeft: 8,
      },
      saveButtonText: {
        fontSize: 14,
        color: '#FFFFFF',
      },
    
      // List Modal Styles
      listModalContainer: {
        width: 200,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        overflow: 'hidden',
        maxHeight: '60%',
      },
      listModalItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
      },
      listModalItemText: {
        fontSize: 14,
        color: '#333333',
      },
    
      // Time Picker Modal Styles
      timeModalContainer: {
        width: '85%',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 20,
      },
      timeModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
      },
      timePickerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
      },
      timePickerColumn: {
        height: 200,
        width: 60,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#DDDDDD',
        overflow: 'hidden',
      },
      timeSeparator: {
        fontSize: 24,
        fontWeight: 'bold',
        marginHorizontal: 5,
      },
      timePickerItem: {
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
      },
      selectedTimePickerItem: {
        backgroundColor: '#0C36FF',
      },
      timePickerText: {
        fontSize: 16,
      },
      selectedTimePickerText: {
        color: '#FFFFFF',
      },
      unselectedTimePickerText: {
        color: '#333333',
      },
      periodPickerColumn: {
        height: 200,
        justifyContent: 'center',
        marginLeft: 15,
      },


});
export default styles;