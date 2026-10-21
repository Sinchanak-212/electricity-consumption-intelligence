import React from "react";
import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  {
    section: "ANALYTICS",
    links: [
      { to: "/", label: "Overview", end: true, icon: "\u25a7" },
      { to: "/peak", label: "Peak Intelligence", icon: "\u26a1" },
      { to: "/behaviour", label: "Consumption profiles", icon: "\u25d1" },
      { to: "/forecast", label: "Demand forecasting", icon: "\u25b3" },
    ],
  },
  {
    section: "DATA FEATURES",
    links: [
      { to: "#", label: "Datasets", icon: "\u229e", disabled: true },
      { to: "/processing", label: "Processing pipeline", icon: "\u2261" },
      { to: "#", label: "Reports", icon: "\u25a1", disabled: true },
    ],
  },
];

function linkClass({ isActive }) {
  return isActive ? "sidebar-link active" : "sidebar-link";
}

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">{"\u26a1"}</div>
        <div className="sidebar-logo-text">
          Electricity<br />Intelligence
        </div>
      </div>
      <div className="sidebar-dataset-select">
        <div className="sidebar-dataset-label">Dataset</div>
        <button className="sidebar-dataset-btn">
          <span>North district 1</span>
          <span style={{ fontSize: "10px", opacity: 0.6 }}>{"▾"}</span>
        </button>
      </div>
      <div className="sidebar-nav">
        {NAV_ITEMS.map((group) => (
          <div key={group.section}>
            <div className="sidebar-section-label">{group.section}</div>
            {group.links.map((link) =>
              link.disabled ? (
                <div
                  key={link.label}
                  className="sidebar-link"
                  style={{ opacity: 0.4, cursor: "default", pointerEvents: "none" }}
                >
                  <span className="sidebar-link-icon">{link.icon}</span>
                  <span>{link.label}</span>
                </div>
              ) : (
                <NavLink
                  key={link.label}
                  to={link.to}
                  end={link.end}
                  className={linkClass}
                >
                  <span className="sidebar-link-icon">{link.icon}</span>
                  <span>{link.label}</span>
                </NavLink>
              )
            )}
          </div>
        ))}
        <div className="sidebar-section-label" style={{ marginTop: 8 }}>DEMO ENVIRONMENT</div>
        <div className="sidebar-link" style={{ opacity: 0.4, cursor: "default", pointerEvents: "none" }}>
          <span className="sidebar-link-icon">{"\u2b21"}</span>
          <span>Series environment</span>
        </div>
        <div style={{ padding: "6px 16px 4px" }}>
          <div style={{ fontSize: "10px", color: "var(--text-disabled)", lineHeight: 1.5 }}>
            Built for discovery. Powered by<br />distributed analytics.
          </div>
          <a href="#" style={{ fontSize: "10px", color: "var(--accent-cyan)", display: "block", marginTop: 4 }}>
            View data methodology {"\u2197"}
          </a>
        </div>
      </div>
      <div style={{ padding: "0 16px 8px" }}>
        <a href="#" style={{ fontSize: "var(--text-xs)", color: "var(--text-disabled)", display: "flex", alignItems: "center", gap: 6 }}>
          <span>?</span> Help &amp; documentation
        </a>
      </div>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">AK</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">Alex Kim</div>
            <div className="sidebar-user-role">Energy analyst</div>
          </div>
        </div>
      </div>
    </nav>
  );
}
