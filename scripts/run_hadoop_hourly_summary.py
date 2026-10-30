#!/usr/bin/env python3
"""Run the Hadoop streaming aggregation job for hourly load totals and peaks."""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path


def resolve_hadoop_home() -> Path:
    candidates = [
        os.environ.get("HADOOP_HOME"),
        "/home/sinchu/bigdata/hadoop-3.5.0",
    ]
    for candidate in candidates:
        if candidate:
            path = Path(candidate)
            if path.exists():
                return path
    raise FileNotFoundError("Hadoop installation not found. Set HADOOP_HOME or use the default WSL path.")


def run_hdfs_command(args: list[str], check: bool = True) -> subprocess.CompletedProcess[str]:
    hadoop_home = resolve_hadoop_home()
    command = [str(hadoop_home / "bin" / "hdfs"), *args]
    result = subprocess.run(command, text=True, capture_output=True)
    if check and result.returncode != 0:
        raise RuntimeError(f"HDFS command failed: {' '.join(command)}\n{result.stderr}")
    return result


def run_hadoop_streaming(input_path: str, output_path: str, mapper_script: Path, reducer_script: Path) -> int:
    hadoop_home = resolve_hadoop_home()
    stream_jar = hadoop_home / "share" / "hadoop" / "tools" / "lib" / "hadoop-streaming-3.5.0.jar"
    if not stream_jar.exists():
        raise FileNotFoundError(f"Hadoop streaming jar not found: {stream_jar}")

    output_exists = run_hdfs_command(["dfs", "-test", "-e", output_path], check=False).returncode == 0
    if output_exists:
        run_hdfs_command(["dfs", "-rm", "-r", "-f", output_path])

    command = [
        str(hadoop_home / "bin" / "hadoop"),
        "jar",
        str(stream_jar),
        "-D",
        "mapreduce.job.reduces=1",
        "-files",
        f"{mapper_script},{reducer_script}",
        "-input",
        input_path,
        "-output",
        output_path,
        "-mapper",
        f"python3 {mapper_script.name}",
        "-reducer",
        f"python3 {reducer_script.name}",
    ]

    result = subprocess.run(command, text=True, capture_output=True)
    if result.returncode != 0:
        sys.stderr.write(result.stderr)
        return result.returncode

    print(result.stdout.strip())
    listing = run_hdfs_command(["dfs", "-ls", output_path])
    print(listing.stdout.strip())
    return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the Hadoop streaming summary job for the electricity data.")
    parser.add_argument("--input", default="/user/sinchu/electricity/raw/LD2011_2014.txt", help="Input file in HDFS.")
    parser.add_argument("--output", default="/user/sinchu/electricity/processed/hourly_summary", help="HDFS output folder for the aggregated results.")
    parser.add_argument("--mapper", default=str(Path(__file__).resolve().parents[1] / "src" / "hadoop" / "hourly_load_mapper.py"), help="Path to the mapper script.")
    parser.add_argument("--reducer", default=str(Path(__file__).resolve().parents[1] / "src" / "hadoop" / "hourly_load_reducer.py"), help="Path to the reducer script.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    mapper_script = Path(args.mapper).resolve()
    reducer_script = Path(args.reducer).resolve()

    if not mapper_script.exists() or not reducer_script.exists():
        raise FileNotFoundError("Mapper or reducer script missing. Check the provided file paths.")

    return run_hadoop_streaming(args.input, args.output, mapper_script, reducer_script)


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (FileNotFoundError, RuntimeError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
