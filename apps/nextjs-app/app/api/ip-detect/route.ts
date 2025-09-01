import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get client IP from headers
    const forwarded = request.headers.get("x-forwarded-for");
    const realIP = request.headers.get("x-real-ip");
    const cfIP = request.headers.get("cf-connecting-ip");

    const clientIP = forwarded?.split(",")[0] || realIP || cfIP || "127.0.0.1";

    // Handle localhost/development - but still try to get real IP
    const isLocalhost =
      clientIP === "::1" ||
      clientIP === "127.0.0.1" ||
      clientIP.includes("localhost");

    if (isLocalhost) {
      console.log("🔧 Development mode detected, using localhost IP");
    }

    // Try multiple geolocation services for better reliability
    const geoServices = [
      {
        name: "ipapi.co",
        url: `https://ipapi.co/${clientIP}/json/`,
        headers: { "User-Agent": "WeezIQ-Chatbot/1.0" },
      },
      {
        name: "ipinfo.io",
        url: `https://ipinfo.io/${clientIP}/json`,
        headers: { "User-Agent": "WeezIQ-Chatbot/1.0" },
      },
      {
        name: "ip-api.com",
        url: `http://ip-api.com/json/${clientIP}`,
        headers: { "User-Agent": "WeezIQ-Chatbot/1.0" },
      },
    ];

    // Try each service until one works
    for (const service of geoServices) {
      try {
        console.log(`🔍 Trying ${service.name} for IP: ${clientIP}`);

        const geoResponse = await fetch(service.url, {
          headers: service.headers,
          signal: AbortSignal.timeout(3000), // 3 second timeout
        });

        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          console.log(`✅ ${service.name} data received:`, geoData);

          // Normalize data from different services
          const normalizedData = normalizeGeoData(geoData, service.name);

          return NextResponse.json({
            success: true,
            country: normalizedData.country,
            countryCode: normalizedData.countryCode,
            region: normalizedData.region,
            city: normalizedData.city,
            ip: clientIP,
            isDevelopment: isLocalhost,
            service: service.name,
            geoData: normalizedData,
          });
        } else {
          console.warn(
            `⚠️ ${service.name} returned error:`,
            geoResponse.status
          );
        }
      } catch (geoError) {
        console.warn(`⚠️ ${service.name} failed:`, geoError);
        continue;
      }
    }

    // If all services fail, try to get basic info from request headers
    console.log("🔄 All geolocation services failed, using fallback");

    // Try to get country from Accept-Language header as fallback
    const acceptLanguage = request.headers.get("accept-language");
    let fallbackCountry = "United States";
    let fallbackCountryCode = "US";

    if (acceptLanguage) {
      const lang = acceptLanguage.split(",")[0];
      if (lang.includes("en-GB")) {
        fallbackCountry = "United Kingdom";
        fallbackCountryCode = "GB";
      } else if (lang.includes("en-CA")) {
        fallbackCountry = "Canada";
        fallbackCountryCode = "CA";
      } else if (lang.includes("en-AU")) {
        fallbackCountry = "Australia";
        fallbackCountryCode = "AU";
      }
    }

    return NextResponse.json({
      success: true,
      country: fallbackCountry,
      countryCode: fallbackCountryCode,
      region: "Unknown",
      city: "Unknown",
      ip: clientIP,
      isDevelopment: isLocalhost,
      fallback: true,
      message:
        "Geolocation services unavailable, using language-based fallback",
    });
  } catch (error) {
    console.error("❌ IP detection error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to detect IP",
        country: "United States",
        countryCode: "US",
        region: "Unknown",
        city: "Unknown",
      },
      { status: 500 }
    );
  }
}

// Helper function to normalize data from different geolocation services
function normalizeGeoData(geoData: any, serviceName: string) {
  switch (serviceName) {
    case "ipapi.co":
      return {
        country: geoData.country_name || "Unknown",
        countryCode: geoData.country_code || "US",
        region: geoData.region || geoData.state || "Unknown",
        city: geoData.city || "Unknown",
        latitude: geoData.latitude,
        longitude: geoData.longitude,
        timezone: geoData.timezone,
      };

    case "ipinfo.io":
      return {
        country: geoData.country || "Unknown",
        countryCode: geoData.country || "US",
        region: geoData.region || "Unknown",
        city: geoData.city || "Unknown",
        latitude: geoData.loc?.split(",")[0],
        longitude: geoData.loc?.split(",")[1],
        timezone: geoData.timezone,
      };

    case "ip-api.com":
      return {
        country: geoData.country || "Unknown",
        countryCode: geoData.countryCode || "US",
        region: geoData.regionName || geoData.region || "Unknown",
        city: geoData.city || "Unknown",
        latitude: geoData.lat,
        longitude: geoData.lon,
        timezone: geoData.timezone,
      };

    default:
      return {
        country: geoData.country || geoData.country_name || "Unknown",
        countryCode: geoData.countryCode || geoData.country_code || "US",
        region:
          geoData.region || geoData.state || geoData.regionName || "Unknown",
        city: geoData.city || "Unknown",
        latitude: geoData.latitude || geoData.lat,
        longitude: geoData.longitude || geoData.lon,
        timezone: geoData.timezone,
      };
  }
}
