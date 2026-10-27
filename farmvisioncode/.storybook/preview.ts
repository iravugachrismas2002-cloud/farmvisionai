import type { Preview } from "@storybook/react";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    layout: "centered",

    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    backgrounds: {
      default: "FarmVision Dark",
      values: [
        {
          name: "FarmVision Dark",
          value: "#071018",
        },
        {
          name: "Industrial Surface",
          value: "#0b1220",
        },
        {
          name: "FarmVision Light",
          value: "#f8fafc",
        },
        {
          name: "Pure White",
          value: "#ffffff",
        },
      ],
    },

    a11y: {
      test: "error",
    },

    options: {
      storySort: {
        order: [
          "Foundation",
          "Components",
          "Dashboard",
          "Monitoring",
          "Analytics",
          "Intelligence",
          "Digital Twin",
          "Agronomist",
          "Marketplace",
          "Admin",
        ],
      },
    },
  },

  decorators: [
    (Story) => (
      <div
        style={{
          width: "100%",
          minWidth: "320px",
          padding: "32px",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default preview;