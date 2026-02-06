/**
 * Workout text parser using Claude API
 * Parses freeform workout text into structured exercise data
 */

import { ParsedWorkout, ParsedExercise } from '../types.js';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Parse workout text using Claude API
 * @param workoutText - Raw freeform workout text from user
 * @returns Parsed workout with exercises and type
 */
export async function parseWorkoutText(workoutText: string): Promise<ParsedWorkout> {
  if (!ANTHROPIC_API_KEY) {
    console.warn('ANTHROPIC_API_KEY not set, returning fallback parse');
    return {
      workout_type: null,
      exercises: [],
      parse_failed: true,
    };
  }

  const systemPrompt = `You are a fitness expert assistant that parses workout logs into structured data.

Extract the following information from the user's workout text:
1. Workout type: Classify as one of: UPPER, LOWER, PUSH, PULL, LEGS, FULL BODY, or null if unclear
2. For each exercise: name, weight (in lbs), reps, sets, and any relevant notes

IMPORTANT PARSING RULES:
- If reps are described as "AMRAP" (as many as possible), "to failure", or similar, set reps to null and add this to notes
- If weight contains compound expressions like "(45+25+10 each side)", calculate the total (in this case: 45+25+10=80 per side, so 160 total), but also include the breakdown in notes
- If an exercise has alternative names or descriptions in parentheses, extract the primary name and include the alternative in notes
- Sets should be an integer. If not specified, assume 1 set
- Weight and reps can be null if not specified
- Preserve all relevant details in the notes field

Respond ONLY with valid JSON in this exact format, no other text:
{
  "workout_type": "UPPER" | "LOWER" | "PUSH" | "PULL" | "LEGS" | "FULL BODY" | null,
  "exercises": [
    {
      "exercise_name": "string",
      "weight": number | null,
      "reps": number | null,
      "sets": number,
      "notes": "string" | null
    }
  ]
}`;

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: workoutText,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API error:', response.status, errorData);
      return {
        workout_type: null,
        exercises: [],
        parse_failed: true,
      };
    }

    const data = await response.json() as {
      content: Array<{ type: string; text: string }>;
    };

    // Extract the text from the response
    const textContent = data.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      console.error('No text content in Claude response');
      return {
        workout_type: null,
        exercises: [],
        parse_failed: true,
      };
    }

    // Parse the JSON response
    const parsed = JSON.parse(textContent.text) as ParsedWorkout;

    // Validate and normalize the response
    return validateAndNormalizeParsedWorkout(parsed);
  } catch (error) {
    console.error('Error parsing workout text:', error);
    return {
      workout_type: null,
      exercises: [],
      parse_failed: true,
    };
  }
}

/**
 * Validate and normalize parsed workout data
 */
function validateAndNormalizeParsedWorkout(parsed: unknown): ParsedWorkout {
  if (typeof parsed !== 'object' || parsed === null) {
    return {
      workout_type: null,
      exercises: [],
      parse_failed: true,
    };
  }

  const parsedObj = parsed as Record<string, unknown>;

  // Validate workout_type
  const validTypes = ['UPPER', 'LOWER', 'PUSH', 'PULL', 'LEGS', 'FULL BODY'];
  const workout_type = validTypes.includes(String(parsedObj.workout_type))
    ? (parsedObj.workout_type as ParsedWorkout['workout_type'])
    : null;

  // Validate exercises array
  let exercises: ParsedExercise[] = [];
  if (Array.isArray(parsedObj.exercises)) {
    exercises = parsedObj.exercises
      .map((ex) => normalizeExercise(ex))
      .filter((ex): ex is ParsedExercise => ex !== null);
  }

  return {
    workout_type,
    exercises,
  };
}

/**
 * Normalize a single exercise object
 */
function normalizeExercise(exercise: unknown): ParsedExercise | null {
  if (typeof exercise !== 'object' || exercise === null) {
    return null;
  }

  const ex = exercise as Record<string, unknown>;

  // Validate required fields
  if (typeof ex.exercise_name !== 'string' || !ex.exercise_name.trim()) {
    return null;
  }

  if (typeof ex.sets !== 'number' || ex.sets < 1) {
    return null;
  }

  // Normalize weight and reps
  const weight =
    typeof ex.weight === 'number' && ex.weight > 0
      ? ex.weight
      : null;
  const reps =
    typeof ex.reps === 'number' && ex.reps > 0
      ? ex.reps
      : null;
  const notes = typeof ex.notes === 'string' ? ex.notes.trim() || null : null;

  return {
    exercise_name: ex.exercise_name.trim(),
    weight,
    reps,
    sets: Math.floor(ex.sets),
    notes,
  };
}
