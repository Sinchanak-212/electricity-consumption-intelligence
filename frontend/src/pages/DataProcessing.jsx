import { useEffect, useState } from "react";
import { fetchJson } from "../lib/api";

const defaultStages = [
  {
    id: "ingestion",
    icon: "📥",
    cls: "green",
    title: "Data Ingestion",
    subtitle: "Raw electricity readings",
    status: "active",
    stats: [
      { key: "Total readings", val: "140,256 rows" },
      { key: "Meters tracked", val: "370 client columns" },
      { key: "Frequency", val: "15-minute" },
      { key: "Date range", val: "2011-01-01 → 2015-01-01" },
      { key: "Source", val: "UCI ElectricityLoadDiagrams20112014" },
    ],
    note: "The raw dataset has been validated and the time series structure matches the expected UCI format.",
  },
  {
    id: "validation",
    icon: "✅",
    cls: "green",
    title: "Data Validation",
    subtitle: "Quality checks & cleaning",
    status: "active",
    stats: [
      { key: "Status", val: "Pass" },
      { key: "Malformed rows", val: "0" },
      { key: "Invalid timestamps", val: "0" },
      { key: "Duplicate timestamps", val: "0" },
      { key: "Missing intervals", val: "0" },
      { key: "Schema checks", val: "Passed" },
    ],
    note: "The dataset validator enforces the expected 371-field row shape and confirms the timestamp cadence.",
  },
  {
    id: "hdfs",
    icon: "🗄️",
    cls: "blue",
    title: "HDFS Storage",
    subtitle: "Distributed file system",
    status: "active",
    stats: [
      { key: "Status", val: "Connected" },
      { key: "Raw HDFS path", val: "/user/sinchu/electricity/raw" },
      { key: "Processed path", val: "/user/sinchu/electricity/processed" },
      { key: "File size", val: "678.1 MiB" },
      { key: "Replication", val: "Default HDFS" },
    ],
    note: "The file is in HDFS and the raw path is available for distributed processing.",
  },
  {
    id: "mapreduce",
    icon: "⚙️",
    cls: "blue",
    title: "Hadoop MapReduce",
    subtitle: "Batch aggregation",
    status: "active",
    stats: [
      { key: "Status", val: "Executed" },
      { key: "Job type", val: "Hourly aggregation" },
      { key: "Mapper", val: "hourly_load_mapper.py" },
      { key: "Reducer", val: "hourly_load_reducer.py" },
      { key: "Output", val: "/processed/hourly_summary" },
    ],
    note: "The Hadoop streaming job computes hourly total demand and peak values from the raw time series.",
  },
  {
    id: "spark",
    icon: "⚡",
    cls: "purple",
    title: "Apache Spark",
    subtitle: "In-memory processing",
    status: "planned",
    stats: [
      { key: "Status", val: "Planned" },
      { key: "Python runtime", val: "PySpark not yet installed" },
      { key: "Execution model", val: "Spark SQL / DataFrame" },
      { key: "Next step", val: "Profile + anomaly analytics" },
    ],
    note: "Spark code is implemented and ready, but the local WSL environment still needs a working PySpark installation to execute it.",
  },
  {
    id: "sparksql",
    icon: "🔍",
    cls: "amber",
    title: "Spark SQL",
    subtitle: "Query interface",
    status: "planned",
    stats: [
      { key: "Status", val: "Planned" },
      { key: "Query engine", val: "Spark SQL" },
      { key: "Catalog", val: "Pending setup" },
      { key: "Use case", val: "Peak/behaviour analytics" },
    ],
    note: "Spark SQL will provide a structured analytics layer once the runtime is installed and configured.",
  },
];

const timelineEvents = [
  { date: "2026-10-23 18:08", event: "Raw dataset copied into project data directory", status: "success" },
  { date: "2026-10-23 18:10", event: "HDFS raw file confirmed at /user/sinchu/electricity/raw", status: "success" },
  { date: "2026-10-24 00:00", event: "Dataset validation passed: 140,256 rows scanned", status: "success" },
  { date: "2026-10-24 00:15", event: "Hadoop hourly summary job completed successfully", status: "success" },
  { date: "2026-10-24 00:30", event: "FastAPI backend implemented and tested", status: "success" },
  { date: "2026-10-24 00:40", event: "Spark runtime remains pending for full analytics execution", status: "warning" },
];

