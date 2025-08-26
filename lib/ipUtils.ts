import { Address4, Address6 } from "ip-address";

/**
 * Validates if a string is a valid IPv4 or IPv6 address
 */
export const isValidIPAddress = (ip: string): boolean => {
  try {
    // Try IPv4 first
    if (Address4.isValid(ip)) return true;

    // Try IPv6
    if (Address6.isValid(ip)) return true;

    return false;
  } catch {
    return false;
  }
};

/**
 * Normalizes IP address to ensure consistent format
 */
export const normalizeIPAddress = (ip: string): string => {
  try {
    // Try IPv4 first
    if (Address4.isValid(ip)) {
      const ipv4 = new Address4(ip);
      return ipv4.address;
    }

    // Try IPv6
    if (Address6.isValid(ip)) {
      const ipv6 = new Address6(ip);
      return ipv6.canonicalForm();
    }
  } catch {
    // If parsing fails, return original
  }

  return ip;
};

/**
 * Checks if an IP address is within the 14-day retention period
 */
export const isWithinRetentionPeriod = (createdAt: Date): boolean => {
  const now = new Date();
  const retentionDays = 14;
  const retentionMs = retentionDays * 24 * 60 * 60 * 1000;

  return now.getTime() - createdAt.getTime() < retentionMs;
};

/**
 * Gets the client IP address from request headers
 */
export const getClientIP = (headers: Headers): string | null => {
  // Check various headers for IP address
  const possibleHeaders = [
    "x-forwarded-for",
    "x-real-ip",
    "x-client-ip",
    "cf-connecting-ip", // Cloudflare
    "x-forwarded",
    "forwarded-for",
    "forwarded",
  ];

  for (const header of possibleHeaders) {
    const value = headers.get(header);
    if (value) {
      // Handle comma-separated IPs (take the first one)
      const firstIP = value.split(",")[0].trim();

      // ✅ FIXED: Handle IPv6 localhost addresses
      if (
        firstIP === "0000:0000:0000:0000:0000:ffff:7f00:0001" ||
        firstIP === "::1" ||
        firstIP === "::ffff:127.0.0.1"
      ) {
        console.log("🔧 Localhost IPv6 detected, using development IP");
        return "192.168.1.100";
      }

      if (isValidIPAddress(firstIP)) {
        return normalizeIPAddress(firstIP);
      }
    }
  }

  // ✅ FIXED: Development fallback - use a consistent IP for testing
  if (process.env.NODE_ENV === "development") {
    console.log("🔧 Development mode: Using fallback IP for testing");
    return "192.168.1.100"; // More realistic IP for development testing
  }

  return null;
};
