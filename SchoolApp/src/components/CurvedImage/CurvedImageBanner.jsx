import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

const CurvedImageBanner = ({ imageSource }) => {
  return (
    <View style={styles.wrapper}>
      <Image
        source={imageSource}
        style={styles.bannerImage}
        resizeMode="cover"
      />
      <Svg
        width={width}
        height={80}
        viewBox={`0 0 ${width} 80`}
        style={styles.curve}
      >
        <Path
          fill="#FFF"
          d={`M0,0 C${width * 0.25},50 ${width * 0.75},50 ${width},0 L${width},80 L0,80 Z`}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FEE2E2',
  },
  bannerImage: {
    width: '100%',
    height: 250,
  },
  curve: {
    position: 'absolute',
    bottom: -1,
  },
});

export default CurvedImageBanner;
