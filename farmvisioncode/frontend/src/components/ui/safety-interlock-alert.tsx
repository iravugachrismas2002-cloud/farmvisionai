"use client";

import { ReactNode } from "react";

type SafetyInterlockRule = {
  rule: string;
  satisfied: boolean;
  reason?: string;
};

type SafetyInterlockAlertProps = {
  actuatorName: string;
  canStart: boolean;
  blockingReason?: string;
  rules?: SafetyInterlockRule[];
  className?: string;
};

export function SafetyInterlockAlert({
  actuatorName,
  canStart,
  blockingReason,
  rules,
  className,
}: SafetyInterlockAlertProps) {
  if (!rules || rules.length === 0) {
    return (
      <div className={`safety-interlock rounded-lg border p-4 ${className || ""}`}>
        <div className="flex items-start gap-2">
          <span className={canStart ? "text-success" : "text-destructive"}>
            {canStart ? "✅" : "❌"}
          </span>
          <div>
            <p className={`font-medium ${canStart ? "text-success" : "text-destructive"}`}>
              {canStart
                ? `${actuatorName} is ready to start`
                : `Cannot start ${actuatorName}`}
            </p>
            {blockingReason && (
              <p className="text-xs text-muted-foreground mt-1">{blockingReason}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const allSatisfied = rules.every((r) => r.satisfied);

  return (
    <div className={`safety-interlock rounded-lg border p-4 ${className || ""}`}>
      <div className="flex items-start gap-2 mb-2">
        <span className={allSatisfied ? "text-success" : "text-destructive"}>
          {allSatisfied ? "✅" : "🚫"}
        </span>
        <div>
          <p className={`font-medium ${allSatisfied ? "text-success" : "text-destructive"}`}>
            {allSatisfied
              ? `${actuatorName} can start safely`
              : `Cannot start ${actuatorName}`}
          </p>
          {!allSatisfied && blockingReason && (
            <p className="text-xs text-muted-foreground mt-1">{blockingReason}</p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        {rules.map((rule, index) => (
          <div key={index} className="flex items-start gap-2">
            <span className={`text-xs ${rule.satisfied ? "text-success" : "text-muted-foreground"}`}>
              {rule.satisfied ? "✓" : "✗"}
            </span>
            <div className="text-sm leading-tight">
              <p className={`${rule.satisfied ? "text-foreground" : "text-muted-foreground"} font-medium`}>
                {rule.rule}
              </p>
              {rule.reason && !rule.satisfied && (
                <p className="text-xs text-muted-foreground mt-0.5">{rule.reason}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
