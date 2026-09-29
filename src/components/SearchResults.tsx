import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Calendar, Dumbbell } from 'lucide-react';
import { useSearch } from '../contexts/SearchContext';
import { useLocalStorage } from '../contexts/LocalStorageContext';
import { formatDay } from '../lib/format';

export function SearchResults() {
  const { searchQuery, setSearchQuery } = useSearch();
  const { history } = useLocalStorage();

  if (!searchQuery) return null;

  const needle = searchQuery.toLowerCase();
  const filteredExcuses = history.filter(
    (entry) => entry.excuse.toLowerCase().includes(needle) || entry.workout_type.toLowerCase().includes(needle)
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border dark:border-gray-700 max-h-96 overflow-y-auto z-50"
      >
        <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Found {filteredExcuses.length} {filteredExcuses.length === 1 ? 'result' : 'results'}
            </span>
          </div>
          <button onClick={() => setSearchQuery('')} aria-label="Clear search" className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        <div className="divide-y dark:divide-gray-700">
          {filteredExcuses.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <p className="text-gray-900 dark:text-white mb-2">{entry.excuse}</p>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDay(entry.date)}
                </span>
                <span className="text-sm text-orange-500 flex items-center gap-1">
                  <Dumbbell className="h-4 w-4" />
                  {entry.workout_type}
                </span>
              </div>
            </motion.div>
          ))}

          {filteredExcuses.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No excuses found for "{searchQuery}"</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
