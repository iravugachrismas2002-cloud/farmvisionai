import { describe, expect, it } from "vitest";
import { planAlertTransition } from "@/modules/alerts/lifecycle";

describe("alert lifecycle transitions", () => {
  it("creates only when an evaluated condition is active", () => {
    expect(planAlertTransition(null, { active: true, severity: "WARNING" })).toBe("CREATE");
    expect(planAlertTransition(null, { active: false, severity: "INFO" })).toBe("NOOP");
  });

  it("resolves an open or acknowledged alert when a new reading is normal", () => {
    expect(planAlertTransition({ status: "OPEN", severity: "WARNING" }, { active: false, severity: "INFO" })).toBe("RESOLVE");
    expect(planAlertTransition({ status: "ACKNOWLEDGED", severity: "CRITICAL" }, { active: false, severity: "INFO" })).toBe("RESOLVE");
  });

  it("reopens a resolved alert when the condition returns", () => {
    expect(planAlertTransition({ status: "RESOLVED", severity: "WARNING" }, { active: true, severity: "WARNING" })).toBe("REOPEN");
  });

  it("escalates an acknowledged warning and calls for renewed acknowledgement", () => {
    expect(planAlertTransition({ status: "ACKNOWLEDGED", severity: "WARNING" }, { active: true, severity: "CRITICAL" })).toBe("ESCALATE");
  });

  it("records lower severity changes without repeating an alert event for stable readings", () => {
    expect(planAlertTransition({ status: "OPEN", severity: "CRITICAL" }, { active: true, severity: "WARNING" })).toBe("SEVERITY_CHANGED");
    expect(planAlertTransition({ status: "ACKNOWLEDGED", severity: "WARNING" }, { active: true, severity: "WARNING" })).toBe("UPDATE");
    expect(planAlertTransition({ status: "RESOLVED", severity: "WARNING" }, { active: false, severity: "INFO" })).toBe("NOOP");
  });
});
