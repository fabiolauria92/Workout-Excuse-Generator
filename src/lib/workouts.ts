export const WORKOUT_TYPES = ['running', 'weightlifting', 'yoga', 'swimming', 'cycling', 'HIIT'] as const;
export type WorkoutType = (typeof WORKOUT_TYPES)[number];

export const INTENSITIES = ['light', 'moderate', 'intense'] as const;
export type Intensity = (typeof INTENSITIES)[number];

/** Entries written before duration was recorded are counted at this length. */
export const DEFAULT_DURATION = 30;

export const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
