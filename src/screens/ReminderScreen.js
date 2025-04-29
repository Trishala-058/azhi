// src/screens/ReminderScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Configure the notification handler so that notifications are shown even when the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const STORAGE_KEY = 'reminders';

const initialReminders = [
  {
    id: '1',
    title: 'Take Vitamins',
    description: '',
    time: null,
    // days: all false indicates "Tomorrow" mode.
    days: [false, false, false, false, false, false, false],
  },
];

const ReminderScreen = () => {
  // Main reminders state
  const [reminders, setReminders] = useState(initialReminders);

  // Modal fields for new reminder / editing
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState(null);
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderDescription, setNewReminderDescription] = useState('');
  const [newReminderTime, setNewReminderTime] = useState(null);
  const [newReminderDays, setNewReminderDays] = useState([false, false, false, false, false, false, false]);

  // Scheduling mode: "tomorrow" or "custom"
  const [scheduleMode, setScheduleMode] = useState('custom');

  // TimePicker states (for editing and for new reminder)
  const [reminderDate, setReminderDate] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showNewReminderTimePicker, setShowNewReminderTimePicker] = useState(false);
  const [selectedReminderId, setSelectedReminderId] = useState(null);

  // Notification listener (to log incoming notifications)
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });
    return () => subscription.remove();
  }, []);

  // Load reminders from AsyncStorage on mount
  useEffect(() => {
    const loadReminders = async () => {
      try {
        const storedReminders = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedReminders) {
          setReminders(JSON.parse(storedReminders));
        }
      } catch (error) {
        console.error('Failed to load reminders', error);
      }
    };
    loadReminders();
  }, []);

  // Save reminders whenever they change
  useEffect(() => {
    const saveReminders = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
      } catch (error) {
        console.error('Failed to save reminders', error);
      }
    };
    saveReminders();
  }, [reminders]);

  // Request notification permissions on mount
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      console.log('Notification permission status:', status);
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable notifications for reminders.');
      }
    })();
  }, []);

  // Compute the upcoming time for "tomorrow" mode.
  const getUpcomingTime = (selectedDate) => {
    const now = new Date();
    const upcoming = new Date(now);
    upcoming.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
    if (upcoming <= now) {
      upcoming.setDate(upcoming.getDate() + 1);
    }
    return upcoming;
  };

  // Schedule a notification for a reminder.
  // For "tomorrow" mode, schedules a one-time notification.
  // (The custom mode currently schedules a one-time notification as well—you can extend this logic for repeating notifications.)
  const scheduleReminderNotifications = async (title, description, reminderTime, mode, days) => {
    if (!reminderTime) return;
  
    // Ensure reminderTime is a Date object
    let scheduledTime = reminderTime instanceof Date ? reminderTime : new Date(reminderTime);
    
    const now = new Date();
    // Adjust if the scheduled time is not in the future.
    if (scheduledTime <= now) {
      scheduledTime = getUpcomingTime(scheduledTime);
      console.log('Adjusted scheduled time to:', scheduledTime);
    }
    
    // Calculate trigger seconds and enforce a minimum delay of 1 second.
    const triggerSeconds = Math.max(
      1,
      Math.floor((scheduledTime.getTime() - now.getTime()) / 1000)
    );
    console.log('Scheduling notification:', { title, scheduledTime, triggerSeconds, mode });
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${title} Reminder`,
        body: description
          ? `Reminder: ${title}\n${description}`
          : `It's time for your reminder: ${title}`,
        sound: true,
      },
      trigger: { seconds: triggerSeconds, repeats: false },
    });
    
    Alert.alert('Reminder Scheduled', `Reminder for "${title}" is set for ${scheduledTime.toLocaleTimeString()}`);
  };
  
  

  // Handler for editing an existing reminder's time
  const onTimeChange = (event, selectedDate) => {
    if (event.type === 'set' && selectedDate) {
      setShowTimePicker(false);
      setReminderDate(selectedDate);
      if (selectedReminderId) {
        setReminders((prev) =>
          prev.map((rem) =>
            rem.id === selectedReminderId ? { ...rem, time: selectedDate } : rem
          )
        );
        const rem = reminders.find((r) => r.id === selectedReminderId);
        if (rem) {
          scheduleReminderNotifications(rem.title, rem.description, selectedDate, scheduleMode, newReminderDays);
        }
        setSelectedReminderId(null);
      }
    } else {
      setShowTimePicker(false);
      setSelectedReminderId(null);
    }
  };

  // Handler for setting new reminder time in the modal
  const onNewReminderTimeChange = (event, selectedDate) => {
    if (event.type === 'set' && selectedDate) {
      setShowNewReminderTimePicker(false);
      if (scheduleMode === 'tomorrow') {
        setNewReminderTime(getUpcomingTime(selectedDate));
      } else {
        setNewReminderTime(selectedDate);
      }
    } else {
      setShowNewReminderTimePicker(false);
    }
  };

  // Toggle a day in the custom day picker
  const toggleDay = (index) => {
    const updatedDays = [...newReminderDays];
    updatedDays[index] = !updatedDays[index];
    setNewReminderDays(updatedDays);
  };

  // Open modal in edit mode with a given reminder's details
  const handleEditReminder = (reminder) => {
    setIsAddModalVisible(true);
    setIsEditMode(true);
    setEditingReminderId(reminder.id);
    setNewReminderTitle(reminder.title);
    setNewReminderDescription(reminder.description);
    // Convert stored time (which might be a string) back to a Date object
    setNewReminderTime(reminder.time ? new Date(reminder.time) : null);
    setNewReminderDays(reminder.days || [false, false, false, false, false, false, false]);
    setScheduleMode((reminder.days || []).every((d) => !d) ? 'tomorrow' : 'custom');
  };

  // Save the reminder from the modal (add new or update existing)
  const saveReminder = () => {
    if (!newReminderTitle.trim()) {
      Alert.alert('Error', 'Please enter a reminder title');
      return;
    }
    // In Tomorrow mode, override day selection with all false.
    const days = scheduleMode === 'tomorrow'
      ? [false, false, false, false, false, false, false]
      : newReminderDays;
    if (isEditMode) {
      const updatedReminders = reminders.map((rem) =>
        rem.id === editingReminderId
          ? { ...rem, title: newReminderTitle, description: newReminderDescription, time: newReminderTime, days }
          : rem
      );
      setReminders(updatedReminders);
      if (newReminderTime) {
        scheduleReminderNotifications(newReminderTitle, newReminderDescription, newReminderTime, scheduleMode, days);
      }
    } else {
      const newReminder = {
        id: Date.now().toString(),
        title: newReminderTitle,
        description: newReminderDescription,
        time: newReminderTime,
        days,
      };
      setReminders((prev) => [...prev, newReminder]);
      if (newReminderTime) {
        scheduleReminderNotifications(newReminderTitle, newReminderDescription, newReminderTime, scheduleMode, days);
      }
    }
    // Reset modal fields and exit edit mode
    setNewReminderTitle('');
    setNewReminderDescription('');
    setNewReminderTime(null);
    setNewReminderDays([false, false, false, false, false, false, false]);
    setIsEditMode(false);
    setEditingReminderId(null);
    setIsAddModalVisible(false);
  };

  // Delete a reminder
  const deleteReminder = (id) => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setReminders((prev) => prev.filter((reminder) => reminder.id !== id)),
        },
      ],
      { cancelable: true }
    );
  };

  // Render day buttons for modal (custom day selection)
  const renderDayButtons = () => {
    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return (
      <View style={styles.dayButtonRow}>
        {dayLabels.map((label, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayButton,
              newReminderDays[index] && styles.dayButtonSelected,
            ]}
            onPress={() => toggleDay(index)}
          >
            <Text
              style={[
                styles.dayButtonText,
                newReminderDays[index] && styles.dayButtonTextSelected,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render each reminder card (time, title, description)
  const renderReminder = ({ item }) => (
    <View style={styles.reminderCard}>
      {item.time ? (
        <Text style={styles.reminderTime}>
          Reminder at: {new Date(item.time).toLocaleTimeString()}
        </Text>
      ) : (
        <Text style={styles.reminderTime}>
          Reminder at: {getUpcomingTime(new Date()).toLocaleTimeString()}
        </Text>
      )}
      <View style={styles.cardHeader}>
        <Text style={styles.reminderTitle}>{item.title}</Text>
        <View style={styles.iconRow}>
          <TouchableOpacity onPress={() => handleEditReminder(item)}>
            <Ionicons name="create-outline" size={24} color="#2F80ED" style={{ marginRight: 10 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteReminder(item.id)}>
            <Ionicons name="trash-outline" size={24} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>
      {item.description ? (
        <Text style={styles.reminderDescription}>{item.description}</Text>
      ) : null}
      {item.days && item.days.some((d) => d) && (
        <View style={styles.daysRow}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <Text
              key={index}
              style={[
                styles.dayText,
                item.days[index] && styles.dayTextSelected,
              ]}
            >
              {day}
            </Text>
          ))}
        </View>
      )}
      {/* "Set Time" button removed */}
    </View>
  );

  return (
    <LinearGradient colors={['#E3F2FD', '#BBDEFB']} style={styles.container}>
      <Text style={styles.screenHeader}>Reminders</Text>
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        renderItem={renderReminder}
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setIsAddModalVisible(true);
          setIsEditMode(false);
          setNewReminderTitle('');
          setNewReminderDescription('');
          setNewReminderTime(null);
          setNewReminderDays([false, false, false, false, false, false, false]);
          setScheduleMode('custom');
        }}
      >
        <LinearGradient colors={['#2F80ED', '#56CCF2']} style={styles.addButtonGradient}>
          <Ionicons name="add-circle-outline" size={24} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.addButtonText}>Add Reminder</Text>
        </LinearGradient>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          value={reminderDate}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={onTimeChange}
        />
      )}
      {showNewReminderTimePicker && (
        <DateTimePicker
          value={newReminderTime || new Date()}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={onNewReminderTimeChange}
        />
      )}
      {/* Modal for Adding / Editing Reminder */}
      <Modal visible={isAddModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditMode ? 'Edit Reminder' : 'New Reminder'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsAddModalVisible(false);
                  setNewReminderTitle('');
                  setNewReminderDescription('');
                  setNewReminderTime(null);
                  setNewReminderDays([false, false, false, false, false, false, false]);
                  setIsEditMode(false);
                  setEditingReminderId(null);
                }}
              >
                <Ionicons name="close-circle-outline" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <TextInput
                style={styles.input}
                placeholder="Enter reminder title"
                placeholderTextColor="#888"
                value={newReminderTitle}
                onChangeText={setNewReminderTitle}
              />
              <TextInput
                style={[styles.input, styles.descriptionInput]}
                placeholder="Enter reminder description (optional)"
                placeholderTextColor="#888"
                value={newReminderDescription}
                onChangeText={setNewReminderDescription}
                multiline
              />
              <Text style={styles.daysLabelTitle}>Select Days</Text>
              {scheduleMode === 'custom' && renderDayButtons()}
              <View style={styles.modeSelectorContainer}>
                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    scheduleMode === 'tomorrow' && styles.modeButtonSelected,
                  ]}
                  onPress={() => setScheduleMode('tomorrow')}
                >
                  <Text
                    style={[
                      styles.modeButtonText,
                      scheduleMode === 'tomorrow' && styles.modeButtonTextSelected,
                    ]}
                  >
                    Tomorrow
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    scheduleMode === 'custom' && styles.modeButtonSelected,
                  ]}
                  onPress={() => setScheduleMode('custom')}
                >
                  <Text
                    style={[
                      styles.modeButtonText,
                      scheduleMode === 'custom' && styles.modeButtonTextSelected,
                    ]}
                  >
                    Custom Days
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowNewReminderTimePicker(true)}
              >
                <Text style={styles.timeButtonText}>
                  {newReminderTime
                    ? `Time: ${newReminderTime.toLocaleTimeString()}`
                    : 'Set Reminder Time'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalButton} onPress={saveReminder}>
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#F44336' }]}
                onPress={() => {
                  setIsAddModalVisible(false);
                  setNewReminderTitle('');
                  setNewReminderDescription('');
                  setNewReminderTime(null);
                  setNewReminderDays([false, false, false, false, false, false, false]);
                  setIsEditMode(false);
                  setEditingReminderId(null);
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  screenHeader: {
    fontSize: 34,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 25,
  },
  listContainer: { paddingBottom: 20 },
  reminderCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reminderTitle: { fontSize: 24, fontWeight: '600', color: '#333', marginBottom: 5 },
  reminderDescription: { fontSize: 16, color: '#666', marginBottom: 10 },
  reminderTime: { fontSize: 16, color: '#555', marginBottom: 15 },
  daysRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 15 },
  dayText: { fontSize: 16, color: '#2F80ED', marginHorizontal: 4 },
  dayTextSelected: { fontWeight: '700', color: '#2F80ED', textDecorationLine: 'underline' },
  cardButtonRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  iconRow: { flexDirection: 'row', alignItems: 'center' },
  buttonIcon: { marginRight: 3 },
  addButton: { marginTop: 20 },
  addButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12 },
  addButtonText: { fontSize: 18, color: '#fff', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '90%', maxWidth: 500, backgroundColor: '#fff', borderRadius: 30, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2F80ED', paddingVertical: 20, paddingHorizontal: 25 },
  modalTitle: { fontSize: 28, fontWeight: '700', color: '#fff' },
  modalBody: { paddingHorizontal: 25, paddingVertical: 20 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 15, padding: 18, fontSize: 16, color: '#333', marginBottom: 20 },
  descriptionInput: { height: 100, textAlignVertical: 'top' },
  daysLabelTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10, textAlign: 'center' },
  dayButtonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  dayButton: { width: 35, height: 35, borderRadius: 18, borderWidth: 1, borderColor: '#2F80ED', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  dayButtonSelected: { backgroundColor: '#2F80ED' },
  dayButtonText: { fontSize: 16, color: '#2F80ED', fontWeight: '600' },
  dayButtonTextSelected: { color: '#fff' },
  modeSelectorContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  modeButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: '#2F80ED', marginHorizontal: 5, backgroundColor: '#fff' },
  modeButtonSelected: { backgroundColor: '#2F80ED' },
  modeButtonText: { fontSize: 16, color: '#2F80ED', fontWeight: '600' },
  modeButtonTextSelected: { color: '#fff' },
  timeButton: { 
    width: '100%', 
    paddingVertical: 25,  
    paddingHorizontal: 20, 
    backgroundColor: '#f0f0f0', 
    borderRadius: 15, 
    alignItems: 'center', 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  timeButtonText: { 
    fontSize: 20, 
    color: '#333', 
    fontWeight: '600' 
  },
  modalFooter: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#f9f9f9', paddingVertical: 20 },
  modalButton: { backgroundColor: '#2F80ED', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 15, flex: 1, marginHorizontal: 10 },
  modalButtonText: { fontSize: 18, color: '#fff', textAlign: 'center', fontWeight: '600' },
});

export default ReminderScreen;
