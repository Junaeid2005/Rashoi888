import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

// Authorized admin emails
const ADMIN_EMAILS = [
  'bluepeakzone2005@gmail.com',
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        let adminStatus = false;
        
        // 1. Check if email is explicitly on the admin allowlist
        if (currentUser.email && ADMIN_EMAILS.includes(currentUser.email.toLowerCase())) {
          adminStatus = true;
          // Ensure admin document exists in Firestore
          try {
            await setDoc(doc(db, 'admins', currentUser.uid), {
              uid: currentUser.uid,
              email: currentUser.email,
              role: 'superadmin',
              updatedAt: new Date().toISOString()
            }, { merge: true });
          } catch (e) {
            console.warn('Could not write admin doc:', e);
          }
        } else {
          // 2. Check if admin doc exists in Firestore
          try {
            const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
            if (adminDoc.exists()) {
              adminStatus = true;
            }
          } catch (err) {
            console.warn('Admin check failed:', err);
          }
        }

        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google Sign-in failed:', err);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error('Sign-out failed:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
