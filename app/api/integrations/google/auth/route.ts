import { NextRequest, NextResponse } from "next/server";
import { onGetGoogleAuthUrl } from "@/actions/integration";

export async function GET(request: NextRequest) {
  try {
    const { authUrl } = await onGetGoogleAuthUrl();

    // Redirect to Google OAuth
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Error initiating Google OAuth:", error);
    return NextResponse.redirect(
      new URL("/integration?error=auth_failed", request.url)
    );
  }
}
