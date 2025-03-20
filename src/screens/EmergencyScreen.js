import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EmergencyContacts = () => {
  const [contacts, setContacts] = useState([
    { id: '1', name: 'John Doe', number: '123-456-7890', relationship: 'Brother', important: false },
    { id: '2', name: 'Jane Smith', number: '987-654-3210', relationship: 'Doctor', important: true },
  ]);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [newContact, setNewContact] = useState({ name: '', number: '', relationship: '' });

  const toggleImportant = (id) => {
    setContacts(contacts.map(contact =>
      contact.id === id ? { ...contact, important: !contact.important } : contact
    ));
  };

  const deleteContact = (id) => {
    setContacts(contacts.filter(contact => contact.id !== id));
  };

  const handleAddOrEditContact = () => {
    if (newContact.name && newContact.number && newContact.relationship) {
      if (editMode && selectedContact) {
        setContacts(contacts.map(contact =>
          contact.id === selectedContact.id ? { ...newContact, id: selectedContact.id, important: selectedContact.important } : contact
        ));
      } else {
        setContacts([...contacts, { ...newContact, id: Date.now().toString(), important: false }]);
      }
      setNewContact({ name: '', number: '', relationship: '' });
      setModalVisible(false);
      setEditMode(false);
    }
  };

  const openEditModal = (contact) => {
    setSelectedContact(contact);
    setNewContact(contact);
    setEditMode(true);
    setModalVisible(true);
  };

  const handleCall = (number) => {
    Linking.openURL(`tel:${number}`);
  };

  const renderItem = ({ item }) => (
    <View style={styles.contactCard}>
      <TouchableOpacity onPress={() => toggleImportant(item.id)}>
        <Ionicons name={item.important ? 'star' : 'star-outline'} size={24} color={item.important ? '#FFD700' : 'gray'} />
      </TouchableOpacity>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactDetails}>{item.relationship} - {item.number}</Text>
      </View>
      <TouchableOpacity onPress={() => handleCall(item.number)}>
        <Ionicons name="call" size={24} color="#00796B" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => openEditModal(item)}>
        <Ionicons name="create" size={24} color="#00796B" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteContact(item.id)}>
        <Ionicons name="trash" size={24} color="#D32F2F" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Contacts</Text>
      <TextInput
        placeholder="Search Contacts..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchBar}
      />
      <FlatList
        data={contacts.filter(contact => contact.name.toLowerCase().includes(search.toLowerCase()))}
        keyExtractor={item => item.id}
        renderItem={renderItem}
      />
      <TouchableOpacity onPress={() => { setModalVisible(true); setEditMode(false); setNewContact({ name: '', number: '', relationship: '' }); }} style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Add Contact</Text>
      </TouchableOpacity>
      
      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{editMode ? 'Edit Contact' : 'Add New Contact'}</Text>
            <TextInput placeholder="Name" value={newContact.name} onChangeText={(text) => setNewContact({ ...newContact, name: text })} style={styles.input} />
            <TextInput placeholder="Number" value={newContact.number} keyboardType="phone-pad" onChangeText={(text) => setNewContact({ ...newContact, number: text })} style={styles.input} />
            <TextInput placeholder="Relationship" value={newContact.relationship} onChangeText={(text) => setNewContact({ ...newContact, relationship: text })} style={styles.input} />
            <TouchableOpacity onPress={handleAddOrEditContact} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>{editMode ? 'Save Changes' : 'Add Contact'}</Text>
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
  container: { flex: 1, padding: 20, backgroundColor: '#E3F2FD' },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#0277BD' },
  searchBar: { padding: 12, borderWidth: 1, borderRadius: 10, marginBottom: 10, backgroundColor: 'white' },
  contactCard: { flexDirection: 'row', alignItems: 'center', padding: 12, marginVertical: 5, backgroundColor: 'white', borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  contactInfo: { flex: 1, marginLeft: 10 },
  contactName: { fontSize: 18, fontWeight: 'bold', color: '#00796B' },
  contactDetails: { color: 'gray' },
  addButton: { padding: 15, backgroundColor: '#00796B', alignItems: 'center', borderRadius: 10, marginTop: 10 },
  addButtonText: { color: 'white', fontSize: 18 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: { width: 350, padding: 25, backgroundColor: '#E3F2FD', borderRadius: 15 },
  modalTitle: { fontSize: 22, marginBottom: 15, color: '#0277BD', textAlign: 'center' },
  input: { padding: 12, borderWidth: 1, borderRadius: 10, marginBottom: 12, backgroundColor: 'white' },
  saveButton: { backgroundColor: '#00796B', padding: 12, borderRadius: 10, alignItems: 'center' },
  saveButtonText: { color: 'white', fontSize: 18 },
  cancelButton: { backgroundColor: '#D32F2F', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  cancelButtonText: { color: 'white', fontSize: 18 },
});

export default EmergencyContacts;
