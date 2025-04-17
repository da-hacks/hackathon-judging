"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: "admin" | "judge"
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    const role = localStorage.getItem("userRole")

    // If not authenticated, redirect to login
    if (!isLoggedIn) {
      router.push("/")
      return
    }

    // If role is required and doesn't match, redirect
    if (requiredRole && role !== requiredRole) {
      if (role === "admin") {
        router.push("/admin/dashboard")
      } else if (role === "judge") {
        const currentPhase = localStorage.getItem("currentPhase") || "expo"
        router.push(currentPhase === "expo" ? "/judge/expo" : "/judge/panel")
      } else {
        router.push("/")
      }
      return
    }

    setIsAuthenticated(true)
    setIsLoading(false)
  }, [router, requiredRole])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <p className="mt-2 text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
