// src/screens/EditProfileScreen.js
import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, Platform, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { ProfileContext } from '../context/ProfileContext';

const EditProfileScreen = ({ navigation }) => {
  const { profile, setProfile } = useContext(ProfileContext);

  // State for profile picture, default to current profile photo or a placeholder
  const [photo, setPhoto] = useState(profile.photo || 'https://via.placeholder.com/100');
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age);
  const [gender, setGender] = useState(profile.gender);
  const [condition, setCondition] = useState(profile.condition);
  const [address, setAddress] = useState(profile.address);
  const [contact, setContact] = useState(profile.contact);

  // State to control modal visibility
  const [modalVisible, setModalVisible] = useState(false);

  // Request permission to access the image library when the component mounts
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

      // For the latest expo-image-picker, check result.canceled and result.assets
      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error picking image: ', error);
    }
  };

  // Show alert with options to view or change the photo
  const openPhotoOptions = () => {
    Alert.alert(
      "Profile Photo",
      "What would you like to do?",
      [
        {
          text: "View Photo",
          onPress: () => setModalVisible(true),
        },
        {
          text: "Change Photo",
          onPress: pickImage,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const handleSave = () => {
    const updatedProfile = {
      name: name.trim() !== '' ? name : profile.name,
      age: age.trim() !== '' ? age : profile.age,
      gender: gender.trim() !== '' ? gender : profile.gender,
      condition: condition.trim() !== '' ? condition : profile.condition,
      address: address.trim() !== '' ? address : profile.address,
      contact: contact.trim() !== '' ? contact : profile.contact,
      photo, // save the selected photo
    };

    setProfile(updatedProfile);
    Alert.alert('Profile Updated', 'Your details have been updated successfully.');
    navigation.goBack();
  };

  return (
    <LinearGradient colors={['#BBDEFB', '#90CAF9']} style={styles.container}>
      <Text style={styles.header}>Edit Profile</Text>
      <View style={styles.form}>
        {/* Display current profile photo */}
        <TouchableOpacity onPress={openPhotoOptions} style={styles.photoContainer}>
          <Image source={{ uri: photo }} style={styles.photo} />
          <Text style={styles.changePhotoText}> ProfilePhoto</Text>
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

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for viewing the profile photo */}
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
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
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
  label: { fontSize: 18, color: '#212121', marginBottom: 5 },
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
  buttonText: { fontSize: 18, color: '#fff', fontWeight: '600' },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
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
    color: '#fff',
  },
});

export default EditProfileScreen;
