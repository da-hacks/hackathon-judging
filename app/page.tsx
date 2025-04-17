import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Hackathon Judge</CardTitle>
          <CardDescription>Pairwise comparison judging system for hackathons</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Link href="/login/admin" className="w-full">
              <Button variant="default" className="w-full">
                Login as Admin
              </Button>
            </Link>
            <Link href="/login/judge" className="w-full">
              <Button variant="outline" className="w-full">
                Login as Judge
              </Button>
            </Link>
          </div>
        </CardContent>
        <CardFooter className="text-center text-sm text-gray-500">
          Built with Next.js, TypeScript, and Tailwind CSS
        </CardFooter>
      </Card>
    </div>
  )
}
