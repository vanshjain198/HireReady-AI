# Gen AI Interview Prep MERN App

This project has a React/Vite frontend and an Express/MongoDB backend. It lets a user register or log in, upload a resume PDF or write a self description, paste a job description, and generate an AI interview preparation report.

## Tech Stack

- Frontend: React, Vite, React Router, Axios, Sass
- Backend: Node.js, Express, MongoDB/Mongoose, JWT cookies, Multer, pdf-parse
- AI: Groq chat completions
- PDF generation: Puppeteer

## How It Works

1. The user registers or logs in from the frontend.
2. The backend stores a JWT in an httpOnly cookie.
3. The protected home page lets the user submit a job description plus a resume PDF, self description, or both.
4. The backend extracts resume text from the PDF.
5. The Groq API generates a job title, match score, interview questions, skill gaps, and a 7 day plan.
6. The report is saved in MongoDB and shown on the interview report page.
7. The user can generate and download a tailored resume PDF.

## Prerequisites

- Node.js 22 or newer
- MongoDB running locally, or a MongoDB Atlas connection string
- Groq API key

On Windows PowerShell, if `npm` is blocked by execution policy, use `npm.cmd` in the commands below.

## Backend Setup

```powershell
cd Backend
copy .env.example .env
npm.cmd install
```

Edit `Backend/.env`:

```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/gen-ai-interview
JWT_SECRET=your_long_random_secret
GROQ_API_KEY=your_groq_api_key
CLIENT_URLS=http://localhost:5173
```

Start the backend:

```powershell
npm.cmd run dev
```

Backend URL:

```text
http://localhost:3000
```

## Frontend Setup

Open a second terminal:

```powershell
cd Frontend
copy .env.example .env
npm.cmd install
npm.cmd run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Main API Routes

- `POST /api/auth/register` - create account
- `POST /api/auth/login` - login
- `GET /api/auth/logout` - logout
- `GET /api/auth/get-me` - current user
- `POST /api/interview/` - generate interview report
- `GET /api/interview/` - list current user's reports
- `GET /api/interview/report/:interviewId` - get one report
- `POST /api/interview/resume/pdf/:interviewReportId` - generate resume PDF

## Useful Modifications To Do Next

- Add proper loading and error messages instead of `alert`.
- Add backend validation with Zod for auth and interview request bodies.
- Add file type filtering in Multer so only PDFs are accepted server-side.
- Add a backend health route like `GET /health`.
- Add tests for auth, protected routes, and report ownership.
- Move duplicated Axios setup into one shared frontend API client.
- Improve deployment envs:
  - backend `NODE_ENV=production`
  - backend `CLIENT_URLS=https://your-frontend-domain`
  - frontend `VITE_API_URL=https://your-backend-domain`

## Notes

- The backend uses cookies, so frontend Axios must keep `withCredentials: true`.
- Local development uses non-secure cookies. Production uses secure cross-site cookies when `NODE_ENV=production`.
- Resume uploads are limited to 3 MB.
