// App.js
import React, { useState, useEffect, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import SplashScreenComponent from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import TabNavigator from './src/navigation/TabNavigator';
import { ProfileProvider, ProfileContext } from './src/context/ProfileContext';

const AppContent = () => {
  // useContext here works because AppContent is wrapped in ProfileProvider
  const { isAuthenticated, setIsAuthenticated } = useContext(ProfileContext);
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <NavigationContainer>
      {isSplashVisible ? (
        <SplashScreenComponent />
      ) : !isAuthenticated ? (
        // LoginScreen should update authentication state
        <LoginScreen onLogin={() => setIsAuthenticated(true)} />
      ) : (
        <TabNavigator />
      )}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <ProfileProvider>
      <AppContent />
    </ProfileProvider>
  );
}
