"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
  variant?: "card" | "list" | "text";
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  lines = 3,
  variant = "text",
}) => {
  if (variant === "card") {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="bg-muted rounded-lg p-4 space-y-3 animate-pulse"
          >
            <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
            <div className="h-3 bg-muted-foreground/20 rounded w-1/2"></div>
            <div className="h-3 bg-muted-foreground/20 rounded w-5/6"></div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 rounded-lg animate-pulse"
          >
            <div className="w-8 h-8 bg-muted-foreground/20 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-muted-foreground/20 rounded w-3/4"></div>
              <div className="h-2 bg-muted-foreground/20 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-4 bg-muted-foreground/20 rounded animate-pulse",
            index === 0 && "w-5/6",
            index === 1 && "w-4/6",
            index === 2 && "w-3/6"
          )}
        ></div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
