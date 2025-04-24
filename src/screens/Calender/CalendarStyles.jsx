import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
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
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  monthYearContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  Button: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  holidayText: {
    color: '#666',
    marginLeft: 4,
    fontSize: 14,
  },
  activeHolidayText: {
    color: '#2563eb',
    fontWeight: '500',
  },
  holidayIcon: {
    marginRight: 4,
  },
  // Calendar Grid
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#f8f8f8',
    padding: 8,
  },
  calendarCell: {
    width: '14.28%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  headerCell: {
    paddingVertical: 12,
  },
  selectedCell: {
    backgroundColor: '#dbeafe',
    borderRadius: 20,
  },
  todayCell: {
    backgroundColor: '#dbeafe',
    borderRadius: 20,
  },
  calendarCellText: {
    fontSize: 14,
    color: '#333',
  },
  headerCellText: {
    fontSize: 14,
    color: '#666',
  },
  selectedCellText: {
    color: '#2563eb',
    fontWeight: '500',
  },
  todayCellText: {
    color: '#2563eb',
    fontWeight: '500',
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10b981',
    marginTop: 4,
  },
  holidayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#f87171',
    marginTop: 2,
  },
  // Month Tabs
  monthTabs: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginTop: 12,
  },
  monthTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginHorizontal: 4,
    backgroundColor: 'white',
  },
  activeMonthTab: {
    borderColor: '#2563eb',
    backgroundColor: '#f0f7ff',
  },
  monthTabText: {
    color: '#666',
  },
  activeMonthTabText: {
    color: '#2563eb',
    fontWeight: '500',
  },
  // Events List
  eventsContainer: {
    flex: 1,
    marginTop: 16,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  eventDateContainer: {
    alignItems: 'center',
    width: 40,
    marginRight: 12,
  },
  eventDay: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2563eb',
  },
  eventMonth: {
    fontSize: 12,
    color: '#2563eb',
  },
  eventMarker: {
    width: 6,
    height: 70,
    backgroundColor: '#10b981',
    borderRadius: 2,
    marginRight: 12,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    color: '#333',
  },
  holidayMarker: {
    backgroundColor: '#f87171',
  },
  eventDetails: {
    flex: 1,
  },
  eventContainer: {
    flex: 1,
  },
  eventTime: {
    fontSize: 12,
    color: '#666',
  },
  eventArrow: {
    marginLeft: 8,
    color: '#ccc',
  },
  noEventsText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
    fontSize: 16,
  },
  // Holiday styling
  holidayContainer: {
    flex: 1,
  },
  holidayTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#f87171',
    marginBottom: 4,
  },
  holidayTime: {
    fontSize: 12,
    color: '#666',
  },
  // FAB
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  fabIcon: {
    fontSize: 24,
    color: '#fff',
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e8',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  formGroup: {
    marginTop: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e1e1e8',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: '#f8f9ff',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#888',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#2563eb',
  },
  radioDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#2563eb',
  },
  radioLabel: {
    fontSize: 16,
    marginLeft: 8,
  },
  inputText: {
    color: '#333',
  },
  placeholderText: {
    color: '#888',
  },
  confirmButton: {
    backgroundColor: '#2563eb',
    borderRadius: 25,
    height: 50,
    marginTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  activeHolidayButton: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 8,
    padding: 6,
  },
  // New styles imported from Calendar2
  dayNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDayContainer: {
    backgroundColor: '#2563EB',
    borderRadius: 20,
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  dayNumber: {
    color: '#666',
    fontSize: 14,
  },
  // Month Year Picker Modal styles from Calendar2
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthYearPickerContent: {
    width: width * 0.9,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  yearSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  yearSelectorText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
  },
  yearSelectorArrow: {
    fontSize: 20,
    color: '#2563eb',
    paddingHorizontal: 8,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  monthItem: {
    width: '31%',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
    marginHorizontal: '1%',
    borderRadius: 6,
  },
  selectedMonthItem: {
    backgroundColor: '#2563eb',
  },
  monthItemText: {
    fontSize: 13,
    color: 'black',
  },
  selectedMonthItemText: {
    color: 'white',
    fontWeight: '500',
  },
  // Event content container styles from Calendar2
  eventContentContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 8,
    overflow: 'hidden',
    minHeight: 60,
  },
  eventBar: {
    width: 4,
    backgroundColor: '#10b981',
  },
  eventDetailsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 12,
  },
  holidayeventBar: {
    width: 4,
    backgroundColor: '#E4626F',
  },
  // No events container
  noEventsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default styles;