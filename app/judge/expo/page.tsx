"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AuthGuard } from "@/components/auth-guard"
import { getNextPairForJudge, addComparison, type Project } from "@/lib/data"

export default function JudgeExpo() {
  const [judgeId, setJudgeId] = useState<string | null>(null)
  const [judgeName, setJudgeName] = useState<string | null>(null)
  const [projectPair, setProjectPair] = useState<{ projectA: Project; projectB: Project } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Get judge info from localStorage
    const id = localStorage.getItem("judgeId")
    const name = localStorage.getItem("judgeName")

    if (id) {
      setJudgeId(id)
      setJudgeName(name)

      // Get next pair to judge
      const pair = getNextPairForJudge(id)
      setProjectPair(pair)
    }

    setLoading(false)
  }, [])

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

  const handleSelectWinner = (winnerId: string) => {
    if (!judgeId || !projectPair) return

    // Record the comparison
    addComparison({
      judgeId,
      projectAId: projectPair.projectA.id,
      projectBId: projectPair.projectB.id,
      winnerId,
    })

    toast({
      title: "Comparison recorded",
      description: "Your selection has been saved",
    })

    // Get next pair
    const nextPair = getNextPairForJudge(judgeId)
    setProjectPair(nextPair)
  }

  const checkPhase = () => {
    const currentPhase = localStorage.getItem("currentPhase")
    if (currentPhase === "panel") {
      router.push("/judge/panel")
    }
  }

  useEffect(() => {
    // Check if phase has changed
    const interval = setInterval(checkPhase, 5000)
    return () => clearInterval(interval)
  }, [router])

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
            <h1 className="text-2xl font-bold">Expo Judging</h1>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-500">Welcome, {judgeName}</p>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          {projectPair ? (
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>{projectPair.projectA.name}</CardTitle>
                  <CardDescription>Table #{projectPair.projectA.tableNumber}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{projectPair.projectA.description}</p>
                  <Separator className="my-4" />
                  <p className="text-sm font-medium">Team Members:</p>
                  <p className="text-sm">{projectPair.projectA.teamMembers}</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => handleSelectWinner(projectPair.projectA.id)}>
                    Select This Project
                  </Button>
                </CardFooter>
              </Card>

              <Card className="h-full">
                <CardHeader>
                  <CardTitle>{projectPair.projectB.name}</CardTitle>
                  <CardDescription>Table #{projectPair.projectB.tableNumber}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{projectPair.projectB.description}</p>
                  <Separator className="my-4" />
                  <p className="text-sm font-medium">Team Members:</p>
                  <p className="text-sm">{projectPair.projectB.teamMembers}</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => handleSelectWinner(projectPair.projectB.id)}>
                    Select This Project
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No More Projects to Judge</CardTitle>
                <CardDescription>
                  You have judged all available project pairs. Please wait for the admin to assign more projects or
                  change the judging phase.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500">Thank you for your contributions to the judging process!</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </AuthGuard>
  )
}
