"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getJudges, addJudge, deleteJudge } from "@/lib/db-client"

// Judge type definition
export type Judge = {
  id: number;
  name: string;
  email: string;
}

export default function JudgesTab() {
  const [judges, setJudges] = useState<Judge[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentJudge, setCurrentJudge] = useState<Judge | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })
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
          description: "Failed to load judges. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchJudges()
  }, [toast])

  const handleAddJudge = async () => {
    try {
      const newJudge = await addJudge({
        name: formData.name,
        email: formData.email,
      })

      // Refresh judges list
      const updatedJudges = await getJudges()
      setJudges(updatedJudges)
      
      setIsAddDialogOpen(false)
      resetForm()

      toast({
        title: "Judge added",
        description: `${formData.name} has been added successfully`,
      })
    } catch (error) {
      console.error("Failed to add judge:", error)
      toast({
        title: "Error",
        description: "Failed to add judge. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteJudge = async () => {
    if (!currentJudge) return

    try {
      await deleteJudge(currentJudge.id)
      
      // Refresh judges list
      const updatedJudges = await getJudges()
      setJudges(updatedJudges)
      
      setIsDeleteDialogOpen(false)

      toast({
        title: "Judge deleted",
        description: `${currentJudge.name} has been deleted successfully`,
      })
    } catch (error) {
      console.error("Failed to delete judge:", error)
      toast({
        title: "Error",
        description: "Failed to delete judge. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openDeleteDialog = (judge: Judge) => {
    setCurrentJudge(judge)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
    })
    setCurrentJudge(null)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Judges</CardTitle>
          <CardDescription>Manage hackathon judges</CardDescription>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Judge
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading judges...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {judges.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">No judges found</TableCell>
                </TableRow>
              ) : (
                judges.map((judge) => (
                  <TableRow key={judge.id}>
                    <TableCell className="font-medium">{judge.name}</TableCell>
                    <TableCell>{judge.email}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(judge)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Add Judge Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Judge</DialogTitle>
            <DialogDescription>Enter the details of the new judge.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Judge Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddJudge}>Add Judge</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Judge Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Judge</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this judge? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteJudge}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
