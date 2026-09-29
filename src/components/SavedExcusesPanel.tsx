import { motion } from 'framer-motion';
import { BookmarkCheck, X, Calendar, Dumbbell, Trash2 } from 'lucide-react';
import { useLocalStorage } from '../contexts/LocalStorageContext';
import { formatDay } from '../lib/format';

interface SavedExcusesPanelProps {
  onClose: () => void;
}

export function SavedExcusesPanel({ onClose }: SavedExcusesPanelProps) {
  const { getSavedExcuses, toggleSavedExcuse } = useLocalStorage();
  const savedExcuses = getSavedExcuses();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full my-8"
      >
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
            <BookmarkCheck className="h-5 w-5 text-orange-500" />
            Saved Excuses
          </h2>
          <button onClick={onClose} aria-label="Close" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {savedExcuses.length > 0 ? (
            <div className="space-y-4">
              {savedExcuses.map((excuse, index) => (
                <motion.div
                  key={excuse.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white">{excuse.excuse}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDay(excuse.date)}
                        </span>
                        <span className="text-sm text-orange-500 flex items-center gap-1">
                          <Dumbbell className="h-4 w-4" />
                          {excuse.workout_type}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSavedExcuse(excuse.id)}
                      aria-label="Remove from saved"
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookmarkCheck className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No saved excuses yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Save your favorite excuses for quick access!</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
