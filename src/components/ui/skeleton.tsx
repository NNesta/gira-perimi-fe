import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton", className)} />;
}

export function PageSkeleton({ title = true, cards = 6 }: { title?: boolean; cards?: number }) {
  return (
    <div className="container-page py-10" aria-busy="true" aria-label="Biratunganywa">
      {title && (
        <div className="mb-8 space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-2/3 max-w-lg" />
          <Skeleton className="h-4 w-1/2 max-w-md" />
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cards }, (_, i) => (
          <Skeleton key={i} className="h-44 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
