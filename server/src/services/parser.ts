/**
 * Workout text parser using Claude API
 * Parses freeform workout text into structured exercise data
 */

import { ParsedWorkout, ParsedExercise } from '../types.js';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Parse workout text using Claude API
 */
export async function parseWorkoutText(workoutText: string): Promise<ParsedWorkout> {
  // Read API key at call time (not module load time) so env var changes take effect
  const apiKey = process.env.ANTHROPIC_API_KEY;

  console.log('=== PARSER DEBUG ===');
  console.log('API key set:', apiKey ? `yes (${apiKey.substring(0, 10)}...)` : 'NO - MISSING');
  console.log('Input text:', workoutText);

  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not set! Cannot parse workout.');
    return { workout_type: null, exercises: [], parse_failed: true };
  }

  const systemPrompt = `You are a fitness expert assistant that parses workout logs into structured data.

Extract the following information from the user's workout text:
1. Workout type: Classify as one of: UPPER, LOWER, PUSH, PULL, LEGS, FULL BODY, or null if unclear
2. For each exercise: name, weight (in lbs), reps, sets, and any relevant notes

IMPORTANT PARSING RULES:
- If reps are described as "AMRAP" (as many as possible), "to failure", or similar, set reps to null and add this to notes
- If weight contains compound expressions like "(45+25+10 each side)", just use the main number stated before the parentheses
- If an exercise has alternative names or descriptions in parentheses, extract the primary name and include the alternative in notes
- Sets should be an integer. If not specified, assume 1 set
- Weight and reps can be null if not specified
- Preserve all relevant details in the notes field

Respond ONLY with valid JSON in this exact format, no other text:
{
  "workout_type": "UPPER",
  "exercises": [
    {
      "exercise_name": "Bench Press",
      "weight": 225,
      "reps": 8,
      "sets": 1,
      "notes": null
    }
  ]
}`;

  try {
    console.log('Calling Claude API...');
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: workoutText }],
      }),
    });

    console.log('Claude API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API error:', response.status, errorData);
      return { workout_type: null, exercises: [], parse_failed: true };
    }

    const data = await response.json() as any;
    console.log('Claude API raw response:', JSON.stringify(data));

    const textContent = data.content?.find((block: any) => block.type === 'text');
    if (!textContent) {
      console.error('No text content in Claude response');
      return { workout_type: null, exercises: [], parse_failed: true };
    }

    console.log('Claude returned text:', textContent.text);

    // Strip markdown code fences if Claude wraps the JSON in ```json ... ```
    let jsonText = textContent.text.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    const parsed = JSON.parse(jsonText);
    console.log('Parsed JSON:', JSON.stringify(parsed));

    const result = validateAndNormalizeParsedWorkout(parsed);
    console.log('Normalized result:', JSON.stringify(result));
    console.log('=== END PARSER DEBUG ===');

    return result;
  } catch (error) {
    console.error('Parser error:', error);
    return { workout_type: null, exercises: [], parse_failed: true };
  }
}

function validateAndNormalizeParsedWorkout(parsed: unknown): ParsedWorkout {
  if (typeof parsed !== 'object' || parsed === null) {
    console.error('Parsed data is not an object');
    return { workout_type: null, exercises: [], parse_failed: true };
  }

  const parsedObj = parsed as Record<string, unknown>;

  const validTypes = ['UPPER', 'LOWER', 'PUSH', 'PULL', 'LEGS', 'FULL BODY'];
  const workout_type = validTypes.includes(String(parsedObj.workout_type))
    ? (parsedObj.workout_type as ParsedWorkout['workout_type'])
    : null;

  let exercises: ParsedExercise[] = [];
  if (Array.isArray(parsedObj.exercises)) {
    exercises = parsedObj.exercises
      .map((ex, i) => {
        const result = normalizeExercise(ex);
        if (!result) console.warn(`Exercise ${i} failed normalization:`, JSON.stringify(ex));
        return result;
      })
      .filter((ex): ex is ParsedExercise => ex !== null);
  }

  return { workout_type, exercises };
}

function normalizeExercise(exercise: unknown): ParsedExercise | null {
  if (typeof exercise !== 'object' || exercise === null) return null;

  const ex = exercise as Record<string, unknown>;

  if (typeof ex.exercise_name !== 'string' || !ex.exercise_name.trim()) {
    console.warn('Exercise missing name:', JSON.stringify(ex));
    return null;
  }

  // Be more lenient with sets - default to 1
  const sets = typeof ex.sets === 'number' && ex.sets >= 1 ? Math.floor(ex.sets) : 1;

  const weight = typeof ex.weight === 'number' && ex.weight > 0 ? ex.weight : null;
  const reps = typeof ex.reps === 'number' && ex.reps > 0 ? ex.reps : null;
  const notes = typeof ex.notes === 'string' ? ex.notes.trim() || null : null;

  return {
    exercise_name: ex.exercise_name.trim(),
    weight,
    reps,
    sets,
    notes,
  };
}
