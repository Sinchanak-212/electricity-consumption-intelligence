# Methodology

## Validation

The validator reads the dataset in a streaming manner and checks the header, record length, timestamp format, ordering, and numerical quality. This keeps memory usage low even for a large file.

## Aggregation

The Hadoop job groups rows by date and hour and computes:

- total demand by hour
- peak value by hour
- count of valid observations used in the aggregation

This provides a distributed summary before deeper analysis in Spark.

## Analytics direction

The next stages will include:

- peak-demand detection
- consumption pattern clustering or profiling
- anomaly detection using robust thresholds
- short-horizon forecasting baseline comparison
- what-if reduction simulation for peak periods

## Important note

The project is educational and analytical. Forecasting and simulation results should be treated as decision-support signals, not verified operational measurements.
