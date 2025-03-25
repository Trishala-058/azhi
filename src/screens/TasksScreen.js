import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  Alert, 
  StyleSheet 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import firebase from '../config/firebaseConfig';
import { addDoc, onSnapshot, deleteDoc, doc, updateDoc, collection } from 'firebase/firestore';

const TasksScreen = () => {
  // Local state for inputs and tasks
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  // Due date stored as a Date object
  const [taskDueDate, setTaskDueDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [tasks, setTasks] = useState([]);

  // Get current user's UID (ensure the user is logged in)
  const currentUser = firebase.auth().currentUser;
  const userId = currentUser ? currentUser.uid : null;

  // Create a reference to the user's Tasks subcollection
  const userTasksCollection = userId
    ? collection(firebase.firestore(), "Users", userId, "Tasks")
    : null;

  // Subscribe to real-time updates from the user's tasks collection
  useEffect(() => {
    if (!userTasksCollection) return;
    const unsubscribe = onSnapshot(userTasksCollection, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(tasksData);
    }, (error) => {
      console.error("Error fetching tasks: ", error);
    });
    return () => unsubscribe();
  }, [userTasksCollection]);

  // Function to add a new task
  const addTask = async () => {
    if (!taskTitle.trim()) {
      Alert.alert('Error', 'Task title is required.');
      return;
    }
    if (!userTasksCollection) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }
    const newTask = {
      title: taskTitle,
      description: taskDescription,
      // Format due date as YYYY-MM-DD
      dueDate: taskDueDate.toISOString().split('T')[0],
      completed: false,
      createdAt: new Date().toISOString(),
    };

    try {
      await addDoc(userTasksCollection, newTask);
      setTaskTitle('');
      setTaskDescription('');
      setTaskDueDate(new Date());
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = async (taskId, currentStatus) => {
    if (!userTasksCollection) return;
    try {
      const taskRef = doc(firebase.firestore(), "Users", userId, "Tasks", taskId);
      await updateDoc(taskRef, { completed: !currentStatus });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Delete a task with confirmation
  const deleteTask = async (taskId) => {
    if (!userTasksCollection) return;
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        onPress: async () => {
          try {
            const taskRef = doc(firebase.firestore(), "Users", userId, "Tasks", taskId);
            await deleteDoc(taskRef);
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        }
      },
    ]);
  };

  // Show/Hide the modal date picker
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  // When a date is picked
  const handleConfirm = (selectedDate) => {
    setTaskDueDate(selectedDate);
    hideDatePicker();
  };

  // Filter tasks based on search query
  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render each task item
  const renderItem = ({ item }) => (
    <View style={[styles.taskCard, item.completed && styles.completedTask]}>
      <TouchableOpacity onPress={() => toggleTaskCompletion(item.id, item.completed)} style={styles.taskHeader}>
        <Text style={styles.taskTitle}>{item.completed ? '✅ ' : ''}{item.title}</Text>
      </TouchableOpacity>
      <Text style={styles.taskDescription}>{item.description}</Text>
      <Text style={styles.taskDueDate}>Due: {item.dueDate}</Text>
      <View style={styles.taskActions}>
        <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.actionButton}>
          <Ionicons name="trash" size={24} color="#D32F2F" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tasks</Text>
      <TextInput
        placeholder="Search Tasks..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchBar}
      />
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={styles.taskList}
      />
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Task</Text>
            <TextInput
              placeholder="Title"
              value={taskTitle}
              onChangeText={setTaskTitle}
              style={styles.input}
            />
            <TextInput
              placeholder="Description"
              value={taskDescription}
              onChangeText={setTaskDescription}
              style={[styles.input, styles.multilineInput]}
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity onPress={showDatePicker} style={styles.dateButton}>
              <Text style={styles.dateButtonText}>
                Due Date: {taskDueDate.toISOString().split('T')[0]}
              </Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
            />
            <TouchableOpacity onPress={addTask} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Add Task</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#E3F2FD' 
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  searchBar: { 
    backgroundColor: 'white', 
    padding: 12, 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 10, 
    marginBottom: 10 
  },
  taskList: { 
    marginBottom: 80 
  },
  taskCard: { 
    backgroundColor: 'white', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 10, 
    borderLeftWidth: 5, 
    borderColor: '#4CAF50', 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 5, 
    elevation: 3 
  },
  completedTask: {
    backgroundColor: '#d3ffd3',
  },
  taskHeader: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  taskTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  taskDescription: { 
    fontSize: 16, 
    color: '#666', 
    marginVertical: 15 
  },
  taskDueDate: { 
    fontSize: 14, 
    color: '#888' 
  },
  taskActions: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    marginTop: 10 
  },
  actionButton: { 
    marginLeft: 15 
  },
  addButton: { 
    position: 'absolute', 
    bottom: 20, 
    right: 20, 
    backgroundColor: '#00796B', 
    padding: 15, 
    borderRadius: 50, 
    elevation: 5 
  },
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'center', 
    backgroundColor: 'rgba(0,0,0,0.5)' 
  },
  modalContainer: { 
    backgroundColor: 'white', 
    padding: 20, 
    marginHorizontal: 30, 
    borderRadius: 10, 
    elevation: 10 
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 15 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    padding: 12, 
    borderRadius: 10, 
    marginBottom: 10 
  },
  multilineInput: { 
    height: 80 
  },
  dateButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  dateButtonText: {
    fontSize: 20,
    color: '#333',
    fontWeight: '600'
  },
  saveButton: { 
    backgroundColor: '#0288D1', 
    padding: 12, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginTop: 10 
  },
  saveButtonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  cancelButton: { 
    marginTop: 10, 
    alignItems: 'center' 
  },
  cancelButtonText: { 
    fontSize: 16, 
    color: '#D32F2F' 
  },
});

export default TasksScreen;
