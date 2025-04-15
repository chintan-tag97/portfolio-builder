import { createContext, useState, useEffect, ReactNode, useMemo, use } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { User } from '../types';
import { getCurrentUser, signOut as authSignOut } from '../services/authService';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setCurrentUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  signOut: async () => {},
  setCurrentUser: () => {}
});

export const useAuth = () => use(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signOut = async () => {
    await authSignOut();
    setCurrentUser(null);
  };

  const value = useMemo(() => ({
    currentUser,
    loading,
    signOut,
    setCurrentUser
  }), [currentUser, loading]);

  // Expose the AuthContext instance to the window object
  useEffect(() => {
    (window as any).__AUTH_CONTEXT__ = value;
    return () => {
      delete (window as any).__AUTH_CONTEXT__;
    };
  }, [value]);

  return (
    <AuthContext value={value}>
      {!loading && children}
    </AuthContext>
  );
}; 