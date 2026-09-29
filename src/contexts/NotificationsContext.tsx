import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { parseISO } from 'date-fns';
import { useLocalStorage, type HistoryEntry } from './LocalStorageContext';
import { useUserPreferences } from './UserPreferencesContext';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'achievement' | 'streak' | 'milestone';
  timestamp: number;
  read: boolean;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const READ_KEY = 'notificationsRead';
const DISMISSED_KEY = 'notificationsDismissed';

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

const dayStamp = (entry: HistoryEntry) => parseISO(entry.date).getTime();

/**
 * Milestones are derived from the history rather than stored, so they fire
 * exactly once per browser and never duplicate when the page re-renders.
 * History is newest-first.
 */
function deriveMilestones(
  history: HistoryEntry[],
  streak: number,
  wanted: { achievements: boolean; streaks: boolean }
): Omit<Notification, 'read'>[] {
  const milestones: Omit<Notification, 'read'>[] = [];

  if (wanted.streaks && streak >= 3 && history[0]) {
    milestones.push({
      id: 'milestone:streak-3',
      title: 'Streak Achievement',
      message: "You've maintained a 3-day excuse streak! Keep up the creative avoidance!",
      type: 'streak',
      timestamp: dayStamp(history[0]),
    });
  }

  if (wanted.achievements && history.length >= 10) {
    milestones.push({
      id: 'milestone:excuses-10',
      title: 'Milestone Reached',
      message: "You've generated 10 excuses! You're becoming a master of avoidance!",
      type: 'milestone',
      timestamp: dayStamp(history[history.length - 10]),
    });
  }

  if (wanted.achievements) {
    const seen = new Set<string>();
    let reachedAt: HistoryEntry | undefined;
    for (let index = history.length - 1; index >= 0; index -= 1) {
      seen.add(history[index].workout_type);
      if (seen.size === 5) {
        reachedAt = history[index];
        break;
      }
    }
    if (reachedAt) {
      milestones.push({
        id: 'milestone:variety-5',
        title: 'Variety Achievement',
        message: "You've now avoided 5 different types of workouts. Such versatility!",
        type: 'achievement',
        timestamp: dayStamp(reachedAt),
      });
    }
  }

  return milestones;
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [readIds, setReadIds] = useState<string[]>(() => readJson(READ_KEY, []));
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => readJson(DISMISSED_KEY, []));
  const { history, streak } = useLocalStorage();
  const { preferences } = useUserPreferences();

  useEffect(() => {
    localStorage.setItem(READ_KEY, JSON.stringify(readIds));
  }, [readIds]);

  useEffect(() => {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissedIds));
  }, [dismissedIds]);

  const notifications = useMemo(
    () =>
      deriveMilestones(history, streak, preferences.notifications)
        .filter((milestone) => !dismissedIds.includes(milestone.id))
        .map((milestone) => ({ ...milestone, read: readIds.includes(milestone.id) }))
        .sort((a, b) => b.timestamp - a.timestamp),
    [history, streak, preferences.notifications, dismissedIds, readIds]
  );

  const markAsRead = (id: string) => {
    setReadIds((previous) => (previous.includes(id) ? previous : [...previous, id]));
  };

  const markAllAsRead = () => {
    setReadIds((previous) => [...new Set([...previous, ...notifications.map((notification) => notification.id)])]);
  };

  const clearNotifications = () => {
    setDismissedIds((previous) => [...new Set([...previous, ...notifications.map((notification) => notification.id)])]);
  };

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
