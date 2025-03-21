// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import firebase from '../config/firebaseConfig'; // Ensure this file uses firebase/compat/app, etc.

const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Handle user login using Firebase Auth
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Both email and password are required.');
      return;
    }
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      Alert.alert('Success', 'Logged in successfully!');
      onLogin(); // Update the auth state in App.js
    } catch (error) {
      Alert.alert('Login Error','Check the email and password');
    }
  };

  // Handle user sign up using Firebase Auth
  const handleSignUp = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Both email and password are required.');
      return;
    }
    try {
      await firebase.auth().createUserWithEmailAndPassword(email, password);
      Alert.alert('Success', 'Account created successfully!');
      onLogin();
    } catch (error) {
      Alert.alert('Sign Up Error', 'Check the email and password');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Alzheimer's Companion</Text>
      <Text style={styles.subTitle}>Login</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={24} color="#0277BD" style={styles.inputIcon} />
        <TextInput
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={24} color="#0277BD" style={styles.inputIcon} />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />
      </View>
      <TouchableOpacity onPress={handleLogin} style={styles.button}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSignUp} style={[styles.button, styles.signUpButton]}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#E3F2FD', 
    justifyContent: 'center', 
    padding: 20 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#0277BD', 
    textAlign: 'center', 
    marginBottom: 10 
  },
  subTitle: { 
    fontSize: 20, 
    color: '#0277BD', 
    textAlign: 'center', 
    marginBottom: 30 
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'white', 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#B3E5FC', 
    paddingHorizontal: 10, 
    marginBottom: 15 
  },
  inputIcon: { 
    marginRight: 10 
  },
  input: { 
    flex: 1, 
    height: 50, 
    color: '#333' 
  },
  button: { 
    backgroundColor: '#00796B', 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginBottom: 15 
  },
  signUpButton: { 
    backgroundColor: '#0288D1' 
  },
  buttonText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
});

export default LoginScreen;
