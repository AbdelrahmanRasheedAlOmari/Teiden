import { ApiKeyManager } from "@/components/api-key-manager"

export default function ApiKeysPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">API Keys</h2>
        <p className="text-muted-foreground">
          Manage your API keys across different providers.
        </p>
      </div>
      <ApiKeyManager />
    </div>
  )
} 