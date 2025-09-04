import { z } from "zod";

export type UserRegistratonProps = {
  fullname: string;
  email: string;
  confirmEmail: string;
  password: string;
  confirmPassword: string;
  otp: string;
};

export const UserRegistrationSchema = z
  .object({
    fullname: z
      .string()
      .min(4, { message: "Your full name must be at least 4 characters long" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    confirmEmail: z
      .string()
      .email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(64, { message: "Password cannot be longer than 64 characters" })
      .refine(
        (value) => /^[a-zA-Z0-9@$!%*?&_.-]*$/.test(value ?? ""),
        "Password can contain letters, numbers, and common symbols (@$!%*?&_.-)"
      ),
    confirmPassword: z.string(),
    otp: z
      .string()
      .min(6, { message: "Please enter a 6-digit verification code" }),
  })
  .refine((schema) => schema.password === schema.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((schema) => schema.email === schema.confirmEmail, {
    message: "Email addresses do not match",
    path: ["confirmEmail"],
  });

export type ChangePasswordProps = {
  password: string;
  confirmPassword: string;
};

export const ChangePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Your password must be atleast 8 characters long" })
      .max(64, {
        message: "Your password cannot be longer than 64 characters long",
      })
      .refine(
        (value) => /^[a-zA-Z0-9_.-]*$/.test(value ?? ""),
        "password should contain only alphabets and numbers"
      ),
    confirmPassword: z.string(),
  })
  .refine((schema) => schema.password === schema.confirmPassword, {
    message: "passwords do not match",
    path: ["confirmPassword"],
  });

export type UserLoginProps = {
  email: string;
  password: string;
};

export const UserLoginSchema = z.object({
  email: z.string().email({ message: "You did not enter a valid email" }),
  password: z
    .string()
    .min(8, { message: "Your password must be atleast 8 characters long" })
    .max(64, {
      message: "Your password can not be longer then 64 characters long",
    }),
});
