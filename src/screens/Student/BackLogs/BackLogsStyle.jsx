import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FaFaFa',
    },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E3E3E3',
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
  // New container for tabs with fixed height
  tabsContainer: {
    height: 60, // Fixed height for the tabs section
    marginTop: 10,
    marginBottom: 10,
  },
  sectionTabsContent: {
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  sectionTab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    width: 105,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#0C36FF',
  },
  sectionTabText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  cardsContainer: {
    padding: 15,
    paddingBottom: 30, 
  },
  card: {
    backgroundColor: '#FCF0E4',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0,
    elevation: 2,
  },
  cardLeftContent: {
    flex: 2,
  },
  cardRightContent: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  profileInfo: {
    flex: 1,
  },
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  idText: {
    fontSize: 14,
    color: '#555555',
    marginTop: 2,
  },
  levelText: {
    fontSize: 14,
    color: '#FF8C00',
    marginTop: 5,
  },
  subjectText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'right',
  },
  daysText: {
    fontSize: 14,
    color: '#FF8C00',
    marginTop: 5,
    textAlign: 'right',
  },
});

export default styles;