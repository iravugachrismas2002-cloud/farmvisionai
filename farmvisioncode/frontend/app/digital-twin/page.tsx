"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SensorDataPoint = {
  id: string;
  deviceId: string;
  timestamp: string;
  temperatureC?: number;
  humidityPercent?: number;
  feedLevelPercent?: number;
  waterLevelPercent?: number;
  feedWeightGrams?: number;
  messageId: string;
  source: "HARDWARE" | "SIMULATOR";
};

type DigitalBaseline = {
  id: string;
  farmId: string;
  parameter: "TEMPERATURE" | "HUMIDITY" | "FEED_CONSUMPTION" | "WATER_CONSUMPTION";
  baselineValue: number;
  upperThreshold: number;
  lowerThreshold: number;
  createdAt: string;
  updatedAt: string;
};

type PredictionAlert = {
  id: string;
  deviceId: string;
  type: "FEED_DEPLETION" | "WATER_DEPLETION" | "TEMPERATURE_EXTREME" | "HUMIDITY_ISSUE";
  severity: "INFO" | "WARNING" | "CRITICAL";
  predictedAt: string;
  message: string;
  confidence: number;
};

type CrossFarmComparison = {
  farmId: string;
  farmName: string;
  parameter: "TEMPERATURE" | "HUMIDITY" | "FEED" | "WATER";
  currentValue: number;
  farmAverage: number;
  topFarm: string;
  topValue: number;
  percentile: number;
};

