import { countries } from "countries-list";

export interface CountryCode {
  name: string;
  code: string; // ISO 3166-1 alpha-2 country code (e.g., "US", "GB")
  dialCode: string;
}

// Convert countries-list data to our format
export const countryCodes: CountryCode[] = Object.entries(countries)
  .map(([code, country]) => ({
    name: country.name,
    code: code.toUpperCase(),
    dialCode: Array.isArray(country.phone)
      ? `+${country.phone[0]}` // Take first phone code if it's an array
      : country.phone
      ? `+${country.phone}` // Convert number to string
      : "+1", // Default fallback
  }))
  .filter((country) => country.dialCode && country.dialCode !== "+0") // Filter out invalid entries
  .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name

// Helper function to find country by ISO code
export const findCountryByCode = (code: string): CountryCode | undefined => {
  return countryCodes.find((country) => country.code === code.toUpperCase());
};

// Helper function to find country by dial code
export const findCountryByDialCode = (
  dialCode: string
): CountryCode | undefined => {
  return countryCodes.find((country) => country.dialCode === dialCode);
};

// Enhanced IP-based country detection
export const detectCountryFromIP = async (): Promise<
  CountryCode | undefined
> => {
  try {
    // Try multiple IP geolocation services for better reliability
    const services = [
      "https://ipapi.co/json/",
      "https://ipinfo.io/json",
      "https://api.ipgeolocation.io/ipgeo?apiKey=free",
    ];

    for (const service of services) {
      try {
        const response = await fetch(service, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          const countryCode = data.country_code || data.countryCode;

          if (countryCode) {
            const country = findCountryByCode(countryCode);
            if (country) {
              console.log(
                `✅ Country detected: ${country.name} (${country.code})`
              );
              return country;
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to detect country from ${service}:`, error);
        continue;
      }
    }

    // Fallback to US if all services fail
    console.log("⚠️ Could not detect country, falling back to US");
    return findCountryByCode("US");
  } catch (error) {
    console.error("❌ Error in country detection:", error);
    return findCountryByCode("US");
  }
};
