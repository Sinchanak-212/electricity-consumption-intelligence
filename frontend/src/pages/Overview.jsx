import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import KpiCard from '../components/KpiCard';
import { kpis } from '../demo-data/kpis';
import { consumptionSeries } from '../demo-data/consumptionTimeSeries';

export default function Overview() {
  return (
    <div className="overview-page" style={{ padding: '1rem' }}>
      {/* KPI Cards */}
      <div className="grid-2" style={{ marginBottom: '1rem' }}>
        {kpis.map((k) => (
          <KpiCard
            key={k.label}
            label={k.label}
            value={k.value}
            unit={k.unit}
            description={k.description}
          />
        ))}
      </div>

      {/* Consumption Timeâ€‘Series Chart */}
      <div className="chart-card">
        <h2>Electricity Consumption (DEMO)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={consumptionSeries}>
            <XAxis
              dataKey="timestamp"
              tickFormatter={(t) => new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(t) => new Date(t).toLocaleString()}
              formatter={(v) => `${v} MWh`}
            />
            <Line type="monotone" dataKey="value" stroke="var(--color-primary)" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
