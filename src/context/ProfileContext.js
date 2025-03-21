// src/context/ProfileContext.js
import React, { createContext, useState } from 'react';

export const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState({
    name: 'Shanthi',
    age: '65',
    gender: 'Female',
    condition: "Alzheimer's",
    address: '123 Main road,Namakkal',
    contact: 'Kalaivani (Daughter) - 9385702004',
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);


  const signIn = () => setIsAuthenticated(true);
  const signOut = () => {
    setIsAuthenticated(false);
    setProfile({});
  };

  return (
    <ProfileContext.Provider value={{ profile, setProfile, isAuthenticated, setIsAuthenticated, signIn, signOut }}>
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileContext;