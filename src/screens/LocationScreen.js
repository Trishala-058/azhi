import React, { useState, useEffect } from "react";
import { View, Text, Alert, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import * as Location from "expo-location";

const LocationScreen = () => {
  const [region, setRegion] = useState(null);
  const [safeZone, setSafeZone] = useState({ latitude: 37.7749, longitude: -122.4194, radius: 500 });
  const [savedLocations, setSavedLocations] = useState([]);
  const [locationLog, setLocationLog] = useState([]);
  const [currentAddress, setCurrentAddress] = useState("Fetching address...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestLocationPermission();
  }, []);

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
        checkGeoFence(latitude, longitude);
        logLocation(latitude, longitude);
        fetchAddress(latitude, longitude);
        setLoading(false);
      }
    );
  };

  const fetchAddress = async (latitude, longitude) => {
    let [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
    setCurrentAddress(address ? `${address.name}, ${address.city}` : "Address not found");
  };

  const saveLocation = (name) => {
    if (!region) return;
    setSavedLocations([...savedLocations, { name, latitude: region.latitude, longitude: region.longitude }]);
    Alert.alert("Saved!", `${name} location saved.`);
  };

  const checkGeoFence = (lat, lon) => {
    const distance = getDistance(lat, lon, safeZone.latitude, safeZone.longitude);
    if (distance > safeZone.radius) {
      Alert.alert("⚠️ Alert!", "You have left the safe zone!");
    }
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const logLocation = (lat, lon) => {
    setLocationLog((prevLog) => [...prevLog, { lat, lon, time: new Date().toLocaleTimeString() }]);
  };

  const sendLocationToEmergencyContacts = () => {
    Alert.alert("📍 Location Sent", "Your location has been shared with emergency contacts.");
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {region ? (
        <MapView style={styles.map} region={region} showsUserLocation={true} followsUserLocation={true}>
          <Marker coordinate={region} title="You" description={currentAddress} />
          {savedLocations.map((loc, index) => (
            <Marker key={index} coordinate={{ latitude: loc.latitude, longitude: loc.longitude }} title={loc.name} />
          ))}
          <Circle center={safeZone} radius={safeZone.radius} strokeColor="rgba(255,0,0,0.5)" fillColor="rgba(255,0,0,0.2)" />
        </MapView>
      ) : (
        <Text style={styles.errorText}>Location not available</Text>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>📍 Current Address: {currentAddress}</Text>
      </View>

      <View style={styles.buttonsContainer}>
  <TouchableOpacity style={styles.button} onPress={() => saveLocation("Home")}>
    <Text style={styles.buttonText}>🏠 Save Home</Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.button} onPress={() => saveLocation("Hospital")}>
    <Text style={styles.buttonText}>🏥 Save Hospital</Text>
  </TouchableOpacity>

  <TouchableOpacity style={[styles.button, styles.emergencyButton]} onPress={sendLocationToEmergencyContacts}>
    <Text style={styles.buttonText}>📡 Send Location</Text>
  </TouchableOpacity>
</View>


      <ScrollView style={styles.logContainer}>
        <Text style={styles.logTitle}>📜 Location Log (Last 5 Entries):</Text>
        {locationLog.slice(-5).map((log, index) => (
          <Text key={index} style={styles.logText}>{`Lat: ${log.lat.toFixed(4)}, Lon: ${log.lon.toFixed(4)}, Time: ${log.time}`}</Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  map: { flex: 1 },
  errorText: { textAlign: "center", marginTop: 20, fontSize: 16, color: "red" },
  infoContainer: { padding: 15, backgroundColor: "#fff", borderRadius: 10, margin: 10, elevation: 3 },
  infoText: { fontSize: 16, fontWeight: "bold", textAlign: "center" },
  buttons: { flexDirection: "row", justifyContent: "space-around", padding: 15 },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 3,
  },
  buttonsContainer: {
    flexDirection: "column", // Stack buttons vertically
    alignItems: "center", // Center buttons horizontally
    padding: 15,
    gap: 10, // Adds spacing between buttons
  },
  
  button: {
    width: "90%", // Make buttons full width with margin
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  
  emergencyButton: {
    backgroundColor: "#FF3B30",
    marginBottom: 20, // Extra margin to ensure full visibility
  },
  
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  
  emergencyButton: { backgroundColor: "#FF3B30" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  logContainer: { padding: 15, backgroundColor: "#fff", borderRadius: 10, margin: 10, elevation: 3 },
  logTitle: { fontWeight: "bold", marginBottom: 5, fontSize: 16 },
  logText: { fontSize: 14, color: "#333" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default LocationScreen;
