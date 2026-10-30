# Architecture

## Overview

This project follows a layered big-data workflow: raw electricity data is validated, moved to HDFS, aggregated with Hadoop MapReduce, processed with Spark SQL, and exposed through a lightweight API for the React dashboard.

## Data flow

1. Raw file: `data/raw/LD2011_2014.txt`
2. Validation: `scripts/validate_dataset.py`
3. HDFS raw location: `/user/sinchu/electricity/raw/LD2011_2014.txt`
4. MapReduce hourly summary: `scripts/run_hadoop_hourly_summary.py`
5. Spark processing layer: `src/spark/`
6. API: FastAPI endpoints serving analytics results
7. Dashboard: React frontend pages using the API outputs

## Why Hadoop and Spark?

Hadoop handles the distributed storage and batch-friendly aggregation of a large time-series file. Spark is better suited for interactive analytics, SQL-style exploration, and feature engineering across the dataset.

## HDFS layout

- `/user/sinchu/electricity/raw/` stores the raw dataset
- `/user/sinchu/electricity/processed/` stores generated batch outputs
- `/user/sinchu/electricity/results/` is reserved for analytics summaries and scored outputs

## Current stage

The repository includes the validation script and a working Hadoop streaming aggregation job that summarizes hourly demand totals and peak values from the raw dataset.
