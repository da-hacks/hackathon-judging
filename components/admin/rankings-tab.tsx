"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getProjects, getProjectRankings, setFinalists, calculateAverageRubricScores } from "@/lib/db-client"

export type Project = {
  id: number;
  name: string;
  description: string;
  teamMembers: string;
  tableNumber: number;
  isFinalist: boolean;
}

export type RubricScore = {
  originality: number;
  technicalComplexity: number;
  impact: number;
  learningCollaboration: number;
  overall: number;
}

export default function RankingsTab() {
  const [rankings, setRankings] = useState<{ project: Project; score: number }[]>([])
  const [finalistCount, setFinalistCount] = useState(5)
  const [currentPhase, setCurrentPhase] = useState("expo")
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [rubricScores, setRubricScores] = useState<Record<number, RubricScore>>({})
  const { toast } = useToast()

  // Fetch rankings data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Get current phase from localStorage
        const phase = localStorage.getItem("currentPhase") || "expo"
        setCurrentPhase(phase)
        
        // Get projects list
        const projectsList = await getProjects()
        setProjects(projectsList)
        
        // Calculate rankings
        const rankingsList = await getProjectRankings()
        setRankings(rankingsList)
        
        // Load rubric scores for all projects
        const scores: Record<number, RubricScore> = {}
        for (const project of projectsList) {
          scores[project.id] = await calculateAverageRubricScores(project.id)
        }
        setRubricScores(scores)
      } catch (error) {
        console.error("Error fetching rankings data:", error)
        toast({
          title: "Error",
          description: "Failed to load rankings data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [toast])

  const handleSetFinalists = async () => {
    try {
      await setFinalists(finalistCount)
      
      // Refresh rankings data
      const updatedRankings = await getProjectRankings()
      setRankings(updatedRankings)
      
      // Update projects data
      const updatedProjects = await getProjects()
      setProjects(updatedProjects)

      toast({
        title: "Finalists set",
        description: `${finalistCount} projects have been marked as finalists`,
      })
    } catch (error) {
      console.error("Error setting finalists:", error)
      toast({
        title: "Error",
        description: "Failed to set finalists",
        variant: "destructive",
      })
    }
  }

  const refreshRankings = async () => {
    try {
      setLoading(true)
      
      // Refresh rankings data
      const updatedRankings = await getProjectRankings()
      setRankings(updatedRankings)
      
      // Update projects data
      const updatedProjects = await getProjects()
      setProjects(updatedProjects)
      
      // Reload rubric scores
      const scores: Record<number, RubricScore> = {}
      for (const project of updatedProjects) {
        scores[project.id] = await calculateAverageRubricScores(project.id)
      }
      setRubricScores(scores)

      toast({
        title: "Rankings refreshed",
        description: "Project rankings have been updated",
      })
    } catch (error) {
      console.error("Error refreshing rankings:", error)
      toast({
        title: "Error",
        description: "Failed to refresh rankings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Project Rankings</CardTitle>
          <CardDescription>
            {currentPhase === "expo"
              ? "Rankings based on pairwise comparisons"
              : "Final rankings based on rubric scores"}
          </CardDescription>
        </div>
        <div className="flex gap-2">
          {currentPhase === "expo" && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={finalistCount}
                onChange={(e) => setFinalistCount(Number.parseInt(e.target.value) || 5)}
                className="w-16 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                min="1"
                max={projects.length}
              />
              <Button onClick={handleSetFinalists}>Set Finalists</Button>
            </div>
          )}
          <Button variant="outline" onClick={refreshRankings}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading rankings...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Team</TableHead>
                {currentPhase === "expo" ? (
                  <TableHead className="text-right">Win Rate</TableHead>
                ) : (
                  <>
                    <TableHead className="text-right">Originality</TableHead>
                    <TableHead className="text-right">Technical</TableHead>
                    <TableHead className="text-right">Impact</TableHead>
                    <TableHead className="text-right">Learning</TableHead>
                    <TableHead className="text-right">Overall</TableHead>
                  </>
                )}
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={currentPhase === "expo" ? 5 : 9} className="text-center">
                    No rankings data available
                  </TableCell>
                </TableRow>
              ) : (
                rankings.map((ranking, index) => {
                  const { project, score } = ranking;
                  const projectScores = rubricScores[project.id] || {
                    originality: 0,
                    technicalComplexity: 0,
                    impact: 0,
                    learningCollaboration: 0,
                    overall: 0
                  };

                  return (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{project.name}</TableCell>
                      <TableCell>{project.teamMembers}</TableCell>

                      {currentPhase === "expo" ? (
                        <TableCell className="text-right">{(score * 100).toFixed(1)}%</TableCell>
                      ) : (
                        <>
                          <TableCell className="text-right">{projectScores.originality.toFixed(1)}</TableCell>
                          <TableCell className="text-right">{projectScores.technicalComplexity.toFixed(1)}</TableCell>
                          <TableCell className="text-right">{projectScores.impact.toFixed(1)}</TableCell>
                          <TableCell className="text-right">{projectScores.learningCollaboration.toFixed(1)}</TableCell>
                          <TableCell className="text-right font-medium">{projectScores.overall.toFixed(1)}</TableCell>
                        </>
                      )}

                      <TableCell>
                        {project.isFinalist ? (
                          <Badge variant="default">Finalist</Badge>
                        ) : (
                          <Badge variant="outline">Regular</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
