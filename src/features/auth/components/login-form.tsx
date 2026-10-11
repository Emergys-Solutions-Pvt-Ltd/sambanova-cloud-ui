"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/input";

import { useLogin } from "../hooks/use-auth-mutations";
import { type LoginValues, loginSchema } from "../schemas";
import { showApiError } from "./form-errors";
import { PasswordField } from "./password-field";

/** Email + password. The dialog closes itself once the session store reports a signed-in user. */
export function LoginForm() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit((values) => {
    clearErrors("root");
    login.mutate(values, { onError: (error) => showApiError(error, setError, { email: "email" }) });
  });

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-5">
        <TextField
          label="Your email"
          type="email"
          autoComplete="email"
          autoFocus
          placeholder="name@SambaNova.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
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
        loading={login.isPending}
        disabled={!isValid}
      >
        Login
      </Button>
    </form>
  );
}
