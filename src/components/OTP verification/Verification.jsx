import React, { useState, useEffect } from 'react';
import { View,  Text, TextInput,  TouchableOpacity,  ScrollView,  KeyboardAvoidingView,  Platform,  Alert} from 'react-native';
import styles from './Verificationsty';
import Arrow from '../../assets/arrow.svg';
import Home from '../../assets/Home2.svg';

const OTPVerification = ({navigation}) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else {
      setIsResendDisabled(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus to next input
    if (value && index < 3) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleResendOtp = () => {
    setTimer(30);
    setIsResendDisabled(true);
    // Add your resend OTP logic here
    Alert.alert('OTP Resent', 'A new OTP has been sent to your mobile number');
  };

  const handleSubmit = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length === 4) {
      // Add your OTP verification logic here
      Alert.alert('Success', 'OTP verified successfully');
    } else {
      Alert.alert('Error', 'Please enter a valid 4-digit OTP');
    }
  };

  const inputsRef = React.useRef([]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.activityHeader}>
        <TouchableOpacity onPress={()=>navigation.goBack()}>
          <Arrow height={30} width={30} style={styles.homeIcon} />
        </TouchableOpacity>
        <Text style={styles.activityText}>OTP Verification</Text>
      </View>

      <View style={styles.underline} />
        
      <View style={styles.studentInfo}>
      <View style={styles.profilePic} />
            <View>
                <View style={styles.stdInfo}>
                    <Text style={styles.title}>Student</Text>
                    <Text style={styles.stdid}>2024V1023</Text>
                </View>
                <Text style={styles.date}>29/10/23</Text>
            </View>
       </View>
        
        <View style={styles.feeSection}>
            <View style={styles.feeinfo}>
                <Text style={styles.sectionTitle}>Fee Payment</Text>
                <Text style={styles.feeType}>Academic Fee</Text>
            </View>
          <Text style={styles.amount}>Amount – $23000</Text>
        </View>
    
        <Text style={styles.sectionTitle1}>Description</Text>
        <Text style={styles.description}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis no
        </Text>
        

        
        
        
        <View style={styles.otpContainer}>
            <View style={styles.otpInstruction}>
                <Text style={styles.otptext}> Enter OTP sent to +919825378374 </Text>
            </View>
          {[0, 1, 2, 3].map((index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputsRef.current[index] = ref)}
              style={styles.otpInput}
              keyboardType="numeric"
              maxLength={1}
              onChangeText={(value) => handleOtpChange(value, index)}
              value={otp[index]}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
                  inputsRef.current[index - 1].focus();
                }
              }}
            />
          ))}
        </View>
        
        <TouchableOpacity
          onPress={handleResendOtp}
          disabled={isResendDisabled}
          style={styles.resendButton}
        >
          <Text style={[styles.resendText, isResendDisabled && styles.disabledText]}>
            Resend OTP in: 00.{timer.toString().padStart(2, '0')}
          </Text>
        </TouchableOpacity>
        <View style={styles.Buttons}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeButton}>
            <Home/>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};



export default OTPVerification;