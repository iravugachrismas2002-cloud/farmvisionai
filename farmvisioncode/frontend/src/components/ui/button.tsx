"use client";

import { ReactNode } from "react";

export function Button({
  children,
  variant = "primary",
  size = "default",
  disabled = false,
  onClick,
  className,
  asButton = true,
  href,
  target,
  type = "button",
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | "warning" | "info";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  asButton?: boolean;
  href?: string;
  target?: string;
  type?: "button" | "submit" | "reset";
}) {
  const variantClasses = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent text-primary hover:text-primary hover:bg-accent/80",
    danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/95",
    success: "bg-success text-success-foreground hover:bg-success/90 active:bg-success/80",
    warning: "bg-warning text-warning-foreground hover:bg-warning/90 active:bg-warning/80",
    info: "bg-info text-info-foreground hover:bg-info/90 active:bg-info/80",
  };

  const sizeClasses = {
    default: "py-2.5 px-4 text-sm",
    sm: "py-2 px-3 text-sm",
    lg: "py-3 px-6 text-base",
    icon: "p-0",
  };

  const classes = `
    inline-flex items-center justify-center rounded-lg
    font-medium transition-colors focus-visible:outline-none
    focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-background
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className || ""}
  `;

  if (asButton && onClick) {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={classes}
        aria-disabled={disabled}
      >
        {children}
      </button>
    );
  }

  if (asButton && href) {
    return (
      <a
        href={href}
        target={target}
        rel="noopener noreferrer"
        className={classes}
      >
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes} aria-disabled={disabled}>
      {children}
    </button>
  );
}
