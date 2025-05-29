import React, { createContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

const MOCK_USERS = [
  {
    id: 1,
    username: 'admin',
    // In a real app, this would be properly hashed on the server
    password: 'admin123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Administrator',
    profilePic: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: 2,
    username: 'user',
    password: 'user123',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'User',
    profilePic: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300'
  }
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Mock authentication (in a real app, this would call an API)
  const login = (username, password) => {
    return new Promise((resolve, reject) => {
      // Simulate API call delay
      setTimeout(() => {
        const user = MOCK_USERS.find(
          u => u.username === username && u.password === password
        );
        
        if (user) {
          // Never store password in localStorage
          const { password, ...userWithoutPassword } = user;
          localStorage.setItem('user', JSON.stringify(userWithoutPassword));
          setCurrentUser(userWithoutPassword);
          toast.success('Login successful!');
          resolve(userWithoutPassword);
        } else {
          toast.error('Invalid username or password');
          reject(new Error('Invalid credentials'));
        }
      }, 800);
    });
  };

  const logout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
    toast.info('Logged out successfully');
  };

  const value = {
    currentUser,
    loading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;