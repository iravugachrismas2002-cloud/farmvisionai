"use client";

import { ReactNode } from "react";

export function Card({
  header,
  children,
  footer,
  className,
}: {
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border bg-card p-6 shadow-sm ${className || ""}`}>
      {header && <div className="flex flex-col gap-2 mb-4">{header}</div>}
      <div className="flex-1">{children}</div>
      {footer && <div className="flex flex-col gap-2 pt-4">{footer}</div>}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className || ""}`}>
      <h3 className="font-medium text-foreground">{title}</h3>
      {description && <p className="text-muted-foreground text-sm">{description}</p>}
    </div>
  );
}

export function CardFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`flex flex-col gap-2 pt-4 ${className || ""}`}>{children}</div>;
}
