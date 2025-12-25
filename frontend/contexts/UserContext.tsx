import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { getUser, saveUser, clearUser } from '../utils/userStorage';

interface UserContextType {
  user: User | null;
  loading: boolean;
  signIn: (user: User) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const savedUser = await getUser();
      setUser(savedUser);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (newUser: User) => {
    try {
      console.log('🔵 UserContext signIn called with:', newUser);
      await saveUser(newUser);
      setUser(newUser);
      console.log('✅ UserContext user updated:', newUser);
    } catch (error) {
      console.error('❌ Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await clearUser();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const continueAsGuest = async () => {
    const guestUser: User = {
      id: 'guest_' + Date.now(),
      email: null,
      fullName: null,
      isAnonymous: true,
    };
    await signIn(guestUser);
  };

  return (
    <UserContext.Provider value={{ user, loading, signIn, signOut, continueAsGuest }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
