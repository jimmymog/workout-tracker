# Workout Tracker

SMS-powered workout logging dashboard. Your personal trainer texts workout details → they get parsed by AI → displayed on a clean dashboard with progress graphs.

## How It Works

```
Trainer texts "UPPER\nBench Press 225 x8\nFly 200 9..."
    ↓
Twilio receives SMS → sends to your server webhook
    ↓
Claude Haiku parses freeform text into structured data
    ↓
Data saved to SQLite database
    ↓
Dashboard auto-refreshes and shows workouts + progress graphs
```

## Quick Start

### 1. Server Setup

```bash
cd server
npm install
```

Create a `.env` file (see `.env.example` in root):

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxx
ALLOWED_PHONES=+1trainernumber,+1yournumber
PORT=3001
FRONTEND_URL=http://localhost:5173
```

Seed sample data and start the server:

```bash
npm run seed   # adds realistic sample workouts
npm run dev    # starts on http://localhost:3001
```

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev    # starts on http://localhost:5173
```

### 3. Twilio Setup

1. Get a Twilio phone number at [twilio.com](https://twilio.com)
2. In your Twilio Console → Phone Numbers → your number → Messaging:
   - Set "When a message comes in" webhook URL to: `https://your-server.com/webhook/sms`
   - Method: POST
3. Add your trainer's phone number to `ALLOWED_PHONES` in `.env`
4. Add the Twilio number to your group chat

### 4. Deploy

**Backend** (Railway recommended):
```bash
# Connect your repo to Railway
# Add PostgreSQL service (or use SQLite for simplicity)
# Set environment variables
# Deploy
```

**Frontend** (Vercel recommended):
```bash
cd client
npx vercel --prod
```

## Dashboard Preview

Open `dashboard-preview.html` in any browser to see an interactive preview with sample data — no server needed.

## Architecture

- **Server**: Node.js + Express + TypeScript
- **Database**: SQLite (via better-sqlite3)
- **SMS**: Twilio webhooks
- **AI Parsing**: Claude Haiku (via Anthropic API) — handles freeform workout text
- **Frontend**: React + Vite + Tailwind CSS + Recharts
- **API**: REST endpoints for workouts, exercises, progress, and stats

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/webhook/sms` | Twilio SMS webhook |
| GET | `/api/workouts` | List recent workouts |
| GET | `/api/workouts/:id` | Single workout detail |
| GET | `/api/exercises/progress?name=X&days=90` | Exercise progress for graphing |
| GET | `/api/exercises/names` | Unique exercise names |
| GET | `/api/stats/weekly` | This week's stats |

## Sample Trainer Message Format

The AI parser handles virtually any format your trainer uses:

```
UPPER
Panata low row 205 (45+25+10 each side) x8
Fly 200 9
Lat pull down 180 10
Chest press 245 (45+45+10) 8
Side raise 20 10
Reverse fly 70 10
Tricep push down 100 as many as possible
Pallof press (anti-rotation press) 70 10
```
