import importlib.util
import unittest


@unittest.skipUnless(importlib.util.find_spec("pyspark") is not None, "PySpark is not installed in this environment")
class SparkHourlyPeakTests(unittest.TestCase):
    def test_spark_session_can_start(self):
        from src.spark.hourly_peak_analysis import build_spark_session

        spark = build_spark_session("test-electricity-analytics")
        self.assertIsNotNone(spark)
        spark.stop()


if __name__ == "__main__":
    unittest.main()
