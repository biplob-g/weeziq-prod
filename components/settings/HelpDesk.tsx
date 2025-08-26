"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardTitle } from "../ui/card";
import Section from "../SectionLabel";

import { Button } from "../ui/button";
import { Loader } from "../loader";
import Accordion from "../accordion";
import { RichTextEditor } from "../ui/rich-text-editor";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HelpDeskQuestionsScehma } from "@/schemas/settings.schema";
import {
  onCreateHelpDeskQuestion,
  onGetAllHelpDeskQuestions,
  onDeleteHelpDeskQuestion,
  onUpdateHelpDeskQuestion,
} from "@/actions/settings";
import { toast } from "sonner";
import { Edit, Trash2, X, Check } from "lucide-react";
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
// import { Separator } from "../ui/separator";

type Props = {
  id: string;
};

const HelpDesk = ({ id }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(HelpDeskQuestionsScehma),
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [isQuestions, setIsQuestions] = useState<
    { id: string; question: string; answer: string }[]
  >([]);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    question: "",
    answer: "",
  });
  const [questionToDelete, setQuestionToDelete] = useState<{
    id: string;
    question: string;
  } | null>(null);

  const answerContent = watch("answer") || "";

  const onSubmitQuestion = handleSubmit(async (values) => {
    setLoading(true);
    try {
      const question = await onCreateHelpDeskQuestion(
        id,
        values.question,
        values.answer
      );
      if (question) {
        // Fix: question.helpdesk is an array, get the last item
        if (question.question && Array.isArray(question.question)) {
          const newQuestion = question.question[question.question.length - 1];
          setIsQuestions((prev) => [
            ...prev,
            {
              id: newQuestion.id,
              question: newQuestion.question,
              answer: newQuestion.answered,
            },
          ]);
        }
        toast(question.status === 200 ? "Success" : "Error", {
          description: question.message,
        });
        reset();
      }
    } finally {
      setLoading(false);
    }
  });

  const onGetQuestions = React.useCallback(async () => {
    setLoading(true);
    const questions = await onGetAllHelpDeskQuestions(id);
    if (questions) {
      const mappedQuestions =
        questions.questions?.map((q) => ({
          id: q.id,
          question: q.question,
          answer: q.answered,
        })) || [];
      setIsQuestions(mappedQuestions);
    }
    setLoading(false);
  }, [id]);

  const handleDelete = async () => {
    if (!questionToDelete) return;

    setLoading(true);
    try {
      const result = await onDeleteHelpDeskQuestion(questionToDelete.id);
      if (result?.status === 200) {
        setIsQuestions((prev) =>
          prev.filter((q) => q.id !== questionToDelete.id)
        );
        toast("Success", {
          description: result.message,
        });
      } else {
        toast("Error", {
          description: result?.message || "Failed to delete question",
        });
      }
    } finally {
      setLoading(false);
      setQuestionToDelete(null);
    }
  };

  const handleEdit = (question: {
    id: string;
    question: string;
    answer: string;
  }) => {
    setEditingQuestion(question.id);
    setEditForm({
      question: question.question,
      answer: question.answer,
    });
  };

  const handleUpdate = async () => {
    if (!editingQuestion) return;

    setLoading(true);
    try {
      const result = await onUpdateHelpDeskQuestion(
        editingQuestion,
        editForm.question,
        editForm.answer
      );

      if (result?.status === 200) {
        setIsQuestions((prev) =>
          prev.map((q) =>
            q.id === editingQuestion
              ? {
                  ...q,
                  question: editForm.question,
                  answer: editForm.answer,
                }
              : q
          )
        );
        toast("Success", {
          description: result.message,
        });
        setEditingQuestion(null);
        setEditForm({ question: "", answer: "" });
      } else {
        toast("Error", {
          description: result?.message || "Failed to update question",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingQuestion(null);
    setEditForm({ question: "", answer: "" });
  };

  React.useEffect(() => {
    onGetQuestions();
  }, [onGetQuestions]);

  return (
    <Card className="w-full grid grid-cols-1 lg:grid-cols-2">
      <CardContent className="p-6">
        <CardTitle>Help Desk</CardTitle>
        <form onSubmit={onSubmitQuestion} className="flex flex-col gap-6 mt-6">
          <div className="flex flex-col gap-3">
            <Section
              label="Question"
              message="Add a question that you believe is frequently asked."
            />
            <input
              {...register("question")}
              placeholder="Type your question"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.question && (
              <p className="text-sm text-destructive">
                {errors.question.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <Section
              label="Answer"
              message="Provide the answer to this frequently asked question. Use the toolbar to format your text."
            />
            <RichTextEditor
              value={answerContent}
              onChange={(value) => setValue("answer", value)}
              error={!!errors.answer}
            />
            {errors.answer && (
              <p className="text-sm text-destructive">
                {errors.answer.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="bg-primary hover:bg-primary cursor-pointer hover:backdrop-opacity-70 transition duration-150 ease-in-out text-white font-semibold"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create"}
          </Button>
        </form>
      </CardContent>

      <CardContent className="p-5 overflow-y-auto chat-window">
        <Loader loading={loading}>
          {isQuestions.length ? (
            isQuestions.map((question, index) => (
              <div key={question.id || `question-${index}`} className="mb-4">
                {editingQuestion === question.id ? (
                  // Edit Mode
                  <Card className="border-2 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-3">
                        <div>
                          <label className="text-sm font-medium">
                            Question
                          </label>
                          <input
                            value={editForm.question}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                question: e.target.value,
                              }))
                            }
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Answer</label>
                          <RichTextEditor
                            value={editForm.answer}
                            onChange={(value) =>
                              setEditForm((prev) => ({
                                ...prev,
                                answer: value,
                              }))
                            }
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEdit}
                            disabled={loading}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleUpdate}
                            disabled={loading}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            {loading ? "Updating..." : "Update"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  // View Mode
                  <div className="relative">
                    <Accordion
                      id={question.id || `question-${index}`}
                      trigger={question.question}
                      content={question.answer}
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(question)}
                        className="h-8 w-8 p-0 hover:bg-blue-100"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-100"
                            disabled={loading}
                            onClick={() => setQuestionToDelete(question)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Question</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the question
                              &ldquo;{questionToDelete?.question}&rdquo;? This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              onClick={() => setQuestionToDelete(null)}
                            >
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDelete}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              disabled={loading}
                            >
                              {loading ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <CardDescription>No Questions added yet.</CardDescription>
          )}
        </Loader>
      </CardContent>
    </Card>
  );
};

export default HelpDesk;
