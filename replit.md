# EduBridge – Free Smart Learning Platform

## Overview

A full-stack educational platform with role-based access, quizzes, content management, and progress tracking.

## Technology Stack

- **Frontend**: React.js (JavaScript, functional components + hooks), Tailwind CSS, Wouter (routing)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **Build tools**: Vite (frontend), esbuild (backend)

## Project Structure

```
artifacts/
  api-server/         # Express backend
    src/
      config/         # MongoDB connection (db.ts)
      controllers/    # auth, subjects, content, quiz, results
      middleware/     # auth.ts (protect + adminOnly)
      models/         # User, Subject, Content, Quiz, Result (Mongoose)
      routes/         # auth, subjects, content, quiz, progress, results, admin
      scripts/        # seed.ts (admin account + sample data)
  edubridge/          # React frontend (Vite)
    src/
      components/     # layout, ui components
      hooks/          # use-auth.tsx (AuthContext)
      lib/            # fetch-interceptor.ts (JWT injection)
      pages/          # login, register, dashboard, subject, topic (NEW), quiz, progress, admin

lib/
  api-spec/           # OpenAPI spec (openapi.yaml)
  api-client-react/   # Generated React Query hooks
  api-zod/            # Generated Zod schemas
```

## API Endpoints

### Auth
- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login, returns JWT
- `GET /api/auth/me` — Get current user (protected)

### Subjects
- `GET /api/subjects` — List all subjects
- `GET /api/subjects/:id` — Get single subject

### Content
- `GET /api/content/:subjectId` — Get all topics for a subject
- `GET /api/content/item/:id` — Get a single topic/content item by ID

### Quiz
- `GET /api/quiz/:subjectId` — Get full quiz for subject (protected)
- `POST /api/quiz/submit` — Submit subject quiz, get score (protected)
- `GET /api/quiz/topic/:topicId` — Get topic-specific quiz (falls back to subject quiz if no tagged questions)
- `POST /api/quiz/topic/submit` — Submit topic quiz, get score (protected)

### Progress
- `GET /api/progress/my` — Get completed lesson IDs (protected)
- `POST /api/progress/complete` — Mark lesson complete (protected)

### Results
- `GET /api/results/my` — Get my quiz results (protected)

### Admin (admin role required)
- `POST/PUT/DELETE /api/admin/subjects` — Manage subjects
- `POST/PUT/DELETE /api/admin/content` — Manage content
- `POST/PUT/DELETE /api/admin/quiz` — Manage quizzes
- `GET /api/admin/users` — List all users
- `GET /api/admin/results` — View all results

## Database Models

- **User**: name, email, password (bcrypt), role (user/admin), completedLessons[]
- **Subject**: title, description
- **Content**: subjectId, title, notes, videoUrl
- **Quiz**: subjectId, questions[{id, question, options[], correctAnswer}]
- **Result**: userId, subjectId, score, total, percentage

## Admin Account

- Email: `admin@edubridge.com`
- Password: `Admin@123`

## Environment Variables Required

- `MONGODB_URI` — MongoDB connection string
- `SESSION_SECRET` — Used as JWT secret (already set)
- `PORT` — Assigned by Replit

## Development

- API server: `pnpm --filter @workspace/api-server run dev`
- Frontend: `pnpm --filter @workspace/edubridge run dev`
- Run seed: `cd artifacts/api-server && pnpm tsx src/scripts/seed.ts`
