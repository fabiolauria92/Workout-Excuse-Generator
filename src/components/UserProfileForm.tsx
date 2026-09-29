import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Upload, X } from 'lucide-react';
import { z } from 'zod';
import { useUserPreferences } from '../contexts/UserPreferencesContext';
import { resizeImageToDataUrl } from '../lib/image';
import { Avatar } from './Avatar';

const displayNameSchema = z
  .string()
  .trim()
  .min(1, 'Display name is required')
  .max(30, 'Display name cannot exceed 30 characters');

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface UserProfileFormProps {
  onClose: () => void;
}

export function UserProfileForm({ onClose }: UserProfileFormProps) {
  const { preferences, updatePreferences } = useUserPreferences();
  const [displayName, setDisplayName] = useState(preferences.nickname);
  const [avatar, setAvatar] = useState<string | undefined>(preferences.avatarDataUrl);
  const [errors, setErrors] = useState<{ displayName?: string; avatar?: string }>({});
  const [busy, setBusy] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!AVATAR_TYPES.includes(file.type)) {
      setErrors((previous) => ({ ...previous, avatar: 'Only JPG, PNG and WebP images are allowed' }));
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setErrors((previous) => ({ ...previous, avatar: 'Images must be 5 MB or smaller' }));
      return;
    }

    setBusy(true);
    try {
      setAvatar(await resizeImageToDataUrl(file));
      setErrors((previous) => ({ ...previous, avatar: undefined }));
    } catch {
      setErrors((previous) => ({ ...previous, avatar: 'That file could not be read as an image' }));
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = displayNameSchema.safeParse(displayName);
    if (!parsed.success) {
      setErrors((previous) => ({ ...previous, displayName: parsed.error.issues[0]?.message ?? 'Invalid name' }));
      return;
    }
    updatePreferences({ nickname: parsed.data, avatarDataUrl: avatar });
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
            <User className="h-6 w-6 text-orange-500" />
            Edit Profile
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Everything stays in this browser. There is no account and nothing is uploaded.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Display name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="input"
              placeholder="How should we greet you?"
              maxLength={30}
            />
            {errors.displayName && <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>}
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile picture</span>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar name={displayName} src={avatar} className="w-20 h-20 text-2xl" />
                {avatar && (
                  <button
                    type="button"
                    aria-label="Remove picture"
                    onClick={() => setAvatar(undefined)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <Upload className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <span className="text-sm text-gray-600 dark:text-gray-300">{busy ? 'Processing…' : 'Upload photo'}</span>
                <input type="file" onChange={handleFileChange} accept={AVATAR_TYPES.join(',')} className="hidden" disabled={busy} />
              </label>
            </div>
            {errors.avatar && <p className="mt-1 text-sm text-red-600">{errors.avatar}</p>}
          </div>

          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="btn btn-primary">
              Save profile
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
