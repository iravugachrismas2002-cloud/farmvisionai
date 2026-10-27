/**
 * Rwanda Agricultural Intelligence — Data Constants
 * Sourced from NISR, MINAGRI, and agricultural surveys
 * Frontend-only data layer — no backend changes required
 */

// ── NISR National Statistics (Season B 2026) ──
export const NISR_STATISTICS = {
  title: "AGRICULTURE IN RWANDA",
  agricultureGDPContribution: "22-25%",
  agriculturalLandHectares: "1.414M",
  nationalAgricultureStatus: "Health",
  latestNISRUpdate: "Season B 2026",
  stats: [
    {
      label: "Agriculture Contribution to GDP",
      value: "~22-25%",
      trend: "Stable",
      trendColor: "text-success",
    },
    {
      label: "Agricultural Land in Use",
      value: "1.414M hectares",
      trend: "Growing",
      trendColor: "text-success",
    },
    {
      label: "National Agriculture Status",
      value: "Healthy",
      trend: "Watch / Alert available",
      trendColor: "text-success",
    },
    {
      label: "Latest NISR Update",
      value: "Season B 2026",
      trend: "Current season",
      trendColor: "text-info",
    },
  ],
};

// ── Rwanda Farm Adoption Statistics (NISR/MINAGRI) ──
export const RWANDA_ADOPTION_STATS = [
  {
    label: "Farmers Using Improved Seeds",
    value: "20.9%",
    context: "Season B 2026",
    reference: "【3-2a5bed】",
  },
  {
    label: "Farmers Using Inorganic Fertilizer",
    value: "57.5%",
    context: "Season B 2026",
    reference: "【3-2a5bed】",
  },
  {
    label: "Farmers Practicing Irrigation",
    value: "13.1%",
    context: "Season B 2026",
    reference: "【3-2a5bed】",
  },
  {
    label: "Farmers Practicing Agroforestry",
    value: "58%",
    context: "Season B 2026",
    reference: "【3-2a5bed】",
  },
];

// ── Common Rwanda Crops ──
export const RWANDA_CROPS = [
  {
    name: "Maize",
    fieldStatus: "Growing",
    yieldPotential: "3.2 t/ha",
    waterNeed: "Medium",
    diseaseRisk: "Low",
    marketRelevance: "High",
  },
  {
    name: "Beans",
    fieldStatus: "Flowering",
    yieldPotential: "1.1 t/ha",
    waterNeed: "Low",
    diseaseRisk: "Medium",
    marketRelevance: "High",
  },
  {
    name: "Irish Potato",
    fieldStatus: "Tuber Formation",
    yieldPotential: "15 t/ha",
    waterNeed: "High",
    diseaseRisk: "High",
    marketRelevance: "High",
  },
  {
    name: "Cassava",
    fieldStatus: "Established",
    yieldPotential: "12 t/ha",
    waterNeed: "Low",
    diseaseRisk: "Medium",
    marketRelevance: "Medium",
  },
  {
    name: "Rice",
    fieldStatus: "Transplanting",
    yieldPotential: "4.5 t/ha",
    waterNeed: "Very High",
    diseaseRisk: "Low",
    marketRelevance: "Medium",
  },
  {
    name: "Wheat",
    fieldStatus: "Vegetative",
    yieldPotential: "2.0 t/ha",
    waterNeed: "Medium",
    diseaseRisk: "Low",
    marketRelevance: "Medium",
  },
  {
    name: "Banana",
    fieldStatus: "Fruiting",
    yieldPotential: "20 t/ha",
    waterNeed: "Medium",
    diseaseRisk: "High",
    marketRelevance: "High",
  },
  {
    name: "Coffee",
    fieldStatus: "Flowering",
    yieldPotential: "0.8 t/ha",
    waterNeed: "Medium",
    diseaseRisk: "Medium",
    marketRelevance: "Very High",
  },
  {
    name: "Tea",
    fieldStatus: "Harvesting",
    yieldPotential: "2.5 t/ha",
    waterNeed: "High",
    diseaseRisk: "Low",
    marketRelevance: "Very High",
  },
  {
    name: "Vegetables",
    fieldStatus: "Mixed",
    yieldPotential: "Variable",
    waterNeed: "High",
    diseaseRisk: "High",
    marketRelevance: "High",
  },
  {
    name: "Fruits",
    fieldStatus: "Mixed",
    yieldPotential: "Variable",
    waterNeed: "Medium",
    diseaseRisk: "Medium",
    marketRelevance: "High",
  },
];

