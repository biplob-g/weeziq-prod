import SignInFormProvider from "@/components/forms/SignIn/formProvider";
import LoginForm from "@/components/forms/SignIn/loginForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const SignInPage = () => {
  return (
    <>
      {/* Sign In Form */}
      <SignInFormProvider>
        <div className="flex flex-col gap-4">
          <LoginForm />
          <div className="w-full flex flex-col gap-3 items-center">
            <Button type="submit" className="w-full cursor-pointer">
              Sign In
            </Button>
          </div>
        </div>
      </SignInFormProvider>

      {/* Footer */}
      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/sign-up"
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Create one
          </Link>
        </p>
      </div>
    </>
  );
};

export default SignInPage;
