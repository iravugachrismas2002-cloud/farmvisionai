import type { Meta, StoryObj } from "@storybook/react";
import { KpiCard } from "./kpi-card";

const meta = {
  title: "Dashboard/KpiCard",
  component: KpiCard,
  tags: ["autodocs"],

  args: {
    label: "Connected devices",
    value: 12,
    change: 8.4,
    trend: "up",
    status: "healthy",
    loading: false,
  },

  argTypes: {
    trend: {
      control: "radio",
      options: ["up", "down", "stable"],
    },

    status: {
      control: "select",
      options: ["healthy", "info", "warning", "critical", "unavailable"],
    },

    loading: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof KpiCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ConnectedDevices: Story = {};

export const ActiveAlerts: Story = {
  args: {
    label: "Active alerts",
    value: 3,
    change: 1,
    trend: "up",
    status: "warning",
  },
};

export const CriticalStatus: Story = {
  args: {
    label: "Critical conditions",
    value: 2,
    trend: "up",
    status: "critical",
  },
};

export const Unavailable: Story = {
  args: {
    label: "Farm performance score",
    value: null,
    status: "unavailable",
    description: "No production scoring policy is configured.",
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const DashboardRow: Story = {
  render: () => (
    <div
      style={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "16px",
      }}
    >
      <KpiCard label="Owned farms" value={2} trend="stable" status="healthy" />
      <KpiCard label="Connected devices" value={12} change={8.4} trend="up" status="healthy" />
      <KpiCard label="Active alerts" value={3} change={1} trend="up" status="warning" />
      <KpiCard label="Recommendations" value={3} trend="stable" status="info" />
    </div>
  ),
};