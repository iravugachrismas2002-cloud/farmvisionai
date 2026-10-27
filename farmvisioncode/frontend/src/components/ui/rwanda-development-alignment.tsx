"use client";

import { RWANDA_DEVELOPMENT_ALIGNMENT } from "@/components/ui/rwanda-intelligence-data";

type RwandaDevelopmentAlignmentProps = {
  className?: string;
};

export function RwandaDevelopmentAlignment({
  className,
}: RwandaDevelopmentAlignmentProps) {
  return (
    <div
      className={`rwanda-development-alignment rounded-lg border bg-card p-5 shadow-sm ${className || ""}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg text-primary" aria-hidden="true">
            🇷🇼
          </span>
          <h3 className="font-bold text-lg text-foreground">
            Rwanda Development Alignment
          </h3>
        </div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          National Strategies
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {RWANDA_DEVELOPMENT_ALIGNMENT.map((item) => (
          <div
            key={item.name}
            className={`p-3 rounded-lg border ${item.status ? "bg-success/5 border-success/20" : "bg-muted/20 border-muted/40"}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={item.status ? "text-success" : "text-muted-foreground"}>
                {item.status ? "✅" : "⭘"}
              </span>
              <p className="text-xs font-medium text-foreground">
                {item.name}
              </p>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {item.status ? "Active" : "In Development"}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-lg border bg-blue-50/20 border-blue-100/50">
        <p className="text-xs text-blue-800 font-medium mb-1">
          Alignment with Rwanda's Digital Agriculture Strategy
        </p>
        <p className="text-xs text-blue-700">
          FarmVision AI supports digital farming, irrigation, farm monitoring,
          data collection, precision agriculture, climate resilience, and
          agricultural productivity — key pillars of Rwanda's transformation
          toward technology-driven agriculture.
        </p>
      </div>
    </div>
  );
}
