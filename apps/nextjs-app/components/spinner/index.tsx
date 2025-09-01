import { cn } from "@/lib/utils";
import React from "react";
import { Loader } from "lucide-react";

type SpinnerProps = {
  noPadding?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  color?: string;
  className?: string;
};

export const Spinner = ({
  noPadding,
  size = "md",
  color = "#722594",
  className,
}: SpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  return (
    <div
      className={cn(
        "w-full flex justify-center",
        noPadding ? "" : "py-10",
        className
      )}
    >
      <Loader
        className={cn("animate-spin", sizeClasses[size])}
        style={{ color }}
      />
    </div>
  );
};
