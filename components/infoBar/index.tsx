"use client";

import React from "react";
import { UserButton } from "@clerk/nextjs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const InfoBars = () => {
  return (
    <div className="flex w-full justify-between items-center py-3 mb-8">
      <div className="flex items-center gap-6"></div>

      <div className="flex gap-3 items-center">
        <div className="flex">
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger>
                <UserButton
                  appearance={{
                    elements: {
                      rootBox: "h-8 w-8",
                      userButtonAvatarBox: "h-8 w-8",
                      userButtonTrigger: "h-8 w-8 hover:bg-accent rounded-md",
                    },
                  }}
                />
              </TooltipTrigger>
              <TooltipContent side="bottom" align="center" sideOffset={2}>
                <p>My Profile</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default InfoBars;
