// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA-W1lRBBAUxg1XzwOT6yU1XKM9DUivqP8",
  authDomain: "titanweb-56c4b.firebaseapp.com",
  projectId: "titanweb-56c4b",
  storageBucket: "titanweb-56c4b.firebasestorage.app",
  messagingSenderId: "255728980765",
  appId: "1:255728980765:web:774f45c4063e3b61acc7f4",
  measurementId: "G-815LWD7RFL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;