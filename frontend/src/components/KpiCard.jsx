import React from 'react';
import PropTypes from 'prop-types';
/**
 * Reusable KPI card component.
 * Props:
 *   - label: metric description
 *   - value: numeric or formatted value
 *   - unit: measurement unit (e.g., "MWh")
 *   - description: optional tooltip text (shown on hover)
 */
export default function KpiCard({ label, value, unit = '', description = '' }) {
  return (
    <div className="kpi-card" title={description}>
      <div className="kpi-value">
        {value} {unit}
      </div>
      <div className="kpi-label">{label}</div>
    </div>
  );
}

KpiCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  unit: PropTypes.string,
  description: PropTypes.string,
};
