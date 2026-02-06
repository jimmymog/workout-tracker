/**
 * Workout service - business logic for managing workouts and exercises
 */

import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { Workout, Exercise, ExerciseProgress, WeeklyStats } from '../types.js';
import { parseWorkoutText } from './parser.js';

/**
 * Create a new workout from freeform text
 * @param rawText - Raw workout text from user
 * @param phoneNumber - Phone number of the user (optional, for SMS tracking)
 * @returns Created workout with exercises
 */
export async function createWorkoutFromText(
  rawText: string,
  phoneNumber?: string
): Promise<Workout & { exercises: Exercise[] }> {
  // Parse the text using Claude API
  const parsed = await parseWorkoutText(rawText);

  // Create workout record
  const workoutId = uuidv4();
  const now = new Date().toISOString();
  const today = new Date().toISOString().split('T')[0];

  const insertWorkout = db.prepare(`
    INSERT INTO workouts (id, workout_type, date, raw_text, created_at, phone_number)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertWorkout.run(
    workoutId,
    parsed.workout_type,
    today,
    rawText,
    now,
    phoneNumber || null
  );

  // Insert exercises
  const insertExercise = db.prepare(`
    INSERT INTO exercises (id, workout_id, exercise_name, weight, reps, sets, notes, order_in_workout, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const exercises: any[] = [];
  parsed.exercises.forEach((parsedEx, index) => {
    const exerciseId = uuidv4();
    insertExercise.run(
      exerciseId,
      workoutId,
      parsedEx.exercise_name,
      parsedEx.weight,
      parsedEx.reps,
      parsedEx.sets,
      parsedEx.notes,
      index,
      now
    );

    exercises.push({
      id: exerciseId,
      name: parsedEx.exercise_name,
      weight: parsedEx.weight,
      reps: parsedEx.reps,
      sets: parsedEx.sets,
      notes: parsedEx.notes,
    });
  });

  return {
    id: workoutId,
    type: parsed.workout_type,
    date: today,
    exercises,
  };
}

/**
 * Get recent workouts with their exercises
 * @param limit - Maximum number of workouts to return
 * @param offset - Number of workouts to skip
 * @returns Array of workouts with exercises
 */
export function getWorkouts(limit: number = 20, offset: number = 0): (Workout & { exercises: Exercise[] })[] {
  const query = `
    SELECT
      w.id, w.workout_type, w.date, w.raw_text, w.created_at,
      e.id as exercise_id, e.exercise_name, e.weight, e.reps, e.sets, e.notes, e.order_in_workout
    FROM workouts w
    LEFT JOIN exercises e ON w.id = e.workout_id
    ORDER BY w.date DESC, w.created_at DESC, e.order_in_workout ASC
    LIMIT ? OFFSET ?
  `;

  const rows = db.prepare(query).all(limit, offset) as Array<{
    id: string;
    workout_type: string | null;
    date: string;
    raw_text: string;
    created_at: string;
    exercise_id: string | null;
    exercise_name: string | null;
    weight: number | null;
    reps: number | null;
    sets: number | null;
    notes: string | null;
    order_in_workout: number | null;
  }>;

  // Group exercises by workout
  const workoutMap = new Map<string, any>();

  rows.forEach((row) => {
    if (!workoutMap.has(row.id)) {
      workoutMap.set(row.id, {
        id: row.id,
        type: (row.workout_type as Workout['workout_type']) || null,
        date: row.date,
        exercises: [],
      });
    }

    if (row.exercise_id) {
      const workout = workoutMap.get(row.id)!;
      workout.exercises.push({
        id: row.exercise_id,
        name: row.exercise_name!,
        weight: row.weight,
        reps: row.reps,
        sets: row.sets!,
        notes: row.notes,
      });
    }
  });

  return Array.from(workoutMap.values());
}

/**
 * Get a single workout by ID with its exercises
 * @param id - Workout ID
 * @returns Workout with exercises, or null if not found
 */
export function getWorkoutById(id: string): (Workout & { exercises: Exercise[] }) | null {
  const query = `
    SELECT
      w.id, w.workout_type, w.date, w.raw_text, w.created_at,
      e.id as exercise_id, e.exercise_name, e.weight, e.reps, e.sets, e.notes, e.order_in_workout
    FROM workouts w
    LEFT JOIN exercises e ON w.id = e.workout_id
    WHERE w.id = ?
    ORDER BY e.order_in_workout ASC
  `;

  const rows = db.prepare(query).all(id) as Array<{
    id: string;
    workout_type: string | null;
    date: string;
    raw_text: string;
    created_at: string;
    exercise_id: string | null;
    exercise_name: string | null;
    weight: number | null;
    reps: number | null;
    sets: number | null;
    notes: string | null;
    order_in_workout: number | null;
  }>;

  if (rows.length === 0) {
    return null;
  }

  const firstRow = rows[0];
  const exercises: any[] = rows
    .filter((row) => row.exercise_id)
    .map((row) => ({
      id: row.exercise_id!,
      name: row.exercise_name!,
      weight: row.weight,
      reps: row.reps,
      sets: row.sets!,
      notes: row.notes,
    }));

  return {
    id: firstRow.id,
    type: (firstRow.workout_type as Workout['workout_type']) || null,
    date: firstRow.date,
    exercises,
  };
}

/**
 * Get historical progress for a specific exercise
 * @param exerciseName - Name of the exercise
 * @param days - Number of days to look back
 * @returns Array of exercise data points
 */
export function getExerciseProgress(exerciseName: string, days: number = 90): ExerciseProgress[] {
  const query = `
    SELECT
      w.date, e.weight, e.reps, e.sets, e.notes
    FROM exercises e
    JOIN workouts w ON e.workout_id = w.id
    WHERE LOWER(e.exercise_name) = LOWER(?)
      AND w.date >= date('now', '-' || ? || ' days')
    ORDER BY w.date ASC
  `;

  const rows = db.prepare(query).all(exerciseName, days) as ExerciseProgress[];
  return rows;
}

/**
 * Get weekly statistics
 * @returns Stats for the current week (Monday to current day)
 */
export function getWeeklyStats(): WeeklyStats {
  // Calculate week start (Monday)
  const query = `
    WITH week_dates AS (
      SELECT
        date('now', 'weekday 1') as week_start,
        date('now') as week_end
    )
    SELECT
      COUNT(DISTINCT w.id) as total_workouts,
      COUNT(DISTINCT e.id) as unique_exercises,
      COALESCE(SUM(COALESCE(e.weight, 0) * COALESCE(e.reps, 0) * e.sets), 0) as total_volume,
      (SELECT week_start FROM week_dates) as week_start
    FROM workouts w
    LEFT JOIN exercises e ON w.id = e.workout_id
    WHERE w.date >= (SELECT week_start FROM week_dates)
      AND w.date <= (SELECT week_end FROM week_dates)
  `;

  const row = db.prepare(query).get() as {
    total_workouts: number;
    unique_exercises: number;
    total_volume: number;
    week_start: string;
  };

  return {
    totalWorkouts: row.total_workouts,
    totalVolume: Math.round(row.total_volume),
    totalExercises: row.unique_exercises,
    week: row.week_start,
  };
}

/**
 * Get list of all unique exercise names with their frequency
 * @returns Array of exercises with name and count
 */
export function getUniqueExercises(): Array<{ name: string; count: number }> {
  const query = `
    SELECT exercise_name as name, COUNT(*) as count
    FROM exercises
    GROUP BY exercise_name
    ORDER BY count DESC, name ASC
  `;

  const rows = db.prepare(query).all() as Array<{ name: string; count: number }>;
  return rows;
}
