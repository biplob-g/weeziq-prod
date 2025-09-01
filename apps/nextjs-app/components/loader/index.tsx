import React from "react";
import { Loader as LoaderIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  loading: boolean;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Loader = ({
  loading,
  children,
  className,
  noPadding,
}: LoaderProps) => {
  return loading ? (
    <div className={cn(className || "w-full py-5 flex justify-center")}>
      <div className={cn("flex justify-center", noPadding ? "" : "py-10")}>
        <LoaderIcon className="h-8 w-8 animate-spin text-[#722594]" />
      </div>
    </div>
  ) : (
    <>{children}</>
  );
};
