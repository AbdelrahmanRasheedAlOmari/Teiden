"use client"

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useProject } from '@/contexts/project-context';
import { Button } from '@/components/ui/button';
import { PlusCircle, FolderPlus, Folder, ChevronDown, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

// Define Project type
type Project = {
  id: string;
  name: string;
};

export function ProjectSelector() {
  const { selectedProject, setSelectedProject, projects, isLoading, refreshProjects } = useProject();
  const { user } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Handle project selection
  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
  };

  // Create new project placeholder
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast({
        title: 'Error',
        description: 'Project name is required',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    
    try {
      // Call the API to create a new project
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newProjectName.trim(),
          description: newProjectDescription.trim() || null,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create project');
      }
      
      // Close the dialog and reset form
      setNewProjectName('');
      setNewProjectDescription('');
      setShowCreateDialog(false);
      
      // Refresh projects list to include the new one
      await refreshProjects();
      
      toast({
        title: 'Success',
        description: `Project "${newProjectName}" created successfully`,
      });
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create project',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="h-9 px-3 gap-1 min-w-[180px] justify-between"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center text-sm">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </span>
            ) : selectedProject ? (
              <span className="flex items-center text-sm">
                <Folder className="mr-2 h-4 w-4" />
                {selectedProject.name}
              </span>
            ) : (
              <span className="text-muted-foreground text-sm">Select a project</span>
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[220px]">
          {projects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              className="flex justify-between items-center cursor-pointer"
              onClick={() => handleProjectSelect(project)}
            >
              <span className="flex items-center">
                <Folder className="mr-2 h-4 w-4" />
                {project.name}
              </span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex items-center cursor-pointer"
            onClick={() => setShowCreateDialog(true)}
          >
            <FolderPlus className="mr-2 h-4 w-4" />
            Create New Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="sm"
        className="h-9 px-2 text-xs"
        onClick={() => setShowCreateDialog(true)}
      >
        <PlusCircle className="h-3.5 w-3.5 mr-1" />
        <span>New Project</span>
      </Button>

      {/* Create Project Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Create a new project to organize your API keys
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                placeholder="My Project"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Project description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={!newProjectName.trim() || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
