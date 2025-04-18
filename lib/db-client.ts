/**
 * Client-side database utility
 * Use this in client components instead of directly importing from db.ts
 */

// Generic function to fetch from API routes
export async function fetchFromDB(action: string, data?: any) {
  try {
    if (data) {
      // POST request with data
      const response = await fetch(`/api/db/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An error occurred');
      }
      
      return await response.json();
    } else {
      // GET request
      const response = await fetch(`/api/db/${action}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An error occurred');
      }
      
      return await response.json();
    }
  } catch (error) {
    console.error('Error fetching from DB:', error);
    throw error;
  }
}

// Test database connection
export async function testConnection() {
  return fetchFromDB('test-connection');
}

// Get all projects
export async function getProjects() {
  const result = await fetchFromDB('get-projects');
  return result.projects || [];
}

// Add a new project
export async function addProject(project: { 
  name: string; 
  description: string; 
  team_members: string; 
  table_number: number;
}) {
  return fetchFromDB('add-project', project);
}

// Get average scores for a project
export async function getProjectScores(projectId: number) {
  const result = await fetchFromDB(`get-rubric-scores?projectId=${projectId}`);
  return result.scores;
} 

export async function getRubricScores(){
  const result = await fetchFromDB('get-projects');
  return result.projects || [];
}

// Get all judges
export async function getJudges() {
  const result = await fetchFromDB('get-judges');
  return result.judges || [];
}

// Add a new judge
export async function addJudge(judge: {
  name: string;
  email: string;
}) {
  return fetchFromDB('add-judge', judge);
}

// Delete a judge
export async function deleteJudge(id: number) {
  return fetchFromDB('delete-judge', { id });
}

// Get project rankings
export async function getProjectRankings() {
  const result = await fetchFromDB('get-rankings');
  return result.rankings || [];
}

// Set finalists
export async function setFinalists(count: number) {
  const result = await fetchFromDB('set-finalists', { count });
  return result.finalists || [];
}

// Get average rubric scores for a project
export async function calculateAverageRubricScores(projectId: number) {
  const result = await fetchFromDB(`get-rubric-scores?projectId=${projectId}`);
  return result.scores || {
    originality: 0,
    technicalComplexity: 0,
    impact: 0,
    learningCollaboration: 0,
    overall: 0
  };
}