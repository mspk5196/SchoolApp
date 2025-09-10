import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  page: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    width: 28,
    height: 28,
  },
  title: {
    fontSize: 30,
    fontWeight: '600',
    color: '#4A5E6D',
    marginLeft: 12,
  },
  profile: {
    width: 28,
    height: 28,
    marginRight: 16,
  },
  logout: {
    width: 24,
    height: 24,
    tintColor: '#FF3B30',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  text: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 12,
  },

  switch: {
    // Switch styling handled by the Switch component itself
  },

  mainpage: {
    flex: 1,
    paddingHorizontal: 35,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  menuItem: {
    width: '45%',
    aspectRatio: 1,
    backgroundColor: '#EBEEFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  menuItemPressed: {
    backgroundColor: '#D6D6F5',
    transform: [{ scale: 0.98 }],
  },
  card1: {
    width: '45%',
    aspectRatio: 1,
    backgroundColor: '#EBEEFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  menus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  menutitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000000',
    marginTop: 13,
    textAlign: 'center',
  },
  menutitle1: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000000',
    marginTop: 13,
    textAlign: 'center',
  },
  icons: {
    width: 50,
    height: 50,
  },
  icons1: {
    width: 50,
    height: 50,
  },
});

export default styles;
