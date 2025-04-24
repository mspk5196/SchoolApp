import { StyleSheet } from "react-native";


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 5,
        paddingTop: 10,
    },
    scrollContainer: {
        padding: 20,
      },
    

    //Header
    activityText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 5,
      marginTop:5,
    },
    activityHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
      homeIcon: {
        width: 24,
        height: 24,
        marginRight: 8,
        marginTop: 5,
    },


    // Underline
    underline: {
        borderBottomWidth: 0.9,
        borderBottomColor: 'black',  
        width: 500,  
        alignSelf: 'center', 
        marginBottom:8,
        bottom:10,
    },


    //Student
    studentInfo: {
        marginBottom: 20,
        flexDirection:'row',
        marginTop:20,
    },
    profilePic: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#ddd",
      marginRight: 10,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#000",
    },
    stdid: {
      fontSize: 14,
      color: "#666",
    },
    date: {
        fontSize: 13,
        color: "#797979",
        bottom:65,
        left:210,
    },
      stdInfo:{
        flexDirection:'column',
        marginBottom:20,
        bottom:4,
    },

    


    //FeeSection
    feeSection: {
      marginBottom: 10,
      bottom:20,
    },
    feeinfo:{
        flexDirection:'row',
        gap:10,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight:'600',
      color:'#333',
      marginBottom: 10,
      marginLeft:10,
    },
    feeType: {
        fontSize: 14,
        fontWeight:'600',
        color:'#333',
        marginBottom: 10,
        marginLeft:10,
    },
    amount: {
      fontSize: 18,
      fontWeight: '600',
      color: '#333',
      marginLeft:10,
    },



    //Description
    sectionTitle1: {
        fontSize: 14,
        fontWeight:'600',
        color:'#333',
        marginBottom: 15,
        bottom:15,
        marginLeft:10,
      },
    description: {
      color: '#333',
      bottom:25,
      fontSize: 14,
      fontWeight:'500',
      fontStyle: 'italic',
      marginVertical: 8,
      width:315,
      lineHeight: 22,
      borderBlockColor:'#666',
      borderWidth:0.1,
      marginLeft:8,
      padding:10,
      borderRadius:2,
      backgroundColor:"#F7F8FA"
    },




    //OTP
    otpInstruction: {
      flexDirection:'column',
    },
    otpContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 140,
    },
    otpInput: {
      width: 60,
      height: 60,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      textAlign: 'center',
      fontSize: 24,
      color:'#333',
      backgroundColor: '#fff',
      marginTop:10,
      right:250,
      padding:10,
      paddingBottom:20,
    },
    otptext:{
        color:'#323F49',
        fontSize:16,
        bottom:30,
    },
    resendButton: {
      alignItems: 'center',
      marginBottom: 40,
      borderRadius:20,
    },
    resendText: {
      color: '#2c7be5',
      fontWeight: 'bold',
      right:95,
      top:10,
    },
    disabledText: {
      color: '#999',
    },
    submitButton: {
      backgroundColor: '#2c7be5',
      padding: 15,
      width:280,
      height:50,
      marginRight:12,
      borderRadius: 30,
      alignItems: 'center',
    },
    submitButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
    },
    Buttons:{
        flexDirection:'row',
    },
    homeButton: {
        padding: 1,
        justifyContent:'center',
    },
  });

  export default styles;