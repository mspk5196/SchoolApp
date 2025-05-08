import { StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const styles = StyleSheet.create ({
      container: {
        backgroundColor: '#FAFAFA',
        flex: 1,
    },
    HomeIcon: {
        width: 19,
        height: 17,
    },
    Header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    HeaderTxt: {
        fontSize: 23,
        fontWeight: '600',
        color: '#000000',
        marginLeft: 10,
    },
        container: {
            backgroundColor: '#FaFaFa',
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
            marginBottom:10,
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