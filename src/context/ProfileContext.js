// src/context/ProfileContext.js
import React, { createContext, useState, useEffect } from 'react';
import firebase from '../config/firebaseConfig';

export const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);



  useEffect(() => {
    let unsubscribeProfile = null;
    const unsubscribeAuth = firebase.auth().onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        unsubscribeProfile = fetchUserProfile(currentUser.uid);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setProfile(null);
        if (unsubscribeProfile) unsubscribeProfile(); // Clean up profile listener
      }
    });
  
    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);
  


const fetchUserProfile = (uid) => {
  return firebase.firestore().collection('users').doc(uid).onSnapshot((doc) => {
    if (doc.exists) {
      setProfile(doc.data());
    }
  }, (error) => {
    console.error("Error fetching profile:", error);
  });
};


const saveUserProfile = async (uid, profileData) => {
  try {
    await firebase.firestore().collection('users').doc(uid).update(profileData);
    setProfile((prevProfile) => ({ ...prevProfile, ...profileData }));
  } catch (error) {
    console.error("Error saving profile:", error);
  }
};


  const signOut = async () => {
    try {
      await firebase.auth().signOut();
      setIsAuthenticated(false);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error("Sign Out Error:", error);
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, setProfile, isAuthenticated, user, saveUserProfile, signOut }}>
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileContext;
