"use client"

import type React from "react"

import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { WaitlistSuccessDialog } from "@/components/waitlist-success-dialog"

interface WaitlistFormProps {
  large?: boolean
}

export function WaitlistForm({ large = false }: WaitlistFormProps) {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address to join the waitlist.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Call the API endpoint to save the email
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // Save the email for the success dialog and clear the form
      setSubmittedEmail(email);
      setEmail("");
      
      // Show success dialog instead of toast
      setShowSuccessDialog(true);
    } catch (error) {
      // Show error message
      toast({
        title: "Oops!",
        description: error instanceof Error ? error.message : "Failed to join the waitlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (large) {
    return (
      <>
        <form onSubmit={handleSubmit} className="mx-auto max-w-md">
          <div className="flex flex-col gap-4">
            <Input
              type="email"
              placeholder="Enter your work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 border-border/60 bg-background/80 text-base backdrop-blur-sm"
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-base hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                  Joining...
                </>
              ) : (
                <>
                  Join 50+ teams optimizing API costs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
          <p className="mt-2 text-xs text-center text-muted-foreground">
            By joining, you agree to receive updates about Teiden.
          </p>
        </form>
        
        <WaitlistSuccessDialog
          open={showSuccessDialog}
          onOpenChange={setShowSuccessDialog}
          email={submittedEmail}
        />
      </>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          placeholder="Enter your work email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-border/60 bg-background/80 backdrop-blur-sm"
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
              Joining...
            </>
          ) : (
            "Join waitlist"
          )}
        </Button>
      </form>
      
      <WaitlistSuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        email={submittedEmail}
      />
    </>
  )
}
