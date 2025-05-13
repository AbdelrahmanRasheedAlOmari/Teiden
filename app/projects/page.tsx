import { DashboardLayout } from "@/components/dashboard-layout"
import { ProjectsManagement } from "@/components/projects-management"

export default function ProjectsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">Manage your projects and their API keys.</p>
        </div>
        <ProjectsManagement />
      </div>
    </DashboardLayout>
  )
}
