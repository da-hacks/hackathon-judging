"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { AuthGuard } from "@/components/auth-guard"
import { LogOut } from "lucide-react"
import ProjectsTab from "@/components/admin/projects-tab"
import JudgesTab from "@/components/admin/judges-tab"
import RankingsTab from "@/components/admin/rankings-tab"
import SettingsTab from "@/components/admin/settings-tab"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("projects")
  const router = useRouter()
  const { toast } = useToast()
  const [currentPhase, setCurrentPhase] = useState("expo")

  useEffect(() => {
    // Get current phase from localStorage
    const phase = localStorage.getItem("currentPhase") || "expo"
    setCurrentPhase(phase)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userRole")

    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    })

    router.push("/")
  }

  const handlePhaseChange = (phase: string) => {
    localStorage.setItem("currentPhase", phase)
    setCurrentPhase(phase)

    toast({
      title: "Phase updated",
      description: `Judging phase changed to ${phase === "expo" ? "Expo Judging" : "Panel Judging"}`,
    })
  }

  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                <Button
                  variant={currentPhase === "expo" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handlePhaseChange("expo")}
                >
                  Expo Judging
                </Button>
                <Button
                  variant={currentPhase === "panel" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handlePhaseChange("panel")}
                >
                  Panel Judging
                </Button>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="judges">Judges</TabsTrigger>
              <TabsTrigger value="rankings">Rankings</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-4">
              <ProjectsTab />
            </TabsContent>

            <TabsContent value="judges" className="space-y-4">
              <JudgesTab />
            </TabsContent>

            <TabsContent value="rankings" className="space-y-4">
              <RankingsTab />
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <SettingsTab currentPhase={currentPhase} onPhaseChange={handlePhaseChange} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthGuard>
  )
}
