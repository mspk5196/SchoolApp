import { StyleSheet, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    minHeight: height * 0.9,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  headerContainer: {
    alignItems: 'flex-start',
    paddingHorizontal: 30,
    paddingTop: 16,
    marginBottom: 10,
  },
  hi: {
    color: '#1E293B',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  sectoptext: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '500',
  },
  imageContainer: {
    alignItems: 'center',
    flex: 0.25,
    justifyContent: 'center',
    minHeight: 150,
    paddingVertical: 10,
  },
  logimg: {
    alignSelf: 'center',
  },
  inputcontainer: {
    marginHorizontal: 30,
    gap: 20,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 16,
    padding: 8,
    zIndex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 30,
    marginBottom: 20,
  },
  checkboxText: {
    marginLeft: 10,
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
    flex: 1,
  },
  btn: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btntext: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pressablebtn: {
    marginBottom: 20,
    marginHorizontal: 30,
  },
  separator: {
    marginBottom: 20,
    alignSelf: 'center',
    height: 16,
    width: 281,
  },
  googletext: {
    marginBottom: 16,
    alignSelf: 'center',
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  googleauthcontainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 30,
    marginBottom: 20,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  googleicon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleauthtext: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default styles;