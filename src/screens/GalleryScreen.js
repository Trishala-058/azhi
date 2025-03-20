import React, { useState } from 'react';
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
import DraggableGrid from 'react-native-draggable-grid';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const GalleryScreen = () => {
  const [images, setImages] = useState([]); // stores image URIs
  const [selectedImage, setSelectedImage] = useState(null);

  const pickImages = async () => {
    // Request permission to access the media library
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Denied", "Permission to access media library is required!");
      return;
    }
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // using this option as requested
      allowsMultipleSelection: true,
      quality: 1,
    });
    
    console.log("Image Picker Result:", result);
    
    if (!result.canceled) {
      let newImages = [];
      // If multiple images are selected, result.assets is an array
      if (result.assets && result.assets.length > 0) {
        newImages = result.assets.map(asset => asset.uri);
      } else if (result.uri) {
        // Fallback if only a single image is selected
        newImages = [result.uri];
      }
      if (newImages.length > 0) {
        setImages(prevImages => [...prevImages, ...newImages]);
      }
    }
  };

  const deleteImage = (uri) => {
    Alert.alert('Delete Photo', 'Are you sure you want to delete this photo?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: () => setImages(images.filter(image => image !== uri)) }
    ]);
  };

  // DraggableGrid requires an array of objects with a unique key.
  const data = images.map((uri, index) => ({ uri, key: index.toString() }));

  const renderGridItem = (item) => (
    <View style={styles.imageContainer}>
      <TouchableOpacity 
        onPress={() => setSelectedImage(item.uri)}
        style={{ flex: 1 }}
      >
        <Image source={{ uri: item.uri }} style={styles.image} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteImage(item.uri)} style={styles.deleteButton}>
        <Ionicons name="trash" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );

  const onDragRelease = (newData) => {
    // Update images state with new order
    setImages(newData.map(item => item.uri));
  };

  const deleteAllImages = () => {
    Alert.alert('Delete All', 'Are you sure you want to delete all photos?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete All', onPress: () => setImages([]) }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.pageTitle}>Photo Gallery</Text>
      
      {/* Floating buttons at the top-right */}
      <View style={styles.floatingButtons}>
        <TouchableOpacity style={styles.floatingButton} onPress={pickImages}>
          <Ionicons name="add-circle" size={28} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.floatingButton, styles.deleteAllButton]} onPress={deleteAllImages}>
          <Ionicons name="trash" size={28} color="white" />
        </TouchableOpacity>
      </View>
      
      <DraggableGrid
        data={data}
        renderItem={renderGridItem}
        numColumns={2}
        onDragRelease={onDragRelease}
        containerStyle={styles.gridContainer}
      />
      
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
    alignItems: 'center',
    paddingTop: 20,
  },
  pageTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginTop: 30,
    marginBottom: 20, 
    color: '#333' 
  },
  floatingButtons: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'column',
    zIndex: 10,
  },
  floatingButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 30,
    marginBottom: 10,
  },
  deleteAllButton: {
    backgroundColor: '#d9534f',
  },
  gridContainer: { 
    paddingHorizontal: 10, 
    paddingBottom: 20,
  },
  imageContainer: { 
    position: 'relative', 
    margin: 10, 
    borderRadius: 10, 
    overflow: 'hidden', 
    backgroundColor: '#ddd',
    width: 240, 
    height: 240,
  },
  image: { 
    width: '100%', 
    height: '100%', 
    borderRadius: 10 
  },
  deleteButton: { 
    position: 'absolute', 
    top: 10, 
    right: 10, 
    backgroundColor: 'rgba(220,53,69,0.8)', 
    borderRadius: 15, 
    padding: 6 
  },
  modalContainer: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.9)', 
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
    right: 20 
  },
});

export default GalleryScreen;
