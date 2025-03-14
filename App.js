// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import SplashScreenComponent from './src/screens/SplashScreen';
import TabNavigator from './src/navigation/TabNavigator';
import { ProfileProvider } from './src/context/ProfileContext';

export default function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ProfileProvider>
      <NavigationContainer>
        {isSplashVisible ? <SplashScreenComponent /> : <TabNavigator />}
      </NavigationContainer>
    </ProfileProvider>
  );
}
