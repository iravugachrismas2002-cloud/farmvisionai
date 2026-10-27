import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Input } from "./forms";

const meta = {
  title: "Components/Forms/Input",
  component: Input,
  tags: ["autodocs"],

  args: {
    label: "Farm name",
    placeholder: "Enter farm name",
    disabled: false,
    required: false,
  },

  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search"],
    },

    disabled: {
      control: "boolean",
    },

    required: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Standard: Story = {};

export const Required: Story = {
  args: {
    label: "Device name",
    placeholder: "Enter device name",
    required: true,
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Farm name",
    placeholder: "Enter farm name",
    helperText: "Use a recognizable name for this device.",
  },
};

export const WithError: Story = {
  args: {
    label: "Farm name",
    placeholder: "Enter farm name",
    error: "Farm name is required.",
  },
};

export const Disabled: Story = {
  args: {
    label: "Farm name",
    placeholder: "Enter farm name",
    disabled: true,
  },
};

export const Search: Story = {
  args: {
    label: "Search devices",
    placeholder: "Search by device name or identifier",
    type: "search",
  },
};

export const NumericTelemetryInput: Story = {
  args: {
    label: "Water depletion rate",
    placeholder: "Enter percentage points per day.",
    type: "number",
    min: 0,
    max: 100,
    step: 0.1,
  },
};

export const KeyboardEntry: Story = {
  args: {
    label: "Farm name",
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", {
      name: "Farm name",
    });

    await userEvent.click(input);
    await userEvent.type(input, "Nkotsi Smart Farm");

    await expect(input).toHaveValue("Nkotsi Smart Farm");
  },
};