import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from fastapi.testclient import TestClient

from src.api.app import app


class ApiAppTests(unittest.TestCase):
    def test_health_endpoint(self):
        client = TestClient(app)
        response = client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["status"], "ok")
        self.assertIn("dataset_valid", payload)

    def test_overview_endpoint_uses_validation_report(self):
        client = TestClient(app)
        response = client.get("/api/overview")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["status"], "pass")
        self.assertGreater(payload["rows_scanned"], 0)

    def test_peaks_endpoint_reports_not_ready_if_summary_missing(self):
        client = TestClient(app)
        response = client.get("/api/peaks")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["status"], "not_ready")
        self.assertEqual(payload["items"], [])

    def test_clients_endpoint_returns_not_ready(self):
        client = TestClient(app)
        response = client.get("/api/clients/MT_001")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["status"], "not_ready")


if __name__ == "__main__":
    unittest.main()
