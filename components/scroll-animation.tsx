"use client"

import { cn } from "@/lib/utils";
import { useInView } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

interface ScrollAnimationProps {
  children: React.ReactNode;
  animation: "fade-in" | "slide-up" | "scale-in" | "bounce-in";
  className?: string;
  delay?: number;
  threshold?: number;
  once?: boolean;
}

export function ScrollAnimation({
  children,
  animation,
  className,
  delay = 0,
  threshold = 0.1,
  once = false,
}: ScrollAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isInView && !hasAnimated) {
      const timeout = setTimeout(() => {
        setHasAnimated(true);
      }, delay);

      return () => clearTimeout(timeout);
    }
    
    // Reset animation state when element leaves viewport
    if (!isInView && !once) {
      setHasAnimated(false);
    }
  }, [isInView, delay, hasAnimated, once]);

  return (
    <div
      ref={ref}
      className={cn(
        className,
        !hasAnimated && "animate-hidden",
        hasAnimated && getAnimationClass(animation)
      )}
    >
      {children}
    </div>
  );
}

interface StaggeredAnimationProps {
  children: React.ReactNode;
  animation: "fade-in" | "slide-up" | "scale-in" | "bounce-in";
  className?: string;
  staggerDelay?: number;
  threshold?: number;
  once?: boolean;
}

export function StaggeredAnimation({
  children,
  animation,
  className,
  staggerDelay = 100,
  threshold = 0.1,
  once = false,
}: StaggeredAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
    }
    
    // Reset animation state when element leaves viewport
    if (!isInView && !once) {
      setHasAnimated(false);
    }
  }, [isInView, hasAnimated, once]);

  // Instead of trying to clone and modify children directly,
  // we'll render a container that applies animation classes
  return (
    <div ref={ref} className={className}>
      {React.Children.map(children, (child, index) => {
        // Skip null or undefined children
        if (!child) return null;
        
        return (
          <div 
            key={index}
            className={cn(
              !hasAnimated && "animate-hidden",
              hasAnimated && getAnimationClass(animation)
            )}
            style={hasAnimated ? { animationDelay: `${index * staggerDelay}ms` } : undefined}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}

function getAnimationClass(animation: string): string {
  switch (animation) {
    case "fade-in":
      return "animate-fade-in";
    case "slide-up":
      return "animate-slide-up";
    case "scale-in":
      return "animate-scale-in";
    case "bounce-in":
      return "animate-bounce-in";
    default:
      return "animate-fade-in";
  }
} 