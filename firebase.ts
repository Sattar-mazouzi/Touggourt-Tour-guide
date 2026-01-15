
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQP5NVe0PsUYBXO6lgF84pKzmFTwvGeI8",
  authDomain: "test-app-807b3.firebaseapp.com",
  projectId: "test-app-807b3",
  storageBucket: "test-app-807b3.firebasestorage.app",
  messagingSenderId: "88630971625",
  appId: "1:88630971625:web:60ec2f92b4c962d51e7478",
  measurementId: "G-38C84M36R6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore database instance
export const db = getFirestore(app);
