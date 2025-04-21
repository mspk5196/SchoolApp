import { StyleSheet } from "react-native";

const styles = StyleSheet.create ({
      
       Navbar:{
        marginTop:90,
        marginLeft:35,
        flexDirection:'row',
        alignItems:'center',
        gap:10,
       },
       text: {
        color:'#323F49',
        fontSize: 19,
        fontWeight:'700',
        marginTop:10,
       },
        container: {
            
            backgroundColor: '#F5F5F5',
            padding: 10,
        },
        Navbar: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
        },
        homelogo: {
          marginTop:10,
            marginRight:10,
            marginLeft:15
        },
        card: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 25,
            marginVertical: 8,
            marginHorizontal: 5,
            borderRadius: 15,
            marginBottom:20,
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
    });

export default styles