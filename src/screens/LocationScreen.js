import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TextInput,
  SafeAreaView,
} from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import * as Location from "expo-location";
import * as SMS from "expo-sms";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@saved_locations";

const LocationScreen = () => {
  const [region, setRegion] = useState(null);
  const [safeZone, setSafeZone] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    radius: 500,
  });
  const [savedLocations, setSavedLocations] = useState([]);
  const [locationLog, setLocationLog] = useState([]);
  const [currentAddress, setCurrentAddress] = useState("Fetching address...");
  const [loading, setLoading] = useState(true);
  // New state: track last time the geofence alert was shown
  const [lastGeoFenceAlertTime, setLastGeoFenceAlertTime] = useState(0);

  // Full screen modal state for updating safe zone details and emergency contacts
  const [addSafeZoneModalVisible, setAddSafeZoneModalVisible] = useState(false);
  const [homeAddressInput, setHomeAddressInput] = useState("");
  const [hospitalAddressInput, setHospitalAddressInput] = useState("");
  // Emergency contacts: comma separated list
  const [emergencyNumberInput, setEmergencyNumberInput] = useState("");
  // Saved values from the safe zone modal
  const [manualHomeAddress, setManualHomeAddress] = useState("");
  const [manualHospitalAddress, setManualHospitalAddress] = useState("");
  const [manualEmergencyNumber, setManualEmergencyNumber] = useState("");

  const mapRef = useRef(null);

  useEffect(() => {
    requestLocationPermission();
    loadSavedLocations();
  }, []);

  const loadSavedLocations = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        setSavedLocations(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error("Failed to load saved locations", e);
    }
  };

  const requestLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Location access is required.");
      setLoading(false);
      return;
    }
    startTracking();
  };

  const startTracking = async () => {
    await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 5 },
      (position) => {
        const { latitude, longitude } = position.coords;
        setRegion({ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });
        logLocation(latitude, longitude);
        checkGeoFence(latitude, longitude);
        fetchAddress(latitude, longitude);
        setLoading(false);
      }
    );
  };

  const fetchAddress = async (latitude, longitude) => {
    let [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
    setCurrentAddress(address ? `${address.name}, ${address.city}` : "Address not found");
  };

  const checkGeoFence = (lat, lon) => {
    const distance = getDistance(lat, lon, safeZone.latitude, safeZone.longitude);
    if (distance > safeZone.radius) {
      const now = Date.now();
      // Only show alert if at least 1 minute (60000ms) has passed
      if (now - lastGeoFenceAlertTime > 60000) {
        Alert.alert("⚠️ Alert!", "You have left the safe zone!");
        setLastGeoFenceAlertTime(now);
      }
    }
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const logLocation = (lat, lon) => {
    setLocationLog((prevLog) => [
      { lat, lon, time: new Date().toLocaleTimeString() },
      ...prevLog,
    ]);
  };

  // Saves current location for a marker type
  const saveLocation = async (type) => {
    if (!region) return;
    const newLocation = {
      latitude: region.latitude,
      longitude: region.longitude,
      name: type,
    };
    const updatedLocations = [...savedLocations, newLocation];
    setSavedLocations(updatedLocations);
    if (type === "Home") {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLocations));
      } catch (e) {
        console.error("Failed to save home location", e);
      }
    }
    Alert.alert("Location Saved", `${type} location saved successfully.`);
  };

  const showSavedAddress = (type) => {
    if (type === "Home") {
      if (manualHomeAddress) {
        Alert.alert("Home Address", manualHomeAddress);
      } else {
        Alert.alert("Home Address", "No Home address saved. Please update the safe zone details.");
      }
    } else if (type === "Hospital") {
      if (manualHospitalAddress) {
        Alert.alert("Hospital Address", manualHospitalAddress);
      } else {
        Alert.alert("Hospital Address", "No Hospital address saved. Please update the safe zone details.");
      }
    }
  };

  // Send location using SMS to multiple contacts (comma separated)
  const sendLocationToEmergencyContacts = async () => {
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      if (!manualEmergencyNumber) {
        Alert.alert("No Emergency Numbers", "Please update the safe zone details with emergency contact numbers.");
        return;
      }
      const numbers = manualEmergencyNumber
        .split(",")
        .map((num) => num.trim())
        .filter((num) => num.length);
      if (numbers.length === 0) {
        Alert.alert("No Emergency Numbers", "Please update the safe zone details with valid emergency contact numbers.");
        return;
      }
      await SMS.sendSMSAsync(
        numbers,
        `Emergency! My current location is:\nLatitude: ${region.latitude.toFixed(
          4
        )}\nLongitude: ${region.longitude.toFixed(4)}\nAddress: ${currentAddress}`
      );
    } else {
      Alert.alert("SMS Unavailable", "SMS functionality is not available on this device.");
    }
  };

  const handleSafeZoneChange = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSafeZone({ latitude, longitude, radius: 500 });
    Alert.alert(
      "Safe Zone Updated",
      `New Safe Zone:\nLat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`
    );
  };

  // Open the full-screen modal, pre-fill saved values
  const openAddSafeZonePage = () => {
    setHomeAddressInput(manualHomeAddress);
    setHospitalAddressInput(manualHospitalAddress);
    setEmergencyNumberInput(manualEmergencyNumber);
    setAddSafeZoneModalVisible(true);
  };

  const saveSafeZoneAddresses = () => {
    if (
      !homeAddressInput.trim() ||
      !hospitalAddressInput.trim() ||
      !emergencyNumberInput.trim()
    ) {
      Alert.alert("Missing Fields", "Please fill in all fields before saving.");
      return;
    }
    setManualHomeAddress(homeAddressInput.trim());
    setManualHospitalAddress(hospitalAddressInput.trim());
    setManualEmergencyNumber(emergencyNumberInput.trim());
    setAddSafeZoneModalVisible(false);
    Alert.alert("Details Updated", "Your safe zone details have been updated.");
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loaderText}>Loading location...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Full Screen Modal for Updating Safe Zone Details */}
      <Modal visible={addSafeZoneModalVisible} animationType="slide">
        <SafeAreaView style={styles.fullScreenModal}>
          <View style={styles.fullScreenHeader}>
            <Text style={styles.fullScreenTitle}>Update Safe Zone Details</Text>
            <TouchableOpacity onPress={() => setAddSafeZoneModalVisible(false)}>
              <Ionicons name="close" size={28} color="#007AFF" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.fullScreenContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Home Address</Text>
              <TextInput
                style={styles.fullScreenInput}
                placeholder="Enter Home Address"
                value={homeAddressInput}
                onChangeText={setHomeAddressInput}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Hospital Address</Text>
              <TextInput
                style={styles.fullScreenInput}
                placeholder="Enter Hospital Address"
                value={hospitalAddressInput}
                onChangeText={setHospitalAddressInput}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Emergency Contact Numbers (comma separated)</Text>
              <TextInput
                style={styles.fullScreenInput}
                placeholder="e.g., +1234567890, +0987654321"
                keyboardType="phone-pad"
                value={emergencyNumberInput}
                onChangeText={setEmergencyNumberInput}
              />
            </View>
          </ScrollView>
          <View style={styles.fullScreenFooter}>
            <TouchableOpacity style={styles.fullScreenButton} onPress={saveSafeZoneAddresses}>
              <Text style={styles.fullScreenButtonText}>Save Details</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Add Safe Zone Button */}
      <TouchableOpacity style={styles.addSafeZoneButton} onPress={openAddSafeZonePage}>
        <Ionicons name="add-circle" size={24} color="blue" />
      </TouchableOpacity>

      {region ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          showsUserLocation={true}
          followsUserLocation={true}
          onLongPress={handleSafeZoneChange}
        >
          <Marker coordinate={region} title="You" description={currentAddress} />
          {savedLocations.map((loc, index) => (
            <Marker
              key={index}
              coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
              title={loc.name}
            />
          ))}
          <Circle
            center={safeZone}
            radius={safeZone.radius}
            strokeColor="rgba(255,0,0,0.5)"
            fillColor="rgba(255,0,0,0.2)"
          />
          <Marker coordinate={safeZone} title="Safe Zone" pinColor="red" />
        </MapView>
      ) : (
        <Text style={styles.errorText}>Location not available</Text>
      )}

      {/* Overlay Panel */}
      <View style={styles.overlay}>
        <Text style={styles.addressText}>📍 {currentAddress}</Text>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={() => showSavedAddress("Home")}>
            <Text style={styles.buttonText}>🏠 Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => showSavedAddress("Hospital")}>
            <Text style={styles.buttonText}>🏥 Hospital</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.emergencyButton} onPress={sendLocationToEmergencyContacts}>
            <Text style={styles.buttonText}>🚨 Send Location</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.logContainer}>
          <Text style={styles.logTitle}>📜 Location Log:</Text>
          {locationLog.slice(0, 5).map((log, index) => (
            <Text key={index} style={styles.logText}>
              {`Lat: ${log.lat.toFixed(4)}, Lon: ${log.lon.toFixed(4)}, Time: ${log.time}`}
            </Text>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  map: { flex: 1 },
  addSafeZoneButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 30,
    elevation: 5,
  },
  overlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 20,
    elevation: 5,
  },
  addressText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 10,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  button: {
    flex: 1,
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 5,
    elevation: 3,
  },
  emergencyButton: {
    flex: 1,
    backgroundColor: "red",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 5,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  logContainer: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
    elevation: 3,
    maxHeight: 100,
    marginTop: 10,
  },
  logTitle: {
    fontWeight: "700",
    marginBottom: 5,
    fontSize: 16,
  },
  logText: {
    fontSize: 14,
    color: "#333",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: { marginTop: 10, fontSize: 16 },
  errorText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "red",
  },
  // Full screen modal styles
  fullScreenModal: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  fullScreenHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fullScreenTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#007AFF",
  },
  fullScreenContent: {
    flexGrow: 1,
    marginTop: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  fullScreenInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fefefe",
  },
  fullScreenFooter: {
    alignItems: "center",
    marginVertical: 20,
  },
  fullScreenButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 12,
  },
  fullScreenButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default LocationScreen;
