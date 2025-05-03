import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#Fdfdfd',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
    paddingTop: 42,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderColor: '#00000080',
    marginBottom: 30,
  },
  headerTitle: {
    marginLeft: 15,
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },

  // Card Styles
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 30,
    borderRadius: 10,
    marginVertical: 15,
    marginHorizontal: 15,
  },
  cardText: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 20,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    color: '#000',
    height: 50,
    borderWidth: 1,
    borderColor: '#C6D8FF',
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
  },

  // Button Styles
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#EEF3FF',
    marginRight: 8,
  },
  confirmButton: {
    backgroundColor: '#4285F4',
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4285F4',
  },

  // Other Styles
  scrollWrapper: {
    marginVertical: 10,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  classnavgrade: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
    flexGrow: 0,
    flexShrink: 0,
  },
  classnavsection: {
    flexDirection: 'row',
    marginBottom: 20,
    flexGrow: 0,
    flexShrink: 0,
  },
  gradeselection: {
    backgroundColor: '#ffffff',
    padding: 10,
    marginLeft: 10,
    marginTop: 10,
    width: 90,
    borderRadius: 30,
    alignItems: 'center',
  },
  gradeselectiontext: {
    color: 'black',
    fontWeight: '500',
  },
  activeButton: {
    backgroundColor: '#0C36FF',
  },
  activeText: {
    color: 'white',
  },
});

export default styles;
