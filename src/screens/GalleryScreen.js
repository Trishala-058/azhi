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
import DraggableFlatList from 'react-native-draggable-flatlist';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const GalleryScreen = () => {
  const [images, setImages] = useState([]); // array of image URIs
  const [selectedImage, setSelectedImage] = useState(null);

  const pickImages = async () => {
    // Request permission to access media library
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Denied", "Media library permission is required!");
      return;
    }
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // using deprecated option as requested
      allowsMultipleSelection: true,
      quality: 1,
    });
    
    console.log("Picker Result:", result);
    
    if (!result.canceled) {
      let newImages = [];
      if (result.assets && result.assets.length > 0) {
        // Multiple images selected
        newImages = result.assets.map(asset => asset.uri);
      } else if (result.uri) {
        // Fallback: single image selected
        newImages = [result.uri];
      }
      if (newImages.length > 0) {
        setImages(prev => [...prev, ...newImages]);
      }
    }
  };

  const deleteImage = (uri) => {
    Alert.alert('Delete Photo', 'Are you sure you want to delete this photo?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: () => setImages(images.filter(image => image !== uri)) }
    ]);
  };

  // Use image URI combined with index as unique key
  const data = images.map((uri, index) => ({ key: `${uri}_${index}`, uri }));

  const renderItem = ({ item, drag, isActive }) => (
    <View style={[styles.imageContainer, isActive && styles.activeImageContainer]}>
      {/* Tapping the image opens full-screen modal */}
      <TouchableOpacity
        onPress={() => setSelectedImage(item.uri)}
        style={{ flex: 1 }}
      >
        <Image source={{ uri: item.uri }} style={styles.image} />
      </TouchableOpacity>
      {/* Drag handle to initiate drag */}
      <TouchableOpacity onLongPress={drag} style={styles.dragHandle}>
        <Ionicons name="reorder-three-outline" size={24} color="white" />
      </TouchableOpacity>
      {/* Delete button */}
      <TouchableOpacity onPress={() => deleteImage(item.uri)} style={styles.deleteButton}>
        <Ionicons name="trash" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );

  const onDragEnd = ({ data }) => {
    setImages(data.map(item => item.uri));
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
      
      {/* Floating buttons at top-right */}
      <View style={styles.floatingButtons}>
        <TouchableOpacity style={styles.floatingButton} onPress={pickImages}>
          <Ionicons name="add-circle" size={28} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.floatingButton, styles.deleteAllButton]} onPress={deleteAllImages}>
          <Ionicons name="trash" size={28} color="white" />
        </TouchableOpacity>
      </View>
      
      <DraggableFlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        numColumns={2}
        onDragEnd={onDragEnd}
        activationDistance={20}
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
    padding: 10,
    alignItems: 'center',
  },
  pageTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginVertical: 20, 
    color: '#333', 
    textAlign: 'center'
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
    width: '100%',
    paddingBottom: 20,
  },
  imageContainer: { 
    flex: 1,
    margin: 5,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#eee',
    // Use aspectRatio to make it square and let it fill available space
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
