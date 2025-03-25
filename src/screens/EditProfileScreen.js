// src/screens/EditProfileScreen.js
import React, { useState, useContext, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Image, 
  Platform, 
  Modal,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import firebase from '../config/firebaseConfig';
import { ProfileContext } from '../context/ProfileContext';

const EditProfileScreen = ({ navigation }) => {
  // Destructure user and saveUserProfile along with other values
  const { profile, setProfile, signOut, saveUserProfile, user } = useContext(ProfileContext);

  const [photo, setPhoto] = useState(profile.photo || 'https://via.placeholder.com/100');
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age);
  const [gender, setGender] = useState(profile.gender);
  const [condition, setCondition] = useState(profile.condition);
  const [address, setAddress] = useState(profile.address);
  const [contact, setContact] = useState(profile.contact);
  // New caregiver fields
  const [caregiverName, setCaregiverName] = useState(profile.caregiverName || '');
  const [caregiverNumber, setCaregiverNumber] = useState(profile.caregiverNumber || '');

  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
  
      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error picking image: ', error);
    }
  };

  const openPhotoOptions = () => {
    Alert.alert(
      "Profile Photo",
      "What would you like to do?",
      [
        { text: "View Photo", onPress: () => setModalVisible(true) },
        { text: "Change Photo", onPress: pickImage },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const handleSave = async () => {
    const updatedProfile = {
      name: name.trim() !== '' ? name : profile.name,
      age: age.trim() !== '' ? age : profile.age,
      gender: gender.trim() !== '' ? gender : profile.gender,
      condition: condition.trim() !== '' ? condition : profile.condition,
      address: address.trim() !== '' ? address : profile.address,
      contact: contact.trim() !== '' ? contact : profile.contact,
      photo,
      caregiverName: caregiverName.trim() !== '' ? caregiverName : profile.caregiverName,
      caregiverNumber: caregiverNumber.trim() !== '' ? caregiverNumber : profile.caregiverNumber,
    };

    // Update local context
    setProfile(updatedProfile);
    // Save the updated profile to Firestore
    if (user && user.uid) {
      await saveUserProfile(user.uid, updatedProfile);
    }
    Alert.alert('Profile Updated', 'Your details have been updated successfully.');
    navigation.goBack();
  };

  const handleSignOut = async () => {
    try {
      await firebase.auth().signOut();
      signOut();
    } catch (error) {
      Alert.alert('Sign Out Error', error.message);
    }
  };

  return (
    <LinearGradient colors={['#BBDEFB', '#90CAF9']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Edit Profile</Text>
        <View style={styles.form}>
          <TouchableOpacity onPress={openPhotoOptions} style={styles.photoContainer}>
            <Image source={{ uri: photo }} style={styles.photo} />
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
    
          <Text style={styles.label}>Name:</Text>
          <TextInput 
            style={styles.input} 
            value={name} 
            onChangeText={setName} 
            placeholder="Enter name" 
            placeholderTextColor="#777"
          />
    
          <Text style={styles.label}>Age:</Text>
          <TextInput 
            style={styles.input} 
            value={age} 
            onChangeText={setAge} 
            placeholder="Enter age" 
            keyboardType="numeric"
            placeholderTextColor="#777"
          />
    
          <Text style={styles.label}>Gender:</Text>
          <TextInput 
            style={styles.input} 
            value={gender} 
            onChangeText={setGender} 
            placeholder="Enter gender" 
            placeholderTextColor="#777"
          />
    
          <Text style={styles.label}>Condition:</Text>
          <TextInput 
            style={styles.input} 
            value={condition} 
            onChangeText={setCondition} 
            placeholder="Enter condition" 
            placeholderTextColor="#777"
          />
    
          <Text style={styles.label}>Address:</Text>
          <TextInput 
            style={styles.input} 
            value={address} 
            onChangeText={setAddress} 
            placeholder="Enter address" 
            placeholderTextColor="#777"
          />
    
          <Text style={styles.label}>Emergency Contact:</Text>
          <TextInput 
            style={styles.input} 
            value={contact} 
            onChangeText={setContact} 
            placeholder="Enter emergency contact" 
            placeholderTextColor="#777"
          />

          {/* Caregiver Info */}
          <Text style={styles.label}>Caregiver Name:</Text>
          <TextInput 
            style={styles.input} 
            value={caregiverName} 
            onChangeText={setCaregiverName} 
            placeholder="Enter caregiver name" 
            placeholderTextColor="#777"
          />
    
          <Text style={styles.label}>Caregiver Phone Number:</Text>
          <TextInput 
            style={styles.input} 
            value={caregiverNumber} 
            onChangeText={setCaregiverNumber} 
            placeholder="Enter caregiver phone number" 
            keyboardType="phone-pad"
            placeholderTextColor="#777"
          />
    
          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Save Profile</Text>
          </TouchableOpacity>
    
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
    
        <Modal visible={modalVisible} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Image source={{ uri: photo }} style={styles.modalImage} />
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#212121',
    textAlign: 'center',
    marginVertical: 20,
  },
  form: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 20,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#212121',
  },
  changePhotoText: {
    marginTop: 5,
    fontSize: 16,
    color: '#212121',
  },
  label: { 
    fontSize: 18, 
    color: '#212121', 
    marginBottom: 5 
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    color: '#212121',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { 
    fontSize: 18, 
    color: '#fff', 
    fontWeight: '600' 
  },
  signOutButton: {
    backgroundColor: '#D32F2F',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  signOutButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  modalContainer: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    width: '90%', 
    backgroundColor: '#E3F2FD', 
    padding: 25, 
    borderRadius: 15, 
    alignItems: 'center' 
  },
  modalImage: { 
    width: 450, 
    height: 450, 
    borderRadius: 10, 
    marginBottom: 15, 
  },
  closeButton: { 
    backgroundColor: '#4CAF50', 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 8, 
  },
  closeButtonText: { 
    fontSize: 16, 
    color: 'white' 
  },
});

export default EditProfileScreen;
