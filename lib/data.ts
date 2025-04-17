// Types
export interface Project {
  id: string
  name: string
  description: string
  teamMembers: string
  tableNumber: number
  isFinalist?: boolean
}

export interface Judge {
  id: string
  name: string
  email: string
}

export interface Comparison {
  id: string
  judgeId: string
  projectAId: string
  projectBId: string
  winnerId: string | null
  timestamp: number
}

export interface RubricScore {
  id: string
  judgeId: string
  projectId: string
  originality: number
  technicalComplexity: number
  impact: number
  learningCollaboration: number
  comments: string
  timestamp: number
}

// In-memory data store
let projects: Project[] = [
  {
    id: "p1",
    name: "Smart Health Monitor",
    description: "A wearable device that monitors vital signs and alerts users of potential health issues.",
    teamMembers: "Alice, Bob, Charlie",
    tableNumber: 1,
  },
  {
    id: "p2",
    name: "EcoTrack",
    description: "An app that helps users reduce their carbon footprint by tracking daily activities.",
    teamMembers: "David, Emma, Frank",
    tableNumber: 2,
  },
  {
    id: "p3",
    name: "StudyBuddy",
    description: "An AI-powered study assistant that helps students prepare for exams.",
    teamMembers: "Grace, Henry, Ivy",
    tableNumber: 3,
  },
  {
    id: "p4",
    name: "FoodShare",
    description: "A platform connecting restaurants with excess food to homeless shelters.",
    teamMembers: "Jack, Kate, Liam",
    tableNumber: 4,
  },
  {
    id: "p5",
    name: "VirtualTour",
    description: "A VR application that allows users to explore museums and historical sites remotely.",
    teamMembers: "Mike, Nina, Oscar",
    tableNumber: 5,
  },
]

let judges: Judge[] = [
  {
    id: "j1",
    name: "Dr. Smith",
    email: "smith@example.com",
  },
  {
    id: "j2",
    name: "Prof. Johnson",
    email: "johnson@example.com",
  },
  {
    id: "j3",
    name: "Ms. Williams",
    email: "williams@example.com",
  },
]

const comparisons: Comparison[] = []
const rubricScores: RubricScore[] = []

// Helper functions
export function getProjects(): Project[] {
  return [...projects]
}

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id)
}

export function addProject(project: Omit<Project, "id">): Project {
  const newProject: Project = {
    ...project,
    id: `p${projects.length + 1}`,
  }
  projects.push(newProject)
  return newProject
}

export function updateProject(id: string, updates: Partial<Project>): Project | null {
  const index = projects.findIndex((p) => p.id === id)
  if (index === -1) return null

  projects[index] = { ...projects[index], ...updates }
  return projects[index]
}

export function deleteProject(id: string): boolean {
  const initialLength = projects.length
  projects = projects.filter((p) => p.id !== id)
  return projects.length < initialLength
}

export function getJudges(): Judge[] {
  return [...judges]
}

export function getJudge(id: string): Judge | undefined {
  return judges.find((j) => j.id === id)
}

export function addJudge(judge: Omit<Judge, "id">): Judge {
  const newJudge: Judge = {
    ...judge,
    id: `j${judges.length + 1}`,
  }
  judges.push(newJudge)
  return newJudge
}

export function deleteJudge(id: string): boolean {
  const initialLength = judges.length
  judges = judges.filter((j) => j.id !== id)
  return judges.length < initialLength
}

export function addComparison(comparison: Omit<Comparison, "id" | "timestamp">): Comparison {
  const newComparison: Comparison = {
    ...comparison,
    id: `c${comparisons.length + 1}`,
    timestamp: Date.now(),
  }
  comparisons.push(newComparison)
  return newComparison
}

export function getComparisons(): Comparison[] {
  return [...comparisons]
}

export function getComparisonsByJudge(judgeId: string): Comparison[] {
  return comparisons.filter((c) => c.judgeId === judgeId)
}

export function addRubricScore(score: Omit<RubricScore, "id" | "timestamp">): RubricScore {
  const newScore: RubricScore = {
    ...score,
    id: `r${rubricScores.length + 1}`,
    timestamp: Date.now(),
  }
  rubricScores.push(newScore)
  return newScore
}

export function getRubricScores(): RubricScore[] {
  return [...rubricScores]
}

export function getRubricScoresByJudge(judgeId: string): RubricScore[] {
  return rubricScores.filter((s) => s.judgeId === judgeId)
}

export function getRubricScoresByProject(projectId: string): RubricScore[] {
  return rubricScores.filter((s) => s.projectId === projectId)
}

