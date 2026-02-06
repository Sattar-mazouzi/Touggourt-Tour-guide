
import { initializeApp } from 'firebase/app';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';
// Fix: Ensuring getAuth is correctly imported from the modular auth package
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

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

// Initialize Analytics
export const analytics = getAnalytics(app);

// Initialize Auth
export const auth = getAuth(app);

/**
 * Initialize Firestore with modern persistent cache settings.
 * This replaces the deprecated enableIndexedDbPersistence() method.
 * tabManager: persistentMultipleTabManager() allows synchronization across multiple tabs.
 */
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  }),
  experimentalAutoDetectLongPolling: true,
});
