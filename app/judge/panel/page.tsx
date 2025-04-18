"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AuthGuard } from "@/components/auth-guard"
import { getProjects } from "@/lib/db-client"

// Type definitions
export type Project = {
  id: number;
  name: string;
  description: string;
  teamMembers: string;
  tableNumber: number;
  isFinalist: boolean;
}

export type RubricScore = {
  id: number;
  judgeId: string;
  projectId: string;
  originality: number;
  technicalComplexity: number;
  impact: number;
  learningCollaboration: number;
  comments: string;
  timestamp: number;
}

export default function JudgePanel() {
  const [judgeId, setJudgeId] = useState<string | null>(null)
  const [judgeName, setJudgeName] = useState<string | null>(null)
  const [finalists, setFinalists] = useState<Project[]>([])
  const [completedScores, setCompletedScores] = useState<RubricScore[]>([])
  const [activeTab, setActiveTab] = useState("0")
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    originality: 5,
    technicalComplexity: 5,
    impact: 5,
    learningCollaboration: 5,
    comments: "",
  })

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get judge info from localStorage
        const id = localStorage.getItem("judgeId")
        const name = localStorage.getItem("judgeName")

        if (id) {
          setJudgeId(id)
          setJudgeName(name)

          // Get all projects from API
          const allProjects = await getProjects()
          // Filter finalist projects
          const finalistProjects = allProjects.filter((p) => p.isFinalist)
          setFinalists(finalistProjects)

          // Get already completed scores
          const response = await fetch(`/api/db/get-judge-scores?judgeId=${id}`)
          if (response.ok) {
            const data = await response.json()
            setCompletedScores(data.scores || [])
          }
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load project data. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userRole")
    localStorage.removeItem("judgeId")
    localStorage.removeItem("judgeName")

    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    })

    router.push("/")
  }

  const handleSubmitScore = async (projectId: string) => {
    if (!judgeId) return

    try {
      // Submit score via API
      const response = await fetch("/api/db/add-rubric-score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          judge_id: judgeId,
          project_id: projectId,
          originality: formData.originality,
          technical_complexity: formData.technicalComplexity,
          impact: formData.impact,
          learning_collaboration: formData.learningCollaboration,
          comments: formData.comments,
          timestamp: Date.now(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit score")
      }

      // Update completed scores
      const scoresResponse = await fetch(`/api/db/get-judge-scores?judgeId=${judgeId}`)
      if (scoresResponse.ok) {
        const data = await scoresResponse.json()
        setCompletedScores(data.scores || [])
      }

      // Reset form
      setFormData({
        originality: 5,
        technicalComplexity: 5,
        impact: 5,
        learningCollaboration: 5,
        comments: "",
      })

      toast({
        title: "Score submitted",
        description: "Your evaluation has been saved",
      })

      // Move to next tab if available
      const currentIndex = Number.parseInt(activeTab)
      if (currentIndex < finalists.length - 1) {
        setActiveTab((currentIndex + 1).toString())
      }
    } catch (error) {
      console.error("Error submitting score:", error)
      toast({
        title: "Error",
        description: "Failed to submit score. Please try again.",
        variant: "destructive"
      })
    }
  }

  const checkPhase = () => {
    const currentPhase = localStorage.getItem("currentPhase")
    if (currentPhase === "expo") {
      router.push("/judge/expo")
    }
  }

  useEffect(() => {
    // Check if phase has changed
    const interval = setInterval(checkPhase, 5000)
    return () => clearInterval(interval)
  }, [router])

  const isProjectScored = (projectId: string) => {
    return completedScores.some((score) => score.projectId === projectId)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <AuthGuard requiredRole="judge">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Panel Judging</h1>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-500">Welcome, {judgeName}</p>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          {finalists.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Finalist Projects</CardTitle>
                <CardDescription>Please evaluate each finalist project using the rubric below</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${finalists.length}, 1fr)` }}>
                    {finalists.map((project, index) => (
                      <TabsTrigger key={project.id} value={index.toString()}>
                        {project.name}
                        {isProjectScored(project.id.toString()) && " ✓"}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {finalists.map((project, index) => (
                    <TabsContent key={project.id} value={index.toString()}>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium">{project.name}</h3>
                          <p className="text-sm text-gray-500">Table #{project.tableNumber}</p>
                          <p className="mt-2">{project.description}</p>
                          <p className="mt-1 text-sm">Team: {project.teamMembers}</p>
                        </div>

                        <Separator />

                        {isProjectScored(project.id.toString()) ? (
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <p className="text-green-600 dark:text-green-400 font-medium">
                              You have already evaluated this project.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between mb-2">
                                  <label className="text-sm font-medium">Originality & Innovation (1-10)</label>
                                  <span className="text-sm font-medium">{formData.originality}</span>
                                </div>
                                <Slider
                                  value={[formData.originality]}
                                  min={1}
                                  max={10}
                                  step={1}
                                  onValueChange={(value) => setFormData({ ...formData, originality: value[0] })}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  How original and innovative is the project?
                                </p>
                              </div>

                              <div>
                                <div className="flex justify-between mb-2">
                                  <label className="text-sm font-medium">Technical Complexity (1-10)</label>
                                  <span className="text-sm font-medium">{formData.technicalComplexity}</span>
                                </div>
                                <Slider
                                  value={[formData.technicalComplexity]}
                                  min={1}
                                  max={10}
                                  step={1}
                                  onValueChange={(value) => setFormData({ ...formData, technicalComplexity: value[0] })}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  How technically complex and well-implemented is the project?
                                </p>
                              </div>

                              <div>
                                <div className="flex justify-between mb-2">
                                  <label className="text-sm font-medium">Impact (1-10)</label>
                                  <span className="text-sm font-medium">{formData.impact}</span>
                                </div>
                                <Slider
                                  value={[formData.impact]}
                                  min={1}
                                  max={10}
                                  step={1}
                                  onValueChange={(value) => setFormData({ ...formData, impact: value[0] })}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  What is the potential impact of this project?
                                </p>
                              </div>

                              <div>
                                <div className="flex justify-between mb-2">
                                  <label className="text-sm font-medium">Learning & Collaboration (1-10)</label>
                                  <span className="text-sm font-medium">{formData.learningCollaboration}</span>
                                </div>
                                <Slider
                                  value={[formData.learningCollaboration]}
                                  min={1}
                                  max={10}
                                  step={1}
                                  onValueChange={(value) =>
                                    setFormData({ ...formData, learningCollaboration: value[0] })
                                  }
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  How well did the team learn and collaborate during the hackathon?
                                </p>
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium">Comments</label>
                              <Textarea
                                className="mt-1"
                                placeholder="Enter your comments about this project..."
                                value={formData.comments}
                                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                              />
                            </div>

                            <Button className="w-full" onClick={() => handleSubmitScore(project.id.toString())}>
                              Submit Evaluation
                            </Button>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Finalist Projects</CardTitle>
                <CardDescription>
                  There are no finalist projects to judge yet. Please wait for the admin to select finalists.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500">Check back later or contact the hackathon organizers.</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </AuthGuard>
  )
}
