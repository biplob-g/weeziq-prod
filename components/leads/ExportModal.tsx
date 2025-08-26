"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { FileSpreadsheet, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  onGetGoogleSheets,
  onExportLeadsToGoogleSheets,
} from "@/actions/integration";

interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  countryCode: string | null;
  createdAt: Date;
  chatRoomId: string;
  lastMessage?: string;
  lastMessageDate?: Date;
  messageCount: number;
}

interface GoogleSheet {
  id: string;
  name: string;
  createdTime: string;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
}

const ExportModal = ({ isOpen, onClose, leads }: ExportModalProps) => {
  const [sheets, setSheets] = useState<GoogleSheet[]>([]);
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] =
    useState<string>("");
  const [sheetName, setSheetName] = useState<string>("Sheet1");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);

  // Load Google Sheets when modal opens
  useEffect(() => {
    if (isOpen) {
      loadGoogleSheets();
    }
  }, [isOpen]);

  const loadGoogleSheets = async () => {
    setIsLoadingSheets(true);
    try {
      const response = await onGetGoogleSheets();
      setSheets(response.sheets || []);
    } catch (error) {
      console.error("Error loading Google Sheets:", error);
      toast.error("Failed to load Google Sheets");
    } finally {
      setIsLoadingSheets(false);
    }
  };

  const handleExport = async () => {
    if (!selectedSpreadsheetId) {
      toast.error("Please select a spreadsheet");
      return;
    }

    if (!sheetName.trim()) {
      toast.error("Please enter a sheet name");
      return;
    }

    setIsLoading(true);
    try {
      const result = await onExportLeadsToGoogleSheets(
        selectedSpreadsheetId,
        sheetName.trim(),
        leads
      );

      toast.success(
        `Successfully exported ${result.exportedCount} leads to Google Sheets!`
      );
      onClose();
    } catch (error) {
      console.error("Error exporting leads:", error);
      toast.error("Failed to export leads to Google Sheets");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewSpreadsheet = () => {
    // TODO: Implement creating new spreadsheet
    toast.info("Creating new spreadsheet functionality coming soon!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Export to Google Sheets
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Spreadsheet Selection */}
          <div className="space-y-2">
            <Label htmlFor="spreadsheet">Select Spreadsheet</Label>
            <div className="flex gap-2">
              <Select
                value={selectedSpreadsheetId}
                onValueChange={setSelectedSpreadsheetId}
                disabled={isLoadingSheets}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Choose a spreadsheet" />
                </SelectTrigger>
                <SelectContent>
                  {sheets.map((sheet) => (
                    <SelectItem key={sheet.id} value={sheet.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{sheet.name}</span>
                        <span className="text-xs text-muted-foreground">
                          Created:{" "}
                          {new Date(sheet.createdTime).toLocaleDateString()}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={handleCreateNewSpreadsheet}
                disabled={isLoadingSheets}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {isLoadingSheets && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Loading spreadsheets...
              </div>
            )}
          </div>

          {/* Sheet Name */}
          <div className="space-y-2">
            <Label htmlFor="sheetName">Sheet Name</Label>
            <Input
              id="sheetName"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              placeholder="Sheet1"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Enter the name of the sheet where data will be exported
            </p>
          </div>

          {/* Export Summary */}
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Export Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Total Leads:</span>
                <span className="font-medium">{leads.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Columns:</span>
                <span className="font-medium">9 columns</span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                ID, Name, Email, Phone, Country Code, Created Date, Last
                Message, Last Message Date, Message Count
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isLoading || !selectedSpreadsheetId || !sheetName.trim()}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            {isLoading ? "Exporting..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
