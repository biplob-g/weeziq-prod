import { cn, extractUUIDFromString, getMonthName } from "@/lib/utils";
import React from "react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Props = {
  message: {
    role: "assistant" | "user";
    content: string;
    link?: string;
    createdAt?: Date;
  };
};

const Bubble = ({ message }: Props) => {
  const d = new Date();

  // ✅ Enhanced error handling and debugging
  if (!message) {
    console.error("❌ Bubble component received undefined message");
    return null;
  }

  const messageContent = message?.content || "";
  const messageRole = message?.role || "user"; // ✅ Default to "user" if role is undefined

  // ✅ Debug logging
  if (!message.role) {
    console.warn("⚠️ Message without role:", message);
  }

  const image = messageContent ? extractUUIDFromString(messageContent) : null;

  return (
    <div
      className={cn(
        "flex gap-2 items-end",
        messageRole === "assistant" ? "self-start" : "self-end flex-row-reverse"
      )}
    >
      {messageRole === "assistant" ? (
        <Avatar className="w-5 h-5 border-2 border-purple-300">
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white text-xs">
            AI
          </AvatarFallback>
        </Avatar>
      ) : (
        <Avatar className="w-5 h-5 border-2 border-pink-300">
          <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-xs">
            <User className="w-3 h-3" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "flex flex-col gap-3 min-w-[20px] max-w-[300px] p-4 rounded-t-md shadow-md",
          messageRole === "assistant"
            ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-r-md"
            : "bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-t-md"
        )}
      >
        {message.createdAt ? (
          <div className="flex gap-2 text-xs text-white/80">
            <p>
              {message.createdAt.getDate()}{" "}
              {getMonthName(message.createdAt.getMonth())}
            </p>
            <p>
              {message.createdAt.getHours()}:{message.createdAt.getMinutes()}
              {message.createdAt.getHours() > 12 ? "PM" : "AM"}
            </p>
          </div>
        ) : (
          <p className="text-xs text-white/80">
            {`${d.getHours()}:${d.getMinutes()} ${
              d.getHours() > 12 ? "PM" : "AM"
            }`}
          </p>
        )}

        {image ? (
          <div className="relative aspect-square">
            <Image src={`https://ucarecdn.com/${image[0]}/`} fill alt="image" />
          </div>
        ) : (
          <div className="text-xs leading-relaxed">
            <span>{messageContent.replace("(complete)", " ")}</span>
            {message.link && (
              <Link
                className="underline font-bold pl-2"
                href={message.link}
                target="_blank"
              >
                Your Link
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bubble;
