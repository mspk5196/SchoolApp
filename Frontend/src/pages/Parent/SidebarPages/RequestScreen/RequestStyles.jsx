import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'left',
    padding: 16,
    borderBottomWidth: 1,
    backgroundColor: 'white',
    borderBottomColor: 'black',
  },
  headerTitle: {
    marginLeft: 12, 
    fontSize: 18,
    fontWeight: 'bold',
    color:'black'
  },
  headerSpacer: {
    width: 24,
  },
  requestItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  requestInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  requestType: {
    fontSize: 16,
    fontWeight: 'bold',
    color:'black'
  },
  requestDate: {
    fontSize: 14,
    color: 'black',
  },
  requestPurpose: {
    fontSize: 14,
    color: 'black',
  },
  requestStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },
  statusRequested: {
    color: '#FF9500',
  },
  statusReceived: {
    color: '#34C759',
  },
  statusPurposeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formContainer: {
    flex: 1,
  },
  formCard: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: 'black',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 4,
    marginRight: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#4169E1',
    borderColor: '#4169E1',
  },
  tick: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 20,
  },
  checkboxLabel: {
    fontSize: 14,
    color: 'black',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
    color: 'black',
  },
  confirmButton: {
    backgroundColor: '#4169E1',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 'auto', // This will push the button to bottom
    marginBottom: 24,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4169E1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  detailContainer: {
    flex: 1,
  },
  documentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  documentName: {
    color: 'black',
    fontSize: 14,
    fontWeight: '600',
  },
  fileName: {
    color: '#4169E1',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  clickableItem: {
    opacity: 1,
  },
});