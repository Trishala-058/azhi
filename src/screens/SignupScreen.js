// src/screens/SignupScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import firebase from '../config/firebaseConfig';
import { ProfileContext } from '../context/ProfileContext';

const SignupScreen = ({ navigation }) => {
  // Patient details
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [condition, setCondition] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  
  // Caregiver details
  const [caregiverName, setCaregiverName] = useState('');
  const [caregiverNumber, setCaregiverNumber] = useState('');
  
  // Auth details
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { saveUserProfile } = useContext(ProfileContext);

  const handleSignUp = async () => {
    // Ensure all fields are provided
    if (!name || !age || !gender || !condition || !address || !contact ||
        !caregiverName || !caregiverNumber || !email || !password) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }
    try {
      // Create new user with Firebase Auth
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      const uid = userCredential.user.uid;

      // Prepare complete profile data including caregiver info
      const profileData = { 
        name, 
        age, 
        gender, 
        condition, 
        address, 
        contact, 
        email,
        caregiverName,
        caregiverNumber:caregiverNumber
      };

      // Save profile data to Firestore
      await saveUserProfile(uid, profileData);
      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Sign Up Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      {/* Patient Information */}
      <TextInput placeholder="Patient Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Age" value={age} onChangeText={setAge} style={styles.input} keyboardType="numeric" />
      <TextInput placeholder="Gender" value={gender} onChangeText={setGender} style={styles.input} />
      <TextInput placeholder="Condition" value={condition} onChangeText={setCondition} style={styles.input} />
      <TextInput placeholder="Address" value={address} onChangeText={setAddress} style={styles.input} />
      <TextInput placeholder="Patient Contact" value={contact} onChangeText={setContact} style={styles.input} />

      {/* Caregiver Information */}
      <TextInput placeholder="Caregiver Name" value={caregiverName} onChangeText={setCaregiverName} style={styles.input} />
      <TextInput placeholder="Caregiver Number" value={caregiverNumber} onChangeText={setCaregiverNumber} style={styles.input} />

      {/* Authentication Information */}
      <TextInput 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail} 
        style={styles.input} 
        keyboardType="email-address" 
        autoCapitalize="none" 
      />
      <TextInput 
        placeholder="Password" 
        value={password} 
        onChangeText={setPassword} 
        style={styles.input} 
        secureTextEntry 
      />
      <TouchableOpacity onPress={handleSignUp} style={styles.button}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 20 }}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
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
  input: { 
    backgroundColor: 'white', 
    padding: 15, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#B3E5FC', 
    marginBottom: 15, 
    color: '#333' 
  },
  button: { 
    backgroundColor: '#00796B', 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  buttonText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  linkText: {
    color: '#0277BD',
    fontSize: 16,
    textAlign: 'center'
  }
});

export default SignupScreen;
