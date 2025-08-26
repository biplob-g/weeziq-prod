"use client";

import { usePathname } from "next/navigation";

export default function AuthHeader() {
  const pathname = usePathname();

  const getHeaderContent = () => {
    switch (pathname) {
      case "/auth/sign-in":
        return {
          title: "Welcome back",
          description: "Sign in to your Weezen account",
        };
      case "/auth/sign-up":
        return {
          title: "Create your account",
          description: "Start your free trial with Weezen",
        };
      case "/auth/forgot-password":
        return {
          title: "Forgot password?",
          description: "No worries, we'll send you reset instructions.",
        };
      default:
        return {
          title: "Welcome to Weezen",
          description: "Your AI powered Sales Assistant",
        };
    }
  };

  const { title, description } = getHeaderContent();

  return (
    <div className="text-center mb-8">
      <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
        <span className="text-primary-foreground font-bold text-lg">W</span>
      </div>
      <h1 className="text-3xl font-semibold text-foreground mb-2">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
