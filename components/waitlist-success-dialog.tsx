"use client"

import React, { useEffect } from "react"
import { CheckCircle } from "lucide-react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface WaitlistSuccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  email: string
}

export function WaitlistSuccessDialog({ open, onOpenChange, email }: WaitlistSuccessDialogProps) {
  // Auto-close after 10 seconds
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onOpenChange(false)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [open, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border/40 bg-card/30 backdrop-blur-sm">
        <DialogHeader className="flex items-center flex-col">
          <div className="bg-primary/10 p-3 rounded-full inline-flex mb-4">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <DialogTitle className="text-2xl bg-gradient-to-r from-blue-400 via-primary to-purple-500 bg-clip-text text-transparent">
            You're on the list!
          </DialogTitle>
          <DialogDescription className="text-center mt-2">
            Thank you for joining our waitlist. We're excited to have you as part of our journey!
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4 p-4 bg-background/50 rounded-lg border border-border/40">
          <p className="text-center text-sm mb-2">You'll be among the first to know when Teiden launches.</p>
        </div>
        
        {email && (
          <p className="text-sm text-center text-muted-foreground">
            Confirmation sent to <span className="font-medium">{email}</span>
          </p>
        )}
        
        <DialogFooter className="flex justify-center">
          <Button 
            onClick={() => onOpenChange(false)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Continue Exploring
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 