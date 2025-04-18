"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getProjects, addProject } from "@/lib/db-client"

// Define the Project type
export type Project = {
  id: number;
  name: string;
  description: string;
  teamMembers: string;
  tableNumber: number;
  isFinalist: boolean;
}

export default function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    team_members: "",
    table_number: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true)
        const data = await getProjects()
        setProjects(data)
      } catch (error) {
        console.error('Error loading projects:', error)
        toast({
          title: "Error",
          description: "Failed to load projects. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadProjects()
  }, [toast])

  const handleAddProject = async () => {
    try {
      await addProject({
        name: formData.name,
        description: formData.description,
        team_members: formData.team_members,
        table_number: formData.table_number,
      })

      // Refresh the project list
      const updatedProjects = await getProjects()
      setProjects(updatedProjects)
      setIsAddDialogOpen(false)
      resetForm()

      toast({
        title: "Project added",
        description: `${formData.name} has been added successfully`,
      })
    } catch (error) {
      console.error('Error adding project:', error)
      toast({
        title: "Error",
        description: "Failed to add project. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleEditProject = async () => {
    if (!currentProject) return

    try {
      // Use the API route to update the project
      await fetch(`/api/db/update-project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: currentProject.id,
          name: formData.name,
          description: formData.description,
          team_members: formData.team_members,
          table_number: formData.table_number,
        }),
      })

      // Refresh the project list
      const updatedProjects = await getProjects()
      setProjects(updatedProjects)
      setIsEditDialogOpen(false)
      resetForm()

      toast({
        title: "Project updated",
        description: `${formData.name} has been updated successfully`,
      })
    } catch (error) {
      console.error('Error updating project:', error)
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleDeleteProject = async () => {
    if (!currentProject) return

    try {
      // Use the API route to delete the project
      await fetch(`/api/db/delete-project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: currentProject.id,
        }),
      })

      // Refresh the project list
      const updatedProjects = await getProjects()
      setProjects(updatedProjects)
      setIsDeleteDialogOpen(false)

      toast({
        title: "Project deleted",
        description: `${currentProject.name} has been deleted successfully`,
      })
    } catch (error) {
      console.error('Error deleting project:', error)
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive"
      })
    }
  }

  const openEditDialog = (project: Project) => {
    setCurrentProject(project)
    setFormData({
      name: project.name,
      description: project.description,
      team_members: project.teamMembers,
      table_number: project.tableNumber,
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (project: Project) => {
    setCurrentProject(project)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      team_members: "",
      table_number: 0,
    })
    setCurrentProject(null)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Projects</CardTitle>
          <CardDescription>Manage hackathon projects</CardDescription>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center">Loading projects...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Table #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No projects found. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{project.teamMembers}</TableCell>
                    <TableCell>{project.tableNumber}</TableCell>
                    <TableCell>
                      {project.isFinalist ? (
                        <Badge variant="default">Finalist</Badge>
                      ) : (
                        <Badge variant="outline">Regular</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(project)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(project)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Add Project Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
            <DialogDescription>Enter the details of the new project.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="team-members">Team Members</Label>
              <Input
                id="team-members"
                value={formData.team_members}
                onChange={(e) => setFormData({ ...formData, team_members: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="table-number">Table Number</Label>
              <Input
                id="table-number"
                type="number"
                min="1"
                value={formData.table_number.toString()}
                onChange={(e) =>
                  setFormData({ ...formData, table_number: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProject}>Add Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update the project details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Project Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-team-members">Team Members</Label>
              <Input
                id="edit-team-members"
                value={formData.team_members}
                onChange={(e) => setFormData({ ...formData, team_members: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-table-number">Table Number</Label>
              <Input
                id="edit-table-number"
                type="number"
                min="1"
                value={formData.table_number.toString()}
                onChange={(e) =>
                  setFormData({ ...formData, table_number: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditProject}>Update Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
