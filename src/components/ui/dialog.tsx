"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useEffect, useId, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/cn";

const noop = () => () => {};

/** True only after hydration, so portals never differ from the server-rendered HTML. */
export function useIsClient() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const titleId = useId();
  const isClient = useIsClient();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.button
            type="button"
            aria-label="Funga"
            className="absolute inset-0 cursor-default bg-asphalt/55 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            className={cn(
              "relative max-h-[92dvh] w-full overflow-y-auto rounded-t-[2rem] border border-line bg-surface p-6 shadow-lift sm:rounded-[2rem] sm:p-8",
              size === "sm" && "sm:max-w-md",
              size === "md" && "sm:max-w-xl",
              size === "lg" && "sm:max-w-3xl",
              className,
            )}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Funga"
              className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-ink"
            >
              <X className="size-5" />
            </button>
            {title && (
              <h2 id={titleId} className="pr-10 text-xl font-bold sm:text-2xl">
                {title}
              </h2>
            )}
            {description && <div className="mt-2 text-muted">{description}</div>}
            {children && <div className={cn(title || description ? "mt-6" : "")}>{children}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
