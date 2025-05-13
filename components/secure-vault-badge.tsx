import { Shield, Lock } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function SecureVaultBadge() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 rounded-full border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">
            <Shield className="h-3 w-3" />
            <span>Secure Vault</span>
            <Lock className="h-3 w-3" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[250px] text-xs">
          <p>All API keys are encrypted at rest and in transit using AES-256 encryption.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
