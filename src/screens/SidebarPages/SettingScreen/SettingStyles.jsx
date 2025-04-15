import { StyleSheet } from 'react-native';

const SettingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
    paddingTop: 42,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderColor: '#00000080',
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
    color:'black'
  },
  scrollContainer: {
    flex: 1,
  },
  settingsContainer: {
    paddingHorizontal: 29,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
   
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    color: 'black',
  },
 
});

export default SettingStyles;