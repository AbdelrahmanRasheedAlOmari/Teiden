"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  AlertTriangle,
  Globe,
  Shield,
  LineChart,
  BarChart3,
  Bot,
  ChevronDown,
  Eye,
  ShoppingCart,
  Key,
  Folders,
  X,
  Activity,
  BellRing,
  Twitter,
  Github,
  Linkedin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WaitlistForm } from "@/components/waitlist-form"
import { LandingNavbar } from "@/components/landing-navbar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useInView } from "framer-motion"
import { ScrollAnimation, StaggeredAnimation } from "@/components/scroll-animation"

export function LandingPage() {
  const [pricingTab, setPricingTab] = useState("monthly")
  const agentNetworkRef = useRef<HTMLDivElement | null>(null);
  const isIntersecting = useInView(agentNetworkRef, {
    once: false,
    amount: 0.1,
  });

  // Errors data for the visualization
  const apiErrors = [
    { provider: "OpenAI", error: "429 - Rate limit reached for requests", details: "Cause: You are sending requests too quickly.\nSolution: Pace your requests. Read the Rate limit guide." },
    { provider: "OpenAI", error: "429 - You exceeded your current quota", details: "Cause: You have run out of credits or hit your maximum monthly spend.\nSolution: Buy more credits or learn how to increase your limits." },
    { provider: "OpenAI", error: "500 - The server had an error while processing your request", details: "Cause: Issue on our servers.\nSolution: Retry your request after a brief wait and contact us if the issue persists." },
    { provider: "Anthropic", error: "413 - request_too_large", details: "Request exceeds the maximum allowed number of bytes." },
    { provider: "Anthropic", error: "429 - rate_limit_error", details: "Your account has hit a rate limit." },
    { provider: "Anthropic", error: "500 - api_error", details: "An unexpected error has occurred internal to Anthropic's systems." },
    { provider: "Anthropic", error: "529 - overloaded_error", details: "Anthropic's API is temporarily overloaded." },
  ];

  // State for controlling animation
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const errorContainerRef = useRef<HTMLDivElement>(null);

  // Handle mouse movement to create interactive effect
  const handleContainerMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!errorContainerRef.current) return;
    
    const rect = errorContainerRef.current.getBoundingClientRect();
    setMousePosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNavbar />

      <main className="flex-1">
        {/* Hero Section with content aligned to the left edge and error visualization on the right */}
        <section 
          className="relative overflow-hidden border-b border-border/40 bg-background pb-24 pt-28 md:pb-32 md:pt-36 lg:pb-40 lg:pt-32"
        >
          {/* Enhanced background gradients with theme support */}
          <div className="absolute inset-0 -z-10 h-full w-full dark:bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.2),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(138,92,246,0.15),transparent_50%)] bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.05),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(138,92,246,0.03),transparent_50%)]"></div>
          
          {/* Decorative elements */}
          <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full dark:bg-primary/10 bg-primary/3 blur-3xl"></div>
          <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full dark:bg-purple-500/10 bg-purple-500/3 blur-3xl"></div>
          
          <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2 items-center">
              {/* Left side content */}
              <div className="text-left max-w-xl">
                <h1 className="bg-gradient-to-r from-blue-400 via-primary to-purple-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl leading-[1.2] pb-2">
                  Never Experience an API Outage Again
                </h1>
                <p className="mt-6 text-xl text-muted-foreground">
                  Teiden is the all-in-one platform for managing AI APIs. Our intelligent agents forecast usage, prevent outages, and automate credit purchases before they happen.
                </p>
                <div className="mt-10 max-w-md">
                  <WaitlistForm />
                </div>
                <div className="mt-8 flex flex-wrap gap-x-6 gap-y-4">
                  <div className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">Predictive usage forecasting</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">Automated credit top-ups</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">Per-project cost tracking</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">Multi-provider support</span>
                  </div>
                </div>
              </div>
              
              {/* Right side - Error visualization with theme support */}
              <div 
                ref={errorContainerRef}
                onMouseMove={handleContainerMouseMove}
                className="relative h-[500px] rounded-xl border border-border/40 dark:bg-black/70 bg-slate-100/40 backdrop-blur-sm overflow-hidden font-mono hidden md:block shadow-md"
              >
                <div className="absolute top-0 left-0 w-full p-2 dark:bg-[#282C34] bg-[#1E1E1E] text-white text-xs flex items-center">
                  <div className="flex space-x-1.5 mr-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span>python3 api_client.py</span>
                </div>
                
                <div className="p-4 pt-10 text-sm h-full overflow-hidden">
                  {/* Python-style errors with continuous animations */}
                  {apiErrors.map((error, index) => {
                    // Generate base positions with wider spread
                    const baseX = 20 + ((index * 150) % 400);
                    const baseY = 50 + ((index * 100) % 350);
                    
                    // Calculate distance from mouse to message
                    const distance = errorContainerRef.current ? 
                      Math.sqrt(
                        Math.pow(mousePosition.x - baseX, 2) + 
                        Math.pow(mousePosition.y - baseY, 2)
                      ) : 1000;
                    
                    // Spotlight effect
                    const spotlightRange = 200;
                    const isVisible = distance < spotlightRange;
                    const opacity = isVisible ? 
                      Math.max(0.4, 1 - (distance / spotlightRange)) : 0.4;
                    
                    const color = error.provider === "OpenAI" ? "#10A37F" : "#A551FF";
                    const animationClass = `animate-float-${(index % 5) + 1}`;
                    
                    return (
                      <div 
                        key={index}
                        className={`absolute text-sm rounded py-2 px-3 transition-all duration-200 ${animationClass} dark:text-white text-slate-800`}
                        style={{
                          left: `${baseX}px`,
                          top: `${baseY}px`,
                          opacity: opacity,
                          transform: `scale(${isVisible ? 1.05 : 0.95})`,
                          backgroundColor: `${color}${isVisible ? '20' : '10'}`,
                          border: `1px solid ${color}${isVisible ? '50' : '30'}`,
                          maxWidth: "300px",
                          zIndex: isVisible ? 10 : 1,
                          boxShadow: isVisible ? `0 0 15px 0 ${color}30` : 'none'
                        }}
                      >
                        <div className="flex items-start mb-1">
                          <span className="font-semibold" style={{ color }}>
                            {'>>'} {error.provider}Error:
                          </span>
                        </div>
                        <div className="dark:text-red-400 text-red-600 mb-1 font-semibold">
                          {error.error}
                        </div>
                        <div className="dark:text-gray-400 text-slate-600 whitespace-pre-line text-xs">
                          {error.details}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Command cursor blinking effect */}
                  <div className="absolute bottom-4 left-4 flex items-center dark:text-green-400 text-green-600">
                    <span>{'>>'} </span>
                    <span className="ml-1 animate-pulse">▋</span>
                  </div>
                </div>
                
                {/* Improved spotlight effect */}
                <div 
                  className="absolute pointer-events-none"
                  style={{
                    left: `${mousePosition.x - 100}px`,
                    top: `${mousePosition.y - 100}px`,
                    width: '200px',
                    height: '200px',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                    borderRadius: '50%',
                    filter: 'blur(8px)',
                    transition: 'left 0.1s, top 0.1s',
                    zIndex: 5
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section - WITH ANIMATIONS */}
        <section id="how-it-works" className="border-b border-border/40 py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollAnimation animation="fade-in" className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                How It Works
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Proactive API Reliability Management</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Teiden's network of specialized AI agents work together to monitor your API usage, predict potential
                outages, and ensure continuous service availability.
              </p>
            </ScrollAnimation>

            <ScrollAnimation 
              animation="slide-up" 
              className="relative mt-20 rounded-xl border border-border/40 bg-card/30 p-8 backdrop-blur-sm"
              delay={200}
            >
              <div className="grid gap-8 md:grid-cols-3">
                {[
                  {
                    icon: <Bot className="h-6 w-6 text-primary" />,
                    title: "Monitoring Agent",
                    description: "Continuously tracks API usage and health across all your services in real-time",
                  },
                  {
                    icon: <LineChart className="h-6 w-6 text-primary" />,
                    title: "Forecasting Agent",
                    description:
                      "Predicts usage patterns and potential bottlenecks with 97% accuracy, helping you avoid unexpected costs",
                  },
                  {
                    icon: <AlertTriangle className="h-6 w-6 text-primary" />,
                    title: "Prevention Agent",
                    description: "Automatically takes action to prevent outages before they impact your users",
                  },
                ].map((agent, index) => (
                  <ScrollAnimation 
                    key={index} 
                    animation="fade-in" 
                    delay={200 + (index * 150)} 
                    className="flex flex-col items-center text-center"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      {agent.icon}
                    </div>
                    <h3 className="mt-4 text-xl font-medium">{agent.title}</h3>
                    <p className="mt-2 text-muted-foreground">{agent.description}</p>
                  </ScrollAnimation>
                ))}
              </div>

              {/* Agent Connection Lines */}
              <div className="absolute left-1/3 right-1/3 top-1/2 hidden h-0.5 -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/30 to-transparent md:block"></div>

              {/* Agent Network Flow */}
              <ScrollAnimation animation="scale-in" className="mt-12 rounded-lg border border-border/40 bg-background/50 p-6" delay={400}>
                <h4 className="mb-4 text-center text-lg font-medium">How Teiden's AI Agents Prevent Outages</h4>
                <div className="flex flex-col items-center space-y-4" ref={agentNetworkRef}>
                  <StaggeredAnimation animation="fade-in" staggerDelay={300} className="flex flex-col items-center space-y-4">
                    <div className="flex w-full max-w-3xl flex-col space-y-2 rounded-lg bg-card/50 p-4">
                      <div className="flex items-center">
                        <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="font-medium">Monitoring Agent:</span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          "OpenAI API response times increased by 42% in the last hour"
                        </span>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    <div className="flex w-full max-w-3xl flex-col space-y-2 rounded-lg bg-card/50 p-4">
                      <div className="flex items-center">
                        <div className="mr-2 h-2 w-2 rounded-full bg-blue-500"></div>
                        <span className="font-medium">Forecasting Agent:</span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          "Pattern matches previous outage events. 87% probability of service degradation within 30
                          minutes"
                        </span>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    <div className="flex w-full max-w-3xl flex-col space-y-2 rounded-lg bg-card/50 p-4">
                      <div className="flex items-center">
                        <div className="mr-2 h-2 w-2 rounded-full bg-purple-500"></div>
                        <span className="font-medium">Prevention Agent:</span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          "Sent notification to Slack team and automated credit top-up to prevent service disruption"
                        </span>
                      </div>
                    </div>
                  </StaggeredAnimation>
                </div>
              </ScrollAnimation>
            </ScrollAnimation>

            <div className="mt-20">
              <StaggeredAnimation animation="slide-up" className="grid gap-8 md:grid-cols-3" staggerDelay={250}>
                {[
                  {
                    step: "01",
                    title: "Connect Your APIs",
                    description: "Securely integrate your API accounts with Teiden in under 5 minutes. No code required.",
                  },
                  {
                    step: "02",
                    title: "Set Your Preferences",
                    description: "Define your reliability thresholds, notification preferences, and failover rules.",
                  },
                  {
                    step: "03",
                    title: "Let AI Agents Work",
                    description: "Our intelligent agents monitor, forecast, and prevent API outages automatically.",
                  },
                ].map((step, index) => (
                  <div key={index} className="relative">
                    <div className="flex flex-col items-start">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
                        {step.step}
                      </div>
                      <h3 className="mt-5 text-xl font-medium">{step.title}</h3>
                      <p className="mt-2 text-muted-foreground">{step.description}</p>
                    </div>
                    {index < 2 && (
                      <div className="absolute right-0 top-6 hidden h-0.5 w-1/3 bg-gradient-to-r from-primary/50 to-transparent lg:block"></div>
                    )}
                  </div>
                ))}
              </StaggeredAnimation>
            </div>
          </div>
        </section>

        {/* Developer Relief Section - WITH ANIMATIONS */}
        <section className="border-b border-border/40 py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollAnimation animation="fade-in" className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                Developer Relief
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                We Understand Your API Pain Points
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Managing AI API costs and reliability can be a constant source of stress for developers.
              </p>
            </ScrollAnimation>

            <ScrollAnimation animation="slide-up" delay={200} className="mt-16">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="rounded-xl border border-border/40 bg-card/30 p-6 backdrop-blur-sm">
                  <h3 className="mb-4 text-xl font-medium">What Developers Like You Are Dealing With</h3>
                  <StaggeredAnimation animation="fade-in" staggerDelay={100}>
                    {[
                      "Unpredictable API costs that can spike without warning",
                      "Manual monitoring of usage across multiple services",
                      "Difficult capacity planning with growing user bases",
                      "No early warning system for potential overruns",
                      "Time wasted on non-core tasks like API management",
                    ].map((item, index) => (
                      <div key={index} className="mb-3 flex items-start">
                        <div className="mr-3 mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20">
                          <X className="h-3 w-3 text-red-500" />
                        </div>
                        <p>{item}</p>
                      </div>
                    ))}
                  </StaggeredAnimation>
                </div>

                <div className="rounded-xl border border-border/40 bg-card/30 p-6 backdrop-blur-sm">
                  <h3 className="mb-4 text-xl font-medium">How Developers Feel After Using Teiden</h3>
                  <StaggeredAnimation animation="fade-in" staggerDelay={100}>
                    {[
                      "Peace of mind with proactive monitoring and alerts",
                      "Reclaimed engineering time to focus on core product",
                      "Confidence in API reliability with automated safeguards",
                      "Predictable costs with AI-powered forecasting",
                      "More efficient resource utilization across services",
                    ].map((item, index) => (
                      <div key={index} className="mb-3 flex items-start">
                        <div className="mr-3 mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20">
                          <Check className="h-3 w-3 text-green-500" />
                        </div>
                        <p>{item}</p>
                      </div>
                    ))}
                  </StaggeredAnimation>
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation animation="fade-in" delay={300} className="mx-auto mt-20 max-w-3xl text-center">
              <h3 className="text-2xl font-medium tracking-tight">
                How Teiden Takes That Stress Slice Off Your Plate
              </h3>
            </ScrollAnimation>

            <ScrollAnimation animation="slide-up" delay={400} className="mt-10">
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    icon: <Activity className="h-6 w-6 text-primary" />,
                    title: "Continuous Monitoring",
                    description:
                      "Our AI agents continuously monitor your API usage across all services in real-time.",
                  },
                  {
                    icon: <BellRing className="h-6 w-6 text-primary" />,
                    title: "Predictive Alerts",
                    description:
                      "Get early warnings when our AI detects patterns that may lead to unexpected costs or outages.",
                  },
                  {
                    icon: <ShoppingCart className="h-6 w-6 text-primary" />,
                    title: "Automated Purchasing",
                    description:
                      "Set thresholds for automatic credit purchases so you never run out of API capacity.",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-border/40 bg-card/30 p-6 backdrop-blur-sm"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      {item.icon}
                    </div>
                    <h3 className="mt-5 text-xl font-medium">{item.title}</h3>
                    <p className="mt-2 text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </ScrollAnimation>
          </div>
        </section>

        {/* Features Section - WITH ANIMATIONS */}
        <section id="features" className="border-b border-border/40 py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollAnimation animation="fade-in" className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                Features
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Complete API Reliability Platform</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Teiden provides everything you need to ensure your AI-powered applications never experience downtime.
              </p>
            </ScrollAnimation>

            <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <AlertTriangle className="h-6 w-6 text-primary" />,
                  title: "Proactive Outage Prevention",
                  description:
                    "Detect early warning signs of API issues and take automated action before users are affected.",
                },
                {
                  icon: <LineChart className="h-6 w-6 text-primary" />,
                  title: "Usage Forecasting",
                  description:
                    "AI-powered predictions with 97% accuracy help you plan capacity, prevent rate limiting, and budget more effectively.",
                },
                {
                  icon: <Bot className="h-6 w-6 text-primary" />,
                  title: "Intelligent Failover",
                  description: "Automatically route traffic to backup providers when primary services degrade.",
                },
                {
                  icon: <Globe className="h-6 w-6 text-primary" />,
                  title: "Multi-Service Dashboard",
                  description: "Unified view of all your AI services in one place with real-time health monitoring.",
                },
                {
                  icon: <BarChart3 className="h-6 w-6 text-primary" />,
                  title: "Usage Analytics",
                  description: "Detailed insights into API usage patterns across teams, projects, and endpoints.",
                },
                {
                  icon: <Shield className="h-6 w-6 text-primary" />,
                  title: "Enterprise Security",
                  description: "SOC 2 compliant with role-based access control and audit logs for all activities.",
                },
                {
                  icon: <ShoppingCart className="h-6 w-6 text-primary" />,
                  title: "Automated Credit Top-ups",
                  description:
                    "Set thresholds for automatic credit purchases to ensure continuous service without manual intervention.",
                },
                {
                  icon: <Folders className="h-6 w-6 text-primary" />,
                  title: "Per-Project Cost Tracking",
                  description:
                    "Track and allocate API costs across different projects, teams, and applications for better budgeting.",
                },
              ].map((feature, index) => (
                <ScrollAnimation 
                  key={index} 
                  animation="scale-in" 
                  delay={index * 100}
                  className="border-border/40 bg-card/30 backdrop-blur-sm rounded-xl"
                >
                  <CardContent className="flex flex-col items-start p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      {feature.icon}
                    </div>
                    <h3 className="mt-5 text-xl font-medium">{feature.title}</h3>
                    <p className="mt-2 text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </section>

        {/* Security Section - WITH ANIMATIONS */}
        <section className="border-b border-border/40 bg-card/10 py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollAnimation animation="fade-in" className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                Security First
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Your API Keys, Fully Protected</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                We understand the sensitivity of API keys. That's why we've built Teiden with security as a foundational
                principle.
              </p>
            </ScrollAnimation>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: <Shield className="h-6 w-6 text-primary" />,
                  title: "End-to-End Encryption",
                  description: "All API keys are encrypted at rest and in transit using industry-standard AES-256 encryption. Your keys are never stored in plaintext."
                },
                {
                  icon: <Globe className="h-6 w-6 text-primary" />,
                  title: "OAuth Integration",
                  description: "Connect via OAuth where available, eliminating the need to share API keys directly. Teiden never sees your actual keys with this method."
                },
                {
                  icon: <Key className="h-6 w-6 text-primary" />,
                  title: "Limited Scope Access",
                  description: "Create dedicated API keys with limited scopes specifically for Teiden. Maintain full control over what Teiden can and cannot do with your accounts."
                }
              ].map((item, index) => (
                <ScrollAnimation 
                  key={index} 
                  animation="slide-up" 
                  delay={index * 150} 
                  className="rounded-lg border border-border/40 bg-card/30 backdrop-blur-sm"
                >
                  <CardContent className="flex flex-col items-start p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      {item.icon}
                    </div>
                    <h3 className="mt-5 text-xl font-medium">{item.title}</h3>
                    <p className="mt-2 text-muted-foreground">{item.description}</p>
                  </CardContent>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section - WITH ANIMATIONS */}
        <section id="pricing" className="border-b border-border/40 py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollAnimation animation="fade-in" className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                Pricing
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Transparent, Value-Based Pricing</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Plans that scale with your API usage. Typically pays for itself by preventing just one outage.
              </p>
            </ScrollAnimation>

            <ScrollAnimation animation="fade-in" delay={200} className="mt-8 flex justify-center">
              <Tabs value={pricingTab} onValueChange={setPricingTab} className="w-full max-w-xs">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="annual">Annual (20% off)</TabsTrigger>
                </TabsList>
              </Tabs>
            </ScrollAnimation>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: "Startup",
                  price: pricingTab === "monthly" ? "$99" : "$79",
                  description: "For teams with up to 5 AI-powered applications",
                  features: [
                    "Up to 5 API integrations",
                    "Basic monitoring network",
                    "7-day usage forecasting",
                    "Email notifications",
                    "Basic reporting",
                    "Standard support",
                  ],
                  cta: "Join waitlist",
                  popular: false,
                },
                {
                  name: "Growth",
                  price: pricingTab === "monthly" ? "$199" : "$159",
                  description: "For teams with up to 15 AI-powered applications",
                  features: [
                    "Up to 15 API integrations",
                    "Advanced monitoring network",
                    "30-day usage forecasting",
                    "Multi-channel notifications",
                    "Advanced reporting & analytics",
                    "Custom reliability thresholds",
                    "Priority support",
                    "Team access controls",
                  ],
                  cta: "Join waitlist",
                  popular: true,
                },
                {
                  name: "Enterprise",
                  price: "Custom",
                  description: "For teams with mission-critical AI applications",
                  features: [
                    "Unlimited API integrations",
                    "Premium monitoring network",
                    "90-day usage forecasting",
                    "Custom integrations",
                    "Dedicated reliability manager",
                    "SSO & advanced security",
                    "Custom SLAs",
                    "24/7 priority support",
                  ],
                  cta: "Contact sales",
                  popular: false,
                },
              ].map((plan, index) => (
                <ScrollAnimation
                  key={index}
                  animation="slide-up"
                  delay={index * 150}
                  className={`relative border-border/40 ${
                    plan.popular ? "border-primary/50 bg-card/50 shadow-lg shadow-primary/10" : "bg-card/30"
                  } backdrop-blur-sm rounded-xl`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-0 right-0 flex justify-center">
                      <div className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                        Most Popular
                      </div>
                    </div>
                  )}
                  <CardContent className="flex flex-col p-6">
                    <h3 className="text-xl font-medium">{plan.name}</h3>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.price !== "Custom" && (
                        <span className="ml-1 text-muted-foreground">
                          /{pricingTab === "monthly" ? "month" : "month, billed annually"}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                    <ul className="mt-6 space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8">
                      <Button
                        variant={plan.popular ? "default" : "outline"}
                        className={`w-full ${
                          plan.popular
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            : "border-border/60"
                        }`}
                        asChild
                      >
                        <Link href="#waitlist">{plan.cta}</Link>
                      </Button>
                    </div>
                  </CardContent>
                </ScrollAnimation>
              ))}
            </div>

            <ScrollAnimation animation="fade-in" delay={400} className="mt-12 text-center">
              <p className="text-muted-foreground">All plans include a 14-day free trial. No credit card required.</p>
            </ScrollAnimation>
          </div>
        </section>

        {/* FAQ Section - WITH ANIMATIONS */}
        <section id="faq" className="border-b border-border/40 py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollAnimation animation="fade-in" className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                FAQ
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Common questions about how Teiden works and can benefit your team.
              </p>
            </ScrollAnimation>

            <ScrollAnimation animation="fade-in" delay={200} className="mx-auto mt-16 max-w-3xl">
              <Accordion type="single" collapsible className="w-full">
                {[
                  {
                    question: "Which AI API providers does Teiden support?",
                    answer:
                      "Teiden supports all major AI API providers including OpenAI, Anthropic, Cohere, HuggingFace, MistralAI, Stability AI, and more. New providers are added regularly based on demand.",
                  },
                  {
                    question: "How does Teiden prevent API outages?",
                    answer:
                      "Teiden uses a multi-faceted approach to prevent outages. Our monitoring agents detect early warning signs of API issues, predictive AI forecasts usage patterns, and automated failover systems redirect traffic to backup providers when needed. This comprehensive system acts before users experience any downtime.",
                  },
                  {
                    question: "Does Teiden require access to my API keys?",
                    answer:
                      "Yes, but with strong security measures. Teiden encrypts all API keys at rest and in transit using industry-standard encryption. Alternatively, you can use our OAuth integration which never exposes keys directly to Teiden. We also support creating limited-scope keys specifically for monitoring.",
                  },
                  {
                    question: "How accurate is the usage forecasting?",
                    answer:
                      "Our AI-powered forecasting system has demonstrated 97% accuracy in predicting API usage patterns based on historical data. The longer you use Teiden, the more accurate the predictions become as our systems learn your specific usage patterns and seasonality.",
                  },
                  {
                    question: "Can Teiden integrate with our existing monitoring tools?",
                    answer:
                      "Yes, Teiden offers various integration options. We provide webhooks, API endpoints, and direct integrations with popular monitoring platforms like DataDog, Grafana, and New Relic. Custom integrations are available on enterprise plans.",
                  },
                ].map((item, index) => (
                  <ScrollAnimation key={index} animation="fade-in" delay={index * 100}>
                    <AccordionItem value={`item-${index}`}>
                      <AccordionTrigger>{item.question}</AccordionTrigger>
                      <AccordionContent>{item.answer}</AccordionContent>
                    </AccordionItem>
                  </ScrollAnimation>
                ))}
              </Accordion>
            </ScrollAnimation>
          </div>
        </section>

        {/* CTA Section - WITH ANIMATIONS */}
        <section id="cta" className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollAnimation animation="fade-in" delay={200}>
              <div className="relative rounded-2xl bg-gradient-to-b from-primary/20 to-primary/5 py-16">
                <div className="mx-auto max-w-3xl text-center">
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Ready to eliminate API reliability headaches?
                  </h2>
                  <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
                    Join the waitlist today and be among the first to experience stress-free API management.
                  </p>
                  <div className="mt-10 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 sm:w-auto"
                      asChild
                    >
                      <Link href="#waitlist">Join the waitlist</Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full border-border/60 bg-background/80 backdrop-blur-sm sm:w-auto"
                      asChild
                    >
                      <Link href="#features">Learn more</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </section>

        {/* Waitlist Section - WITH ANIMATIONS */}
        <section id="waitlist" className="border-t border-border/40 py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollAnimation animation="fade-in" className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                Early Access
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Join the Waitlist</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Be among the first to experience Teiden and take control of your API reliability.
              </p>
              <div className="mx-auto mt-10 max-w-md">
                <WaitlistForm large />
              </div>
            </ScrollAnimation>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between space-y-6 md:flex-row md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">T</div>
              <span className="text-lg font-semibold">Teiden</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Teiden. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
