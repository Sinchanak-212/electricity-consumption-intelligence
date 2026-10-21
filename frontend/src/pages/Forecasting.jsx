import React, { useState, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend
} from "recharts";
import { forecastSeries } from "../demo-data/consumptionTimeSeries";

const HORIZONS = ["6h", "12h", "24h", "48h", "7d"];

function fmt(ts) {
  return new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function ForecastTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border-muted)", borderRadius: 6, padding: "8px 12px", fontSize: 12 }}>
      <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>{fmt(label)}</div>
      {payload.map((p) => p.value != null && (
        <div key={p.dataKey} style={{ color: p.color || "var(--text-secondary)", display: "flex", justifyContent: "space-between", gap: 12 }}>
          <span>{p.name}</span><span style={{ fontWeight: 600 }}>{p.value} kW</span>
        </div>
      ))}
    </div>
  );
}

export default function Forecasting() {
  const [horizon, setHorizon] = useState("24h");
  const [reductionPct, setReductionPct] = useState(20);

  // Simulated peak after reduction
  const baselinePeak = 3.42;
  const reducedPeak = +(baselinePeak * (1 - (reductionPct / 100) * 0.65)).toFixed(2);
  const energySaved = +((baselinePeak - reducedPeak) * 1.5).toFixed(2);
  const belowThreshold = reducedPeak <= 3.20;

  const sliceCount = horizon === "6h" ? 12 : horizon === "12h" ? 24 : horizon === "24h" ? 48 : horizon === "48h" ? 96 : forecastSeries.length;
  const chartData = useMemo(() => forecastSeries.slice(0, sliceCount), [sliceCount]);

  const accuracy = { "6h": 98.1, "12h": 97.4, "24h": 96.4, "48h": 93.8, "7d": 88.2 };

  return (
    <div className="forecast-wrap">
      <div className="page-hero">
        <h1>Demand Forecasting &amp; Simulation</h1>
        <div className="page-hero-sub">Historical vs. predicted demand with peak-reduction scenario modelling. All data DEMO.</div>
      </div>

      {/* Accuracy banner */}
      <div className="demo-banner" style={{ marginBottom: 18 }}>
        <span className="demo-banner-icon">✓</span>
        <span>DEMO model — illustrative forecast accuracy shown for educational purposes only. Not validated on real data.</span>
        <span className="demo-banner-tag">DEMO</span>
      </div>

      {/* Horizon selector */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>Forecast horizon</div>
          <div className="horizon-tabs">
            {HORIZONS.map((h) => (
              <button key={h} className={`horizon-tab ${horizon === h ? "active" : ""}`} onClick={() => setHorizon(h)}>{h}</button>
            ))}
          </div>
        </div>
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "10px 16px", textAlign: "center" }}>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: 2 }}>Model accuracy ({horizon})</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--accent-green)" }}>{accuracy[horizon]}%</div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>backtested · DEMO</div>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Historical vs. Forecast demand</div>
            <div className="card-subtitle">Horizon: {horizon} · North district 1 · DEMO</div>
          </div>
          <div style={{ display: "flex", gap: 14, fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-cyan)" }} />Historical
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-green)" }} />Predicted
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(104,211,145,0.4)" }} />95% band
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 8, right: 18, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gHist" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gPred" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-green)" stopOpacity={0.18} />
                <stop offset="95%" stopColor="var(--accent-green)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
            <XAxis dataKey="timestamp" tickFormatter={fmt} tick={{ fontSize: 10, fill: "var(--text-disabled)" }} interval={Math.max(1, Math.floor(chartData.length / 10))} />
            <YAxis tick={{ fontSize: 10, fill: "var(--text-disabled)" }} width={36} domain={[0, 5]} />
            <Tooltip content={<ForecastTooltip />} />
            <ReferenceLine y={3.20} stroke="var(--accent-red)" strokeDasharray="5 3" strokeWidth={1} />
            <Area type="monotone" dataKey="upper" stroke="transparent" fill="rgba(104,211,145,0.08)" name="Upper bound" />
            <Area type="monotone" dataKey="lower" stroke="transparent" fill="var(--bg-app)" name="Lower bound" />
            <Area type="monotone" dataKey="predicted" stroke="var(--accent-green)" strokeWidth={1.5} strokeDasharray="5 3" fill="url(#gPred)" name="Predicted" dot={false} />
            <Area type="monotone" dataKey="historical" stroke="var(--accent-cyan)" strokeWidth={2} fill="url(#gHist)" name="Historical" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
        <div style={{ padding: "6px 18px 12px", fontSize: "var(--text-xs)", color: "var(--text-disabled)" }}>
          Red dashed line = 3.20 kW peak threshold. Forecast uses a DEMO ML model — not validated on the real UCI dataset.
        </div>
      </div>

      {/* Simulation Panel */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Peak-reduction simulation</div>
            <div className="card-subtitle">Adjust flexible load to model a lower peak · DEMO</div>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)", marginBottom: 6, color: "var(--text-secondary)" }}>
                <span>Flexible load reduction</span>
                <span style={{ fontWeight: 700, color: "var(--accent-cyan)" }}>{reductionPct}%</span>
              </div>
              <input type="range" min={0} max={50} step={5} value={reductionPct} onChange={(e) => setReductionPct(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent-cyan)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "var(--text-disabled)", marginTop: 4 }}>
                <span>0% (no shift)</span><span>50% (max shift)</span>
              </div>
            </div>
            <div className="simulation-result">
              <div className="sim-result-row">
                <span className="sim-result-label">Baseline peak</span>
                <span className="sim-result-val amber">{baselinePeak} kW</span>
              </div>
              <div className="sim-result-row">
                <span className="sim-result-label">Simulated peak</span>
                <span className={`sim-result-val ${belowThreshold ? "green" : "amber"}`}>{reducedPeak} kW</span>
              </div>
              <div className="sim-result-row">
                <span className="sim-result-label">Energy saved (est.)</span>
                <span className="sim-result-val green">{energySaved} kWh</span>
              </div>
              <div className="sim-result-row">
                <span className="sim-result-label">Below threshold?</span>
                <span className={`sim-result-val ${belowThreshold ? "green" : "amber"}`}>{belowThreshold ? "✓ Yes" : "✗ No"}</span>
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: "var(--text-xs)", color: "var(--text-disabled)", lineHeight: 1.6 }}>
              Simulation assumes linear flexible load response. DEMO only — not connected to real load management infrastructure.
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Forecast confidence by horizon</div>
            <div className="card-subtitle">Illustrative model performance · DEMO</div>
          </div>
          <div className="card-body">
            {HORIZONS.map((h) => (
              <div key={h} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: 4 }}>
                  <span>{h} horizon</span>
                  <span style={{ color: accuracy[h] >= 96 ? "var(--accent-green)" : accuracy[h] >= 93 ? "var(--accent-amber)" : "var(--accent-red)", fontWeight: 600 }}>{accuracy[h]}%</span>
                </div>
                <div style={{ height: 4, background: "var(--bg-raised)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 2,
                    width: `${accuracy[h]}%`,
                    background: accuracy[h] >= 96 ? "var(--accent-green)" : accuracy[h] >= 93 ? "var(--accent-amber)" : "var(--accent-red)"
                  }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 14, padding: "10px 12px", background: "var(--bg-raised)", borderRadius: "var(--radius-sm)", fontSize: "var(--text-xs)", color: "var(--text-disabled)", lineHeight: 1.6 }}>
              ⚠ Accuracy values are DEMO placeholders. The model has not been validated against the UCI household power dataset or any real grid data.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
