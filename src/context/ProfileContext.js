// src/context/ProfileContext.js
import React, { createContext, useState } from 'react';

export const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState({
    name: 'John Doe',
    age: '75',
    gender: 'Male',
    condition: "Alzheimer's",
    address: '123 Main St, New York, NY',
    contact: 'Jane Doe (Daughter) - (123) 456-7890',
  });

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileContext;