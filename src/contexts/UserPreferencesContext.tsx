import React, { createContext, useContext, useEffect, useState } from 'react';
import { WORKOUT_TYPES } from '../lib/workouts';

export interface UserPreferences {
  nickname: string;
  /** Small JPEG data URL produced by the profile form; undefined shows initials. */
  avatarDataUrl?: string;
  /** ISO timestamp of the first run on this browser. */
  firstSeen: string;
  favoriteWorkouts: string[];
  notifications: {
    achievements: boolean;
    streaks: boolean;
  };
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (changes: Partial<UserPreferences>) => void;
}

const STORAGE_KEY = 'userPreferences';

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

function load(): UserPreferences {
  const defaults: UserPreferences = {
    nickname: '',
    firstSeen: new Date().toISOString(),
    favoriteWorkouts: [...WORKOUT_TYPES],
    notifications: { achievements: true, streaks: true },
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const saved = JSON.parse(raw) as Partial<UserPreferences>;
    return {
      ...defaults,
      ...saved,
      notifications: { ...defaults.notifications, ...saved.notifications },
    };
  } catch {
    return defaults;
  }
}

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const updatePreferences = (changes: Partial<UserPreferences>) => {
    setPreferences((previous) => ({
      ...previous,
      ...changes,
      // The generator needs at least one workout type to offer.
      favoriteWorkouts:
        changes.favoriteWorkouts && changes.favoriteWorkouts.length > 0
          ? changes.favoriteWorkouts
          : previous.favoriteWorkouts,
    }));
  };

  return (
    <UserPreferencesContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
}
