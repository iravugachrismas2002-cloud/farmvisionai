/**
 * FarmVision AI - Component Variant System (Industry 5.0 Edition)
 * Complete variant system ensuring visual consistency across all 17 pages
 * Buttons, Cards, Alerts, Tables, Inputs, Badges, Modals, Modals, Charts, Sidebar,
 * Dashboard Widgets, and more - all with predefined variants
 *
 * Every component accepts a 'variant' prop (or Tailwind variant classes)
 * drawn from this system, guaranteeing visual harmony.
 */

export const componentVariants = {
  // ==========================================
  // BUTTON VARIANTS
  // ==========================================

  button: {
    // ----- Primary Variant -----
    primary: {
      purpose: "Main actions (Save, Submit, Create)",
      background: "var(--fv-primary-600)",
      color: "white",
      hoverBackground: "var(--fv-primary-500)",
      activeBackground: "var(--fv-primary-700)",
    },

    // ----- Secondary Variant -----
    secondary: {
      purpose: "Secondary actions (View Details, Export)",
      background: "transparent",
      border: "1px solid currentColor",
      color: "var(--fv-text-primary)",
      hoverBackground: "var(--fv-primary-50)",
      hoverBorderColor: "var(--fv-primary-400)",
    },

    // ----- Success Variant -----
    success: {
      purpose: "Approve, Activate, Publish actions",
      background: "#22c55e",        // Emerald-500
      color: "white",
      hoverBackground: "#16a34a",   // Emerald-600,
    },

    // ----- Warning Variant -----
    warning: {
      purpose: "Review, Flag actions",
      background: "#f59e0b",        // Amber-500
      color: "#1e293b",             // Slate-900 for contrast
      hoverBackground: "#eab308",   // Amber-400,
    },

    // ----- Danger Variant -----
    danger: {
      purpose: "Delete, Deactivate actions",
      background: "#ef4444",        // Red-500
      color: "white",
      hoverBackground: "#dc2626",   // Red-600,
    },

    // ----- Ghost Variant -----
    ghost: {
      purpose: "Sidebar, Toolbars, Navigation secondary actions",
      background: "transparent",
      color: "var(--fv-text-primary)",
      hoverBackground: "var(--fv-primary-100)",
      border: "1px solid var(--fv-primary-200)",
    },

    // ----- Variants Size Map -----
    sizes: {
      xs: {
        height: "32px",
        padding: "0 12px",
        fontSize: "0.75rem",
      },
      sm: {
        height: "40px",
        padding: "0 16px",
        fontSize: "0.875rem",
      },
      md: {
        height: "48px",
        padding: "0 20px",
        fontSize: "1rem",
        // Default - most commonly used
      },
      lg: {
        height: "56px",
        padding: "0 24px",
        fontSize: "1.125rem",
      },
      xl: {
        height: "64px",
        padding: "0 32px",
        fontSize: "1.25rem",
      },
    },
  },

  // ==========================================
  // CARD VARIANTS
  // ==========================================

  card: {
    // ----- KPI Card Variant -----
    kpi: {
      purpose: "Dashboard metrics (Farm Health, Alerts, Devices)",
      height: "160px",
      radius: "var(--fv-radius-lg)",
      background: "var(--fv-surface-1)",
      border: "gradient",
      borderGradient: "var(--fv-kpi-gradient)", // linear-gradient(135deg, #10b981, #06b6d4)
      shadow: "var(--fv-shadow-md)",
      features: [
        "Counter Animation",
        "Status Chip",
        "Mini Chart",
      ],
    },

    // ----- Analytics Card Variant -----
    analytics: {
      purpose: "Charts, Statistics, Reports",
      height: "400px",      // minimum
      radius: "var(--fv-radius-lg)",
      background: "var(--fv-surface-1)",
      shadow: "var(--fv-shadow-md)",
    },

    // ----- Telemetry Card Variant -----
    telemetry: {
      purpose: "Real-time device data (Temperature, Humidity, Feed, Water)",
      radius: "var(--fv-radius-md)",
      background: "var(--fv-surface-1)",
      border: "1px solid var(--fv-primary-100)",
      shadow: "var(--fv-shadow-sm)",
      features: ["Current", "Min", "Max", "Trend"],
    },

    // ----- Digital Twin Card Variant -----
    digitalTwin: {
      purpose: "Displays Baseline, Scenario, Difference",
      radius: "var(--fv-radius-lg)",
      background: "var(--fv-glass-bg)",
      border: "var(--fv-glass-border)",
      backdropFilter: "var(--fv-glass-blur)",
      borderRadius: "var(--fv-radius-lg)",
    },
  },

  // ==========================================
  // ALERT COMPONENT VARIANTS
  // ==========================================

  alert: {
    // ----- Alert Banner Variant (top-screen notification) -----
    banner: {
      types: {
        info: {
          background: "var(--fv-info-bg)",
          borderColor: "var(--fv-info-border)",
          textColor: "var(--fv-info-text)",
        },
        warning: {
          background: "var(--fv-warning-bg)",
          borderColor: "var(--fv-warning-border)",
          textColor: "var(--fv-warning-text)",
        },
        critical: {
          background: "var(--fv-danger-bg)",
          borderColor: "var(--fv-danger-border)",
          textColor: "var(--fv-danger-text)",
        },
        success: {
          background: "var(--fv-success-bg)",
          borderColor: "var(--fv-success-border)",
          textColor: "var(--fv-success-text)",
        },
      },
    },

    // ----- Alert Card Variant (inside Alerts Center) -----
    card: {
      fields: {
        status: {
          padding: "2px 6px",
          borderRadius: "var(--fv-radius-xs)",
          fontSize: "0.75rem",
          fontWeight: "500",
        },
        severity: {
          padding: "2px 6px",
          borderRadius: "var(--fv-radius-xs)",
          fontSize: "0.75rem",
          fontWeight: "500",
        },
        timestamp: {
          fontSize: "0.875rem",
          color: "var(--fv-text-muted)",
        },
        evidence: {
          fontSize: "0.875rem",
          color: "var(--fv-text-primary)",
        },
      },
    },
  },

  // ==========================================
  // TABLE VARIANTS
  // ==========================================

  table: {
    // ----- Standard Table Variant -----
    standard: {
      purpose: "Users, Products, Devices tables",
      headerHeight: "var(--fv-space-6)", // 48px
      rowHeight: "var(--fv-space-5)",   // 20px
      headerBackground: "var(--fv-surface-2)",
      headerColor: "var(--fv-text-primary)",
      rowAlternating: true,
      rowAlternateColor: "var(--fv-surface-2)",
      radius: "var(--fv-radius-md)",
      stickyHeader: true,
    },

    // ----- Monitoring Table Variant (telemetry) -----
    monitoring: {
      purpose: "Telemetry data tables",
      stickyHeader: true,
      rowHighlight: true,
      virtualScrolling: true,
      oddRowBackground: "var(--fv-surface-1)",
      evenRowBackground: "var(--fv-surface-2)",
      highlightBackground: "var(--fv-primary-100)",
      highlightColor: "var(--fv-primary-600)",
    },

    // ----- Audit Table Variant (admin logs) -----
    audit: {
      purpose: "Admin logs table",
      columns: [
        { name: "User", width: "180px" },
        { name: "Action", width: "120px" },
        { name: "Target", width: "200px" },
        { name: "Result", width: "120px" },
        { name: "Timestamp", width: "180px" },
      ],
      headerRadius: "var(--fv-radius-md)",
      rowRadius: "var(--fv-radius-sm)",
    },
  },

  // ==========================================
  // INPUT VARIANTS
  // ==========================================

  input: {
    // ----- Standard Input Variant -----
    standard: {
      variants: {
        name: {},
        email: {
          type: "email",
          autoComplete: "name-email",
        },
        password: {
          type: "password",
          autoComplete: "current-password",
        },
      },
      height: "var(--fv-input-height)", // 52px
      radius: "var(--fv-input-radius)", // 16px
      background: "var(--fv-surface-1)",
      border: "1px solid var(--fv-primary-200)",
      color: "var(--fv-text-primary)",
      placeholderColor: "var(--fv-text-muted)",
      focusBorderColor: "var(--fv-primary-400)",
      focusBoxShadow: "0 0 0 3px var(--fv-primary-100)",
    },

    // ----- Search Input Variant -----
    search: {
      purpose: "Search inputs across all pages",
      height: "var(--fv-input-height)",
      radius: "var(--fv-input-radius)",
      background: "var(--fv-surface-1)",
      border: "1px solid var(--fv-primary-200)",
      color: "var(--fv-text-primary)",
      paddingLeft: "calc(var(--fv-space-4) + 28px)", // 16px + icon width
      backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 24 24\" fill%3D%22currentColor%22 xmlns%3D%22http://www.w3.org/2000/svg%3E%3Cpath d%22M21 21l-3.9-3.9a.5.5 0 0 0 0-.71l.71-.71a.5.5 0 0 1 .71 0l-.71-.71a.5.5 0 0 0-.5.5v4.39l-2.11 2.1a.5.5 0 0 1-.13.893L13 18.35l1.75 1.75a.5.5 0 0 1-.12.68l-7 7a.5.5 0 0 1-.64-.68l7-7a.5.5 0 0 1 .83 0z%22/%3E%3C/svg%3E')",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "98% center",
      backgroundSize: "16px",
      // focus state handled via CSS class: .search-input:focus
    },

    // ----- Telemetry Input Variant (Digital Twin) -----
    telemetry: {
      purpose: "Digital Twin feed/water/temperature rate inputs",
      height: "var(--fv-input-height)",
      radius: "var(--fv-input-radius)",
      background: "var(--fv-surface-2)",
      border: "1px solid var(--fv-primary-200)",
      color: "var(--fv-text-primary)",
    },
  },

  // ==========================================
  // BADGE VARIANTS
  // ==========================================

  badge: {
    // ----- Device Status Badges -----
    deviceStatus: {
      online: {
        background: "var(--fv-device-online)",
        color: "white",
        icon: "🟢",
      },
      offline: {
        background: "var(--fv-device-offline)",
        color: "white",
        icon: "🔴",
      },
      warning: {
        background: "var(--fv-device-warning)",
        color: "#1e293b",
        icon: "🟡",
      },
      maintenance: {
        background: "var(--fv-device-maintenance)",
        color: "white",
        icon: "🔵",
      },
    },

    // ----- Recommendation Status Badges -----
    recommendation: {
      active: {
        background: "var(--fv-success-bg)",
        border: "var(--fv-success-border)",
        text: "var(--fv-success-text)",
      },
      acknowledged: {
        background: "var(--fv-info-bg)",
        border: "var(--fv-info-border)",
        text: "var(--fv-info-text)",
      },
      resolved: {
        background: "var(--fv-success-bg)",
        border: "var(--fv-success-border)",
        text: "var(--fv-success-text)",
      },
    },

    // ----- Marketplace Status Badges -----
    marketplace: {
      draft: {
        background: "var(--fv-warning)",
        color: "#1e293b",
        label: "DRAFT",
      },
      published: {
        background: "var(--fv-success)",
        color: "white",
        label: "PUBLISHED",
      },
      archived: {
        background: "var(--fv-muted)",
        color: "var(--fv-text-muted)",
        label: "ARCHIVED",
      },
    },
  },

  // ==========================================
  // MODAL VARIANTS
  // ==========================================

  modal: {
    // ----- Confirmation Modal Variant -----
    confirmation: {
      purpose: "Delete Device, Remove Farm",
      radius: "var(--fv-radius-lg)",
      background: "var(--fv-surface-1)",
      border: "1px solid var(--fv-primary-200)",
    },

    // ----- Information Modal Variant -----
    information: {
      purpose: "Device Details, Sensor Data",
      radius: "var(--fv-radius-lg)",
      background: "var(--fv-surface-1)",
      border: "1px solid var(--fv-primary-100)",
    },

    // ----- Analytics Modal Variant -----
    analytics: {
      purpose: "Expanded Charts, Deep Analysis",
      radius: "var(--fv-radius-lg)",
      background: "var(--fv-surface-1)",
      border: "1px solid var(--fv-primary-100)",
    },
  },

  // ==========================================
  // CHART VARIANTS
  // ==========================================

  chart: {
    // ----- Telemetry Chart Variant -----
    telemetry: {
      purpose: "Temperature, Humidity charts",
      realtimeCapable: true,
      strokeWidth: 2,
      areaOpacity: 0.1,
    },

    // ----- Forecast Chart Variant -----
    forecast: {
      purpose: "Feed Forecast, Water Forecast (inside Intelligence module)",
      strokeWidth: 2,
      dashArray: [5, 5], // Dashed line for forecast
      strokeWidthForecast: 3,
      fillArea: true,
      forecastColor: "var(--fv-chart-cyan)",
    },

    // ----- Risk Heatmap Variant -----
    riskHeatmap: {
      purpose: "Critical Zones, Warning Zones, Healthy Zones",
      gradient: "linear-gradient(135deg, #ef4444, #f97316, #10b981)",
      zones: {
        critical: "#ef4444",
        warning: "#f97316",
        healthy: "#10b981",
      },
    },
  },

  // ==========================================
  // SIDEBAR VARIANTS
  // ==========================================

  sidebar: {
    // ----- Expanded Variant -----
    expanded: {
      width: "var(--fv-sidebar-width)", // 280px
      displays: ["icon", "label", "badge"],
    },

    // ----- Compact Variant -----
    compact: {
      width: "var(--fv-sidebar-collapsed)", // 80px
      displays: ["icon only"],
    },
  },

  // ==========================================
  // DASHBOARD WIDGET VARIANTS
  // ==========================================

  widget: {
    // ----- Small Widget (1x1) -----
    small: {
      purpose: "Weather, Health Score",
      gridArea: "1 / 1 / 2 / 2",
    },

    // ----- Medium Widget (2x1) -----
    medium: {
      purpose: "Alerts, Recommendations",
      gridArea: "1 / 1 / 2 / 3",
    },

    // ----- Large Widget (2x2) -----
    large: {
      purpose: "Analytics, Digital Twin",
      gridArea: "1 / 1 / 3 / 3",
    },
  },
}

