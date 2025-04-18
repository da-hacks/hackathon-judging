"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { getJudges } from "@/lib/db-client"

export default function JudgeLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [judges, setJudges] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Fetch judges on component mount
  useEffect(() => {
    const fetchJudges = async () => {
      try {
        const judgesList = await getJudges()
        setJudges(judgesList)
      } catch (error) {
        console.error("Failed to fetch judges:", error)
        toast({
          title: "Error",
          description: "Failed to load judge data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchJudges()
  }, [toast])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    if (loading) {
      toast({
        title: "Loading",
        description: "Please wait while judge data is being loaded",
      })
      return
    }

    const judge = judges.find((j) => j.email === email)

    // For demo purposes, using a simple password check
    if (judge && password === "judge123") {
      // Set judge session
      localStorage.setItem("userRole", "judge")
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("judgeId", judge.id)
      localStorage.setItem("judgeName", judge.name)

      toast({
        title: "Login successful",
        description: `Welcome, ${judge.name}`,
      })

      // Check current phase and redirect accordingly
      const currentPhase = localStorage.getItem("currentPhase") || "expo"
      if (currentPhase === "expo") {
        router.push("/judge/expo")
      } else {
        router.push("/judge/panel")
      }
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Judge Login</CardTitle>
          <CardDescription>Enter your credentials to access the judging interface</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/")}>
              Back
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Loading..." : "Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
