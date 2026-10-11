"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/input";

import { useSignup } from "../hooks/use-auth-mutations";
import { type SignupValues, signupSchema } from "../schemas";
import { showApiError } from "./form-errors";
import { PasswordField } from "./password-field";

/** Full name + email + password. Creates the account and signs the user in. */
export function SignupForm() {
  const signup = useSignup();
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
    defaultValues: { fullName: "", email: "", password: "" },
  });

  const onSubmit = handleSubmit((values) => {
    clearErrors("root");
    signup.mutate(values, {
      onError: (error) =>
        showApiError(error, setError, {
          fullName: "fullName",
          email: "email",
          password: "password",
        }),
    });
  });

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-5">
        <TextField
          label="Full name"
          autoComplete="name"
          autoFocus
          placeholder="Enter"
          error={errors.fullName?.message}
          {...register("fullName")}
        />
        <TextField
          label="Your email"
          type="email"
          autoComplete="email"
          placeholder="name@SambaNova.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordField
          label="Password"
          autoComplete="new-password"
          placeholder="Enter"
          error={errors.password?.message}
          {...register("password")}
        />
      </div>

      {errors.root?.message && (
        <p
          role="alert"
          className="rounded-md border border-error-border bg-error-bg px-3 py-2 text-body-sm text-error"
        >
          {errors.root.message}
        </p>
      )}

      <Button
        type="submit"
        variant="brand"
        fullWidth
        className="h-10.25"
        loading={signup.isPending}
        disabled={!isValid}
      >
        Sign Up
      </Button>
    </form>
  );
}
