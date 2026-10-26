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
      <div className="container-page relative py-10 sm:py-14">
        {eyebrow && (
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-300">
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{description}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </header>
  );
}
