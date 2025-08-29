import { StyleSheet, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    paddingBottom: 20,
  },
  // Updated for better keyboard handling
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    minHeight: height * 0.9, // Use 90% of screen height
  },
  // New container for better content organization
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between', // Distribute content evenly
    paddingVertical: 10,
  },
  // New header container
  headerContainer: {
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  hi: {
    marginLeft: 20,
    color: 'black',
    fontSize: 26,
    fontWeight: '700',
  },
  sectoptext: {
    marginLeft: 20,
    color: '#666666',
    fontSize: 15,
    fontWeight: '600',
  },
  // Updated image container for better keyboard handling
  imageContainer: {
    alignItems: 'center',
    flex: 0.25, // Take 25% of available space
    justifyContent: 'center',
    minHeight: 150, // Minimum height to prevent too much shrinking
  },
  logimg: {
    alignSelf: 'center',
  },
  inputcontainer: {
    marginHorizontal: 20,
    gap: 20, // Reduced gap slightly for better spacing
    marginBottom: 15,
  },
  // New password container for eye icon positioning
  passwordContainer: {
    position: 'relative',
  },
  // New eye icon styles
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 22,
    padding: 5,
    zIndex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 15, // Changed from marginTop to marginBottom
  },
  checkboxText: {
    marginLeft: 10,
    fontSize: 12,
    fontWeight: '500',
    color: '#000000',
    flex: 1, // Allow text to wrap if needed
  },
  btn: {
    width: 211,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2842C4',
    borderRadius: 8,
  },
  btntext: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  pressablebtn: {
    marginBottom: 20, // Changed from marginTop to marginBottom
    alignSelf: 'center',
  },
  separator: {
    marginBottom: 15, // Reduced margin for better spacing
    alignSelf: 'center',
    height: 16,
    width: 281,
  },
  googletext: {
    marginBottom: 15, // Changed from marginTop to marginBottom
    alignSelf: 'center',
    color: '#595959',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'DMSans-Regular',
  },
  googleauthcontainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20, // Added bottom margin for spacing
    height: 50,
    width: 270,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#92A5B5',
  },
  googleicon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleauthtext: {
    color: '#3C4043',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'DMSans-Regular',
  },
});

export default styles;