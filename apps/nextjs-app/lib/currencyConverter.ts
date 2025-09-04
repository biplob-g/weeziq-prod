/**
 * Currency Converter Utility
 * Automatically detects user's country and converts pricing
 * Shows INR for India, USD for all other countries
 */

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  isINR: boolean;
}

export interface PricingInfo {
  originalPrice: number;
  convertedPrice: number;
  currency: CurrencyInfo;
  displayPrice: string;
}

// Currency configuration
export const CURRENCIES = {
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    isINR: false,
  },
  INR: {
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
    isINR: true,
  },
} as const;

// Exchange rates (you can update these or fetch from an API)
const EXCHANGE_RATES = {
  USD_TO_INR: 88.12, // Current rate as of 2024
  INR_TO_USD: 1 / 88.12,
} as const;

/**
 * Detects user's country and returns appropriate currency
 */
export const detectUserCurrency = async (): Promise<CurrencyInfo> => {
  try {
    // Try to get user's location from the existing IP detection API
    const response = await fetch("/api/ip-detect");
    const data = await response.json();

    console.log("IP Detection response:", data);

    if (data.success && data.countryCode === "IN") {
      console.log("India detected, returning INR");
      return CURRENCIES.INR;
    }

    // For development/testing, you can force INR by checking for specific conditions
    if (process.env.NODE_ENV === "development") {
      // Check if we're in development and want to test INR
      const isTestingINR =
        window.location.search.includes("currency=INR") ||
        localStorage.getItem("testCurrency") === "INR";
      if (isTestingINR) {
        console.log("Development mode: Testing INR currency");
        return CURRENCIES.INR;
      }
    }

    // Temporary override for testing - if you're in India, force INR
    // Remove this after confirming IP detection works
    if (typeof window !== "undefined") {
      const userAgent = navigator.userAgent;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const language = navigator.language;

      // Check for Indian indicators
      const isIndiaIndicators =
        timezone.includes("Asia/Kolkata") ||
        timezone.includes("Asia/Calcutta") ||
        language.includes("en-IN") ||
        userAgent.includes("India");

      if (isIndiaIndicators) {
        console.log("India indicators detected, forcing INR currency");
        return CURRENCIES.INR;
      }
    }

    console.log("Non-India detected, returning USD");
    // Default to USD for all other countries
    return CURRENCIES.USD;
  } catch (error) {
    console.warn("Failed to detect user currency, defaulting to USD:", error);
    return CURRENCIES.USD;
  }
};

/**
 * Converts USD price to the user's local currency
 */
export const convertPrice = (
  usdPrice: number,
  targetCurrency: CurrencyInfo
): PricingInfo => {
  let convertedPrice = usdPrice;

  if (targetCurrency.isINR) {
    convertedPrice = usdPrice * EXCHANGE_RATES.USD_TO_INR;
  }

  return {
    originalPrice: usdPrice,
    convertedPrice: Math.round(convertedPrice),
    currency: targetCurrency,
    displayPrice: formatPrice(convertedPrice, targetCurrency),
  };
};

/**
 * Formats price with appropriate currency symbol and formatting
 */
export const formatPrice = (price: number, currency: CurrencyInfo): string => {
  if (currency.isINR) {
    // Indian formatting: ₹1,000
    return `${currency.symbol}${Math.round(price).toLocaleString("en-IN")}`;
  } else {
    // US formatting: $1,000
    return `${currency.symbol}${Math.round(price).toLocaleString("en-US")}`;
  }
};

/**
 * Gets pricing information for a plan with currency conversion
 */
export const getPricingInfo = async (
  usdPrice: number
): Promise<PricingInfo> => {
  const userCurrency = await detectUserCurrency();
  return convertPrice(usdPrice, userCurrency);
};

/**
 * Hook for React components to get currency information
 */
export const useCurrency = () => {
  const [currency, setCurrency] = React.useState<CurrencyInfo>(CURRENCIES.USD);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const detectCurrency = async () => {
      try {
        const detectedCurrency = await detectUserCurrency();
        setCurrency(detectedCurrency);
      } catch (error) {
        console.error("Failed to detect currency:", error);
        setCurrency(CURRENCIES.USD);
      } finally {
        setLoading(false);
      }
    };

    detectCurrency();
  }, []);

  return { currency, loading };
};

// Import React for the hook
import React from "react";
