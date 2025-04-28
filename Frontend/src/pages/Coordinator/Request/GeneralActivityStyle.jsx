import { StyleSheet } from "react-native";

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
  scrollContainer: {
    flex: 1,
    padding: 15,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  sectionItem: {
    paddingVertical: 8,
  },
  itemText: {
    fontSize: 14,
    color: '#000000',
  },
  divider: {
    height: 1,
    backgroundColor: '#E3E3E3',
    marginVertical: 10,
  },
  addRequestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  plusIcon: {
    fontSize: 16,
    color: '#3557FF',
    marginRight: 5,
  },
  addRequestText: {
    fontSize: 14,
    color: '#3557FF',
    fontWeight: '500',
  },
  buttonContainer: {
    padding: 15,
  },
  confirmButton: {
    backgroundColor: '#3557FF',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center', 
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContent: {
  width: '80%',
  backgroundColor: 'white',
  borderRadius: 10,
  padding: 20,
  elevation: 5,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
},
modalTitle: {
  fontSize: 18,
  color: '#000',
  fontWeight: 'bold',
  marginBottom: 15,
  textAlign: 'center',
},
modalInput: {
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 8,
  padding: 10,
  marginBottom: 20,
  color:'black',
  fontSize: 16,
},
modalButtonsContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},
modalButton: {
  flex: 1,
  padding: 10,
  alignItems: 'center',
  borderRadius: 5,
  marginHorizontal: 5,
},
cancelButton: {
  backgroundColor: 'rgb(214, 212, 212)',
},
okButton: {
  backgroundColor: '#3557FF',
},
modalButtonText: {
  fontSize: 16,
  fontWeight: 'bold',
},
okButtonText: {
  color: 'white',
},
});

export default styles;