/**
 * Twilio SMS webhook route
 * Receives SMS messages and creates workouts from the text
 */

import { Router, Request, Response } from 'express';
import { createWorkoutFromText } from '../services/workout.js';

const router = Router();

// List of allowed phone numbers that can submit workouts via SMS
const ALLOWED_PHONES = (process.env.ALLOWED_PHONES || '')
  .split(',')
  .map((p) => p.trim())
  .filter((p) => p.length > 0);

console.log('ALLOWED_PHONES configured:', ALLOWED_PHONES);

/**
 * POST /webhook/sms
 * Twilio sends form-encoded request with Body and From fields
 */
router.post('/sms', async (req: Request, res: Response): Promise<void> => {
  try {
    const { Body, From } = req.body;
    console.log('Incoming SMS - From:', From, 'Body:', Body);
    console.log('Checking against allowed phones:', ALLOWED_PHONES);

    // Validate required fields
    if (!Body || !From) {
      console.warn('Received SMS webhook without Body or From');
      res.set('Content-Type', 'text/xml');
      res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Invalid request</Message>
</Response>`);
      return;
    }

    // Phone validation disabled for now - re-enable later
    // if (ALLOWED_PHONES.length > 0 && !ALLOWED_PHONES.includes(From)) {
    //   console.warn(`Rejected SMS from unauthorized phone: ${From}`);
    //   res.set('Content-Type', 'text/xml');
    //   res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>Not authorized</Message></Response>`);
    //   return;
    // }
    console.log(`Accepting SMS from: ${From}`);

    console.log(`Received workout SMS from ${From}: ${Body}`);

    // Create workout from the text
    const workout = await createWorkoutFromText(Body, From);

    // Send confirmation response
    const exerciseCount = workout.exercises.length;
    const message = `Workout saved! Parsed ${exerciseCount} exercise${exerciseCount !== 1 ? 's' : ''}.`;

    res.set('Content-Type', 'text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(message)}</Message>
</Response>`);
  } catch (error) {
    console.error('Error processing SMS webhook:', error);
    res.set('Content-Type', 'text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Error processing workout. Please try again.</Message>
</Response>`);
  }
});

/**
 * Escape special characters for XML
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default router;
