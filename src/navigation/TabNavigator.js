import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeStack from './HomeStack';
import StackNavigator from './StackNavigator';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
  screenOptions={({ route }) => ({
    tabBarIcon: ({ color, size }) => {
      let iconName = route.name === 'Home' ? 'home' : 'stats-chart-outline';
      return <Ionicons name={iconName} size={size + 5} color={color} />;
    },
    tabBarStyle: { backgroundColor: '#004aad', paddingBottom: 10, height: 65 },
    tabBarActiveTintColor: '#fff',
    tabBarInactiveTintColor: '#ccc',
    headerShown: false,
  })}
>
  <Tab.Screen name="Home" component={HomeStack} />
  <Tab.Screen name="Dashboard" component={StackNavigator} />
</Tab.Navigator>

  );
};

export default TabNavigator;
