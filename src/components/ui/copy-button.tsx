"use client";

import { useEffect, useRef, useState } from "react";

import { IconButton, type IconButtonProps } from "./icon-button";

interface CopyButtonProps extends Omit<IconButtonProps, "icon" | "onClick" | "aria-label"> {
  /** Text placed on the clipboard. */
  value: string;
  label?: string;
}

/** Copies `value`; shows a check for about 1.6s and announces "Copied" politely. */
export function CopyButton({ value, label = "Copy", ...rest }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      // The clipboard can be blocked (insecure context, permissions); leave the UI unchanged.
    }
  };

  return (
    <>
      <IconButton
        icon={copied ? "check" : "copy"}
        aria-label={copied ? "Copied" : label}
        onClick={() => void copy()}
        {...rest}
      />
      <span role="status" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </>
  );
}
