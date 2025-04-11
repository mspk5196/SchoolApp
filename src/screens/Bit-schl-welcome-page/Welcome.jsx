import { Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native'; 
import styles from './Welcomesty';
import Welcomeimg from '../../assets/welcome-page/img/welcome.svg';
import { SafeAreaView } from 'react-native-safe-area-context';

const Welcome = () => {
  const navigation = useNavigation(); 

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <View>
          <Text style={styles.title}>BIT SCHOOLS</Text>
          <Welcomeimg height={330} width={330} style={styles.image} />
          <Text style={styles.mainText}>Hello !</Text>
          <Text style={styles.text2}>
            "Welcome back! Please log {"\n"}in to continue"
          </Text>
          <Pressable 
            style={styles.pressablebtn} 
            onPress={() => navigation.navigate('Login')} 
          >
            <View style={styles.btn}>
              <Text style={styles.btntext}>LOGIN</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Welcome;
