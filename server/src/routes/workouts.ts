/**
 * Workouts REST API routes
 */

import { Router, Request, Response } from 'express';
import {
  getWorkouts,
  getWorkoutById,
  getExerciseProgress,
  getWeeklyStats,
  getUniqueExercises,
} from '../services/workout.js';

const router = Router();

/**
 * GET /api/workouts
 * Get recent workouts with pagination
 * Query params: limit=20, offset=0
 */
router.get('/workouts', (req: Request, res: Response): void => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const workouts = getWorkouts(limit, offset);
    res.json(workouts);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.status(500).json({ error: 'Failed to fetch workouts' });
  }
});

/**
 * GET /api/workouts/:id
 * Get a single workout by ID with its exercises
 */
router.get('/workouts/:id', (req: Request, res: Response): void => {
  try {
    const workout = getWorkoutById(req.params.id);

    if (!workout) {
      res.status(404).json({ error: 'Workout not found' });
      return;
    }

    res.json(workout);
  } catch (error) {
    console.error('Error fetching workout:', error);
    res.status(500).json({ error: 'Failed to fetch workout' });
  }
});

/**
 * GET /api/exercises/progress
 * Get historical progress for an exercise
 * Query params: name=Bench+Press, days=90
 */
router.get('/exercises/progress', (req: Request, res: Response): void => {
  try {
    const exerciseName = req.query.name as string;
    const days = parseInt(req.query.days as string) || 90;

    if (!exerciseName || exerciseName.trim() === '') {
      res.status(400).json({ error: 'Exercise name is required' });
      return;
    }

    const progress = getExerciseProgress(exerciseName, days);
    res.json(progress);
  } catch (error) {
    console.error('Error fetching exercise progress:', error);
    res.status(500).json({ error: 'Failed to fetch exercise progress' });
  }
});

/**
 * GET /api/exercises/names
 * Get list of all unique exercise names
 */
router.get('/exercises/names', (req: Request, res: Response): void => {
  try {
    const exercises = getUniqueExercises();
    res.json(exercises);
  } catch (error) {
    console.error('Error fetching exercise names:', error);
    res.status(500).json({ error: 'Failed to fetch exercise names' });
  }
});

/**
 * GET /api/stats/weekly
 * Get weekly statistics
 */
router.get('/stats/weekly', (req: Request, res: Response): void => {
  try {
    const stats = getWeeklyStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching weekly stats:', error);
    res.status(500).json({ error: 'Failed to fetch weekly stats' });
  }
});

export default router;
