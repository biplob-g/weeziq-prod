"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import FormGenerator from "../SignUp/formGenerator";
import { USER_LOGIN_FORM } from "@/constants/forms";
import Link from "next/link";

const LoginForm = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <>
      {USER_LOGIN_FORM.map((field) => (
        <FormGenerator
          key={field.id}
          {...field}
          errors={errors}
          register={register}
          name={field.name}
        />
      ))}

      {/* Forgot Password Link */}
      <div className="text-right">
        <Link
          href="/auth/forgot-password"
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      {/* Display form-level errors */}
      {Object.keys(errors).length > 0 && (
        <div className="text-red-500 text-sm mt-2">
          Please fix the errors above to continue.
        </div>
      )}
    </>
  );
};

export default LoginForm;
