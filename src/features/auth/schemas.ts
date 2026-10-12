import { z } from "zod";

const email = z.email("Enter a valid email address.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
});

export const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name."),
  email,
  password: z.string().min(8, "Use at least 8 characters."),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
