"use client"

import { CreditCard, Download, Plus, Receipt, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export function BillingContent() {
  return (
    <div className="space-y-6 w-full max-w-none">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Billing</h2>
          <p className="text-muted-foreground">Manage your billing information and view invoices</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs text-muted-foreground">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            className="h-8 gap-1 bg-gradient-to-r from-blue-600 to-purple-600 text-xs hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Payment Method</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Your current subscription plan and usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Growth Plan</h3>
                <p className="text-sm text-muted-foreground">$599/month</p>
              </div>
              <Badge className="bg-primary">Active</Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Billing Period</span>
                <span>May 1, 2025 - May 31, 2025</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Next Invoice</span>
                <span>June 1, 2025</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="flex items-center gap-1">
                  <CreditCard className="h-3.5 w-3.5" />
                  Visa ending in 4242
                </span>
              </div>
            </div>

            <div className="space-y-2 rounded-md border border-border/40 bg-background/50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">API Usage This Month</span>
                <span>68% of included credits</span>
              </div>
              <Progress value={68} className="h-1.5" />
              <p className="text-xs text-muted-foreground">$8,500 of $12,500 included credits used</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border/40 bg-card/30 px-6 py-4">
            <Button variant="outline">Change Plan</Button>
            <Button variant="default">Manage Payment Methods</Button>
          </CardFooter>
        </Card>

        <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Usage Summary</CardTitle>
            <CardDescription>Current billing cycle usage breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">OpenAI</div>
                  <div className="text-xs text-muted-foreground">GPT-4o, GPT-3.5 Turbo</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">$4,235.67</div>
                  <div className="text-xs text-muted-foreground">49.8% of total</div>
                </div>
              </div>
              <Progress value={49.8} className="h-1.5" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Anthropic</div>
                  <div className="text-xs text-muted-foreground">Claude 3 Opus, Claude 3 Sonnet</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">$2,845.22</div>
                  <div className="text-xs text-muted-foreground">33.5% of total</div>
                </div>
              </div>
              <Progress value={33.5} className="h-1.5" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Mistral AI</div>
                  <div className="text-xs text-muted-foreground">Mistral Large, Mistral Small</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">$1,419.11</div>
                  <div className="text-xs text-muted-foreground">16.7% of total</div>
                </div>
              </div>
              <Progress value={16.7} className="h-1.5" />
            </div>
          </CardContent>
          <CardFooter className="border-t border-border/40 bg-card/30 px-6 py-4">
            <Button variant="outline" className="w-full gap-2">
              <Download className="h-4 w-4" />
              <span>Download Usage Report</span>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View and download your past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/40">
            <div className="grid grid-cols-5 border-b border-border/40 bg-muted/30 px-4 py-2 text-sm font-medium">
              <div>Date</div>
              <div>Invoice</div>
              <div>Amount</div>
              <div>Status</div>
              <div className="text-right">Actions</div>
            </div>
            <div className="divide-y divide-border/40">
              {[
                { date: "May 1, 2025", invoice: "INV-2025-005", amount: "$599.00", status: "Paid" },
                { date: "Apr 1, 2025", invoice: "INV-2025-004", amount: "$599.00", status: "Paid" },
                { date: "Mar 1, 2025", invoice: "INV-2025-003", amount: "$599.00", status: "Paid" },
                { date: "Feb 1, 2025", invoice: "INV-2025-002", amount: "$599.00", status: "Paid" },
                { date: "Jan 1, 2025", invoice: "INV-2025-001", amount: "$599.00", status: "Paid" },
              ].map((invoice, i) => (
                <div key={i} className="grid grid-cols-5 items-center px-4 py-3 text-sm">
                  <div>{invoice.date}</div>
                  <div>{invoice.invoice}</div>
                  <div>{invoice.amount}</div>
                  <div>
                    <Badge variant="outline" className="border-green-500/20 bg-green-500/10 text-green-500">
                      {invoice.status}
                    </Badge>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Receipt className="h-3.5 w-3.5" />
                      <span className="sr-only">View Invoice</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Download className="h-3.5 w-3.5" />
                      <span className="sr-only">Download Invoice</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
