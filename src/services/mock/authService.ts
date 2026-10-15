import { User } from '../../types';
import { getStorage, setStorage, STORAGE_KEYS, initStorageIfEmpty } from '../mockStorage';
import { INITIAL_USERS } from '../../data/mockData';

export const authService = {
  getCurrentUser: (): User => {
    initStorageIfEmpty();
    const currentId = getStorage<string>(STORAGE_KEYS.CURRENT_USER_ID, 'usr_aarav');
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const found = users.find((u) => u.id === currentId);
    return found || users[0];
  },

  getAllUsers: (): User[] => {
    initStorageIfEmpty();
    return getStorage<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  },

  switchUser: (userId: string): User => {
    const users = authService.getAllUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    setStorage(STORAGE_KEYS.CURRENT_USER_ID, userId);
    return user;
  },

  login: async (email: string, _password?: string): Promise<User> => {
    const users = authService.getAllUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('No student account found with this email. Please register or use a demo account.');
    }
    if (user.isSuspended) {
      throw new Error('This account is temporarily suspended by community safety moderators.');
    }
    setStorage(STORAGE_KEYS.CURRENT_USER_ID, user.id);
    return user;
  },

  signup: async (data: {
    fullName: string;
    email: string;
    college: string;
    gender: 'female' | 'male' | 'undisclosed';
    phone?: string;
    regNumber?: string;
  }): Promise<User> => {
    const users = authService.getAllUsers();
    const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      throw new Error('An account already exists with this college email.');
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      fullName: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + (users.length % 500)}?w=150&auto=format&fit=crop&q=80`,
      college: data.college || 'VIT Bhopal University',
      gender: data.gender,
      phone: data.phone?.trim(),
      regNumber: data.regNumber?.trim(),
      verificationStatus: 'demo',
      role: 'student',
      createdAt: new Date().toISOString(),
    };

    const updated = [newUser, ...users];
    setStorage(STORAGE_KEYS.USERS, updated);
    setStorage(STORAGE_KEYS.CURRENT_USER_ID, newUser.id);
    return newUser;
  },

  updateProfile: async (userId: string, updates: Partial<User>): Promise<User> => {
    const users = authService.getAllUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) throw new Error('User not found');

    const updatedUser = { ...users[index], ...updates };
    users[index] = updatedUser;
    setStorage(STORAGE_KEYS.USERS, users);
    return updatedUser;
  },

  logout: async (): Promise<void> => {
    // For demo purposes, we can reset to default Aarav or clear
    // We'll keep a user active or allow logging into another demo account
  },
};
