"use client";

import { Button } from "@/components/ui/button";
import { useAuthContextHook } from "@/context/useAuthContext";
import { useSignUpForm } from "@/hooks/sign-up/useSignUp";
import Link from "next/link";
import React from "react";
import { useFormContext } from "react-hook-form";
import { Loader2 } from "lucide-react";

const ButtonHandler = () => {
  const { setCurrentStep, currentStep } = useAuthContextHook();
  const { formState, getFieldState, getValues } = useFormContext();
  const { onGenerateOTP, loading } = useSignUpForm();

  const { isDirty: isName } = getFieldState("fullname", formState);
  const { isDirty: isEmail } = getFieldState("email", formState);
  const { isDirty: isPassword } = getFieldState("password", formState);

  const handleGenerateOTP = async () => {
    if (isName && isEmail && isPassword) {
      await onGenerateOTP(
        getValues("email"),
        getValues("password"),
        setCurrentStep
      );
    }
  };

  if (currentStep === 2) {
    return (
      <div className="w-full flex flex-col gap-3 items-center">
        <Button
          type="submit"
          className="w-full cursor-pointer"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create an account"
          )}
        </Button>
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/auth/sign-in"
            className="text-primary hover:text-primary/80 font-medium"
          >
            Sign In
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3 items-center">
      <Button
        type="button"
        className="w-full cursor-pointer"
        disabled={loading || !(isName && isEmail && isPassword)}
        onClick={handleGenerateOTP}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending verification code...
          </>
        ) : (
          "Continue"
        )}
      </Button>
      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/auth/sign-in"
          className="text-primary hover:text-primary/80 font-medium"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default ButtonHandler;
