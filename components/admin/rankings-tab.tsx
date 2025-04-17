"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { calculateRankings, setFinalists, getProjects, calculateAverageRubricScores, type Project } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"

export default function RankingsTab() {
  const [rankings, setRankings] = useState<{ project: Project; score: number }[]>([])
  const [finalistCount, setFinalistCount] = useState(5)
  const [currentPhase, setCurrentPhase] = useState("expo")
  const { toast } = useToast()

  useEffect(() => {
    // Get current phase from localStorage
    const phase = localStorage.getItem("currentPhase") || "expo"
    setCurrentPhase(phase)

    // Calculate rankings
    const currentRankings = calculateRankings()
    setRankings(currentRankings)
  }, [])

  const handleSetFinalists = () => {
    const finalists = setFinalists(finalistCount)

    // Recalculate rankings to update UI
    const updatedRankings = calculateRankings()
    setRankings(updatedRankings)

    toast({
      title: "Finalists set",
      description: `${finalists.length} projects have been marked as finalists`,
    })
  }

  const refreshRankings = () => {
    const updatedRankings = calculateRankings()
    setRankings(updatedRankings)

    toast({
      title: "Rankings refreshed",
      description: "Project rankings have been updated",
    })
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
                max={getProjects().length}
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
            {rankings.map((ranking, index) => {
              const { project, score } = ranking
              const rubricScores = calculateAverageRubricScores(project.id)

              return (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{project.teamMembers}</TableCell>

                  {currentPhase === "expo" ? (
                    <TableCell className="text-right">{(score * 100).toFixed(1)}%</TableCell>
                  ) : (
                    <>
                      <TableCell className="text-right">{rubricScores.originality.toFixed(1)}</TableCell>
                      <TableCell className="text-right">{rubricScores.technicalComplexity.toFixed(1)}</TableCell>
                      <TableCell className="text-right">{rubricScores.impact.toFixed(1)}</TableCell>
                      <TableCell className="text-right">{rubricScores.learningCollaboration.toFixed(1)}</TableCell>
                      <TableCell className="text-right font-medium">{rubricScores.overall.toFixed(1)}</TableCell>
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
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
