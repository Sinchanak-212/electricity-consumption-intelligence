#!/usr/bin/env python3
"""Stream validation for the UCI electricity load diagram dataset.

The file is a semicolon-delimited time series with a leading empty field
followed by 370 smart-meter columns named MT_001..MT_370. The script validates
schema, timestamps, dimensionality, and basic numerical quality without loading
the full dataset into memory.
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from datetime import datetime
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any, Iterable

EXPECTED_CLIENT_COLUMNS = 370
EXPECTED_FIELD_COUNT = EXPECTED_CLIENT_COLUMNS + 1
EXPECTED_HEADER_NAMES = [f"MT_{index:03d}" for index in range(1, EXPECTED_CLIENT_COLUMNS + 1)]
TIMESTAMP_FORMAT = "%Y-%m-%d %H:%M:%S"
DEFAULT_PROGRESS_INTERVAL = 100000
UNUSUALLY_LARGE_THRESHOLD = Decimal("10000")


def normalize_field(raw_value: Any) -> str:
    value = str(raw_value).strip()
    value = value.replace("\ufeff", "")
    if value.startswith('"') and value.endswith('"'):
        value = value[1:-1]
    return value.strip()


def normalize_numeric(raw_value: Any) -> str | None:
    value = normalize_field(raw_value)
    if not value or value.lower() in {"na", "n/a", "null", "nan"}:
        return None
    if value.startswith("(") and value.endswith(")"):
        value = "-" + value[1:-1]
    if "," in value and "." in value:
        value = value.replace(".", "").replace(",", ".")
    elif "," in value:
        value = value.replace(",", ".")
    return value


def parse_decimal(value: Any) -> Decimal | None:
    cleaned = normalize_numeric(value)
    if cleaned is None:
        return None
    try:
        return Decimal(cleaned)
    except InvalidOperation:
        return None


def header_is_valid(header: list[str]) -> bool:
    if len(header) != EXPECTED_FIELD_COUNT:
        return False
    if normalize_field(header[0]) != "":
        return False
    names = [normalize_field(name) for name in header[1:]]
    return names == EXPECTED_HEADER_NAMES


def summarize_interval_delta(previous: datetime, current: datetime) -> tuple[float, int]:
    delta_seconds = (current - previous).total_seconds()
    delta_minutes = delta_seconds / 60.0
    missing_intervals = 0
    if delta_minutes > 15:
        missing_intervals = int(round(delta_minutes / 15.0)) - 1
    return delta_minutes, missing_intervals


def validate_dataset(input_path: str | Path, output_path: str | Path | None = None, progress_every: int = DEFAULT_PROGRESS_INTERVAL) -> dict[str, Any]:
    src = Path(input_path)
    if not src.exists() or not src.is_file():
        raise FileNotFoundError(f"Input dataset does not exist or is not readable: {src}")

    output = Path(output_path) if output_path else src.with_name(f"{src.stem}_validation_report.json")
    output.parent.mkdir(parents=True, exist_ok=True)

    report: dict[str, Any] = {
        "status": "fail",
        "input_path": str(src),
        "output_path": str(output),
        "expected_client_columns": EXPECTED_CLIENT_COLUMNS,
        "expected_field_count": EXPECTED_FIELD_COUNT,
        "header_valid": False,
        "header_columns": 0,
        "rows_scanned": 0,
        "valid_rows": 0,
        "malformed_rows": 0,
        "missing_values": 0,
        "blank_values": 0,
        "non_numeric_values": 0,
        "negative_values": 0,
        "zero_values": 0,
        "unusually_large_values": 0,
        "invalid_timestamps": 0,
        "duplicate_timestamps": 0,
        "missing_interval_count": 0,
        "irregular_intervals": [],
        "timestamp_range": {
            "start": None,
            "end": None,
        },
        "critical_failures": [],
    }

    previous_timestamp: datetime | None = None
    seen_timestamps: set[str] = set()
    start_timestamp: str | None = None
    end_timestamp: str | None = None

    try:
        with src.open("r", encoding="utf-8", newline="") as handle:
            reader = csv.reader(handle, delimiter=';')
            try:
                header = next(reader)
            except StopIteration as exc:
                raise ValueError("Input file is empty.") from exc

            normalized_header = [normalize_field(value) for value in header]
            report["header_columns"] = len(normalized_header)
            report["header_valid"] = header_is_valid(normalized_header)
            if not report["header_valid"]:
                report["critical_failures"].append("Header does not match the expected 370-client schema.")
                report["status"] = "fail"
                with output.open("w", encoding="utf-8") as handle:
                    json.dump(report, handle, indent=2)
                return report

            for row_number, row in enumerate(reader, start=2):
                report["rows_scanned"] += 1
                if progress_every and report["rows_scanned"] % progress_every == 0:
                    print(f"Processed {report['rows_scanned']} rows ...", file=sys.stderr)

                if not row or len(row) != EXPECTED_FIELD_COUNT:
                    report["malformed_rows"] += 1
                    report["critical_failures"].append(f"Malformed record on line {row_number}: expected {EXPECTED_FIELD_COUNT} fields but found {len(row) if row else 0}.")
                    continue

                raw_timestamp = row[0]
                timestamp_text = normalize_field(raw_timestamp)
                try:
                    current_timestamp = datetime.strptime(timestamp_text, TIMESTAMP_FORMAT)
                except ValueError:
                    report["invalid_timestamps"] += 1
                    continue

                if timestamp_text in seen_timestamps:
                    report["duplicate_timestamps"] += 1
                    continue
                seen_timestamps.add(timestamp_text)

                if previous_timestamp is not None:
                    delta_minutes, missing_intervals = summarize_interval_delta(previous_timestamp, current_timestamp)
                    if delta_minutes <= 0:
                        report["duplicate_timestamps"] += 1
                        continue
                    if abs(delta_minutes - 15.0) > 1e-6:
                        report["irregular_intervals"].append({
                            "from": previous_timestamp.strftime(TIMESTAMP_FORMAT),
                            "to": current_timestamp.strftime(TIMESTAMP_FORMAT),
                            "delta_minutes": round(delta_minutes, 3),
                        })
                        report["missing_interval_count"] += missing_intervals
               
                if previous_timestamp is None:
                    start_timestamp = current_timestamp.strftime(TIMESTAMP_FORMAT)
                end_timestamp = current_timestamp.strftime(TIMESTAMP_FORMAT)
                previous_timestamp = current_timestamp

                report["valid_rows"] += 1

                for value in row[1:]:
                    if normalize_numeric(value) is None:
                        report["blank_values"] += 1
                        report["missing_values"] += 1
                        continue

                    numeric_value = parse_decimal(value)
                    if numeric_value is None:
                        report["non_numeric_values"] += 1
                        continue

                    if numeric_value < 0:
                        report["negative_values"] += 1
                    if numeric_value == 0:
                        report["zero_values"] += 1
                    if numeric_value > UNUSUALLY_LARGE_THRESHOLD:
                        report["unusually_large_values"] += 1

            if report["rows_scanned"] == 0:
                report["critical_failures"].append("No data rows found in the input file.")
                report["status"] = "fail"
                report["timestamp_range"]["start"] = start_timestamp
                report["timestamp_range"]["end"] = end_timestamp
                with output.open("w", encoding="utf-8") as handle:
                    json.dump(report, handle, indent=2)
                return report

            if report["valid_rows"] == 0:
                report["critical_failures"].append("No valid rows were parsed from the input file.")
                report["status"] = "fail"
                report["timestamp_range"]["start"] = start_timestamp
                report["timestamp_range"]["end"] = end_timestamp
                with output.open("w", encoding="utf-8") as handle:
                    json.dump(report, handle, indent=2)
                return report

    except FileNotFoundError:
        raise
    except ValueError:
        report["status"] = "fail"
        report["timestamp_range"]["start"] = start_timestamp
        report["timestamp_range"]["end"] = end_timestamp
        with output.open("w", encoding="utf-8") as handle:
            json.dump(report, handle, indent=2)
        return report

    report["status"] = "pass"
    if report["malformed_rows"] > 0 or report["invalid_timestamps"] > 0 or report["duplicate_timestamps"] > 0:
        report["status"] = "fail"
    if report["missing_interval_count"] > 0 or report["irregular_intervals"]:
        report["status"] = "warning"

    report["timestamp_range"]["start"] = start_timestamp
    report["timestamp_range"]["end"] = end_timestamp

    with output.open("w", encoding="utf-8") as handle:
        json.dump(report, handle, indent=2)

    return report


def build_summary(report: dict[str, Any]) -> str:
    lines = [
        "Dataset validation summary",
        "=" * 26,
        f"Status: {report['status']}",
        f"File: {report['input_path']}",
        f"Rows scanned: {report['rows_scanned']}",
        f"Valid rows: {report['valid_rows']}",
        f"Malformed rows: {report['malformed_rows']}",
        f"Invalid timestamps: {report['invalid_timestamps']}",
        f"Duplicate timestamps: {report['duplicate_timestamps']}",
        f"Missing intervals: {report['missing_interval_count']}",
        f"Missing/blank values: {report['missing_values']}",
        f"Non-numeric values: {report['non_numeric_values']}",
        f"Negative values: {report['negative_values']}",
        f"Zero values: {report['zero_values']}",
        f"Unusually large values: {report['unusually_large_values']}",
        f"Time range: {report['timestamp_range']['start']} to {report['timestamp_range']['end']}",
    ]
    if report["critical_failures"]:
        lines.append("Critical failures:")
        for failure in report["critical_failures"]:
            lines.append(f"- {failure}")
    return "\n".join(lines)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate the electricity consumption dataset streamingly.")
    parser.add_argument("--input", required=True, dest="input_path", help="Path to the raw dataset file.")
    parser.add_argument("--output", required=True, dest="output_path", help="JSON output path for the validation report.")
    parser.add_argument("--progress-every", type=int, default=DEFAULT_PROGRESS_INTERVAL, help="Progress log interval in rows.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        report = validate_dataset(args.input_path, args.output_path, progress_every=args.progress_every)
        print(build_summary(report))
        return 0 if report["status"] == "pass" else 1
    except (FileNotFoundError, ValueError) as exc:
        print(f"Validation failed: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
