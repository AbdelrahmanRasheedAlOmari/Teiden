import { DashboardLayout } from "@/components/dashboard-layout"
import { EmailNotificationForm } from "@/components/email-notification-form"

export default function NotificationsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Agent Notifications</h2>
          <p className="text-muted-foreground">Configure how your AI agents communicate with you</p>
        </div>

        <EmailNotificationForm />
      </div>
    </DashboardLayout>
  )
}
