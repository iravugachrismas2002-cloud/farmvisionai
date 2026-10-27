import type { AlertSeverity, AlertStatus } from "../../generated/prisma/enums";

export type ExistingAlertState = { status: AlertStatus; severity: AlertSeverity };
export type EvaluatedAlertState = { active: boolean; severity: AlertSeverity };
export type AlertTransition = "NOOP" | "CREATE" | "RESOLVE" | "REOPEN" | "ESCALATE" | "SEVERITY_CHANGED" | "UPDATE";

function severityRank(severity: AlertSeverity): number {
  if (severity === "CRITICAL") return 2;
  if (severity === "WARNING") return 1;
  return 0;
}

export function planAlertTransition(
  current: ExistingAlertState | null,
  next: EvaluatedAlertState,
): AlertTransition {
  if (!next.active) {
    return current && current.status !== "RESOLVED" ? "RESOLVE" : "NOOP";
  }
  if (!current) return "CREATE";
  if (current.status === "RESOLVED") return "REOPEN";
  if (current.severity === next.severity) return "UPDATE";
  return severityRank(next.severity) > severityRank(current.severity)
    ? "ESCALATE"
    : "SEVERITY_CHANGED";
}
