#!/usr/bin/env python3
"""Spark-based hourly demand and peak analysis for the electricity dataset.

This stage is intentionally simple and educational: it reads the validated raw CSV
file, converts each row into a timestamped observation, and computes hourly totals
and peak values. The resulting dataset can be reused by FastAPI endpoints and the
React dashboard.
"""

from __future__ import annotations

import argparse
from functools import reduce

try:
    from pyspark.sql import DataFrame, SparkSession
    from pyspark.sql import functions as F
except ImportError as exc:  # pragma: no cover - exercised only when Spark is absent.
    raise SystemExit("PySpark is required to run this analytics module. Install it in the WSL environment first.") from exc


def build_spark_session(app_name: str = "electricity-analytics") -> SparkSession:
    return SparkSession.builder.appName(app_name).getOrCreate()


def load_raw_dataset(spark: SparkSession, input_path: str) -> DataFrame:
    df = spark.read.option("sep", ";").option("header", "false").csv(input_path)
    header = df.first()
    if header is None:
        raise ValueError(f"Dataset is empty: {input_path}")

    columns = [f"_c{index}" for index in range(len(header))]
    df = df.toDF(*columns)
    first_row = [value for value in header]
    if first_row and str(first_row[0]).strip() == '""':
        df = df.filter(F.col("_c0") != first_row[0])
    return df


def compute_hourly_summary(df: DataFrame) -> DataFrame:
    metric_columns = [column for column in df.columns if column.startswith("_c") and column != "_c0"]
    if not metric_columns:
        raise ValueError("No client columns were found in the dataset.")

    timestamp_col = F.to_timestamp(F.col("_c0"), "yyyy-MM-dd HH:mm:ss")
    value_columns = [F.col(column).cast("double") for column in metric_columns]
    total_load_expr = reduce(lambda left, right: left + right, value_columns)

    df_transformed = (
        df.withColumn("timestamp", timestamp_col)
        .withColumn("hour_bucket", F.date_format(F.col("timestamp"), "yyyy-MM-dd HH:00:00"))
        .withColumn("total_load", total_load_expr)
        .withColumn("peak_load", F.greatest(*[F.col(column) for column in metric_columns]))
    )

    return (
        df_transformed.groupBy("hour_bucket")
        .agg(
            F.sum("total_load").alias("total_load"),
            F.max("peak_load").alias("peak_load"),
            F.count("timestamp").alias("sample_count"),
        )
        .orderBy("hour_bucket")
    )


def write_summary(output_path: str, summary_df: DataFrame) -> None:
    summary_df.write.mode("overwrite").option("header", "true").csv(output_path)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Compute hourly total and peak electricity load with Spark.")
    parser.add_argument("--input", required=True, help="Input dataset path. Accepts CSV/semicolon-delimited data.")
    parser.add_argument("--output", required=True, help="Output directory for the hourly summary dataset.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    spark = build_spark_session()
    raw_df = load_raw_dataset(spark, args.input)
    summary_df = compute_hourly_summary(raw_df)
    write_summary(args.output, summary_df)
    summary_df.show(10, truncate=False)
    spark.stop()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
