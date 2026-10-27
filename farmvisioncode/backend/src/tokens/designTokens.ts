/**
 * FarmVision AI - Industry 5.0 Design Token System
 * Single source of truth for colors, typography, spacing, animations, and component tokens
 * Consistent appearance across all 17 pages: Dashboard, Farms, Devices, Alerts, Recommendations,
 * Analytics, Intelligence, Digital Twin, Agronomist, Marketplace, Admin, and more.
 *
 * Implementation: Next.js + Tailwind CSS + CSS Variables
 * Theme support: Light & Dark modes with system preference detection
 */

export const tokens = {
  // Foundation
  brand: "FarmVision AI",
  version: "Industry 5.0",

  // === COLOR TOKENS ===

  // Primary Brand Color Palette (Emerald/Green theme)
  primary: {
    50: "#ecfdf5",
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
    800: "#065f46",
    900: "#064e3b",
  },

  // Industrial Blue Palette
  blue: {
    50: "#eff6ff",
    100: "#dbeafe",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
  },

  // Twin Cyan Palette
  cyan: {
    300: "#67e8f9",
    400: "#22d3ee",
    500: "#06b6d4",
    600: "#0891b2",
  },

  // Risk / Severity Colors
  risk: {
    success: "#22c55e",
    info: "#0ea5e9",
    warning: "#f59e0b",
    danger: "#ef4444",
    critical: "#b91c1c",
  },

  // === DARK THEME ===
  dark: {
    bgPrimary: "#071018",
    bgSecondary: "#0b1220",
    bgTertiary: "#131d2f",

    surface1: "#111827",
    surface2: "#172033",
    surface3: "#1d2b42",

    // Light mode text colors (overridden in light mode)
    textPrimary: "#f8fafc",
    textSecondary: "#cbd5e1",
    textMuted: "#94a3b8",
    textDisabled: "#64748b",
  },

  // === LIGHT THEME ===
  light: {
    bgPrimary: "#f8fafc",
    bgSecondary: "#ffffff",
    bgTertiary: "#f1f5f9",

    surface1: "#ffffff",
    surface2: "#f8fafc",
    surface3: "#e2e8f0",

    textPrimary: "#0f172a",
    textSecondary: "#334155",
    textMuted: "#64748b",
    textDisabled: "#94a3b8",
  },

  // === TEXT TOKENS ===
  text: {
    primary: "var(--mode-text-primary)",
    secondary: "var(--mode-text-secondary)",
    muted: "var(--mode-text-muted)",
    disabled: "var(--mode-text-disabled)",
  },

  // === TYPOGRAPHY TOKENS ===
  font: {
    primary: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
    secondary: "Geist, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
    mono: "JetBrains Mono, Menlo, Monaco, Cascadia Mono, 'Source Code Pro', monospace",
  },

  // Heading Scale (pixel sizes for 480px+ viewport)
  textSize: {
    xs: "0.75rem",    // 12px
    sm: "0.875rem",   // 14px
    md: "1rem",       // 16px
    lg: "1.125rem",   // 18px
    xl: "1.25rem",    // 20px
    "2xl": "1.5rem",  // 24px
    "3xl": "1.875rem",// 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem",    // 48px
  },

  // Heading usage definitions (for design system documentation)
  heading: {
    H1: "48px",        // Dashboard Title
    H2: "36px",        // Section Header
    H3: "28px",        // Widget Header
    H4: "24px",        // Card Header
    H5: "20px",        // Table Header
  },

  // === SPACING TOKENS ===
  space: {
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px",
    10: "40px",
    12: "48px",
    16: "64px",
  },

  // === BORDER RADIUS TOKENS ===
  radius: {
    xs: "6px",
    sm: "10px",
    md: "14px",
    lg: "18px",
    xl: "24px",
    "2xl": "32px",
  },

  // === SHADOW TOKENS ===
  shadow: {
    sm: "0 2px 10px rgba(0,0,0,.06)",
    md: "0 8px 30px rgba(0,0,0,.12)",
    lg: "0 20px 50px rgba(0,0,0,.18)",
  },

  // === GLASS EFFECT TOKENS ===
  glass: {
    bg: "rgba(255,255,255,.08)",
    border: "rgba(255,255,255,.12)",
    blur: "blur(20px)",
  },

  // === SIDEBAR TOKENS ===
  sidebar: {
    width: "280px",
    collapsed: "80px",
  },

  // === DASHBOARD KPI TOKENS ===
  kpi: {
    height: "160px",
    radius: "24px",
  },

  // KPI Gradient (Primary -> Cyan)
  kpiGradient: {
    primary: "linear-gradient(135deg, #10b981, #06b6d4)",
  },

  // === CHART COLORS ===
  chart: {
    green: "#10b981",
    blue: "#2563eb",
    cyan: "#06b6d4",
    orange: "#f59e0b",
    red: "#ef4444",
  },

  // === ALERT SEVERITY TOKENS ===
  alertSeverity: {
    info: "#0ea5e9",
    warning: "#f59e0b",
    critical: "#ef4444",
    resolved: "#22c55e",
  },

  // === DEVICE STATUS TOKENS ===
  deviceStatus: {
    online: "#22c55e",
    offline: "#ef4444",
    warning: "#f59e0b",
    maintenance: "#6366f1",
  },

  // === ANIMATION TOKENS ===
  animation: {
    duration: {
      fast: "150ms",
      normal: "300ms",
      page: "500ms",
      slow: "800ms",
    },

    // Motion presets (for Framer Motion / CSS keyframes)
    presets: {
      fade: {
        from: { opacity: 0 },
        to: { opacity: 1 },
      },

      kpiCard: {
        from: { y: 24, opacity: 0 },
        to: { y: 0, opacity: 1 },
      },

      sidebar: {
        from: { x: -40, opacity: 0 },
        to: { x: 0, opacity: 1 },
      },
    },
  },

  // === LAYOUT TOKENS ===
  layout: {
    pageMaxWidth: "1800px",
    dashboardWidth: "1920px",

    // Grid system
    grid: {
      desktop: 12,   // 12-column grid on desktop
      tablet: 8,     // 8-column grid on tablet
      mobile: 4,     // 4-column grid on mobile
    },
  },

  // === COMPONENT TOKENS ===
  component: {
    // Buttons
    button: {
      height: {
        sm: "40px",
        md: "48px",
        lg: "56px",
      },
    },

    // Input components
    input: {
      height: "52px",
      radius: "16px",
    },

    // Tables
    table: {
      rowHeight: "56px",
      headerHeight: "64px",
      radius: "18px",
    },
  },

  // === DIGITAL TWIN TOKENS ===
  digitalTwin: {
    baseline: "#10b981",
    simulation: "#06b6d4",
    delta: "#f59e0b",
    risk: "#ef4444",
  },

  // === INDUSTRY 5.0 VISUAL IDENTITY ===
  visualIdentity: {
    // Composition ratios
    ratios: {
      deepEnterprise: "70%",    // Dark background
      emeraldAgriculture: "20%", // Green identity
      cyanIntelligence: "10%",  // Cyan accent layer
    },

    // Visual personality descriptors
    personality: [
      "Premium",
      "Industrial",
      "Scientific",
      "Data-Driven",
      "Modern",
      "AI-Centric",
      "Digital Twin Ready",
      "Enterprise Grade",
    ],

    // Color composition for each page
    pageComposition: {
      dashboard: "70% Deep Enterprise Background, 20% Emerald Agriculture Identity, 10% Cyan Intelligence Layer",
      farms: "65% Deep Enterprise Background, 25% Emerald Agriculture Identity, 10% Cyan Intelligence Layer",
      devices: "70% Deep Enterprise Background, 20% Emerald Agriculture Identity, 10% Cyan Intelligence Layer",
      alerts: "70% Deep Enterprise Background, 20% Emerald Agriculture Identity, 10% Cyan Intelligence Layer",
      recommendations: "70% Deep Enterprise Background, 20% Emerald Agriculture Identity, 10% Cyan Intelligence Layer",
      analytics: "70% Deep Enterprise Background, 20% Emerald Agriculture Identity, 10% Cyan Intelligence Layer",
      intelligence: "70% Deep Enterprise Background, 20% Emerald Agriculture Identity, 10% Cyan Intelligence Layer",
      digitalTwin: "80% Deep Enterprise Background, 15% Emerald Agriculture Identity, 5% Cyan Intelligence Layer",
      agronomist: "65% Deep Enterprise Background, 25% Emerald Agriculture Identity, 10% Cyan Intelligence Layer",
      marketplace: "70% Deep Enterprise Background, 20% Emerald Agriculture Identity, 10% Cyan Intelligence Layer",
      admin: "75% Deep Enterprise Background, 15% Emerald Agriculture Identity, 10% Cyan Intelligence Layer",
      marketplaceProducts: "70% Deep Enterprise Background, 20% Emerald Agriculture Identity, 10% Cyan Intelligence Layer",
      entrepreneur: "70% Deep Enterprise Background, 20% Emerald Agriculture Identity, 10% Cyan Intelligence Layer",
    },
  },
}

