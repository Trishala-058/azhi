import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TasksScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
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
      priority: priority,
      completed: false,
    };
    setTasks([...tasks, newTask]);
    setModalVisible(false);
    setTaskTitle('');
    setTaskDescription('');
    setTaskDueDate('');
    setPriority('Medium');
  };

  // Function to toggle task completion
  const toggleTaskCompletion = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  // Function to delete a task
  const deleteTask = (taskId) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: () => setTasks(tasks.filter(task => task.id !== taskId)) },
    ]);
  };

  // Function to filter tasks based on search query
  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#f5f5f5' }}>
      
      {/* 🔍 Search Bar */}
      <TextInput
        style={{
          backgroundColor: 'white',
          padding: 10,
          borderRadius: 10,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: '#ccc',
        }}
        placeholder="Search tasks..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* 📋 Task List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: item.completed ? '#d3ffd3' : 'white',
              padding: 15,
              marginBottom: 10,
              borderRadius: 10,
              borderLeftWidth: 5,
              borderColor: item.priority === 'High' ? 'red' : item.priority === 'Medium' ? 'orange' : 'green',
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowRadius: 5,
              elevation: 3,
            }}
          >
            <TouchableOpacity onPress={() => toggleTaskCompletion(item.id)}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>
                {item.completed ? '✅ ' : ''}{item.title}
              </Text>
            </TouchableOpacity>
            <Text style={{ color: '#666', marginBottom: 5 }}>{item.description}</Text>
            <Text style={{ color: '#888' }}>Due: {item.dueDate}</Text>

            {/* 🗑️ Delete Button */}
            <TouchableOpacity onPress={() => deleteTask(item.id)} style={{ marginTop: 5 }}>
              <Ionicons name="trash" size={24} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* ➕ Add Task Button */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          backgroundColor: '#007bff',
          padding: 15,
          borderRadius: 30,
          alignItems: 'center',
          position: 'absolute',
          bottom: 20,
          right: 20,
          elevation: 5,
        }}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* 📝 Add Task Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{
          flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)',
        }}>
          <View style={{
            width: '90%', backgroundColor: 'white', padding: 20, borderRadius: 10,
          }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Add Task</Text>
            
            <TextInput
              placeholder="Title"
              value={taskTitle}
              onChangeText={setTaskTitle}
              style={{ backgroundColor: '#eee', padding: 10, borderRadius: 5, marginBottom: 10 }}
            />

            <TextInput
              placeholder="Description"
              value={taskDescription}
              onChangeText={setTaskDescription}
              style={{ backgroundColor: '#eee', padding: 10, borderRadius: 5, marginBottom: 10 }}
            />

            <TextInput
              placeholder="Due Date (YYYY-MM-DD)"
              value={taskDueDate}
              onChangeText={setTaskDueDate}
              style={{ backgroundColor: '#eee', padding: 10, borderRadius: 5, marginBottom: 10 }}
            />

            <TouchableOpacity onPress={addTask} style={{ backgroundColor: '#28a745', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Add Task</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 10, alignItems: 'center' }}>
              <Text style={{ color: 'red', fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </View>
  );
};

export default TasksScreen;
