"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Bell, MessageCircle, User, Menu } from "lucide-react";

type UserProfile = {
  name: string;
  email: string;
  profileType: string;
  systemRole: string;
  organization: string;
  accountStatus: string;
  permissionLevel: string;
  avatar?: string;
};

type ShellHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  showSearch?: boolean;
  userProfile?: UserProfile;
  onLogout?: () => void;
  notificationCount?: number;
  onNotificationClick?: () => void;
};

export function ShellHeader({
  title,
  subtitle,
  actions,
  showSearch = true,
  userProfile,
  onLogout,
  notificationCount,
  onNotificationClick,
}: ShellHeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleUserMenuToggle = () => setUserMenuOpen((prev) => !prev);
  const handleUserMenuClose = () => setUserMenuOpen(false);
  const handleNotificationsToggle = () => setNotificationsOpen((prev) => !prev);

  const roleColorMap: Record<string, string> = {
    farmer: "text-emerald-400",
    agronomist: "text-blue-400",
    veterinarian: "text-amber-400",
    technician: "text-amber-400",
    "farm manager": "text-emerald-400",
    manager: "text-emerald-400",
    admin: "text-red-400",
    "super admin": "text-red-400",
  };

  const roleColor =
    roleColorMap[userProfile?.systemRole.toLowerCase() ?? ""] ??
    "text-slate-400";

  return (
    <header className="shell-topbar" role="banner">
      <div className="shell-topbar-inner">
        {/* Brand + mobile menu toggle */}
        <div className="shell-brand-area">
          <button
            className="shell-mobile-menu-toggle"
            aria-label="Open main navigation"
            aria-expanded={false}
            onClick={() => {
              const event = new Event("toggle-mobile-menu");
              window.dispatchEvent(event);
            }}
          >
            <span className="sr-only">Menu</span>
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="shell-brand-link" aria-label="FarmVision AI home">
            <div className="shell-brand-mark">F</div>
            <span className="shell-brand-text">FarmVision<span className="shell-brand-ai"> AI</span></span>
          </Link>
        </div>

        {/* Search */}
        {showSearch && (
          <div className="shell-search-area">
            <div className="shell-search-wrapper">
              <Search className="shell-search-icon" size={16} strokeWidth={1.5} />
              <input
                type="search"
                placeholder="Search FarmVision..."
                className="shell-search-input"
                aria-label="Search farms, devices, and alerts"
                autoComplete="off"
              />
            </div>
          </div>
        )}

        {/* Actions */}
        {actions && <div className="shell-header-actions">{actions}</div>}

        {/* Right side */}
        <div className="shell-header-right">
          {userProfile && (
            <div className="shell-role-badge" aria-label={`Role: ${userProfile.systemRole}`}>
              <span className={`shell-role-label ${roleColor}`}>{userProfile.systemRole}</span>
            </div>
          )}

          {/* Notifications */}
          <button
            className="shell-notification-button"
            aria-label="Notifications"
            aria-haspopup="true"
            aria-expanded={notificationsOpen}
            onClick={handleNotificationsToggle}
          >
            <Bell className="shell-notification-icon" size={20} strokeWidth={2} />
            {notificationCount && notificationCount > 0 && (
              <span className="shell-notification-badge">{notificationCount}</span>
            )}
          </button>

          {/* Messages */}
          <button
            className="shell-message-button"
            aria-label="Messages"
            aria-haspopup="true"
            aria-expanded={false}
            onClick={() => {}}
          >
            <MessageCircle className="shell-message-icon" size={20} strokeWidth={2} />
          </button>

          {/* User profile */}
          <div className="shell-user-area" onClick={handleUserMenuToggle}>
            <div className="shell-user-avatar">{userProfile?.name?.charAt(0) || "?"}</div>
            <div className="shell-user-info">
              <div className="shell-user-name">{userProfile?.name || "User"}</div>
              {userProfile?.organization && (
                <div className="shell-user-organization">{userProfile.organization}</div>
              )}
            </div>
          </div>

          {(userMenuOpen) && (
            <div className="shell-user-menu">
              <button className="shell-menu-item" onClick={handleUserMenuClose}>
                Profile
              </button>
              <button className="shell-menu-item" onClick={() => { handleUserMenuClose(); onLogout?.(); }}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {subtitle && (
        <div className="shell-page-header">
          <h1 className="shell-page-title">{title}</h1>
          <p className="shell-page-subtitle">{subtitle}</p>
        </div>
      )}
    </header>
  );
}
