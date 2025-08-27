"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface Domain {
  name: string;
  id: string;
  icon: string;
}

interface IntegrationLayoutProps {
  domains?: Domain[];
}

interface GoogleIntegration {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  email: string;
  isConnected: boolean;
}

const IntegrationLayout = ({ domains: _domains }: IntegrationLayoutProps) => {
  const [googleIntegration, setGoogleIntegration] =
    useState<GoogleIntegration | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Check if Google Sheets is connected on component mount
  useEffect(() => {
    checkGoogleConnection();
  }, []);

  const checkGoogleConnection = async () => {
    try {
      const { onCheckGoogleIntegration } = await import(
        "@/actions/integration"
      );
      const result = await onCheckGoogleIntegration();

      if (result.isConnected && result.integration) {
        setGoogleIntegration({
          id: result.integration.id,
          userId: result.integration.id,
          accessToken: result.integration.accessToken,
          refreshToken: result.integration.refreshToken,
          expiresAt: result.integration.expiresAt,
          email: result.integration.email,
          isConnected: true,
        });
      } else {
        setGoogleIntegration(null);
      }
    } catch (error) {
      console.error("Error checking Google connection:", error);
      setGoogleIntegration(null);
    }
  };

  const handleGoogleConnect = async () => {
    setIsConnecting(true);
    try {
      // Use the new API endpoint instead of server action
      window.location.href = "/api/integrations/google/auth";
    } catch (error) {
      console.error("Error connecting to Google:", error);
      toast.error("Failed to connect to Google Sheets");
      setIsConnecting(false);
    }
  };

  const handleGoogleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      const { onDisconnectGoogle } = await import("@/actions/integration");
      await onDisconnectGoogle();

      setGoogleIntegration(null);
      setIsDisconnecting(false);
      toast.success("Google Sheets disconnected successfully");
    } catch (error) {
      console.error("Error disconnecting from Google:", error);
      toast.error("Failed to disconnect from Google Sheets");
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col space-y-6 p-6">
      {/* Google Sheets Integration */}
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FileSpreadsheet className="h-6 w-6 text-green-600" />
            Google Sheets Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="font-medium">Export leads to Google Sheets</h3>
              <p className="text-sm text-muted-foreground">
                Connect your Google account to export lead data directly to
                Google Sheets
              </p>
            </div>
            <div className="flex items-center gap-2">
              {googleIntegration?.isConnected ? (
                <Badge
                  variant="default"
                  className="bg-green-100 text-green-800"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="h-4 w-4 mr-1" />
                  Not Connected
                </Badge>
              )}
            </div>
          </div>

          {googleIntegration?.isConnected ? (
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">
                    Google Sheets Connected ✅
                  </span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Connected as: {googleIntegration.email}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleGoogleDisconnect}
                  disabled={isDisconnecting}
                  className="flex items-center gap-2"
                >
                  {isDisconnecting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {isDisconnecting ? "Disconnecting..." : "Disconnect"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(
                      "https://myaccount.google.com/permissions",
                      "_blank"
                    )
                  }
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Manage Permissions
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-gray-400 transition-colors cursor-pointer">
                <div className="space-y-2">
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400" />
                  <div>
                    <h4 className="font-medium">Connect Google Sheets</h4>
                    <p className="text-sm text-muted-foreground">
                      Click to connect your Google account and enable exports
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleGoogleConnect}
                disabled={isConnecting}
                className="w-full flex items-center gap-2"
              >
                {isConnecting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                ) : (
                  <FileSpreadsheet className="h-4 w-4" />
                )}
                {isConnecting ? "Connecting..." : "Connect Google Sheets"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integration Features */}
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium">Export Leads to Google Sheets</h4>
                <p className="text-sm text-muted-foreground">
                  Export all your lead data with proper column structure
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium">Choose Spreadsheet & Sheet</h4>
                <p className="text-sm text-muted-foreground">
                  Select existing spreadsheets or create new ones
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium">CSV-Compatible Format</h4>
                <p className="text-sm text-muted-foreground">
                  Data exported with proper headers and formatting
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium">Secure OAuth Authentication</h4>
                <p className="text-sm text-muted-foreground">
                  Safe and secure connection using Google OAuth 2.0
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationLayout;
