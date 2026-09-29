import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Award, Flame, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { useNotifications } from '../contexts/NotificationsContext';

const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'achievement':
      return <Award className="h-5 w-5 text-purple-500" />;
    case 'streak':
      return <Flame className="h-5 w-5 text-orange-500" />;
    case 'milestone':
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    default:
      return <Bell className="h-5 w-5 text-blue-500" />;
  }
};

export function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const { notifications, unreadCount, markAllAsRead, markAsRead, clearNotifications } = useNotifications();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border dark:border-gray-700 overflow-hidden z-50"
    >
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-500" />
            <h3 className="font-semibold dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 text-xs px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Mark all as read
              </button>
            )}
            <button onClick={onClose} aria-label="Close notifications" className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="divide-y dark:divide-gray-700 max-h-[70vh] overflow-y-auto">
        <AnimatePresence>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 ${
                  notification.read ? 'bg-white dark:bg-gray-800' : 'bg-orange-50 dark:bg-orange-900/10'
                } hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex gap-3">
                  <NotificationIcon type={notification.type} />
                  <div className="flex-1">
                    <p className="font-medium dark:text-white">{notification.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{format(notification.timestamp, 'MMM d, yyyy')}</p>
                  </div>
                  {!notification.read && <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Keep avoiding workouts to earn achievements!</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {notifications.length > 0 && (
        <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button onClick={clearNotifications} className="text-sm text-red-500 hover:text-red-600 dark:hover:text-red-400">
            Clear all
          </button>
        </div>
      )}
    </motion.div>
  );
}
