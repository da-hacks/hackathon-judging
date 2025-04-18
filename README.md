# Hackathon Judging System

A web application for hackathon judging using the pairwise comparison methodology, similar to HackMIT's Gavel system.

## Features

### User Roles

- **Admin**: Manage projects, judges, and judging phases
- **Judge**: Evaluate projects through pairwise comparisons and rubric-based scoring

### Judging Phases

1. **Expo Judging (Phase 1)**
   - Judges are presented with two projects at a time
   - Judges select which project is better
   - System maximizes diversity of pairings and records results

2. **Panel Judging (Phase 2)**
   - Judges see a list of finalist projects
   - For each finalist, judges fill out a rubric with criteria:
     - Originality & Innovation
     - Technical Complexity
     - Impact
     - Learning & Collaboration

### Technical Details

- Built with Next.js (TypeScript) and Tailwind CSS
- Uses shadcn/ui components for a clean, modern UI
- Mobile-friendly design for judges walking around the expo
- **Neon Database Integration** for persistent PostgreSQL storage
- Uses @neondatabase/serverless for direct SQL queries

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```
   pnpm install
   ```
3. Create a `.env.local` file with your Neon database connection details:
   ```
   POSTGRES_PRISMA_URL=postgres://username:password@hostname/database?connect_timeout=15&sslmode=require
   ```
4. Initialize the database:
   ```
   pnpm init-db
   ```
5. Run the development server:
   ```
   pnpm dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Setup

The application uses Neon's serverless PostgreSQL database. To set up:

1. Create an account at [Neon](https://neon.tech)
2. Create a new project and database
3. Copy the connection string to your `.env.local` file
4. Run the initialization script to create tables and seed initial data

For more details on the database implementation, see [NEON_DATABASE.md](./NEON_DATABASE.md).

## Login Credentials

### Admin
- Password: `admin123`

### Judge
- Email: Any email from the judges list (e.g., `smith@example.com`)
- Password: `judge123`

## Project Structure

- `app/`: Next.js App Router pages
- `components/`: UI components
- `lib/`: Data models and utility functions
- `lib/db.ts`: Database connection setup
- `lib/db-models.ts`: Database model functions
- `lib/data.ts`: Data access layer (now uses database)

## Data Models

- **Projects**: id, name, description, team, table number, etc.
- **Judges**: id, name, email
- **Comparisons**: judge id, project A id, project B id, winner id, timestamp
- **Rubric Evaluations**: judge id, project id, scores for each criterion

## Algorithms

- Pairwise comparison assignment algorithm to maximize diversity
- Ranking algorithm based on comparison results

## Future Enhancements

- Authentication with JWT or NextAuth
- Export results to CSV/Excel
- Real-time updates with WebSockets
- Judge assignment to specific project categories
