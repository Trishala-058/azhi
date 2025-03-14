import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal } from 'react-native';
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

  const renderItem = ({ item }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1 }}>
      <TouchableOpacity onPress={() => toggleImportant(item.id)}>
        <Ionicons name={item.important ? 'star' : 'star-outline'} size={24} color={item.important ? 'gold' : 'gray'} />
      </TouchableOpacity>
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={{ fontSize: 18, color: 'green' }}>{item.name}</Text>
        <Text style={{ color: 'gray' }}>{item.relationship} - {item.number}</Text>
      </View>
      <TouchableOpacity>
        <Ionicons name="call" size={24} color="green" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => openEditModal(item)}>
        <Ionicons name="create" size={24} color="green" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteContact(item.id)}>
        <Ionicons name="trash" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#E0F7FA' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: 'green' }}>Emergency Contacts</Text>
      <TextInput
        placeholder="Search Contacts..."
        value={search}
        onChangeText={setSearch}
        style={{ padding: 10, borderWidth: 1, borderRadius: 5, marginBottom: 10, backgroundColor: 'white' }}
      />
      <FlatList
        data={contacts.filter(contact => contact.name.toLowerCase().includes(search.toLowerCase()))}
        keyExtractor={item => item.id}
        renderItem={renderItem}
      />
      <TouchableOpacity onPress={() => { setModalVisible(true); setEditMode(false); setNewContact({ name: '', number: '', relationship: '' }); }} style={{ padding: 15, backgroundColor: 'green', alignItems: 'center', borderRadius: 5, marginTop: 10 }}>
        <Text style={{ color: 'white', fontSize: 18 }}>Add Number</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ width: 350, padding: 25, backgroundColor: '#E0F7FA', borderRadius: 15 }}>
            <Text style={{ fontSize: 24, marginBottom: 15, color: 'green', textAlign: 'center' }}>{editMode ? 'Edit Contact' : 'Add New Contact'}</Text>
            <TextInput
              placeholder="Name"
              value={newContact.name}
              onChangeText={(text) => setNewContact({ ...newContact, name: text })}
              style={{ padding: 12, borderWidth: 1, borderRadius: 8, marginBottom: 12, backgroundColor: 'white' }}
            />
            <TextInput
              placeholder="Number"
              value={newContact.number}
              keyboardType="phone-pad"
              onChangeText={(text) => setNewContact({ ...newContact, number: text })}
              style={{ padding: 12, borderWidth: 1, borderRadius: 8, marginBottom: 12, backgroundColor: 'white' }}
            />
            <TextInput
              placeholder="Relationship"
              value={newContact.relationship}
              onChangeText={(text) => setNewContact({ ...newContact, relationship: text })}
              style={{ padding: 12, borderWidth: 1, borderRadius: 8, marginBottom: 20, backgroundColor: 'white' }}
            />
            <TouchableOpacity onPress={handleAddOrEditContact} style={{ backgroundColor: 'green', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ color: 'white', fontSize: 20 }}>{editMode ? 'Save Changes' : 'Add Contact'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ backgroundColor: 'red', padding: 12, borderRadius: 8, alignItems: 'center' }}>
              <Text style={{ color: 'white', fontSize: 20 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default EmergencyContacts;
