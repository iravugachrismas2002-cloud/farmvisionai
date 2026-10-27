import type { Meta, StoryObj } from "@storybook/react";
import { StatusBadge } from "./status-badge";

const meta = {
  title: "Components/Data Display/StatusBadge",
  component: StatusBadge,
  tags: ["autodocs"],

  args: {
    status: "online",
    showIcon: true,
  },

  argTypes: {
    status: {
      control: "select",
      options: [
        "online",
        "offline",
        "warning",
        "maintenance",
        "active",
        "acknowledged",
        "resolved",
        "draft",
        "published",
        "archived",
      ],
    },

    showIcon: {
      control: "boolean",
    },
  },

  parameters: {
    docs: {
      description: {
        component:
          "Semantic status badge that combines color, icon, and text instead of relying on color alone.",
      },
    },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Online: Story = {
  args: {
    status: "online",
  },
};

export const Offline: Story = {
  args: {
    status: "offline",
  },
};

export const Warning: Story = {
  args: {
    status: "warning",
  },
};

export const Maintenance: Story = {
  args: {
    status: "maintenance",
  },
};

export const DeviceStatuses: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
      <StatusBadge status="online" />
      <StatusBadge status="offline" />
      <StatusBadge status="warning" />
      <StatusBadge status="maintenance" />
    </div>
  ),
};

export const RecommendationStatuses: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
      <StatusBadge status="active" />
      <StatusBadge status="acknowledged" />
      <StatusBadge status="resolved" />
    </div>
  ),
};

export const MarketplaceStatuses: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
      <StatusBadge status="draft" />
      <StatusBadge status="published" />
      <StatusBadge status="archived" />
    </div>
  ),
};