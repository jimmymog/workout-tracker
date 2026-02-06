/**
 * Seed script - populates database with realistic sample data
 * Run with: npm run seed
 */

import { v4 as uuidv4 } from 'uuid';
import db, { initializeDatabase } from './db.js';

interface SeedExercise {
  name: string;
  weight: number;
  reps: number;
  sets: number;
  notes?: string;
}

interface SeedWorkout {
  date: string;
  type: 'UPPER' | 'LOWER' | 'PUSH' | 'PULL';
  exercises: SeedExercise[];
  rawText: string;
}

// Initialize database first
initializeDatabase();

// Sample workouts over the past 30 days
const today = new Date();
const getDateOffset = (daysAgo: number): string => {
  const date = new Date(today);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

const seedWorkouts: SeedWorkout[] = [
  // Monday 28 days ago - UPPER
  {
    date: getDateOffset(28),
    type: 'UPPER',
    exercises: [
      { name: 'Bench Press', weight: 185, reps: 8, sets: 5 },
      { name: 'Incline Dumbbell Press', weight: 70, reps: 10, sets: 4 },
      { name: 'Barbell Row', weight: 225, reps: 6, sets: 5 },
      { name: 'Lat Pulldown', weight: 180, reps: 10, sets: 3 },
      { name: 'Dumbbell Fly', weight: 50, reps: 12, sets: 3 },
      { name: 'Lateral Raise', weight: 25, reps: 12, sets: 3 },
      { name: 'Face Pull', weight: 90, reps: 15, sets: 3, notes: 'light, good pump' },
    ],
    rawText: 'Upper day - 5x5 bench at 185, 4x10 incline DB, 5x5 rows at 225, lat pulldowns, flies, lateral raises, face pulls',
  },

  // Wednesday 26 days ago - LOWER
  {
    date: getDateOffset(26),
    type: 'LOWER',
    exercises: [
      { name: 'Squat', weight: 275, reps: 6, sets: 5 },
      { name: 'Romanian Deadlift', weight: 315, reps: 6, sets: 4 },
      { name: 'Leg Press', weight: 495, reps: 10, sets: 3 },
      { name: 'Leg Curl', weight: 150, reps: 12, sets: 3 },
      { name: 'Calf Raise', weight: 405, reps: 15, sets: 3 },
      { name: 'Leg Extension', weight: 200, reps: 12, sets: 3 },
    ],
    rawText: 'Leg day - 5x5 squats @ 275, 4x6 RDLs, leg press, hamstring curls, calves, leg ext',
  },

  // Friday 24 days ago - PUSH
  {
    date: getDateOffset(24),
    type: 'PUSH',
    exercises: [
      { name: 'Incline Bench Press', weight: 185, reps: 6, sets: 4 },
      { name: 'Dumbbell Bench Press', weight: 80, reps: 8, sets: 4 },
      { name: 'Machine Chest Press', weight: 300, reps: 10, sets: 3 },
      { name: 'Overhead Press', weight: 155, reps: 6, sets: 4 },
      { name: 'Dumbbell Lateral Raise', weight: 30, reps: 12, sets: 4 },
      { name: 'Tricep Rope Pushdown', weight: 100, reps: 12, sets: 3 },
      { name: 'Skullcrusher', weight: 95, reps: 10, sets: 3 },
    ],
    rawText: 'Push day - incline bench, DB press 4x8, machine work, OHP 4x6, shoulders, triceps',
  },

  // Sunday 22 days ago - PULL
  {
    date: getDateOffset(22),
    type: 'PULL',
    exercises: [
      { name: 'Deadlift', weight: 365, reps: 5, sets: 3 },
      { name: 'Barbell Row', weight: 245, reps: 6, sets: 4 },
      { name: 'Pull Up', weight: null, reps: 8, sets: 5, notes: 'bodyweight' },
      { name: 'Lat Pulldown', weight: 200, reps: 10, sets: 3 },
      { name: 'Barbell Curl', weight: 115, reps: 8, sets: 3 },
      { name: 'Face Pull', weight: 100, reps: 15, sets: 3 },
    ],
    rawText: 'Pull day - deadlifts 3x5, barbell rows 4x6, pull-ups, lat pulldowns, barbell curls, rear delts',
  },

  // Tuesday 20 days ago - UPPER
  {
    date: getDateOffset(20),
    type: 'UPPER',
    exercises: [
      { name: 'Bench Press', weight: 190, reps: 8, sets: 5 },
      { name: 'Incline Dumbbell Press', weight: 75, reps: 10, sets: 4 },
      { name: 'Barbell Row', weight: 235, reps: 6, sets: 5 },
      { name: 'Lat Pulldown', weight: 185, reps: 10, sets: 3 },
      { name: 'Dumbbell Fly', weight: 55, reps: 12, sets: 3 },
      { name: 'Lateral Raise', weight: 27, reps: 12, sets: 3 },
      { name: 'Face Pull', weight: 95, reps: 15, sets: 3 },
    ],
    rawText: 'Upper day - bench 5x5 @ 190 (good session!), incline DB, rows, pulldowns, accessories',
  },

  // Thursday 18 days ago - LOWER
  {
    date: getDateOffset(18),
    type: 'LOWER',
    exercises: [
      { name: 'Squat', weight: 280, reps: 6, sets: 5 },
      { name: 'Romanian Deadlift', weight: 325, reps: 6, sets: 4 },
      { name: 'Leg Press', weight: 505, reps: 10, sets: 3 },
      { name: 'Leg Curl', weight: 155, reps: 12, sets: 3 },
      { name: 'Calf Raise', weight: 415, reps: 15, sets: 3 },
      { name: 'Leg Extension', weight: 205, reps: 12, sets: 3 },
    ],
    rawText: 'Lower - squats up to 280, RDLs, leg press, curls, calves, extensions',
  },

  // Saturday 16 days ago - PUSH
  {
    date: getDateOffset(16),
    type: 'PUSH',
    exercises: [
      { name: 'Incline Bench Press', weight: 190, reps: 6, sets: 4 },
      { name: 'Dumbbell Bench Press', weight: 85, reps: 8, sets: 4 },
      { name: 'Machine Chest Press', weight: 310, reps: 10, sets: 3 },
      { name: 'Overhead Press', weight: 160, reps: 6, sets: 4 },
      { name: 'Dumbbell Lateral Raise', weight: 32, reps: 12, sets: 4 },
      { name: 'Tricep Rope Pushdown', weight: 105, reps: 12, sets: 3 },
      { name: 'Skullcrusher', weight: 100, reps: 10, sets: 3 },
    ],
    rawText: 'Push - incline 190, DB bench up to 85s, machine work, OHP, shoulders, rope work',
  },

  // Monday 14 days ago - UPPER
  {
    date: getDateOffset(14),
    type: 'UPPER',
    exercises: [
      { name: 'Bench Press', weight: 195, reps: 8, sets: 5 },
      { name: 'Incline Dumbbell Press', weight: 80, reps: 9, sets: 4 },
      { name: 'Barbell Row', weight: 240, reps: 6, sets: 5 },
      { name: 'Lat Pulldown', weight: 190, reps: 10, sets: 3 },
      { name: 'Dumbbell Fly', weight: 60, reps: 12, sets: 3 },
      { name: 'Lateral Raise', weight: 30, reps: 12, sets: 3 },
      { name: 'Face Pull', weight: 100, reps: 15, sets: 3 },
    ],
    rawText: 'Upper - bench at 195, incline, rows, pulldowns, chest flies, shoulders, face pulls',
  },

  // Wednesday 12 days ago - PULL
  {
    date: getDateOffset(12),
    type: 'PULL',
    exercises: [
      { name: 'Deadlift', weight: 375, reps: 5, sets: 3 },
      { name: 'Barbell Row', weight: 250, reps: 6, sets: 4 },
      { name: 'Pull Up', weight: null, reps: 9, sets: 5, notes: 'bodyweight, good reps' },
      { name: 'Lat Pulldown', weight: 205, reps: 10, sets: 3 },
      { name: 'Barbell Curl', weight: 120, reps: 8, sets: 3 },
      { name: 'Face Pull', weight: 105, reps: 15, sets: 3 },
    ],
    rawText: 'Pull - deadlifts strong, rows, pull-ups, lat work, curls, rear delts',
  },

  // Friday 10 days ago - LOWER
  {
    date: getDateOffset(10),
    type: 'LOWER',
    exercises: [
      { name: 'Squat', weight: 285, reps: 6, sets: 5 },
      { name: 'Romanian Deadlift', weight: 330, reps: 6, sets: 4 },
      { name: 'Leg Press', weight: 515, reps: 10, sets: 3 },
      { name: 'Leg Curl', weight: 160, reps: 12, sets: 3 },
      { name: 'Calf Raise', weight: 425, reps: 15, sets: 3 },
      { name: 'Leg Extension', weight: 210, reps: 12, sets: 3 },
    ],
    rawText: 'Leg day - 285 squats, RDL work, leg press, hamstring curls, calves, quads',
  },

  // Sunday 8 days ago - PUSH
  {
    date: getDateOffset(8),
    type: 'PUSH',
    exercises: [
      { name: 'Incline Bench Press', weight: 195, reps: 6, sets: 4 },
      { name: 'Dumbbell Bench Press', weight: 90, reps: 8, sets: 4 },
      { name: 'Machine Chest Press', weight: 320, reps: 10, sets: 3 },
      { name: 'Overhead Press', weight: 165, reps: 6, sets: 4 },
      { name: 'Dumbbell Lateral Raise', weight: 35, reps: 12, sets: 4 },
      { name: 'Tricep Rope Pushdown', weight: 110, reps: 12, sets: 3 },
      { name: 'Skullcrusher', weight: 105, reps: 10, sets: 3 },
    ],
    rawText: 'Push day - incline 195, DB bench 90s, chest machine, OHP 165, shoulders, tricep finishers',
  },

  // Tuesday 6 days ago - UPPER
  {
    date: getDateOffset(6),
    type: 'UPPER',
    exercises: [
      { name: 'Bench Press', weight: 200, reps: 7, sets: 5 },
      { name: 'Incline Dumbbell Press', weight: 85, reps: 9, sets: 4 },
      { name: 'Barbell Row', weight: 250, reps: 6, sets: 5 },
      { name: 'Lat Pulldown', weight: 195, reps: 10, sets: 3 },
      { name: 'Dumbbell Fly', weight: 65, reps: 12, sets: 3 },
      { name: 'Lateral Raise', weight: 32, reps: 12, sets: 3 },
      { name: 'Face Pull', weight: 105, reps: 15, sets: 3 },
    ],
    rawText: 'Upper - bench 200! (PR), incline, rows, pulldowns, flies, shoulders, rear delt work',
  },

  // Thursday 4 days ago - PULL
  {
    date: getDateOffset(4),
    type: 'PULL',
    exercises: [
      { name: 'Deadlift', weight: 385, reps: 5, sets: 3 },
      { name: 'Barbell Row', weight: 255, reps: 6, sets: 4 },
      { name: 'Pull Up', weight: null, reps: 10, sets: 5, notes: 'bodyweight, feeling strong' },
      { name: 'Lat Pulldown', weight: 210, reps: 10, sets: 3 },
      { name: 'Barbell Curl', weight: 125, reps: 8, sets: 3 },
      { name: 'Face Pull', weight: 110, reps: 15, sets: 3 },
    ],
    rawText: 'Pull - deadlifts 385, rows getting stronger, pull-ups, lat work, curls, rear delts',
  },

  // Saturday 2 days ago - LOWER
  {
    date: getDateOffset(2),
    type: 'LOWER',
    exercises: [
      { name: 'Squat', weight: 290, reps: 6, sets: 5 },
      { name: 'Romanian Deadlift', weight: 335, reps: 6, sets: 4 },
      { name: 'Leg Press', weight: 525, reps: 10, sets: 3 },
      { name: 'Leg Curl', weight: 165, reps: 12, sets: 3 },
      { name: 'Calf Raise', weight: 435, reps: 15, sets: 3 },
      { name: 'Leg Extension', weight: 215, reps: 12, sets: 3 },
    ],
    rawText: 'Legs - squats 290, RDL 335, leg press, curls, calves, all feeling good',
  },

  // Today - UPPER
  {
    date: getDateOffset(0),
    type: 'UPPER',
    exercises: [
      { name: 'Bench Press', weight: 202, reps: 6, sets: 5 },
      { name: 'Incline Dumbbell Press', weight: 87, reps: 9, sets: 4 },
      { name: 'Barbell Row', weight: 255, reps: 6, sets: 5 },
      { name: 'Lat Pulldown', weight: 200, reps: 10, sets: 3 },
      { name: 'Dumbbell Fly', weight: 67, reps: 12, sets: 3 },
      { name: 'Lateral Raise', weight: 35, reps: 12, sets: 3 },
      { name: 'Face Pull', weight: 110, reps: 15, sets: 3 },
    ],
    rawText: 'Upper today - bench 202, incline, rows, pulldowns, flies, shoulders, rear delts',
  },
];

/**
 * Insert seed data into the database
 */
function seedDatabase(): void {
  const insertWorkout = db.prepare(`
    INSERT INTO workouts (id, workout_type, date, raw_text, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertExercise = db.prepare(`
    INSERT INTO exercises (id, workout_id, exercise_name, weight, reps, sets, notes, order_in_workout, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let totalExercises = 0;

  seedWorkouts.forEach((workoutData) => {
    const workoutId = uuidv4();
    const now = new Date().toISOString();

    // Insert workout
    insertWorkout.run(
      workoutId,
      workoutData.type,
      workoutData.date,
      workoutData.rawText,
      now
    );

    // Insert exercises
    workoutData.exercises.forEach((exercise, index) => {
      const exerciseId = uuidv4();
      insertExercise.run(
        exerciseId,
        workoutId,
        exercise.name,
        exercise.weight,
        exercise.reps,
        exercise.sets,
        exercise.notes || null,
        index,
        now
      );
      totalExercises++;
    });
  });

  console.log(`
=================================================
Seed Data Inserted Successfully
=================================================
Workouts: ${seedWorkouts.length}
Exercises: ${totalExercises}
Date Range: ${seedWorkouts[0].date} to ${seedWorkouts[seedWorkouts.length - 1].date}
=================================================
  `);
}

// Run the seed
try {
  seedDatabase();
  console.log('Database seeding completed successfully');
  process.exit(0);
} catch (error) {
  console.error('Error seeding database:', error);
  process.exit(1);
}
