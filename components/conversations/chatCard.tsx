"use client";
import { useChatTime } from "@/hooks/conversation/useConversation";
import React, { useState } from "react";
import { Card, CardContent, CardDescription } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Radio, User, Clock, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
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

type Props = {
  title: string;
  description: string;
  createdAt: Date;
  id: string;
  onChat(): void;
  onDelete?: (id: string) => void;
  showDelete?: boolean;
  seen?: boolean;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  customerCountryCode?: string | null;
  isExpired?: boolean;
  isSelected?: boolean; // NEW: Add selection state
};

const ChatCard = ({
  title,
  description,
  createdAt,
  id,
  onChat,
  onDelete,
  showDelete = false,
  seen,
  customerName,
  isExpired = false,
  isSelected = false, // NEW: Default to false
}: Props) => {
  const { messageSentAt, urgent } = useChatTime(createdAt, id);
  const [isDeleting, setIsDeleting] = useState(false);

  // Generate avatar initials from customer name
  const getAvatarInitials = (name: string | null | undefined): string => {
    if (!name) return "?";
    const names = name.trim().split(" ");
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(id);
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card
      onClick={onChat}
      className={`rounded-none border-r-0 hover:bg-muted cursor-pointer transition duration-150 ease-in-out ${
        isExpired ? "border-l-4 border-l-orange-500" : ""
      } ${isSelected ? "bg-muted border-l-4 border-l-primary" : ""}`}
    >
      <CardContent
        className={`p-4 ${isSelected ? "bg-muted" : "bg-background"}`}
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarFallback
              className={`${
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
              } font-semibold`}
            >
              {customerName ? getAvatarInitials(customerName) : <User />}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* First line: Customer name and status indicators */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <CardDescription className="font-semibold text-foreground truncate">
                  {customerName || title}
                </CardDescription>
                {urgent && !seen && (
                  <Radio className="w-3 h-3 text-red-500 flex-shrink-0" />
                )}
                {isExpired && (
                  <Clock className="w-3 h-3 text-orange-500 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {showDelete && onDelete && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-6 w-6"
                        title="Delete conversation"
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this conversation?
                          This action cannot be undone and will permanently
                          remove all messages and customer data associated with
                          this chat.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-red-500 hover:bg-red-600 text-white"
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                <CardDescription className="text-xs text-muted-foreground">
                  {createdAt ? messageSentAt : ""}
                </CardDescription>
              </div>
            </div>

            {/* Second line: Last message */}
            <CardDescription className="text-sm text-muted-foreground truncate">
              {description
                ? description.length > 50
                  ? description.substring(0, 50) + "..."
                  : description
                : "This chatroom is empty"}
            </CardDescription>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatCard;
