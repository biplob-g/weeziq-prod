import { NextRequest, NextResponse } from "next/server";
import { onHandleGoogleCallback } from "@/actions/integration";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    // Add a simple test endpoint
    if (searchParams.get("test") === "true") {
      return NextResponse.json({
        message: "Google OAuth callback route is working!",
        timestamp: new Date().toISOString(),
      });
    }

    if (error) {
      console.error("Google OAuth error:", error);
      return NextResponse.redirect(
        new URL("/integration?error=oauth_failed", request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/integration?error=no_code", request.url)
      );
    }

    // Handle the OAuth callback
    await onHandleGoogleCallback(code);

    // Redirect back to integration page with success
    return NextResponse.redirect(
      new URL("/integration?success=true", request.url)
    );
  } catch (error) {
    console.error("Error handling Google OAuth callback:", error);
    return NextResponse.redirect(
      new URL("/integration?error=callback_failed", request.url)
    );
  }
}
