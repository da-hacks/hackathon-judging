// Types
import * as db from './db-models';
import { getProjects as fetchProjects, getRubricScores as fetchRubricScores } from './db-client';

export interface Project {
  id: string;
  name: string;
  description: string;
  teamMembers: string;
  tableNumber: number;
  isFinalist?: boolean;
}

export interface Judge {
  id: string;
  name: string;
  email: string;
}

export interface Comparison {
  id: string;
  judgeId: string;
  projectAId: string;
  projectBId: string;
  winnerId: string | null;
  timestamp: number;
}

export interface RubricScore {
  id: string;
  judgeId: string;
  projectId: string;
  originality: number;
  technicalComplexity: number;
  impact: number;
  learningCollaboration: number;
  comments: string;
  timestamp: number;
}

// Conversion functions for database models to application models
function dbProjectToProject(dbProject: db.DbProject): Project {
  return {
    id: dbProject.id.toString(),
    name: dbProject.name,
    description: dbProject.description,
    teamMembers: dbProject.team_members,
    tableNumber: dbProject.table_number,
    isFinalist: dbProject.is_finalist,
  };
}

function dbJudgeToJudge(dbJudge: db.DbJudge): Judge {
  return {
    id: dbJudge.id.toString(),
    name: dbJudge.name,
    email: dbJudge.email,
  };
}

function dbComparisonToComparison(dbComparison: db.DbComparison): Comparison {
  return {
    id: dbComparison.id.toString(),
    judgeId: dbComparison.judge_id.toString(),
    projectAId: dbComparison.project_a_id.toString(),
    projectBId: dbComparison.project_b_id.toString(),
    winnerId: dbComparison.winner_id ? dbComparison.winner_id.toString() : null,
    timestamp: dbComparison.timestamp,
  };
}

function dbRubricScoreToRubricScore(dbScore: db.DbRubricScore): RubricScore {
  return {
    id: dbScore.id.toString(),
    judgeId: dbScore.judge_id.toString(),
    projectId: dbScore.project_id.toString(),
    originality: dbScore.originality,
    technicalComplexity: dbScore.technical_complexity,
    impact: dbScore.impact,
    learningCollaboration: dbScore.learning_collaboration,
    comments: dbScore.comments,
    timestamp: dbScore.timestamp,
  };
}

