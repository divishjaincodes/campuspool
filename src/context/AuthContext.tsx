import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services';

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[];
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<User>;
  signup: (data: {
    fullName: string;
    email: string;
    college: string;
    gender: 'female' | 'male' | 'undisclosed';
    phone?: string;
    regNumber?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  switchUser: (userId: string) => User;
  updateProfile: (updates: Partial<User>) => Promise<User>;
  refreshUser: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = () => {
    try {
      const user = authService.getCurrentUser();
      const users = authService.getAllUsers();
      setCurrentUser(user);
      setAllUsers(users);
    } catch (err) {
      console.error('Failed refreshing current user', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password?: string): Promise<User> => {
    const user = await authService.login(email, password);
    setCurrentUser(user);
    setAllUsers(authService.getAllUsers());
    return user;
  };

  const signup = async (data: {
    fullName: string;
    email: string;
    college: string;
    gender: 'female' | 'male' | 'undisclosed';
    phone?: string;
    regNumber?: string;
  }): Promise<User> => {
    const newUser = await authService.signup(data);
    setCurrentUser(newUser);
    setAllUsers(authService.getAllUsers());
    return newUser;
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    refreshUser();
  };

  const switchUser = (userId: string): User => {
    const user = authService.switchUser(userId);
    setCurrentUser(user);
    setAllUsers(authService.getAllUsers());
    return user;
  };

  const updateProfile = async (updates: Partial<User>): Promise<User> => {
    if (!currentUser) throw new Error('Not logged in');
    const updated = await authService.updateProfile(currentUser.id, updates);
    setCurrentUser(updated);
    setAllUsers(authService.getAllUsers());
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
