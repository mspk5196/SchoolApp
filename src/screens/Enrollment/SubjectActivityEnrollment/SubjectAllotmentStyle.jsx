import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
  // Section Tabs
  sectionTabsContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 10,
  },
  sectionTab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#FFFFFF',
    width: 115,
  },
  activeSectionTab: {
    backgroundColor: '#0C36FF',
  },
  sectionTabText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
    textAlign: 'center',
  },
  activeSectionTabText: {
    color: '#FFFFFF',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listModalContainer: {
    width: 250,
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
  
  // Form Modal styles
  formModalContainer: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    maxHeight: '80%', // Limit the height to ensure it fits on screen
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  // Add these new styles for the ScrollView
  inputScrollView: {
    width: '100%',
    maxHeight: 250, // Set a max height for the scroll area
  },
  inputScrollViewContent: {
    flexGrow: 1,
  },
  input: {
    width: '100%',
    height: 45,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    paddingHorizontal: 12,
    marginBottom: 15,
    backgroundColor: '#F9F9F9',
  },
  addMoreButton: {
    width: '100%',
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#0C36FF',
    borderRadius: 6,
    marginBottom: 15,
  },
  addMoreButtonText: {
    color: '#0C36FF',
    fontSize: 14,
    fontWeight: '500',
  },
  enrollButton: {
    width: '100%',
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0C36FF',
    borderRadius: 6,
  },
  enrollButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },

  subjectList: {
    flex: 1,
    padding: 16,
  },
  subjectCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  subjectName: {
    fontWeight: '700',
    fontSize: 16,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  categoryContainer: {
    padding: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F8F8F8',
    borderRadius: 6,
    marginBottom: 4,
  },
  categoryName: {
    color: '#555',
  },
  removeCategory: {
    padding: 4,
  },
  floatingButton: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3557FF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  // Floating menu styles
  floatingMenu: {
    position: 'absolute',
    right: 24,
    bottom: 90,
    width: 200,
    backgroundColor: 'transparent',
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  menuButton: {
    backgroundColor: '#3557FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 1,
    alignItems: 'center',
    borderRadius: 8,
  },
  menuButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default styles;