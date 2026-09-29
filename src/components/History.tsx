import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Filter, Search, Dumbbell, Clock, Zap } from 'lucide-react';
import { parseISO, subDays, subMonths, subYears } from 'date-fns';
import { useLocalStorage, type HistoryEntry } from '../contexts/LocalStorageContext';
import { formatDay } from '../lib/format';
import { capitalize, DEFAULT_DURATION } from '../lib/workouts';

type DateRange = 'all' | 'week' | 'month' | 'year';

interface FilterState {
  workoutType: string;
  dateRange: DateRange;
  searchQuery: string;
}

const rangeStart = (range: DateRange): Date | null => {
  const now = new Date();
  switch (range) {
    case 'week':
      return subDays(now, 7);
    case 'month':
      return subMonths(now, 1);
    case 'year':
      return subYears(now, 1);
    default:
      return null;
  }
};

const mostCommonIntensity = (entries: HistoryEntry[]) => {
  const counts = entries.reduce((acc: Record<string, number>, entry) => {
    if (entry.intensity) acc[entry.intensity] = (acc[entry.intensity] || 0) + 1;
    return acc;
  }, {});
  const top = Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0];
  return top ? capitalize(top) : '—';
};

export function History() {
  const { history } = useLocalStorage();
  const [filters, setFilters] = useState<FilterState>({ workoutType: 'all', dateRange: 'all', searchQuery: '' });

  const workoutTypes = ['all', ...new Set(history.map((entry) => entry.workout_type))];
  const start = rangeStart(filters.dateRange);
  const needle = filters.searchQuery.toLowerCase();

  const filteredHistory = history.filter((entry) => {
    const matchesWorkoutType = filters.workoutType === 'all' || entry.workout_type === filters.workoutType;
    const matchesSearch = entry.excuse.toLowerCase().includes(needle);
    const matchesDate = start === null || parseISO(entry.date) >= start;
    return matchesWorkoutType && matchesSearch && matchesDate;
  });

  const totalMinutes = filteredHistory.reduce((sum, entry) => sum + (entry.duration ?? DEFAULT_DURATION), 0);

  const groupedByDate = filteredHistory.reduce((groups: Record<string, HistoryEntry[]>, entry) => {
    (groups[entry.date] ||= []).push(entry);
    return groups;
  }, {});

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-bold dark:text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-500" />
            Excuse History
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search excuses..."
                aria-label="Search excuses"
                value={filters.searchQuery}
                onChange={(event) => setFilters((previous) => ({ ...previous, searchQuery: event.target.value }))}
                className="pl-9 pr-4 py-2 rounded-xl border dark:border-gray-700 dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <select
              aria-label="Workout type"
              value={filters.workoutType}
              onChange={(event) => setFilters((previous) => ({ ...previous, workoutType: event.target.value }))}
              className="px-4 py-2 rounded-xl border dark:border-gray-700 dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {workoutTypes.map((type) => (
                <option key={type} value={type}>
                  {capitalize(type)}
                </option>
              ))}
            </select>
            <select
              aria-label="Date range"
              value={filters.dateRange}
              onChange={(event) => setFilters((previous) => ({ ...previous, dateRange: event.target.value as DateRange }))}
              className="px-4 py-2 rounded-xl border dark:border-gray-700 dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Time</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="year">Past Year</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-orange-600 dark:text-orange-300">Total Excuses</span>
              <Filter className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-200 mt-2">{filteredHistory.length}</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-600 dark:text-purple-300">Unique Workouts</span>
              <Dumbbell className="h-4 w-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-200 mt-2">
              {new Set(filteredHistory.map((entry) => entry.workout_type)).size}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-600 dark:text-blue-300">Total Duration</span>
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-200 mt-2">{totalMinutes}m</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-600 dark:text-green-300">Usual Intensity</span>
              <Zap className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-200 mt-2">{mostCommonIntensity(filteredHistory)}</p>
          </div>
        </div>

        {filteredHistory.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">No excuses match these filters.</p>
        )}

        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([date, entries]) => (
            <motion.div key={date} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
              <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 py-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{formatDay(date, 'MMMM d, yyyy')}</h3>
              </div>
              <div className="space-y-4 mt-4">
                {entries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4"
                  >
                    <p className="text-gray-900 dark:text-white">{entry.excuse}</p>
                    {entry.counter_motivation && (
                      <p className="text-sm text-purple-600 dark:text-purple-300 mt-1">{entry.counter_motivation}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <span className="text-sm text-orange-500 capitalize flex items-center gap-1">
                        <Dumbbell className="h-4 w-4" />
                        {entry.workout_type}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {entry.duration ?? DEFAULT_DURATION} minutes
                      </span>
                      {entry.intensity && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 capitalize flex items-center gap-1">
                          <Zap className="h-4 w-4" />
                          {entry.intensity}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
