# Project status

## What already works

- The repository structure is in place with `dashboard/`, `data/`, `docs/`, `frontend/`, `reports/`, `scripts/`, `src/`, and `tests/`.
- The React dashboard exists and is running on a Vite + React + Recharts stack. The UI retains the designed layout and route structure.
- The raw electricity dataset is already present locally and in the HDFS raw directory, with the expected size of roughly 678 MiB.
- Hadoop 3.5.0 is installed and reachable from WSL; HDFS is available under `/user/sinchu/electricity`.
- Java 17 and Python 3.12.3 are available in the WSL environment.
- The dataset header matches the known UCI format: a leading empty field plus `MT_001` through `MT_370`.

## What remains to be built

- A dataset validation script that checks schema, timestamps, numerical quality, and malformed rows in a streaming mode.
- A reproducible ingestion flow from local/raw HDFS into processed storage.
- Hadoop MapReduce tasks for distributed statistics and aggregation.
- PySpark/Spark SQL processing for analytics and feature construction.
- FastAPI endpoints that expose computed results to the frontend.
- Final dashboard wiring to connect real computed metrics to the existing pages.
- Tests and documentation for the end-to-end Big Data pipeline.

## Dependencies and compatibility risks

- The project uses a Windows + WSL2 setup. All Hadoop and Linux-side tooling should be run from WSL, while the frontend and local file paths remain in the Windows workspace.
- Spark is not yet confirmed to be installed in this environment. If PySpark is unavailable, it must be installed or a compatible Spark runtime must be configured before the analytics stage is advanced.
- The data file uses semicolon separators and `,` decimal separators, so validation logic must be careful to avoid confusing commas with delimiters.
- Time-series checks must handle 15-minute intervals and rare DST-related irregularities without falsely flagging valid rows.

## Staged implementation plan

1. Stage A: repository and environment audit — complete.
2. Stage B: dataset validation and quality checks — in progress; the validator and synthetic tests are implemented now.
3. Stage C: pipeline construction — design the raw → validation → HDFS → Hadoop MapReduce → Spark SQL → analytics → FastAPI → dashboard flow.
4. Stage D: analytics experiments — energy peaks, anomaly detection, behavioural profiling, and forecasting evaluation.
5. Stage E: reporting and demo packaging — reproducible summaries, screenshots, and viva-ready results.

## Current status

The project is ready for the next engineering step: validating the dataset in a streaming pipeline and then connecting the actual processing stages to the existing front-end design without disturbing the current UI.
