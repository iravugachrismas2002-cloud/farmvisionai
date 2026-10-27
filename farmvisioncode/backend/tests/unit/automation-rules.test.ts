import { describe, expect, it } from "vitest";
import { proposeAutomation, type AutomationRule } from "@/modules/automation/rules";

const rule: AutomationRule = {
  id: "low-water-review",
  alertType: "WATER_LOW",
  minimumSeverity: "WARNING",
  intent: { target: "WATER_SYSTEM", proposal: "REVIEW_WATER_ACTION" },
  enabled: true,
};

const alert = { id: "alert-1", type: "WATER_LOW" as const, severity: "CRITICAL" as const, status: "OPEN" as const };

describe("future automation proposals", () => {
  it("emits only a human-approval proposal with no executable command", () => {
    const proposal = proposeAutomation(rule, alert);
    expect(proposal).toEqual({
      ruleId: rule.id,
      alertId: alert.id,
      intent: rule.intent,
      approvalRequired: true,
      executionStatus: "NOT_EXECUTED",
    });
    expect(proposal).not.toHaveProperty("command");
  });

  it("does not emit proposals for disabled, resolved, or unrelated alerts", () => {
    expect(proposeAutomation({ ...rule, enabled: false }, alert)).toBeNull();
    expect(proposeAutomation(rule, { ...alert, status: "RESOLVED" })).toBeNull();
    expect(proposeAutomation(rule, { ...alert, type: "FEED_LOW" })).toBeNull();
  });
});
