"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  FileJson,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  onGetDomainFiles,
  onDeleteFile,
  onGetUploadLimits,
} from "@/actions/settings";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

interface FileUploadProps {
  domainId: string;
}

interface FileRecord {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadStatus: string;
  createdAt: Date;
}

interface UploadLimits {
  plan: string;
  maxTotalSize: number;
  currentTotalSize: number;
  usedPercentage: number;
  remainingSize: number;
}

const FileUpload: React.FC<FileUploadProps> = ({ domainId }) => {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [uploadLimits, setUploadLimits] = useState<UploadLimits | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [_uploadingFileId, setUploadingFileId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load files and limits on component mount
  useEffect(() => {
    loadFilesAndLimits();
  }, [domainId]);

  const loadFilesAndLimits = async () => {
    try {
      setIsLoading(true);
      const [filesData, limitsData] = await Promise.all([
        onGetDomainFiles(domainId),
        onGetUploadLimits(domainId),
      ]);

      setFiles(filesData);
      if (limitsData.success && limitsData.plan) {
        setUploadLimits({
          plan: limitsData.plan,
          maxTotalSize: limitsData.maxTotalSize,
          currentTotalSize: limitsData.currentTotalSize,
          usedPercentage: limitsData.usedPercentage,
          remainingSize: limitsData.remainingSize,
        });
      }
    } catch (error) {
      console.error("Error loading files and limits:", error);
      toast("Error", {
        description: "Failed to load files and upload limits",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const file = selectedFiles[0];

    // Validate file type
    const allowedTypes = [".txt", ".json"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));

    if (!allowedTypes.includes(fileExtension)) {
      toast("Error", {
        description: "Only .txt and .json files are allowed",
      });
      return;
    }

    // Validate file size (2MB limit)
    const maxFileSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxFileSize) {
      toast("Error", {
        description: "File size must not exceed 2MB",
      });
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    const tempFileId = `temp-${Date.now()}`;
    setUploadingFileId(tempFileId);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("domainId", domainId);

      // Upload file using API route
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        toast("Success", {
          description: "File uploaded successfully!",
        });

        // Reload files and limits
        await loadFilesAndLimits();
      } else {
        toast("Error", {
          description: result.error || "Failed to upload file",
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast("Error", {
        description: "Failed to upload file",
      });
    } finally {
      setUploadingFileId(null);
      setUploadProgress(0);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    setDeletingFileId(fileId);
    try {
      const result = await onDeleteFile(fileId);

      if (result.success) {
        toast("Success", {
          description: "File deleted successfully!",
        });

        // Reload files and limits
        await loadFilesAndLimits();
      } else {
        toast("Error", {
          description: result.error || "Failed to delete file",
        });
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast("Error", {
        description: "Failed to delete file",
      });
    } finally {
      setDeletingFileId(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "PROCESSING":
        return (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        );
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <CardTitle className="mb-6">File Upload</CardTitle>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Loading files...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <CardTitle className="mb-6">File Upload</CardTitle>

        <div className="space-y-6">
          {/* Upload Limits */}
          {uploadLimits && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Storage Usage ({uploadLimits.plan} Plan)
                </span>
                <span className="text-sm text-gray-500">
                  {formatFileSize(uploadLimits.currentTotalSize)} /{" "}
                  {formatFileSize(uploadLimits.maxTotalSize)}
                </span>
              </div>
              <Progress
                value={uploadLimits.usedPercentage}
                className="h-2 transition-all duration-500 ease-out"
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">
                  {uploadLimits.usedPercentage.toFixed(1)}% used
                </span>
                <span className="text-xs text-gray-500">
                  {formatFileSize(uploadLimits.remainingSize)} remaining
                </span>
              </div>
            </div>
          )}

          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-all duration-300 hover:border-blue-400 hover:bg-blue-50/50">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.json"
              onChange={handleFileSelect}
              className="hidden"
              disabled={_uploadingFileId !== null}
            />

            {_uploadingFileId !== null ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Uploading file...
                  </p>
                  <Progress
                    value={uploadProgress}
                    className="h-2 mt-2 transition-all duration-300 ease-out"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-8 w-8 mx-auto text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Upload files for AI processing
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: .txt, .json (max 2MB per file)
                  </p>
                </div>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="sm"
                  disabled={_uploadingFileId !== null}
                >
                  Choose File
                </Button>
              </div>
            )}
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">
                Uploaded Files
              </h3>
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100"
                  >
                    <div className="flex items-center space-x-3">
                      {file.fileType === ".txt" ? (
                        <FileText className="h-5 w-5 text-blue-500" />
                      ) : (
                        <FileJson className="h-5 w-5 text-green-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {file.fileName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.fileSize)} • {file.fileType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(file.uploadStatus)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(file.uploadStatus)}
                          <span className="text-xs capitalize">
                            {file.uploadStatus.toLowerCase()}
                          </span>
                        </div>
                      </Badge>

                      {deletingFileId === file.id ? (
                        <div className="flex items-center space-x-2 text-red-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          <span className="text-xs">Deleting...</span>
                        </div>
                      ) : (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete File</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;
                                {file.fileName}&quot;? This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteFile(file.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Uploaded files will be processed by the AI system to provide more
              accurate responses to customer queries. Files are stored securely
              and linked to your domain for AI processing.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
