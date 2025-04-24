import React from 'react';
import {View, Text, StyleSheet, TextInput} from 'react-native';
import Arrow from '../../assets/arrow.svg';
import styles from './gamaincss';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
const GaMain = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Arrow width={wp('9%')} height={wp('9%')} />
        <Text style={styles.headerText}>General Activity</Text>
      </View>
      <View style={styles.headerBorder} />
    </View>
  );
};

export default GaMain;