/**
 * CSS Custom Properties (CSS Variables) generation
 * Usage: `var(--fv-primary-500)` or `var(--fv-text-primary)`
 * 
 * Root variables are set based on `data-theme` attribute on `<html>` element.
 * Example: `<html data-theme="light">` or `<html data-theme="dark">`
 */
export const cssVariables = {
  // Root level - set via JS or Next.js data attribute
  root: `
    :root[data-theme="light"] {
      --fv-bg-primary: #f8fafc;
      --fv-bg-secondary: #ffffff;
      --fv-bg-tertiary: #f1f5f9;
      --fv-surface-1: #ffffff;
      --fv-surface-2: #f8fafc;
      --fv-surface-3: #e2e8f0;
      --fv-text-primary: #0f172a;
      --fv-text-secondary: #334155;
      --fv-text-muted: #64748b;
      --fv-text-disabled: #94a3b8;
      --fv-glass-bg: rgba(255,255,255,.08);
      --fv-glass-border: rgba(255,255,255,.12);
    }

    :root[data-theme="dark"] {
      --fv-bg-primary: #071018;
      --fv-bg-secondary: #0b1220;
      --fv-bg-tertiary: #131d2f;
      --fv-surface-1: #111827;
      --fv-surface-2: #172033;
      --fv-surface-3: #1d2b42;
      --fv-text-primary: #f8fafc;
      --fv-text-secondary: #cbd5e1;
      --fv-text-muted: #94a3b8;
      --fv-text-disabled: #64748b;
      --fv-glass-bg: rgba(255,255,255,.08);
      --fv-glass-border: rgba(255,255,255,.12);
    }

    /* Shared variables (both themes) */
    --fv-primary-50: #ecfdf5;
    --fv-primary-100: #d1fae5;
    --fv-primary-200: #a7f3d0;
    --fv-primary-300: #6ee7b7;
    --fv-primary-400: #34d399;
    --fv-primary-500: #10b981;
    --fv-primary-600: #059669;
    --fv-primary-700: #047857;
    --fv-primary-800: #065f46;
    --fv-primary-900: #064e3b;

    --fv-blue-50: #eff6ff;
    --fv-blue-100: #dbeafe;
    --fv-blue-500: #3b82f6;
    --fv-blue-600: #2563eb;
    --fv-blue-700: #1d4ed8;

    --fv-cyan-300: #67e8f9;
    --fv-cyan-400: #22d3ee;
    --fv-cyan-500: #06b6d4;
    --fv-cyan-600: #0891b2;

    --fv-success: #22c55e;
    --fv-info: #0ea5e9;
    --fv-warning: #f59e0b;
    --fv-danger: #ef4444;
    --fv-critical: #b91c1c;

    --fv-text-primary;
    --fv-text-secondary;
    --fv-text-muted;
    --fv-text-disabled;

    --fv-radius-sm: 10px;
    --fv-radius-md: 14px;
    --fv-radius-lg: 18px;
    --fv-radius-xl: 24px;
    --fv-radius-2xl: 32px;

    --fv-shadow-sm: 0 2px 10px rgba(0,0,0,.06);
    --fv-shadow-md: 0 8px 30px rgba(0,0,0,.12);
    --fv-shadow-lg: 0 20px 50px rgba(0,0,0,.18);

    --fv-kpi-height: 160px;
    --fv-kpi-radius: 24px;

    --fv-kpi-gradient: linear-gradient(135deg, #10b981, #06b6d4);

    --fv-chart-green: #10b981;
    --fv-chart-blue: #2563eb;
    --fv-chart-cyan: #06b6d4;
    --fv-chart-orange: #f59e0b;
    --fv-chart-red: #ef4444;

    --fv-alert-info: #0ea5e9;
    --fv-alert-warning: #f59e0b;
    --fv-alert-critical: #ef4444;
    --fv-alert-resolved: #22c55e;

    --fv-device-online: #22c55e;
    --fv-device-offline: #ef4444;
    --fv-device-warning: #f59e0b;
    --fv-device-maintenance: #6366f1;

    --fv-animation-duration-fast: 150ms;
    --fv-animation-duration-normal: 300ms;
    --fv-animation-duration-page: 500ms;
    --fv-animation-duration-slow: 800ms;

    --fv-space-1: 4px;
    --fv-space-2: 8px;
    --fv-space-3: 12px;
    --fv-space-4: 16px;
    --fv-space-5: 20px;
    --fv-space-6: 24px;
    --fv-space-8: 32px;
    --fv-space-10: 40px;
    --fv-space-12: 48px;
    --fv-space-16: 64px;

    --fv-font-primary: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    --fv-font-secondary: Geist, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    --fv-font-mono: JetBrains Mono, Menlo, Monaco, Cascadia Mono, 'Source Code Pro', monospace;

    --fv-text-xs: 0.75rem;
    --fv-text-sm: 0.875rem;
    --fv-text-md: 1rem;
    --fv-text-lg: 1.125rem;
    --fv-text-xl: 1.25rem;
    --fv-text-2xl: 1.5rem;
    --fv-text-3xl: 1.875rem;
    --fv-text-4xl: 2.25rem;
    --fv-text-5xl: 3rem;

    --fv-sidebar-width: 280px;
    --fv-sidebar-collapsed: 80px;

    --fv-page-max-width: 1800px;
    --fv-dashboard-width: 1920px;

    --fv-baseline: #10b981;
    --fv-simulation: #06b6d4;
    --fv-delta: #f59e0b;
    --fv-risk: #ef4444;
  `,
}

/**
 * Theme mode detection utility
 * Automatically detects system preference and sets default theme
 */
export const useTheme = () => {
  // Check for persistent theme preference in localStorage
  const storedTheme = localStorage.getItem("fv-theme")
  
  // If user explicitly set a theme, use it
  if (storedTheme) {
    return storedTheme as "light" | "dark"
  }

  // Otherwise, prefer 'light' for FarmVision Industry 5.0
  // (can be changed to 'dark' if preferred for this use case)
  return "light"
}

/**
 * Set theme persistently
 */
export const setTheme = (theme: "light" | "dark") => {
  localStorage.setItem("fv-theme", theme)
  document.documentElement.setAttribute("data-theme", theme)
}

// Auto-initialize theme on import
;(useTheme() === "dark" ? setTheme("dark") : setTheme("light"))

// Export for direct use in React components and Tailwind config
export default tokens