"use client";

import { useEffect, useCallback } from "react";
import type { ChatbotPage } from "./types";

interface UseGestureNavigationProps {
  currentPage: ChatbotPage;
  canGoBack: boolean;
  onNavigateToPage: (page: ChatbotPage) => void;
  onNavigateBack: () => void;
}

export const useGestureNavigation = ({
  currentPage,
  canGoBack,
  onNavigateToPage,
  onNavigateBack,
}: UseGestureNavigationProps) => {
  // Keyboard navigation
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Prevent navigation if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key) {
        case "Escape":
          if (canGoBack) {
            onNavigateBack();
          }
          break;
        case "ArrowLeft":
          if (canGoBack) {
            onNavigateBack();
          }
          break;
        case "ArrowRight":
          // Navigate forward based on current page
          if (currentPage === "chat") {
            onNavigateToPage("helpdesk");
          }
          break;
        case "1":
          if (event.ctrlKey || event.metaKey) {
            onNavigateToPage("chat");
          }
          break;
        case "2":
          if (event.ctrlKey || event.metaKey) {
            onNavigateToPage("helpdesk");
          }
          break;
      }
    },
    [currentPage, canGoBack, onNavigateToPage, onNavigateBack]
  );

  // Touch gesture handling
  const handleTouchNavigation = useCallback(() => {
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    const handleTouchStart = (event: TouchEvent) => {
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    };

    const handleTouchMove = (event: TouchEvent) => {
      // Prevent default scrolling during swipe
      if (Math.abs(event.touches[0].clientX - startX) > 10) {
        event.preventDefault();
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      endX = event.changedTouches[0].clientX;
      endY = event.changedTouches[0].clientY;

      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const minSwipeDistance = 50;

      // Check if it's a horizontal swipe
      if (
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaX) > minSwipeDistance
      ) {
        if (deltaX > 0) {
          // Swipe right - go back
          if (canGoBack) {
            onNavigateBack();
          }
        } else {
          // Swipe left - go forward
          if (currentPage === "chat") {
            onNavigateToPage("helpdesk");
          } else if (currentPage === "helpdesk") {
            onNavigateToPage("chat");
          }
        }
      }
    };

    return {
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
    };
  }, [currentPage, canGoBack, onNavigateToPage, onNavigateBack]);

  useEffect(() => {
    // Add keyboard listeners
    document.addEventListener("keydown", handleKeyPress);

    // Add touch listeners
    const { handleTouchStart, handleTouchMove, handleTouchEnd } =
      handleTouchNavigation();
    document.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleKeyPress, handleTouchNavigation]);

  return {
    // Return any helper functions if needed
  };
};
