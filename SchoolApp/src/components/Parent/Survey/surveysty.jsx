import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FAFAFA',
  },
 
  header: {
    flexDirection: 'row',
    height: 75,
    paddingLeft: 15,
    paddingBottom: 10,
    paddingTop: 15,
    alignItems:'flex-end',
    borderBottomWidth: 1,
    backgroundColor: 'white',
    borderBottomColor: 'black',
  },
  headerTxt: {
    fontSize: 23,
    fontFamily: 'DM Sans',
    color: 'black',
    fontWeight: 'bold',
    paddingLeft: 10,
  },
  BackIcon: {
    width: 30,
    height: 30,
  },
  surveyContainer: {
    flex: 1,
    marginHorizontal: 10,
    marginTop: 25,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    marginHorizontal: 15,
  },
  
  radioGroup: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedOption: {
    borderWidth: 1,
    borderColor: '#000',
  },
 
  radioText: {
    fontSize: 16,
    width: 236,
    fontWeight: '500',
    color: '#333',
    marginLeft: 10,
  },
  nextButton: {
    alignSelf: 'flex-end',
    marginRight: 20,
    marginBottom: 20,
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2842C4',
  },
  disabledButton: {
    opacity: 0.7,
  },
  disabledText: {
    color: '#B0B0B0',
  },
  flatListContainer: {
    margin:10,
  },
  selectedRed: {
    backgroundColor: '#FFEAEA',
    borderColor: '#EB4B42',
    borderWidth: 1,
  },
  selectedOrange: {
    backgroundColor: '#FFE7DE',
    borderColor: '#FFB37D',
    borderWidth: 1,
  },
  selectedYellow: {
    backgroundColor: '#FFFAD2',
    borderColor: '#EACB57',
    borderWidth: 1,
  },
  selectedLightGreen: {
    backgroundColor: '#E3FFD6',
    borderColor: '#67C73B',
    borderWidth: 1,
  },
  selectedGreen: {
    backgroundColor: '#CEFFD6',
    borderColor: '#28A53B',
    borderWidth: 1,
  },
  redText: {
    color: '#EB4B42',
  },
  orangeText: {
    color: '#C66034',
  },
  yellowText: {
    color: '#C6B00C',
  },
  lightGreenText: {
    color: '#67C73B',
  },
  greenText: {
    color: '#28A53B',
  },
  questionscontainer:{
    flexDirection:'row',
  },
  opttext:{
    color:'#637D92',
    fontSize:12,
    fontWeight:'600',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    marginTop: 25, 
    margin: 20,
  },
  section: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    color: '#000', 
    fontSize: 16,
    fontWeight: '600',
  },
  optional: {
    fontSize: 14,
    color: '#637D92',
    marginLeft: 4,
  },
  textInput: {
    color: '#000',
    marginTop: 12,
    backgroundColor: '#F7F8FA',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E7E7E7',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 16,
  },
  submitButton: {
    backgroundColor: '#0C36FF',
    height: 39,
    width: 320,
    alignSelf: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});


export default styles;