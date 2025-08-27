"use client";

import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import React from "react";
import { FieldValues, UseFormRegister } from "react-hook-form";

type Props = {
  value: string;
  title: string;
  text: string;
  register: UseFormRegister<FieldValues>;
  userType: "owner" | "student";
  setUserType: React.Dispatch<React.SetStateAction<"owner" | "student">>;
};

function UserTypeCard({
  register,
  setUserType,
  text,
  title,
  value,
  userType,
}: Props) {
  const handleClick = () => {
    setUserType(value as "owner" | "student");
  };

  return (
    <Label htmlFor={value} onClick={handleClick}>
      <Card
        className={cn(
          "w-full cursor-pointer",
          userType == value && "border-orange border-2"
        )}
      >
        <CardContent className="flex justify-between px-4">
          <div className="flex items-center gap-3">
            <Card
              className={cn(
                "flex justify-center p-3",
                userType == value && "border-orange bg-orange/10"
              )}
            >
              <User
                size={30}
                className={cn(
                  userType == value ? "text-orange" : "text-gray-400"
                )}
              />
            </Card>
            <div className="">
              <CardDescription className="font-bold text-xl text-iridium">
                {title}
              </CardDescription>
              <CardDescription className="text-sm text-gray-500">
                {text}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center">
            <div
              className={cn(
                "w-5 h-5 rounded-full",
                userType == value ? "bg-orange" : "bg-transparent"
              )}
            >
              <Input
                {...register("type")}
                value={value}
                id={value}
                className="hidden"
                type="radio"
                checked={userType === value}
                onChange={() => {}} // Handled by onClick
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Label>
  );
}

export default UserTypeCard;
