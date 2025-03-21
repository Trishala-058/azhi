import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/storage';

const firebaseConfig = {
  apiKey: "AIzaSyARqstTbw4BXJ_X9DAB6_dEHmoJhHUmV_I",
  authDomain: "azhi-fdb7e.firebaseapp.com",
  projectId: "azhi-fdb7e",
  storageBucket: "azhi-fdb7e.firebasestorage.app",
  messagingSenderId: "146548174251",
  appId: "1:146548174251:web:971adbe7db20702c9536ee",
  measurementId: "G-64QYBPLQJK"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  
  // Access Firestore
  const firestore = firebase.firestore();
  
  // Example collections for your app’s data
  export const tasksCollection = firestore.collection('Tasks');
  export const remindersCollection = firestore.collection('Reminders');
  export const contactsCollection = firestore.collection('Contacts');
  export const medicinesCollection = firestore.collection('Medicines');
  export const locationsCollection = firestore.collection('Locations');
  export const photosCollection = firestore.collection('Photos'); // If storing photo metadata in Firestore
  
  // If you plan to store actual images in Firebase Storage:
  export const storage = firebase.storage();
  
  export default firebase;