import { query } from './db';

// Database models (match the database schema)
export interface DbProject {
  id: number;
  name: string;
  description: string;
  team_members: string;
  table_number: number;
  is_finalist: boolean;
}

export interface DbJudge {
  id: number;
  name: string;
  email: string;
}

export interface DbComparison {
  id: number;
  judge_id: number;
  project_a_id: number;
  project_b_id: number;
  winner_id: number | null;
  timestamp: number;
}

export interface DbRubricScore {
  id: number;
  judge_id: number;
  project_id: number;
  originality: number;
  technical_complexity: number;
  impact: number;
  learning_collaboration: number;
  comments: string;
  timestamp: number;
}

// Project functions
export async function getAllProjects(): Promise<DbProject[]> {
  return query<DbProject[]>('SELECT * FROM projects ORDER BY table_number ASC');
}

export async function getProjectById(id: number): Promise<DbProject | null> {
  const projects = await query<DbProject[]>('SELECT * FROM projects WHERE id = $1', [id]);
  return projects.length > 0 ? projects[0] : null;
}

export async function createProject(project: Omit<DbProject, 'id'>): Promise<DbProject> {
  const result = await query<DbProject[]>(
    'INSERT INTO projects (name, description, team_members, table_number, is_finalist) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [project.name, project.description, project.team_members, project.table_number, project.is_finalist]
  );
  return result[0];
}

export async function updateProject(id: number, updates: Partial<DbProject>): Promise<DbProject | null> {
  // Build dynamic update query based on provided fields
  const updateFields: string[] = [];
  const queryParams: any[] = [];
  let paramIndex = 1;

  if (updates.name !== undefined) {
    updateFields.push(`name = $${paramIndex++}`);
    queryParams.push(updates.name);
  }
  if (updates.description !== undefined) {
    updateFields.push(`description = $${paramIndex++}`);
    queryParams.push(updates.description);
  }
  if (updates.team_members !== undefined) {
    updateFields.push(`team_members = $${paramIndex++}`);
    queryParams.push(updates.team_members);
  }
  if (updates.table_number !== undefined) {
    updateFields.push(`table_number = $${paramIndex++}`);
    queryParams.push(updates.table_number);
  }
  if (updates.is_finalist !== undefined) {
    updateFields.push(`is_finalist = $${paramIndex++}`);
    queryParams.push(updates.is_finalist);
  }

  if (updateFields.length === 0) {
    return getProjectById(id);
  }

  queryParams.push(id);
  const updateQuery = `UPDATE projects SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await query<DbProject[]>(updateQuery, queryParams);
  
  return result.length > 0 ? result[0] : null;
}

export async function deleteProject(id: number): Promise<boolean> {
  const result = await query<{ count: string }>('DELETE FROM projects WHERE id = $1 RETURNING COUNT(*)', [id]);
  return parseInt(result.count) > 0;
}

export async function setProjectsAsFinalists(ids: number[]): Promise<DbProject[]> {
  // Reset all finalists
  await query('UPDATE projects SET is_finalist = FALSE');
  
  if (ids.length === 0) {
    return [];
  }
  
  // Set new finalists
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
  const finalists = await query<DbProject[]>(
    `UPDATE projects SET is_finalist = TRUE WHERE id IN (${placeholders}) RETURNING *`,
    ids
  );
  
  return finalists;
}

// Judge functions
export async function getAllJudges(): Promise<DbJudge[]> {
  return query<DbJudge[]>('SELECT * FROM judges ORDER BY name ASC');
}

export async function getJudgeById(id: number): Promise<DbJudge | null> {
  const judges = await query<DbJudge[]>('SELECT * FROM judges WHERE id = $1', [id]);
  return judges.length > 0 ? judges[0] : null;
}

export async function createJudge(judge: Omit<DbJudge, 'id'>): Promise<DbJudge> {
  const result = await query<DbJudge[]>(
    'INSERT INTO judges (name, email) VALUES ($1, $2) RETURNING *',
    [judge.name, judge.email]
  );
  return result[0];
}

export async function deleteJudge(id: number): Promise<boolean> {
  const result = await query<{ count: string }>('DELETE FROM judges WHERE id = $1 RETURNING COUNT(*)', [id]);
  return parseInt(result.count) > 0;
}

// Comparison functions
export async function getAllComparisons(): Promise<DbComparison[]> {
  return query<DbComparison[]>('SELECT * FROM comparisons ORDER BY timestamp DESC');
}

export async function getComparisonsByJudge(judgeId: number): Promise<DbComparison[]> {
  return query<DbComparison[]>(
    'SELECT * FROM comparisons WHERE judge_id = $1 ORDER BY timestamp DESC',
    [judgeId]
  );
}

export async function createComparison(comparison: Omit<DbComparison, 'id'>): Promise<DbComparison> {
  const result = await query<DbComparison[]>(
    'INSERT INTO comparisons (judge_id, project_a_id, project_b_id, winner_id, timestamp) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [comparison.judge_id, comparison.project_a_id, comparison.project_b_id, comparison.winner_id, comparison.timestamp]
  );
  return result[0];
}

// Rubric Score functions
export async function getAllRubricScores(): Promise<DbRubricScore[]> {
  return query<DbRubricScore[]>('SELECT * FROM rubric_scores ORDER BY timestamp DESC');
}

export async function getRubricScoresByJudge(judgeId: number): Promise<DbRubricScore[]> {
  return query<DbRubricScore[]>(
    'SELECT * FROM rubric_scores WHERE judge_id = $1 ORDER BY timestamp DESC',
    [judgeId]
  );
}

export async function getRubricScoresByProject(projectId: number): Promise<DbRubricScore[]> {
  return query<DbRubricScore[]>(
    'SELECT * FROM rubric_scores WHERE project_id = $1 ORDER BY timestamp DESC',
    [projectId]
  );
}

export async function createRubricScore(score: Omit<DbRubricScore, 'id'>): Promise<DbRubricScore> {
  // Check if a score already exists for this judge and project
  const existing = await query<DbRubricScore[]>(
    'SELECT * FROM rubric_scores WHERE judge_id = $1 AND project_id = $2',
    [score.judge_id, score.project_id]
  );
  
  if (existing.length > 0) {
    // Update existing score
    const result = await query<DbRubricScore[]>(
      `UPDATE rubric_scores SET 
       originality = $1, 
       technical_complexity = $2, 
       impact = $3, 
       learning_collaboration = $4, 
       comments = $5, 
       timestamp = $6 
       WHERE judge_id = $7 AND project_id = $8 RETURNING *`,
      [
        score.originality, 
        score.technical_complexity, 
        score.impact, 
        score.learning_collaboration, 
        score.comments, 
        score.timestamp,
        score.judge_id,
        score.project_id
      ]
    );
    return result[0];
  } else {
    // Create new score
    const result = await query<DbRubricScore[]>(
      `INSERT INTO rubric_scores 
       (judge_id, project_id, originality, technical_complexity, impact, learning_collaboration, comments, timestamp) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        score.judge_id, 
        score.project_id, 
        score.originality, 
        score.technical_complexity, 
        score.impact, 
        score.learning_collaboration, 
        score.comments, 
        score.timestamp
      ]
    );
    return result[0];
  }
}

