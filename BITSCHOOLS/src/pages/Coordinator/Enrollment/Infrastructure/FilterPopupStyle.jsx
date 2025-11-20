import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E3E3E3',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  removeFiltersText: {
    color: '#3557FF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  filterTagsContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  filterTag: {
    backgroundColor: '#E8EEFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterTagText: {
    color: '#3557FF',
    marginRight: 4,

  },
  removeTagIcon: {
    color: '#3557FF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContent: {
    marginVertical: 10,
  },
  filterSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000000',
  },
  checkboxRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  checkboxColumn: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 50
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '20%',
    marginBottom: 4,
  },
  applyButton: {
    backgroundColor: '#3557FF',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  customCheckbox: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
});

export default styles;