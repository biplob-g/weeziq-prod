import { NextRequest, NextResponse } from "next/server";
import { onExportLeadsToGoogleSheets } from "@/actions/integration";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { spreadsheetId, sheetName, leads } = body;

    if (!spreadsheetId || !sheetName || !leads) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const result = await onExportLeadsToGoogleSheets(
      spreadsheetId,
      sheetName,
      leads
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error exporting to Google Sheets:", error);
    return NextResponse.json(
      { error: "Failed to export to Google Sheets" },
      { status: 500 }
    );
  }
}
