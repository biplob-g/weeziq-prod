"use client";

import React, { useState, useMemo } from "react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import { Search, MessageCircle, ChevronRight } from "lucide-react";
import type { ChatbotPage } from "@/hooks/chatbot/types";
import LoadingSkeleton from "../LoadingSkeleton";

interface HelpDeskQuestion {
  id: string;
  question: string;
  answered: string;
  domainId: string | null;
}

interface HelpDeskListPageProps {
  questions: HelpDeskQuestion[];
  onNavigateToPage: (page: ChatbotPage, data?: any) => void;
  onStartNewChat: () => void;
  isLoading?: boolean;
}

const HelpDeskListPage: React.FC<HelpDeskListPageProps> = ({
  questions,
  onNavigateToPage,
  onStartNewChat,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch = q.question
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      // For now, we'll show all questions regardless of category
      // You can implement category filtering based on your data structure
      return matchesSearch;
    });
  }, [questions, searchQuery]);

  const handleQuestionClick = (question: HelpDeskQuestion) => {
    onNavigateToPage("answer", {
      question: question,
      answer: question.answered,
      related: [], // You can implement related questions logic
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        {/* Search Bar Skeleton */}
        <div className="p-4 border-b">
          <div className="h-10 bg-muted-foreground/20 rounded animate-pulse"></div>
        </div>

        {/* Categories Skeleton */}
        <div className="p-4 border-b bg-muted/20">
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-8 w-20 bg-muted-foreground/20 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </div>

        {/* Questions List Skeleton */}
        <div className="flex-1 overflow-y-auto p-4">
          <LoadingSkeleton variant="card" lines={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No articles found
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery
                ? `No articles match "${searchQuery}"`
                : "No help articles available"}
            </p>
            <Button onClick={onStartNewChat} className="mt-2">
              <MessageCircle className="w-4 h-4 mr-2" />
              Start a conversation
            </Button>
          </div>
        ) : (
          filteredQuestions.map((question) => (
            <Card
              key={question.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleQuestionClick(question)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1 line-clamp-2">
                      {question.question}
                    </h4>
                    {question.answered && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {question.answered.substring(0, 100)}
                        {question.answered.length > 100 ? "..." : ""}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground ml-2 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/20">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-2">
            Can&apos;t find what you&apos;re looking for?
          </p>
          <Button onClick={onStartNewChat} size="sm">
            <MessageCircle className="w-4 h-4 mr-2" />
            Start a conversation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HelpDeskListPage;
