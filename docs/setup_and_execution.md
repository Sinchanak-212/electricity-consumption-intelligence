# Setup and execution

## Prerequisites

- Windows 11 with WSL2 enabled
- Ubuntu 24.04 environment
- OpenJDK 17
- Hadoop 3.5.0 installed at `/home/sinchu/bigdata/hadoop-3.5.0`
- Python 3.10+ with PySpark installed if Spark jobs are used
- Node.js and npm for the frontend build

## Validate the dataset

```bash
python3 /mnt/c/Users/User/electricity-intelligence/scripts/validate_dataset.py \
  --input /mnt/c/Users/User/electricity-intelligence/data/raw/LD2011_2014.txt \
  --output /mnt/c/Users/User/electricity-intelligence/reports/dataset_validation_report.json
```

## Run the Hadoop hourly summary

```bash
python3 /mnt/c/Users/User/electricity-intelligence/scripts/run_hadoop_hourly_summary.py \
  --input /user/sinchu/electricity/raw/LD2011_2014.txt \
  --output /user/sinchu/electricity/processed/hourly_summary
```

## Inspect output

```bash
/home/sinchu/bigdata/hadoop-3.5.0/bin/hdfs dfs -ls -h /user/sinchu/electricity/processed/hourly_summary
/home/sinchu/bigdata/hadoop-3.5.0/bin/hdfs dfs -cat /user/sinchu/electricity/processed/hourly_summary/part-00000 | head
```

## Frontend build

```bash
cd /mnt/c/Users/User/electricity-intelligence/frontend
npm install
npm run build
```
