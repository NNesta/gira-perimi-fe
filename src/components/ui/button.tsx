import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "sun" | "dark" | "soft";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-[0_8px_24px_-10px_rgb(8_125_84/0.8)] hover:from-brand-400 hover:to-brand-600 active:from-brand-600",
  secondary: "border border-line bg-surface text-ink shadow-soft hover:border-brand-300 hover:bg-surface-2",
  ghost: "text-ink-soft hover:bg-surface-2 hover:text-ink",
  danger: "bg-signal-600 text-white shadow-soft hover:bg-signal-500",
  sun: "bg-sun-300 text-asphalt shadow-[0_8px_24px_-10px_rgb(197_138_4/0.9)] hover:bg-sun-200",
  dark: "bg-asphalt text-white shadow-soft hover:bg-asphalt/90 dark:bg-white dark:text-asphalt dark:hover:bg-white/90",
  soft: "bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-300 dark:hover:bg-brand-500/25",
};

// Minimum heights, not fixed ones: with large text on a small phone a long label wraps instead of overflowing.
const SIZES: Record<Size, string> = {
  sm: "min-h-9 gap-1.5 rounded-xl px-3.5 py-1.5 text-sm",
  md: "min-h-11 gap-2 rounded-2xl px-5 py-2 text-[0.95rem]",
  lg: "min-h-14 gap-2.5 rounded-2xl px-7 py-3 text-base sm:text-lg",
};

export function buttonStyles({ variant = "primary", size = "md" }: { variant?: Variant; size?: Size } = {}) {
  return cn(
    "inline-flex max-w-full select-none items-center justify-center text-center font-semibold leading-tight transition-all duration-200",
    "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55",
    VARIANTS[variant],
    SIZES[size],
  );
}

type StyleProps = { variant?: Variant; size?: Size };

export function Button({ variant, size, className, type = "button", ...props }: ComponentProps<"button"> & StyleProps) {
  return <button type={type} className={cn(buttonStyles({ variant, size }), className)} {...props} />;
}

export function ButtonLink({ variant, size, className, ...props }: ComponentProps<typeof Link> & StyleProps) {
  return <Link className={cn(buttonStyles({ variant, size }), className)} {...props} />;
}
