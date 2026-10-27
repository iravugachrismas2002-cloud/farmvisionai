"use client";

import { RWANDA_WEATHER } from "@/components/ui/rwanda-intelligence-data";

type ExecutiveDashboardCardsProps = {
  className?: string;
};

export function ExecutiveDashboardCards({
  className,
}: ExecutiveDashboardCardsProps) {
  return (
    <div
      className={`rwanda-executive-cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6 ${className || ""}`}
    >
      {/* ESP32 Status Card */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl text-info" aria-hidden="true">
              📡
            </span>
            <h4 className="text-sm font-bold text-foreground">
              ESP32 Controller
            </h4>
          </div>
          <span className="text-xs font-bold text-success uppercase tracking-wider">
            Online
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last Heartbeat</span>
            <span className="font-mono text-foreground">2 sec ago</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Signal Quality</span>
            <span className="font-mono text-foreground">92%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Power</span>
            <span className="font-mono text-foreground">External</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Firmware</span>
            <span className="font-mono text-foreground">v1.0.0</span>
          </div>
        </div>
      </div>

      {/* Farm Health Card */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl text-success" aria-hidden="true">
              🌾
            </span>
            <h4 className="text-sm font-bold text-foreground">Farm Health</h4>
          </div>
          <span className="text-xs font-bold text-success uppercase tracking-wider">
            Healthy
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">2</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Active Farms
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">12</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Healthy Sensors
            </p>
          </div>
        </div>
        <div className="mt-3 h-2 w-full bg-muted rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-success" style={{ width: "95%" }} />
        </div>
      </div>

      {/* National Agriculture Snapshot Card */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl text-primary" aria-hidden="true">
              🇷🇼
            </span>
            <h4 className="text-sm font-bold text-foreground">
              National Snapshot
            </h4>
          </div>
          <span className="text-xs font-bold text-success uppercase tracking-wider">
            Season B 2026
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">GDP Contribution</span>
            <span className="font-mono text-foreground">~22-25%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Ag Land</span>
            <span className="font-mono text-foreground">1.414M ha</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className="font-mono text-foreground">Healthy</span>
          </div>
        </div>
      </div>

      {/* Weather Card */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl text-info" aria-hidden="true">
              ☁️
            </span>
            <h4 className="text-sm font-bold text-foreground">Rwanda Weather</h4>
          </div>
          <span className="text-xs font-bold text-info uppercase tracking-wider">
            Kigali
          </span>
        </div>
        <div className="flex items-center gap-6 mt-2">
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">
              {RWANDA_WEATHER.temperature}°C
            </p>
            <p className="text-xs text-muted-foreground">{RWANDA_WEATHER.condition}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {RWANDA_WEATHER.humidity}%
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Humidity
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {RWANDA_WEATHER.rainfall}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Rainfall
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {RWANDA_WEATHER.forecast}
        </p>
      </div>

      {/* Alerts Card */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl text-warning" aria-hidden="true">
              🚨
            </span>
            <h4 className="text-sm font-bold text-foreground">Active Alerts</h4>
          </div>
          <span className="text-xs font-bold text-warning uppercase tracking-wider">
            2 Open
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 rounded-lg border border-destructive/20 bg-destructive/5">
            <span className="text-destructive">🔴</span>
            <div className="flex-1">
              <p className="text-xs font-medium text-foreground">
                High Temperature Detected
              </p>
              <p className="text-[10px] text-muted-foreground">
                Temperature rose above 30°C threshold
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg border border-warning/20 bg-warning/5">
            <span className="text-warning">🟡</span>
            <div className="flex-1">
              <p className="text-xs font-medium text-foreground">
                Low Water Level
              </p>
              <p className="text-[10px] text-muted-foreground">
                Water level dropped below 20% threshold
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Productivity Score Card */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl text-primary" aria-hidden="true">
              📊
            </span>
            <h4 className="text-sm font-bold text-foreground">Productivity Score</h4>
          </div>
          <span className="text-xs font-bold text-success uppercase tracking-wider">
            87/100
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-success"
              style={{ width: "87%" }}
            />
          </div>
          <span className="text-xs font-bold text-foreground">Good</span>
        </div>
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Sensor Availability</span>
            <span className="font-mono text-foreground">95%</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Alert Resolution</span>
            <span className="font-mono text-foreground">85%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
