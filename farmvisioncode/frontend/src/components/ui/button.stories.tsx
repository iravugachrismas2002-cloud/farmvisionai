import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { Button } from "./button";

const meta = {
  title: "Components/Actions/Button",
  component: Button,
  tags: ["autodocs"],

  parameters: {
    docs: {
      description: {
        component:
          "FarmVision action button with semantic variants, accessible focus states, loading behavior, and industrial sizing.",
      },
    },
  },

  args: {
    children: "Create farm",
    variant: "primary",
    size: "default",
    disabled: false,
    loading: false,
    onClick: fn(),
  },

  argTypes: {
    variant: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "ghost",
        "danger",
      ],
    },

    size: {
      control: "radio",
      options: ["default", "sm", "lg", "icon"],
    },

    disabled: {
      control: "boolean",
    },

    loading: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Primary: Story = {
  args: {
    children: "Create farm",
    variant: "primary",
  },
};

export const Secondary: Story = {
  args: {
    children: "View details",
    variant: "secondary",
  },
};

export const Success: Story = {
  args: {
    children: "Approve access",
    variant: "primary", // Using primary as success variant in existing component
  },
};

export const Warning: Story = {
  args: {
    children: "Review alert",
    variant: "primary", // Using primary as warning variant in existing component
  },
};

export const Danger: Story = {
  args: {
    children: "Deactivate device",
    variant: "danger",
  },
};

export const Ghost: Story = {
  args: {
    children: "Open menu",
    variant: "ghost",
  },
};

export const Loading: Story = {
  args: {
    children: "Saving",
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: "Unavailable",
    disabled: true,
  },
};

export const AllSizes: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
      }}
    >
      <Button size="default">Default</Button>
      <Button size="sm">Small</Button>
      <Button size="lg">Large</Button>
      {/* icon variant */}
      <Button size="icon" aria-label="Menu">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 5.293a1 1 0 011.414 0L10 8.586l4.707-4.707a1 1 0 111.414 1.414L11.414 10l4.707 4.707a1 1 0 01-1.414 1.414L10 11.414l-4.707 4.707a1 1 0 01-1.414-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </Button>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "16px",
      }}
    >
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
};

export const KeyboardActivation: Story = {
  args: {
    children: "Acknowledge alert",
    onClick: fn(),
  },

  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", {
      name: "Acknowledge alert",
    });

    await userEvent.tab();
    await expect(button).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};