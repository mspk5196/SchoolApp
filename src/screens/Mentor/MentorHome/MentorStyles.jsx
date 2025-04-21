import { StyleSheet } from "react-native";

const styles = StyleSheet.create ({
      
    HomeIcon: {
        width: 25,
        height: 25,
    },
    Header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E3E3E3',
    },
    HeaderTxt: {
        fontSize: 27,
        fontWeight: 'bold',
        color: '#000000',
        marginLeft: 10,
    },
        container: {
            backgroundColor: '#F5F5F5',
            flex: 1,
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