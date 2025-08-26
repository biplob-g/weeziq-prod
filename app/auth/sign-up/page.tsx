import React from "react";
import SignUpFormProvider from "@/components/forms/SignUp/formProvider";
import RegistrationFormStep from "@/components/forms/SignUp/registrationStep";
import ButtonHandler from "@/components/forms/SignUp/buttonHandler";
import Link from "next/link";

const SignUp = () => {
  return (
    <>
      {/* Sign Up Form */}
      <SignUpFormProvider>
        <div className="flex flex-col gap-4">
          <RegistrationFormStep />
          <ButtonHandler />
        </div>
      </SignUpFormProvider>

      {/* Footer */}
      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/auth/sign-in"
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
};

export default SignUp;
