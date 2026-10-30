import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" && "mx-auto max-w-2xl text-center", className)}>
      {eyebrow && (
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-300">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-lg leading-relaxed text-muted">{description}</p>}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("relative overflow-hidden border-b border-line bg-surface", className)}>
      <div aria-hidden className="bg-grid absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div
        aria-hidden
        className="absolute -right-24 -top-24 size-72 rounded-full bg-gradient-to-br from-brand-300/40 to-ocean-300/30 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-32 left-1/4 size-64 rounded-full bg-gradient-to-tr from-sun-200/30 to-transparent blur-3xl dark:from-sun-300/10"
      />
      {/* Tighter on phones, so the page's own content starts in the first screen. */}
      <div className="container-page relative py-7 sm:py-14">
        {eyebrow && (
          <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-600 sm:mb-3 sm:text-sm dark:text-brand-300">
            <span aria-hidden className="h-0.5 w-5 rounded-full bg-gradient-to-r from-brand-400 to-ocean-400" />
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-3xl text-[1.85rem] font-extrabold leading-tight sm:text-5xl">{title}</h1>
        {description && (
          <p className="mt-3 max-w-2xl leading-relaxed text-muted sm:mt-4 sm:text-lg">{description}</p>
        )}
        {children && <div className="mt-5 sm:mt-6">{children}</div>}
      </div>
    </header>
  );
}
