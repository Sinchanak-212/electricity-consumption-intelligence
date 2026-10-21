// DEMO time-series — 48 half-hourly readings for 27 Oct 2026
// NOT derived from the real UCI dataset.

const BASE_DATE = new Date(Date.UTC(2026, 9, 27, 0, 0, 0)); // 27 Oct 2026

function makeSeries(fn, count = 48) {
  return Array.from({ length: count }, (_, i) => {
    const ts = new Date(BASE_DATE.getTime() + i * 30 * 60 * 1000);
    return { timestamp: ts.toISOString(), ...fn(i) };
  });
}

// Main demand outlook series (actual + forecast + band)
export const consumptionSeries = makeSeries((i) => {
  // typical residential daily curve
  const hour = (i * 0.5) % 24;
  const baseload = 1.4;
  const morningPeak = 1.2 * Math.exp(-0.5 * ((hour - 7.5) / 1.5) ** 2);
  const eveningPeak = 1.8 * Math.exp(-0.5 * ((hour - 18.5) / 2.0) ** 2);
  const actual = +(baseload + morningPeak + eveningPeak + (Math.random() - 0.5) * 0.15).toFixed(3);
  const forecast = +(baseload + morningPeak * 1.05 + eveningPeak * 1.02).toFixed(3);
  return {
    value: i <= 32 ? actual : null,           // actual only up to ~16:00
    forecast: forecast,
    bandHigh: +(forecast + 0.22).toFixed(3),
    bandLow: +(forecast - 0.22).toFixed(3),
    thresholdLine: 3.20,
  };
});

// Weekly aggregate for bar charts
export const weeklyConsumption = [
  { day: 'Mon', value: 28.4 },
  { day: 'Tue', value: 31.2 },
  { day: 'Wed', value: 29.8 },
  { day: 'Thu', value: 33.5 },
  { day: 'Fri', value: 36.1 },
  { day: 'Sat', value: 22.4 },
  { day: 'Sun', value: 18.9 },
];

// Profile sparkline data (3 points each, for mini charts)
export const profileSparklines = {
  daytime: [0.8, 1.6, 2.4, 2.1, 1.4, 1.8, 2.6, 2.2, 1.7],
  evening: [0.6, 0.9, 1.1, 1.4, 2.1, 3.2, 3.8, 3.1, 2.4],
  baseload: [1.1, 1.2, 1.1, 1.0, 1.1, 1.2, 1.1, 1.1, 1.0],
};

// Peak events (used on Peak Intelligence page)
export const peakEvents = [
  { id: 'pe1', date: '27 Oct 2026', time: '18:30', peak: 3.42, threshold: 3.20, duration: '45 min', severity: 'high', cluster: 'HVAC + EV', reduction: 0.22 },
  { id: 'pe2', date: '26 Oct 2026', time: '19:00', peak: 3.31, threshold: 3.20, duration: '30 min', severity: 'elevated', cluster: 'Residential-Eve', reduction: 0.11 },
  { id: 'pe3', date: '25 Oct 2026', time: '17:45', peak: 3.55, threshold: 3.20, duration: '60 min', severity: 'high', cluster: 'Commercial-HVAC', reduction: 0.35 },
  { id: 'pe4', date: '24 Oct 2026', time: '08:15', peak: 3.24, threshold: 3.20, duration: '20 min', severity: 'elevated', cluster: 'Morning-Surge', reduction: 0.04 },
  { id: 'pe5', date: '23 Oct 2026', time: '20:00', peak: 2.98, threshold: 3.20, duration: '—', severity: 'normal', cluster: 'Evening-Res', reduction: 0 },
];

// Forecasting page series
export const forecastSeries = makeSeries((i) => {
  const hour = (i * 0.5) % 24;
  const baseload = 1.5;
  const morning = 1.1 * Math.exp(-0.5 * ((hour - 8) / 1.8) ** 2);
  const evening = 1.9 * Math.exp(-0.5 * ((hour - 19) / 2.2) ** 2);
  const hist = +(baseload + morning + evening + (Math.random() - 0.5) * 0.12).toFixed(3);
  const pred = +(baseload + morning * 1.03 + evening * 1.05).toFixed(3);
  return { historical: hist, predicted: pred, upper: +(pred + 0.28).toFixed(3), lower: +(pred - 0.28).toFixed(3) };
}, 96); // 2 days
