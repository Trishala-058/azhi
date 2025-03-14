// src/screens/MedicineScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const STORAGE_KEY = 'medications';

const initialMedications = [
  {
    id: '1',
    name: 'Paracetamol',
    dosage: '500mg',
    frequency: 'Twice a day',
    instructions: 'Take with food',
    history: [],
    reminderTime: null,
  },
  {
    id: '2',
    name: 'Ibuprofen',
    dosage: '200mg',
    frequency: 'Once a day',
    instructions: 'After meal',
    history: [],
    reminderTime: null,
  },
];

const MedicineScreen = () => {
  const [medications, setMedications] = useState(initialMedications);
  const [showTimePickerVisible, setShowTimePickerVisible] = useState(false);
  const [selectedMedId, setSelectedMedId] = useState(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState([]);
  const [selectedMedHistoryId, setSelectedMedHistoryId] = useState(null);

  // State for new medication inputs
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedFrequency, setNewMedFrequency] = useState('');
  const [newMedInstructions, setNewMedInstructions] = useState('');

  // State for the reminder time (for the picker)
  const [reminderDate, setReminderDate] = useState(new Date());

  // Load persisted medications on mount
  useEffect(() => {
    const loadMedications = async () => {
      try {
        const storedMeds = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedMeds !== null) {
          setMedications(JSON.parse(storedMeds));
        }
      } catch (error) {
        console.error('Failed to load medications:', error);
      }
    };
    loadMedications();
  }, []);

  // Save medications to AsyncStorage whenever they change
  useEffect(() => {
    const saveMedications = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(medications));
      } catch (error) {
        console.error('Failed to save medications:', error);
      }
    };
    saveMedications();
  }, [medications]);

  // Request notification permissions on mount
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable notifications for medicine reminders.');
      }
    })();
  }, []);

  // Schedule a notification for a specific medication at the chosen time
  const scheduleNotification = async (medName, reminderDate) => {
    const now = new Date().getTime();
    const triggerSeconds = Math.max(0, Math.floor((reminderDate.getTime() - now) / 1000));
    console.log(`Scheduling notification for ${medName} in ${triggerSeconds} seconds`);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${medName} Reminder`,
        body: `Time to take your ${medName}!`,
        sound: true,
      },
      trigger: { seconds: triggerSeconds, repeats: false },
    });
    Alert.alert(
      'Reminder Scheduled',
      `You will be reminded to take ${medName} at ${reminderDate.toLocaleTimeString()}.`
    );
  };

  // DateTimePicker onChange handler
  const onTimeChange = (event, selectedDate) => {
    if (event.type === 'set' && selectedDate && selectedMedId) {
      setShowTimePickerVisible(false);
      setReminderDate(selectedDate);
      // Update the reminder time for the selected medication
      setMedications(prevMeds =>
        prevMeds.map(med =>
          med.id === selectedMedId ? { ...med, reminderTime: selectedDate } : med
        )
      );
      const med = medications.find(m => m.id === selectedMedId);
      if (med) {
        scheduleNotification(med.name, selectedDate);
      }
      setSelectedMedId(null);
    } else {
      setShowTimePickerVisible(false);
      setSelectedMedId(null);
    }
  };

  // Log medication taken by storing the timestamp in the history array
  const logMedication = (medId) => {
    const timeNow = new Date().toLocaleTimeString();
    setMedications(prevMeds =>
      prevMeds.map(med =>
        med.id === medId ? { ...med, history: [timeNow, ...med.history] } : med
      )
    );
  };

  // Delete a medication
  const deleteMedication = (medId) => {
    Alert.alert(
      'Delete Medication',
      'Are you sure you want to delete this medication?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setMedications(prevMeds => prevMeds.filter(med => med.id !== medId));
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Handle adding a new medication from the modal form
  const handleAddMedication = () => {
    if (!newMedName || !newMedDosage || !newMedFrequency || !newMedInstructions) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    const newMed = {
      id: Date.now().toString(),
      name: newMedName,
      dosage: newMedDosage,
      frequency: newMedFrequency,
      instructions: newMedInstructions,
      history: [],
      reminderTime: null,
    };
    setMedications(prevMeds => [...prevMeds, newMed]);
    // Clear input fields
    setNewMedName('');
    setNewMedDosage('');
    setNewMedFrequency('');
    setNewMedInstructions('');
    setIsAddModalVisible(false);
  };

  // Clear history for the selected medication in the history modal
  const clearHistory = () => {
    setMedications(prevMeds =>
      prevMeds.map(med =>
        med.id === selectedMedHistoryId ? { ...med, history: [] } : med
      )
    );
    setSelectedHistory([]);
  };

  // Render each medication card
  const renderMedication = ({ item }) => (
    <View style={styles.medCard}>
      <View style={styles.medCardHeader}>
        <Text style={styles.medTitle}>{item.name}</Text>
        <TouchableOpacity onPress={() => deleteMedication(item.id)}>
          <Ionicons name="trash-outline" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>
      <Text style={styles.medDetail}>Dosage: {item.dosage}</Text>
      <Text style={styles.medDetail}>Frequency: {item.frequency}</Text>
      <Text style={styles.medDetail}>Instructions: {item.instructions}</Text>
      {item.reminderTime && (
        <Text style={styles.reminderText}>
          Reminder set for: {new Date(item.reminderTime).toLocaleTimeString()}
        </Text>
      )}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setSelectedMedId(item.id);
            setShowTimePickerVisible(true);
          }}
        >
          <LinearGradient colors={['#4CAF50', '#66BB6A']} style={styles.buttonGradient}>
            <Ionicons name="alarm-outline" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Set Reminder</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => logMedication(item.id)}>
          <LinearGradient colors={['#FFA726', '#FFB74D']} style={styles.buttonGradient}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Log Taken</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      {item.history.length > 0 && (
        <View style={styles.historySummary}>
          <Text style={styles.historySummaryText}>Last Taken: {item.history[0]}</Text>
          <TouchableOpacity
            style={styles.viewHistoryButton}
            onPress={() => {
              setSelectedMedHistoryId(item.id);
              setSelectedHistory(item.history);
              setHistoryModalVisible(true);
            }}
          >
            <Text style={styles.viewHistoryButtonText}>View History</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <LinearGradient colors={['#BBDEFB', '#90CAF9']} style={styles.container}>
      <Text style={styles.screenHeader}>Your Medications</Text>
      <FlatList
        data={medications}
        keyExtractor={(item) => item.id}
        renderItem={renderMedication}
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => setIsAddModalVisible(true)}>
        <LinearGradient colors={['#03A9F4', '#29B6F6']} style={styles.addButtonGradient}>
          <Ionicons name="add-circle-outline" size={24} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Add Medication</Text>
        </LinearGradient>
      </TouchableOpacity>
      {showTimePickerVisible && (
        <DateTimePicker
          value={reminderDate}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={onTimeChange}
        />
      )}

      {/* Modal for Adding New Medication */}
      <Modal visible={isAddModalVisible} transparent animationType="slide">
        <View style={styles.addModalContainer}>
          <View style={styles.addModalContent}>
            <Text style={styles.addModalHeader}>Add Medication</Text>
            <TextInput
              style={styles.input}
              placeholder="Medication Name"
              value={newMedName}
              onChangeText={setNewMedName}
            />
            <TextInput
              style={styles.input}
              placeholder="Dosage (e.g., 500mg)"
              value={newMedDosage}
              onChangeText={setNewMedDosage}
            />
            <TextInput
              style={styles.input}
              placeholder="Frequency (e.g., Twice a day)"
              value={newMedFrequency}
              onChangeText={setNewMedFrequency}
            />
            <TextInput
              style={styles.input}
              placeholder="Instructions (e.g., Take with food)"
              value={newMedInstructions}
              onChangeText={setNewMedInstructions}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={styles.modalButton} onPress={handleAddMedication}>
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#F44336' }]}
                onPress={() => setIsAddModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for Viewing History */}
      <Modal visible={historyModalVisible} transparent animationType="slide">
        <View style={styles.historyModalContainer}>
          <View style={styles.historyModalContent}>
            <Text style={styles.historyModalHeader}>Medication History</Text>
            <ScrollView style={styles.historyModalScroll}>
              {selectedHistory.length > 0 ? (
                selectedHistory.map((time, index) => (
                  <Text key={index} style={styles.historyModalItem}>
                    Taken at {time}
                  </Text>
                ))
              ) : (
                <Text style={styles.noHistoryText}>No history available</Text>
              )}
            </ScrollView>
            <View style={styles.historyModalButtonRow}>
              <TouchableOpacity style={styles.clearHistoryButton} onPress={clearHistory}>
                <Text style={styles.clearHistoryButtonText}>Clear History</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.historyModalCloseButton}
                onPress={() => setHistoryModalVisible(false)}
              >
                <Text style={styles.historyModalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#BBDEFB' },
  screenHeader: { fontSize: 32, fontWeight: 'bold', color: '#212121', textAlign: 'center', marginBottom: 20 },
  listContainer: { paddingBottom: 20 },
  medCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  medCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  medTitle: { fontSize: 24, fontWeight: 'bold', color: '#212121', marginBottom: 10 },
  medDetail: { fontSize: 16, color: '#555', marginBottom: 5 },
  reminderText: { fontSize: 16, color: '#212121', marginTop: 10 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  button: { flex: 1, marginHorizontal: 5 },
  buttonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8 },
  buttonIcon: { marginRight: 5 },
  buttonText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  historySummary: { flexDirection: 'row', alignItems: 'center', marginTop: 10, justifyContent: 'space-between' },
  historySummaryText: { fontSize: 16, color: '#212121' },
  viewHistoryButton: { padding: 5 },
  viewHistoryButtonText: { fontSize: 14, color: '#03A9F4', textDecorationLine: 'underline' },
  addButton: { marginTop: 20 },
  addButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8 },
  addModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addModalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
  },
  addModalHeader: { fontSize: 24, fontWeight: 'bold', color: '#212121', marginBottom: 15, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    color: '#212121',
  },
  modalButtonRow: { flexDirection: 'row', justifyContent: 'space-around' },
  modalButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  modalButtonText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  historyModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyModalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
  },
  historyModalHeader: { fontSize: 24, fontWeight: 'bold', color: '#212121', marginBottom: 15, textAlign: 'center' },
  historyModalScroll: { maxHeight: 300 },
  historyModalItem: { fontSize: 16, color: '#212121', marginBottom: 10 },
  noHistoryText: { fontSize: 16, color: 'gray', textAlign: 'center' },
  historyModalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '100%',
  },
  clearHistoryButton: {
    backgroundColor: '#F44336',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginRight: 5,
  },
  clearHistoryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyModalCloseButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginLeft: 5,
  },
  historyModalCloseButtonText: { fontSize: 16, color: '#fff' },
});

export default MedicineScreen;
