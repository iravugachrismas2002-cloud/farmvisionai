import type { AlertSeverity, AlertType } from "../../generated/prisma/enums";

export type AutomationIntent =
  | { target: "FEED_DISPENSER"; proposal: "REVIEW_FEEDING_ACTION" }
  | { target: "WATER_SYSTEM"; proposal: "REVIEW_WATER_ACTION" }
  | { target: "VENTILATION"; proposal: "REVIEW_COOLING_ACTION" };

export type AutomationRule = {
  id: string;
  alertType: AlertType;
  minimumSeverity: Exclude<AlertSeverity, "INFO">;
  intent: AutomationIntent;
  enabled: boolean;
};

export type AutomationAlertInput = {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
};

export type AutomationProposal = {
  ruleId: string;
  alertId: string;
  intent: AutomationIntent;
  approvalRequired: true;
  executionStatus: "NOT_EXECUTED";
};

const severityRank: Record<AlertSeverity, number> = {
  INFO: 0,
  WARNING: 1,
  CRITICAL: 2,
};

/**
 * This framework can suggest future automation, but deliberately has no
 * command publisher, actuator adapter, or direct hardware side effect.
 */
export function proposeAutomation(
  rule: AutomationRule,
  alert: AutomationAlertInput,
): AutomationProposal | null {
  if (
    !rule.enabled ||
    alert.status === "RESOLVED" ||
    alert.type !== rule.alertType ||
    severityRank[alert.severity] < severityRank[rule.minimumSeverity]
  ) {
    return null;
  }

  return {
    ruleId: rule.id,
    alertId: alert.id,
    intent: rule.intent,
    approvalRequired: true,
    executionStatus: "NOT_EXECUTED",
  };
}

export function proposeAutomations(
  rules: readonly AutomationRule[],
  alert: AutomationAlertInput,
): AutomationProposal[] {
  return rules.flatMap((rule) => {
    const proposal = proposeAutomation(rule, alert);
    return proposal ? [proposal] : [];
  });
}
