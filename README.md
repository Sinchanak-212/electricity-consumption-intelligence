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

**Stage A and Stage B completed for the foundational pipeline.**

The repository has been audited, the raw dataset has been validated, and a working Hadoop streaming aggregation job has been implemented and executed successfully on the real dataset. The project is now ready to move into Spark analytics and API/dashboard integration.

## Implemented so far

- Repository audit and setup review complete.
- Streaming dataset validation implemented in `scripts/validate_dataset.py`.
- Synthetic tests for validation and hourly Hadoop aggregation added under `tests/`.
- Hadoop MapReduce job for hourly totals and peak summaries implemented and executed on the real dataset.

## Current architecture

`raw dataset -> validation -> HDFS -> Hadoop streaming -> Spark analytics -> API -> dashboard`

## How to run the validated pipeline

```bash
python3 /mnt/c/Users/User/electricity-intelligence/scripts/validate_dataset.py \
  --input /mnt/c/Users/User/electricity-intelligence/data/raw/LD2011_2014.txt \
  --output /mnt/c/Users/User/electricity-intelligence/reports/dataset_validation_report.json

python3 /mnt/c/Users/User/electricity-intelligence/scripts/run_hadoop_hourly_summary.py \
  --input /user/sinchu/electricity/raw/LD2011_2014.txt \
  --output /user/sinchu/electricity/processed/hourly_summary
```

## Reproducibility and Limitations

- Results will be documented with the relevant dataset, assumptions, and evaluation methods.
- Forecasting will use chronological evaluation rather than random time-series splits.
- Anomaly flags will be treated as indicators for investigation, not proof of faults or theft.
- Performance claims will be based on recorded experiments.
- The dataset represents its source context and should not be interpreted as live Indian electricity-grid data.

## License

To be decided after reviewing the applicable dataset and project licensing requirements.
