"use server";

import { auth } from "@clerk/nextjs/server";
import { client } from "@/lib/prisma";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

// Google Sheets API configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

// Check if user has Google Sheets integration
export const onCheckGoogleIntegration = async () => {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // First, get the user from the database to ensure we have the correct UUID
    const user = await client.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      console.error("User not found in database");
      return { isConnected: false, integration: null };
    }

    const integration = await client.googleIntegration.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        accessToken: true,
        refreshToken: true,
        expiresAt: true,
        email: true,
      },
    });

    if (!integration) {
      return { isConnected: false, integration: null };
    }

    // Check if token is expired
    const isExpired = new Date() > integration.expiresAt;

    return {
      isConnected: !isExpired,
      integration: isExpired ? null : integration,
    };
  } catch (error) {
    console.error("Error checking Google integration:", error);
    return { isConnected: false, integration: null };
  }
};

// Get Google OAuth URL
export const onGetGoogleAuthUrl = async () => {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const scopes = [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/userinfo.email",
    ];

    const authUrl =
      `https://accounts.google.com/oauth/authorize?` +
      `client_id=${GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI || "")}&` +
      `scope=${encodeURIComponent(scopes.join(" "))}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `prompt=consent`;

    return { authUrl };
  } catch (error) {
    console.error("Error generating Google auth URL:", error);
    throw new Error("Failed to generate authentication URL");
  }
};

// Handle Google OAuth callback
export const onHandleGoogleCallback = async (code: string) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // First, get the user from the database to ensure we have the correct UUID
    const user = await client.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      throw new Error("User not found in database");
    }

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID || "",
        client_secret: GOOGLE_CLIENT_SECRET || "",
        code,
        grant_type: "authorization_code",
        redirect_uri: GOOGLE_REDIRECT_URI || "",
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for tokens");
    }

    const tokenData = await tokenResponse.json();

    // Get user info
    const userInfoResponse = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenData.access_token}`
    );

    if (!userInfoResponse.ok) {
      throw new Error("Failed to get user info");
    }

    const userInfo = await userInfoResponse.json();

    // Store integration in database
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    await client.googleIntegration.upsert({
      where: { userId: user.id },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt,
        email: userInfo.email,
      },
      create: {
        userId: user.id,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt,
        email: userInfo.email,
      },
    });

    return { success: true, email: userInfo.email };
  } catch (error) {
    console.error("Error handling Google callback:", error);
    throw new Error("Failed to complete Google integration");
  }
};

// Refresh Google access token
export const onRefreshGoogleToken = async () => {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // First, get the user from the database to ensure we have the correct UUID
    const user = await client.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      throw new Error("User not found in database");
    }

    const integration = await client.googleIntegration.findUnique({
      where: { userId: user.id },
    });

    if (!integration) {
      throw new Error("No Google integration found");
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID || "",
        client_secret: GOOGLE_CLIENT_SECRET || "",
        refresh_token: integration.refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const tokenData = await response.json();
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    await client.googleIntegration.update({
      where: { userId: user.id },
      data: {
        accessToken: tokenData.access_token,
        expiresAt,
      },
    });

    return { accessToken: tokenData.access_token, expiresAt };
  } catch (error) {
    console.error("Error refreshing Google token:", error);
    throw new Error("Failed to refresh access token");
  }
};

// Get user's Google Sheets
export const onGetGoogleSheets = async () => {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // First, get the user from the database to ensure we have the correct UUID
    const user = await client.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      throw new Error("User not found in database");
    }

    const integration = await client.googleIntegration.findUnique({
      where: { userId: user.id },
    });

    if (!integration) {
      throw new Error("No Google integration found");
    }

    // Check if token needs refresh
    if (new Date() > integration.expiresAt) {
      await onRefreshGoogleToken();
    }

    // Get fresh integration data after potential refresh
    const freshIntegration = await client.googleIntegration.findUnique({
      where: { userId: user.id },
    });

    if (!freshIntegration) {
      throw new Error("No Google integration found after refresh");
    }

    const response = await fetch(
      "https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'&fields=files(id,name,createdTime)",
      {
        headers: {
          Authorization: `Bearer ${freshIntegration.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google API Error:", response.status, errorText);
      throw new Error(`Failed to fetch Google Sheets: ${response.status}`);
    }

    const data = await response.json();
    return { sheets: data.files || [] };
  } catch (error) {
    console.error("Error fetching Google Sheets:", error);
    throw new Error("Failed to fetch Google Sheets");
  }
};

// Export leads to Google Sheets
export const onExportLeadsToGoogleSheets = async (
  spreadsheetId: string,
  sheetName: string,
  leads: any[]
) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // First, get the user from the database to ensure we have the correct UUID
    const user = await client.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      throw new Error("User not found in database");
    }

    const integration = await client.googleIntegration.findUnique({
      where: { userId: user.id },
    });

    if (!integration) {
      throw new Error("No Google integration found");
    }

    // Check if token needs refresh
    if (new Date() > integration.expiresAt) {
      await onRefreshGoogleToken();
    }

    // Get fresh integration data after potential refresh
    const freshIntegration = await client.googleIntegration.findUnique({
      where: { userId: user.id },
    });

    if (!freshIntegration) {
      throw new Error("No Google integration found after refresh");
    }

    // Prepare CSV data
    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Country Code",
      "Created Date",
      "Last Message",
      "Last Message Date",
      "Message Count",
    ];

    const rows = leads.map((lead) => [
      lead.id,
      lead.name || "",
      lead.email || "",
      lead.phone || "",
      lead.countryCode || "",
      new Date(lead.createdAt).toISOString(),
      lead.lastMessage || "",
      lead.lastMessageDate ? new Date(lead.lastMessageDate).toISOString() : "",
      lead.messageCount || 0,
    ]);

    // Upload to Google Sheets
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1?valueInputOption=RAW`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${freshIntegration.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: [headers, ...rows],
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to export to Google Sheets");
    }

    // Log export history
    await client.exportHistory.create({
      data: {
        userId: user.id,
        spreadsheetId,
        sheetName,
        recordCount: leads.length,
        status: "SUCCESS",
      },
    });

    return { success: true, exportedCount: leads.length };
  } catch (error) {
    console.error("Error exporting to Google Sheets:", error);

    // Log failed export
    try {
      const { userId } = await auth();
      if (userId) {
        const user = await client.user.findUnique({
          where: { clerkId: userId },
          select: { id: true },
        });

        if (user) {
          await client.exportHistory.create({
            data: {
              userId: user.id,
              spreadsheetId,
              sheetName,
              recordCount: leads.length,
              status: "FAILED",
            },
          });
        }
      }
    } catch (logError) {
      console.error("Error logging export failure:", logError);
    }

    throw new Error("Failed to export leads to Google Sheets");
  }
};

// Disconnect Google integration
export const onDisconnectGoogle = async () => {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // First, get the user from the database to ensure we have the correct UUID
    const user = await client.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      throw new Error("User not found in database");
    }

    await client.googleIntegration.delete({
      where: { userId: user.id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error disconnecting Google integration:", error);
    throw new Error("Failed to disconnect Google integration");
  }
};
