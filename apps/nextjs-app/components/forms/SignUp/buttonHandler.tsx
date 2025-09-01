"use client";

import { Button } from "@/components/ui/button";
import { useAuthContextHook } from "@/context/useAuthContext";
import { useSignUpForm } from "@/hooks/sign-up/useSignUp";
import Link from "next/link";
import React from "react";
import { useFormContext } from "react-hook-form";
import { Loader as LoaderIcon } from "lucide-react";
import { toast } from "sonner";

const ButtonHandler = () => {
  const { setCurrentStep, currentStep } = useAuthContextHook();
  const { formState, getFieldState, getValues, trigger } = useFormContext();
  const { onGenerateOTP, loading } = useSignUpForm();

  const { isDirty: isName } = getFieldState("fullname", formState);
  const { isDirty: isEmail } = getFieldState("email", formState);
  const { isDirty: isConfirmEmail } = getFieldState("confirmEmail", formState);
  const { isDirty: isPassword } = getFieldState("password", formState);
  const { isDirty: isConfirmPassword } = getFieldState(
    "confirmPassword",
    formState
  );

  const handleGenerateOTP = async () => {
    // ✅ NEW: Validate all fields before proceeding
    const isValid = await trigger([
      "fullname",
      "email",
      "confirmEmail",
      "password",
      "confirmPassword",
    ]);

    if (!isValid) {
      toast.error("Please fix the validation errors before continuing");
      return;
    }

    // ✅ NEW: Additional password match validation
    const email = getValues("email");
    const confirmEmail = getValues("confirmEmail");
    const password = getValues("password");
    const confirmPassword = getValues("confirmPassword");

    if (email !== confirmEmail) {
      toast.error("Email addresses do not match");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // ✅ NEW: Check if all required fields are filled
    if (
      !isName ||
      !isEmail ||
      !isConfirmEmail ||
      !isPassword ||
      !isConfirmPassword
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    await onGenerateOTP(email, password, setCurrentStep);
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
              <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
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

  // ✅ NEW: Check if all fields are valid for enabling the button
  const allFieldsValid =
    isName && isEmail && isConfirmEmail && isPassword && isConfirmPassword;
  const hasErrors = Object.keys(formState.errors).length > 0;

  return (
    <div className="w-full flex flex-col gap-3 items-center">
      <Button
        type="button"
        className="w-full cursor-pointer"
        disabled={loading || !allFieldsValid || hasErrors}
        onClick={handleGenerateOTP}
      >
        {loading ? (
          <>
            <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
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
