import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
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
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  backButton: {
    paddingRight: 10,
    paddingTop: 10,
  },

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
    backgroundColor: '#E0E0E0',
    width: 105,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#0C36FF',
  },
  sectionTabText: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  cardsContainer: {
    padding: 21,
    paddingBottom: 30, // Add extra padding at the bottom for scrolling
  },
  card: {
    backgroundColor: '#FCF0E4',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0,
    elevation: 2,
  },
  cardLeftContent: {
    flex: 2,
  },
  cardRightContent: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 13,
  },
  profileInfo: {
    flex: 1,
  },
  nameText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  idText: {
    fontSize: 12,
    color: '#555555',
    fontWeight: '500',
    marginTop: 2,
  },
  levelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F9932E',
    marginTop: 5,
  },
  subjectText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'right',
  },
  daysText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF8C00',
    marginTop: 5,
    textAlign: 'right',
  },
});

export default styles;
