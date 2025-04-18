# Neon Database Integration

This document describes the Neon database integration for the Hackathon Judging application.

## Overview

The application uses [Neon Database](https://neon.tech), a serverless PostgreSQL service, to store data for the hackathon judging system. The implementation leverages `@neondatabase/serverless` for direct SQL queries without requiring a traditional database client.

## Database Schema

The database consists of four main tables:

1. **projects** - Stores hackathon projects information
2. **judges** - Stores information about the judges
3. **comparisons** - Stores pairwise comparison data between projects
4. **rubric_scores** - Stores detailed scoring for each project

### Schema Details

```sql
-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  team_members TEXT NOT NULL,
  table_number INTEGER NOT NULL,
  is_finalist BOOLEAN DEFAULT FALSE
);

-- Judges table
CREATE TABLE IF NOT EXISTS judges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL
);

-- Comparisons table
CREATE TABLE IF NOT EXISTS comparisons (
  id SERIAL PRIMARY KEY,
  judge_id INTEGER NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
  project_a_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  project_b_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  winner_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  timestamp BIGINT NOT NULL,
  CONSTRAINT different_projects CHECK (project_a_id <> project_b_id)
);

-- Rubric scores table
CREATE TABLE IF NOT EXISTS rubric_scores (
  id SERIAL PRIMARY KEY,
  judge_id INTEGER NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  originality INTEGER NOT NULL CHECK (originality BETWEEN 1 AND 10),
  technical_complexity INTEGER NOT NULL CHECK (technical_complexity BETWEEN 1 AND 10),
  impact INTEGER NOT NULL CHECK (impact BETWEEN 1 AND 10),
  learning_collaboration INTEGER NOT NULL CHECK (learning_collaboration BETWEEN 1 AND 10),
  comments TEXT,
  timestamp BIGINT NOT NULL,
  CONSTRAINT unique_judge_project UNIQUE (judge_id, project_id)
);
```

## Implementation Details

### Database Connection

The database connection is implemented in `lib/db.ts` using the Neon serverless SDK:

```typescript
import { neon } from '@neondatabase/serverless';

// Create a SQL client with prepared statements
export const sql = neon(process.env.POSTGRES_PRISMA_URL!);

// Helper function to execute a query
export async function query<T>(queryString: string, params: any[] = []): Promise<T> {
  return sql(queryString, params) as Promise<T>;
}
```

### Database Models

The database models are defined in `lib/db-models.ts` and include:

- `DbProject`: Project with name, description, team details
- `DbJudge`: Judge with name and email
- `DbComparison`: Comparison between two projects by a judge
- `DbRubricScore`: Detailed scoring of a project by a judge

### Data Layer

The original interface of the application has been preserved in `lib/data.ts`, which now connects to the database instead of using in-memory arrays.

## Environment Variables

The application uses the following environment variables for database connection:

```
POSTGRES_PRISMA_URL=postgres://username:password@hostname/database?connect_timeout=15&sslmode=require
```

## Initialization

To initialize the database:

1. Ensure your `.env.local` file has valid Neon database credentials
2. Run the initialization script: `pnpm ts-node lib/init-db.ts`

The initialization process:
- Creates all needed tables if they don't exist
- Seeds sample data if the database is empty

## Database Functions

The main database operations are defined in `lib/db-models.ts` and include:

### Project Operations
- `getAllProjects()`: Get all projects
- `getProjectById(id)`: Get a specific project
- `createProject(project)`: Create a new project
- `updateProject(id, updates)`: Update a project
- `deleteProject(id)`: Delete a project
- `setProjectsAsFinalists(ids)`: Set multiple projects as finalists

### Judge Operations
- `getAllJudges()`: Get all judges
- `getJudgeById(id)`: Get a specific judge
- `createJudge(judge)`: Create a new judge
- `deleteJudge(id)`: Delete a judge

### Comparison Operations
- `getAllComparisons()`: Get all comparisons
- `getComparisonsByJudge(judgeId)`: Get comparisons by a specific judge
- `createComparison(comparison)`: Create a new comparison

### Rubric Score Operations
- `getAllRubricScores()`: Get all rubric scores
- `getRubricScoresByJudge(judgeId)`: Get scores by a specific judge
- `getRubricScoresByProject(projectId)`: Get scores for a specific project
- `createRubricScore(score)`: Create a new rubric score
- `getAverageScoresForProject(projectId)`: Calculate average scores for a project

## Migration Path

If migrating from the in-memory version to the database version:

1. The database will be automatically initialized on first run
2. No special migration is needed as the data model remains compatible 