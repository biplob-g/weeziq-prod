import { UserLoginProps, UserLoginSchema } from "@/schemas/auth.schema";
import { useSignIn } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const useSignInForm = () => {
  const { isLoaded, setActive, signIn } = useSignIn();
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const methods = useForm<UserLoginProps>({
    resolver: zodResolver(UserLoginSchema),
    mode: "onChange",
  });

  const onHandleSubmit = methods.handleSubmit(
    async (values: UserLoginProps) => {
      if (!isLoaded) {
        toast.error("Authentication system is not ready. Please try again.");
        return;
      }

      try {
        setLoading(true);
        console.log("🔐 Attempting sign in with:", values.email);

        const result = await signIn.create({
          identifier: values.email,
          password: values.password,
        });

        console.log("📋 Sign in result status:", result.status);

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });

          toast.success("Welcome back!", {
            description: "You have been successfully signed in.",
          });

          console.log("✅ Sign in successful, redirecting to dashboard");
          router.push("/dashboard");
        } else if (result.status === "needs_first_factor") {
          toast.error("Additional verification required", {
            description: "Please check your email for verification code.",
          });
        } else if (result.status === "needs_second_factor") {
          toast.error("Two-factor authentication required", {
            description: "Please enter your 2FA code.",
          });
        } else {
          toast.error("Sign in failed", {
            description: "Please check your credentials and try again.",
          });
        }
      } catch (error: any) {
        console.error("❌ Sign in error:", error);

        setLoading(false);

        // Handle specific Clerk errors
        if (error.errors && error.errors.length > 0) {
          const errorCode = error.errors[0].code;
          const errorMessage = error.errors[0].message;

          switch (errorCode) {
            case "form_password_incorrect":
              toast.error("Invalid credentials", {
                description:
                  "Email or password is incorrect. Please try again.",
              });
              break;
            case "form_identifier_not_found":
              toast.error("Account not found", {
                description: "No account found with this email address.",
              });
              break;
            case "form_identifier_exists":
              toast.error("Account already exists", {
                description: "An account with this email already exists.",
              });
              break;
            default:
              toast.error("Sign in failed", {
                description:
                  errorMessage ||
                  "An unexpected error occurred. Please try again.",
              });
          }
        } else {
          toast.error("Sign in failed", {
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
    loading,
  };
};
