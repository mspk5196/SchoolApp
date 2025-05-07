import { SafeAreaView, TouchableOpacity } from "react-native";
import Homeicon from "../../assets/Basicimg/Home.svg";
import { useNavigation } from "@react-navigation/native";

const Footer = () => {
    const navigation = useNavigation();

  return (
    <SafeAreaView>
        <TouchableOpacity style={styles.footer}
      onPress={() => navigation.navigate('menu')}>
        <Homeicon/>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = {
    footer: {
        position: 'absolute',
        bottom: 20,
        right: 23,
        backgroundColor: '#AEBCFF',
        padding: 12,
        borderRadius: 100,
      },
};

export default Footer;