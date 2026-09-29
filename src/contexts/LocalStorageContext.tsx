import React, { createContext, useContext, useEffect, useState } from 'react';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import type { Intensity } from '../lib/workouts';

export interface HistoryEntry {
  id: string;
  /** Local calendar day, `yyyy-MM-dd`. */
  date: string;
  excuse: string;
  counter_motivation?: string;
  workout_type: string;
  /** Minutes. Entries from before this was recorded have none. */
  duration?: number;
  intensity?: Intensity;
  saved?: boolean;
}

export type NewExcuse = Omit<HistoryEntry, 'id' | 'date' | 'saved'>;

interface LocalStorageContextType {
  history: HistoryEntry[];
  streak: number;
  bestStreak: number;
  addExcuse: (excuse: NewExcuse) => void;
  toggleSavedExcuse: (id: string) => void;
  getSavedExcuses: () => HistoryEntry[];
}

const HISTORY_KEY = 'excuseHistory';
const STREAK_KEY = 'streak';
const BEST_STREAK_KEY = 'bestStreak';

const LocalStorageContext = createContext<LocalStorageContextType | undefined>(undefined);

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Entries written by earlier versions have no id; give them one, once. */
function migrate(entries: unknown): HistoryEntry[] {
  if (!Array.isArray(entries)) return [];
  return entries
    .filter(
      (entry): entry is Partial<HistoryEntry> & Pick<HistoryEntry, 'excuse' | 'date'> =>
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as HistoryEntry).excuse === 'string' &&
        typeof (entry as HistoryEntry).date === 'string'
    )
    .map((entry) => ({
      ...entry,
      id: entry.id ?? newId(),
      workout_type: entry.workout_type ?? 'unknown',
    }));
}

export function LocalStorageProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<HistoryEntry[]>(() => migrate(readJson<unknown>(HISTORY_KEY, [])));
  const [streak, setStreak] = useState<number>(() => readJson<number>(STREAK_KEY, 0));
  const [bestStreak, setBestStreak] = useState<number>(() => readJson<number>(BEST_STREAK_KEY, 0));

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
  }, [streak]);

  useEffect(() => {
    localStorage.setItem(BEST_STREAK_KEY, JSON.stringify(bestStreak));
  }, [bestStreak]);

  const addExcuse = (input: NewExcuse) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const entry: HistoryEntry = { id: newId(), date: today, saved: false, ...input };

    // A streak is consecutive calendar days with at least one excuse.
    const last = history[0];
    let nextStreak = 1;
    if (last) {
      const gap = differenceInCalendarDays(parseISO(today), parseISO(last.date));
      if (gap === 0) nextStreak = Math.max(streak, 1);
      else if (gap === 1) nextStreak = streak + 1;
    }

    setStreak(nextStreak);
    setBestStreak((best) => Math.max(best, nextStreak));
    setHistory((previous) => [entry, ...previous]);
  };

  const toggleSavedExcuse = (id: string) => {
    setHistory((previous) => previous.map((entry) => (entry.id === id ? { ...entry, saved: !entry.saved } : entry)));
  };

  const getSavedExcuses = () => history.filter((entry) => entry.saved);

  return (
    <LocalStorageContext.Provider value={{ history, streak, bestStreak, addExcuse, toggleSavedExcuse, getSavedExcuses }}>
      {children}
    </LocalStorageContext.Provider>
  );
}

export function useLocalStorage() {
  const context = useContext(LocalStorageContext);
  if (context === undefined) {
    throw new Error('useLocalStorage must be used within a LocalStorageProvider');
  }
  return context;
}
