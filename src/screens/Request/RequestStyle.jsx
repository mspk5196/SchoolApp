import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
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
  scrollContainer: {
    flex: 1,
    padding: 15,
  },
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  requestDetails: {
    flex: 1,
  },
  requestTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  countBadge: {
    backgroundColor: '#EEEEEE',
    borderRadius: 15,
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  countText: {
    fontSize: 14,
    color: '#000000',
  },
  requestSubtitle: {
    fontSize: 14,
    color: '#000000',
    marginTop: 4,
  },
  requestStatus: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 5,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  completedStatus: {
    color: '#4CAF50',
  },
  pendingStatus: {
    color: '#FFA500',
  },
  floatingButton: {
    position: 'absolute',
    right: 25,
    bottom: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3557FF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  plusIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    lineHeight: 50,
  },
});

export default styles;