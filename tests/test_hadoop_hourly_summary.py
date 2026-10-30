import sys
import unittest
from decimal import Decimal
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src" / "hadoop"))

import hourly_load_mapper
import hourly_load_reducer


class HadoopHourlySummaryTests(unittest.TestCase):
    def test_parse_numeric_handles_decimal_comma(self):
        self.assertEqual(hourly_load_mapper.parse_numeric("1,5"), Decimal("1.5"))
        self.assertEqual(hourly_load_mapper.parse_numeric(""), None)

    def test_map_line_creates_hourly_key(self):
        line = '"2011-01-01 01:15:00";0,5;1;2,5;0'
        mapped = hourly_load_mapper.map_line(line)
        self.assertEqual(len(mapped), 1)
        self.assertEqual(mapped[0], "2011-01-01\t01\t4.0\t2.5")

    def test_reducer_aggregates_totals_and_peaks(self):
        rows = [
            "2011-01-01\t01\t4.0\t2.5",
            "2011-01-01\t01\t3.0\t1.5",
            "2011-01-01\t02\t6.0\t5.0",
        ]
        result = hourly_load_reducer.reduce_lines(rows)
        self.assertEqual(result[0], "2011-01-01\t01\t7.0\t2.5\t2")
        self.assertEqual(result[1], "2011-01-01\t02\t6.0\t5.0\t1")


if __name__ == "__main__":
    unittest.main()
