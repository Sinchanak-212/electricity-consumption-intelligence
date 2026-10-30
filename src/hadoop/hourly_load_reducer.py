#!/usr/bin/env python3
"""Aggregate mapper output by date and hour."""

from __future__ import annotations

import sys
from decimal import Decimal


def reduce_lines(lines: list[str]) -> list[str]:
    aggregates: dict[tuple[str, str], dict[str, Decimal | int]] = {}
    for line in lines:
        line = line.strip()
        if not line:
            continue
        parts = line.split("\t")
        if len(parts) != 4:
            continue
        date_key, hour_key, total_text, peak_text = parts
        total = Decimal(total_text)
        peak = Decimal(peak_text)
        key = (date_key, hour_key)
        bucket = aggregates.setdefault(key, {"total": Decimal("0"), "peak": Decimal("0"), "count": 0})
        bucket["total"] = Decimal(bucket["total"]) + total
        bucket["peak"] = max(Decimal(bucket["peak"]), peak)
        bucket["count"] = int(bucket["count"]) + 1

    rows = []
    for (date_key, hour_key), values in sorted(aggregates.items()):
        total = values["total"]
        peak = values["peak"]
        count = values["count"]
        rows.append(f"{date_key}\t{hour_key}\t{total}\t{peak}\t{count}")
    return rows


def main() -> int:
    lines = []
    for line in sys.stdin:
        lines.append(line)
    for row in reduce_lines(lines):
        sys.stdout.write(f"{row}\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
