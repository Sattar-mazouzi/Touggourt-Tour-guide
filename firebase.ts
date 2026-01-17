
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAw7HKjC_T9j77JC-oPL8Id6P9Z7SGbBhQ",
  authDomain: "touggourtmemory.firebaseapp.com",
  projectId: "touggourtmemory",
  storageBucket: "touggourtmemory.firebasestorage.app",
  messagingSenderId: "541554280419",
  appId: "1:541554280419:web:dd5bf251cf7dc801ecc2d6",
  measurementId: "G-PSK62Z130E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firestore
export const db = getFirestore(app);
