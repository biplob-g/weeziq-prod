// Page tracking utilities for customer journey analysis

export interface PageVisit {
  url: string;
  title: string;
  visitedAt: Date;
  duration?: number; // in seconds
  referrer?: string;
  userAgent?: string;
}

// Store page visits in localStorage for client-side tracking
export const trackPageVisit = (page: Omit<PageVisit, "visitedAt">) => {
  if (typeof window === "undefined") return;

  const pageVisit: PageVisit = {
    ...page,
    visitedAt: new Date(),
  };

  // Get existing visits
  const existingVisits = getStoredPageVisits();

  // Add new visit
  const updatedVisits = [pageVisit, ...existingVisits].slice(0, 20); // Keep last 20 visits

  // Store back to localStorage
  localStorage.setItem("pageVisits", JSON.stringify(updatedVisits));
};

// Get stored page visits from localStorage
export const getStoredPageVisits = (): PageVisit[] => {
  if (typeof window === "undefined") return [];

  try {
    const storedVisits = localStorage.getItem("pageVisits");
    if (storedVisits) {
      const visits = JSON.parse(storedVisits);
      // Convert visitedAt back to Date objects
      return visits.map(
        (visit: { visitedAt: string | Date; [key: string]: unknown }) => ({
          ...visit,
          visitedAt: new Date(visit.visitedAt),
        })
      );
    }
  } catch (error) {
    console.error("Error parsing stored page visits:", error);
  }

  return [];
};

// Clear stored page visits
export const clearPageVisits = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("pageVisits");
};

// Calculate page duration (when user leaves page)
export const updatePageDuration = (url: string) => {
  if (typeof window === "undefined") return;

  const visits = getStoredPageVisits();
  if (visits.length === 0) return;

  const lastVisit = visits[0];
  if (lastVisit.url === url && !lastVisit.duration) {
    const duration = Math.floor(
      (Date.now() - lastVisit.visitedAt.getTime()) / 1000
    );
    lastVisit.duration = duration;

    // Update the stored visits
    localStorage.setItem("pageVisits", JSON.stringify(visits));
  }
};

// Hook to track page visits automatically
export const usePageTracking = () => {
  if (typeof window === "undefined") return;

  const trackCurrentPage = () => {
    const currentUrl = window.location.pathname + window.location.search;
    const currentTitle = document.title;

    // Update duration for previous page
    const visits = getStoredPageVisits();
    if (visits.length > 0) {
      updatePageDuration(visits[0].url);
    }

    // Track new page visit
    trackPageVisit({
      url: currentUrl,
      title: currentTitle,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    });
  };

  // Track initial page load
  trackCurrentPage();

  // Track page unload (to calculate duration)
  const handleBeforeUnload = () => {
    const visits = getStoredPageVisits();
    if (visits.length > 0) {
      updatePageDuration(visits[0].url);
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  // Track page visibility changes (for SPAs)
  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      trackCurrentPage();
    } else {
      const visits = getStoredPageVisits();
      if (visits.length > 0) {
        updatePageDuration(visits[0].url);
      }
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Cleanup function
  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
};

// Get mock data for development/testing
export const getMockPageVisits = (): PageVisit[] => {
  const now = new Date();
  return [
    {
      url: "/pricing",
      title: "Pricing Plans - WeezGen",
      visitedAt: new Date(now.getTime() - 1000 * 60 * 5), // 5 minutes ago
      duration: 180,
      referrer: "/",
    },
    {
      url: "/features",
      title: "Features Overview - WeezGen",
      visitedAt: new Date(now.getTime() - 1000 * 60 * 10), // 10 minutes ago
      duration: 95,
      referrer: "/",
    },
    {
      url: "/",
      title: "Home - WeezGen",
      visitedAt: new Date(now.getTime() - 1000 * 60 * 15), // 15 minutes ago
      duration: 120,
      referrer: "https://google.com",
    },
  ];
};
