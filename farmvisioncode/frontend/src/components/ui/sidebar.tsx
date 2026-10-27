"use client";

import { ReactNode } from "react";

export function Sidebar({
  items,
  currentPath,
}: {
  items: Array<{ href: string; label: string; icon?: ReactNode; description?: string }>;
  currentPath: string;
}) {
  return (
    <nav className="border-r border-border w-64 min-h-screen bg-background flex flex-col p-4 pt-6">
      <h2 className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wider">
        Navigation
      </h2>
      <nav aria-label="Main navigation" className="flex-1">
        <ul role="list" className="space-y-1">
          {items.map((item) => {
            const isActive = item.href === currentPath;
            return (
              <li
                key={item.href}
                role="none"
                className={`
                  group
                  rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive 
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-primary/10 hover:text-primary"}
                `}
              >
                <a
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className="flex items-center gap-3 rounded-lg transition-colors"
                >
                  {item.icon && (
                    <span className="flex-shrink-0">{item.icon}</span>
                  )}
                  <span>{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </nav>
  );
}