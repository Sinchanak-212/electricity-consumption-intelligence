import React from 'react';
import { useLocation } from 'react-router-dom';

const PAGE_LABELS = {
  '/': 'Overview',
  '/peak': 'Peak Intelligence',
  '/behaviour': 'Consumption profiles',
  '/forecast': 'Demand forecasting',
  '/processing': 'Processing pipeline',
};

export default function Header() {
  const { pathname } = useLocation();
  const pageLabel = PAGE_LABELS[pathname] ?? 'Overview';
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="page-header">
      <div className="page-breadcrumb">
        <span>Intelligence workspace</span>
        <span className="page-breadcrumb-sep">›</span>
        <span className="page-breadcrumb-current">{pageLabel}</span>
      </div>
      <div className="page-header-actions">
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-disabled)' }}>Joseph Abeng</span>
        <div className="header-user-chip">
          <div className="header-avatar">JA</div>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{timeStr} UTC</span>
        </div>
        <button className="btn-icon" title="Notifications">🔔</button>
      </div>
    </header>
  );
}
