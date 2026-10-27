"use client";

import { useEffect, useState } from "react";
import { ActuatorStateBadge } from "@/components/ui/actuator-state-badge";

type Esp32ConnectionStatus = "ONLINE" | "UNSTABLE" | "OFFLINE" | "UNKNOWN";

type Esp32StatusCardProps = {
  deviceId: string;
  name?: string;
  location?: string;
  firmware?: string;
  signalPercent?: number;
  lastHeartbeatAgoSeconds?: number;
  powerSource?: string;
  onHeartbeatUpdate?: (status: Esp32ConnectionStatus) => void;
};

function getConnectionStatus(lastHeartbeatAgoSeconds?: number): Esp32ConnectionStatus {
  if (lastHeartbeatAgoSeconds === undefined || lastHeartbeatAgoSeconds === null) return "UNKNOWN";
  if (lastHeartbeatAgoSeconds < 30) return "ONLINE";
  if (lastHeartbeatAgoSeconds <= 60) return "UNSTABLE";
  return "OFFLINE";
}

function statusColorVariant(status: Esp32ConnectionStatus): "success" | "warning" | "destructive" | "secondary" {
  switch (status) {
    case "ONLINE": return "success";
    case "UNSTABLE": return "warning";
    case "OFFLINE": return "destructive";
    case "UNKNOWN": return "secondary";
  }
}

function statusLabel(status: Esp32ConnectionStatus): string {
  switch (status) {
    case "ONLINE": return "Online";
    case "UNSTABLE": return "Unstable";
    case "OFFLINE": return "Offline";
    case "UNKNOWN": return "Unknown";
  }
}

export function Esp32StatusCard({
  deviceId,
  name,
  location,
  firmware,
  signalPercent,
  lastHeartbeatAgoSeconds,
  powerSource,
  onHeartbeatUpdate,
}: Esp32StatusCardProps) {
  const [connectionStatus, setConnectionStatus] = useState<Esp32ConnectionStatus>(() => getConnectionStatus(lastHeartbeatAgoSeconds));

  useEffect(() => {
    const status = getConnectionStatus(lastHeartbeatAgoSeconds);
    setConnectionStatus(status);
    onHeartbeatUpdate?.(status);
  }, [lastHeartbeatAgoSeconds, onHeartbeatUpdate]);

  const lastHeartbeatDisplay = lastHeartbeatAgoSeconds !== undefined
    ? `${lastHeartbeatAgoSeconds} sec ago`
    : "Never connected";

  return (
    <div className="esp32-status-card rounded-lg border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            ESP
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm">{name ?? deviceId}</h3>
            <p className="text-xs text-muted-foreground">{deviceId}</p>
          </div>
        </div>
        <ActuatorStateBadge
          state={connectionStatus === "ONLINE" ? "RUNNING" : connectionStatus === "UNSTABLE" ? "PENDING" : connectionStatus === "OFFLINE" ? "OFFLINE" : "OFF"}
          showIcon={false}
          className={`text-[10px] px-2 py-1`}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Connection</span>
          <span className={`font-medium ${statusColorVariant(connectionStatus)}`}>{statusLabel(connectionStatus)}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Last Heartbeat</span>
          <span className="font-mono text-xs">{lastHeartbeatDisplay}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Signal Quality</span>
          <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full"
              style={{
                width: `${Math.max(0, Math.min(100, signalPercent ?? 0))}%`,
                background: `hsl(var(--${connectionStatus === "ONLINE" ? "success" : connectionStatus === "UNSTABLE" ? "warning" : "destructive"}))`,
              }}
            />
          </div>
          <span className="text-xs font-mono">{signalPercent ?? 0}%</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Power</span>
          <span className="font-medium">{powerSource ?? "—"}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Firmware</span>
          <span className="font-mono text-xs">{firmware ?? "—"}</span>
        </div>

        {location && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Location</span>
            <span className="font-medium">{location}</span>
          </div>
        )}
      </div>
    </div>
  );
}
