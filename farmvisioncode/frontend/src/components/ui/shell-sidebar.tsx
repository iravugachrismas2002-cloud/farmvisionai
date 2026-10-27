"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Home,
  Leaf,
  Palette,
  Cpu,
  BarChart3,
  Bot,
  Settings,
  Shield,
  Users,
  FileText,
} from "lucide-react";

type PermissionStatus = "available" | "restricted" | "view-only";

type ShellSidebarItem = {
  id: string;
  href: string;
  label: string;
  icon?: string;
  description?: string;
  permissionStatus?: PermissionStatus;
  requiredRole?: string;
};

type ShellSidebarSection = {
  id: string;
  label: string;
  icon?: string;
  items: ReadonlyArray<ShellSidebarItem>;
};

type ShellSidebarProps = {
  sections: ReadonlyArray<ShellSidebarSection>;
  currentPath: string;
  onToggleMobile?: () => void;
};

const PERMISSION_BADGE: Record<PermissionStatus, { label: string; icon: string }> = {
  available: { label: "Available", icon: "✓" },
  restricted: { label: "Restricted", icon: "🔒" },
  "view-only": { label: "View Only", icon: "👁" },
};

const ICON_MAP: Record<string, React.ElementType> = {
  Home,
  Leaf,
  Palette,
  Cpu,
  BarChart3,
  Bot,
  Settings,
  Shield,
  Users,
  FileText,
};

const getIconComponent = (iconName?: string): React.ElementType => {
  return iconName ? ICON_MAP[iconName] ?? Home : Home;
};

const SidebarIcon = ({ iconName }: { iconName?: string }) => {
  const Comp = getIconComponent(iconName);
  return <Comp size={20} strokeWidth={2} />;
};

export function ShellSidebar({
  sections,
  currentPath,
}: ShellSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const isSectionCollapsed = (sectionId: string) => collapsedSections.has(sectionId);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="shell-sidebar" aria-label="Main navigation">
        <div className="shell-sidebar-inner">
          {/* Brand */}
          <div className="shell-sidebar-brand">
            <div className="shell-brand-mark">F</div>
            <span className="shell-brand-text">FarmVision<span className="shell-brand-ai"> AI</span></span>
          </div>

          <nav className="shell-sidebar-nav" aria-label="Main navigation">
            <ul role="list">
              {sections.map((section) => {
                const sectionActive = section.items.some((i) => i.href === currentPath);
                return (
                  <li key={section.id} className="shell-sidebar-section">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="shell-section-header"
                    >
                      <span className="shell-section-icon">{section.icon}</span>
                      <span className="shell-section-label">{section.label}</span>
                    </button>
                    {!isSectionCollapsed(section.id) && (
                      <ul className="shell-section-items">
                        {section.items.map((item) => {
                          const isActive = item.href === currentPath;
                          return (
                            <li key={item.id}>
                              <Link
                                href={item.href}
                                className={`shell-nav-item ${isActive ? "shell-nav-item-active" : ""} ${item.permissionStatus === "restricted" ? "shell-nav-item-restricted" : ""}`}
                                aria-current={isActive ? "page" : undefined}
                                aria-disabled={item.permissionStatus === "restricted" ? true : undefined}
                              >
                                <span className="shell-nav-icon">
                                  {item.icon && (
                                    <span className="w-5 text-center">
                                      <SidebarIcon iconName={item.icon} />
                                    </span>
                                  )}
                                </span>
                                <span className="shell-nav-label">{item.label}</span>
                                {item.permissionStatus === "restricted" && (
                                  <span className="shell-nav-badge">🔒</span>
                                )}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sign out at bottom */}
          <div className="shell-sidebar-bottom">
            <Link
              href="/api/auth/logout"
              className="shell-nav-item shell-nav-item-signout"
            >
              <Shield className="w-4 h-4" />
              <span className="shell-nav-label">Sign out</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile menu toggle */}
      <button
        className="shell-mobile-menu-toggle"
        aria-label="Toggle main navigation"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </>
  );
}
