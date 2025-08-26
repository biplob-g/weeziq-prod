"use client";

import React from "react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import {
  ArrowLeft,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
} from "lucide-react";
import type { ChatbotPage } from "@/hooks/chatbot/types";

interface HelpDeskAnswerPageProps {
  question: any;
  answer: string;
  related: any[];
  onNavigateBack: () => void;
  onNavigateToPage: (page: ChatbotPage, data?: any) => void;
  onStartNewChat: () => void;
}

const HelpDeskAnswerPage: React.FC<HelpDeskAnswerPageProps> = ({
  question,
  answer,
  related,
  onNavigateBack,
  onNavigateToPage,
  onStartNewChat,
}) => {
  const [feedback, setFeedback] = React.useState<
    "helpful" | "not-helpful" | null
  >(null);

  const handleFeedback = (type: "helpful" | "not-helpful") => {
    setFeedback(type);
    // Here you could also send feedback to your analytics system
    console.log(
      `User found this ${type === "helpful" ? "helpful" : "not helpful"}`
    );
  };

  if (!question || !answer) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="text-4xl">📄</div>
          <h3 className="text-lg font-medium text-muted-foreground">
            Article not found
          </h3>
          <p className="text-sm text-muted-foreground">
            The requested help article could not be loaded.
          </p>
          <Button onClick={onNavigateBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Help Center
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Article Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Question */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{question.question}</CardTitle>
          </CardHeader>
        </Card>

        {/* Answer */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Answer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              {/* Format the answer with basic HTML support */}
              <div
                className="text-sm leading-relaxed space-y-3"
                dangerouslySetInnerHTML={{
                  __html: answer.replace(/\n/g, "<br/>"),
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Feedback Section */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <p className="text-sm font-medium">Was this helpful?</p>
              <div className="flex justify-center gap-2">
                <Button
                  variant={feedback === "helpful" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFeedback("helpful")}
                  className="flex items-center gap-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Yes
                </Button>
                <Button
                  variant={
                    feedback === "not-helpful" ? "destructive" : "outline"
                  }
                  size="sm"
                  onClick={() => handleFeedback("not-helpful")}
                  className="flex items-center gap-2"
                >
                  <ThumbsDown className="w-4 h-4" />
                  No
                </Button>
              </div>
              {feedback === "not-helpful" && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">
                    Sorry this wasn&apos;t helpful. Would you like to chat with
                    us?
                  </p>
                  <Button size="sm" onClick={onStartNewChat}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Start Chat
                  </Button>
                </div>
              )}
              {feedback === "helpful" && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs text-green-700 dark:text-green-300">
                    Great! Thank you for your feedback.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Related Articles */}
        {related && related.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Related Articles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {related.map((relatedItem, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                  onClick={() =>
                    onNavigateToPage("answer", {
                      question: relatedItem,
                      answer: relatedItem.answered,
                      related: [],
                    })
                  }
                >
                  <span className="text-sm flex-1">{relatedItem.question}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t bg-muted/20 space-y-2">
        <Button
          onClick={() => onNavigateToPage("helpdesk")}
          variant="outline"
          className="w-full"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Help Center
        </Button>
        <Button onClick={onStartNewChat} className="w-full">
          <MessageCircle className="w-4 h-4 mr-2" />
          Start a conversation
        </Button>
      </div>
    </div>
  );
};

export default HelpDeskAnswerPage;
