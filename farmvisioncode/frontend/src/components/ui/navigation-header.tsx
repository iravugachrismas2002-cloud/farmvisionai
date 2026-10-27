"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

type NavAction = {
  onClick?: () => void;
  label: string;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | "warning" | "info";
  icon?: React.ReactNode;
  href?: string;
  className?: string;
};

type NavigationHeaderProps = {
  title: string | React.ReactNode;
  actions?: NavAction[];
  className?: string;
};

export function NavigationHeader({
  title,
  actions,
  className,
}: NavigationHeaderProps) {
  return (
    <header className={`shell-nav-header ${className || ""}`}>
      <div className="shell-nav-header-inner">
        <div className="shell-nav-header-start">
          <h1 className="shell-nav-header-title">{title}</h1>
        </div>
        <div className="shell-nav-header-end">
          {actions?.map((action, index) => {
            const isLink = !!action.href;
            const baseClasses = `inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed`;
            const variantClasses: Record<string, string> = {
              primary: "bg-primary text-primary-foreground hover:bg-primary/90",
              secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              ghost: "hover:bg-accent text-primary",
              danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
              success: "bg-success text-success-foreground hover:bg-success/90",
              warning: "bg-warning text-warning-foreground hover:bg-warning/90",
              info: "bg-info text-info-foreground hover:bg-info/90",
            };
            const sizeClasses = "py-2.5 px-4 text-sm";
            const btnClass = `${baseClasses} ${variantClasses[action.variant ?? "primary"]} ${sizeClasses} ${action.className || ""}`;

            if (isLink) {
              return (
                <Link
                  key={index}
                  href={action.href!}
                  className={btnClass}
                >
                  {action.icon && <span className="shell-nav-action-icon">{action.icon}</span>}
                  {action.label}
                </Link>
              );
            }
            return (
              <Button
                key={index}
                variant={action.variant ?? "primary"}
                onClick={action.onClick}
                className={action.className}
              >
                {action.icon && <span className="shell-nav-action-icon">{action.icon}</span>}
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
