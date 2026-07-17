import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "solid" | "outline" | "ghost";
type ButtonSize = "md" | "lg";

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-card font-medium uppercase tracking-label transition-colors duration-200 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS: Record<ButtonVariant, string> = {
  solid:
    "bg-accent text-accent-foreground hover:bg-foreground/85",
  outline:
    "border border-foreground text-foreground hover:bg-foreground hover:text-background",
  ghost: "text-foreground hover:bg-surface-strong",
};

const SIZES: Record<ButtonSize, string> = {
  md: "h-11 px-6 text-xs",
  lg: "h-14 px-9 text-sm",
};

/** Primary call-to-action button used across marketing sections. */
export function Button({
  variant = "solid",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      {...props}
    />
  );
}
