import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet, Alert, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const GalleryScreen = ({ navigation }) => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const deleteImage = (uri) => {
    Alert.alert('Delete Photo', 'Are you sure you want to delete this photo?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: () => setImages(images.filter(image => image !== uri)) }
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.imageContainer}>
      <TouchableOpacity onPress={() => setSelectedImage(item)}>
        <Image source={{ uri: item }} style={styles.image} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteImage(item)} style={styles.deleteButton}>
        <Ionicons name="trash" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Photo Gallery</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Ionicons name="add-circle" size={24} color="white" />
          <Text style={styles.buttonText}>Add Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.deleteAllButton]} onPress={() => setImages([])}>
          <Ionicons name="trash" size={24} color="white" />
          <Text style={styles.buttonText}>Delete All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={images}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
        renderItem={renderItem}
        contentContainerStyle={styles.gridContainer}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', alignItems: 'center', paddingTop: 20 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  buttonContainer: { flexDirection: 'row', marginBottom: 20 },
  button: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, marginHorizontal: 10 },
  deleteAllButton: { backgroundColor: '#d9534f' },
  buttonText: { color: 'white', fontSize: 16, marginLeft: 8 },
  gridContainer: { padding: 10 },
  imageContainer: { position: 'relative', margin: 5, borderRadius: 10, overflow: 'hidden' },
  image: { width: 110, height: 110, borderRadius: 10 },
  deleteButton: { position: 'absolute', top: 5, right: 5, backgroundColor: 'red', borderRadius: 15, padding: 6 },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.9)', justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: '90%', height: '80%', resizeMode: 'contain' },
  modalClose: { position: 'absolute', top: 40, right: 20 },
});

export default GalleryScreen;
