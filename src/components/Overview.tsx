import { motion } from 'framer-motion';
import { Dumbbell, Flame, Target, Clock, Calendar, Award, Zap, BookmarkCheck } from 'lucide-react';
import { useLocalStorage } from '../contexts/LocalStorageContext';
import { formatDay } from '../lib/format';
import { DEFAULT_DURATION } from '../lib/workouts';
import { UserProfileSection } from './UserProfileSection';

interface OverviewProps {
  onViewAll?: () => void;
  onEditProfile: () => void;
  onOpenSettings: () => void;
}

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  description: string;
  color: string;
}

const StatCard = ({ icon: Icon, title, value, description, color }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-gradient-to-br ${color} rounded-2xl p-6 relative overflow-hidden`}
  >
    <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4">
      <div className="w-24 h-24 bg-white/10 rounded-full" />
    </div>
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-6 w-6 text-white" />
        <h3 className="text-sm font-medium text-white/80">{title}</h3>
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-white/70">{description}</p>
    </div>
  </motion.div>
);

interface ActivityItemProps {
  excuse: string;
  date: string;
  workoutType: string;
  intensity?: string;
}

const ActivityItem = ({ excuse, date, workoutType, intensity }: ActivityItemProps) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
  >
    <p className="text-gray-900 dark:text-white font-medium">{excuse}</p>
    <div className="flex items-center gap-4 mt-2">
      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
        <Calendar className="h-4 w-4" />
        {formatDay(date)}
      </span>
      <span className="text-sm text-orange-500 capitalize flex items-center gap-1">
        <Dumbbell className="h-4 w-4" />
        {workoutType}
      </span>
      {intensity && (
        <span className="text-sm text-purple-500 capitalize flex items-center gap-1">
          <Zap className="h-4 w-4" />
          {intensity}
        </span>
      )}
    </div>
  </motion.div>
);

export function Overview({ onViewAll, onEditProfile, onOpenSettings }: OverviewProps) {
  const { history, streak, bestStreak } = useLocalStorage();

  const totalExcuses = history.length;
  const uniqueWorkouts = new Set(history.map((entry) => entry.workout_type)).size;
  const totalMinutes = history.reduce((sum, entry) => sum + (entry.duration ?? DEFAULT_DURATION), 0);
  const averageMinutes = totalExcuses > 0 ? Math.round(totalMinutes / totalExcuses) : 0;
  const savedCount = history.filter((entry) => entry.saved).length;

  const workoutDistribution = history.reduce((acc: Record<string, number>, entry) => {
    acc[entry.workout_type] = (acc[entry.workout_type] || 0) + 1;
    return acc;
  }, {});
  const mostSkippedWorkout = Object.entries(workoutDistribution).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'None yet';

  return (
    <div className="space-y-8">
      <UserProfileSection onEditProfile={onEditProfile} onOpenSettings={onOpenSettings} onViewAll={onViewAll} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Dumbbell}
          title="Total Excuses"
          value={totalExcuses}
          description="Workouts successfully avoided"
          color="from-cyan-500 to-blue-600"
        />
        <StatCard
          icon={Flame}
          title="Current Streak"
          value={`${streak} ${streak === 1 ? 'day' : 'days'}`}
          description="Consecutive days with an excuse"
          color="from-orange-500 to-red-600"
        />
        <StatCard
          icon={Target}
          title="Best Streak"
          value={`${bestStreak} ${bestStreak === 1 ? 'day' : 'days'}`}
          description="Your personal record"
          color="from-purple-500 to-pink-600"
        />
        <StatCard
          icon={Clock}
          title="Time Saved"
          value={`${totalMinutes}m`}
          description="Minutes of exercise avoided"
          color="from-green-500 to-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold dark:text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              Recent Activity
            </h2>
            {onViewAll && (
              <button
                onClick={onViewAll}
                className="text-sm text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                View All
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Nothing avoided yet. Head to “Generate Excuse”.</p>
          ) : (
            <div className="space-y-4">
              {history.slice(0, 5).map((entry) => (
                <ActivityItem
                  key={entry.id}
                  excuse={entry.excuse}
                  date={entry.date}
                  workoutType={entry.workout_type}
                  intensity={entry.intensity}
                />
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold dark:text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-500" />
              Quick Stats
            </h2>
          </div>
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Most Skipped</span>
                <Dumbbell className="h-4 w-4 text-orange-500" />
              </div>
              <p className="text-lg font-medium dark:text-white mt-1 capitalize">{mostSkippedWorkout}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Unique Workouts</span>
                <Target className="h-4 w-4 text-purple-500" />
              </div>
              <p className="text-lg font-medium dark:text-white mt-1">{uniqueWorkouts} types</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Avg. Duration</span>
                <Clock className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-lg font-medium dark:text-white mt-1">{averageMinutes} minutes</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Saved Excuses</span>
                <BookmarkCheck className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-lg font-medium dark:text-white mt-1">{savedCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
