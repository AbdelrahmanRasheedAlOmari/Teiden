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
  // Log immediately when props change
  useEffect(() => {
    console.log("WaitlistSuccessDialog props:", { open, email });
  }, [open, email]);

  // Auto-close after 20 seconds
  useEffect(() => {
    if (open) {
      console.log("WaitlistSuccessDialog is open, setting auto-close timer");
      const timer = setTimeout(() => {
        console.log("Auto-closing WaitlistSuccessDialog");
        onOpenChange(false);
      }, 20000);
      
      return () => {
        console.log("Clearing WaitlistSuccessDialog timer");
        clearTimeout(timer);
      };
    }
  }, [open, onOpenChange]);

  // Force the dialog to be visible even if state is inconsistent
  useEffect(() => {
    if (open && email) {
      // Force a rerender after a brief delay to ensure the dialog shows
      const forceTimer = setTimeout(() => {
        const dialogElement = document.querySelector('[role="dialog"]');
        if (!dialogElement) {
          console.log("Dialog element not found, forcing visibility");
          // Force the dialog to be visible by manually dispatching state change
          onOpenChange(false);
          setTimeout(() => onOpenChange(true), 10);
        } else {
          console.log("Dialog element is present in the DOM");
        }
      }, 200);
      
      return () => clearTimeout(forceTimer);
    }
  }, [open, email, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border/40 bg-card/80 backdrop-blur-lg shadow-xl animate-in fade-in-0 zoom-in-95 duration-300">
        <DialogHeader className="flex items-center flex-col">
          <div className="bg-primary/20 p-4 rounded-full inline-flex mb-4">
            <CheckCircle className="h-12 w-12 text-primary" />
          </div>
          <DialogTitle className="text-2xl bg-gradient-to-r from-blue-400 via-primary to-purple-500 bg-clip-text text-transparent font-bold">
            You're on the list!
          </DialogTitle>
          <DialogDescription className="text-center mt-2 text-base">
            Thank you for joining our waitlist. We're excited to have you as part of our journey!
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4 p-4 bg-background/80 rounded-lg border border-border/40">
          <p className="text-center text-sm mb-2">You'll be among the first to know when Teiden launches.</p>
        </div>
        
        {email && (
          <p className="text-sm text-center text-muted-foreground">
            Confirmation sent to <span className="font-medium">{email}</span>
          </p>
        )}
        
        <DialogFooter className="flex justify-center mt-4">
          <Button 
            onClick={() => onOpenChange(false)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6"
          >
            Continue Exploring
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 