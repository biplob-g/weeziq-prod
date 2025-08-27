"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserRegistrationSchema,
  UserRegistratonProps,
} from "@/schemas/auth.schema";
import { onCompleteUserRegistration } from "@/actions/auth";

// Define error type for better type safety
type ClerkError = {
  errors: Array<{
    longMessage: string;
    message: string;
    code?: string;
  }>;
};

// Define user type for the registration response
type RegisteredUser = {
  id: string;
  fullname: string;
  role: string;
};

const onCompleteUserRegistraton = async (
  fullname: string,
  userId: string
): Promise<{ status: number; user?: RegisteredUser }> => {
  try {
    // Call the actual database function instead of simulating
    const result = await onCompleteUserRegistration(fullname, userId);
    if (result?.status === 200 && result.user) {
      return { status: 200, user: result.user };
    }
    return { status: 400 };
  } catch (error) {
    console.error("Registration completion failed:", error);
    return { status: 400 };
  }
};

export const useSignUpForm = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { signUp, isLoaded, setActive } = useSignUp();
  const router = useRouter();
  const methods = useForm<UserRegistratonProps>({
    resolver: zodResolver(UserRegistrationSchema),
    mode: "onChange",
  });

  const onGenerateOTP = async (
    email: string,
    password: string,
    onNext: React.Dispatch<React.SetStateAction<number>>
  ) => {
    if (!isLoaded) {
      toast.error("Authentication system is not ready. Please try again.");
      return;
    }

    try {
      console.log("🔐 Creating sign up with email:", email);

      await signUp.create({
        emailAddress: email,
        password: password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      toast.success("Verification code sent!", {
        description: "Please check your email for the verification code.",
      });

      onNext((prev) => prev + 1);
    } catch (error) {
      console.error("❌ Sign up error:", error);
      const clerkError = error as ClerkError;

      if (clerkError.errors && clerkError.errors.length > 0) {
        const errorCode = clerkError.errors[0].code;
        const errorMessage =
          clerkError.errors[0].longMessage || clerkError.errors[0].message;

        switch (errorCode) {
          case "form_identifier_exists":
            toast.error("Account already exists", {
              description:
                "An account with this email already exists. Please sign in instead.",
            });
            break;
          case "form_password_pwned":
            toast.error("Password compromised", {
              description:
                "This password has been found in a data breach. Please choose a stronger password.",
            });
            break;
          case "form_password_size_in_bytes":
            toast.error("Password too long", {
              description: "Please choose a shorter password.",
            });
            break;
          default:
            toast.error("Registration failed", {
              description:
                errorMessage || "Please check your information and try again.",
            });
        }
      } else {
        toast.error("Registration failed", {
          description: "An unexpected error occurred. Please try again.",
        });
      }
    }
  };

  const onHandleSubmit = methods.handleSubmit(
    async (values: UserRegistratonProps) => {
      if (!isLoaded) {
        toast.error("Authentication system is not ready. Please try again.");
        return;
      }

      try {
        setLoading(true);
        console.log("🔐 Attempting email verification with OTP");

        const completeSignUp = await signUp.attemptEmailAddressVerification({
          code: values.otp,
        });

        if (completeSignUp.status !== "complete") {
          toast.error("Verification failed", {
            description: "Please check your verification code and try again.",
          });
          return;
        }

        if (completeSignUp.status === "complete") {
          if (!signUp.createdUserId) {
            toast.error("Registration failed", {
              description: "User ID not found. Please try again.",
            });
            return;
          }

          console.log("✅ Email verified, completing registration");

          const registered = await onCompleteUserRegistraton(
            values.fullname,
            signUp.createdUserId
          );

          if (registered?.status === 200 && registered.user) {
            await setActive({
              session: completeSignUp.createdSessionId,
            });

            toast.success("Account created successfully!", {
              description:
                "Welcome to WeezGen! You're being redirected to your dashboard.",
            });

            console.log("🎉 Registration complete, redirecting to dashboard");
            router.push("/dashboard");
          } else {
            toast.error("Registration failed", {
              description: "Failed to create your account. Please try again.",
            });
          }
        }
      } catch (error) {
        console.error("❌ Registration completion error:", error);
        const clerkError = error as ClerkError;

        if (clerkError.errors && clerkError.errors.length > 0) {
          const errorCode = clerkError.errors[0].code;
          const errorMessage =
            clerkError.errors[0].longMessage || clerkError.errors[0].message;

          switch (errorCode) {
            case "verification_expired":
              toast.error("Verification code expired", {
                description: "Please request a new verification code.",
              });
              break;
            case "verification_failed":
              toast.error("Invalid verification code", {
                description: "Please check your code and try again.",
              });
              break;
            default:
              toast.error("Registration failed", {
                description:
                  errorMessage ||
                  "An unexpected error occurred. Please try again.",
              });
          }
        } else {
          toast.error("Registration failed", {
            description: "An unexpected error occurred. Please try again.",
          });
        }
      } finally {
        setLoading(false);
      }
    }
  );
  return {
    methods,
    onHandleSubmit,
    onGenerateOTP,
    loading,
  };
};
