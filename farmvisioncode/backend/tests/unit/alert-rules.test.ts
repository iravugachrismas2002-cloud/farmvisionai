import { describe, expect, it } from "vitest";
import { DEFAULT_ALERT_THRESHOLDS, evaluateSensorAlerts } from "@/modules/alerts/rules";

describe("deterministic alert rules", () => {
  it("emits a warning at the configured low-feed boundary", () => {
    expect(evaluateSensorAlerts({ feedLevelPercent: 20 })[0]).toMatchObject({
      type: "FEED_LOW",
      severity: "WARNING",
      active: true,
      observedValue: 20,
      thresholdValue: 20,
      unit: "%",
    });
  });

  it("emits critical feed and water alerts at their critical boundaries", () => {
    expect(evaluateSensorAlerts({ feedLevelPercent: 10 })[0].severity).toBe("CRITICAL");
    expect(evaluateSensorAlerts({ waterLevelPercent: 10 })[0]).toMatchObject({ type: "WATER_LOW", severity: "CRITICAL", active: true });
  });

  it("treats 32°C as a configurable prototype heat warning and 35°C as critical", () => {
    expect(evaluateSensorAlerts({ temperatureC: 32 })[0]).toMatchObject({ type: "HIGH_TEMPERATURE", severity: "WARNING", active: true, unit: "°C" });
    expect(evaluateSensorAlerts({ temperatureC: 35 })[0].severity).toBe("CRITICAL");
  });

  it("returns an Info/normal outcome so an existing alert can be resolved", () => {
    expect(evaluateSensorAlerts({ feedLevelPercent: 21 })[0]).toMatchObject({ severity: "INFO", active: false });
  });

  it("accepts per-farm prototype thresholds without changing global defaults", () => {
    const configured = { ...DEFAULT_ALERT_THRESHOLDS, feedLowWarningPercent: 30 };
    expect(evaluateSensorAlerts({ feedLevelPercent: 25 }, configured)[0]).toMatchObject({ severity: "WARNING", active: true, thresholdValue: 30 });
    expect(DEFAULT_ALERT_THRESHOLDS.feedLowWarningPercent).toBe(20);
  });

  it("does not invent a state transition for a sensor absent from a partial message", () => {
    const evaluations = evaluateSensorAlerts({ temperatureC: null, waterLevelPercent: 19 });
    expect(evaluations).toHaveLength(1);
    expect(evaluations[0].type).toBe("WATER_LOW");
  });
});
