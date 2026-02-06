/**
 * SQLite database initialization and schema management using better-sqlite3
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// ESM compatibility - get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database connection
const dbPath = path.join(dataDir, 'workouts.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

/**
 * Run database migrations to create tables if they don't exist
 */
export function initializeDatabase(): void {
  // Create workouts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS workouts (
      id TEXT PRIMARY KEY,
      workout_type TEXT CHECK(workout_type IN ('UPPER', 'LOWER', 'PUSH', 'PULL', 'LEGS', 'FULL BODY', NULL)),
      date TEXT NOT NULL,
      raw_text TEXT NOT NULL,
      created_at TEXT NOT NULL,
      phone_number TEXT
    );
  `);

  // Create exercises table
  db.exec(`
    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY,
      workout_id TEXT NOT NULL,
      exercise_name TEXT NOT NULL,
      weight REAL,
      reps INTEGER,
      sets INTEGER NOT NULL,
      notes TEXT,
      order_in_workout INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
    );
  `);

  // Create indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date DESC);
    CREATE INDEX IF NOT EXISTS idx_exercises_workout_id ON exercises(workout_id);
    CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(exercise_name);
  `);

  console.log('Database initialized successfully');
}

export default db;
