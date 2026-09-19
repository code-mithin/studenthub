# StudentHub

A full-stack student productivity dashboard built with React (Vite), Tailwind CSS, Node.js, Express, and SQLite (`sql.js`).

## Features

- **Dashboard**: High-level overview of attendance, pending tasks, and today's schedule.
- **Subjects**: Manage your courses and track total classes.
- **Attendance**: Record and monitor your daily attendance (present, absent, cancelled) with percentage calculations.
- **Tasks**: Keep a to-do list with priorities and due dates.
- **Timetable**: Plan your weekly class schedule.
- **Grades**: Track your academic performance and automatically calculate your GPA.
- **Profile**: Manage your personal information.

## Tech Stack

- **Frontend**: React 18, Vite, React Router, Tailwind CSS 4, Recharts, Axios.
- **Backend**: Node.js, Express, `sql.js` (WebAssembly SQLite for easy cross-platform compatibility), JWT authentication, bcryptjs.

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 1. Database & Server Setup
Open a terminal and navigate to the `server` directory:
```bash
cd server
npm install
```

Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
*(On Windows PowerShell, use `Copy-Item .env.example .env`)*

Start the backend server:
```bash
npm run dev
```
The server will run on `http://localhost:5000`. 
*Note: A default user is seeded in the database. You can log in with `mithin@example.com` and password `password123`.*

### 2. Frontend Setup
Open a new terminal and navigate to the `client` directory:
```bash
cd client
npm install
```

Start the frontend development server:
```bash
npm run dev
```
The client will run on `http://localhost:3000` (or another port if 3000 is taken). Open this URL in your browser.

## Project Structure
- `client/` - React frontend
  - `src/components/` - Reusable UI and layout components
  - `src/pages/` - Full page views (Dashboard, Attendance, etc.)
  - `src/context/` - Global state (AuthContext)
- `server/` - Express backend
  - `models/` - Data access layer wrapping `sql.js`
  - `routes/` - API endpoint definitions
  - `db/` - SQLite database file and SQL schemas/seeds
