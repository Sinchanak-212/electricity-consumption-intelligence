from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

ROOT = Path(__file__).resolve().parents[2]
REPORT_PATH = ROOT / "reports" / "dataset_validation_report.json"
HADOOP_PATH = ROOT / "reports" / "hadoop_hourly_summary.json"

app = FastAPI(title="Electricity Consumption Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def load_json_file(path: Path) -> dict[str, Any]:
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Analytics file not found: {path.name}")
    try:
        with path.open("r", encoding="utf-8") as handle:
            return json.load(handle)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=500, detail=f"Invalid JSON in {path.name}: {exc}") from exc


@app.get("/api/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "dataset_valid": REPORT_PATH.exists(),
        "hadoop_summary_ready": HADOOP_PATH.exists(),
    }


@app.get("/api/overview")
def overview() -> dict[str, Any]:
    validation = load_json_file(REPORT_PATH)
    summary = {
        "status": validation.get("status", "unknown"),
        "rows_scanned": validation.get("rows_scanned", 0),
        "time_range": validation.get("timestamp_range", {}),
        "zero_values": validation.get("zero_values", 0),
        "unusually_large_values": validation.get("unusually_large_values", 0),
        "data_quality": "ready" if validation.get("status") == "pass" else "unverified",
    }
    return summary


@app.get("/api/peaks")
def peaks(limit: int = Query(10, ge=1, le=100)) -> dict[str, Any]:
    if not HADOOP_PATH.exists():
        return {
            "status": "not_ready",
            "message": "Hadoop summary output is not available yet.",
            "items": [],
        }
    payload = load_json_file(HADOOP_PATH)
    items = payload.get("items", [])[:limit]
    return {"status": "ok", "count": len(items), "items": items}


@app.get("/api/consumption-behaviour")
def consumption_behaviour() -> dict[str, Any]:
    return {
        "status": "demo_only",
        "message": "Consumption behaviour profiling is not yet generated from the full pipeline.",
        "items": [],
    }


@app.get("/api/anomalies")
def anomalies() -> dict[str, Any]:
    return {
        "status": "demo_only",
        "message": "Anomaly detection is not yet generated from the full pipeline.",
        "items": [],
    }


@app.get("/api/forecast")
def forecast() -> dict[str, Any]:
    return {
        "status": "demo_only",
        "message": "Forecast metrics are not yet generated from the full pipeline.",
        "series": [],
    }


@app.get("/api/data-processing")
def data_processing() -> dict[str, Any]:
    validation = load_json_file(REPORT_PATH)
    return {
        "status": validation.get("status", "unknown"),
        "pipeline": [
            "raw dataset validation",
            "HDFS ingestion",
            "Hadoop aggregation",
            "Spark analytics",
            "FastAPI exposure",
        ],
    }


@app.get("/api/clients/{client_id}")
def client_profile(client_id: str) -> dict[str, Any]:
    return {
        "client_id": client_id,
        "status": "not_ready",
        "message": "Per-client analytics are not yet generated.",
    }
