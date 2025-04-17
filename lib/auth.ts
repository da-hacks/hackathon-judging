"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function useAuth(requiredRole?: "admin" | "judge") {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    const role = localStorage.getItem("userRole")

    setIsAuthenticated(isLoggedIn)
    setUserRole(role)

    // If not authenticated, redirect to login
    if (!isLoggedIn) {
      router.push("/")
    }
    // If role is required and doesn't match, redirect
    else if (requiredRole && role !== requiredRole) {
      if (role === "admin") {
        router.push("/admin/dashboard")
      } else if (role === "judge") {
        const currentPhase = localStorage.getItem("currentPhase") || "expo"
        router.push(currentPhase === "expo" ? "/judge/expo" : "/judge/panel")
      } else {
        router.push("/")
      }
    }

    setIsLoading(false)
  }, [router, requiredRole])

  const logout = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userRole")
    localStorage.removeItem("judgeId")
    localStorage.removeItem("judgeName")
    setIsAuthenticated(false)
    setUserRole(null)
    router.push("/")
  }

  return { isLoading, isAuthenticated, userRole, logout }
}
