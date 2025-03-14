import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/splash.png')} style={styles.splashImage} />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#3498db',
      width: '100%', // Ensure it takes full width
      height: '100%', // Ensure it takes full height
    },
    splashImage: {
      width: '100%', // Make it cover the entire width
      height: '100%', // Make it cover the entire height
      resizeMode: 'cover', // Ensure it fills the screen
    },
  });
  
