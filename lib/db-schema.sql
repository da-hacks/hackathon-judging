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

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comparisons_judge_id ON comparisons(judge_id);
CREATE INDEX IF NOT EXISTS idx_rubric_scores_judge_id ON rubric_scores(judge_id);
CREATE INDEX IF NOT EXISTS idx_rubric_scores_project_id ON rubric_scores(project_id); 