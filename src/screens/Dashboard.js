import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DashboardCard = ({ title, iconName, accentColor, onPress }) => {
  return (
    <TouchableOpacity style={styles.cardWrapper} onPress={onPress}>
      <View style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: accentColor }]}>
          <Ionicons name={iconName} size={36} color="#fff" />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const Dashboard = ({ navigation }) => {
  useEffect(() => {
    console.log("Dashboard Screen Mounted");
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Dashboard</Text>
      <ScrollView contentContainerStyle={styles.grid}>
        <DashboardCard 
          title="Reminders" 
          iconName="alarm-outline" 
          accentColor="#FF5722" 
          onPress={() => navigation.navigate('ReminderScreen')} 
        />
        <DashboardCard 
          title="Gallery" 
          iconName="images-outline" 
          accentColor="#9C27B0" 
          onPress={() => navigation.navigate('GalleryScreen')} 
        />
        <DashboardCard 
          title="Emergency" 
          iconName="call-outline" 
          accentColor="#F44336" 
          onPress={() => navigation.navigate('EmergencyScreen')} 
        />
        <DashboardCard 
          title="Location" 
          iconName="location-outline" 
          accentColor="#03A9F4" 
          onPress={() => navigation.navigate('LocationScreen')} 
        />
        <DashboardCard 
          title="Medicine" 
          iconName="medkit-outline" 
          accentColor="#4CAF50" 
          onPress={() => navigation.navigate('MedicineScreen')} 
        />
        <DashboardCard 
          title="Tasks" 
          iconName="list-outline" 
          accentColor="#FF9800" 
          onPress={() => navigation.navigate('TasksScreen')} 
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#BBDEFB', // Blue variant background
    paddingTop: 50,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  cardWrapper: {
    width: '48%',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    elevation: 3, // Material elevation (shadow)
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    color: '#212121',
    fontWeight: '600',
  },
});

export default Dashboard;
