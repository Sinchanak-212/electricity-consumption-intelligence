#!/usr/bin/env python3
"""Map rows from the raw electricity series into date/hour aggregates."""

from __future__ import annotations

import csv
import sys
from datetime import datetime
from decimal import Decimal, InvalidOperation


def parse_numeric(raw_value: str | None) -> Decimal | None:
    if raw_value is None:
        return None
    text = str(raw_value).strip().replace("\ufeff", "").replace('"', '')
    if not text or text.lower() in {"na", "n/a", "null", "nan"}:
        return None
    if text.startswith("(") and text.endswith(")"):
        text = "-" + text[1:-1]
    if "," in text and "." in text:
        text = text.replace(".", "").replace(",", ".")
    elif "," in text:
        text = text.replace(",", ".")
    try:
        return Decimal(text)
    except InvalidOperation:
        return None


def map_line(line: str) -> list[str]:
    if not line or not line.strip():
        return []
    try:
        row = next(csv.reader([line], delimiter=';'))
    except csv.Error:
        return []
    if len(row) < 2:
        return []

    timestamp_text = row[0].strip().strip('"')
    try:
        timestamp = datetime.strptime(timestamp_text, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        return []

    values = []
    for raw_value in row[1:]:
        value = parse_numeric(raw_value)
        if value is not None:
            values.append(value)

    if not values:
        return []

    total = sum(values, Decimal("0"))
    peak = max(values)
    date_key = timestamp.strftime("%Y-%m-%d")
    hour_key = timestamp.strftime("%H")
    return [f"{date_key}\t{hour_key}\t{total}\t{peak}"]


def main() -> int:
    for line in sys.stdin:
        for output in map_line(line):
            sys.stdout.write(f"{output}\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
