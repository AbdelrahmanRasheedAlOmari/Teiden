import { DashboardLayout } from "@/components/dashboard-layout"
import { AIAgentsSection } from "@/components/ai-agents-section"

export default function AgentsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Agents</h2>
          <p className="text-muted-foreground">Manage your AI agents and their configurations.</p>
        </div>
        <AIAgentsSection />
      </div>
    </DashboardLayout>
  )
}
