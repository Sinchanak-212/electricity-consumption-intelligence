import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell
} from "recharts";
import { fetchJson } from "../lib/api";
import { peakEvents } from "../demo-data/consumptionTimeSeries";

const kpis = [
  { label: "Peak events (30d)", value: "7", unit: "", delta: "+2 vs prior month", deltaDir: "up", color: "var(--accent-red)" },
  { label: "Avg peak magnitude", value: "3.41", unit: "kW", delta: "+0.12 kW", deltaDir: "up", color: "var(--accent-amber)" },
  { label: "Avg duration", value: "39", unit: "min", delta: "−4 min", deltaDir: "down", color: "var(--accent-cyan)" },
  { label: "Flex load capacity", value: "12.4", unit: "%", delta: "available today", deltaDir: "neutral", color: "var(--accent-green)" },
];

const hourlyPattern = Array.from({ length: 24 }, (_, h) => {
  const freq = h >= 17 && h <= 20 ? 4 + Math.random() * 2 : h >= 7 && h <= 9 ? 2 + Math.random() : Math.random() * 0.8;
  return { hour: `${String(h).padStart(2, "0")}:00`, events: +freq.toFixed(1) };
});

function TooltipPeak({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border-muted)", borderRadius: 6, padding: "8px 12px", fontSize: 12 }}>
      <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
      <div style={{ color: "var(--accent-cyan)" }}>{payload[0]?.value} events</div>
    </div>
  );
}

export default function PeakIntelligence() {
  const [view, setView] = useState("events");
  const [peaks, setPeaks] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadPeaks() {
      try {
        setLoading(true);
        const data = await fetchJson("/api/peaks");
        if (active) {
          setPeaks(data);
        }
      } catch (err) {
        if (active) {
          setPeaks({ status: "not_ready", items: [] });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPeaks();
    return () => {
      active = false;
    };
  }, []);

  const peakEventRows = peaks?.status === "ok" && peaks.items?.length ? peaks.items : peakEvents;

  return (
    <div className="peak-page-wrap">
      <div className="page-hero">
        <h1>Peak Intelligence</h1>
        <div className="page-hero-sub">Analyse, forecast and mitigate demand peaks across your district.</div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <span className="demo-banner-tag" style={{ padding: "4px 12px", fontSize: "var(--text-xs)", background: "rgba(104,211,145,0.06)", border: "1px solid rgba(104,211,145,0.2)", borderRadius: 4, color: "var(--accent-green)", fontWeight: 500 }}>
          {loading ? "LOADING" : peaks?.status === "ok" ? "LIVE" : "DEMO"}
        </span>
      </div>

      {/* KPIs */}
      <div className="peak-kpi-grid">
        {kpis.map((k) => (
          <div className="kpi-card" key={k.label} style={{ "--kpi-accent": k.color }}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}<span className="unit">{k.unit}</span></div>
            <div className={`kpi-delta ${k.deltaDir}`}>
              {k.deltaDir === "up" && "▲"}{k.deltaDir === "down" && "▼"}
              <span className="kpi-delta-text">{k.delta}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Hourly pattern chart */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Peak event frequency by hour of day</div>
            <div className="card-subtitle">Last 30 days · North district 1 · DEMO</div>
          </div>
          <div className="period-toggle">
            {["events", "magnitude"].map((v) => (
              <button key={v} className={`period-btn ${view === v ? "active" : ""}`} onClick={() => setView(v)}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={hourlyPattern} margin={{ top: 10, right: 18, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "var(--text-disabled)" }} interval={3} />
            <YAxis tick={{ fontSize: 10, fill: "var(--text-disabled)" }} width={32} />
            <Tooltip content={<TooltipPeak />} />
            <ReferenceLine x="17:00" stroke="var(--accent-red)" strokeDasharray="4 2" />
            <Bar dataKey="events" radius={[3, 3, 0, 0]}>
              {hourlyPattern.map((entry, index) => (
                <Cell key={index}
                  fill={entry.events >= 4 ? "var(--accent-red)" : entry.events >= 2 ? "var(--accent-amber)" : "var(--accent-cyan)"}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ padding: "6px 18px 12px", fontSize: "var(--text-xs)", color: "var(--text-disabled)" }}>
          Peak events concentrate between 17:00–20:00. Evening HVAC + EV charging are primary drivers.
        </div>
      </div>

      {/* Peak Events Table */}
      <div className="section-header">
        <div>
          <div className="section-title">Recent peak events</div>
          <div className="section-subtitle">Last 5 detected threshold crossings · DEMO</div>
        </div>
        <a href="#" className="section-link">View all</a>
      </div>
      <div className="peak-events-table-wrap">
        <table className="signals-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time (UTC)</th>
              <th>Peak (kW)</th>
              <th>Threshold (kW)</th>
              <th>Duration</th>
              <th>Severity</th>
              <th>Primary cluster</th>
              <th>Reduction needed</th>
            </tr>
          </thead>
          <tbody>
            {peakEventRows.map((e) => (
              <tr key={e.id || `${e.date}-${e.time}`}>
                <td className="signal-time">{e.date}</td>
                <td>{e.time}</td>
                <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{Number(e.peak ?? 0).toFixed(2)}</td>
                <td style={{ color: "var(--text-muted)" }}>{Number(e.threshold ?? 0).toFixed(2)}</td>
                <td>{e.duration || "—"}</td>
                <td>
                  <span className={`severity-badge ${e.severity === "elevated" ? "medium" : e.severity}`}>
                    {String(e.severity || "normal").charAt(0).toUpperCase() + String(e.severity || "normal").slice(1)}
                  </span>
                </td>
                <td style={{ color: "var(--text-secondary)", fontSize: "var(--text-xs)" }}>{e.cluster || "N/A"}</td>
                <td style={{ color: Number(e.reduction || 0) > 0 ? "var(--accent-amber)" : "var(--accent-green)", fontWeight: 600 }}>
                  {Number(e.reduction || 0) > 0 ? `−${Number(e.reduction).toFixed(2)} kW` : "None"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "10px 14px", fontSize: "var(--text-xs)", color: "var(--text-disabled)", borderTop: "1px solid var(--border-subtle)" }}>
          All values are DEMO illustrative data, not derived from the real UCI dataset.
        </div>
      </div>
    </div>
  );
}
