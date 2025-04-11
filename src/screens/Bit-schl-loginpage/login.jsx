import {
  SafeAreaView,
  Text,
  View,
  Keyboard,
  Pressable,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import Loginimg from '../../assets/login-page/img/loginimg.svg';
import styles from './loginsty';
import { TextInput } from 'react-native-paper';
import React, { useState } from 'react';
import Separator from '../../assets/login-page/img/separator';
import Googleicon from '../../assets/login-page/img/google';
import Tickicon from '../../assets/basic-img/tick';
import Tickbox from '../../assets/basic-img/tickbox';

const Login = () => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [checked, setChecked] = useState(false);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View>
            <Text style={styles.hi}>Hi !</Text>
            <Text style={styles.sectoptext}>Login to continue</Text>
            <Loginimg height={267} width={290} style={styles.logimg} />

            <View style={styles.inputcontainer}>
              <TextInput
                style={styles.input}
                label="Mobile"
                value={mobile}
                onChangeText={setMobile}
                mode="outlined"
                activeOutlineColor="#2842C4"
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                activeOutlineColor="#2842C4"
                secureTextEntry
              />
            </View>

            <Pressable style={styles.checkboxContainer} onPress={() => setChecked(!checked)}>
              {checked ? <Tickbox height={18} width={18} /> : <Tickicon height={18} width={18} />}
              <Text style={styles.checkboxText}>I agree with the Privacy Policy</Text>
            </Pressable>

            <Pressable style={styles.pressablebtn}>
              <View style={styles.btn}>
                <Text style={styles.btntext}>LOGIN</Text>
              </View>
            </Pressable>

            <View style={styles.separator}>
              <Separator />
            </View>
            <Text style={styles.googletext}>Login with Google</Text>

            <Pressable style={styles.googleauthcontainer}>
              <Googleicon height={18} width={18} style={styles.googleicon} />
              <Text style={styles.googleauthtext}>Continue with Google</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default Login;
