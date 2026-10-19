# Electricity Consumption Intelligence

A Big Data analytics platform for analysing electricity consumption patterns, identifying peak-demand risks, detecting unusual consumption behaviour, and supporting demand-reduction decisions using Hadoop and Apache Spark.

## Problem Statement

Electricity consumption varies over time and across consumers. Simple forecasting alone does not explain when peak demand occurs, which consumption patterns contribute to peaks, or when a reading differs significantly from expected behaviour.

This project aims to build a reproducible analytics pipeline that processes time-series electricity consumption data and produces interpretable insights for peak-load analysis, behaviour profiling, anomaly detection, and demand forecasting.

## Objectives

- Build a structured data ingestion, validation, and transformation pipeline.
- Use HDFS for distributed data storage.
- Implement meaningful aggregation using Hadoop MapReduce.
- Use PySpark and Spark SQL for scalable data processing and analytics.
- Measure peak frequency, magnitude, duration, and contribution by consumer group.
- Explore consumption profiles and detect unusual observations.
- Evaluate short-term forecasting against a simple baseline.
- Simulate potential peak reduction under explicit assumptions.
- Build an interactive dashboard to communicate results.
- Benchmark Hadoop and Spark workloads where a fair comparison is possible.

## Dataset

Planned dataset: UCI ElectricityLoadDiagrams20112014.

Source: https://archive.ics.uci.edu/dataset/321/electricityloaddiagrams20112014

The dataset will be downloaded and its format, time coverage, missing values, units, and timestamp characteristics will be documented before analysis.

## Planned Technology Stack

- Python
- Hadoop HDFS and MapReduce
- Apache Spark / PySpark / Spark SQL
- Pandas and data-validation utilities where appropriate
- Streamlit for the interactive dashboard
- Git and GitHub for version control
- Automated tests for data processing and analytics

## Planned Architecture

Dataset → Validation and preprocessing → HDFS → Hadoop MapReduce and Apache Spark → Analytics and evaluation → Dashboard and reports

## Project Status

**Phase 1: Repository and project structure setup.**

Implementation, dataset validation, experiments, and evaluation results will be added as they are completed. Planned features are not yet claimed as implemented.

## Reproducibility and Limitations

- Results will be documented with the relevant dataset, assumptions, and evaluation methods.
- Forecasting will use chronological evaluation rather than random time-series splits.
- Anomaly flags will be treated as indicators for investigation, not proof of faults or theft.
- Performance claims will be based on recorded experiments.
- The dataset represents its source context and should not be interpreted as live Indian electricity-grid data.

## License

To be decided after reviewing the applicable dataset and project licensing requirements.
