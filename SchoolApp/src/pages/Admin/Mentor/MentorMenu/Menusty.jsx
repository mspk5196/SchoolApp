import { StyleSheet } from 'react-native';


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAFAFA',
    flex: 1,
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

  },
  headerTitle: {
    marginLeft: 15,
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  container: {
    backgroundColor: '#F5F5F5',
    flex: 1,
  },
  scrollView: {
    paddingHorizontal: 10,
  },
  Navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  homelogo: {
    marginTop: 10,
    marginRight: 10,
    marginLeft: 15,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 25,
    marginVertical: 8,
    marginHorizontal: 5,
    borderRadius: 15,
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  cardText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContent: {
    flexDirection: "row",
    alignItems: "center",
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
    marginTop: 20,
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
