import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fb',
  },
  SubNavbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e8',
    backgroundColor: '#fff',
  },
  Leftarrow: {
    marginRight: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  monthYearContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthYear: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  holidayText: {
    fontSize: 14,
    color: '#666',
    marginRight: 10
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#f8f9ff',
    padding: 5,
  },
  calendarCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
  },
  headerCell: {
    paddingVertical: 8,
  },
  selectedCell: {
    backgroundColor: '#e3f2fd',
    borderRadius: 20,
  },
  todayCell: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0d6efd',
  },
  calendarCellText: {
    fontSize: 14,
    color: '#333',
  },
  headerCellText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  selectedCellText: {
    color: '#0d6efd',
    fontWeight: '600',
  },
  todayCellText: {
    color: '#0d6efd',
    fontWeight: '600',
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4caf50',
    marginTop: 2,
  },
  monthTabs: {
    flexDirection: 'row',
    borderBottomWidth: 0,
    borderBottomColor: '#e1e1e8',
    backgroundColor: '#fff',
    gap: 10,
  },
  monthTab: {
    marginTop:0,
    paddingVertical: 5,
    paddingHorizontal:20,
    justifyContent: 'center',
    alignItems: 'center',
    
    borderWidth:1,
    borderColor: '#e1e1e8',
    borderRadius: 10,
      
  },
  activeMonthTab: {
    borderWidth: 2,
    borderColor: '#0d6efd',
    borderRadius: 10,
    backgroundColor:'#EBEEFF'
  },
  monthTabText: {
    fontSize: 14,
    color: '#666',
  },
  activeMonthTabText: {
    color: '#0d6efd',
    fontWeight: '600',
  },
  eventsContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f5',
  },
  eventDateContainer: {
    alignItems: 'center',
    width: 40,
    marginRight: 10
  },
  eventDay: {
    fontSize: 25,
    fontWeight: '600',
    color: '#0d6efd',
  },
  eventMonth: {
    fontSize: 14,
    color: '#0d6efd',
  },
  eventContainer: {
    borderLeftWidth: 5,
    padding: 15,
    borderLeftColor: '#15B097',
    borderRadius: 10
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#15B097',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 15,
    color: '#637D92',
    marginTop: 10
  },
  eventArrow: {
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4285f4',
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
    fontWeight: 'bold',
  },
  noEventsText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
    fontSize: 16,
  },
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
    borderColor: '#0d6efd',
  },
  radioDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#0d6efd',
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
    backgroundColor: '#4285f4',
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
    color: '#0C36FF',
  },
  activeHolidayText: {
    color: '#0C36FF',
    fontWeight: '500',
  },
  holidayIcon: {
    marginRight: 10,
  },
  holidayType: {
    fontSize: 12,
    color: '#5F6368',
    marginTop: 2,
  },
  holidayReason: {
    fontSize: 11,
    color: '#80868B',
    fontStyle: 'italic',
    marginTop: 1,
  }, 
  
  holidayContainer: 
  {
    borderLeftWidth: 5,
    padding: 15,
    borderLeftColor: '#E4626F',
    borderRadius: 10
  },
  holidayTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E4626F',
    marginBottom: 4,
  },
  holidayTime: {
    fontSize: 15,
    color: '#637D92',
    marginTop: 10,
  },
  holidayTypeContainer: {
    marginVertical: 10,
  },
  holidayTypeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#202124',
    marginBottom: 8,
  },
  fullDayBadge: {
    backgroundColor: '#D93025',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  halfDayBadge: {
    backgroundColor: '#F29900',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
  },
  emptyHolidaysContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyHolidaysText: {
    fontSize: 16,
    color: '#5F6368',
    textAlign: 'center',
  },
  emptyHolidaysSubtext: {
    fontSize: 14,
    color: '#80868B',
    textAlign: 'center',
    marginTop: 8,
  },
  
});

export default styles;