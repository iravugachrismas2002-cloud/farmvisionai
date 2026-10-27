"use client";

import type { ReactNode } from "react";

type EmptyStateProps = {
  title?: string;
  description?: string;
};

type EmptyStateAction = {
  label: string;
  onClick: () => void;
};

type EmptyStateIcon =
  | "agriculture"
  | "device"
  | "alert"
  | "recommendation"
  | "analytics"
  | "digital-twin";

const emptyStateIcons: Record<EmptyStateIcon, ReactNode> = {
  agriculture: (
    <svg
      className="w-12 h-12 mx-auto mb-4 text-muted-foreground"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2L2 7l10-5 10 5-10 5zM2 7l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  device: (
    <svg
      className="w-12 h-12 mx-auto mb-4 text-muted-foreground"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M19 14c1.66 0 3-1.34 3-3v-1c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v1c0 1.66 1.34 3 3 3h6l2 3h3v6H7v5h5v-2.5L14 18.5V14zM13 9h2v2h-2V9zm0 4h2v2h-2v-2zm0 4h1v3H13v-3zm-7-5h2v2H6v-2zm7 5h2v2h-2v-2zm0 4h2v2h-2v-2zm2-4h2v2h-2V5zm2 4v2h2v-2h-2zm4-4h2v2h-2V5zm0 4h2v2h-2V5z" />
    </svg>
  ),
  alert: (
    <svg
      className="w-12 h-12 mx-auto mb-4 text-amber-500"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 1v2m0 10v3m2-3h7m-4-3h7m-6-9h18v19a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm0 0v1m0 0v1m0 0v1m0 0v1m0 0v1m6-4v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2z" />
    </svg>
  ),
  recommendation: (
    <svg
      className="w-12 h-12 mx-auto mb-4 text-primary"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2L2 7l10-5 10 5-10 5zM2 7l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  analytics: (
    <svg
      className="w-12 h-12 mx-auto mb-4 text-primary"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
      <path d="M12 6v6l-4 2" />
    </svg>
  ),
  "digital-twin": (
    <svg
      className="w-12 h-12 mx-auto mb-4 text-primary"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M17 3h2a2 2 0 0 1 2 2v2h2v-2h2v2h-2v2h-2v-2h-2v-2h-2V7h-2V5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2H5a2 2 0 0 0-2 2v2H3a2 2 0 0 0-2 2v2H1a2 2 0 0 0-2 2v2H1a2 2 0 0 0-2 2v2H1a2 2 0 0 0-2 2v2zM3 9h2v2H3V9zm4 0h2v2h-2V9zm0 4h2v2h-2v-2zm4 0h2v2h-2v-2zm0 4h2v2h-2v-2zm4 0h2v2h-2v-2z" />
    </svg>
  ),
};

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: EmptyStateIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
}) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-auto mx-auto mb-4 flex items-center justify-center">
        {emptyStateIcons[icon]}
      </div>

      <h3 className="text-xl font-medium text-foreground mb-1">{title}</h3>

      {description && (
        <p className="text-muted-foreground">{description}</p>
      )}

      {action ? (
        <button
          onClick={action.onClick}
          className="mt-4 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
        >
          {action.label}
        </button>
      ) : null}
    </div>
  );
}

/**
 * Pre-styled empty states for common scenarios
 */

export function EmptyStateAgriculture({
  title = "No farms registered",
  description,
  action,
}: EmptyStateProps & { action?: EmptyStateAction }) {
  return (
    <EmptyState
      icon="agriculture"
      title={title}
      description={description}
      action={action}
    />
  );
}

export function EmptyStateDevice({
  title = "No devices registered",
  description,
  action,
}: EmptyStateProps & { action?: EmptyStateAction }) {
  return (
    <EmptyState
      icon="device"
      title={title}
      description={description}
      action={action}
    />
  );
}

export function EmptyStateAlert({
  title = "No active alerts",
  description,
}: EmptyStateProps) {
  return (
    <EmptyState
      icon="alert"
      title={title}
      description={description}
    />
  );
}

export function EmptyStateRecommendation({
  title = "No recommendations",
  description,
}: EmptyStateProps) {
  return (
    <EmptyState
      icon="recommendation"
      title={title}
      description={description}
    />
  );
}

export function EmptyStateAnalytics({
  title = "No analytics data",
  description,
}: EmptyStateProps) {
  return (
    <EmptyState
      icon="analytics"
      title={title}
      description={description}
    />
  );
}

export function EmptyStateDigitalTwin({
  title = "No digital twin data",
  description,
}: EmptyStateProps) {
  return (
    <EmptyState
      icon="digital-twin"
      title={title}
      description={description}
    />
  );
}