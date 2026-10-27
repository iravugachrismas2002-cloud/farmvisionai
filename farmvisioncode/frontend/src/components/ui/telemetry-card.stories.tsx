import type { Meta, StoryObj } from "@storybook/react";
import { TelemetryCard } from "./telemetry-card";

const meta = {
  title: "Monitoring/TelemetryCard",
  component: TelemetryCard,
  tags: ["autodocs"],

  args: {
    label: "Temperature",
    value: 29.4,
    unit: "°C",
    minimum: 24.2,
    maximum: 32.1,
    trend: "up",
    source: "hardware",
    observedAt: "2026-10-25T18:30:00.000Z",
    status: "normal",
  },

  argTypes: {
    trend: {
      control: "radio",
      options: ["up", "down", "stable", "unavailable"],
    },

    source: {
      control: "select",
      options: ["hardware", "simulator"],
    },

    status: {
      control: "select",
      options: ["normal", "warning", "critical", "unavailable"],
    },
  },
} satisfies Meta<typeof TelemetryCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Temperature: Story = {};

export const Humidity: Story = {
  args: {
    label: "Humidity",
    value: 72,
    unit: "%",
    minimum: 64,
    maximum: 79,
    trend: "stable",
  },
};

export const FeedLevelWarning: Story = {
  args: {
    label: "Feed level",
    value: 18,
    unit: "%",
    minimum: 18,
    maximum: 64,
    trend: "down",
    status: "warning",
  },
};

export const WaterLevelCritical: Story = {
  args: {
    label: "Water level",
    value: 8,
    unit: "%",
    minimum: 8,
    maximum: 56,
    trend: "down",
    status: "critical",
  },
};

export const MissingSensorValue: Story = {
  args: {
    label: "Feed weight",
    value: null,
    unit: "g",
    minimum: null,
    maximum: null,
    trend: "unavailable",
    status: "unavailable",
  },
};

export const MonitoringGrid: Story = {
  render: () => (
    <div
      style={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "16px",
      }}
    >
      <TelemetryCard
        label="Temperature"
        value={29.4}
        unit="°C"
        minimum={24.2}
        maximum={32.1}
        trend="up"
        source="hardware"
        status="normal"
      />

      <TelemetryCard
        label="Humidity"
        value={72}
        unit="%"
        minimum={64}
        maximum={79}
        trend="stable"
        source="hardware"
        status="normal"
      />

      <TelemetryCard
        label="Feed level"
        value={18}
        unit="%"
        minimum={18}
        maximum={64}
        trend="down"
        source="hardware"
        status="warning"
      />

      <TelemetryCard
        label="Water level"
        value={8}
        unit="%"
        minimum={8}
        maximum={56}
        trend="down"
        source="hardware"
        status="critical"
      />
    </div>
  ),
};