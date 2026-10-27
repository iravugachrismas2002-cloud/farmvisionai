import type { CSSProperties } from "react";

/**
 * Skeleton component for showing loading states.
 * Can be used as a placeholder for any element while content is loading.
 */

export function Skeleton({
  width,
  height,
  className,
}: {
  width?: string | number;
  height?: string | number;
  className?: string;
}) {
  const style: CSSProperties = {
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
  };

  return (
    <div
      className={`inline-block rounded bg-muted animate-pulse ${className || ""}`}
      style={style}
    />
  );
}

/**
 * Skeleton Avatar
 */
export function SkeletonAvatar({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return (
    <div className={`${sizes[size]} rounded-full animate-pulse ${className || ""}`}>
      <Skeleton width={size === "md" ? 40 : size === "sm" ? 32 : 48} height={size === "md" ? 40 : size === "sm" ? 32 : 48} />
    </div>
  );
}

/**
 * Skeleton Text - for paragraph text
 */
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`my-2 ${className || ""}`}>
      {Array.from({ length: lines }, (_, index) => (
        <div key={index} className="h-2.5 w-3/4 rounded-b animate-pulse my-1" />
      ))}
    </div>
  );
}

/**
 * Skeleton Button
 */
export function SkeletonButton({
  className,
}: {
  className?: string;
}) {
  return (
    <button className={`w-full rounded-lg h-10 mt-2 animate-pulse ${className || ""}`}>
      <Skeleton width={40} height={10} />
    </button>
  );
}

/**
 * Skeleton Table Rows
 */
export function SkeletonTable({
  rows = 5,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={`rounded-lg overflow-hidden ${className || ""}`}>
      <div className="space-y-2">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="border-b p-3 animate-pulse">
            <div className="flex gap-2">
              <Skeleton width={40} height={12} />
              <Skeleton width={120} height={10} />
            </div>
            <div className="flex-1 h-6 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton Card
 */
export function SkeletonCard({
  rows = 3,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={`rounded-lg overflow-hidden bg-muted animate-pulse ${className || ""}`}>
      <div className="p-4">
        {Array.from({ length: rows }, (_, index) => (
          <Skeleton
            key={index}
            width={[60, 80, 100][index % 3]}
            height={index === 0 ? 14 : 12}
            className={index === 0 ? "my-1" : "my-0.5"}
          />
        ))}
      </div>
    </div>
  );
}
