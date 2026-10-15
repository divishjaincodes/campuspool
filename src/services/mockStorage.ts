import {
  INITIAL_USERS,
  INITIAL_RIDES,
  INITIAL_BOOKINGS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_REVIEWS,
  INITIAL_REPORTS,
} from '../data/mockData';
import { User, Ride, Booking, Conversation, Message, Notification, Review, SafetyReport } from '../types';

const STORAGE_PREFIX = 'CAMPUSPOOL_V1_';

export const STORAGE_KEYS = {
  USERS: `${STORAGE_PREFIX}USERS`,
  CURRENT_USER_ID: `${STORAGE_PREFIX}CURRENT_USER_ID`,
  RIDES: `${STORAGE_PREFIX}RIDES`,
  BOOKINGS: `${STORAGE_PREFIX}BOOKINGS`,
  CONVERSATIONS: `${STORAGE_PREFIX}CONVERSATIONS`,
  MESSAGES: `${STORAGE_PREFIX}MESSAGES`,
  NOTIFICATIONS: `${STORAGE_PREFIX}NOTIFICATIONS`,
  REVIEWS: `${STORAGE_PREFIX}REVIEWS`,
  REPORTS: `${STORAGE_PREFIX}REPORTS`,
};

export const getStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      setStorage(key, defaultValue);
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Failed reading ${key} from localStorage, resetting to default`, error);
    setStorage(key, defaultValue);
    return defaultValue;
  }
};

export const setStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed writing to localStorage for key ${key}`, error);
  }
};

// Initialize or restore safe defaults
export const initStorageIfEmpty = (): void => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    setStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID)) {
    // Default to Aarav Sharma for immediate demo experience
    setStorage(STORAGE_KEYS.CURRENT_USER_ID, 'usr_aarav');
  }
  if (!localStorage.getItem(STORAGE_KEYS.RIDES)) {
    setStorage(STORAGE_KEYS.RIDES, INITIAL_RIDES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    setStorage(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CONVERSATIONS)) {
    setStorage(STORAGE_KEYS.CONVERSATIONS, INITIAL_CONVERSATIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    setStorage(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    setStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    setStorage(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
    setStorage(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  }
};

// Reset demo dataset to initial state with confirmation
export const resetDemoData = (): void => {
  setStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
  setStorage(STORAGE_KEYS.CURRENT_USER_ID, 'usr_aarav');
  setStorage(STORAGE_KEYS.RIDES, INITIAL_RIDES);
  setStorage(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
  setStorage(STORAGE_KEYS.CONVERSATIONS, INITIAL_CONVERSATIONS);
  setStorage(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
  setStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  setStorage(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  setStorage(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
};
