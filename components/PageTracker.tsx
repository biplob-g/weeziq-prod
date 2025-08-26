"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  trackPageVisit,
  updatePageDuration,
  getStoredPageVisits,
} from "@/lib/pageTracking";

const PageTracker = () => {
  const pathname = usePathname();

  useEffect(() => {
    // Track the current page visit
    const trackCurrentPage = () => {
      const currentUrl = pathname;
      const currentTitle =
        typeof document !== "undefined" ? document.title : "WeezGen";

      // Update duration for previous page if exists
      const visits = getStoredPageVisits();
      if (visits.length > 0) {
        updatePageDuration(visits[0].url);
      }

      // Track new page visit
      trackPageVisit({
        url: currentUrl,
        title: currentTitle,
        referrer: typeof document !== "undefined" ? document.referrer : "",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      });
    };

    // Track the page visit after a small delay to ensure document.title is updated
    const timeoutId = setTimeout(trackCurrentPage, 100);

    return () => {
      clearTimeout(timeoutId);

      // Update duration when leaving the page
      const visits = getStoredPageVisits();
      if (visits.length > 0) {
        updatePageDuration(visits[0].url);
      }
    };
  }, [pathname]);

  useEffect(() => {
    // Track page visibility changes for better duration tracking
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        const visits = getStoredPageVisits();
        if (visits.length > 0) {
          updatePageDuration(visits[0].url);
        }
      }
    };

    // Track page unload
    const handleBeforeUnload = () => {
      const visits = getStoredPageVisits();
      if (visits.length > 0) {
        updatePageDuration(visits[0].url);
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, []);

  // This component doesn't render anything
  return null;
};

export default PageTracker;
