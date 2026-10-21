import React, { useState } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell
} from "recharts";
import { profileSparklines } from "../demo-data/consumptionTimeSeries";

const profiles = [
  {
    id: "daytime",
    name: "Daytime active",
    color: "var(--accent-cyan)",
    meters: 5806,
    avgKwh: 36.6,
    peakHour: "13:30",
    peakKw: 2.8,
    flexPct: 18,
    description: "Commercial and mixed-use consumers with a strong midday peak. High HVAC load.",
    stats: [
      { key: "Meter count", val: "5,806" },
      { key: "Avg daily (kWh)", val: "36.6" },
      { key: "Typical peak time", val: "13:30" },
      { key: "Flex potential", val: "18%" },
    ],
    radarData: [
      { subject: "Morning", A: 70 }, { subject: "Midday", A: 95 }, { subject: "Afternoon", A: 88 },
      { subject: "Evening", A: 55 }, { subject: "Night", A: 20 }, { subject: "Weekend", A: 40 },
    ],
  },
  {
    id: "evening",
    name: "Evening peakers",
    color: "var(--accent-purple)",
    meters: 2004,
    avgKwh: 31.6,
    peakHour: "19:00",
    peakKw: 3.9,
    flexPct: 12,
    description: "Residential consumers driving the evening demand surge. Key peak-risk cluster.",
    stats: [
      { key: "Meter count", val: "2,004" },
      { key: "Avg daily (kWh)", val: "31.6" },
      { key: "Typical peak time", val: "19:00" },
      { key: "Flex potential", val: "12%" },
    ],
    radarData: [
      { subject: "Morning", A: 30 }, { subject: "Midday", A: 45 }, { subject: "Afternoon", A: 60 },
      { subject: "Evening", A: 95 }, { subject: "Night", A: 65 }, { subject: "Weekend", A: 80 },
    ],
  },
  {
    id: "baseload",
    name: "Steady baseload",
    color: "var(--accent-green)",
    meters: 4590,
    avgKwh: 24.6,
    peakHour: "—",
    peakKw: 1.3,
    flexPct: 6,
    description: "Industrial and always-on infrastructure with flat, predictable consumption.",
    stats: [
      { key: "Meter count", val: "4,590" },
      { key: "Avg daily (kWh)", val: "24.6" },
      { key: "Typical peak time", val: "Flat" },
      { key: "Flex potential", val: "6%" },
    ],
    radarData: [
      { subject: "Morning", A: 75 }, { subject: "Midday", A: 78 }, { subject: "Afternoon", A: 74 },
      { subject: "Evening", A: 72 }, { subject: "Night", A: 70 }, { subject: "Weekend", A: 68 },
    ],
  },
];

const anomalyData = [
  { id: "a1", time: "12:45", meter: "Commercial HVAC cluster", type: "Spike", deviation: "+38.7%", severity: "high", status: "Open" },
  { id: "a2", time: "11:30", meter: "Industrial Feeder D7", type: "Spike", deviation: "+37.3%", severity: "high", status: "Open" },
  { id: "a3", time: "10:21", meter: "Residential Block T7", type: "Drop", deviation: "−28.5%", severity: "medium", status: "Open" },
  { id: "a4", time: "09:05", meter: "Residential Zone R3", type: "Spike", deviation: "+22.1%", severity: "medium", status: "Reviewing" },
  { id: "a5", time: "08:00", meter: "Industrial Feeder D2", type: "Drop", deviation: "−14.3%", severity: "low", status: "Closed" },
];

function Sparkline({ data, color = "var(--accent-cyan)", width = 64, height = 30 }) {
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

export default function ConsumptionBehaviour() {
  const [selectedProfile, setSelectedProfile] = useState("daytime");
  const active = profiles.find((p) => p.id === selectedProfile);

  return (
    <div className="cb-wrap">
      <div className="page-hero">
        <h1>Consumption profiles</h1>
        <div className="page-hero-sub">Understand distinct consumer behaviour patterns across your district. All data DEMO.</div>
      </div>

      {/* Profile Cards */}
      <div className="cb-profiles-grid">
        {profiles.map((p) => (
          <div
            key={p.id}
            className="cb-profile-card"
            style={{ borderColor: selectedProfile === p.id ? p.color : undefined, cursor: "pointer" }}
            onClick={() => setSelectedProfile(p.id)}
          >
            <div className="cb-profile-header">
              <div className="cb-profile-dot" style={{ background: p.color }} />
              <div className="cb-profile-name">{p.name}</div>
              <div className="cb-profile-count">{p.meters.toLocaleString()} meters</div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <Sparkline data={profileSparklines[p.id]} color={p.color} width={100} height={36} />
            </div>
            {p.stats.map((s) => (
              <div key={s.key} className="cb-stat-row">
                <span className="cb-stat-label">{s.key}</span>
                <span className="cb-stat-val">{s.val}</span>
              </div>
            ))}
            <div style={{ marginTop: 8, fontSize: "var(--text-xs)", color: "var(--text-muted)", lineHeight: 1.5 }}>
              {p.description}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Section */}
      {active && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">{active.name} — daily rhythm</div>
                <div className="card-subtitle">Relative load profile across the day · DEMO</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={active.radarData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                <PolarGrid stroke="var(--border-subtle)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                <Radar name={active.name} dataKey="A" stroke={active.color} fill={active.color} fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Flex potential by profile</div>
                <div className="card-subtitle">% of load that could be shifted · DEMO</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={profiles.map((p) => ({ name: p.name.split(" ")[0], flex: p.flexPct }))} margin={{ top: 10, right: 18, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-disabled)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-disabled)" }} unit="%" width={36} />
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: "var(--bg-raised)", border: "1px solid var(--border-muted)", borderRadius: 6 }} />
                <Bar dataKey="flex" radius={[4, 4, 0, 0]}>
                  {profiles.map((p, i) => <Cell key={i} fill={p.color} fillOpacity={0.8} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Anomaly Table */}
      <div className="section-header">
        <div>
          <div className="section-title">Anomaly detections — today</div>
          <div className="section-subtitle">Flagged by the ML pipeline · DEMO</div>
        </div>
        <a href="#" className="section-link">All anomalies</a>
      </div>
      <div className="signals-table-wrap">
        <table className="signals-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Meter / Cluster</th>
              <th>Type</th>
              <th>Deviation</th>
              <th>Severity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {anomalyData.map((a) => (
              <tr key={a.id}>
                <td className="signal-time">{a.time}</td>
                <td className="signal-cluster">{a.meter}</td>
                <td style={{ color: "var(--text-secondary)" }}>{a.type}</td>
                <td className={`signal-deviation ${a.deviation.startsWith("+") ? "pos" : "neg"}`}>{a.deviation}</td>
                <td><span className={`severity-badge ${a.severity}`}>{a.severity.charAt(0).toUpperCase() + a.severity.slice(1)}</span></td>
                <td><span style={{ fontSize: "var(--text-xs)", color: a.status === "Open" ? "var(--accent-amber)" : a.status === "Closed" ? "var(--text-muted)" : "var(--accent-cyan)" }}>{a.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "10px 14px", fontSize: "var(--text-xs)", color: "var(--text-disabled)", borderTop: "1px solid var(--border-subtle)" }}>
          All anomalies are DEMO illustrative data. Not derived from the real UCI dataset.
        </div>
      </div>
    </div>
  );
}