// Calculate average scores for a project
export async function getAverageScoresForProject(projectId: number): Promise<{
  originality: number;
  technical_complexity: number;
  impact: number;
  learning_collaboration: number;
  overall: number;
}> {
  const result = await query<any[]>(`
    SELECT 
      AVG(originality) as originality, 
      AVG(technical_complexity) as technical_complexity, 
      AVG(impact) as impact, 
      AVG(learning_collaboration) as learning_collaboration,
      (AVG(originality) + AVG(technical_complexity) + AVG(impact) + AVG(learning_collaboration)) / 4 as overall
    FROM rubric_scores 
    WHERE project_id = $1
    GROUP BY project_id
  `, [projectId]);
  
  if (result.length === 0) {
    return {
      originality: 0,
      technical_complexity: 0,
      impact: 0,
      learning_collaboration: 0,
      overall: 0
    };
  }
  
  return {
    originality: parseFloat(result[0].originality) || 0,
    technical_complexity: parseFloat(result[0].technical_complexity) || 0,
    impact: parseFloat(result[0].impact) || 0,
    learning_collaboration: parseFloat(result[0].learning_collaboration) || 0,
    overall: parseFloat(result[0].overall) || 0
  };
}

// Initialize database tables
export async function initializeDatabase(): Promise<void> {
  // Create tables one by one to avoid the multiple statements error
  try {
    console.log('Creating projects table...');
    // Projects table
    await query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        team_members TEXT NOT NULL,
        table_number INTEGER NOT NULL,
        is_finalist BOOLEAN DEFAULT FALSE
      )
    `);

    console.log('Creating judges table...');
    // Judges table
    await query(`
      CREATE TABLE IF NOT EXISTS judges (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL
      )
    `);

    console.log('Creating comparisons table...');
    // Comparisons table
    await query(`
      CREATE TABLE IF NOT EXISTS comparisons (
        id SERIAL PRIMARY KEY,
        judge_id INTEGER NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
        project_a_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        project_b_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        winner_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
        timestamp BIGINT NOT NULL,
        CONSTRAINT different_projects CHECK (project_a_id <> project_b_id)
      )
    `);

    console.log('Creating rubric scores table...');
    // Rubric scores table
    await query(`
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
      )
    `);

    console.log('Creating indexes...');
    // Indexes for better performance
    await query(`CREATE INDEX IF NOT EXISTS idx_comparisons_judge_id ON comparisons(judge_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_rubric_scores_judge_id ON rubric_scores(judge_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_rubric_scores_project_id ON rubric_scores(project_id)`);
    
    console.log('Database schema created successfully!');
  } catch (error) {
    console.error('Error creating database schema:', error);
    throw error;
  }
} 