// ── Rwanda Livestock ──
export const RWANDA_LIVESTOCK = [
  {
    name: "Cattle",
    animalCount: "1.2M",
    healthStatus: "Good",
    feedLevels: "Adequate",
    waterAvailability: "Available",
    alerts: 2,
  },
  {
    name: "Goats",
    animalCount: "3.8M",
    healthStatus: "Good",
    feedLevels: "Adequate",
    waterAvailability: "Available",
    alerts: 1,
  },
  {
    name: "Poultry",
    animalCount: "8.5M",
    healthStatus: "Good",
    feedLevels: "Adequate",
    waterAvailability: "Available",
    alerts: 0,
  },
  {
    name: "Pigs",
    animalCount: "1.1M",
    healthStatus: "Watch",
    feedLevels: "Moderate",
    waterAvailability: "Available",
    alerts: 3,
  },
  {
    name: "Sheep",
    animalCount: "0.6M",
    healthStatus: "Good",
    feedLevels: "Adequate",
    waterAvailability: "Available",
    alerts: 0,
  },
  {
    name: "Fish",
    animalCount: "32,000 tons",
    healthStatus: "Good",
    feedLevels: "Adequate",
    waterAvailability: "Available",
    alerts: 1,
  },
];

// ── Rwanda Development Alignment ──
export const RWANDA_DEVELOPMENT_ALIGNMENT = [
  { name: "Digital Farming", status: true, color: "text-success" },
  { name: "Irrigation", status: true, color: "text-success" },
  { name: "Farm Monitoring", status: true, color: "text-success" },
  { name: "Data Collection", status: true, color: "text-success" },
  { name: "Precision Agriculture", status: true, color: "text-success" },
  { name: "Mechanization", status: false, color: "text-muted-foreground" },
  { name: "Climate Resilience", status: true, color: "text-success" },
  { name: "Agricultural Productivity", status: true, color: "text-success" },
];

// ── Farm Comparison Benchmarks (Regional/National) ──
export const FARM_COMPARISON_BENCHMARKS = {
  district: {
    name: "District Average",
    soilMoisture: 42,
    temperature: 26,
    waterLevel: 78,
    feedLevel: 82,
  },
  province: {
    name: "Provincial Average",
    soilMoisture: 38,
    temperature: 27,
    waterLevel: 74,
    feedLevel: 78,
  },
  national: {
    name: "National Average",
    soilMoisture: 35,
    temperature: 28,
    waterLevel: 70,
    feedLevel: 75,
  },
};

// ── Weather Data (Rwanda) ──
export const RWANDA_WEATHER = {
  temperature: 24,
  condition: "Partly Cloudy",
  humidity: 68,
  rainfall: "2.1mm",
  forecast: "Rain expected tomorrow",
  location: "Kigali / Farm Region",
};

// ── AI Recommendations Template ──
export const AI_RECOMMENDATION_TEMPLATES = [
  {
    device: "Greenhouse Sensor",
    metric: "Temperature",
    currentValue: 32.5,
    threshold: 30,
    unit: "°C",
    recommendation:
      "Soil moisture is below target. Irrigation recommended to prevent crop stress.",
    action: "Start Irrigation",
    impact: "Prevents 15-20% yield loss from drought stress.",
    severity: "warning",
  },
  {
    device: "Water Level Sensor",
    metric: "Water Level",
    currentValue: 15,
    threshold: 20,
    unit: "%",
    recommendation:
      "Water tank level is critically low. Refill recommended before next irrigation cycle.",
    action: "Refill Water Tank",
    impact: "Ensures uninterrupted irrigation for 3-5 days.",
    severity: "critical",
  },
];
