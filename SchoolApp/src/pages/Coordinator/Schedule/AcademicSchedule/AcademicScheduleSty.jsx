import { Dimensions } from "react-native";

const { width } = Dimensions.get('window');

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  generateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginLeft: 8,
    minWidth: 80,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  generateButtonDisabled: {
    backgroundColor: '#94a3b8',
    elevation: 0,
    shadowOpacity: 0,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 2,
  },
  content: {
    flex: 0,
  },
  loadingContainer: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },

  // Section Tabs (Improved)
  sectionSelectorContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sectionTabsContentContainer: {
    paddingHorizontal: 16,
  },
  sectionTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeSectionTab: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  sectionTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  activeSectionTabText: {
    color: '#FFFFFF',
  },

  // Calendar Styles - Enhanced for minimization
  calendarContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // transition: 'all 0.3s ease', // React Native doesn't directly support CSS transitions
  },
  calendarMinimized: {
    paddingVertical: 16, // Adjust padding when minimized
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  monthYear: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  chevronIcon: {
    fontSize: 19, // Using Icon component now, size will be different
    color: '#3282d8',
    fontWeight: 'bold',
    padding: 8,
  },
  expandButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  expandIcon: {
    fontSize: 16, // Using Icon component now, size will be different
    color: '#007AFF',
    fontWeight: 'bold',
  },
  minimizedCalendarInfo: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  selectedDateDisplay: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  weekDaysHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  weekDayCell: {
    flex: 1,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  dateCell: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 12,
  },
  todayCell: {
    backgroundColor: '#007AFF',
    elevation: 2,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  selectedDateCell: {
    backgroundColor: '#dbeafe',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  dateText: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
  },
  todayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  selectedDateText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  periodIndicator: {
    width: 6,
    height: 6,
    backgroundColor: '#10b981',
    borderRadius: 3,
    marginTop: 2,
  },

  // Day Schedule Styles
  dayScheduleContainer: {
    // The margin 16 makes sense, but we want the periodEditorContentContainer
    // to "stick" to the expanded periodCard without extra margin in between
    backgroundColor: '#f8fafc', // Adjusted from white to match overall container when collapsed
    // No specific padding or border radius here, handled by individual cards/containers
  },
  dayScheduleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 20,
    marginHorizontal: 16, // Add horizontal margin to align with calendar
  },
  noScheduleContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  noScheduleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  noScheduleSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Enhanced Period Card Styles with Inline Support
  periodCardContainer: {
    marginHorizontal: 16, // Give horizontal margin
    marginBottom: 0, // This is crucial for seamless connection
  },
  periodCard: {
    flexDirection: 'row',
    alignItems: 'center', // Align items vertically in the card
    backgroundColor: '#f8fafc',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    marginBottom: 16, // Default margin for collapsed cards
    paddingRight: 40, // Remove right padding to align with expanded content
  },
  expandedPeriodCard: {
    backgroundColor: '#e0f2fe',
    borderLeftColor: '#0ea5e9',
    borderRadius: 12,
    borderBottomLeftRadius: 0, // Remove bottom radius to connect to expanded content
    borderBottomRightRadius: 0, // Remove bottom radius to connect to expanded content
    marginBottom: 0, // No margin when expanded
  },
  periodTime: {
    minWidth: 90,
    paddingRight: 16,
    alignItems: 'flex-start', // Align time to start
  },
  timeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  timeSeparator: {
    fontSize: 14,
    color: '#64748b',
    marginHorizontal: 4, // Reduce horizontal margin slightly
  },
  periodInfo: {
    flex: 1,
    // marginLeft: 8, // Remove redundant margin here
    flexDirection: 'column',
  },
  subjectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4, // Reduced margin
  },
  venueText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2, // Reduced margin
  },
  sectionText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  periodActions: {
    // flexDirection: 'row',
    // alignItems: 'center',
    // marginLeft: 'auto',
    marginRight: 18,
  },
  expandIndicator: {
    fontSize: 18, // Use icon size, not text font size
    color: '#64748b',
    // fontWeight: 'bold', // Font weight for text, not for icon component
    transform: [{ rotate: '0deg' }],
  },
  expandIndicatorRotated: {
    transform: [{ rotate: '180deg' }],
    // marginRight: 18,
  },
  actionButton: { // Unused, can be removed if not reactivated
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionText: { // Unused
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
    color: '#64748b',
  },
  actionIcon: { // Unused
    fontSize: 18,
    textAlign: 'center',
  },
  splitText: { // Unused
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
  },

  // INLINE PERIOD EDITOR Styles - Redefined for better integration
  periodEditorContentContainer: { // New style for the content that expands below the card
    backgroundColor: '#f0f9ff', // Light blue background, or match card
    borderLeftWidth: 4,
    borderLeftColor: '#2c5cecc0',
    borderBottomLeftRadius: 16, // Round bottom corners for the editor content
    borderBottomRightRadius: 16,
    // marginHorizontal: 16, // Match the card's horizontal margin
    marginBottom: 16, // Space from the next period card
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxHeight: Dimensions.get('window').height * 0.45, // Responsive max height for scroll content
  },
  inlineEditorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#e0f2fe', // Match expanded card background for header
    borderTopLeftRadius: 0, // No top radius, connects to card
    borderTopRightRadius: 0, // No top radius, connects to card
  },
  inlineEditorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  closeInlineButton: {
    padding: 4,
  },
  closeInlineIcon: { // Using Icon component now, size will be different
    fontSize: 14,
    color: '#ff0000ff',
    fontWeight: 'bold',
    backgroundColor: '#eeeeeeff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    elevation: 1,
  },
  inlineEditorScrollContent: { // Style for the ScrollView within the editor content
    flexGrow: 1, // Ensures content takes full height
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  activitiesSection: {
    marginBottom: 16,
  },
  activitiesSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  quickActionIcon: { // Will be a custom icon or text character
    fontSize: 16,
    marginRight: 8,
    color: '#fff', // Added color
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Activity Item Styles
  activityItem: {
    padding: 16,
    backgroundColor: '#ffffff', // Changed to white for distinction
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1, // Allows type to take available space
  },
  activityDuration: {
    fontSize: 12,
    color: '#64748b',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontWeight: '500',
    marginLeft: 8, // Added margin for separation
  },
  activityBatch: {
    fontSize: 13,
    color: '#007AFF',
    marginBottom: 4,
    fontWeight: '500',
  },
  activityMentor: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  activityTopic: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
    marginBottom: 4,
    lineHeight: 18,
  },
  assessmentBadge: {
    fontSize: 11,
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    fontWeight: '500',
    marginTop: 4, // Added small top margin
  },

  // Modal Styles (Kept for TimeBasedActivityCreator - though its own styles would be ideal)
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    elevation: 2,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeIcon: {
    fontSize: 24, // Use icon size
    color: '#64748b',
    // fontWeight: 'bold', // Font weight for text, not icon component
    padding: 8,
  },
  // Removed unused section styles here (form etc. if not needed in TimeBasedActivityCreator)
};

export default styles;