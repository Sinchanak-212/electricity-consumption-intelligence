import React, { useState } from "react";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend
} from "recharts";
import { kpis, signalsData } from "../demo-data/kpis";
import { consumptionSeries, profileSparklines } from "../demo-data/consumptionTimeSeries";

/* ── helpers ─────────────────────────────────────────────── */
function fmt(ts) {
  return new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

/* ── Mini Sparkline ───────────────────────────────────────── */
function Sparkline({ data, color = "var(--accent-cyan)", width = 80, height = 32 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Custom Tooltip ───────────────────────────────────────── */
function DemandTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border-muted)", borderRadius: 6, padding: "8px 12px", fontSize: 12 }}>
      <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>{fmt(label)}</div>
      {payload.map((p) => p.value != null && (
        <div key={p.dataKey} style={{ color: p.color, display: "flex", justifyContent: "space-between", gap: 12 }}>
          <span>{p.name}</span><span style={{ fontWeight: 600 }}>{p.value} kW</span>
        </div>
      ))}
    </div>
  );
}

/* ── Overview Page ────────────────────────────────────────── */
export default function Overview() {
  const [period, setPeriod] = useState("24h");
  const [dataset, setDataset] = useState("north-1");
  const [aggregation, setAggregation] = useState("30min");
  const [timeRange, setTimeRange] = useState("27 Oct 2026");
  const peakForecastPct = 78;

  return (
    <div className="overview-wrap">
      {/* Hero */}
      <div className="page-hero">
        <h1>Energy, in perspective.</h1>
        <div className="page-hero-sub">Understand demand. Anticipate peaks. Act with confidence.</div>
      </div>

      {/* Export Button row */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <button className="btn-primary">↑ Export report</button>
      </div>

      {/* Demo Banner */}
      <div className="demo-banner">
        <span className="demo-banner-icon">✓</span>
        <span>
          <strong>SAMPLE DATA / North district smart meter data.</strong> All readings, forecasts and insights are illustrative.{" "}
          <span style={{ color: "var(--text-muted)" }}>Not operational evidence.</span>
        </span>
        <span className="demo-banner-tag">Demo</span>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <span className="filter-label">Dataset</span>
        <select className="filter-select" value={dataset} onChange={(e) => setDataset(e.target.value)}>
          <option value="north-1">North district 1 · 12,400 meters</option>
          <option value="north-2">North district 2 · 8,200 meters</option>
        </select>
        <span className="filter-label" style={{ marginLeft: 8 }}>Time range UTC</span>
        <select className="filter-select" value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
          <option value="27 Oct 2026">27 Oct 2026</option>
          <option value="26 Oct 2026">26 Oct 2026</option>
          <option value="25 Oct 2026">25 Oct 2026</option>
        </select>
        <span className="filter-label" style={{ marginLeft: 8 }}>Aggregation</span>
        <select className="filter-select" value={aggregation} onChange={(e) => setAggregation(e.target.value)}>
          <option value="15min">15 minutes</option>
          <option value="30min">30 minutes</option>
          <option value="1h">1 hour</option>
        </select>
        <div className="filter-refresh">
          <div className="filter-refresh-dot" />
          <span>Replay synced at 14:00 UTC</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpis.map((k) => (
          <div className="kpi-card" key={k.id} style={{ "--kpi-accent": k.accentColor }} title={k.description}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">
              {k.value}<span className="unit">{k.unit}</span>
            </div>
            <div className={`kpi-delta ${k.deltaDir}`}>
              {k.deltaDir === "up" && "▲"}
              {k.deltaDir === "down" && "▼"}
              <span>{k.delta}</span>
              <span className="kpi-delta-text">{k.deltaText}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="charts-row">
        {/* Demand Outlook Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Demand outlook</div>
              <div className="card-subtitle">Actual demand and the next 18 hours · 27 Oct 2026</div>
            </div>
            <div className="period-toggle">
              {["24h", "48h", "7d"].map((p) => (
                <button key={p} className={`period-btn ${period === p ? "active" : ""}`} onClick={() => setPeriod(p)}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-dot" style={{ background: "var(--chart-actual)" }} />
              <span>Actual</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ background: "var(--chart-forecast)" }} />
              <span>Forecast</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ background: "rgba(104,211,145,0.5)" }} />
              <span>95% interval</span>
            </div>
            <div className="legend-item" style={{ marginLeft: "auto" }}>
              <div className="legend-dash" style={{ borderColor: "var(--accent-red)" }} />
              <span style={{ color: "var(--accent-red)" }}>Peak threshold</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={consumptionSeries} margin={{ top: 4, right: 18, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-actual)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--chart-actual)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-forecast)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--chart-forecast)" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="timestamp" tickFormatter={fmt} tick={{ fontSize: 10, fill: "var(--text-disabled)" }} interval={7} />
              <YAxis tick={{ fontSize: 10, fill: "var(--text-disabled)" }} width={36} domain={[0, 4.5]} />
              <Tooltip content={<DemandTooltip />} />
              <ReferenceLine y={3.20} stroke="var(--accent-red)" strokeDasharray="5 3" strokeWidth={1} label={{ value: "Threshold", fill: "var(--accent-red)", fontSize: 10, position: "insideTopRight" }} />
              <Area type="monotone" dataKey="bandHigh" stroke="transparent" fill="url(#gradBand)" name="95% upper" />
              <Area type="monotone" dataKey="bandLow" stroke="transparent" fill="var(--bg-app)" name="95% lower" />
              <Area type="monotone" dataKey="forecast" stroke="var(--chart-forecast)" strokeWidth={1.5} strokeDasharray="5 3" fill="transparent" name="Forecast" dot={false} />
              <Area type="monotone" dataKey="value" stroke="var(--chart-actual)" strokeWidth={2} fill="url(#gradActual)" name="Actual" dot={false} connectNulls={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ padding: "6px 18px 12px", fontSize: "var(--text-xs)", color: "var(--text-disabled)" }}>
            ⚡ Spark ML forecast · 80% prediction interval · Always averages · All times UTC
          </div>
        </div>

        {/* Peak Intelligence Mini Panel */}
        <div className="peak-intel-panel">
          <div className="peak-intel-header">
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
              PEAK INTELLIGENCE
            </div>
            <span className="peak-badge elevated">Elevated</span>
          </div>
          <div className="peak-value-big">
            <div>
              <span className="peak-value-num">3.42</span>
              <span className="peak-value-unit">kW</span>
            </div>
            <div className="peak-value-sub">0.2% above the 3.20 kW threshold</div>
          </div>
          <div className="peak-forecast-bar">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div className="peak-forecast-label">Forecast exposure</div>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--accent-amber)", fontWeight: 600 }}>78% likely</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${peakForecastPct}%` }} />
            </div>
          </div>
          <div className="peak-recommendation">
            <div className="peak-rec-title">Shift load before the evening peak.</div>
            <div className="peak-rec-text">
              Commercial HVAC accounts for 35% of to-flexible load. Shifting 30% of to-flexible load by 1 hr (from 17:30 to 18:30) may reduce the peak below threshold.
            </div>
          </div>
          <div className="peak-cta">
            <button className="btn-peak-cta">▸ Explore reduction scenarios</button>
          </div>
        </div>
      </div>

      {/* Second Row: Consumption Profiles + Delta */}
      <div className="second-row">
        {/* Consumption Profiles */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Consumption profiles</div>
              <div className="card-subtitle">Three detected daily rhythms · 12,400 meters</div>
            </div>
            <a href="#" className="section-link" style={{ fontSize: "var(--text-xs)" }}>View profiles ↗</a>
          </div>
          <div className="card-body">
            {[
              { name: "Daytime active", desc: "5,806 meters · 36.6 kWh avg", value: 636, color: "var(--accent-cyan)", spark: profileSparklines.daytime },
              { name: "Evening peakers", desc: "2,004 meters · 31.6 kWh avg", value: 208, color: "var(--accent-purple)", spark: profileSparklines.evening },
              { name: "Steady baseload", desc: "4,590 meters · 24.6 kWh avg", value: 200, color: "var(--accent-green)", spark: profileSparklines.baseload },
            ].map((p) => (
              <div key={p.name} className="profile-item">
                <Sparkline data={p.spark} color={p.color} />
                <div className="profile-info">
                  <div className="profile-name">{p.name}</div>
                  <div className="profile-count">{p.desc}</div>
                </div>
                <div className="profile-value">{p.value}</div>
              </div>
            ))}
            <div style={{ paddingTop: 10, fontSize: "var(--text-xs)", color: "var(--text-disabled)" }}>
              ▲ Evening peakers drive 78% of the predicted peak load
            </div>
          </div>
        </div>

        {/* A smaller peak, smarter shift */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">A smaller peak. A smarter shift.</div>
              <div className="card-subtitle">Scenario — commercial cooling load (kW)</div>
            </div>
            <a href="#" className="section-link" style={{ fontSize: "var(--text-xs)" }}>Simulation ↗</a>
          </div>
          <div className="card-body">
            <div className="delta-big negative">
              <div className="delta-big-num">−12.9%</div>
              <div className="delta-big-label">peak demand</div>
            </div>
            {[
              { label: "Original peak", val: 3.42, max: 3.42, color: "var(--accent-red)" },
              { label: "Flex load shed", val: 2.11, max: 3.42, color: "var(--accent-amber)" },
              { label: "New peak limit", val: 2.98, max: 3.42, color: "var(--accent-green)" },
            ].map((row) => (
              <div key={row.label} className="delta-bar-row">
                <div className="delta-bar-label">{row.label}</div>
                <div className="delta-bar-track">
                  <div className="delta-bar-fill" style={{ width: `${(row.val / row.max) * 100}%`, background: row.color }} />
                </div>
                <div className="delta-bar-val">{row.val} kW</div>
              </div>
            ))}
            <div style={{ marginTop: 10, fontSize: "var(--text-xs)", color: "var(--text-disabled)" }}>
              Shifting 30% of flexible cooling load from 17:30–19:30. Projected peak base at threshold.
            </div>
            <div style={{ marginTop: 8 }}>
              <a href="#" style={{ fontSize: "var(--text-xs)", color: "var(--accent-cyan)" }}>Add real meter ↗</a>
            </div>
          </div>
        </div>
      </div>

      {/* Signals Table */}
      <div className="signals-section">
        <div className="section-header">
          <div>
            <div className="section-title">Signals worth a closer look</div>
            <div className="section-subtitle">3 open anomalies · 3 high priority · Today, UTC</div>
          </div>
          <a href="#" className="section-link">All anomalies</a>
        </div>
        <div className="signals-table-wrap">
          <table className="signals-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Smart Meter / Signal</th>
                <th>Severity</th>
                <th>Observed</th>
                <th>Expected</th>
                <th>Deviation</th>
                <th>Duration</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {signalsData.map((s) => (
                <tr key={s.id}>
                  <td className="signal-time">{s.time}</td>
                  <td>
                    <div className="signal-cluster">{s.smartMeter}</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{s.location}</div>
                  </td>
                  <td><span className={`severity-badge ${s.severity}`}>{s.severity.charAt(0).toUpperCase() + s.severity.slice(1)}</span></td>
                  <td className="signal-val-observed">{s.observed}</td>
                  <td className="signal-val-expected">{s.expected}</td>
                  <td className={`signal-deviation ${s.devDir}`}>{s.deviation}</td>
                  <td>{s.duration}</td>
                  <td><span style={{ fontSize: 16, cursor: "pointer", color: "var(--text-muted)" }}>›</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: "10px 14px", fontSize: "var(--text-xs)", color: "var(--text-disabled)", borderTop: "1px solid var(--border-subtle)" }}>
            ⚡ Spark ML forecast · 80% prediction · 3 sample readings for illustration
          </div>
        </div>
      </div>

      {/* Data Pipeline Section */}
      <div className="pipeline-section">
        <div className="section-header">
          <div>
            <div className="section-title">From raw readings to ready insights</div>
            <div className="section-subtitle">Hadoop · latest batch: 27 Oct at 14:00 UTC</div>
          </div>
          <div className="pipeline-status-chip">All systems healthy</div>
        </div>
        <div className="card">
          <div className="pipeline-flow">
            {[
              { icon: "🗄️", cls: "green", title: "HDFS", sub: "Distributed storage", stat: "35.9M readings", extra: "Ingestion 5b" },
              { arrow: true },
              { icon: "⚙️", cls: "blue", title: "MapReduce", sub: "89 tasks", stat: "128 / 128 tasks", extra: "98% utilised · 3s", planned: false },
              { arrow: true },
              { icon: "⚡", cls: "purple", title: "Apache Spark", sub: "Processing engine", stat: "8 / 8 executors", extra: "Ready 16s Day", planned: true },
              { arrow: true },
              { icon: "🔍", cls: "amber", title: "Spark SQL", sub: "Query interface", stat: "1.2s query p95", extra: "Reads 15s (3 cores) qty", planned: true },
            ].map((step, i) =>
              step.arrow ? (
                <div key={i} className="pipeline-arrow">→</div>
              ) : (
                <div key={i} className="pipeline-node">
                  <div className={`pipeline-icon ${step.cls}`}>{step.icon}</div>
                  <div className="pipeline-node-title">{step.title}</div>
                  <div className="pipeline-node-sub">{step.sub}</div>
                  <div className="pipeline-node-stat">{step.stat}</div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", textAlign: "center", marginTop: 2 }}>{step.extra}</div>
                  {step.planned && <div className="pipeline-node-planned">PLANNED</div>}
                </div>
              )
            )}
          </div>
          <div className="pipeline-note">
            ⚡ Privacy note: No daily per-user data included. No linked data. Reports are summary-only. Pipeline status is simulated.
          </div>
        </div>
      </div>
    </div>
  );
}
