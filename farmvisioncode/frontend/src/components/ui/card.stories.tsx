import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./card";

const meta = {
  title: "Components/Surfaces/Card",
  component: Card,
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;

export const Standard: Story = {
  render: () => (
    <Card>
      Standard card content
    </Card>
  ),
};