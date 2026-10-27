"use client";

type AlertSeverity = "info" | "success" | "warning" | "error";

export function Alert({
  severity = "info",
  title,
  description,
  action,
  className,
}: {
  severity?: AlertSeverity;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}) {
  const severityMap = {
    info: { bg: "bg-blue-50", text: "text-blue-900", border: "border-blue-200", icon: "text-blue-600" },
    success: { bg: "bg-green-50", text: "text-green-900", border: "border-green-200", icon: "text-green-600" },
    warning: { bg: "bg-amber-50", text: "text-amber-900", border: "border-amber-200", icon: "text-amber-600" },
    error: { bg: "bg-red-50", text: "text-red-900", border: "border-red-200", icon: "text-red-600" },
  };

  const style = severityMap[severity];

  return (
    <div
      className={`p-4 rounded-lg border-l-4 ${style.bg} ${style.text} ${style.border} ${className || ""}`}
      role={severity === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {/* Severity icon */}
        <div className="flex-shrink-0 pt-1">
          <svg
            className={`h-5 w-5 ${style.icon}`}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M20 6L9 17.5 3.5 12l5.5-5.5L3.5 6.5 12 13.07l8.5-8.5z"
              fill="currentColor"
            />
          </svg>
        </div>

        <div className="flex-1 pt-0.5">
          <p className="font-medium text-foreground">{title}</p>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>

      {action && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={action.onClick}
            className="rounded-lg border border-transparent bg-primary px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-background"
          >
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
}

export function AlertCenter({
  alerts,
}: {
  alerts: Array<{
    id: string;
    severity: AlertSeverity;
    title: string;
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  }>;
}) {
  const activeAlerts = alerts.filter(
    (alert) => alert.severity !== "info"
  );

  return (
    <div aria-label="Active alerts">
      {activeAlerts.length > 0 ? (
        <div className="space-y-3">
          {activeAlerts.map((alert) => (
            <Alert
              key={alert.id}
              severity={alert.severity}
              title={alert.title}
              description={alert.description}
              action={alert.action}
            />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No active alerts</p>
      )}
    </div>
  );
}
