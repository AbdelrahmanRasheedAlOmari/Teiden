"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Check, Copy, Eye, EyeOff, Folders, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"

export function AddApiKeyForm() {
  const { toast } = useToast()
  const router = useRouter()
  const [apiKey, setApiKey] = useState("")
  const [provider, setProvider] = useState("")
  const [name, setName] = useState("")
  const [project, setProject] = useState("")
  const [newProjectName, setNewProjectName] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("manual")
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // State for storing fetched projects
  const [projects, setProjects] = useState<{value: string, label: string}[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)

  // Fetch projects on component mount
  useEffect(() => {
    async function fetchProjects() {
      setIsLoadingProjects(true)
      try {
        const response = await fetch('/api/projects')
        const data = await response.json()

        if (response.ok) {
          // Map the projects to the format needed for the dropdown
          const projectOptions = data.projects.map((project: any) => ({
            value: project.id,
            label: project.name
          }))
          setProjects(projectOptions)
        } else {
          console.error('Failed to fetch projects:', data.error)
          toast({
            title: "Error",
            description: "Failed to load projects. Using defaults.",
            variant: "destructive",
          })
          // Fallback to default projects
          setProjects([
            { value: "main", label: "Main Project" },
            { value: "mobile", label: "Mobile App" },
            { value: "chatbot", label: "Website Chatbot" },
          ])
        }
      } catch (error) {
        console.error('Error fetching projects:', error)
        // Fallback to default projects on error
        setProjects([
          { value: "main", label: "Main Project" },
          { value: "mobile", label: "Mobile App" },
          { value: "chatbot", label: "Website Chatbot" },
        ])
      } finally {
        setIsLoadingProjects(false)
      }
    }

    fetchProjects()
  }, [])

  const handleCopyClick = () => {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!apiKey || !provider || !name) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      })
      return
    }

    if (project === "create-new" && !newProjectName.trim()) {
      toast({
        title: "Missing Project Name",
        description: "Please enter a name for your new project.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      let projectId = project;
      
      // If creating a new project, create it first
      if (project === "create-new") {
        const projectResponse = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newProjectName.trim(),
            description: `Project created for ${provider} key: ${name}`
          }),
        });

        if (!projectResponse.ok) {
          const projectData = await projectResponse.json();
          throw new Error(projectData.error || 'Failed to create new project');
        }

        const projectResult = await projectResponse.json();
        projectId = projectResult.project.id;
      }
      
      // Now add the API key with the correct project ID
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          key: apiKey,
          name,
          project: projectId
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add API key')
      }

      const projectDisplay = project === "create-new" 
        ? ` in new project "${newProjectName}"` 
        : project ? ` in project ${project}` : ""

      toast({
        title: "API Key Added Successfully!",
        description: `Your ${provider} API key has been securely stored${projectDisplay}.`,
        variant: "default",
      })

      // Reset form
      setApiKey("")
      setName("")
      setNewProjectName("")
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      console.error('Error adding API key:', err)
      setError(err.message || 'An error occurred while adding the API key')
      toast({
        title: "Error",
        description: err.message || 'Failed to add API key',
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const providers = [
    { value: "openai", label: "OpenAI", logo: "/images/openai-logo.webp" },
    { value: "anthropic", label: "Anthropic", logo: "/images/claude-logo.webp" },
    { value: "mistral", label: "Mistral AI", logo: "/images/mistral-logo.webp" },
    { value: "meta", label: "Meta AI", logo: "/images/meta-logo.webp" },
  ]

  return (
    <Card className="overflow-hidden border-border/40 bg-card/30 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Connect API Provider</CardTitle>
            <CardDescription>Add your API keys to start managing your usage</CardDescription>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Key className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Setup</TabsTrigger>
            <TabsTrigger value="automatic">Automatic Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-destructive/15 text-destructive rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="provider">API Provider</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger className="border-border/60 bg-background/80 backdrop-blur-sm">
                    <SelectValue placeholder="Select provider">
                      {provider && (
                        <div className="flex items-center gap-2">
                          {providers.find(p => p.value === provider)?.logo ? (
                            <div className="flex h-5 w-5 items-center justify-center rounded-md overflow-hidden">
                              <img 
                                src={providers.find(p => p.value === provider)?.logo || ""} 
                                alt={providers.find(p => p.value === provider)?.label} 
                                className="h-full w-full object-contain" 
                              />
                            </div>
                          ) : null}
                          <span>{providers.find(p => p.value === provider)?.label}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        <div className="flex items-center gap-2">
                          {provider.logo ? (
                            <div className="flex h-5 w-5 items-center justify-center rounded-md overflow-hidden">
                              <img src={provider.logo} alt={provider.label} className="h-full w-full object-contain" />
                            </div>
                          ) : null}
                          <span>{provider.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Select the AI service provider you want to connect</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Key Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Production OpenAI Key"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-border/60 bg-background/80 backdrop-blur-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Give this API key a memorable name for easy identification
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Select value={project} onValueChange={(value) => {
                  setProject(value);
                  setIsCreatingNew(value === "create-new");
                }}>
                  <SelectTrigger className="border-border/60 bg-background/80 backdrop-blur-sm">
                    <SelectValue placeholder="Assign to a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.value} value={project.value}>
                        {project.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="create-new">Create New Project</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Assign this API key to a specific project
                </p>
              </div>

              {isCreatingNew && (
                <div className="space-y-2">
                  <Label htmlFor="newProjectName">New Project Name</Label>
                  <Input
                    id="newProjectName"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="border-border/60 bg-background/80 backdrop-blur-sm"
                    placeholder="Enter new project name"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <div className="flex">
                  <div className="relative flex-grow">
                    <Input
                      id="apiKey"
                      type={showKey ? "text" : "password"}
                      placeholder="Enter your API key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="border-border/60 bg-background/80 pr-10 backdrop-blur-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transform text-muted-foreground hover:text-foreground"
                    >
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="ml-2 border-border/60"
                    onClick={handleCopyClick}
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Your API key is securely stored and encrypted</p>
              </div>

              <div className="rounded-md bg-primary/5 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Key className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-primary">Security Note</h3>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p>
                        Your API keys are encrypted before being stored in our database. We never share your keys with
                        third parties, and they are only used to monitor your usage patterns for analytics, forecasting, and optimization recommendations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="automatic" className="min-h-[300px]">
            <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <Key className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium">Automatic API Key Setup</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Connect directly to your AI provider accounts for seamless API key management. This feature is coming
                soon.
              </p>
              <Button variant="outline" disabled className="mt-4">
                Coming Soon
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t border-border/40 bg-card/30 px-6 py-4">
        <Button variant="outline" onClick={() => router.push('/dashboard')}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
              <span>Adding...</span>
            </>
          ) : (
            <>
              <Key className="mr-2 h-4 w-4" />
              <span>Add API Key</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
