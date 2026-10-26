import { cn } from "@/lib/cn";

export function ProgressBar({
  value,
  max = 1,
  className,
  barClassName,
  label,
}: {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  label?: string;
}) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn("h-2.5 w-full overflow-hidden rounded-full bg-surface-2", className)}
    >
      <div
        className={cn(
          "h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-[width] duration-700 ease-out",
          barClassName,
        )}
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  );
}

/** Circular progress ring (SVG). */
export function ProgressRing({
  value,
  max = 1,
  size = 120,
  stroke = 10,
  className,
  trackClassName = "stroke-surface-2",
  barClassName = "stroke-brand-500",
  children,
  label,
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  className?: string;
  trackClassName?: string;
  barClassName?: string;
  children?: React.ReactNode;
  label?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <div className={cn("relative inline-grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" role="img" aria-label={label}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className={trackClassName} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className={cn("transition-[stroke-dashoffset] duration-1000 ease-out", barClassName)}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}
