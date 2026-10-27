"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ActuatorStateBadge, ActuatorState } from "@/components/ui/actuator-state-badge";

type ActuatorType = "PUMP" | "FAN" | "LIGHT" | "VALVE" | "MOTOR" | "HEATER";

type ActuatorCardProps = {
  id: string;
  name: string;
  type: ActuatorType;
  controllerId: string;
  state: ActuatorState;
  runtimeMinutes?: number;
  progressPercent?: number;
  lastCommand?: string;
  lastCommandAgo?: string;
  onToggle: (desiredState: "RUNNING" | "OFF") => void;
  onConfirm?: (desiredState: "RUNNING" | "OFF") => void;
  interlockReason?: string;
  className?: string;
};

const TYPE_ICONS: Record<ActuatorType, string> = {
  PUMP: "💧",
  FAN: "🌬",
  LIGHT: "💡",
  VALVE: "🚪",
  MOTOR: "⚙",
  HEATER: "🔥",
};

const TYPE_LABELS: Record<ActuatorType, string> = {
  PUMP: "Pump",
  FAN: "Fan",
  LIGHT: "Light",
  VALVE: "Valve",
  MOTOR: "Motor",
  HEATER: "Heater",
};

export function ActuatorCard({
  id,
  name,
  type,
  controllerId,
  state,
  runtimeMinutes,
  progressPercent,
  lastCommand,
  lastCommandAgo,
  onToggle,
  onConfirm,
  interlockReason,
  className,
}: ActuatorCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmingState, setConfirmingState] = useState<"RUNNING" | "OFF">("RUNNING");

  const isRunning = state === "RUNNING";
  const canToggle = state !== "PENDING" && state !== "STOPPING" && state !== "ERROR" && state !== "OFFLINE";
  const desiredState = isRunning ? "OFF" : "RUNNING";
  const buttonLabel = isRunning ? "Stop" : "Start";
  const buttonVariant: "primary" | "danger" | "secondary" = isRunning ? "danger" : "primary";

  const handleToggle = useCallback(() => {
    if (!canToggle) return;
    if (onConfirm) {
      setConfirmingState(desiredState);
      setConfirmOpen(true);
    } else {
      onToggle(desiredState);
    }
  }, [canToggle, desiredState, onToggle, onConfirm]);

  return (
    <div className={`actuator-card rounded-lg border bg-card p-5 shadow-sm ${className || ""}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-lg">
            {TYPE_ICONS[type]}
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm">{name}</h3>
            <p className="text-xs text-muted-foreground">{TYPE_LABELS[type]} • {controllerId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ActuatorStateBadge state={state} showIcon className="text-[10px] px-2 py-1" />
        </div>
      </div>

      {interlockReason && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 mb-3">
          <div className="flex items-start gap-2">
            <span className="text-destructive text-xs">⚠</span>
            <p className="text-xs text-destructive leading-tight">{interlockReason}</p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {runtimeMinutes !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Runtime</span>
            <span className="font-medium font-mono">{runtimeMinutes} min</span>
          </div>
        )}

        {progressPercent !== undefined && state !== "OFF" && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(0, Math.min(100, progressPercent))}%`,
                  background: state === "RUNNING" ? "hsl(var(--success))" : "hsl(var(--warning))",
                }}
              />
            </div>
          </div>
        )}

        {lastCommand && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Last Command</span>
            <span className="font-mono text-muted-foreground">{lastCommand}</span>
          </div>
        )}

        {lastCommandAgo && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Time</span>
            <span className="text-muted-foreground">{lastCommandAgo}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <Button
          onClick={handleToggle}
          disabled={!canToggle}
          variant={buttonVariant}
          size="sm"
          className="flex-1"
        >
          {state === "PENDING" ? "Starting…" : state === "STOPPING" ? "Stopping…" : buttonLabel}
        </Button>
        {!canToggle && state !== "OFFLINE" && (
          <span className="text-xs text-muted-foreground">Waiting…</span>
        )}
      </div>

      {/* Confirmation Dialog (inline, rendered via portal would be ideal but kept simple here) */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Confirm actuator action">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmOpen(false)} />
          <div className="relative bg-popover border border-border p-5 shadow-lg rounded-lg w-full max-w-sm text-popover-foreground">
            <h3 className="font-bold text-lg mb-2">Confirm Action</h3>
            <p className="text-sm mb-4">Are you sure you want to {desiredState === "RUNNING" ? "start" : "stop"} <strong>{name}</strong>?</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={() => {
                setConfirmOpen(false);
                onToggle(desiredState);
              }}>Confirm</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
