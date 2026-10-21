import React, { useState } from "react";

const stages = [
  {
    id: "ingestion",
    icon: "📥",
    cls: "green",
    title: "Data Ingestion",
    subtitle: "Smart meter readings",
    status: "active",
    stats: [
      { key: "Total readings", val: "35.9M" },
      { key: "Meters tracked", val: "12,400" },
      { key: "Frequency", val: "30-minute" },
      { key: "Date range", val: "Jan 2006 – Nov 2010" },
      { key: "Last batch", val: "27 Oct 2026 14:00 UTC" },
      { key: "Source", val: "UCI ML Repository (DEMO)" },
    ],
    note: "UCI Household Power Consumption dataset used for demo. No live meter connection.",
  },
  {
    id: "validation",
    icon: "✅",
    cls: "green",
    title: "Data Validation",
    subtitle: "Quality checks & cleaning",
    status: "active",
    stats: [
      { key: "Null rate", val: "1.25%" },
      { key: "Nulls filled", val: "Median imputation" },
      { key: "Outlier method", val: "IQR ± 3σ" },
      { key: "Outliers flagged", val: "2,847" },
      { key: "Pass rate", val: "98.75%" },
      { key: "Schema checks", val: "7 / 7 passed" },
    ],
    note: "Validation logic is implemented and runs on the UCI dataset.",
  },
  {
    id: "hdfs",
    icon: "🗄️",
    cls: "blue",
    title: "HDFS Storage",
    subtitle: "Distributed file system",
    status: "planned",
    stats: [
      { key: "Status", val: "Planned" },
      { key: "Data size (est.)", val: "~430 MB" },
      { key: "Replication factor", val: "3×" },
      { key: "Block size", val: "128 MB" },
      { key: "Cluster nodes", val: "Not provisioned" },
      { key: "Integration", val: "Not connected" },
    ],
    note: "HDFS integration is planned. Currently data is processed locally.",
  },
  {
    id: "mapreduce",
    icon: "⚙️",
    cls: "blue",
    title: "Hadoop MapReduce",
    subtitle: "Batch aggregation",
    status: "planned",
    stats: [
      { key: "Status", val: "Planned" },
      { key: "Job type", val: "Daily aggregation" },
      { key: "Mapper tasks", val: "Not deployed" },
      { key: "Reducer tasks", val: "Not deployed" },
      { key: "Framework", val: "Hadoop 3.x (planned)" },
      { key: "Integration", val: "Not connected" },
    ],
    note: "MapReduce job design is documented. Execution environment not provisioned.",
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
      { key: "Executors", val: "Not provisioned" },
      { key: "Streaming", val: "Spark Structured Streaming" },
      { key: "ML library", val: "Spark MLlib" },
      { key: "Session", val: "Not active" },
      { key: "Integration", val: "Not connected" },
    ],
    note: "Spark integration is planned for streaming anomaly detection and ML pipeline.",
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
      { key: "Query engine", val: "Spark SQL 3.x" },
      { key: "Catalog", val: "Not configured" },
      { key: "Views", val: "Not deployed" },
      { key: "p95 query time", val: "N/A" },
      { key: "Integration", val: "Not connected" },
    ],
    note: "Spark SQL query layer is planned. Dashboard currently uses pre-computed demo data.",
  },
];

const timelineEvents = [
  { date: "27 Oct 2026 14:00", event: "Demo ingestion batch completed", status: "success" },
  { date: "27 Oct 2026 13:58", event: "Validation: 98.75% records passed schema check", status: "success" },
  { date: "27 Oct 2026 13:55", event: "Outlier detection completed: 2,847 flagged", status: "warning" },
  { date: "27 Oct 2026 13:50", event: "Demo data loaded from UCI repository", status: "success" },
  { date: "27 Oct 2026 13:45", event: "HDFS integration: Not yet connected", status: "planned" },
  { date: "27 Oct 2026 13:44", event: "Hadoop MapReduce: Not yet deployed", status: "planned" },
  { date: "27 Oct 2026 13:43", event: "Spark cluster: Not yet provisioned", status: "planned" },
];

export default function DataProcessing() {
  const [selected, setSelected] = useState("ingestion");
  const active = stages.find((s) => s.id === selected);

  return (
    <div className="dp-wrap">
      <div className="page-hero">
        <h1>Data &amp; Processing Pipeline</h1>
        <div className="page-hero-sub">
          HDFS, Hadoop MapReduce and Spark are <strong style={{ color: "var(--accent-amber)" }}>Planned / Not yet connected</strong>. 
          Ingestion and validation run on the UCI demo dataset.
        </div>
      </div>

      {/* Status Banner */}
      <div className="demo-banner" style={{ marginBottom: 18, borderColor: "rgba(246,173,85,0.3)", background: "rgba(246,173,85,0.05)" }}>
        <span style={{ color: "var(--accent-amber)", fontSize: 16 }}>⚠</span>
        <span>
          <strong style={{ color: "var(--accent-amber)" }}>Demo environment.</strong>{" "}
          Ingestion and validation use the UCI dataset. HDFS, MapReduce and Spark integration is <strong style={{ color: "var(--accent-amber)" }}>not yet implemented</strong>. 
          No live grid data, no real Spark jobs, no fabricated job metrics.
        </span>
      </div>

      {/* Stage Cards */}
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

      {/* Stage Detail */}
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

          {/* Activity log */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Activity log</div>
              <div className="card-subtitle">Recent pipeline events · DEMO</div>
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

      {/* Pipeline Diagram */}
      <div className="section-header">
        <div className="section-title">End-to-end pipeline overview</div>
      </div>
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="pipeline-flow">
          {[
            { icon: "📥", cls: "green", title: "Ingestion", sub: "UCI dataset", stat: "35.9M readings", planned: false },
            { arrow: true },
            { icon: "✅", cls: "green", title: "Validation", sub: "Quality checks", stat: "98.75% pass", planned: false },
            { arrow: true },
            { icon: "🗄️", cls: "blue", title: "HDFS", sub: "Distributed store", stat: "~430 MB est.", planned: true },
            { arrow: true },
            { icon: "⚙️", cls: "blue", title: "MapReduce", sub: "Batch aggregate", stat: "Not deployed", planned: true },
            { arrow: true },
            { icon: "⚡", cls: "purple", title: "Spark", sub: "ML + streaming", stat: "Not provisioned", planned: true },
            { arrow: true },
            { icon: "🔍", cls: "amber", title: "Spark SQL", sub: "Query layer", stat: "Not configured", planned: true },
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
          ⚡ Privacy: No per-household data included. All aggregations are for demonstration purposes only.
        </div>
      </div>
    </div>
  );
}
