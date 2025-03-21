// src/screens/HomeScreen.js
import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Animated,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { ProfileContext } from '../context/ProfileContext';

const favoriteImages = [
  require('../../assets/memory/image1.jpg'),
  require('../../assets/memory/image2.jpg'),
  require('../../assets/memory/image3.jpg'),
  require('../../assets/memory/image4.jpg'),
];


const getRandomImage = () =>
  favoriteImages[Math.floor(Math.random() * favoriteImages.length)];

const HomeScreen = ({ navigation }) => {
  const { profile } = useContext(ProfileContext);
  const [memoryImages, setMemoryImages] = useState(favoriteImages);
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMemoryImage, setSelectedMemoryImage] = useState(null);

  // Persist animated value using useRef so it doesn't reset on every render
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Format current date as "dd-MON" (e.g., "5-Mar")
  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.toLocaleString('default', { month: 'short' });
  const formattedDate = `${day}-${month}`;

  // Shuffle images using Fisher-Yates algorithm
  const shuffleMemoryImages = () => {
    setMemoryImages(prevImages => {
      const shuffled = [...prevImages];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      console.log("Shuffled images:", shuffled);
      return shuffled;
    });
  };
  

  return (
    <LinearGradient colors={['#BBDEFB', '#90CAF9']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Top Bar with Date, Dropdown Icon, and Edit Button */}
        <View style={styles.topBar}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{formattedDate}</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setCalendarVisible(prev => !prev)}
            >
              <Ionicons
                name={isCalendarVisible ? 'chevron-up-outline' : 'chevron-down-outline'}
                size={24}
                color="#212121"
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="create-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Calendar Section (conditionally rendered) */}
        {isCalendarVisible && (
          <View style={styles.calendarContainer}>
            <Calendar
              onDayPress={day => console.log('Selected day', day)}
              markedDates={{
                '2025-03-05': { selected: true, marked: true, selectedColor: '#00adf5' },
              }}
              theme={{
                calendarBackground: '#BBDEFB',
                textSectionTitleColor: '#212121',
                selectedDayBackgroundColor: '#90CAF9',
                todayTextColor: '#e91e63',
                dayTextColor: '#212121',
                textDisabledColor: '#ccc',
                dotColor: '#00adf5',
                selectedDotColor: '#fff',
                arrowColor: '#212121',
                monthTextColor: '#212121',
                indicatorColor: '#212121',
              }}
            />
          </View>
        )}

        {/* Animated Profile Section */}
        <Animated.View style={[styles.profileCard, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0)']}
            style={styles.profileOverlay}
          />
          <Image
            source={{ uri: profile.photo || 'https://via.placeholder.com/100' }}
            style={styles.profileImage}
          />
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.age}>{profile.age} Years Old</Text>
        </Animated.View>

        {/* Patient Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.infoRow}>
            <Ionicons name="person" size={24} color="#444" />
            <Text style={styles.detailText}>{profile.gender}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="medical-services" size={24} color="#444" />
            <Text style={styles.detailText}>{profile.condition}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={24} color="#444" />
            <Text style={styles.detailText}>{profile.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call" size={24} color="#444" />
            <Text style={styles.detailText}>{profile.contact}</Text>
            <TouchableOpacity onPress={() => alert('Calling Emergency Contact...')}>
              <Ionicons name="call" size={24} color="#007BFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Caregiver Information */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Caregiver Info 👨⚕️</Text>
          <Text style={styles.infoText}>Name: Kalaivani</Text>
          <Text style={styles.infoText}>Contact: 9385702004</Text>
        </View>

        {/* Memory Lane Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Memory Lane 📸</Text>
          <Text style={styles.infoText}>'A cherished moment from the past'</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.memoryScroll}>
            {memoryImages.map((img, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setSelectedMemoryImage(img); // Note: For local images, store the module instead of URI
                  setModalVisible(true);
                }}
              >
                <Image source={img} style={styles.memoryImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.button} onPress={shuffleMemoryImages}>
            <LinearGradient colors={['#ff7e5f', '#feb47b']} style={styles.buttonGradient}>
              <Text style={styles.buttonText}>Shuffle Memory</Text>
            </LinearGradient>
          </TouchableOpacity>

        </View>

        {/* Weather & Recommendation */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Weather & Recommendation ☀️</Text>
          <Text style={styles.infoText}>Current Weather: Sunny, 75°F</Text>
          <Text style={styles.infoText}>Recommendation: Stay hydrated and wear a hat!</Text>
        </View>

        {/* Family Updates */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Family Updates 🏡</Text>
          <Text style={styles.infoText}>'Your grandson won his soccer match today!'</Text>
        </View>

        {/* Modal for Viewing Memory Image */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalContainer}>
          <Image source={selectedMemoryImage} style={styles.modalImage} />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { alignItems: 'center', paddingVertical: 20 },
  topBar: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 20,
    marginBottom: 15,
  },
  dateContainer: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 16, color: '#212121', marginRight: 5 },
  dropdownButton: { padding: 5 },
  editButton: {
    padding: 5,
    backgroundColor: '#90CAF9',
    borderRadius: 8,
    borderColor: '#BBDEFB',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  calendarContainer: {
    width: '90%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
  },
  profileCard: {
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  profileOverlay: { position: 'absolute', width: 120, height: 120, borderRadius: 60 },
  profileImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: '#fff' },
  name: { fontSize: 26, fontWeight: 'bold', color: '#000', marginTop: 10 },
  age: { fontSize: 18, color: '#000' },
  detailsContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 15,
    borderRadius: 15,
    width: '90%',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  detailText: { fontSize: 16, color: '#444', marginLeft: 10 },
  card: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 15,
    borderRadius: 15,
    width: '90%',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  infoText: { fontSize: 16, color: '#ddd', marginBottom: 5, textAlign: 'center' },
  memoryScroll: { width: '100%' },
  memoryImage: { width: 150, height: 150, borderRadius: 10, marginRight: 10 },
  button: { borderRadius: 8, overflow: 'hidden', marginTop: 10 },
  buttonGradient: { paddingVertical: 12, paddingHorizontal: 25, alignItems: 'center', borderRadius: 8 },
  buttonText: { fontSize: 16, color: '#fff', fontWeight: 'bold' },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: { width: '80%', height: '50%', resizeMode: 'contain', borderRadius: 10 },
  modalCloseButton: { marginTop: 20, backgroundColor: '#4CAF50', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  modalCloseButtonText: { fontSize: 16, color: '#fff' },
});

export default HomeScreen;
