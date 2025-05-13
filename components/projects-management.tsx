"use client"

import { useState } from "react"
import { BarChart3, Edit2, Folders, MoreHorizontal, Plus, RefreshCw, Trash2, Users, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

export function ProjectsManagement() {
  const { toast } = useToast()
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false)
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [editProjectName, setEditProjectName] = useState("")
  const [selectedProject, setSelectedProject] = useState<any>(null)

  // Sample projects data
  const [projects, setProjects] = useState([
    {
      id: "1",
      name: "Main Project",
      apiKeys: 3,
      usage: "$2,345.67",
      members: 5,
      isDefault: true,
      createdAt: "2023-01-15",
    },
    {
      id: "2",
      name: "Mobile App",
      apiKeys: 2,
      usage: "$1,234.56",
      members: 3,
      isDefault: false,
      createdAt: "2023-03-22",
    },
    {
      id: "3",
      name: "Website Chatbot",
      apiKeys: 1,
      usage: "$567.89",
      members: 2,
      isDefault: false,
      createdAt: "2023-05-10",
    },
  ])

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Project name required",
        description: "Please enter a name for your project",
        variant: "destructive",
      })
      return
    }

    // Add new project to the list
    const newProject = {
      id: `${projects.length + 1}`,
      name: newProjectName,
      apiKeys: 0,
      usage: "$0.00",
      members: 1,
      isDefault: false,
      createdAt: new Date().toISOString().split("T")[0],
    }

    setProjects([...projects, newProject])

    toast({
      title: "Project created",
      description: `${newProjectName} has been created successfully`,
    })

    setNewProjectName("")
    setIsCreateProjectOpen(false)
  }

  const handleEditProject = () => {
    if (!editProjectName.trim()) {
      toast({
        title: "Project name required",
        description: "Please enter a name for your project",
        variant: "destructive",
      })
      return
    }

    // Update project in the list
    const updatedProjects = projects.map((project) =>
      project.id === selectedProject.id ? { ...project, name: editProjectName } : project,
    )

    setProjects(updatedProjects)

    toast({
      title: "Project updated",
      description: `Project has been renamed to ${editProjectName}`,
    })

    setEditProjectName("")
    setIsEditProjectOpen(false)
  }

  const handleDeleteProject = () => {
    // Remove project from the list
    const updatedProjects = projects.filter((project) => project.id !== selectedProject.id)

    setProjects(updatedProjects)

    toast({
      title: "Project deleted",
      description: `${selectedProject.name} has been deleted`,
    })

    setIsDeleteProjectOpen(false)
  }

  const openEditDialog = (project: any) => {
    setSelectedProject(project)
    setEditProjectName(project.name)
    setIsEditProjectOpen(true)
  }

  const openDeleteDialog = (project: any) => {
    setSelectedProject(project)
    setIsDeleteProjectOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">Organize your API usage by different initiatives or teams</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs text-muted-foreground">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            className="h-8 gap-1 bg-gradient-to-r from-blue-600 to-purple-600 text-xs hover:from-blue-700 hover:to-purple-700"
            onClick={() => setIsCreateProjectOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Project</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="overflow-hidden border-border/40 bg-card/30 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  {project.name}
                  {project.isDefault && (
                    <Badge variant="outline" className="border-primary/20 text-primary">
                      Default
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>Created on {project.createdAt}</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEditDialog(project)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    <span>Rename</span>
                  </DropdownMenuItem>
                  {!project.isDefault && (
                    <DropdownMenuItem>
                      <Folders className="mr-2 h-4 w-4" />
                      <span>Set as Default</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {!project.isDefault && (
                    <DropdownMenuItem
                      onClick={() => openDeleteDialog(project)}
                      className="text-red-500 focus:text-red-500"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 py-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Key className="h-4 w-4 text-primary" />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">API Keys</p>
                  <p className="font-medium">{project.apiKeys}</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Usage</p>
                  <p className="font-medium">{project.usage}</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10">
                    <Users className="h-4 w-4 text-purple-500" />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Members</p>
                  <p className="font-medium">{project.members}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/40 bg-card/30 px-6 py-4">
              <Button variant="outline" className="w-full">
                View Project
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Create Project Dialog */}
      <Dialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Projects help you organize your API usage and credits by different initiatives or teams.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="Enter project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateProjectOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={isEditProjectOpen} onOpenChange={setIsEditProjectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
            <DialogDescription>Change the name of your project.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-project-name">Project Name</Label>
              <Input
                id="edit-project-name"
                placeholder="Enter project name"
                value={editProjectName}
                onChange={(e) => setEditProjectName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProjectOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditProject}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Dialog */}
      <Dialog open={isDeleteProjectOpen} onOpenChange={setIsDeleteProjectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground">
              Deleting <span className="font-medium text-foreground">{selectedProject?.name}</span> will remove all
              associated data, including API key assignments and usage history.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteProjectOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject}>
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