/**
 * Component Variant Usage Guide
 * ==========================================
 * 
 * Buttons:
 * <button className="btn btn-[variant]-[size]">
 *   {variant: "primary" | "secondary" | "success" | "warning" | "danger" | "ghost"}
 *   size: "xs" | "sm" | "md" | "lg" | "xl"
 * }
 * 
 * Example: <button variant="primary" size="md">Save</button>
 *          <button variant="danger" size="lg">Delete</button>
 * 
 * Cards:
 * <Card variant="kpi">Dashboard metric</Card>
 * <Card variant="analytics">Chart card</Card>
 * <Card variant="telemetry">Device data card</Card>
 * <Card variant="digitalTwin">Twin panel</Card>
 * 
 * Tables:
 * <Table variant="standard">Users table</Table>
 * <Table variant="monitoring">Telemetry table</Table>
 * <Table variant="audit">Admin logs</Table>
 * 
 * Inputs:
 * <Input variant="standard" type="text" />
 * <Input variant="search" placeholder="Search..." />
 * <Input variant="telemetry" placeholder="Feed Rate" />
 * 
 * Badges:
 * <Badge variant="deviceStatus" value="online" />
 * <Badge variant="recommendation" value="active" />
 * <Badge variant="marketplace" value="published" />
 * 
 * Modals:
 * <Modal variant="confirmation">Delete confirmation</Modal>
 * <Modal variant="information">Device details</Modal>
 * <Modal variant="analytics">Charts deep dive</Modal>
 * 
 * Charts:
 * <Chart variant="telemetry">Temperature chart</Chart>
 * <Chart variant="forecast">Feed forecast</Chart>
 * <Chart variant="riskHeatmap">Risk zones</Chart>
 * 
 * Sidebar:
 * <Sidebar variant="expanded">Full sidebar</Sidebar>
 * <Sidebar variant="compact">Icon-only sidebar</Sidebar>
 * 
 * Widgets:
 * <Widget variant="small">1x1 widget</Widget>
 * <Widget variant="medium">2x1 widget</Widget>
 * <Widget variant="large">2x2 widget</Widget>
 */

export default componentVariants