// Pairwise comparison algorithm
export function getNextPairForJudge(judgeId: string): { projectA: Project; projectB: Project } | null {
  const judgeComparisons = getComparisonsByJudge(judgeId)
  const allProjects = getProjects()

  // If there are less than 2 projects, we can't make a pair
  if (allProjects.length < 2) return null

  // Create a map of how many times each project has been seen by this judge
  const projectSeenCount = new Map<string, number>()
  allProjects.forEach((p) => projectSeenCount.set(p.id, 0))

  judgeComparisons.forEach((c) => {
    const projectACount = projectSeenCount.get(c.projectAId) || 0
    projectSeenCount.set(c.projectAId, projectACount + 1)

    const projectBCount = projectSeenCount.get(c.projectBId) || 0
    projectSeenCount.set(c.projectBId, projectBCount + 1)
  })

  // Sort projects by how many times they've been seen (least to most)
  const sortedProjects = [...allProjects].sort((a, b) => {
    return (projectSeenCount.get(a.id) || 0) - (projectSeenCount.get(b.id) || 0)
  })

  // Get the two least seen projects
  const projectA = sortedProjects[0]
  const projectB = sortedProjects[1]

  // Check if this exact pair has been compared before
  const pairExists = judgeComparisons.some(
    (c) =>
      (c.projectAId === projectA.id && c.projectBId === projectB.id) ||
      (c.projectAId === projectB.id && c.projectBId === projectA.id),
  )

  // If this pair has been compared, try to find another pair
  if (pairExists && sortedProjects.length > 2) {
    const projectC = sortedProjects[2]

    // Check if A-C pair exists
    const pairACExists = judgeComparisons.some(
      (c) =>
        (c.projectAId === projectA.id && c.projectBId === projectC.id) ||
        (c.projectAId === projectC.id && c.projectBId === projectA.id),
    )

    if (!pairACExists) {
      return { projectA, projectB: projectC }
    }

    // Check if B-C pair exists
    const pairBCExists = judgeComparisons.some(
      (c) =>
        (c.projectAId === projectB.id && c.projectBId === projectC.id) ||
        (c.projectAId === projectC.id && c.projectBId === projectB.id),
    )

    if (!pairBCExists) {
      return { projectA: projectB, projectB: projectC }
    }
  }

  return { projectA, projectB }
}

// Calculate project rankings based on pairwise comparisons
export function calculateRankings(): { project: Project; score: number }[] {
  const allProjects = getProjects()
  const projectWins = new Map<string, number>()
  const projectAppearances = new Map<string, number>()

  // Initialize maps
  allProjects.forEach((p) => {
    projectWins.set(p.id, 0)
    projectAppearances.set(p.id, 0)
  })

  // Count wins and appearances
  comparisons.forEach((c) => {
    if (c.winnerId) {
      const wins = projectWins.get(c.winnerId) || 0
      projectWins.set(c.winnerId, wins + 1)
    }

    const appearancesA = projectAppearances.get(c.projectAId) || 0
    projectAppearances.set(c.projectAId, appearancesA + 1)

    const appearancesB = projectAppearances.get(c.projectBId) || 0
    projectAppearances.set(c.projectBId, appearancesB + 1)
  })

  // Calculate win rate for each project
  const rankings = allProjects.map((project) => {
    const wins = projectWins.get(project.id) || 0
    const appearances = projectAppearances.get(project.id) || 0
    const score = appearances > 0 ? wins / appearances : 0

    return { project, score }
  })

  // Sort by score (descending)
  return rankings.sort((a, b) => b.score - a.score)
}

// Set finalists based on rankings
export function setFinalists(count = 5): Project[] {
  const rankings = calculateRankings()
  const finalists = rankings.slice(0, count).map((r) => r.project)

  // Update projects to mark finalists
  projects = projects.map((p) => {
    const isFinalist = finalists.some((f) => f.id === p.id)
    return { ...p, isFinalist }
  })

  return finalists
}

// Calculate average rubric scores for a project
export function calculateAverageRubricScores(projectId: string): {
  originality: number
  technicalComplexity: number
  impact: number
  learningCollaboration: number
  overall: number
} {
  const scores = getRubricScoresByProject(projectId)

  if (scores.length === 0) {
    return {
      originality: 0,
      technicalComplexity: 0,
      impact: 0,
      learningCollaboration: 0,
      overall: 0,
    }
  }

  const sum = scores.reduce(
    (acc, score) => {
      return {
        originality: acc.originality + score.originality,
        technicalComplexity: acc.technicalComplexity + score.technicalComplexity,
        impact: acc.impact + score.impact,
        learningCollaboration: acc.learningCollaboration + score.learningCollaboration,
      }
    },
    {
      originality: 0,
      technicalComplexity: 0,
      impact: 0,
      learningCollaboration: 0,
    },
  )

  const avg = {
    originality: sum.originality / scores.length,
    technicalComplexity: sum.technicalComplexity / scores.length,
    impact: sum.impact / scores.length,
    learningCollaboration: sum.learningCollaboration / scores.length,
  }

  const overall = (avg.originality + avg.technicalComplexity + avg.impact + avg.learningCollaboration) / 4

  return {
    ...avg,
    overall,
  }
}

// Initialize some data
export function initializeData() {
  // Add some initial comparisons for demo purposes
  if (comparisons.length === 0) {
    addComparison({
      judgeId: "j1",
      projectAId: "p1",
      projectBId: "p2",
      winnerId: "p1",
    })

    addComparison({
      judgeId: "j1",
      projectAId: "p3",
      projectBId: "p4",
      winnerId: "p3",
    })

    addComparison({
      judgeId: "j2",
      projectAId: "p1",
      projectBId: "p3",
      winnerId: "p3",
    })
  }
}

// Call initialize on module load
initializeData()
