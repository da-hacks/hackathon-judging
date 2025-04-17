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
- In-memory data storage (can be extended to persistent storage)

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`
3. Run the development server:
   \`\`\`
   npm run dev
   \`\`\`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

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

## Data Models

- **Projects**: id, name, description, team, table number, etc.
- **Judges**: id, name, email
- **Comparisons**: judge id, project A id, project B id, winner id, timestamp
- **Rubric Evaluations**: judge id, project id, scores for each criterion

## Algorithms

- Pairwise comparison assignment algorithm to maximize diversity
- Ranking algorithm based on comparison results

## Future Enhancements

- Persistent storage with a database
- Authentication with JWT or NextAuth
- Export results to CSV/Excel
- Real-time updates with WebSockets
- Judge assignment to specific project categories
