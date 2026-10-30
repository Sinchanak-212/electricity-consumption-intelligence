import json
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from validate_dataset import validate_dataset


class ValidateDatasetTests(unittest.TestCase):
    def _make_header(self, count=370):
        return [''] + [f"MT_{i:03d}" for i in range(1, count + 1)]

    def _make_row(self, timestamp, values):
        row = [timestamp] + [str(v) for v in values]
        return ";".join(row)

    def _write_fixture(self, content):
        tmp = tempfile.NamedTemporaryFile("w", encoding="utf-8", delete=False, newline="")
        tmp.write(content)
        tmp.close()
        return tmp.name

    def test_valid_dataset_passes(self):
        header = self._make_header()
        values = [0] * 370
        rows = [
            self._make_row("2011-01-01 00:15:00", values),
            self._make_row("2011-01-01 00:30:00", [0.5] + [1.25] + [0] * 368),
            self._make_row("2011-01-01 00:45:00", [0.75, 2, 3] + [0] * 367),
        ]
        dataset = ";".join(header) + "\n" + "\n".join(rows) + "\n"
        input_path = self._write_fixture(dataset)
        report_path = input_path + ".json"
        try:
            report = validate_dataset(input_path, report_path)
            self.assertEqual(report["status"], "pass")
            self.assertTrue(report["header_valid"])
            self.assertEqual(report["rows_scanned"], 3)
            self.assertEqual(report["valid_rows"], 3)
            self.assertEqual(report["malformed_rows"], 0)
            self.assertEqual(report["duplicate_timestamps"], 0)
            self.assertEqual(report["missing_interval_count"], 0)
            with open(report_path, "r", encoding="utf-8") as handle:
                saved = json.load(handle)
            self.assertEqual(saved["status"], "pass")
        finally:
            Path(input_path).unlink(missing_ok=True)
            Path(report_path).unlink(missing_ok=True)

    def test_malformed_rows_and_duplicates_are_detected(self):
        header = self._make_header()
        valid_values = [1] * 370
        rows = [
            self._make_row("2011-01-01 00:15:00", valid_values),
            self._make_row("2011-01-01 00:15:00", valid_values),
            self._make_row("2011-01-01 00:45:00", [7] + [0] * 368),
            self._make_row("not-a-date", valid_values),
        ]
        dataset = ";".join(header) + "\n" + "\n".join(rows) + "\n"
        input_path = self._write_fixture(dataset)
        report_path = input_path + ".json"
        try:
            report = validate_dataset(input_path, report_path)
            self.assertEqual(report["duplicate_timestamps"], 1)
            self.assertEqual(report["invalid_timestamps"], 1)
            self.assertEqual(report["malformed_rows"], 1)
            self.assertGreaterEqual(report["rows_scanned"], 4)
        finally:
            Path(input_path).unlink(missing_ok=True)
            Path(report_path).unlink(missing_ok=True)

    def test_decimal_commas_and_missing_or_invalid_values_are_counted(self):
        header = self._make_header()
        row = ["2011-01-01 01:00:00"]
        row.extend(["0,25", "", "foo"])
        row.extend(["0"] * (370 - 3))
        dataset = ";".join(header) + "\n" + ";".join(row) + "\n"
        input_path = self._write_fixture(dataset)
        report_path = input_path + ".json"
        try:
            report = validate_dataset(input_path, report_path)
            self.assertEqual(report["missing_values"], 1)
            self.assertEqual(report["non_numeric_values"], 1)
            self.assertEqual(report["zero_values"], 367)
            self.assertEqual(report["valid_rows"], 1)
        finally:
            Path(input_path).unlink(missing_ok=True)
            Path(report_path).unlink(missing_ok=True)


if __name__ == "__main__":
    unittest.main()
