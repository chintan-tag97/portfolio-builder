import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { User } from '../types';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Collections } from './collections';

// User type definition


// Convert Firebase user to our User type
export const convertToUser = (firebaseUser: FirebaseUser): User => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email!,
    displayName: firebaseUser.displayName || null,
    photoURL: firebaseUser.photoURL || undefined,
    createdAt: new Date()
  };
};

// Register a new user
export const registerUser = async (email: string, password: string, displayName?: string): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;
  
  if (displayName) {
    await updateProfile(firebaseUser, { displayName });
  }
  
  // Create user document in Firestore
  const userDoc = doc(db, Collections.USERS_COLLECTION, firebaseUser.uid);
  const userData = {
    email: firebaseUser.email,
    displayName: displayName || null,
    photoURL: firebaseUser.photoURL || null,
    createdAt: serverTimestamp()
  };
  
  await setDoc(userDoc, userData);
  
  // Create and return the user object with the updated display name
  const user = {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: displayName || null,
    photoURL: firebaseUser.photoURL || undefined,
    createdAt: new Date()
  };

  // Get the AuthContext instance and update the current user
  const authContext = (window as any).__AUTH_CONTEXT__;
  if (authContext) {
    authContext.setCurrentUser(user);
  }
  
  return user;
};

// Sign in a user
export const signIn = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return convertToUser(userCredential.user);
};

// Sign out the current user
export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

// Get the current user
export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        resolve(convertToUser(user));
      } else {
        resolve(null);
      }
    });
  });
};

// Get user by ID
export const getUserById = async (userId: string): Promise<User | null> => {
  const userDoc = doc(db, Collections.USERS_COLLECTION, userId);
  const userSnapshot = await getDoc(userDoc);
  
  if (!userSnapshot.exists()) {
    return null;
  }
  
  const userData = userSnapshot.data();
  return {
    id: userSnapshot.id,
    email: userData.email,
    displayName: userData.displayName || undefined,
    photoURL: userData.photoURL || undefined,
    createdAt: userData.createdAt?.toDate() || new Date()
  };
};

// Send password reset email
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    // Firebase specific error handling
    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email address');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address');
    } else {
      throw new Error('Failed to send reset email. Please try again.');
    }
  }
}; 