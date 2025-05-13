"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { toast } from "@/hooks/use-toast"

type Project = {
  id: string
  name: string
  description?: string
  created_at?: string
  updated_at?: string
}

type ProjectContextType = {
  selectedProject: Project | null
  setSelectedProject: (project: Project | null) => void
  projects: Project[]
  isLoading: boolean
  refreshProjects: () => Promise<void>
}

// Default context value with empty projects array
const defaultContextValue: ProjectContextType = {
  selectedProject: null,
  setSelectedProject: () => {},
  projects: [],
  isLoading: false,
  refreshProjects: async () => {}
}

const ProjectContext = createContext<ProjectContextType>(defaultContextValue)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchProjects = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/projects')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch projects')
      }

      // Add the "All Projects" option at the beginning
      const allProjectsOption = { id: "all", name: "All Projects" }
      const projectsWithAll = [allProjectsOption, ...(data.projects || [])]
      
      setProjects(projectsWithAll)
      
      // If no project is selected yet, select "All Projects"
      if (!selectedProject) {
        setSelectedProject(allProjectsOption)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast({
        title: 'Error',
        description: 'Failed to load projects. Please refresh the page.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects()
  }, [])

  return (
    <ProjectContext.Provider 
      value={{ 
        selectedProject, 
        setSelectedProject, 
        projects, 
        isLoading,
        refreshProjects: fetchProjects
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider")
  }
  return context
}
