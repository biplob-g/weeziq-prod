"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import Section from "../SectionLabel";
import { RichTextEditor } from "../ui/rich-text-editor";
import { toast } from "sonner";
import {
  onUpdateTaskSummary,
  onGetTaskSummary,
  onGenerateTaskSummary,
} from "@/actions/settings";
import { Sparkles } from "lucide-react";
import FileUpload from "./FileUpload";

type Props = {
  id: string;
};

const TaskSummary = ({ id }: Props) => {
  const [taskSummary, setTaskSummary] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Load existing task summary on component mount
  useEffect(() => {
    const loadTaskSummary = async () => {
      try {
        const summary = await onGetTaskSummary(id);
        if (summary && summary.taskSummary) {
          setTaskSummary(summary.taskSummary);
        }
      } catch (error) {
        console.error("Error loading task summary:", error);
      }
    };

    loadTaskSummary();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await onUpdateTaskSummary(id, taskSummary);

      if (result.success) {
        toast("Success", {
          description: "Task summary updated successfully!",
        });
        setIsEditing(false);
      } else {
        toast("Error", {
          description: result.error || "Failed to update task summary",
        });
      }
    } catch (error) {
      console.error("Error updating task summary:", error);
      toast("Error", {
        description: "Failed to update task summary",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reload the original task summary
    const loadTaskSummary = async () => {
      try {
        const summary = await onGetTaskSummary(id);
        if (summary && summary.taskSummary) {
          setTaskSummary(summary.taskSummary);
        }
      } catch (error) {
        console.error("Error loading task summary:", error);
      }
    };
    loadTaskSummary();
  };

  // ✅ NEW: Handle AI generation from editor content
  const handleGenerateWithAI = async () => {
    if (!taskSummary.trim()) {
      toast("Error", {
        description: "Please add some content about your platform first",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await onGenerateTaskSummary(taskSummary, id);

      if (result.success && result.taskSummary) {
        setTaskSummary(result.taskSummary);
        toast("Success", {
          description: "AI-generated task summary created successfully!",
        });
      } else {
        toast("Error", {
          description: result.error || "Failed to generate task summary",
        });
      }
    } catch (error) {
      console.error("Error generating task summary:", error);
      toast("Error", {
        description: "Failed to generate task summary",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 flex gap-5">
      <Card className="w-full">
        <CardContent className="p-6">
          <CardTitle className="mb-6">Task Summary</CardTitle>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <Section
                label="Platform Description"
                message="Provide a detailed description of what your platform does. Use the toolbar to format your text. This will help the AI understand your business and provide more accurate responses to customers."
              />

              {isEditing ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="relative">
                    <RichTextEditor
                      value={taskSummary}
                      onChange={(value: string) => setTaskSummary(value)}
                    />

                    {/* ✅ NEW: AI Generation Button inside editor */}
                    <div className="absolute top-2.5 right-3 z-10">
                      <Button
                        type="button"
                        onClick={handleGenerateWithAI}
                        disabled={isGenerating || !taskSummary.trim()}
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-3 py-1.5 rounded-md transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        title="Generate AI-powered summary from your content"
                      >
                        {isGenerating ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                            <span className="text-xs">Generating...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3 w-3" />
                            <span className="text-xs">Generate with AI</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-primary hover:opacity-90 cursor-pointer transition duration-150 ease-in-out text-white font-semibold"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCancel}
                      variant="outline"
                      className="cursor-pointer transition duration-150 ease-in-out"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {taskSummary ? (
                    <div className="p-4 bg-gray-50 rounded-md border">
                      <div
                        className="prose prose-sm max-w-none text-sm text-gray-700"
                        dangerouslySetInnerHTML={{ __html: taskSummary }}
                      />
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-md border border-dashed">
                      <p className="text-sm text-gray-500 text-center">
                        No task summary provided yet. Click &quot;Edit&quot; to
                        add a description of your platform.
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleEdit}
                    className="bg-primary hover:opacity-90 cursor-pointer transition duration-150 ease-in-out text-white font-semibold"
                  >
                    {taskSummary ? "Edit Summary" : "Add Summary"}
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="font-semibold text-blue-800 mb-2">
                💡 How this helps your AI
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>
                  • The AI will use this information to understand your business
                  context
                </li>
                <li>
                  • Responses will be tailored to your specific services and
                  offerings
                </li>
                <li>
                  • Customers will get more relevant and accurate information
                </li>
                <li>
                  • The AI can better handle questions about your
                  platform&apos;s capabilities
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✅ NEW: File Upload Section */}
      <FileUpload domainId={id} />
    </div>
  );
};

export default TaskSummary;
