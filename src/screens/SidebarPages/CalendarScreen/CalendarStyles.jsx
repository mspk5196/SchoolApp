import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
    paddingTop: 42,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderColor: '#00000080',
  },
  headerTitle: {
    marginLeft: 6,
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  monthYearButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthYearText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  holidaysButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  holidaysText: {
    color: '#2563eb',
    marginLeft: 4,
    fontSize: 14,
  },
  // Modal styles for month/year picker
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9, // Reduced size
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
    width: '31%', // Adjusted to fit 3 in a row with spacing
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
  calendarContainer: {
    backgroundColor: '#f4f4f4',
    padding: 8,
  },
  daysOfWeek: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  dayOfWeekCell: {
    width: 32,
    alignItems: 'center',
  },
  dayOfWeekText: {
    fontSize: 14,
    color: '#666',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  dayNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayCell: {
    backgroundColor: '#dbeafe',
  },
  dayNumber: {
    color: '#666',
    fontSize: 14,
  },
  todayNumber: {
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
  monthSlider: {
    marginTop: 12,
    flexShrink: 0,
    paddingHorizontal: 12,
  },
  monthTab: {
    paddingHorizontal: 20,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginHorizontal: 4,
    backgroundColor: 'white',
  },
  selectedMonthTab: {
    borderColor: '#2563eb',
    backgroundColor: '#f0f7ff',
  },
  monthTabText: {
    color: '#666',
  },
  selectedMonthTabText: {
    color: '#2563eb',
    fontWeight: '500',
  },
  eventsContainer: {
    marginTop: 16,
    paddingHorizontal: 12,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  eventDateContainer: {
    alignItems: 'center',
    marginRight: 12,
    width: 40,
  },
  eventDateNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2563eb',
  },
  eventDateMonth: {
    fontSize: 12,
    color: '#2563eb',
  },
  eventContentContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 8,
    overflow: 'hidden',
    minHeight: 60, // Add minimum height to ensure visibility

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
    paddingRight: 12, // Add right padding for the arrow
  },
  eventDetails: {
    flex: 1,
    paddingVertical: 15,
    paddingLeft: 12, 
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: '#10b981', 
  },
  eventTime: {
    fontSize: 12,
    color: '#666',
  },
  eventArrow: {
    marginRight: 12,
  },
  holidaysContainer: {
    flex: 1,
    marginTop: 16,
    paddingHorizontal: 12,
  },
  holidayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  holidayDateContainer: {
    alignItems: 'center',
    width: 60,
  },
  holidayDateNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2563eb',
  },
  holidayDateMonth: {
    fontSize: 12,
    color: ' #2563eb',
  },
  holidayContentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  holidayBar: {
    width: 4,
    height: 36,
    backgroundColor: '#f87171',
    borderRadius: 2,
    marginRight: 12,
  },
  holidayName: {
    fontSize: 16,
    color: '#f87171',
  },
});

export default styles;