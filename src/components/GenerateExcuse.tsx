import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, RefreshCcw, Share2 } from 'lucide-react';
import { TwitterShareButton, FacebookShareButton } from 'react-share';
import { useLocalStorage } from '../contexts/LocalStorageContext';
import { useUserPreferences } from '../contexts/UserPreferencesContext';
import { capitalize, INTENSITIES, type Intensity } from '../lib/workouts';

interface ExcuseResponse {
  excuse: string;
  counter_motivation: string;
  workout_details: {
    workout_type: string;
    duration_minutes: number;
    intensity: Intensity;
  };
}

export function GenerateExcuse() {
  const { addExcuse } = useLocalStorage();
  const { preferences } = useUserPreferences();
  const [chosenWorkout, setChosenWorkout] = useState<string | null>(null);
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState<Intensity>('moderate');
  const [response, setResponse] = useState<ExcuseResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Falls back to the first favourite whenever the chosen type is removed in Settings.
  const workoutType =
    chosenWorkout && preferences.favoriteWorkouts.includes(chosenWorkout)
      ? chosenWorkout
      : (preferences.favoriteWorkouts[0] ?? 'running');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setCopied(false);

    try {
      const res = await fetch('/generate-excuse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workout_type: workoutType, duration, intensity }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `The excuse service answered ${res.status}`);
      }

      const data = (await res.json()) as ExcuseResponse;
      setResponse(data);
      addExcuse({
        excuse: data.excuse,
        counter_motivation: data.counter_motivation,
        workout_type: workoutType,
        duration,
        intensity,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate an excuse. Is the API running?');
    } finally {
      setLoading(false);
    }
  };

  const shareText = response ? `${response.excuse}\n${response.counter_motivation}` : '';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be denied; the text is on screen anyway.
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold dark:text-white">Generate New Excuse</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="workoutType" className="block text-sm font-medium dark:text-white mb-2">
              Workout Type
            </label>
            <select
              id="workoutType"
              value={workoutType}
              onChange={(event) => setChosenWorkout(event.target.value)}
              className="w-full rounded-xl border dark:border-gray-700 dark:bg-gray-700 dark:text-white p-3"
            >
              {preferences.favoriteWorkouts.map((workout) => (
                <option key={workout} value={workout}>
                  {capitalize(workout)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium dark:text-white mb-2">
              Duration (minutes)
            </label>
            <input
              id="duration"
              type="number"
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
              min="1"
              max="180"
              required
              className="w-full rounded-xl border dark:border-gray-700 dark:bg-gray-700 dark:text-white p-3"
            />
          </div>

          <fieldset>
            <legend className="block text-sm font-medium dark:text-white mb-2">Intensity</legend>
            <div className="flex gap-4">
              {INTENSITIES.map((level) => (
                <label key={level} className="flex items-center">
                  <input
                    type="radio"
                    name="intensity"
                    value={level}
                    checked={intensity === level}
                    onChange={() => setIntensity(level)}
                    className="mr-2"
                  />
                  <span className="dark:text-white capitalize">{level}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {loading ? <RefreshCcw className="animate-spin h-5 w-5 mx-auto" /> : 'Generate Excuse'}
          </button>
        </form>

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <AnimatePresence>
          {response && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-6 space-y-4"
            >
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl">
                <p className="text-orange-800 dark:text-orange-200">{response.excuse}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
                <p className="text-purple-800 dark:text-purple-200">{response.counter_motivation}</p>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-800"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <TwitterShareButton url={window.location.href} title={shareText}>
                  <span className="flex items-center space-x-2 px-4 py-2 bg-blue-400 text-white rounded-xl">
                    <Share2 className="h-4 w-4" />
                    <span>Tweet</span>
                  </span>
                </TwitterShareButton>
                <FacebookShareButton url={window.location.href} hashtag="#WorkoutExcuse">
                  <span className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl">
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </span>
                </FacebookShareButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl p-6 text-white">
        <h2 className="text-lg font-bold mb-4">Pro Tips</h2>
        <ul className="space-y-4">
          <li className="flex items-start space-x-2">
            <span className="text-orange-200">•</span>
            <p className="text-sm">Be creative with your excuses - the more unique, the more believable!</p>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-orange-200">•</span>
            <p className="text-sm">Mix up your workout types to maintain variety in your excuse portfolio.</p>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-orange-200">•</span>
            <p className="text-sm">Higher intensity workouts often require more elaborate excuses.</p>
          </li>
        </ul>
      </div>
    </div>
  );
}