// Helper functions
export async function getProjects(): Promise<Project[]> {
  try {
    const projects = await fetchProjects();
    return projects.map((project: any) => ({
      id: project.id.toString(),
      name: project.name,
      description: project.description,
      teamMembers: project.team_members,
      tableNumber: project.table_number,
      isFinalist: project.is_finalist,
    }));
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export async function getProject(id: string): Promise<Project | undefined> {
  const dbProject = await db.getProjectById(parseInt(id));
  return dbProject ? dbProjectToProject(dbProject) : undefined;
}

export async function addProject(project: Omit<Project, "id">): Promise<Project> {
  const dbProject = await db.createProject({
    name: project.name,
    description: project.description,
    team_members: project.teamMembers,
    table_number: project.tableNumber,
    is_finalist: !!project.isFinalist,
  });
  return dbProjectToProject(dbProject);
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  const dbUpdates: Partial<db.DbProject> = {};
  
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.teamMembers !== undefined) dbUpdates.team_members = updates.teamMembers;
  if (updates.tableNumber !== undefined) dbUpdates.table_number = updates.tableNumber;
  if (updates.isFinalist !== undefined) dbUpdates.is_finalist = updates.isFinalist;
  
  const updatedProject = await db.updateProject(parseInt(id), dbUpdates);
  return updatedProject ? dbProjectToProject(updatedProject) : null;
}

export async function deleteProject(id: string): Promise<boolean> {
  return db.deleteProject(parseInt(id));
}

export async function getJudges(): Promise<Judge[]> {
  const dbJudges = await db.getAllJudges();
  return dbJudges.map(dbJudgeToJudge);
}

export async function getJudge(id: string): Promise<Judge | undefined> {
  const dbJudge = await db.getJudgeById(parseInt(id));
  return dbJudge ? dbJudgeToJudge(dbJudge) : undefined;
}

export async function addJudge(judge: Omit<Judge, "id">): Promise<Judge> {
  const dbJudge = await db.createJudge({
    name: judge.name,
    email: judge.email,
  });
  return dbJudgeToJudge(dbJudge);
}

export async function deleteJudge(id: string): Promise<boolean> {
  return db.deleteJudge(parseInt(id));
}

export async function addComparison(comparison: Omit<Comparison, "id" | "timestamp">): Promise<Comparison> {
  const dbComparison = await db.createComparison({
    judge_id: parseInt(comparison.judgeId),
    project_a_id: parseInt(comparison.projectAId),
    project_b_id: parseInt(comparison.projectBId),
    winner_id: comparison.winnerId ? parseInt(comparison.winnerId) : null,
    timestamp: Date.now(),
  });
  return dbComparisonToComparison(dbComparison);
}

export async function getComparisons(): Promise<Comparison[]> {
  const dbComparisons = await db.getAllComparisons();
  return dbComparisons.map(dbComparisonToComparison);
}

export async function getComparisonsByJudge(judgeId: string): Promise<Comparison[]> {
  const dbComparisons = await db.getComparisonsByJudge(parseInt(judgeId));
  return dbComparisons.map(dbComparisonToComparison);
}

export async function addRubricScore(score: Omit<RubricScore, "id" | "timestamp">): Promise<RubricScore> {
  const dbScore = await db.createRubricScore({
    judge_id: parseInt(score.judgeId),
    project_id: parseInt(score.projectId),
    originality: score.originality,
    technical_complexity: score.technicalComplexity,
    impact: score.impact,
    learning_collaboration: score.learningCollaboration,
    comments: score.comments,
    timestamp: Date.now(),
  });
  return dbRubricScoreToRubricScore(dbScore);
}

export async function getRubricScores(): Promise<RubricScore[]> {
  const dbScores = await db.getAllRubricScores();
  return dbScores.map(dbRubricScoreToRubricScore);
}

export async function getRubricScoresByJudge(judgeId: string): Promise<RubricScore[]> {
  const dbScores = await db.getRubricScoresByJudge(parseInt(judgeId));
  return dbScores.map(dbRubricScoreToRubricScore);
}

export async function getRubricScoresByProject(projectId: string): Promise<RubricScore[]> {
  const dbScores = await db.getRubricScoresByProject(parseInt(projectId));
  return dbScores.map(dbRubricScoreToRubricScore);
}

// Pairwise comparison algorithm
export async function getNextPairForJudge(judgeId: string): Promise<{ projectA: Project; projectB: Project } | null> {
  const judgeComparisons = await getComparisonsByJudge(judgeId);
  const allProjects = await getProjects();

  // If there are less than 2 projects, we can't make a pair
  if (allProjects.length < 2) return null;

  // Create a map of how many times each project has been seen by this judge
  const projectSeenCount = new Map<string, number>();
  allProjects.forEach((p) => projectSeenCount.set(p.id, 0));

  judgeComparisons.forEach((c) => {
    const projectACount = projectSeenCount.get(c.projectAId) || 0;
    projectSeenCount.set(c.projectAId, projectACount + 1);

    const projectBCount = projectSeenCount.get(c.projectBId) || 0;
    projectSeenCount.set(c.projectBId, projectBCount + 1);
  });

  // Sort projects by how many times they've been seen (least to most)
  const sortedProjects = [...allProjects].sort((a, b) => {
    return (projectSeenCount.get(a.id) || 0) - (projectSeenCount.get(b.id) || 0);
  });

  // Get the two least seen projects
  const projectA = sortedProjects[0];
  const projectB = sortedProjects[1];

  // Check if this exact pair has been compared before
  const pairExists = judgeComparisons.some(
    (c) =>
      (c.projectAId === projectA.id && c.projectBId === projectB.id) ||
      (c.projectAId === projectB.id && c.projectBId === projectA.id),
  );

  // If this pair has been compared, try to find another pair
  if (pairExists && sortedProjects.length > 2) {
    const projectC = sortedProjects[2];

    // Check if A-C pair exists
    const pairACExists = judgeComparisons.some(
      (c) =>
        (c.projectAId === projectA.id && c.projectBId === projectC.id) ||
        (c.projectAId === projectC.id && c.projectBId === projectA.id),
    );

    if (!pairACExists) {
      return { projectA, projectB: projectC };
    }

    // Check if B-C pair exists
    const pairBCExists = judgeComparisons.some(
      (c) =>
        (c.projectAId === projectB.id && c.projectBId === projectC.id) ||
        (c.projectAId === projectC.id && c.projectBId === projectB.id),
    );

    if (!pairBCExists) {
      return { projectA: projectB, projectB: projectC };
    }
  }

  // If we can't find a new pair, return the original pair even if it has been compared before
  return { projectA, projectB };
}

// Rankings calculation
export async function calculateRankings(): Promise<{ project: Project; score: number }[]> {
  const projects = await getProjects();
  const comparisons = await getComparisons();
  
  // Initialize wins and appearances count
  const wins = new Map<string, number>();
  const appearances = new Map<string, number>();
  
  projects.forEach(p => {
    wins.set(p.id, 0);
    appearances.set(p.id, 0);
  });
  
  // Count wins and appearances
  comparisons.forEach(c => {
    if (c.winnerId) {
      const winCount = wins.get(c.winnerId) || 0;
      wins.set(c.winnerId, winCount + 1);
    }
    
    const projectACount = appearances.get(c.projectAId) || 0;
    appearances.set(c.projectAId, projectACount + 1);
    
    const projectBCount = appearances.get(c.projectBId) || 0;
    appearances.set(c.projectBId, projectBCount + 1);
  });
  
  // Calculate win rate
  const rankings = projects.map(project => {
    const projectWins = wins.get(project.id) || 0;
    const projectAppearances = appearances.get(project.id) || 0;
    
    // Win rate calculation, handle division by zero
    const winRate = projectAppearances === 0 ? 0 : projectWins / projectAppearances;
    
    return {
      project,
      score: winRate
    };
  });
  
  // Sort by win rate in descending order
  return rankings.sort((a, b) => b.score - a.score);
}

// Set finalists based on rankings
export async function setFinalists(count = 5): Promise<Project[]> {
  const rankings = await calculateRankings();
  const finalistIds = rankings.slice(0, count).map(r => parseInt(r.project.id));
  
  const finalistProjects = await db.setProjectsAsFinalists(finalistIds);
  return finalistProjects.map(dbProjectToProject);
}

// Add a client-side implementation of getAverageScoresForProject
export async function calculateAverageRubricScores(projectId: string): Promise<{
  originality: number;
  technicalComplexity: number;
  impact: number;
  learningCollaboration: number;
  overall: number;
}> {
  try {
    return await fetchRubricScores(projectId);
  } catch (error) {
    console.error('Error fetching rubric scores:', error);
    return {
      originality: 0,
      technicalComplexity: 0,
      impact: 0,
      learningCollaboration: 0,
      overall: 0
    };
  }
}

// Initialize database tables and seed data if needed
export async function initializeData() {
  // Initialize database tables first
  await db.initializeDatabase();
  
  // Check if there are any projects already
  const existingProjects = await getProjects();
  
  // Only seed data if there are no projects
  if (existingProjects.length === 0) {
    // Seed projects
    const projectsToSeed = [
      {
        name: "Smart Health Monitor",
        description: "A wearable device that monitors vital signs and alerts users of potential health issues.",
        teamMembers: "Alice, Bob, Charlie",
        tableNumber: 1,
      },
      {
        name: "EcoTrack",
        description: "An app that helps users reduce their carbon footprint by tracking daily activities.",
        teamMembers: "David, Emma, Frank",
        tableNumber: 2,
      },
      {
        name: "StudyBuddy",
        description: "An AI-powered study assistant that helps students prepare for exams.",
        teamMembers: "Grace, Henry, Ivy",
        tableNumber: 3,
      },
      {
        name: "FoodShare",
        description: "A platform connecting restaurants with excess food to homeless shelters.",
        teamMembers: "Jack, Kate, Liam",
        tableNumber: 4,
      },
      {
        name: "VirtualTour",
        description: "A VR application that allows users to explore museums and historical sites remotely.",
        teamMembers: "Mike, Nina, Oscar",
        tableNumber: 5,
      },
    ];
    
    for (const project of projectsToSeed) {
      await addProject(project);
    }
    
    // Seed judges
    const judgesToSeed = [
      {
        name: "Dr. Smith",
        email: "smith@example.com",
      },
      {
        name: "Prof. Johnson",
        email: "johnson@example.com",
      },
      {
        name: "Ms. Williams",
        email: "williams@example.com",
      },
    ];
    
    for (const judge of judgesToSeed) {
      await addJudge(judge);
    }
  }
}
