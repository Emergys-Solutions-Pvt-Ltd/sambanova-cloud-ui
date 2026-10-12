"use client";

import { type ComponentPropsWithRef, useState } from "react";

import { IconButton } from "@/components/ui/icon-button";
import { TextField } from "@/components/ui/input";

type PasswordFieldProps = Omit<ComponentPropsWithRef<typeof TextField>, "type" | "trailing">;

/** Password input with a show/hide toggle (Figma: eye icon at the end of the field). */
export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <IconButton
          icon={visible ? "eye-off" : "eye"}
          size="sm"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
          className="-mr-2 shrink-0 text-secondary"
        />
      }
    />
  );
}
