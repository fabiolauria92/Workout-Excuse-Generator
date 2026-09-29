import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { format, subDays } from 'date-fns';
import { Activity, TrendingUp, Award, Clock, Zap } from 'lucide-react';
import { useLocalStorage } from '../contexts/LocalStorageContext';
import { capitalize, DEFAULT_DURATION } from '../lib/workouts';

const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#6366F1'];

const tooltipStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  border: 'none',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  color: '#111827',
};

const pieLabel = (props: { name?: unknown; percent?: number }) =>
  `${String(props.name ?? '')} (${Math.round((props.percent ?? 0) * 100)}%)`;

export function StatsDashboard() {
  const { history, streak } = useLocalStorage();

  const workoutDistribution = history.reduce((acc: Record<string, number>, entry) => {
    acc[entry.workout_type] = (acc[entry.workout_type] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(workoutDistribution).map(([name, value]) => ({ name: capitalize(name), value }));

  // Local calendar days, matching how history dates are stored.
  const last7Days = Array.from({ length: 7 }, (_, index) => format(subDays(new Date(), 6 - index), 'yyyy-MM-dd'));

  const weeklyData = last7Days.map((date) => ({
    date: format(new Date(`${date}T00:00:00`), 'MM/dd'),
    excuses: history.filter((entry) => entry.date === date).length,
  }));

  const durationData = last7Days.map((date) => {
    const dayEntries = history.filter((entry) => entry.date === date);
    const average =
      dayEntries.length > 0
        ? dayEntries.reduce((sum, entry) => sum + (entry.duration ?? DEFAULT_DURATION), 0) / dayEntries.length
        : 0;
    return { date: format(new Date(`${date}T00:00:00`), 'MM/dd'), duration: Math.round(average) };
  });

  const intensityDistribution = history.reduce((acc: Record<string, number>, entry) => {
    const intensity = entry.intensity ?? 'unknown';
    acc[intensity] = (acc[intensity] || 0) + 1;
    return acc;
  }, {});
  const intensityData = Object.entries(intensityDistribution).map(([name, value]) => ({ name: capitalize(name), value }));

  const totalExcuses = history.length;
  const uniqueWorkouts = new Set(history.map((entry) => entry.workout_type)).size;
  const avgDuration =
    totalExcuses > 0
      ? Math.round(history.reduce((sum, entry) => sum + (entry.duration ?? DEFAULT_DURATION), 0) / totalExcuses)
      : 0;
  const mostCommonWorkout = Object.entries(workoutDistribution).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'None';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
          <Activity className="h-6 w-6 text-purple-500" />
          Workout Statistics
        </h2>
        <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/20 px-4 py-2 rounded-full">
          <Award className="h-5 w-5 text-purple-500" />
          <span className="text-purple-700 dark:text-purple-300 font-semibold">Current Streak: {streak}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 dark:from-purple-500/20 dark:to-blue-500/20 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-500" />
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Excuses</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{totalExcuses}</p>
        </div>
        <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 dark:from-pink-500/20 dark:to-purple-500/20 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-pink-500" />
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Unique Workouts</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{uniqueWorkouts}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Avg Duration</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{avgDuration} min</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 dark:from-green-500/20 dark:to-teal-500/20 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-green-500" />
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Top Workout</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2 capitalize">{mostCommonWorkout}</p>
        </div>
      </div>

      {totalExcuses === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">The charts fill in once you have generated a few excuses.</p>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold dark:text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            Weekly Activity
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="excuses" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold dark:text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-500" />
            Workout Distribution
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={pieLabel} outerRadius={100} dataKey="value">
                  {pieData.map((slice, index) => (
                    <Cell key={slice.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold dark:text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-500" />
            Duration Trend
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={durationData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="duration" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: '#8B5CF6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold dark:text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-500" />
            Intensity Distribution
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={intensityData} cx="50%" cy="50%" labelLine={false} label={pieLabel} outerRadius={100} dataKey="value">
                  {intensityData.map((slice, index) => (
                    <Cell key={slice.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
