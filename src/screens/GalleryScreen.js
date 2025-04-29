import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  Alert, 
  Modal, 
  SafeAreaView 
} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper function to generate a unique ID for each image
const generateUniqueId = () =>
  Date.now().toString() + Math.random().toString(36).substring(2);

const STORAGE_KEY = '@images';

const GalleryScreen = () => {
  const [images, setImages] = useState([]); 
  const [selectedImage, setSelectedImage] = useState(null);

  // Load images from local storage on component mount
  useEffect(() => {
    const loadImages = async () => {
      try {
        const storedImages = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedImages !== null) {
          setImages(JSON.parse(storedImages));
        }
      } catch (error) {
        console.error("Error loading images from storage:", error);
      }
    };
    loadImages();
  }, []);

  // Save images to local storage whenever they change
  useEffect(() => {
    const saveImages = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(images));
      } catch (error) {
        console.error("Error saving images to storage:", error);
      }
    };
    saveImages();
  }, [images]);

  const pickImages = async () => {
    // Request permission to access media library
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Denied", "Media library permission is required!");
      return;
    }
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });
    
    console.log("Picker Result:", result);
    
    if (!result.canceled) {
      let newImages = [];
      if (result.assets && result.assets.length > 0) {
        // Create a stable object for each selected image
        newImages = result.assets.map(asset => ({
          id: generateUniqueId(),
          uri: asset.uri,
        }));
      } else if (result.uri) {
        newImages = [{
          id: generateUniqueId(),
          uri: result.uri,
        }];
      }
      if (newImages.length > 0) {
        setImages(prev => [...prev, ...newImages]);
      }
    }
  };

  const deleteImage = (id) => {
    Alert.alert('Delete Photo', 'Are you sure you want to delete this photo?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: () => setImages(images.filter(image => image.id !== id)) }
    ]);
  };

  const onDragEnd = ({ data }) => {
    // Update the images state with the new order
    setImages(data);
  };

  const deleteAllImages = () => {
    Alert.alert('Delete All', 'Are you sure you want to delete all photos?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete All', onPress: () => setImages([]) }
    ]);
  };

  const renderItem = ({ item, drag, isActive }) => (
    <View style={[styles.imageContainer, isActive && styles.activeImageContainer]}>
      {/* Tapping the image opens full-screen modal */}
      <TouchableOpacity onPress={() => setSelectedImage(item.uri)} style={{ flex: 1 }}>
        <Image source={{ uri: item.uri }} style={styles.image} />
      </TouchableOpacity>
      {/* Drag handle to initiate drag */}
      <TouchableOpacity onLongPress={drag} style={styles.dragHandle}>
        <Ionicons name="reorder-three-outline" size={24} color="white" />
      </TouchableOpacity>
      {/* Delete button */}
      <TouchableOpacity onPress={() => deleteImage(item.id)} style={styles.deleteButton}>
        <Ionicons name="trash" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <Text style={styles.pageTitle}>Photo Gallery</Text>
        <TouchableOpacity
          style={[styles.floatingButton, styles.deleteAllButton]}
          onPress={deleteAllImages}
        >
          <Ionicons name="trash" size={28} color="white" />
        </TouchableOpacity>
      </View>
      
      <DraggableFlatList
        data={images}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        onDragEnd={onDragEnd}
        activationDistance={20}
        containerStyle={styles.gridContainer}
      />
      
      {/* Floating Add Photos Button */}
      <TouchableOpacity style={styles.bottomButton} onPress={pickImages}>
        <Ionicons name="add-circle" size={40} color="white" />
      </TouchableOpacity>
      
      {/* Full-Screen Image Modal */}
      <Modal visible={!!selectedImage} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedImage(null)}>
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          <Image source={{ uri: selectedImage }} style={styles.fullImage} />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5', 
    padding: 10,
    alignItems: 'center',
  },
  headerBar: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#BBDEFB', // Light blue background for the header
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 20,
    elevation: 4,
  },
  pageTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#0277BD', 
    textAlign: 'center'
  },
  floatingButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 30,
  },
  deleteAllButton: {
    backgroundColor: '#d9534f',
  },
  gridContainer: { 
    width: '100%',
    paddingBottom: 80, // Extra padding at the bottom for the add button
  },
  imageContainer: { 
    flex: 1,
    margin: 5,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#eee',
    aspectRatio: 1,
  },
  activeImageContainer: {
    opacity: 0.8,
  },
  image: { 
    width: '100%', 
    height: '100%' 
  },
  dragHandle: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 4,
    borderRadius: 4,
  },
  deleteButton: { 
    position: 'absolute', 
    top: 5, 
    right: 5, 
    backgroundColor: 'rgba(220,53,69,0.8)', 
    padding: 4, 
    borderRadius: 15,
  },
  bottomButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#00796B',
    padding: 10,
    borderRadius: 50,
    elevation: 5,
  },
  modalContainer: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.9)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  fullImage: { 
    width: '90%', 
    height: '80%', 
    resizeMode: 'contain',
    borderRadius: 10,
  },
  modalClose: { 
    position: 'absolute', 
    top: 40, 
    right: 20,
  },
});

export default GalleryScreen;