import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { COUNTER_MOTIVATIONS, EXCUSES, INTENSITIES } from './excuses.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '../dist');

const app = express();
app.use(express.json({ limit: '10kb' }));

// Production: the built client is served from the same origin as the API.
app.use(express.static(distDir));

const pick = (list) => list[Math.floor(Math.random() * list.length)];

app.post('/generate-excuse', (req, res) => {
  const { workout_type: workoutType, duration, intensity } = req.body ?? {};

  if (typeof workoutType !== 'string' || !Object.hasOwn(EXCUSES, workoutType)) {
    return res.status(400).json({ error: 'Invalid workout type' });
  }
  if (!Number.isFinite(duration) || duration < 1 || duration > 180) {
    return res.status(400).json({ error: 'Duration must be between 1 and 180 minutes' });
  }
  if (!INTENSITIES.includes(intensity)) {
    return res.status(400).json({ error: 'Invalid intensity level' });
  }

  return res.json({
    excuse: `I can't do ${workoutType} today because ${pick(EXCUSES[workoutType])}`,
    counter_motivation: `But remember: ${pick(COUNTER_MOTIVATIONS)}`,
    workout_details: {
      workout_type: workoutType,
      duration_minutes: duration,
      intensity,
    },
  });
});

// Every other GET is the single-page app.
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  return res.sendFile(join(distDir, 'index.html'), (err) => {
    if (err) res.status(404).json({ error: 'Client not built yet — run `npm run build` first' });
  });
});

const PORT = Number(process.env.PORT) || 8000;
app.listen(PORT, () => {
  console.log(`Workout Excuse Generator API listening on http://localhost:${PORT}`);
});
