import { AddApiKeyForm } from "@/components/add-api-key-form"

export default function AddApiKeyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Add API Key</h2>
        <p className="text-muted-foreground">Configure a new API key for your project.</p>
      </div>
      <AddApiKeyForm />
    </div>
  )
}