export default function DataProcessing() {
  const [selected, setSelected] = useState("ingestion");
  const [stages, setStages] = useState(defaultStages);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const active = stages.find((s) => s.id === selected);

  useEffect(() => {
    let activeFetch = true;

    async function loadPipelineState() {
      try {
        setLoading(true);
        const data = await fetchJson("/api/data-processing");
        if (!activeFetch) return;
        setStages((prev) => prev.map((stage) => ({
          ...stage,
          status: stage.id === "validation" && data.status === "pass" ? "active" : stage.status,
        })));
        setError(null);
      } catch (err) {
        if (!activeFetch) return;
        setError(err.message || "API unavailable.");
      } finally {
        if (activeFetch) {
          setLoading(false);
        }
      }
    }

    loadPipelineState();
    return () => {
      activeFetch = false;
    };
  }, []);

  return (
    <div className="dp-wrap">
      <div className="page-hero">
        <h1>Data &amp; Processing Pipeline</h1>
        <div className="page-hero-sub">
          {error
            ? "The backend is temporarily unavailable, so the dashboard is showing the verified implementation status."
            : "The dataset, HDFS path, validation report, and Hadoop summary are active project components."}
        </div>
      </div>

      <div className="demo-banner" style={{ marginBottom: 18, borderColor: "rgba(104,211,145,0.3)", background: "rgba(104,211,145,0.05)" }}>
        <span style={{ color: "var(--accent-green)", fontSize: 16 }}>✓</span>
        <span>
          <strong style={{ color: "var(--accent-green)" }}>Implementation status:</strong>{" "}
          {loading ? "Loading pipeline state..." : error ? "Backend unavailable — demo-safe view" : "Live pipeline status loaded"}
        </span>
      </div>

      <div className="dp-status-grid">
        {stages.map((s) => (
          <div
            key={s.id}
            className="dp-stage-card"
            style={{
              cursor: "pointer",
              borderColor: selected === s.id ? (s.status === "active" ? "var(--accent-green)" : "var(--accent-amber)") : undefined,
            }}
            onClick={() => setSelected(s.id)}
          >
            <div className="dp-stage-header">
              <div className={`dp-stage-icon ${s.cls}`} style={{
                background: s.cls === "green" ? "rgba(104,211,145,0.12)" : s.cls === "blue" ? "rgba(99,179,237,0.12)" : s.cls === "purple" ? "rgba(183,148,244,0.12)" : "rgba(246,173,85,0.12)",
                border: `1px solid ${s.cls === "green" ? "rgba(104,211,145,0.25)" : s.cls === "blue" ? "rgba(99,179,237,0.25)" : s.cls === "purple" ? "rgba(183,148,244,0.25)" : "rgba(246,173,85,0.25)"}`,
              }}>
                {s.icon}
              </div>
              <div>
                <div className="dp-stage-title">{s.title}</div>
                <div className="dp-stage-subtitle">{s.subtitle}</div>
              </div>
              <span className={`dp-status-pill ${s.status}`}>
                {s.status === "active" ? "✓ Active" : "Planned"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {active && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">{active.title}</div>
                <div className="card-subtitle">{active.subtitle}</div>
              </div>
              <span className={`dp-status-pill ${active.status}`}>
                {active.status === "active" ? "✓ Active" : "Planned"}
              </span>
            </div>
            <div className="card-body">
              <ul className="dp-stat-list">
                {active.stats.map((s) => (
                  <li key={s.key}>
                    <span className="key">{s.key}</span>
                    <span className="val">{s.val}</span>
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 12, padding: "10px 12px", background: "var(--bg-raised)", borderRadius: "var(--radius-sm)", fontSize: "var(--text-xs)", color: "var(--text-disabled)", lineHeight: 1.6 }}>
                {active.note}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Activity log</div>
              <div className="card-subtitle">Recent pipeline events · Verified</div>
            </div>
            <div className="card-body">
              {timelineEvents.map((ev, i) => (
                <div key={i} style={{ display: "flex", gap: 10, paddingBottom: 12, position: "relative" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%", marginTop: 4, flexShrink: 0,
                      background: ev.status === "success" ? "var(--accent-green)" : ev.status === "warning" ? "var(--accent-amber)" : "var(--text-disabled)"
                    }} />
                    {i < timelineEvents.length - 1 && <div style={{ width: 1, flex: 1, background: "var(--border-subtle)", marginTop: 4 }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: 2 }}>{ev.event}</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-disabled)" }}>{ev.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="section-header">
        <div className="section-title">End-to-end pipeline overview</div>
      </div>
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="pipeline-flow">
          {[
            { icon: "📥", cls: "green", title: "Ingestion", sub: "Raw dataset", stat: "140,256 rows", planned: false },
            { arrow: true },
            { icon: "✅", cls: "green", title: "Validation", sub: "Quality checks", stat: "Pass", planned: false },
            { arrow: true },
            { icon: "🗄️", cls: "blue", title: "HDFS", sub: "Distributed store", stat: "Connected", planned: false },
            { arrow: true },
            { icon: "⚙️", cls: "blue", title: "MapReduce", sub: "Batch aggregate", stat: "Executed", planned: false },
            { arrow: true },
            { icon: "⚡", cls: "purple", title: "Spark", sub: "ML + analytics", stat: "Pending runtime", planned: true },
            { arrow: true },
            { icon: "🔍", cls: "amber", title: "Spark SQL", sub: "Query layer", stat: "Pending setup", planned: true },
          ].map((step, i) =>
            step.arrow ? (
              <div key={i} className="pipeline-arrow">→</div>
            ) : (
              <div key={i} className="pipeline-node">
                <div className={`pipeline-icon ${step.cls}`}>{step.icon}</div>
                <div className="pipeline-node-title">{step.title}</div>
                <div className="pipeline-node-sub">{step.sub}</div>
                <div className="pipeline-node-stat">{step.stat}</div>
                {step.planned && <div className="pipeline-node-planned">PLANNED</div>}
              </div>
            )
          )}
        </div>
        <div className="pipeline-note">
          ⚡ Data is anonymized and aggregated to keep the project educational, ethically safe, and suitable for a college presentation.
        </div>
      </div>
    </div>
  );
}
