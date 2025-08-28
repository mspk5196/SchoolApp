const styles = {
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: 10,
      },
    
      // Header
      activityHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 15,
        paddingVertical:10,
        gap:5,
      },
      homeIcon: {
        width: 24,
        height: 24,
        marginRight: 10,
        marginTop:40,
      },
      activityText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#000",
        marginTop:0.5,
      },
    
      // Underline
      underline: {
        borderBottomWidth: 0.9,
        borderBottomColor: 'black',  
        width: 500,  
        alignSelf: 'center', 
      },
    
  



    // Survey Card Styling
    card: {
      backgroundColor: "#FFF",
      padding: 15,
      paddingVertical:30,
      borderRadius: 12,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 5,
      elevation: 0.5,
    },
  



    // Card Header (Title & Status)
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#000",
    },
    statusContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    statusDot: {
      width: 10,
      height: 10,
      borderRadius: 8,
      marginRight: 5,
    },
    statusText: {
      fontSize: 14,
      fontWeight:'bold',
      color: "#7991A4",
    },
  


    //Info Section (Grade & Students)
    gradeText: {
      fontSize: 15,
      marginTop: 5,
      fontWeight:'600',
      color: "#333",
    },
    studentCount: {
      fontSize: 15,
      color: "#27AE60",
      marginTop: 3,
    },
  


    //Time Styling (Corrected Alignment)
    info: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 5,
    },
    activeTime: {
      fontSize: 14,
      color: "#EB4B42",
    },
    inactiveTime: {
      fontSize: 14,
      color: "#7991A4",
    },



  
    // Survey Button
    surveyButton: {
      backgroundColor: "#3557FF",
      paddingVertical: 10,
      borderRadius: 25,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 10,
    },
    surveyButtonText: {
      color: "#FFF",
      fontSize: 14,
      fontWeight: "bold",
    },
  



   //Icons
   activityIcons: {
    position: "absolute",
    bottom: 30,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  addIcon: {
    // position: 'absolute',
    // bottom: 30,
    // right: 20,
    // padding: 20,
    backgroundColor: '#0C36FF',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  homeIcon: {
    width: 50,
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  };
  
  export default styles;
  