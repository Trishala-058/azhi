import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import Dashboard from '../screens/Dashboard';
import ReminderScreen from '../screens/ReminderScreen';
import GalleryScreen from '../screens/GalleryScreen';
import EmergencyScreen from '../screens/EmergencyScreen';
import LocationScreen from '../screens/LocationScreen';
import MedicineScreen from '../screens/MedicineScreen';
import TasksScreen from '../screens/TasksScreen';


const Stack = createStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="DashboardScreen" screenOptions={{ headerTitleAlign: 'center', headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="DashboardScreen" component={Dashboard} />
      <Stack.Screen name="ReminderScreen" component={ReminderScreen} />
      <Stack.Screen name="GalleryScreen" component={GalleryScreen} />
      <Stack.Screen name="EmergencyScreen" component={EmergencyScreen}
      options={{ headerShown: true, title: "Emergency Contacts" }}  />
      <Stack.Screen name="LocationScreen" component={LocationScreen} />
      <Stack.Screen name="MedicineScreen" component={MedicineScreen} />
      <Stack.Screen name="TasksScreen" component={TasksScreen} />

    </Stack.Navigator>
  );
};

export default StackNavigator;
