import { useState } from 'react';
import { motion } from 'framer-motion';
import { Medal, Star, Zap, Trophy, Target, Flame, Calendar, Clock, Dumbbell, Award } from 'lucide-react';
import { subDays, parseISO } from 'date-fns';
import { useLocalStorage, type HistoryEntry } from '../contexts/LocalStorageContext';
import { WORKOUT_TYPES } from '../lib/workouts';

type Category = 'beginner' | 'intermediate' | 'expert';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  /** 0–100 */
  progress: (history: HistoryEntry[], streak: number) => number;
  color: string;
  category: Category;
}

const uniqueWorkouts = (history: HistoryEntry[]) => new Set(history.map((entry) => entry.workout_type)).size;
const intenseCount = (history: HistoryEntry[]) => history.filter((entry) => entry.intensity === 'intense').length;
const longest = (history: HistoryEntry[]) => Math.max(0, ...history.map((entry) => entry.duration ?? 0));
const thisWeek = (history: HistoryEntry[]) => {
  const weekAgo = subDays(new Date(), 7);
  return history.filter((entry) => parseISO(entry.date) > weekAgo).length;
};
const ratio = (value: number, target: number) => Math.min(100, (value / target) * 100);

const achievements: Achievement[] = [
  {
    id: 'first-excuse',
    title: 'Beginner Procrastinator',
    description: 'Generated your first excuse',
    icon: Medal,
    progress: (history) => ratio(history.length, 1),
    color: 'text-yellow-400',
    category: 'beginner',
  },
  {
    id: 'streak-3',
    title: 'Consistency is Key',
    description: 'Maintained a 3-day excuse streak',
    icon: Flame,
    progress: (_, streak) => ratio(streak, 3),
    color: 'text-orange-500',
    category: 'beginner',
  },
  {
    id: 'variety',
    title: 'Creative Mind',
    description: 'Used excuses for 4 different workout types',
    icon: Star,
    progress: (history) => ratio(uniqueWorkouts(history), 4),
    color: 'text-purple-400',
    category: 'intermediate',
  },
  {
    id: 'master',
    title: 'Excuse Master',
    description: 'Generated 10 excuses',
    icon: Trophy,
    progress: (history) => ratio(history.length, 10),
    color: 'text-yellow-500',
    category: 'intermediate',
  },
  {
    id: 'intense',
    title: 'High Intensity Avoider',
    description: 'Skipped 5 intense workouts',
    icon: Zap,
    progress: (history) => ratio(intenseCount(history), 5),
    color: 'text-blue-400',
    category: 'expert',
  },
  {
    id: 'dedication',
    title: 'Dedicated Avoider',
    description: 'Skipped a 60+ minute workout',
    icon: Target,
    progress: (history) => (longest(history) >= 60 ? 100 : ratio(longest(history), 60)),
    color: 'text-red-400',
    category: 'intermediate',
  },
  {
    id: 'weekly-master',
    title: 'Weekly Champion',
    description: 'Generated 7 excuses in a single week',
    icon: Calendar,
    progress: (history) => ratio(thisWeek(history), 7),
    color: 'text-green-400',
    category: 'expert',
  },
  {
    id: 'marathon-skipper',
    title: 'Marathon Skipper',
    description: 'Avoided a 120+ minute workout',
    icon: Clock,
    progress: (history) => (longest(history) >= 120 ? 100 : ratio(longest(history), 120)),
    color: 'text-indigo-400',
    category: 'expert',
  },
  {
    id: 'variety-master',
    title: 'Variety Master',
    description: 'Used all available workout types',
    icon: Dumbbell,
    progress: (history) => ratio(uniqueWorkouts(history), WORKOUT_TYPES.length),
    color: 'text-pink-400',
    category: 'expert',
  },
];

const CATEGORIES = ['all', 'beginner', 'intermediate', 'expert'] as const;

export function AchievementsPanel() {
  const { history, streak } = useLocalStorage();
  const [selectedCategory, setSelectedCategory] = useState<(typeof CATEGORIES)[number]>('all');

  const filteredAchievements = achievements.filter(
    (achievement) => selectedCategory === 'all' || achievement.category === selectedCategory
  );

  const earnedCount = achievements.filter((achievement) => achievement.progress(history, streak) >= 100).length;
  const totalCount = achievements.length;
  const overallProgress = (earnedCount / totalCount) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-2 dark:text-white flex items-center gap-2">
            <Award className="h-6 w-6 text-yellow-400" />
            Achievements
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {earnedCount} of {totalCount} achievements unlocked
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="flex gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => {
          const progress = achievement.progress(history, streak);
          const isAchieved = progress >= 100;
          const Icon = achievement.icon;

          return (
            <motion.div
              key={achievement.id}
              className={`p-4 rounded-lg ${
                isAchieved
                  ? 'bg-gradient-to-br from-purple-500/10 to-blue-500/10 dark:from-purple-500/20 dark:to-blue-500/20'
                  : 'bg-gray-100 dark:bg-gray-700/50'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-full ${
                    isAchieved
                      ? 'bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50'
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <Icon className={`h-6 w-6 ${achievement.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold dark:text-white flex items-center gap-2">
                    {achievement.title}
                    {isAchieved && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      >
                        <Award className="h-4 w-4 text-yellow-400" />
                      </motion.div>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{achievement.description}</p>
                  <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    />
                  </div>
                  <p className="text-xs text-right mt-1 text-gray-500 dark:text-gray-400">{Math.round(progress)}%</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
