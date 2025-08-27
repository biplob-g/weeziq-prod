"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageSquare, Star } from "lucide-react";

interface SatisfactionRatingProps {
  onSubmit: (rating: "positive" | "negative", feedback?: string) => void;
  onClose: () => void;
}

const SatisfactionRating: React.FC<SatisfactionRatingProps> = ({
  onSubmit,
  onClose,
}) => {
  const [rating, setRating] = useState<"positive" | "negative" | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating) {
      onSubmit(rating, feedback);
      setIsSubmitted(true);

      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Star className="h-8 w-8 text-yellow-500 fill-current" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            Thank you for your feedback!
          </h3>
          <p className="text-sm text-gray-600">
            Your rating helps us improve our service.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2">
          <MessageSquare className="h-5 w-5" />
          How was your experience?
        </CardTitle>
        <p className="text-sm text-gray-600">
          It was great talking to you! How would you like to rate my service?
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rating Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            variant={rating === "positive" ? "default" : "outline"}
            size="lg"
            onClick={() => setRating("positive")}
            className="flex items-center gap-2 px-6"
          >
            <ThumbsUp className="h-5 w-5" />
            Great!
          </Button>
          <Button
            variant={rating === "negative" ? "default" : "outline"}
            size="lg"
            onClick={() => setRating("negative")}
            className="flex items-center gap-2 px-6"
          >
            <ThumbsDown className="h-5 w-5" />
            Could be better
          </Button>
        </div>

        {/* Feedback Input */}
        {rating && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {rating === "positive"
                ? "What did you like most?"
                : "How can we improve?"}
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={
                rating === "positive"
                  ? "Tell us what you enjoyed..."
                  : "Share your suggestions..."
              }
              className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Skip
          </Button>
          <Button onClick={handleSubmit} disabled={!rating} className="flex-1">
            Submit Rating
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SatisfactionRating;
