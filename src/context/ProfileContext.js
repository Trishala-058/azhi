// src/context/ProfileContext.js
import React, { createContext, useState, useEffect } from 'react';
import firebase from '../config/firebaseConfig';

export const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        await fetchUserProfile(currentUser.uid);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserProfile = async (uid) => {
    try {
      const userDoc = await firebase.firestore().collection('users').doc(uid).get();
      if (userDoc.exists) {
        setProfile(userDoc.data());
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const saveUserProfile = async (uid, profileData) => {
    try {
      await firebase.firestore().collection('users').doc(uid).set(profileData);
      setProfile(profileData);
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
