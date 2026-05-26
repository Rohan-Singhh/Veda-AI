# VedaAI

AI assessment creator for teachers. VedaAI lets a teacher create an assignment, generate a structured question paper with AI, track generation in realtime, view the formatted output, regenerate it, and export a PDF.

## Tech Stack

**Frontend**

- Next.js + React + TypeScript
- Zustand for assignment state
- Socket.IO client for realtime updates
- React Hook Form + Zod-ready validation patterns
- Tailwind CSS for responsive UI

**Backend**

- Node.js + Express + TypeScript
- MongoDB + Mongoose for assignments and generated papers
- Redis for paper caching and job state
- BullMQ for generation and PDF background jobs
- Socket.IO for realtime progress events
- Zod for request and AI output validation
- Puppeteer + EJS for formatted PDF export
- OpenRouter for LLM-based question generation

## Project Structure

```text
veda-ai/
  frontend/
    src/app/                 # Next.js app routes
    src/components/          # Layout, paper view, UI primitives
    src/services/            # API and Socket.IO clients
    src/store/               # Zustand assignment store
  backend/
    src/server.ts            # Express bootstrap
    src/routes/              # API routes
    src/controllers/         # HTTP handlers
    src/models/              # MongoDB schemas
    src/queues/              # BullMQ queues
    src/workers/             # Generation and PDF workers
    src/ai/                  # OpenRouter prompt + generation service
    src/services/            # Job state and paper sanitizing services
    src/validators/          # Zod schemas
    src/middleware/          # Error, async, and ObjectId middleware
    src/socket/              # Socket.IO room/event handling
    src/templates/           # PDF EJS template
```

## Architecture Flow

```text
Teacher submits assignment form
  -> Frontend validates and calls API
  -> Express validates request
  -> MongoDB stores Assignment
  -> BullMQ queues generation job
  -> Worker builds structured AI prompt
  -> OpenRouter returns JSON
  -> Backend validates and balances marks
  -> MongoDB stores QuestionPaper
  -> Redis caches paper + job state
  -> Socket.IO notifies frontend
  -> Frontend renders structured paper
```

PDF export:

```text
POST /api/assignments/:id/pdf
  -> BullMQ queues PDF job
  -> Worker renders EJS paper template
  -> Puppeteer writes backend/public/pdfs/:id.pdf
  -> Socket.IO emits pdf:completed
```

## Local Setup

Install dependencies in both apps:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Create backend env:

```bash
cd backend
cp .env.example .env
```

Backend variables:

```text
PORT=5000
MONGODB_URI=
NODE_ENV=development
REDIS_URL=
FRONTEND_URL=http://localhost:3000
OPENROUTER_API_KEY=
GEMINI_API_KEY=
```

Frontend variables, if deploying or changing ports:

```text
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

Run backend:

```bash
cd backend
npm run dev
```

Run frontend:

```bash
cd frontend
npm run dev
```

Open:

```text
http://localhost:3000
```

## Backend API

- `GET /` health check.
- `POST /api/assignments` creates an assignment and queues AI generation.
- `GET /api/assignments` lists recent assignments.
- `GET /api/assignments/:id` fetches one assignment.
- `GET /api/assignments/:id/status` returns Redis-backed generation/PDF state.
- `GET /api/assignments/:id/paper` returns the structured paper from Redis or MongoDB.
- `POST /api/assignments/:id/regenerate` clears cached output and queues regeneration.
- `POST /api/assignments/:id/pdf` queues PDF export.
- `DELETE /api/assignments/:id` deletes assignment, result, cache, and generated PDF.

## Realtime Events

Clients join an assignment room with:

```text
join:assignment
```

Backend emits:

- `assignment:processing`
- `assignment:completed`
- `assignment:failed`
- `pdf:processing`
- `pdf:completed`
- `pdf:failed`

## Quality Checks

Backend:

```bash
cd backend
npm run typecheck
npm run build
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

## Notes

- `.env` files are ignored. Use `.env.example` for required variable names only.
- Rotate any API keys that were ever committed or shown publicly.
- Redis is used for BullMQ, cached papers, and user-facing job state.
- The backend never renders raw LLM text. AI output is parsed, validated with Zod, normalized, and stored as structured sections/questions.
