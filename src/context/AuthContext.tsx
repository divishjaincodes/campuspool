import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[];
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<User>;
  loginWithGoogle: () => Promise<void>;
  signup: (data: {
    fullName: string;
    email: string;
    password?: string;
    college: string;
    gender: 'female' | 'male' | 'undisclosed';
    phone?: string;
    regNumber?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  switchUser: (userId: string) => User;
  updateProfile: (updates: Partial<User>) => Promise<User>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      const users = await authService.getAllUsers();
      setCurrentUser(user);
      setAllUsers(users);
    } catch (err) {
      console.error('Failed refreshing current user from Supabase', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    // Subscribe to real-time auth changes (Sign-in, Sign-out, OAuth redirect)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loginWithGoogle = async (): Promise<void> => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured yet. Check your .env file.');
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;
  };

  const login = async (email: string, password?: string): Promise<User> => {
    setIsLoading(true);
    try {
      const user = await authService.login(email, password);
      setCurrentUser(user);
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: {
    fullName: string;
    email: string;
    password?: string;
    college: string;
    gender: 'female' | 'male' | 'undisclosed';
    phone?: string;
    regNumber?: string;
  }): Promise<User> => {
    setIsLoading(true);
    try {
      const newUser = await authService.signup(data);
      setCurrentUser(newUser);
      return newUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const switchUser = (userId: string): User => {
    const found = allUsers.find((u) => u.id === userId);
    if (!found) {
      throw new Error('User not found');
    }
    setCurrentUser(found);
    return found;
  };

  const updateProfile = async (updates: Partial<User>): Promise<User> => {
    if (!currentUser) throw new Error('Not logged in');
    const updated = await authService.updateProfile(currentUser.id, updates);
    setCurrentUser(updated);
    return updated;
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        isLoading,
        login,
        loginWithGoogle,
        signup,
        logout,
        switchUser,
        updateProfile,
        refreshUser,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
