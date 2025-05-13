"use client"

import type React from "react"

import { useState } from "react"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export function DemoForm() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    teamSize: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, teamSize: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.company || !formData.teamSize) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setFormData({
      name: "",
      email: "",
      company: "",
      teamSize: "",
      message: "",
    })

    toast({
      title: "Demo Request Received!",
      description: "Our team will contact you shortly to schedule your demo.",
      variant: "default",
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            className="border-border/60 bg-background/80 backdrop-blur-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Work Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="john@company.com"
            value={formData.email}
            onChange={handleChange}
            className="border-border/60 bg-background/80 backdrop-blur-sm"
          />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="company">Company Name</Label>
          <Input
            id="company"
            name="company"
            placeholder="Acme Inc."
            value={formData.company}
            onChange={handleChange}
            className="border-border/60 bg-background/80 backdrop-blur-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="teamSize">Team Size</Label>
          <Select value={formData.teamSize} onValueChange={handleSelectChange}>
            <SelectTrigger className="border-border/60 bg-background/80 backdrop-blur-sm">
              <SelectValue placeholder="Select team size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1-10 employees</SelectItem>
              <SelectItem value="11-50">11-50 employees</SelectItem>
              <SelectItem value="51-200">51-200 employees</SelectItem>
              <SelectItem value="201-500">201-500 employees</SelectItem>
              <SelectItem value="501+">501+ employees</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Additional Information (Optional)</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Tell us about your API usage and what you're looking for in a demo..."
          value={formData.message}
          onChange={handleChange}
          className="min-h-[100px] border-border/60 bg-background/80 backdrop-blur-sm"
        />
      </div>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        {isSubmitting ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
            Submitting...
          </>
        ) : (
          <>
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Demo
          </>
        )}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        By submitting this form, you agree to our{" "}
        <a href="#" className="underline hover:text-foreground">
          Privacy Policy
        </a>{" "}
        and{" "}
        <a href="#" className="underline hover:text-foreground">
          Terms of Service
        </a>
        .
      </p>
    </form>
  )
}
