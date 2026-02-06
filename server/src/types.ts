/**
 * TypeScript type definitions for the workout tracker application
 */

/**
 * Represents a single workout session
 */
export interface Workout {
  id: string;
  type: 'UPPER' | 'LOWER' | 'PUSH' | 'PULL' | 'LEGS' | 'FULL BODY' | null;
  date: string; // ISO 8601 date string
}

/**
 * Represents a single exercise within a workout
 */
export interface Exercise {
  id: string;
  name: string;
  weight: number | null; // in pounds
  reps: number | null;
  sets: number;
  notes: string | null;
}

/**
 * Exercise data parsed from Claude API response
 */
export interface ParsedExercise {
  exercise_name: string;
  weight: number | null;
  reps: number | null;
  sets: number;
  notes: string | null;
}

/**
 * Complete parsed workout data from Claude API
 */
export interface ParsedWorkout {
  workout_type: 'UPPER' | 'LOWER' | 'PUSH' | 'PULL' | 'LEGS' | 'FULL BODY' | null;
  exercises: ParsedExercise[];
  parse_failed?: boolean; // Set to true if parsing failed
}

/**
 * Exercise progress data for charts and analytics
 */
export interface ExerciseProgress {
  date: string;
  weight: number | null;
  reps: number | null;
  sets: number;
  notes: string | null;
}

/**
 * Weekly statistics
 */
export interface WeeklyStats {
  totalWorkouts: number;
  totalVolume: number; // sum of (weight * reps * sets)
  totalExercises: number;
  week: string;
}