export default function DigitalTwinPage() {
  const [sensorData, setSensorData] = useState<SensorDataPoint[]>([]);
  const [baselines, setBaselines] = useState<DigitalBaseline[]>([]);
  const [predictions, setPredictions] = useState<PredictionAlert[]>([]);
  const [crossFarmData, setCrossFarmData] = useState<CrossFarmComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mqttConnected, setMqttConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [
          sensorsRes,
          baselinesRes,
          predictionsRes,
          crossFarmRes,
        ] = await Promise.all([
          fetch("/api/sensor-data", { credentials: "include" }),
          fetch("/api/baselines", { credentials: "include" }),
          fetch("/api/predictions", { credentials: "include" }),
          fetch("/api/cross-farm", { credentials: "include" }),
        ]);

        if (!sensorsRes.ok && cancelled === false) {
          if (sensorsRes.status === 401) {
            window.location.href = "/login";
            return;
          }
          throw new Error("Failed to load sensor data");
        }

        if (!baselinesRes.ok && cancelled === false) {
          if (baselinesRes.status === 401) {
            window.location.href = "/login";
            return;
          }
          throw new Error("Failed to load baselines");
        }

        if (!predictionsRes.ok && cancelled === false) {
          if (predictionsRes.status === 401) {
            window.location.href = "/login";
            return;
          }
          throw new Error("Failed to load predictions");
        }

        if (!crossFarmRes.ok && cancelled === false) {
          if (crossFarmRes.status === 401) {
            window.location.href = "/login";
            return;
          }
          throw new Error("Failed to load cross-farm data");
        }

        if (cancelled) return;

        const sensorsData = await sensorsRes.json();
        const baselinesData = await baselinesRes.json();
        const predictionsData = await predictionsRes.json();
        const crossFarmData = await crossFarmRes.json();

        if (cancelled) return;

        setSensorData(sensorsData.sensorData ?? []);
        setBaselines(baselinesData.baselines ?? []);
        setPredictions(predictionsData.predictions ?? []);
        setCrossFarmData(crossFarmData.comparisons ?? []);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError((err as Error).message);
        setLoading(false);
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <p className="eyebrow">DIGITAL TWIN 2.0</p>
          <h1>Digital Twin</h1>
          <p>Loading digital twin data...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <p className="auth-message auth-message-error" role="alert">
            {error}
          </p>
          <Link href="/login" className="primary-button">Back to Login</Link>
        </div>
      </main>
    );
  }

  // MQTT Status indicator
  const mqttStatus = (
    <div className="mqtt-status-badge">
      {mqttConnected ? "MQTT Connected" : "MQTT Disconnected"}
    </div>
  );

  return (
    <main className="auth-page">
      <nav className="site-nav" aria-label="Main navigation">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>FarmVision<span className="brand-ai"> AI</span></span>
        </Link>
        <div className="nav-actions">
          <Link className="primary-button" href="/">
            <span className="brand-mark" aria-hidden="true">F</span>
            <span>FarmVision AI</span>
          </Link>
          <Link className="nav-login" href="/api/auth/logout">Sign out</Link>
        </div>
      </nav>

      <section className="dashboard-page">
        <div className="dashboard-header">
          <h1>Digital Twin 2.0</h1>
          <p className="eyebrow">Farm Simulation & Predictive Analytics</p>
        </div>

        <div className="summary-section">
          <div className="summary-grid">
            <div className="summary-card">
              <strong>{sensorData.length}</strong>
              <p>Active Sensors</p>
            </div>
            <div className="summary-card">
              <strong>{baselines.length}</strong>
              <p>Baselines Active</p>
            </div>
            <div className="summary-card">
              <strong>{predictions.length}</strong>
              <p>Predictive Alerts</p>
            </div>
            <div className="summary-card">
              <strong>{crossFarmData.length}</strong>
              <p>Cross-Farm Comparisons</p>
            </div>
          </div>

          <div className="mqtt-connection-section">
            <h3>MQTT Connection</h3>
            {mqttStatus}
            <button
              className="primary-button-small"
              onClick={() => window.location.href = "/mqtt/connect"}
            >
              Connect/Disconnect
            </button>
          </div>
        </div>

        {/* Real-time Sensor Feed */}
        <div className="sensor-feed-section">
          <h3>Real-time Sensor Feed</h3>
          {sensorData.length === 0 ? (
            <p>No real-time sensor data. MQTT connection may be pending.</p>
          ) : (
            <div className="sensor-grid">
              {sensorData.map((reading) => (
                <div key={reading.id} className="sensor-card">
                  <div className="sensor-device">
                    <strong>{reading.deviceId}</strong>
                    <span className="sensor-source">
                      {reading.source}
                    </span>
                  </div>
                  <div className="sensor-values">
                    {reading.temperatureC !== undefined && (
                      <div>
                        <span>Temp: {reading.temperatureC.toFixed(1)}°C</span>
                      </div>
                    )}
                    {reading.humidityPercent !== undefined && (
                      <div>
                        <span>Humidity: {reading.humidityPercent.toFixed(1)}%</span>
                      </div>
                    )}
                    {reading.feedLevelPercent !== undefined && (
                      <div>
                        <span>Feed: {reading.feedLevelPercent.toFixed(1)}%</span>
                      </div>
                    )}
                    {reading.waterLevelPercent !== undefined && (
                      <div>
                        <span>Water: {reading.waterLevelPercent.toFixed(1)}%</span>
                      </div>
                    )}
                    {reading.feedWeightGrams !== undefined && (
                      <div>
                        <span>Weight: {reading.feedWeightGrams}g</span>
                      </div>
                    )}
                  </div>
                  <span className="sensor-timestamp">
                    {new Date(reading.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Baseline Predictions Section */}
        <div className="predictions-section">
          <h3>Predictive Alerts</h3>
          {predictions.length === 0 ? (
            <p>No predictive alerts at this time. All systems within normal parameters.</p>
          ) : (
            <div className="predictions-list">
              {predictions.map((prediction) => (
                <div key={prediction.id} className="prediction-card">
                  <div className="prediction-header">
                    <strong>{prediction.type}</strong>
                    <span className="prediction-severity">
                      {prediction.severity}
                    </span>
                  </div>
                  <p className="prediction-message">
                    {prediction.message}
                  </p>
                  <div className="prediction-confidence">
                    Confidence: {prediction.confidence.toFixed(0)}%
                  </div>
                  <span className="prediction-predicted-at">
                    Predicted: {new Date(prediction.predictedAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cross-Farm Analytics Section */}
        <div className="cross-farm-analytics-section">
          <h3>Cross-Farm Analytics</h3>
          {crossFarmData.length === 0 ? (
            <p>No cross-farm comparison data available.</p>
          ) : (
            <div className="analytics-grid">
              {crossFarmData.map((comparison) => (
                <div key={comparison.farmId} className="comparison-card">
                  <div className="comparison-farm">
                    <strong>{comparison.farmName}</strong>
                  </div>
                  <div className="comparison-parameter">
                    {comparison.parameter}
                  </div>
                  <div className="comparison-values">
                    <span>Current: {comparison.currentValue}</span>
                    <span>Average: {comparison.farmAverage}</span>
                  </div>
                  <div className="comparison-performance">
                    {comparison.percentile}% above avg
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="action-cards-section">
          <h3>Quick Actions</h3>
          <div className="action-cards-grid">
            <div className="action-card">
              <Link href="/mqtt/settings" className="action-card-link">
                <span className="action-card-icon">📡</span>
                <span>MQTT Settings</span>
              </Link>
            </div>
            <div className="action-card">
              <Link href="/digital-twin/baselines" className="action-card-link">
                <span className="action-card-icon">📊</span>
                <span>Manage Baselines</span>
              </Link>
            </div>
            <div className="action-card">
              <Link href="/predictions/active" className="action-card-link">
                <span className="action-card-icon">🔮</span>
                <span>View Predictions</span>
              </Link>
            </div>
            <div className="action-card">
              <Link href="/cross-farm/compare" className="action-card-link">
                <span className="action-card-icon">🌾</span>
                <span>Cross-Farm Compare</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}