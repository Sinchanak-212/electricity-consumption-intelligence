// DEMO timeâ€‘series â€“ hourly consumption for one week (168 points)
export const consumptionSeries = Array.from({ length: 168 }, (_, i) => ({
  timestamp: new Date(Date.UTC(2026, 0, 1, i % 24, 0, 0)).toISOString(),
  // generate a plausible sinusoidal pattern with random noise
  value: Math.round(40 + 20 * Math.sin((i / 24) * Math.PI) + Math.random() * 5),
}));
