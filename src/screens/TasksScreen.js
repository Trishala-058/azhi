import React, { useState } from 'react';
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

const TasksScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Function to add a new task
  const addTask = () => {
    if (!taskTitle.trim()) {
      Alert.alert('Error', 'Task title is required.');
      return;
    }
    const newTask = {
      id: Date.now().toString(),
      title: taskTitle,
      description: taskDescription,
      dueDate: taskDueDate,
      completed: false,
    };
    setTasks([...tasks, newTask]);
    setModalVisible(false);
    setTaskTitle('');
    setTaskDescription('');
    setTaskDueDate('');
  };

  // Toggle task completion
  const toggleTaskCompletion = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  // Delete a task
  const deleteTask = (taskId) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: () => setTasks(tasks.filter(task => task.id !== taskId)) },
    ]);
  };

  // Filter tasks based on search query
  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View style={[styles.taskCard, item.completed && styles.completedTask]}>
      <TouchableOpacity onPress={() => toggleTaskCompletion(item.id)} style={styles.taskHeader}>
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
      <Text style={styles.title}>Tasks</Text>
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
      <TouchableOpacity 
        onPress={() => setModalVisible(true)} 
        style={styles.addButton}
      >
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
            <TextInput
              placeholder="Due Date (YYYY-MM-DD)"
              value={taskDueDate}
              onChangeText={setTaskDueDate}
              style={styles.input}
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
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 15, 
    color: '#0277BD' 
  },
  searchBar: { 
    backgroundColor: 'white', 
    padding: 12, 
    borderWidth: 1, 
    borderColor: '#B3E5FC', 
    borderRadius: 10, 
    marginBottom: 15 
  },
  taskList: { marginBottom: 80 },
  taskCard: { 
    backgroundColor: 'white', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 15, 
    borderLeftWidth: 5, 
    borderColor: '#4CAF50',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  completedTask: {
    backgroundColor: '#d3ffd3',
  },
  taskHeader: { flexDirection: 'row', alignItems: 'center' },
  taskTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  taskDescription: { fontSize: 16, color: '#666', marginVertical: 15 },
  taskDueDate: { fontSize: 14, color: '#888' },
  taskActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  actionButton: { marginLeft: 15 },
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
    borderColor: '#B3E5FC', 
    padding: 12, 
    borderRadius: 10, 
    marginBottom: 10 
  },
  multilineInput: {
    height: 80, 
  },
  saveButton: { 
    backgroundColor: '#0288D1', 
    padding: 12, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginTop: 10 
  },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
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
