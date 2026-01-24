
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  collection, 
  deleteDoc, 
  addDoc 
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  favorites: string[];
  signInWithGoogle: () => Promise<void>;
  signUpEmail: (email: string, pass: string, name: string, age: number) => Promise<void>;
  loginEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  toggleFavorite: (placeId: string) => Promise<void>;
  submitReview: (placeId: string, rating: number, comment: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const favUnsubscribeRef = useRef<(() => void) | null>(null);

  const cleanupListeners = () => {
    if (favUnsubscribeRef.current) {
      favUnsubscribeRef.current();
      favUnsubscribeRef.current = null;
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      cleanupListeners(); // Stop previous listeners immediately on any auth change
      
      if (u) {
        setUser(u);
        // 1. Fetch User Profile
        getDoc(doc(db, 'users', u.uid)).then((profDoc) => {
          if (profDoc.exists()) {
            setProfile(profDoc.data() as UserProfile);
          }
        }).catch(err => {
          if (err.code !== 'permission-denied') {
            console.error("Profile fetch error:", err);
          }
        });

        // 2. Setup Favorites Listener with explicit error handling
        favUnsubscribeRef.current = onSnapshot(
          collection(db, 'users', u.uid, 'favorites'), 
          (snap) => {
            setFavorites(snap.docs.map(doc => doc.id));
          },
          (error) => {
            // Silently handle permission errors during transitions (e.g. logging out)
            if (error.code === 'permission-denied') {
              console.warn("Favorites access denied. Usually occurs during logout transition.");
            } else {
              console.error("Favorites listener error:", error);
            }
            setFavorites([]);
          }
        );
      } else {
        setUser(null);
        setProfile(null);
        setFavorites([]);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      cleanupListeners();
    };
  }, []);

  const saveUserProfile = async (uid: string, data: Partial<UserProfile>, isNew: boolean = false) => {
    try {
      const profileData: any = {
        uid,
        ...data,
        updatedAt: Date.now()
      };

      // Security rules REQUIRE role: 'visitor' for creation (isNew)
      if (isNew) {
        profileData.role = 'visitor';
        profileData.createdAt = Date.now();
      }

      await setDoc(doc(db, 'users', uid), profileData, { merge: true });
    } catch (err) {
      console.error("Failed to save user profile:", err);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const isNew = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
      // Always ensure profile exists for the rules to allow subcollection reads
      await saveUserProfile(result.user.uid, {
        fullName: result.user.displayName || 'Traveler',
        email: result.user.email || '',
      }, isNew);
    } catch (error) {
      console.error("Google Sign-in Error:", error);
      throw error;
    }
  };

  const signUpEmail = async (email: string, pass: string, name: string, age: number) => {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(result.user, { displayName: name });
    await saveUserProfile(result.user.uid, {
      fullName: name,
      email,
      age
    }, true); // isNew = true
  };

  const loginEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    cleanupListeners(); // Kill listeners BEFORE signing out to avoid 403s
    await signOut(auth);
  };

  const toggleFavorite = async (placeId: string) => {
    if (!user) return;
    try {
      const favRef = doc(db, 'users', user.uid, 'favorites', placeId);
      if (favorites.includes(placeId)) {
        await deleteDoc(favRef);
      } else {
        await setDoc(favRef, { timestamp: Date.now() });
      }
    } catch (err) {
      console.error("Toggle favorite failed:", err);
    }
  };

  const submitReview = async (placeId: string, rating: number, comment: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'reviews'), {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        placeId,
        rating,
        comment,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error("Submit review failed:", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, profile, loading, favorites, 
      signInWithGoogle, signUpEmail, loginEmail, logout, 
      toggleFavorite, submitReview 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
